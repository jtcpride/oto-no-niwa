window.otoPatchBowV0251=function(html){
 function replaceOnce(a,b){if(html.split(a).length!==2)throw Error('v0.25.1 anchor: '+a.slice(0,60));html=html.replace(a,b);}
 replaceOnce("version:'0.25.0-vocabulary-barrage'","version:'0.25.1-bow-cue'");
 replaceOnce('FIFTEENTH EVER GARDEN — v0.25.0','FIFTEENTH EVER GARDEN — v0.25.1');
 replaceOnce('</style>',`#bowBtn.bow-cue{outline:2px solid var(--gold);outline-offset:3px;box-shadow:0 0 14px #f1c88388;animation:bow-cue-glow 1.8s ease-in-out infinite} @keyframes bow-cue-glow{0%,100%{box-shadow:0 0 4px #f1c88333;outline-color:#f1c88366}50%{box-shadow:0 0 18px #f1c883aa;outline-color:var(--gold)}}body.reduced-motion #bowBtn.bow-cue{animation:none}@media(prefers-reduced-motion:reduce){#bowBtn.bow-cue{animation:none}}</style>`);
 replaceOnce("$('#start').addEventListener('click',start);",String.raw`
let bowCueElapsedV0251=0;
function syncBowCueV0251(){
 if(ceremony!=='choice')bowCueElapsedV0251=0;
 $('#bowBtn').classList.toggle('bow-cue',ceremony==='choice'&&state.mode==='playing'&&bowCueElapsedV0251>=5);
}
const menuBowV0251=updateCeremonyMenuV09;
updateCeremonyMenuV09=function(){menuBowV0251();syncBowCueV0251();};
const gameBowV0251=updateGame;
updateGame=function(dt){
 const waiting=ceremony==='choice'&&state.mode==='playing';
 const r=gameBowV0251(dt);
 if(waiting&&ceremony==='choice')bowCueElapsedV0251+=dt;
 syncBowCueV0251();return r;
};
const pauseBowV0251=pause;
pause=function(){const r=pauseBowV0251();syncBowCueV0251();return r;};
$('#start').addEventListener('click',start);`);
 return html;
};
