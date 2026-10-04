# FEG の小さな修正ガイド（v0.30）

通常の保守は、このページと変更対象のファイルから始められます。過去の会話・構想資料・全パッチの通読は不要です。作品全体の条件を変えるときだけ [現在の引継ぎ](CODEX_START_HERE.md) と [希望全文](FEG_CREATIVE_BRIEF_2026-10-02.txt) を確認します。利用枠内の所要量は保証できませんが、変更領域と検証範囲を小さく保ちます。

## 移行ブランチの描画（2026-10-04）

`rendering/three-adapter.js` がThree.js描画の正本です。旧Nodeの形状と姿勢をThreeのGroup/Meshへ同期し、既存の接触座標とカメラ投影を保持します。変更後は `npm run build:renderer` で `rendering/three-runtime.js` を再生成し、両方を保存します。生成物の直接編集は禁止です。Three.js 0.186.1とesbuild 0.28.2をlockfileで固定し、CDNには依存しません。実行時はWebGL2が必要です。キャラの `renderRole=fighter` と足の `foot` を使って面の照明と軽い接地影を描きます。高負荷な影マップ・ポストエフェクトは使いません。投影の旧描画比較は `look=baseline` で追加照明・アンチエイリアスを切ります。

`npm run test:polish` は保存コミット `bd4b4e4` のコードをGitから直接合成して球道・判定・接触・姿勢復元を比較します。`node tests/polish-match-browser.cjs polish-before baseline` と `npm run test:match-video` は自然な時間進行の前後比較動画（無音）を記録します。通常試合のボタン入力を使いますが、テスト開始では練習を省き、正解を検証側で取得します。

`npm run test:renderer` はMac Chromeで旧描画との固定条件比較。`npm run test:browser` は移行後の実ブラウザ進行試験です。既存VMは記録用Garden描画を明示選択するため、`npm test`だけでThree.js描画を検証したとは扱いません。旧描画はURLの `renderer=garden` で比較できます。

## 編集する正本

| 変えたいもの | 正本と主な編集箇所 | 最初の確認 |
| --- | --- | --- |
| キャラ名・色・舞台への割当 | `content/characters.js` の `id/name/appearance`、`content/stages.js` の `player/opponent` | `npm run test:content` |
| キャラの輪郭・衣装・固有所作 | `characters/seven-rigs.js` の `profiles`、モデル別造形、`characterPoseV030` | `npm run test:characters` |
| 蹴り後の踏み替え・追走カメラ | `patch-motion-v029.js` の `strikePoseV024`、`patch-drama-v028.js` の追走レンズ | `npm run test:motion` と `npm run test:characters` |
| 舞台名・使うデッキ | `content/stages.js` の `name/deck` | `npm run test:content` |
| 背景・表と奥・環境色 | `scenery/kyoto-scenes.js` の `stages` と舞台別関数（`jingu`、`gendo` など） | `npm run test:scenery` |
| 単語・IPA・コツ・練習語 | `content/decks.js` の `sounds[].words/tip/example/practice` | `npm run test:content` と `npm run test:decks` |
| 雅楽の音色・層・動作音・発音復帰 | `patch-sound-v030.js` の下記関数 | `npm run test:sound` |
| 獲得・七球・祇園解放・セーブ正規化 | `content/campaign.js` の `fresh/normalize/award` | `npm run test:campaign` |
| 京都駅台詞・15石・勝利演出・終幕・画面配置 | `patch-campaign-v030.js` の CSS と `*V030` 関数 | `npm run assemble`、続いて `npm run test:flow` |

`content/validate.js` はデータの参照・4音・IPA形式・色などの共通検査です。エラー回避のために検査を緩めず、まず参照元データを直します。既存の判定・球道・接触・礼の修正は該当する旧 `patch-*.js` が正本です。通常のコンテンツ修正では触りません。

## 正本ではないファイル

- `index.html` は製品ローダーと合成順序の正本です。ゲーム全文の編集場所ではありません。
- `app1.b64`〜`app5.b64` はGardenGLを含む旧基底の入力です。日常の修正でデコード後のHTMLを再圧縮して置き換えません。
- `npm run assemble -- /tmp/feg-review.html` が出すHTMLは確認用生成物です。ここへ加えた修正は正本へ戻し、再生成します。
- `tests/fixtures/baseline-v0291.html` は旧挙動との比較基準です。新実装で上書きしてテストを通してはいけません。
- スクリーンショット、ソフトウェア投影画像、試験レポートは証拠です。UI・造形の編集元ではありません。

配布対象はローダー、基底、正本のJS群とビルド済みThree.jsランタイムです。通常のコンテンツ修正はビルド不要ですが、`rendering/three-adapter.js` を変更した場合は再ビルドが必要です。Three.jsは製品依存、esbuildは生成用依存です。

