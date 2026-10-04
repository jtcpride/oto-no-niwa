# FEG fixed voices — v0.33

Generated on 2026-10-04 with the existing Kokoro-82M v1.0 environment.

- 81 unique teaching words: American English female `af_kore`, speed **1.00**.
- Title: the same `af_kore`, speed **0.95**.
- Five male calls and the playful ending retain their exact v0.32 bytes.
- Actual phoneme strings and the four existing General American corrections
  are unchanged. No context words, extra nasal phonemes, punctuation, pitch
  conversion, or phrase splicing are added.
- Quiet-edge guards: **15 ms** before the first threshold crossing and 70 ms
  after the last. Normalization remains RMS 0.12 / peak ceiling 0.70 with 4 ms
  boundary fades. The 15 ms guard shortens silence only; the generator does
  not cut at estimated phoneme boundaries or remove a real /m/, /ʃ/, or /θ/.
- Format remains 24,000 Hz mono MP3 at 64 kbit/s, played in the game's shared
  Web Audio context. `content/voice-clips.js` identifies all 88 current clips
  by exact text, decoded duration, size, and SHA-256.

The [comparison page](../../docs/evidence/voice-v033/index.html) plays the
v0.32 clips, these clips, and the older live device voice separately. It
contains no Apple voice recordings. The old v0.32 assets are retained so
that this comparison and a code rollback do not require regeneration.

## Evidence and limits

The investigation compared `af_heart`, `af_sarah`, `af_kore`, and `af_alloy`
at 0.90 and 1.00, then checked sentence punctuation, isolated stress, and
repeated-word context for `she` and `mother`. `af_kore` at 1.00 shortened
these utterances without adding context or cutting consonants. The
comparison is acoustic/phoneme evidence, **not a subjective listening pass**.
The model's exported phoneme timings are estimates and were not used as
cut points. iPhone/iPad speaker playback and perceived pronunciation still
need listening review.

## Reproduce

Use the exact environment, model hashes, sources, and licenses described in
[the v0.32 generation notes](../voice-v032/README.md). From the repository
root:

```sh
PYTHONDONTWRITEBYTECODE=1 ../work/voice-build/.venv/bin/python scripts/generate-voices-v032.py --neutral-v033 --preview
node tests/voice-assets-v033.cjs
```

This mode generates 82 new clips in this directory, retains the existing six
calls/ending entries, and updates the manifest only after every new clip
passes encoding and decoding checks. Running without `--neutral-v033`
recreates the earlier v0.32 settings. The optional combined listening MP3
and cue sheet stay in `../work/voice-build`. Inference can vary slightly
between runs; the report and manifest identify the checked-in build.

Attribution and the Apache-2.0/MIT notices in `audio/voice-v032` also apply
to these synthesized files. No model, inference runtime, or Apple voice
recording is distributed here.
