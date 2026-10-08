# FEG recorded opponent dialogue — v0.37.5

Generated on 2026-10-08 JST with the existing pinned Kokoro-82M v1.0
environment. These **14 new clips** read the two `spoken` lines for each of
the seven opponents directly from `content/stages.js`. Their exact strings
are additional `kind: "call"` entries in `content/voice-clips.js`.

The voice and processing match the existing male calls: `am_fenrir`, speed
**0.80**, English G2P applied to romanized Japanese, 24,000 Hz mono MP3 at
64 kbit/s. Normalization targets RMS 0.12 with a peak ceiling of 0.70;
quiet edges retain 35 ms before and 70 ms after speech, with 4 ms fades.
The English pronunciation of romanized Japanese is intentional, as in the
Kyoto Station introduction and `Shobu ari!`.

The **88 existing clips and their manifest metadata are unchanged**.
The manifest now contains 102 clips; the new files total 273,640 bytes.
This addition supplies the recorded voice option without changing the
default voice mode.

## Evidence and limits

All 14 MP3s were decoded and checked against manifest duration, size and
SHA-256. They have no clipped samples and these measured ranges:

| Measurement | Range |
| --- | --- |
| Decoded duration | 1.237500–3.274083 s |
| Leading silence | 31.9–35.2 ms |
| Trailing silence | 64.8–71.6 ms |
| Peak | −3.647 to −3.466 dBFS |
| RMS | −22.307 to −19.170 dBFS |

Longer lines can reach the peak ceiling before the RMS target. Both stages
of PCM normalization and the MP3 decode checks use the existing method.
The compact `generation-report.json` records source and model hashes,
synthesis inputs, and decoded measurements. Raw timing diagnostics and
a combined listening preview stay outside the published repository in
`../work/match-polish-v0375-voices`.

An isolated repeat of the dialogue generation mode reused all 14 new
clips and preserved all 102 MP3 bytes and modification times. These are
artifact checks; iPad speaker playback and subjective pronunciation
acceptance remain unverified.

## Reproduce

Use the environment, pinned model hashes, sources and licenses described
in [the v0.32 generation notes](../voice-v032/README.md). From the repository
root:

```sh
PYTHONDONTWRITEBYTECODE=1 ../work/voice-build/.venv/bin/python scripts/generate-voices-v032.py --dialogue-v0375 --preview
```

The dialogue mode validates the existing 88 files, synthesizes only new
or changed dialogue strings, and reuses matching dialogue recordings.
It updates the manifest after every dialogue clip passes decoding and
boundary-silence checks. It does not regenerate the Kyoto Station calls,
`Shobu ari!`, teaching words, title or ending. A repeat reports generated
and reused counts separately. The optional combined preview and cue sheet
are written to `../work/voice-build`.

The attribution and Apache-2.0/MIT notices in `audio/voice-v032` also apply
to these synthesized files. No model, inference runtime or Apple voice
recording is distributed here.
