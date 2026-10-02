# Macでの仕上げ・検証記録

対象は `feat/feg-complete-edition`。クラウドからの転送基点は `a59e931189917d45e0251b344ed0fda87b4405ff` です。元のMacチェックアウト（`main`、`ecfa8a0`、未コミット変更なし）を変更せず、独立したチェックアウトで作業しました。mainへのマージ・Pages公開は行っていません。

## 修正

- 小さい横画面で石庭の見出し・石・選択情報が重なる配置を修正。八つの普通の石は装飾として残し、相手のタップを遮りません。
- 七球の集結と主人公の変身より前に影が見える問題を修正。祇園の開始画面では影を隠し、変身後に登場します。演出スキップでも順序を保ちます。
- タイトル読み上げ中の消音・発声音量変更でSTARTが無効のままになる停止を修正。タイムアウトした発話のキャンセル、古い音声イベント、AudioContextの再生成・中断・BFCache復帰も修正しました。
- 内部の舞台移動から履歴で戻ったページがBFCacheに残る場合、正規URLから最新の保存状態と音設定を再構成します。
- 知恩院の撞木を鐘楼と同じ座標・高さに揃え、吊下げ・鐘との接触・僧の手元・カメラ回り込み時の表示を修正しました。
- 縦長画面の手前の地面が切れて空の色が見える問題を修正。描画中だけ視点を同じ視線方向へ後退させ、人物・鞠の画面上の位置やゲーム用カメラを変えずに近くの地面を描きます。
- 既存ファイルを修正し、製品の上書きパッチは増やしていません。[保守ガイド](MAINTENANCE.md) と領域別npmコマンド、依存のロックファイルを追加しました。

## 実行した検証

`npm test`：合成・43件の内容検査・6デッキ84語・六人の獲得と保存・音声ライフサイクル・タイトル音声操作・履歴復帰・舞台構造・知恩院の撞木・七人の112接触・DOM通し試験。8種類の球道、時間、判定、ダメージはv0.29.1の基準と一致しています。

`npm run test:browser`：Chrome 154.0.8037.97、`ANGLE Metal Renderer: Apple M4`、通常のハードウェア描画で実行。強制SwiftShaderやVMの代用ではありません。キャンペーンの試験は時間を進める検証用処理とDOM入力を使い、発音は模擬しています。

- 製品の実indexからSTART→京都駅の上下二言語字幕→練習へ。
- 8球のPRACTICE→TIME→繰返しの礼→HAJIME、一時停止・復帰。
- 六人を自由順に勝利、通常継承、保存・再読込、再戦の球数重複なし。
- 祇園、七球→ゴッドモード→影の表示順、影戦、ひゃーん散開、THE END、再挑戦。
- 敗北・再開・演出OFF。全7舞台の表／奥×6サイズ＝84レイアウト。
- 石庭は祇園解放前後の6サイズで、名前・パネル・操作領域・実際のヒット判定を検査。

画面サイズは `320×568 / 390×844 / 568×320 / 844×390 / 768×1024 / 1024×768`。実Edgeでも京都駅・練習・停止・石庭・相手選択・知恩院と履歴操作を手動確認しました。自動試験は正解を検証側で取得するため、学習難易度や面白さの受入試験ではありません。

ブラウザ試験はMacのChromeパスを既定にし、ソフトウェア描画は明示指定に分離しました。実音声型に合わない模擬Voice、停止したRAFで待ち続ける処理、リサイズ直後の画像に古い描画片が混ざる問題も試験側で修正しています。

`npm run test:audio-browser`：別の隔離Chromeで14項目通過。実AudioContextでBGMのRMS約0.010、SEのpeak約0.120、音量100→10のRMS比約0.101、消音PCM=0を測定しました。ネイティブSamantha音声のthink／ship開始・終了、前の発話の`interrupted`、即時置換、同一Contextのsuspend→再開ボタン復帰も確認。autoplay許可の強制指定、音声APIの模擬、マイク取得はしていません。内部信号と合成イベントの検証であり、物理スピーカーの試聴や音韻の聴き取りを保証するものではありません。

