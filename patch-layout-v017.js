window.otoPatchLayoutV017=function(html){
function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.17 patch anchor: '+from.slice(0,72));html=html.replace(from,to);}
replaceOnce("version:'0.16.0-hp-battle'","version:'0.17.0-responsive-controls'");
replaceOnce('<title>音の庭 — v0.16.0</title>','<title>音の庭 — v0.17.0</title>');
replaceOnce('</style>',`
body{padding: max(8px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))}
.symbols button,.kick{touch-action:manipulation;user-select:none;-webkit-user-select:none}
@media(orientation:portrait){
 .console{grid-template-columns:minmax(0,1fr) 84px;padding:10px;gap:10px}
 .selection{grid-column:1/-1}
 .symbols{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
 .symbols button{min-width:0;min-height:56px;padding:6px 2px}
 .timing{align-self:center;padding:0}.timing-track{margin:0;height:24px}
 .kick{height:64px;min-width:0;width:100%}
 #arena{height:clamp(220px,calc(100svh - 300px - env(safe-area-inset-top) - env(safe-area-inset-bottom)),620px)}
 #arena:has(#intro:not([hidden])){height:calc(100svh - 120px - env(safe-area-inset-top) - env(safe-area-inset-bottom));min-height:320px}
}
@media(orientation:landscape) and (min-width:560px){
 body{padding:max(6px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(6px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))}
 #app{height:calc(100svh - max(6px,env(safe-area-inset-top)) - max(6px,env(safe-area-inset-bottom)));min-height:296px;display:grid;grid-template-columns:clamp(76px,12vw,116px) minmax(0,1fr) clamp(76px,12vw,116px);grid-template-rows:44px minmax(0,1fr) 38px;gap:6px 10px}
 .masthead{grid-column:1/-1;grid-row:1;padding:0;gap:4px}
 .brand{gap:4px}.crest{display:none}h1{font-size:17px;letter-spacing:.04em}
 .tools{gap:4px}.tools button{min-width:44px;padding:4px 6px;font-size:10px}
 .audio-mix{grid-column:2;grid-row:1;align-self:center;justify-self:center;width:min(300px,calc(100% - 160px));margin:0;gap:6px;justify-content:center;flex-wrap:nowrap;font-size:10px;z-index:1}
 .audio-mix label{min-width:0;gap:4px;min-height:28px}.audio-mix input{min-width:24px;width:clamp(24px,5vw,65px);margin:0}.audio-mix output{display:none}
 #arena{grid-column:2;grid-row:2;width:100%;height:100%;min-height:0;border-radius:8px}
 #arena:has(#intro:not([hidden])){grid-column:1/-1;grid-row:2/4;height:100%;min-height:0}
 .console{display:contents}
 .selection{grid-column:1;grid-row:2/4;align-self:end;min-width:0;padding-bottom:0}
 .selection .control-heading{margin-bottom:4px;justify-content:stretch}.selection .eyebrow{display:none}
 .listen-again{width:100%;min-height:32px;padding:4px 0;font-size:10px}
 .symbols{grid-template-columns:1fr;gap:4px}
 .symbols button{min-width:0;min-height:44px;padding:4px 6px;display:flex;align-items:center;justify-content:center;gap:6px}
 .symbols span{font-size:23px}.symbols small{font-size:9px;margin:0}
 .timing{grid-column:2;grid-row:3;align-self:center;padding:0;min-width:0}
 .timing .control-heading{display:none}.timing-track{height:26px;margin:0}
 .kick{grid-column:3;grid-row:2/4;align-self:end;width:100%;height:76px;min-width:0}.kick span{font-size:22px}
 .hud{top:10px;left:12px;right:12px;grid-template-columns:1fr 56px 1fr;gap:10px}.hud .eyebrow{font-size:9px}.score strong{font-size:30px}.score #goal{font-size:8px}
 #hpValue,#cpuHpValue{font-size:10px;margin-top:4px}.phase,.stage-caption{display:none}
 .practice-card{top:28%;min-width:120px;padding:4px 8px}.practice-card strong{font-size:14px}.practice-card span{font-size:17px}.practice-card small{font-size:9px}
 .sport-feed{top:auto;bottom:8px;left:8px;max-width:calc(100% - 16px)}.sport-item:not(:first-child){display:none}
 .overlay,.overlay:has(.intro:not([hidden])){padding:8px;align-items:center;justify-content:center}
 .panel,.intro,.panel:not(.intro){width:380px;max-width:100%;max-height:100%;overflow:auto;margin:0;padding:12px 16px;background:#17302ef2;border:1px solid #7b968677;border-radius:8px}
 .panel h2,.intro h2,.panel:not(.intro) h2{font-size:26px;margin:0 0 8px}.intro p,.panel p{font-size:12px;line-height:1.4;margin:6px 0 10px}
 .primary{min-height:44px;padding:8px 14px;max-width:none}.result-stats{margin:8px 0}.result-stats strong{font-size:24px}
 .ceremony-menu{bottom:8px;width:calc(100% - 16px)}.ceremony-menu button{min-height:44px}
}
</style>`);
return html;
};