## よくある変更

**キャラ追加・差し替え。** 名前と配色だけなら人物定義を変更します。新しい姿は `appearance.model` と `seven-rigs.js` のモデル分岐・`profiles` を対応させ、舞台の人物IDを指定します。別リグを作る場合は `FEGCharacterRigs.<id>` に登録し、`patch-stages-v021.js` より前に読み込みます。七人の構成を維持した差し替えと、対戦相手数を増やす仕様変更は分けます。後者には進行モデル、石の割当、セーブ移行、試験の更新が必要です。

造形と表示用ポーズは既存の接触骨格を維持します。ルート高さ `.12`、股関節 `1.05`、脚各節 `.48`、つま先ピボット `.16`、返す関節名と親子関係を保ちます。衣装による輪郭の差は作れますが、接触時刻や判定猶予は変更しません。表示用変形は描画後に復元し、積み重ねません。影は `derivedFromPlayer` で現在の主人公から生成し、別の八人目を追加しません。

顔の目・眉・口は `faceFeature` で実際の面へ密着させます。固定のXYZだけで浮かせないでください。`npm run review:characters` は実WebGLの七人一覧と単色の輪郭を `../work/characters-art/` に生成します。v0.33で、比較用ギャラリーがThreeのソース文字列を実行せず旧Gardenへフォールバックしていた問題を修正しました。GPU名だけでは描画経路を証明できないため、実際のrenderer型も検査します。ゲーム内の小さな表示も比較する場合は `node tests/characters-game-art-v030.cjs <比較元のコミット>`。一覧の見栄えだけで、実プレイや実機の合格とは扱いません。

踏み替え補償は蹴りの接触後だけの表示処理です。根元の移動量・球の飛行・判定を変えず、支持足と重心の表示を合わせます。`test:motion` は接地の滑り、歩行前後と追走終了時の連続性、繰返し描画での非累積、演出OFFを検査します。

**舞台変更。** 名称・対戦相手・教材の対応と、背景造形は別ファイルです。`scenery/kyoto-scenes.js` の舞台関数には表／奥の `back` が渡ります。登録色・ランドマークと実際の造形を合わせ、静的部分の結合と動くノードの再利用を守ります。正面だけでなく追走・回転・奥も描画して確認します。三十三間堂は外→仄暗い観音堂、知恩院は鐘→夜桜、新京極は黄色い湾曲ひさし＋左の飛行機状造形を維持します。

背景v0.36は各モジュールを静的結合した後、`bakeLight` で床・壁・提灯周辺の頂点色を焼き込む。追加の影マップ・テクスチャはない。色を変えた後は `npm run test:scenery` と実描画の表／奥／追走を確認する。比較撮影は `tests/scenery-art-v036.cjs`、短い追走録画は `tests/scenery-tour-v036.cjs`（[手順](art/v036/REVIEW.md)）。

**単語・IPA修正。** 1デッキ4音、`symbol` はスラッシュなし、`ipa` は `/…/`、`example/practice` は同じ音の `words` を参照します。生成されたIPA表を別に直す必要はありません。辞書の米音と、そのデッキに複数の正答候補がないことを確認します。`tests/decks-v030.cjs` は新規語の期待値・出典と既存36語のダイジェストを保持します。意図した教材修正なら根拠とともに期待値を更新し、失敗を消すためだけのダイジェスト更新は避けます。音源も `scripts/generate-voices-v032.py` で再生成して `content/voice-clips.js` とMP3を揃え、実際の聞こえ方は別途試聴します。

**音調整。** `shoV030/pluckV030/fluteV030/taikoV030` が楽器、`successSoundV030` が成功による層追加、`soundPumpV030` が既に得た層の時間進行、`audio.hit/movement` が動作音です。`audio.applyMix` が音量・場面ごとの強弱、`audio.speak/stopVoice` が即時発音切替、`resumeFromGesture` と末尾イベント群が中断復帰を担当します。音色の調整で音声ライフサイクルを複製しません。成功なしで層を増やさず、ラッシュの発音待ち列も作りません。

**以前の声へ戻す。** `content/voice-config.js` の `engine:'recorded'` を `'native'` に変える一か所で既定方式を戻せます。ゲームの呼出側は共通のままです。試聴だけなら `?voice=native`、録音方式は `?voice=recorded`。URL指定は保存しません。nativeは元の声選択・速度・高さと60%の伴奏を維持しますが、iOSによるBGM中断までは保証しません。recordedは発音による伴奏減衰なし。`npm run test:sound` と `npm run test:audio-browser`、実機の聞き取り確認を分けて行います。旧v0.32の録音も比較用に保持し、`scripts/generate-voices-v032.py --neutral-v033` で現行音源を再生成できます。

