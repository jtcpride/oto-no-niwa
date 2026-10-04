#!/usr/bin/env python3
"""Generate fixed speech assets; see audio/voice-v032/README.md.

Run in the isolated Kokoro environment. Downloads are deliberately separate.
No operating-system voices, API keys, or network calls are used here.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import importlib.metadata
import json
import math
from pathlib import Path
import platform
import subprocess
import sys
import tempfile
import wave

import numpy as np
import onnxruntime as ort
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
MODEL = "kokoro-v1.0.fp16.onnx"
MODEL_SHA = "f3a290d384fbb27966d462905c71a46cef9e5fd00516b40df32a0b4afe77ac96"
VOICES = "voices-v1.0.bin"
VOICES_SHA = "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"
RATE = 24000
# Resolve dialect/reduced-vowel differences in default en-us G2P to the
# project's existing General American IPA. Stress stays in Kokoro's format.
WORD_PHONEMES = {
    "dawn": "dˈɑːn", "decision": "dɪsˈɪʒən",
    "television": "tˈɛləvˌɪʒən", "usual": "jˈuːʒuəl",
}
CALLS = ["Yoh, kaette kiharimashita na.",
         "Dorehodo oboete haru ka, misete moraimahyoka.",
         "Time!", "Hajime!", "Shobu ari!"]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalized_ipa(value):
    # Preserve vowel/consonant identities; normalize r/g, rhotic schwa,
    # stress placement and noncontrastive length for this broad-IPA audit.
    value = value.replace("ɚ", "əɹ").replace("r", "ɹ").replace("g", "ɡ")
    return value.translate(str.maketrans("", "", "/ˈˌː "))


def entries():
    code = ('global.window={}; require("./content/decks.js"); '
            'const words=window.FEGContent.decks.flatMap(d=>d.sounds.flatMap('
            's=>s.words.map(w=>({...w,target:s.symbol})))); '
            'console.log(JSON.stringify(words));')
    rows = json.loads(subprocess.check_output(["node", "-e", code], cwd=ROOT, text=True))
    unique = {}
    for row in rows:
        text = row["text"]
        if text not in unique:
            unique[text] = dict(text=text, spoken=text, voice="af_heart", speed=.9,
                                kind="word", ipa=row["ipa"], targets=[])
        assert unique[text]["ipa"] == row["ipa"]
        if row["target"] not in unique[text]["targets"]:
            unique[text]["targets"].append(row["target"])
    result = list(unique.values())
    result.append(dict(text="FIFTEENTH EVER GARDEN", spoken="Fifteenth ever garden.",
                       voice="af_heart", speed=.88, kind="title"))
    result.extend(dict(text=s, spoken=s, voice="am_fenrir", speed=.8, kind="call")
                  for s in CALLS)
    # Playful English phonetics, not a Japanese instructional word.
    result.append(dict(text="ひゃーん", spoken="Hyaaaan!", phonemes="hjˈɑːːn!",
                       voice="af_heart", speed=.72, kind="ending"))
    return rows, result


def finish_pcm(samples):
    samples = np.asarray(samples, dtype=np.float32)
    assert np.isfinite(samples).all(), "Nonfinite synthesized PCM"
    peak = float(np.max(np.abs(samples)))
    assert peak > .01, "Silent or nearly silent synthesis"
    original_length = len(samples)
    active = np.flatnonzero(np.abs(samples) > max(.0005, peak * .003))
    # Conservative guards retain quiet initial/final fricatives and releases.
    start = max(0, int(active[0]) - int(.035 * RATE))
    end = min(original_length, int(active[-1]) + int(.07 * RATE) + 1)
    samples = samples[start:end].copy()
    rms = float(np.sqrt(np.mean(samples * samples)))
    samples *= min(.12 / max(rms, 1e-6), .70 / float(np.max(np.abs(samples))))
    # Normalize before the final boundary pass so very low model tail noise
    # cannot extend a short word by hundreds of milliseconds.
    active = np.flatnonzero(np.abs(samples) > .002)
    final_start = max(0, int(active[0]) - int(.035 * RATE))
    final_end = min(len(samples), int(active[-1]) + int(.07 * RATE) + 1)
    end = start + final_end
    start += final_start
    samples = samples[final_start:final_end].copy()
    fade = min(int(.004 * RATE), len(samples) // 2)
    samples[:fade] *= np.linspace(0, 1, fade)
    samples[-fade:] *= np.linspace(1, 0, fade)
    return samples, dict(trimmedHeadSeconds=round(start/RATE, 5),
                         trimmedTailSeconds=round((original_length-end)/RATE, 5))


def write_wav(path, samples):
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        handle.writeframes(np.rint(np.clip(samples, -1, 1)*32767).astype("<i2").tobytes())


def encode(ffmpeg, raw, output):
    subprocess.run([ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
                    "-i", str(raw), "-map_metadata", "-1", "-ar", str(RATE), "-ac", "1",
                    "-codec:a", "libmp3lame", "-b:a", "64k", str(output)], check=True)


def inspect_audio(ffmpeg, path):
    raw = subprocess.check_output([ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error",
                                   "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(RATE), "-"])
    pcm = np.frombuffer(raw, dtype="<f4")
    assert len(pcm) and np.isfinite(pcm).all()
    peak = float(np.max(np.abs(pcm)))
    rms = float(np.sqrt(np.mean(pcm*pcm)))
    active = np.flatnonzero(np.abs(pcm) > .002)
    assert peak < .98 and rms > .015 and len(active), f"Bad PCM in {path}"
    head, tail = active[0]/RATE, (len(pcm)-1-active[-1])/RATE
    assert head < .25 and tail < .30, f"Excess silence in {path}: {head}, {tail}"
    return pcm, dict(decodedSeconds=round(len(pcm)/RATE, 6), peakDbfs=round(20*math.log10(peak), 3),
                     rmsDbfs=round(20*math.log10(rms), 3), clippedSamples=int(np.sum(np.abs(pcm)>=.999)),
                     leadingSilenceSeconds=round(float(head), 4), trailingSilenceSeconds=round(float(tail), 4))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--build-dir", type=Path, default=ROOT.parent/"work/voice-build")
    parser.add_argument("--ffmpeg", default="ffmpeg")
    parser.add_argument("--preview", action="store_true", help="Combined listening MP3 in build-dir")
    args = parser.parse_args()
    args.build_dir = args.build_dir.resolve()
    for name, expected in [(MODEL, MODEL_SHA), (VOICES, VOICES_SHA)]:
        assert sha(args.build_dir/name) == expected, f"Wrong model asset: {name}"
    assert importlib.metadata.version("kokoro-onnx") == "0.6.1"
    ort.set_default_logger_severity(3)
    ort.disable_telemetry_events()
    opts = ort.SessionOptions()
    opts.log_severity_level = 3
    opts.intra_op_num_threads = 2
    opts.inter_op_num_threads = 1
    session = ort.InferenceSession(str(args.build_dir/MODEL), opts, providers=["CPUExecutionProvider"])
    engine = Kokoro.from_session(session, str(args.build_dir/VOICES))
    rows, items = entries()
    output = ROOT/"audio/voice-v032"
    output.mkdir(parents=True, exist_ok=True)
    manifest, audit, combined, cue_sheet = {}, [], [], []
    elapsed = 0.0
    with tempfile.TemporaryDirectory(prefix="feg-voices-", dir=args.build_dir) as scratch:
        scratch = Path(scratch)
        for i, item in enumerate(items):
            auto_phonemes = engine.tokenizer.phonemize(item["spoken"], "en-us")
            phonemes = item.get("phonemes", WORD_PHONEMES.get(item["text"], auto_phonemes))
            if item["kind"] == "word":
                assert normalized_ipa(phonemes) == normalized_ipa(item["ipa"]), (item, phonemes)
                for target in item["targets"]:
                    assert normalized_ipa(target) in normalized_ipa(phonemes), (item, phonemes)
            assert engine.tokenizer.known(phonemes) == phonemes, (item, phonemes)
            samples, rate = engine.create(phonemes, voice=item["voice"], speed=item["speed"],
                                          is_phonemes=True, trim=False, sentence_pause=0, clause_pause=0)
            assert rate == RATE
            samples, trimming = finish_pcm(samples)
            wav, mp3 = scratch/"clip.wav", scratch/"clip.mp3"
            write_wav(wav, samples)
            encode(args.ffmpeg, wav, mp3)
            decoded, quality = inspect_audio(args.ffmpeg, mp3)
            digest = sha(mp3)
            filename = f"{i:03d}-{digest[:12]}.mp3"
            (scratch/filename).write_bytes(mp3.read_bytes())
            manifest[item["text"]] = dict(file=f"audio/voice-v032/{filename}",
                voice=f"Kokoro-82M-v1.0/{item['voice']}", kind=item["kind"],
                duration=quality["decodedSeconds"], bytes=mp3.stat().st_size, sha256=digest)
            audit.append(dict(**item, g2p=auto_phonemes, synthesizedPhonemes=phonemes, **trimming, **quality))
            cue_sheet.append(f"{elapsed:07.2f}\t{item['kind']}\t{item['text']}")
            combined.extend([decoded, np.zeros(int(.40*RATE), dtype=np.float32)])
            elapsed += len(decoded)/RATE+.4
            print(f"{i+1:02d}/{len(items)} {item['text']}: {quality['decodedSeconds']:.3f}s", flush=True)
        if args.preview:
            preview = args.build_dir/"voice-v032-listening.wav"
            write_wav(preview, np.concatenate(combined))
            encode(args.ffmpeg, preview, args.build_dir/"voice-v032-listening.mp3")
            preview.unlink()
            (args.build_dir/"voice-v032-listening-cues.tsv").write_text("\n".join(cue_sheet)+"\n")
        # Publish only after every clip passes; remove stale generated clips.
        for clip in output.glob("[0-9][0-9][0-9]-*.mp3"):
            clip.unlink()
        for clip in scratch.glob("[0-9][0-9][0-9]-*.mp3"):
            (output/clip.name).write_bytes(clip.read_bytes())
    (ROOT/"content/voice-clips.js").write_text(
        "// Generated by scripts/generate-voices-v032.py. See audio/voice-v032/README.md.\n"
        "window.FEGVoiceClips="+json.dumps(manifest, ensure_ascii=False, indent=2)+";\n")
    packages = {dist.metadata["Name"]: dist.version for dist in importlib.metadata.distributions()}
    report = dict(generator="scripts/generate-voices-v032.py", python=sys.version.split()[0],
        generatedAt=datetime.now(timezone.utc).isoformat(),
        ffmpeg=subprocess.check_output([args.ffmpeg, "-version"], text=True).splitlines()[0],
        platform=platform.platform(), packages=packages,
        model=dict(file=MODEL, sha256=MODEL_SHA), voices=dict(file=VOICES, sha256=VOICES_SHA),
        sourceDeckSha256=sha(ROOT/"content/decks.js"), deckRows=len(rows), uniqueWords=len(items)-7,
        clips=len(items), totalBytes=sum(v["bytes"] for v in manifest.values()),
        sampleRate=RATE, channels=1, codec="MP3 libmp3lame 64 kbit/s", details=audit)
    (output/"generation-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n")
    print(json.dumps({k:report[k] for k in ("deckRows","uniqueWords","clips","totalBytes")}), flush=True)


if __name__ == "__main__":
    main()