`node tests/foreground-v030.cjs --browser`：8場面×表／奥×縦画面2サイズ＝32件の実WebGL画素検査。修正前の描画との同一ページ比較で地面の欠けを再現し、修正後は下端の空色画素が1%未満。通常の同テストでは152条件の行列・地形を検査し、画面上のXY投影の一致、カメラ復元、建物の遠方クリップなしを確認しています。

## 保存した証拠

初回Mac統合版の実WebGLは**99検査・104画像・JavaScriptエラー0**。Gitには代表10画面と以下の機械可読レポートを保存しています。その後の磨き込みは次節の証拠を参照してください。

- [実WebGL全結果](evidence/mac-2026-10-02/complete-browser-report.json) / [実音声API](evidence/mac-2026-10-02/audio-browser-report.json) / [足元の描画検査](evidence/mac-2026-10-02/foreground-browser-report.json)
- [京都駅の練習](evidence/mac-2026-10-02/complete-production-practice.png) / [石庭・小さい横画面](evidence/mac-2026-10-02/complete-garden-unlocked-568x320.png)
- [三十三間堂の奥](evidence/mac-2026-10-02/complete-gendo-back-1024x768.png) / [知恩院の夜桜](evidence/mac-2026-10-02/complete-chion-back-1024x768.png) / [新京極](evidence/mac-2026-10-02/complete-shinkyogoku-front-1024x768.png)
- [七球集結](evidence/mac-2026-10-02/complete-gion-gather-start.png) → [変身](evidence/mac-2026-10-02/complete-gion-gather.png) → [影の登場](evidence/mac-2026-10-02/complete-gion-shadow-reveal.png) → [散開](evidence/mac-2026-10-02/complete-gion-scatter.png) → [終幕](evidence/mac-2026-10-02/complete-ending.png)

## 追加の美術・画面・動作の磨き込み

`1221a012` 保存後、実画面を見直して以下を修正しました。

- 七人の目・眉・口を六角形の顔の面へ密着させ、目が横へ浮く問題を解消。少ない面で表情を分け、ルカの腕を袖なしにし、首と衣装を接続しました。輪郭・身長・衣装の違いは維持。
- 蹴り後の歩行で支持足を交替し、接地中に足が胴体と一緒に滑る問題を改善。旧レビュー区間では約0.870の滑りがあり、修正後の各支持区間は実Chromeで0.000001〜0.00345でした。スーツ・袴・子どもを確認しています。判定・球道・接触時刻・骨長は変更していません。
- 奥への追走終了時のズームの段差を解消。終端の変化を1.000→0.900から0.900012→0.900000へつなげました。
- 神宮の社殿に低い基壇と前段を追加し、白砂から浮いて見える足元を修正。三条奥は広い青い床を陸に戻し、水路・護岸・橋・対岸の町家を整理しました。
- 石庭の見出し、タイトルの日本語改行、京都駅会話への画面幅、導入・勝負カードの操作ラベルを整理。勝利・継承・散開の大きな文字を上部へ移し、人物と光が見える構図にしました。演出OFFとOSの動き軽減では追加アニメーションを無効にしています。
- 鞠の札を読みやすい小ささにし、顔・胴・鞠・HUD・練習カードを避ける位置へ配置。細い線で球との対応を示し、同じ状態で位置が振動しないようにしました。TIME・礼・HAJIMEには空の札を残しません。教材や正解を隠す規則は維持しています。
- 七球集結は小さい縦横画面でも七球が見切れない構図へ調整。集結、ゴッドモード、影の登場順と時刻は維持します。

