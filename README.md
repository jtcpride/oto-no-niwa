# oto-no-niwa

発音記号蹴鞠「音の庭」の試作リポジトリです。

## iPad / Safari 試遊

https://jtcpride.github.io/oto-no-niwa/

## Current

- **v0.13.0「聞く間をとれる一定ペース」**
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
- 3回連続ミスは一歩よろけて復帰（旧転倒演出の重複を除去）
- 記号選択で浅い円弧を回り込む足運び
- BGM / 発音を個別調整。発音中はBGM・効果音を自動的に抑える
- BGMは楽器数を滑らかに増やし、音が重なるほど音量を補正
- 浮かし / 内回し / 外払い / すくい上げ。膝の曲げ伸ばしと構え・振り抜き・復帰
- 技と入力タイミングが球の高さ・速さ・奥行きの曲がり・回転に反映
- LOB / PERFECT / DRIVE、体力・救済ラリーは継続
- 発音そのものの録音・採点はまだ未実装

この段階ではゲーム性と学習ループの検証を優先します。

## Project context / handoff

設計の経緯、学習仮説、更新履歴、今後のロードマップ、最終ステージ構想、技術的負債、次のエージェントへの引継ぎ事項は以下にまとめています。

- [docs/PROJECT_HANDOFF.md](docs/PROJECT_HANDOFF.md)
- [docs/V010_PLAYTEST_NOTES.md](docs/V010_PLAYTEST_NOTES.md) — v0.10の変更意図、試遊観察、検証項目

## Checks

- `node tests/assemble.cjs`: 全runtime patchの適用と生成後JSの構文検査。
- `node tests/play-v012.cjs`: Playwright + Chromeで球道12通り、100回の姿勢復帰、失敗、音量制御、スマホ幅、実indexからの練習→礼→本戦を検証。Playwrightを解決できる環境で実行（必要なら `NODE_PATH`）、Chromeパスは `CHROME_PATH` で指定可。
- TTSは自動検証ではイベントを模擬。実際の声・聞こえ方・iPad Safariの体感は実機試遊で確認。
