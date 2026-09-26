window.otoPatchUIV015=function(html){
function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.15 patch anchor: '+from.slice(0,72));html=html.replace(from,to);}
replaceOnce("version:'0.14.1-mirrored-timing-bar'","version:'0.15.1-compact-ui'");
replaceOnce('<title>音の庭 — v0.14.1 TIMING BAR</title>','<title>音の庭 — v0.15.1</title>');
replaceOnce('<h1>音の庭 <small>OTO NO NIWA</small></h1>','<h1>音の庭</h1>');
replaceOnce('<p>発音記号蹴鞠 · v0.14.1 TIMING BAR → TIME → 礼 → HAJIME</p>','');
replaceOnce('<span class="eyebrow">A LITTLE GARDEN OF SOUND</span>','');
replaceOnce('<h2>読めたら、<br><em>蹴り返す。</em></h2>','<h2>聞いて、<br><em>蹴り返す。</em></h2>');
replaceOnce('<p>相手が読む英単語を聞いて、狙った音の記号を選ぶ。<br>足元に来たら返球。続くほど、庭のテンポが上がっていく。</p>','<p>音を選んで、足元で返す。</p>');
replaceOnce('<div class="rules"><span><i>1</i> 単語を聞いて記号を選ぶ</span><span><i>2</i> 足元で「返す」</span></div>','');
replaceOnce('<button id="start" class="primary">庭に入る <span>↗</span></button>','<button id="start" class="primary">はじめる <span>↗</span></button>');
replaceOnce('<small>単語を聞き、狙った音の記号を選ぶ。選択すると浅い円弧を回り込み、構えを変える。<br>早め＝山なり／ぴったり＝直球／遅め＝低弾道<br>ミスは体力 −15、救済返球。体力0で終了。<br>1プレイ最長45秒 · 正しい16返球でFINISH<br>タッチは下の記号＋「返す」／発音の録音・採点はしません</small>','');
replaceOnce('<span class="eyebrow">PAUSED</span><h2>ひと呼吸。</h2><p>戻ったら、同じところから。</p>','<h2>一時停止</h2>');
replaceOnce('<span class="eyebrow">01 / 聞いて合わせる</span>','<span class="eyebrow">音を選ぶ</span>');
replaceOnce('<span class="eyebrow">02 / 間合いを読む</span>','<span class="eyebrow">返すタイミング</span>');
replaceOnce('<footer><span>PRACTICE → TIME → 礼 → HAJIME!!! → 聞く → 返す</span><span>OFFLINE · LOW-POLY WEBGL <span class="desktop-only">/ R: 再開 · P: 一時停止 · M: 音</span></span></footer>','');
replaceOnce('</style>',`
.brand p,.player-name b,.cpu-name b,#lesson,.kick small,.result>.eyebrow{display:none}
#app:has(#intro:not([hidden])) .console,#arena:has(#intro:not([hidden])) #practiceCard{display:none}
.masthead{padding-bottom:12px}
.intro{max-width:440px}
.intro h2{margin:8px 0 12px}
.intro p{max-width:28ch;line-height:1.5;margin:0 0 18px}
.kick span{margin:0}
@media(max-width:680px){
 body{padding:8px 10px}
 .masthead{padding-bottom:6px}
 .crest{width:34px;height:34px;font-size:20px}
 h1{font-size:19px}
 .audio-mix{justify-content:space-between;gap:6px;margin:0 0 6px;font-size:11px}
 .audio-mix label{gap:5px;min-height:28px}
 .audio-mix input{width:min(22vw,90px)}
 #arena{height:clamp(300px,calc(100svh - 290px),480px)}
 #arena:has(#intro:not([hidden])){height:clamp(420px,calc(100svh - 120px),660px)}
 .overlay,.overlay:has(.intro:not([hidden])){align-items:flex-end;justify-content:center;padding:10px;background:linear-gradient(180deg,#10282924,#102829bd);backdrop-filter:none}
 .panel,.intro,.panel:not(.intro){box-sizing:border-box;width:100%;max-width:100%;max-height:calc(100% - 8px);overflow-y:auto;margin:0;padding:14px 16px;background:#17302ef2;border:1px solid #7b968677;border-radius:8px;text-align:left;box-shadow:0 8px 24px #0005}
 .intro h2{font-size:28px;margin:0 0 8px;line-height:1.16}
 .intro p{font-size:12px;line-height:1.45;margin:0 0 12px}
 .primary{max-width:none;min-height:44px;padding:10px 14px;gap:12px}
 .panel:not(.intro) h2{font-size:26px;margin:0 0 8px}
 .panel:not(.intro) p{font-size:12px;line-height:1.4;margin:6px 0 10px}
 .result-stats{margin:10px 0}
 .result-stats strong{font-size:23px}
 .result .review{margin:6px 0;padding:6px}
 .console{padding:10px;gap:8px 10px}
 .control-heading{margin-bottom:6px}
 .symbols button{min-height:54px}
 .symbols span{font-size:22px}
 .symbols small{font-size:9px}
 .timing-track{height:22px;margin-bottom:0}
 .kick{height:62px;min-width:72px}
 .kick span{font-size:20px}
 .phase,.stage-caption{display:none}
 .sport-feed{top:auto;bottom:12px;left:12px;max-width:calc(100% - 24px);min-height:0}
 .sport-item:not(:first-child){display:none}
 #arena:has(#practiceCard:not([hidden])) .sport-feed{display:none}
 .practice-card{top:29%;padding:6px 12px 8px;min-width:140px}
 .practice-card strong{font-size:16px}
 .practice-card span{font-size:19px}
 .practice-card small{font-size:9px}
 .ceremony-menu{bottom:12px;width:calc(100% - 20px)}
 .ceremony-menu button{min-height:44px}
}
</style>`);
return html;
};