**進行修正。** データ操作は純粋な `content/campaign.js`、表示と遷移は `patch-campaign-v030.js` に置きます。通常勝利は獲得を保存してから吸収演出へ進み、再戦で球数を増やしません。保存キーは進行 `feg.campaign.v1`（一時保存 `feg.campaign.session.v1`）、音 `feg.audio.v1`。人物IDの変更は既存セーブへ影響するため移行を明示します。保存の `version` を上げるだけでは旧値が新規状態に戻るので、継続させる場合は `normalize` に移行を書きます。

## パッチ合成の契約

`index.html` のscript読込順と `html=window.…(html)` の適用順が契約です。`tests/assemble.cjs` もこの順を読みます。基底→既存の試合・動作パッチ→関節v0.29.1→人物v0.30→京都立体v0.30→進行v0.30→音v0.30の順を保ちます。音は最終的な `start/pause/end/updateGame` 等を包むので最後です。通常修正は担当する既存ファイルに戻し、末尾の上書きパッチを増やしません。

`once` / `replaceOnce` は置換元が**ちょうど1件**のときだけ進む検査です。`anchor` エラーは、先行パッチの変更・順序・重複を調べる入口です。検査を外したり、一致しなくても続行する置換に替えたりせず、前後両方の契約を直します。`npm run assemble` は合成と生成JS構文まで確認しますが、CSS配置・実行時動作・描画を保証しません。

## 短い確認から受入まで

Node.js 22以降でリポジトリ直下から実行します。初回は `npm install`。小さな修正は表の該当試験から始め、関連する挙動を変えた場合だけ範囲を広げます。

```sh
npm run assemble
npm run test:content
npm run test:decks
npm run test:campaign
npm run test:characters
npm run test:motion
npm run test:scenery
npm run test:sound
npm run test:flow
```

上のコマンドは一覧です。毎回すべてを個別実行する必要はありません。`test:flow` はDOM入力と保存を含む通し試験で、他の単独試験より重くなります。描画呼出を記録するVMとCPU投影を使うため、**WebGL・CSS実配置・実音声の合格とは別**です。統合時は `npm test` で現行集約を実行します。旧 `battle-v016` / `stages-v021` / `feel-v023` 等は旧メニューやID前提を含み、現行集約の代用にはなりません。

画面配置を変えた場合は `npm run test:ui-browser` で石庭、会話・演出の構図、鞠の札と人物の重なりも確認します。鞠の札は `placeBallPromptV030` に集約し、描画中の投影座標を使います。教材の表示内容や正解を隠す規則は配置調整の対象にしません。

リリース前は次の順に確認します。

1. `npm test`。音声のDOM統合・舞台移動からの履歴復帰・知恩院の撞木も集約対象です。判定・球道・時間・ダメージは基準HTMLとの差分比較も確認します。
2. `npm run test:browser`。Macの既定は `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`。別の場所なら `CHROME_PATH="/path/to/chrome" npm run test:browser`。証拠保存先は `FEG_EVIDENCE_DIR` で指定できます。起動失敗は未検証で、`--vm` や `--software` の結果をハードウェアWebGL合格に読み替えません。
3. `python3 -m http.server 8765` で `http://localhost:8765/` を開き、新規セーブから京都駅→六人→GION→七球→ゴッドモード→影→散開→再挑戦を操作します。全試合の `PRACTICE → TIME → 礼 → HAJIME`、8球後の見送り、繰返しの礼を保ち、停止・連打・敗北・戻る・再読込も試します。
4. `320×568 / 390×844 / 568×320 / 844×390 / 768×1024 / 1024×768` で人物・鞠・IPA・HP・15石と押せる領域を確認します。背景変更時は表と奥、動作変更時は接触中も確認します。
5. **最後にiPhoneとiPadの実機Safari**で、開始タップ、BGM／SE／単語音声、音量・消音保持、ラッシュ、アプリ切替、画面ロック復帰を確認します。`/ʒ/` と母音を実際に聞きます。ブラウザ自動試験の発音は模擬なので実機試聴を代替しません。

音を変えた場合は `node tests/audio-recorded-browser-v032.cjs` でMacの実AudioContext、同梱MP3の復号、BGMと声の同時出力、開始・中断・復帰を確認します。OS読み上げAPIを使わないことも検査します。スピーカーの聴感・実機試遊の合格とは別です。旧 `tests/audio-browser-v030.cjs` はネイティブTTS時代の比較用です。

報告にはコミット、実行コマンド、画面証拠、未確認の端末・音声条件を残します。作業ブランチへの保存と、mainへのマージ・Pages公開の承認は別です。
