# oto-no-niwa

発音記号蹴鞠「音の庭」の試作リポジトリです。

## iPad / Safari 試遊

https://jtcpride.github.io/oto-no-niwa/

## Current

- **v0.10「PRACTICE → TIME → 礼 → HAJIME!!! → MATCH」**
- 1ステージ4音: `/θ/` `/ð/` `/ʃ/` `/ʒ/`
- CPU側で英単語を読み上げ、狙った音の発音記号を選んで返球
- 試合前に4音×2周のPRACTICE
- PRACTICEでは代表語・語全体IPA・対象記号を中央に提示
- 8球後に `TIME` を音声でも告げ、見送り球はプレイヤーの後方へ転がる
- `礼` をするとCPUも礼。礼後は長めの間を置き、英語話者TTSの `HAJIME!` で本戦へ
- 礼後の待ち時間中に再度礼すると、HAJIMEまでの間がリセットされる
- 正解・不正解とも、中央に単語・IPA・正解記号を表示して視線を固定しやすくした
- ミス時は「よろめき蹴り」ではなく、身体に当たって跳ね返る BODY RETURN 表現
- 間違えた問題は数問後に再登場する簡易リトライキューを追加
- 3回連続ミスで奥/手前方向へもんどり打つ2.5Dダウン演出
- 記号選択で浅い円弧を回り込む足運び
- LOB / PERFECT / DRIVE、体力・救済ラリーは継続
- 発音そのものの録音・採点はまだ未実装

この段階ではゲーム性と学習ループの検証を優先します。

## Project context / handoff

設計の経緯、学習仮説、更新履歴、今後のロードマップ、最終ステージ構想、技術的負債、次のエージェントへの引継ぎ事項は以下にまとめています。

- [docs/PROJECT_HANDOFF.md](docs/PROJECT_HANDOFF.md)
- [docs/V010_PLAYTEST_NOTES.md](docs/V010_PLAYTEST_NOTES.md) — v0.10の変更意図、試遊観察、検証項目
