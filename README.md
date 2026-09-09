# oto-no-niwa

発音記号蹴鞠「音の庭」の試作リポジトリです。

## iPad / Safari 試遊

https://jtcpride.github.io/oto-no-niwa/

## Current

- **v0.9「PRACTICE → TIME → 礼 → HAJIME!!!」**
- 1ステージ4音: `/θ/` `/ð/` `/ʃ/` `/ʒ/`
- CPU側で英単語を読み上げ、狙った音の発音記号を選んで返球
- 試合前に4音×2周のPRACTICE
- PRACTICEでは代表語・語全体IPA・対象記号を提示
- 8球後に `TIME`、1球を見送り、その後 `礼` / `もう一回練習`
- 礼後の待ち時間中に再度礼すると、HAJIMEまでの間がリセットされる
- 記号選択で浅い円弧を回り込む足運び
- LOB / PERFECT / DRIVE、体力・救済返球は継続
- 発音そのものの録音・採点はまだ未実装

この段階ではゲーム性と学習ループの検証を優先します。

## Project context / handoff

設計の経緯、学習仮説、更新履歴、今後のロードマップ、最終ステージ構想、技術的負債、次のエージェントへの引継ぎ事項は以下にまとめています。

- [docs/PROJECT_HANDOFF.md](docs/PROJECT_HANDOFF.md)
