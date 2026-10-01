# ステージ追加・差し替え（v0.21.0）

ゲームは GardenGL の固定4スロット制。HP、蹴り動作、球速、練習→TIME→礼→本戦、音量設定を共通にし、内容を分離した。現在は二つのデッキを選択できる。最大7ステージまで登録可能だが、7ステージ分の完成コンテンツは含めていない。

## 編集する場所

| ファイル | 担当 |
| --- | --- |
| `content/decks.js` | デッキID、4音、コツ、単語とIPA、練習・ボタン見本の参照 |
| `content/characters.js` | キャラID、表示名、描画リグID、衣装・肌等の色 |
| `characters/garden-rig.js` | 現行キャラの形と関節の生成。プレイヤー／敵で共用 |
| `content/stages.js` | ステージID・表示名、使用デッキ、自キャラ・敵キャラのID |
| `content/validate.js` | ID参照・4音・単語・IPA・色・7件上限の検査 |
| `patch-stages-v021.js` | 既存ゲームへの接続。通常のステージ追加では変更不要 |

配布ページは従来のローダーで組み立てる。データとリグを生成HTMLへ埋め込むため、`node tests/assemble.cjs output.html` の単体成果物にも内容が入る。ゲーム実行時に追加の辞書APIや外部モデルは不要。

## ステージを追加する

1. `content/decks.js` に既存と異なるIDのデッキを追加、または既存IDを再利用する。
2. 必要なら `content/characters.js` にキャラを追加する。既存キャラは自キャラ・敵のどちらにも指定できる。
3. `content/stages.js` の配列に次の形式で追加する（名前は例）。

```js
{id:'third-court',name:'三ノ庭',deck:'lip-and-air',player:'jade',opponent:'plum'}
```

配列順がメニュー順になる。強制的なクリア順はない。8件以上は読み込み時にエラーになる。ステージ定義を追加するだけなら `index.html` や蹴りの処理を変えなくてよい。

- 既存: `?stage=first-court` → /θ/ /ð/ /ʃ/ /ʒ/、24語
- 新規: `?stage=second-court` → /f/ /v/ /s/ /z/、12語
- 未指定・未知のステージID: 配列先頭へ戻る

開始画面で選択するとURLを更新してシーンを作り直す。終了画面の「ステージを選ぶ」で、現在のステージを選択した開始画面へ戻る。ページを作り直すため、前ステージのリトライ単語・体力・姿勢・音声待機は持ち越さない。音量は既存どおりページ内設定で、再読込すると初期値になる。タイトル読み上げ中と直後の0.5秒はステージ選択を無効にする。

## デッキ定義

各デッキは `id`, `name`, `sounds` を持つ。`sounds` はボタン順にちょうど4件。

```js
{
 symbol:'f',
 tip:'上の歯を下唇に軽く当て、息だけ。',
 example:'fan',
 practice:'fan',
 words:[{text:'fan',ipa:'/fæn/'},{text:'leaf',ipa:'/liːf/'}]
}
```

- `symbol` は外側のスラッシュを付けない。`ipa` は `/.../` とする。
- `practice` と `example` は同じ音の `words[].text` を参照する。練習は4音×2周。
- 通常問題・再出題は `words` から選ぶ。答えのIPAもこの表から生成する。別のIPA表を編集しない。
- 読み上げるのは `text`。現在の英語音声設定（en-US）を共用する。
- 同一デッキで同じ単語を複数の音へ登録しない。複数の出題音を含む単語は、人が問題の曖昧さを確認する。
- 新しい母音・破擦音も登録できるが、綴りとIPAの正しさや聞き分けの難しさは自動検査では保証しない。
- 4スロットと4種類の蹴りの対応は位置で固定。音によって新しい技を自動生成する仕組みではない。

## キャラの差し替え範囲

現在の4定義（翡翠・朱・藍・紫苑）は、現行モデルを使った名前と配色のバリエーション。正式な登場人物・流派設定ではない。

`appearance` の `robe`, `trim`, `skin`, `hair`, `cap`, `eyes`, `nose`, `trousers`, `shoes` は `#RRGGBB`。ステージから指定するIDを替えれば左右どちらも交換できる。

形を変える場合は別のリグ生成関数を `window.FEGCharacterRigs.<id>` に登録し、キャラ定義の `rig` で選ぶ。新しいリグファイルは `index.html` で `patch-stages-v021.js` より前に読む。生成関数の引数は `({root,group,mesh}, x, appearance, face)`。外部の変数に依存せず、これらの引数だけで描画ノードを作る。

戻り値には以下のGardenGLノードが必要。

```
n, body, head, arm, farArm, leg, back,
thigh, knee, shoe, backThigh, backKnee, backShoe,
elbow, wrist, farElbow, farWrist, toe, backToe
```

v0.29.1で肘・手首・つま先を追加。`elbow`/`farElbow` は肩ノードの下、`wrist`/`farWrist` は肘の下、`toe`/`backToe` は足首ノードの下に置く。肘/前腕各0.35、つま先ピボットは靴ローカルx=0.16。現行Gardenリグへは末尾runtime patchで追加している。

さらに `kick:0` と `phase` を返す。単に関節名が合えば任意の3Dモデルを使えるわけではない。現行アニメーションはGardenGLの座標系、ルート高さ0.12、脚の各節0.48、接触位置を前提とする。既存リグの親子関係・ピボット・長さを維持して形を変える。骨格・大きさ・GLTF等の形式を変える場合は、接触とアニメーションのアダプターが別途必要。

## 今回の範囲外

京都ごとの新背景・音楽、石庭の選択画面、キャラ固有技、進行保存、7ステージ分の教材、3Dエンジン移行。現段階の二ノ庭は別デッキと別配色の試遊ステージで、背景は現行の庭を共用する。

## 検証

```sh
node tests/assemble.cjs
node tests/content-v021.cjs
node tests/stages-v021.cjs
node tests/play-v012.cjs
FEG_TEST_STAGE=second-court node tests/play-v012.cjs
node tests/stages-browser-v021.cjs
```

ブラウザ検証にはPlaywrightが必要（インストール済み環境では `NODE_PATH` で参照してもよい）。`CHROME_PATH` でChromeの場所を指定可能。音声イベントを模擬するため、実際の聞こえ方・iPhone/iPad Safariの受入確認とは別。
