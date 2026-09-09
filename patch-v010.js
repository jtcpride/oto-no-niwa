window.otoPatchV010=function(html){
// v0.10 — stronger ceremony, centered answer feedback, retry queue, body-return misses, and 2.5D knockdown.
const marker="$('#start').addEventListener('click',start);";
html=html.replace("v0.9 PRACTICE → TIME → 礼 → HAJIME","v0.10 PRACTICE → TIME → 礼 → HAJIME");
html=html.replace("version:'0.9.0-time-rei-hajime'","version:'0.10.0-feedback-retry-ukemi'");
html=html.replace("body.reduced-motion .symbols button.tutorial-target{animation:none}","body.reduced-motion .symbols button.tutorial-target{animation:none}.practice-card.answer-card{border-color:#9fd8bd;background:#102b28ed;box-shadow:0 5px 18px #0004,0 0 22px #9fd8bd22}.practice-card.answer-card small{color:#f1c883}#arena.body-hit{box-shadow:inset 0 0 0 3px #e9c58b}");
const v010=`
const WORD_IPA_V010={think:'/θɪŋk/',thin:'/θɪn/',thank:'/θæŋk/',three:'/θriː/',bath:'/bæθ/',mouth:'/maʊθ/',this:'/ðɪs/',that:'/ðæt/',these:'/ðiːz/',those:'/ðoʊz/',mother:'/ˈmʌðər/',weather:'/ˈwɛðər/',ship:'/ʃɪp/',shop:'/ʃɑp/',she:'/ʃiː/',shoe:'/ʃuː/',fish:'/fɪʃ/',wash:'/wɑʃ/',vision:'/ˈvɪʒən/',measure:'/ˈmɛʒər/',usual:'/ˈjuːʒuəl/',pleasure:'/ˈplɛʒər/',decision:'/dɪˈsɪʒən/',television:'/ˈtɛləˌvɪʒən/'};
let answerCardTimerV010=0,answerCardCorrectV010=true,retryQueueV010=[],questionSerialV010=0,consecutiveFailsV010=0,bodyHitV010=0,knockdownV010=0,knockDirV010=1;
const KNOCKDOWN_DURATION_V010=1.28;
function speakCallV010(text){if(!text||!('speechSynthesis' in window))return;try{window.speechSynthesis.cancel();window.speechSynthesis.resume();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.72;u.pitch=.82;u.volume=1;const voices=window.speechSynthesis.getVoices();const preferred=voices.find(v=>/^en-US/i.test(v.lang)&&/Daniel|Alex|Fred|Aaron/i.test(v.name))||voices.find(v=>/^en-US/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));if(preferred)u.voice=preferred;window.speechSynthesis.speak(u);}catch(e){console.warn('ceremony speech failed',e);}}
function queueRetryV010(){if(ceremony!=='match')return;retryQueueV010=retryQueueV010.filter(q=>!(q.target===state.target&&q.word===state.word));retryQueueV010.push({target:state.target,word:state.word,due:questionSerialV010+2});}
const _newQuestionV09=newQuestion;
newQuestion=function(){if(ceremony==='match'){questionSerialV010++;const i=retryQueueV010.findIndex(q=>q.due<=questionSerialV010);if(i>=0){const q=retryQueueV010.splice(i,1)[0];state.target=q.target;state.word=q.word;state.isRetry=true;lastWord[state.target]=state.word;$('#repeatWord').disabled=false;applyPracticeUI();return;}}state.isRetry=false;return _newQuestionV09();};
const _updatePracticeCardV09=updatePracticeCard;
updatePracticeCard=function(){const card=$('#practiceCard');if(ceremony==='match'&&answerCardTimerV010>0){card.hidden=false;card.setAttribute('aria-hidden','false');card.classList.add('answer-card');const ipa=WORD_IPA_V010[state.word]||('/'+SOUNDS[state.target].symbol+'/');card.innerHTML='<strong>'+state.word+'</strong><span>'+ipa+'</span><small>'+(answerCardCorrectV010?'正解':'正しくは')+' /'+SOUNDS[state.target].symbol+'/'+(state.isRetry?' · RETRY':'')+'</small>';return;}card.classList.remove('answer-card');return _updatePracticeCardV09();};
function showAnswerCardV010(correct){if(ceremony!=='match')return;answerCardCorrectV010=!!correct;answerCardTimerV010=correct?1.05:1.35;updatePracticeCard();}
const _sampleBallV09=sampleBall;
sampleBall=function(progress=state.flight/state.duration){if(ceremony==='time'&&progress>1){const r=Math.min(1,(progress-1)/.52),targetZ=state.aimZ||0;return [-3.3-3.0*r,.26+Math.abs(Math.sin(r*Math.PI*3))*.035*(1-r),targetZ];}return _sampleBallV09(progress);};
const _beginTimePassV09=beginTimePass;
beginTimePass=function(){const r=_beginTimePassV09();speakCallV010('Time!');return r;};
$('#bowBtn').addEventListener('click',()=>{if(ceremony==='bow-wait')bowWait=3.65;});
const _beginHajimeV09=beginHajime;
beginHajime=function(){const r=_beginHajimeV09();ceremonyTimer=.95;speakCallV010('Hajime!');return r;};
const _beginMatchV09=beginMatch;
beginMatch=function(){retryQueueV010=[];questionSerialV010=0;consecutiveFailsV010=0;answerCardTimerV010=0;knockdownV010=0;bodyHitV010=0;return _beginMatchV09();};
const _startV09=start;
start=function(){retryQueueV010=[];questionSerialV010=0;consecutiveFailsV010=0;answerCardTimerV010=0;knockdownV010=0;bodyHitV010=0;return _startV09();};
const _kickV09=kick;
kick=function(){const before=state.rally;const r=_kickV09();if(ceremony==='match'&&state.rally>before){consecutiveFailsV010=0;showAnswerCardV010(true);}return r;};
const _rescueV09=rescue;
rescue=function(kind){const before=state.misses,word=state.word,target=state.target;const r=_rescueV09(kind);if(ceremony==='match'&&state.misses>before&&state.mode!=='over'){queueRetryV010();consecutiveFailsV010++;player.kick=0;bodyHitV010=.62;state.flightStart=[player.n.pos[0]+.18,1.36,player.n.pos[2]];state.flight=0;previousBall=[...state.flightStart];showAnswerCardV010(false);const reason=kind==='symbol'?word+' → /'+SOUNDS[target].symbol+'/':kind==='early'?'少し早かった':'間に合わなかった';announce('BODY RETURN',reason+' · 体力 −'+CONFIG.missDamage,1.25);if(consecutiveFailsV010%3===0){knockdownV010=KNOCKDOWN_DURATION_V010;knockDirV010=state.misses%2?1:-1;state.hitstop=Math.max(state.hitstop,1.05);announce('DOWN',reason+' · 三連続ミス',1.05);audio.fail();}}return r;};
const _applyBowPoseV09=applyBowPose;
applyBowPose=function(){_applyBowPoseV09();if(bowAnim>0){const t=1-bowAnim/BOW_DURATION,k=Math.sin(Math.PI*Math.max(0,Math.min(1,t)));cpu.body.rot[2]-=k*.62;cpu.body.pos[1]-=k*.08;cpu.head.rot[2]+=k*.22;cpu.arm.rot[2]-=k*.14;cpu.farArm.rot[2]+=k*.10;}if(bodyHitV010>0){const k=Math.sin(bodyHitV010/.62*Math.PI);player.n.pos[0]-=k*.16;player.head.rot[2]+=k*.18;}if(knockdownV010>0){const t=1-knockdownV010/KNOCKDOWN_DURATION_V010,travel=Math.sin(Math.min(1,t/.72)*Math.PI/2),drop=Math.sin(Math.min(1,t/.58)*Math.PI/2);player.n.pos[2]+=knockDirV010*2.0*travel;player.body.pos[1]-=.48*drop;player.body.rot[0]+=knockDirV010*Math.PI*1.45*travel;player.body.rot[2]+=knockDirV010*.55*travel;player.arm.rot[2]-=knockDirV010*.9*travel;player.farArm.rot[2]+=knockDirV010*.7*travel;}};
const _updateGameV09=updateGame;
updateGame=function(dt){if(ceremony==='time'&&state.mode==='playing'){state.flight+=dt;state.aimZ+=(0-state.aimZ)*Math.min(1,dt*5);$('#time').textContent='--';if(state.flight>state.duration+.92)enterTimeChoiceV09();return;}const r=_updateGameV09(dt);if(ceremony==='match'){if(answerCardTimerV010>0){answerCardTimerV010=Math.max(0,answerCardTimerV010-dt);if(answerCardTimerV010===0)updatePracticeCard();}bodyHitV010=Math.max(0,bodyHitV010-dt);knockdownV010=Math.max(0,knockdownV010-dt);}return r;};
`;
html=html.replace(marker,v010+'\n'+marker);
return html;
};
