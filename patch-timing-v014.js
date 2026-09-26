window.otoPatchTimingV014=function(html){
function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.14 patch anchor: '+from.slice(0,72));html=html.replace(from,to);}
replaceOnce("version:'0.13.0-steady-ball-pace'","version:'0.14.1-mirrored-timing-bar'");
replaceOnce('<title>音の庭 — v0.13.0 STEADY PACE</title>','<title>音の庭 — v0.14.1 TIMING BAR</title>');
replaceOnce('発音記号蹴鞠 · v0.13.0 STEADY PACE','発音記号蹴鞠 · v0.14.1 TIMING BAR');
replaceOnce('.timing-track{height:28px;position:relative;', '.timing-track{height:28px;position:relative;transform:scaleX(-1);');
return html;
};
