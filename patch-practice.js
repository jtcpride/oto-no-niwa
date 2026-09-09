window.otoPatchPractice=function(html){
// v0.8 presentation: representative word, full-word IPA during practice, and practice ceremony.
html=html.replace("v0.6 聞いて選ぶ","v0.8 PRACTICE → 本番");
html=html.replace("version:'0.6.0-listen-quiz'","version:'0.8.0-practice-time-hajime'");
html=html.replace("<small>thin</small></button><button data-symbol=\"1\"","<small>think</small></button><button data-symbol=\"1\"");
html=html.replace("/θ/ · thin —","/θ/ · think —");
html=html.replace("</style>",`.practice-card{position:absolute;left:50%;top:31%;transform:translate(-50%,-50%);z-index:3;pointer-events:none;text-align:center;padding:10px 18px 12px;border:1px solid #d9c58c;background:#142b29e8;box-shadow:0 5px 18px #0004;border-radius:6px;min-width:190px}.practice-card strong{display:block;font-size:22px;letter-spacing:.08em;font-weight:600;color:#fff5d9}.practice-card span{display:block;margin-top:3px;font:24px/1.15 Arial,sans-serif;color:#bff0d6}.practice-card small{display:block;margin-top:5px;font-size:10px;letter-spacing:.08em;color:#d6dfd4}.symbols button.tutorial-target{border-color:var(--gold);box-shadow:0 0 0 2px #f1c88366,0 0 18px #f1c88355;animation:tutorialPulse .8s ease-in-out infinite alternate}.symbols button.tutorial-dim{opacity:.24;filter:saturate(.45)}@keyframes tutorialPulse{from{transform:translateY(0)}to{transform:translateY(-3px)}}body.reduced-motion .symbols button.tutorial-target{animation:none}@media(max-width:680px){.practice-card{top:34%;padding:8px 14px 10px;min-width:160px}.practice-card strong{font-size:18px}.practice-card span{font-size:21px}}</style>`);
html=html.replace("<div id=\"feedback\" class=\"feedback\" aria-live=\"polite\"></div>","<div id=\"feedback\" class=\"feedback\" aria-live=\"polite\"></div><div id=\"practiceCard\" class=\"practice-card\" hidden aria-hidden=\"true\"><strong>think</strong><span>/θɪŋk/</span><small>狙い /θ/</small></div>");
html=html.replace("$('#ballLabel').textContent=state.direction===-1?'?':`/${SOUNDS[state.target].symbol}/`;","$('#ballLabel').textContent=ballPrompt();");
html=html.replace("聞く → 合わせる → 返す → 続く → 速くなる","PRACTICE → TIME → HAJIME!!! → 聞く → 返す");

const marker="$('#start').addEventListener('click',start);";
const v08=`
const PRACTICE_SET=[{word:'think',ipa:'/θɪŋk/'},{word:'this',ipa:'/ðɪs/'},{word:'ship',ipa:'/ʃɪp/'},{word:'vision',ipa:'/ˈvɪʒən/'}];
const PRACTICE_TURNS=8,NORMAL_HIT_WINDOW=CONFIG.hitWindow;let practiceTurn=0,ceremony='practice',ceremonyTimer=0;const practiceSlot=()=>practiceTurn%4,practiceRound=()=>Math.floor(practiceTurn/4)+1;
function ballPrompt(){if(ceremony==='time'||ceremony==='hajime')return '';if(state.direction===-1)return ceremony==='practice'?\`/\${SOUNDS[state.target].symbol}/\`:'?';return \`/\${SOUNDS[state.target].symbol}/\`;}
function updatePracticeCard(){const card=$('#practiceCard'),active=ceremony==='practice'&&practiceTurn<PRACTICE_TURNS;card.hidden=!active;card.setAttribute('aria-hidden',String(!active));if(!active)return;const slot=practiceSlot(),p=PRACTICE_SET[slot];card.innerHTML=\`<strong>\${p.word}</strong><span>\${p.ipa}</span><small>狙い /\${SOUNDS[slot].symbol}/ · \${practiceRound()}周目</small>\`;}
function applyPracticeUI(){const active=ceremony==='practice'&&practiceTurn<PRACTICE_TURNS,slot=practiceSlot();all('[data-symbol]').forEach((b,i)=>{b.classList.toggle('tutorial-target',active&&i===slot);b.classList.toggle('tutorial-dim',active&&i!==slot);b.disabled=(ceremony==='time'||ceremony==='hajime')||(active&&i!==slot);});$('#repeatWord').disabled=ceremony==='time'||ceremony==='hajime';updatePracticeCard();if(active){$('#phaseNo').textContent='00';$('#phaseName').textContent='PRACTICE';$('#phaseHint').textContent=practiceRound()+' / 2 · '+(slot+1)+' / 4 · 聞いて、同じ場所を踏む。';$('#timingText').textContent='まずは音と場所を結ぶ';$('#rally').textContent='--';}else if(ceremony==='time'){$('#phaseNo').textContent='--';$('#phaseName').textContent='TIME';$('#phaseHint').textContent='打てる。でも、打たない。';$('#rally').textContent='--';}else if(ceremony==='hajime'){$('#phaseNo').textContent='--';$('#phaseName').textContent='HAJIME';$('#phaseHint').textContent='';$('#rally').textContent='--';}}
const _newQuestionV06=newQuestion;newQuestion=function(){if(ceremony==='practice'&&practiceTurn<PRACTICE_TURNS){const slot=practiceSlot();state.target=slot;state.word=PRACTICE_SET[slot].word;lastWord[slot]=state.word;$('#repeatWord').disabled=false;}else _newQuestionV06();applyPracticeUI();};
const _refreshHudV06=refreshHud;refreshHud=function(){_refreshHudV06();if(ceremony!=='match')applyPracticeUI();};
const _startV06=start;start=function(){practiceTurn=0;ceremony='practice';ceremonyTimer=0;CONFIG.hitWindow=.36;const r=_startV06();state.duration=Math.max(state.duration,2.18);state.elapsed=0;applyPracticeUI();announce('PRACTICE 1 / 2','think · '+PRACTICE_SET[0].ipa+' · /'+SOUNDS[0].symbol+'/',1.15);return r;};
function beginTimePass(){ceremony='time';CONFIG.hitWindow=NORMAL_HIT_WINDOW;state.pendingMiss=null;state.streak=0;$('#kick').disabled=true;$('#repeatWord').disabled=true;cpu.kick=.34;cpu.shot='normal';launchShot('normal',-1,[3.3,1.2,0]);state.duration=Math.max(1.75,state.duration);state.aimZ=0;applyPracticeUI();announce('TIME','',1.05);audio.hit(false,0,false);}
function beginHajime(){ceremony='hajime';ceremonyTimer=.72;state.pendingMiss=null;$('#kick').disabled=true;applyPracticeUI();announce('HAJIME!!!','',.72);}
function beginMatch(){ceremony='match';ceremonyTimer=0;CONFIG.hitWindow=NORMAL_HIT_WINDOW;Object.assign(state,{rally:0,perfect:0,streak:0,elapsed:0,hp:CONFIG.maxHp,misses:0,rescues:0,pendingMiss:null,hurt:0,rescueStart:null});all('[data-symbol]').forEach(b=>b.disabled=false);$('#repeatWord').disabled=false;$('#kick').disabled=false;$('#practiceCard').hidden=true;newQuestion();cpu.kick=.34;cpu.shot='normal';launchShot('normal',-1,[3.3,1.2,0]);audio.hit(false,0,false);speakWord();refreshHud();$('#time').textContent=CONFIG.maxSeconds;announce('LISTEN','ここからは、音だけで返す。',.8);}
const _cpuReturnV06=cpuReturn;cpuReturn=function(){if(ceremony==='practice'&&practiceTurn<PRACTICE_TURNS){if(practiceTurn===PRACTICE_TURNS-1){practiceTurn++;beginTimePass();return;}practiceTurn++;const r=_cpuReturnV06();state.duration=Math.max(state.duration,2.18);applyPracticeUI();const slot=practiceSlot(),round=practiceRound();announce('PRACTICE '+round+' / 2',PRACTICE_SET[slot].word+' · '+PRACTICE_SET[slot].ipa+' · /'+SOUNDS[slot].symbol+'/',.92);return r;}return _cpuReturnV06();};
const _kickV06=kick;kick=function(){if(ceremony==='time'||ceremony==='hajime')return;const practice=ceremony==='practice',rallyBefore=state.rally,perfectBefore=state.perfect;const r=_kickV06();if(practice&&state.rally>rallyBefore){state.rally=rallyBefore;state.perfect=perfectBefore;state.streak=0;refreshHud();}return r;};
const _rescueV06=rescue;rescue=function(kind){if(ceremony==='time'||ceremony==='hajime')return;const practice=ceremony==='practice',hpBefore=state.hp,missBefore=state.misses;const r=_rescueV06(kind);if(practice&&state.mode!=='over'){state.hp=hpBefore;state.misses=missBefore;refreshHp();announce('PRACTICE','ここでは体力は減らない。次の音へ。',.95);}return r;};
const _updateGameV06=updateGame;updateGame=function(dt){if(ceremony==='time'&&state.mode==='playing'){state.flight+=dt;state.aimZ+=(0-state.aimZ)*Math.min(1,dt*5);$('#time').textContent='--';if(state.flight>state.duration+.38)beginHajime();return;}if(ceremony==='hajime'&&state.mode==='playing'){ceremonyTimer-=dt;$('#time').textContent='--';if(ceremonyTimer<=0)beginMatch();return;}if(ceremony==='practice'){const elapsedBefore=state.elapsed,modeBefore=state.mode;_updateGameV06(dt);state.elapsed=elapsedBefore;$('#time').textContent='--';if(modeBefore==='ready'&&state.mode==='playing'){applyPracticeUI();announce('PRACTICE '+practiceRound()+' / 2',PRACTICE_SET[practiceSlot()].word+' · '+PRACTICE_SET[practiceSlot()].ipa,1.0);}return;}_updateGameV06(dt);};
`;
html=html.replace(marker,v08+'\n'+marker);

// v0.9 — TIME becomes a small pre-match decision: repeat practice, or bow.
// Bowing commits toward the match, but another bow resets the quiet wait, so it can continue indefinitely.
html=html.replace("v0.8 PRACTICE → 本番","v0.9 PRACTICE → TIME → 礼 → HAJIME");
html=html.replace("PRACTICE → TIME → HAJIME!!! → 聞く → 返す","PRACTICE → TIME → 礼 → HAJIME!!! → 聞く → 返す");
html=html.replace("version:'0.8.0-practice-time-hajime'","version:'0.9.0-time-rei-hajime'");
html=html.replace("TIMEの一球は見送る。HAJIME!!! から本番。","TIMEの一球は見送る。その後は「礼」か「もう一回練習」。礼のあとは静かな間を置いてHAJIME!!!。");
html=html.replace("body.reduced-motion .symbols button.tutorial-target{animation:none}","body.reduced-motion .symbols button.tutorial-target{animation:none}.ceremony-menu{position:absolute;left:50%;bottom:58px;transform:translateX(-50%);z-index:4;display:flex;gap:10px;align-items:center;justify-content:center;padding:8px;background:#102725d9;border:1px solid #78938788;border-radius:6px;box-shadow:0 6px 20px #0004}.ceremony-menu button{min-width:132px;min-height:46px;padding:10px 14px;border-radius:4px;border:1px solid #d8c28c;background:#f3eddc;color:#20342c;font-weight:600;letter-spacing:.06em}.ceremony-menu button.secondary{background:transparent;color:#f3eddc;border-color:#789a8a}.ceremony-menu button:hover{border-color:var(--gold)}@media(max-width:680px){.ceremony-menu{bottom:48px;width:calc(100% - 28px)}.ceremony-menu button{flex:1;min-width:0;font-size:12px;padding:8px 10px}}");
html=html.replace('<div id="practiceCard" class="practice-card" hidden aria-hidden="true"><strong>think</strong><span>/θɪŋk/</span><small>狙い /θ/</small></div>','<div id="practiceCard" class="practice-card" hidden aria-hidden="true"><strong>think</strong><span>/θɪŋk/</span><small>狙い /θ/</small></div><div id="ceremonyMenu" class="ceremony-menu" hidden aria-label="TIME後の選択"><button id="bowBtn" type="button">礼</button><button id="practiceAgain" class="secondary" type="button">もう一回練習</button></div>');
// Bow pose must be applied after footwork has established the current body pose and before render.
html=html.replace("poseFoot(dt);const hurt=motion?state.hurt:0;","poseFoot(dt);applyBowPose();const hurt=motion?state.hurt:0;");
const v09Marker="$('#start').addEventListener('click',start);";
const v09=`
const BOW_DURATION=1.28,BOW_TO_HAJIME=2.45;
let bowAnim=0,bowWait=0;
const _ballPromptV08=ballPrompt;
ballPrompt=function(){if(ceremony==='choice'||ceremony==='bow-wait')return '';return _ballPromptV08();};
function updateCeremonyMenuV09(){const menu=$('#ceremonyMenu'),show=ceremony==='choice'||ceremony==='bow-wait';menu.hidden=!show;$('#practiceAgain').hidden=ceremony==='bow-wait';}
const _applyPracticeUIV08=applyPracticeUI;
applyPracticeUI=function(){_applyPracticeUIV08();const locked=ceremony==='choice'||ceremony==='bow-wait';if(locked){all('[data-symbol]').forEach(b=>b.disabled=true);$('#repeatWord').disabled=true;$('#kick').disabled=true;$('#phaseNo').textContent='--';$('#phaseName').textContent='TIME';$('#phaseHint').textContent='';$('#rally').textContent='--';}updateCeremonyMenuV09();};
function enterTimeChoiceV09(){ceremony='choice';bowAnim=0;bowWait=0;state.pendingMiss=null;$('#kick').disabled=true;applyPracticeUI();announce('TIME','',.55);}
const _beginHajimeV08=beginHajime;
beginHajime=function(){if(ceremony==='time'){enterTimeChoiceV09();return;}return _beginHajimeV08();};
function bowV09(){if(ceremony!=='choice'&&ceremony!=='bow-wait')return;ceremony='bow-wait';bowAnim=BOW_DURATION;bowWait=BOW_TO_HAJIME;state.pendingMiss=null;$('#kick').disabled=true;applyPracticeUI();}
function applyBowPose(){if(bowAnim<=0)return;const t=1-bowAnim/BOW_DURATION,k=Math.sin(Math.PI*Math.max(0,Math.min(1,t)));player.body.rot[2]-=k*.62;player.body.pos[1]-=k*.08;player.head.rot[2]+=k*.22;player.arm.rot[2]-=k*.14;player.farArm.rot[2]+=k*.10;}
const _updateGameV08=updateGame;
updateGame=function(dt){if(ceremony==='choice'&&state.mode==='playing'){$('#time').textContent='--';$('#timingText').textContent='';return;}if(ceremony==='bow-wait'&&state.mode==='playing'){bowAnim=Math.max(0,bowAnim-dt);bowWait-=dt;$('#time').textContent='--';$('#timingText').textContent='';if(bowWait<=0)beginHajime();return;}_updateGameV08(dt);};
const _kickV08=kick;kick=function(){if(ceremony==='choice'||ceremony==='bow-wait')return;return _kickV08();};
const _rescueV08=rescue;rescue=function(kind){if(ceremony==='choice'||ceremony==='bow-wait')return;return _rescueV08(kind);};
$('#bowBtn').addEventListener('click',bowV09);
$('#practiceAgain').addEventListener('click',()=>{if(ceremony==='choice')start();});
`;
html=html.replace(v09Marker,v09+'\n'+v09Marker);
return html;
};