window.otoPatchFeedbackV0261=function(html){
 function once(a,b){if(html.split(a).length!==2)throw Error('v0.26.1 anchor: '+a.slice(0,50));html=html.replace(a,b);}
 once("version:'0.26.0-closing-tempo'","version:'0.26.1-hit-feedback'");
 once('FIFTEENTH EVER GARDEN — v0.26.0','FIFTEENTH EVER GARDEN — v0.26.1');
 once('#arena:has(#practiceCard:not([hidden])) .sport-feed{display:none}','');
 once('</style>',`
 .player-name{position:relative}
 #arena #sportFeed{display:flex;position:absolute;top:100%;bottom:auto;left:0;margin:5px 0 0;min-height:0;width:max-content;max-width:220px;pointer-events:none}
 #sportFeed .sport-item:not(:first-child),#sportFeed .sport-item span{display:none}
 #sportFeed .sport-item:first-child{padding:3px 6px;border-left-width:2px;min-height:0}
 #sportFeed .sport-item b{display:block;font-size:16px;line-height:1.2;letter-spacing:.04em;margin:0;font-weight:700}
 @media(max-width:680px),(max-height:450px){#sportFeed .sport-item b{font-size:13px}#arena #sportFeed{margin-top:3px;max-width:155px}}
 @media(orientation:portrait) and (max-width:420px){.practice-card.answer-card{left:auto;right:8px;top:104px;transform:none;min-width:120px}}
 body.reduced-motion #sportFeed .sport-item{transition:none;transform:none}
 @media(prefers-reduced-motion:reduce){#sportFeed .sport-item{transition:none;transform:none}}
 </style>`);
 return html;
};