最終候補で `npm test`、実WebGLの通し99項目・104画像、UI2050項目・131画像が合格し、JavaScriptエラーは0でした。追加の回帰試験は `npm test` に統合。実WebGLの構図検査は `npm run test:ui-browser`、七人一覧は `npm run review:characters` で再現できます。[統合検証の要約](evidence/mac-2026-10-02/polish/verification-summary.json)には、製品HTMLのハッシュ、試験件数、検証範囲を保存しています。詳細な全画像・レポートは実行環境の `../work/ui-polish/`、`../work/characters-art/`、`../work/scenery-polish/`、`../work/motion-step/` にあります。

- [七人・修正前](evidence/mac-2026-10-02/polish/characters-before.png) → [修正後](evidence/mac-2026-10-02/polish/characters-after.png) / [単色の輪郭](evidence/mac-2026-10-02/polish/character-silhouettes.png)
- [袴の踏み替え](evidence/mac-2026-10-02/polish/sumi-planted-step.png) / [小学生の踏み替え](evidence/mac-2026-10-02/polish/kota-planted-step.png)
- [神宮](evidence/mac-2026-10-02/polish/jingu-grounded.png) / [三条奥](evidence/mac-2026-10-02/polish/sanjo-canal.png)
- [手動Edge・京都駅の会話](evidence/mac-2026-10-02/polish/manual-kyoto-dialogue.png) / [手動Edge・石庭](evidence/mac-2026-10-02/polish/manual-garden.png)
- [顔を隠さない鞠の札](evidence/mac-2026-10-02/polish/ball-prompt.png) / [継承](evidence/mac-2026-10-02/polish/inheritance.png)
- [七球・縦画面](evidence/mac-2026-10-02/polish/gion-seven-orbs.png) / [七球・小さい横画面](evidence/mac-2026-10-02/polish/gion-seven-orbs-landscape.png) / [変身後の影](evidence/mac-2026-10-02/polish/gion-shadow.png)

七人の輪郭・衣装・姿勢は識別できますが、顔は簡潔な共通形状を基盤とし、蹴りも共通の接触骨格に所作の差を加える構成です。小さな実プレイ画面では細かな表情の効果は限定的です。旋回中に建築を透かして人物を見せる既存処理があり、三条などの背景が一時的に空く場面は残ります。完全に別々の格闘アニメーションや細かな顔芝居まで完成したとは扱いません。

## 残る受入

**iPhone・iPadの実機SafariでのBGM／SE／単語音声、タップ、画面ロック・アプリ切替からの復帰は未確認です。** Macの画面サイズ変更や模擬音声を実機合格とは扱いません。特に `/ʒ/` と母音デッキの聴き取りは端末の声で確認が必要です。

Macで端末一覧を確認したところ、実iPhoneは登録済みです。最初はiPhoneミラーリングがMacログインのロックで停止していましたが、利用者の解除後、実機画面の取得・Safari起動・アドレス欄へのタップまで確認できました。最新版を同じLAN内の実機へ一時配信する操作は、自動承認レビューがソースのネットワーク公開を理由に拒否しました。ゲーム用ファイルだけの一時配信について利用者の明示承認を依頼しており、まだゲーム自体の実機合格ではありません。配信サーバーは起動していません。

実iPadは接続一覧になく、iPad Simulatorのみでした。Simulatorを実機合格の代わりにはしていません。

mainへのマージとPages公開は、実機結果を確認したうえで別途承認を得る段階です。現在の公開試遊は従来のv0.29.1です。

## 再現

```sh
npm ci
npm test
npm run test:browser
python3 -m http.server 8765 --bind 127.0.0.1
```

`http://127.0.0.1:8765/` を開いてSTART。既存セーブがあれば石庭へ進み、「京都駅へ」で導入を再試遊できます。各相手を選び「ここで勝負」。自分の一球と六人の継承で祇園が解放されます。ブラウザ試験の証拠先は `FEG_EVIDENCE_DIR` で変更できます。
