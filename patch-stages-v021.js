window.otoPatchStagesV021=function(html){
const content=window.validateFEGContent(window.FEGContent,window.FEGCharacterRigs);
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.21 patch anchor: '+from.slice(0,72));html=html.replace(from,to);}
function declaration(name,to){const match=html.match(new RegExp('const '+name+'=[^\\n]+;'));if(!match)throw new Error('v0.21 missing '+name);replaceOnce(match[0],to);}
replaceOnce("version:'0.20.0-fifteenth-ever-garden'","version:'0.21.0-stage-modules'");
replaceOnce('FIFTEENTH EVER GARDEN — v0.20.0','FIFTEENTH EVER GARDEN — v0.21.0');
declaration('SOUNDS',`const STAGE_CONTENT=${json(content)};
const requestedStage=window.location?new URLSearchParams(window.location.search).get('stage'):null;
const ACTIVE_STAGE=STAGE_CONTENT.stages.find(s=>s.id===requestedStage)||STAGE_CONTENT.stages[0];
const ACTIVE_DECK=STAGE_CONTENT.decks.find(d=>d.id===ACTIVE_STAGE.deck);
const PLAYER_CHARACTER=STAGE_CONTENT.characters.find(c=>c.id===ACTIVE_STAGE.player);
const CPU_CHARACTER=STAGE_CONTENT.characters.find(c=>c.id===ACTIVE_STAGE.opponent);
const SOUNDS=ACTIVE_DECK.sounds.map(s=>({symbol:s.symbol,word:s.example,tip:s.tip,words:s.words.map(w=>w.text)}));`);
declaration('PRACTICE_SET','const PRACTICE_SET=ACTIVE_DECK.sounds.map(s=>{const w=s.words.find(w=>w.text===s.practice);return {word:w.text,ipa:w.ipa}});');
declaration('WORD_IPA_V010','const WORD_IPA_V010=Object.fromEntries(ACTIVE_DECK.sounds.flatMap(s=>s.words.map(w=>[w.text,w.ipa])));');
replaceOnce("'think · '+PRACTICE_SET[0].ipa","PRACTICE_SET[0].word+' · '+PRACTICE_SET[0].ipa");
const rigStart=html.indexOf('function fighter(x,tint,trim,face){'),rigEnd=html.indexOf('\nconst player=fighter(',rigStart);
if(rigStart<0||rigEnd<0)throw new Error('v0.21 missing fighter factory');
const rigSources=Object.entries(window.FEGCharacterRigs).map(([id,fn])=>json(id)+':'+fn.toString()).join(',');
replaceOnce(html.slice(rigStart,rigEnd),`const CHARACTER_RIGS={${rigSources}};
function fighter(x,character,face){
 const actor=CHARACTER_RIGS[character.rig]({root,group,mesh},x,character.appearance,face);
 for(const joint of ['n','body','head','arm','farArm','leg','back','thigh','knee','shoe','backThigh','backKnee','backShoe']){
  if(!actor?.[joint]?.pos||!actor[joint].rot)throw new Error('Character rig '+character.rig+' missing joint '+joint);
 }
 return actor;
}`);
replaceOnce("const player=fighter(-4.4,'#658f7f','#d3bd89',1),cpu=fighter(4.4,'#ab624b','#d9bd81',-1);","const player=fighter(-4.4,PLAYER_CHARACTER,1),cpu=fighter(4.4,CPU_CHARACTER,-1);");
replaceOnce('<button id="start" class="primary">','<label class="stage-picker" for="stageSelect">STAGE<select id="stageSelect" aria-label="ステージを選ぶ"></select></label><button id="start" class="primary">');
replaceOnce('<button id="restart" class="primary">もう一度 <span>↗</span></button>','<button id="restart" class="primary">もう一度 <span>↗</span></button><button id="stageMenu" class="stage-menu" type="button">ステージを選ぶ</button>');
replaceOnce('一ノ庭 / FIRST COURT <b id="shotType">','<span id="stageName"></span> <b id="shotType">');
replaceOnce('</style>',`\n.stage-picker{display:block;max-width:320px;margin:0 0 12px;color:var(--muted);font-size:11px;letter-spacing:.08em}
.stage-picker select{display:block;box-sizing:border-box;width:100%;min-height:44px;margin-top:4px;padding:8px;border:1px solid #789a8a;border-radius:4px;background:#17302e;color:var(--paper);font:inherit;font-size:14px;letter-spacing:0}
.stage-menu{display:block;min-height:44px;margin:8px auto 0;padding:8px 14px;background:transparent;color:var(--paper);border:1px solid #789a8a;border-radius:4px}
@media(max-width:680px){.stage-picker{max-width:none;margin-bottom:8px}}
</style>`);
replaceOnce("titlePendingV020=true;$('#start').disabled=true;","titlePendingV020=true;$('#start').disabled=true;$('#stageSelect').disabled=true;");
replaceOnce("$('#start').addEventListener('click',start);",String.raw`
// Select before scene creation; a new page clears speech, poses, retries, practice and HP together.
function stageUrlV021(id){const url=new URL(window.location.href);url.searchParams.set('stage',id);return url.href;}
const stagePickerV021=$('#stageSelect');
for(const [i,stage] of STAGE_CONTENT.stages.entries()){
 const deck=STAGE_CONTENT.decks.find(d=>d.id===stage.deck),option=document.createElement('option');
 option.value=stage.id;option.textContent=String(i+1).padStart(2,'0')+' · '+stage.name+' · '+deck.sounds.map(s=>'/'+s.symbol+'/').join(' ');stagePickerV021.appendChild(option);
}
stagePickerV021.value=ACTIVE_STAGE.id;
stagePickerV021.addEventListener('change',()=>{if(titlePendingV020)return;audio.stopVoice();window.location.assign(stageUrlV021(stagePickerV021.value));});
$('#stageMenu').addEventListener('click',()=>{audio.stopVoice();window.location.assign(stageUrlV021(ACTIVE_STAGE.id));});
$('#stageName').textContent=ACTIVE_STAGE.name;
$('.player-name .eyebrow').textContent='PLAYER / '+PLAYER_CHARACTER.name;
$('.cpu-name .eyebrow').textContent='CPU / '+CPU_CHARACTER.name;
for(const [i,sound] of ACTIVE_DECK.sounds.entries()){
 $('[data-symbol="'+i+'"] span').textContent='/'+sound.symbol+'/';
 $('[data-symbol="'+i+'"] small').textContent=sound.practice;
}
$('#ballLabel').textContent='/'+SOUNDS[0].symbol+'/';
$('#start').addEventListener('click',start);`);
replaceOnce('select(0);refreshHud();requestAnimationFrame(frame);',`window.kemari.getStage=()=>({id:ACTIVE_STAGE.id,name:ACTIVE_STAGE.name,deck:ACTIVE_STAGE.deck,player:ACTIVE_STAGE.player,opponent:ACTIVE_STAGE.opponent,symbols:SOUNDS.map(s=>s.symbol)});
select(0);refreshHud();requestAnimationFrame(frame);`);
return html;
};
