# FEG fixed voices — v0.32

Generated on 2026-10-04 from **Kokoro-82M v1.0**, using its preset synthetic
voices. The game loads these MP3 files through its existing Web Audio context.
No Apple System Voices, recordings of `say`, cloud TTS, API keys, model weights,
or runtime binaries are included in this directory.

## Content and generation settings

- The 84 deck rows contain **81 unique words**; `rice`, `leaf`, and `lip` repeat.
  The exact-string manifest in `content/voice-clips.js` covers every deck row.
- 81 words: American English female `af_heart`, speed **0.90**.
- Title: `af_heart`, speed **0.88**, spoken as “Fifteenth ever garden.”
- Five calls: American English male `am_fenrir`, speed **0.80**. The two
  romanized Japanese sentences, `Time!`, `Hajime!`, and `Shobu ari!` all use
  this same voice. English G2P intentionally gives the romanized Japanese
  an awkward foreign pronunciation.
- Ending `ひゃーん`: `af_heart`, speed **0.72**, explicit playful English
  phonemes `hjˈɑːːn!`. This is a character cry, not Japanese instruction.
- Total: **88 clips**. MP3, 24,000 Hz, mono, 64 kbit/s.

The generator records both automatic G2P and actual synthesis phonemes in
`generation-report.json`. It compares every word against the existing broad
General American IPA in `content/decks.js` and checks every target sound.
Only stress placement, length marks, `r`/`ɹ`, `g`/`ɡ`, and rhotic schwa notation
are normalized for comparison. Explicit phoneme overrides align `dawn`,
`decision`, `television`, and `usual` with the source IPA.

Quiet edges are conservatively trimmed, preserving 35 ms before and 70 ms
after speech. PCM uses an RMS target of 0.12, a peak ceiling of 0.70, and 4 ms
edge fades before MP3 encoding. The encoded files are decoded again to check
duration, finite samples, amplitude, clipping, and leading/trailing silence.
The manifest contains decoded durations, byte counts, and SHA-256 hashes.
These checks do not replace a listening review or iPhone/iPad acceptance.

## Attribution and licenses

Sources checked on 2026-10-04:

- **Kokoro-82M v1.0 model and voice presets — hexgrad, Apache-2.0.** The
  [primary model card](https://huggingface.co/hexgrad/Kokoro-82M) identifies
  Apache-licensed weights. [Voice catalog](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md).
  The license text is included as `LICENSE-Kokoro-Apache-2.0.txt`.
- **ONNX export and kokoro-onnx — thewh1teagle.** The
  [official release](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1)
  supplies `kokoro-v1.0.fp16.onnx` and `voices-v1.0.bin`. The Python
  [runtime is MIT](https://github.com/thewh1teagle/kokoro-onnx/blob/main/LICENSE),
  copyright (c) 2025 github.com/thewh1teagle; its full notice is included as
  `LICENSE-kokoro-onnx-MIT.txt`.
- Build-time inference uses [ONNX Runtime, MIT](https://github.com/microsoft/onnxruntime/blob/main/LICENSE).
  English G2P uses [phonemizer, GPL-3.0](https://github.com/bootphon/phonemizer/blob/master/LICENSE)
  and [eSpeak NG, GPL-3.0](https://github.com/espeak-ng/espeak-ng/blob/master/COPYING),
  through `espeakng-loader`; neither is distributed with this game.
- The Kokoro model card acknowledges training audio from
  [Koniwa `tnc`](https://github.com/koniwa/koniwa), CC BY 3.0, and
  [SIWIS](https://datashare.ed.ac.uk/handle/10283/2353), CC BY 4.0.
  This credit preserves that upstream attribution; these clips were newly
  synthesized from the game text rather than copied from those datasets.

## Reproduce

Run from the repository root with Python 3.13, Node.js, and FFmpeg installed.
The temporary environment and model total about 340 MB and stay outside the
published repository in `../work/voice-build`.

```sh
python3.13 -m venv ../work/voice-build/.venv
../work/voice-build/.venv/bin/python -m pip install --no-cache-dir kokoro-onnx==0.6.1 numpy==2.5.3 onnxruntime==1.30.0 phonemizer==3.4.0 espeakng-loader==0.2.4
curl -fL https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.fp16.onnx -o ../work/voice-build/kokoro-v1.0.fp16.onnx
curl -fL https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/voices-v1.0.bin -o ../work/voice-build/voices-v1.0.bin
../work/voice-build/.venv/bin/python scripts/generate-voices-v032.py --preview
```

The script verifies both model hashes before inference. Exact package
versions, model hashes, source-deck hash, phonemes, and measured PCM results
are recorded in `generation-report.json`. Inference uses the CPU provider
with two intra-op threads and one inter-op thread. Different runtime versions
or hardware can produce different file hashes; the distributed files and
their checked-in manifest identify this build.

`--preview` additionally writes `voice-v032-listening.mp3` and a timestamped
`voice-v032-listening-cues.tsv` into the build directory. The preview plays all
88 clips in manifest order with 0.4 seconds between clips. It is not published
or loaded by the game. The older macOS `say` generator has been removed.
