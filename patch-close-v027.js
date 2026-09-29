window.otoPatchCloseV027=function(html){
 function once(a,b){if(html.split(a).length!==2)throw Error('v0.27 anchor: '+a.slice(0,60));html=html.replace(a,b);}
 once("version:'0.26.1-hit-feedback'","version:'0.27.0-close-exchange'");
 once('FIFTEENTH EVER GARDEN — v0.26.1','FIFTEENTH EVER GARDEN — v0.27.0');
 once("const cinematicV022=()=>['break','charge','shot','rush','impact','settle'].includes(duelV022.phase);","const cinematicV022=()=>['break','charge','shot','rush','impact','settle','close'].includes(duelV022.phase);");
 once('</style>',`
 #closeCall{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);z-index:6;padding:6px 12px;background:#102322ed;border:1px solid #cbb27b;border-radius:4px;text-align:center;color:#fff0ce;pointer-events:none;white-space:nowrap;font-size:18px}
 #closeCall::after{content:"";display:block;height:2px;background:#e6c987;width:var(--close-time,0%);margin-top:4px}
 #closeCall small{display:block;font-size:11px;color:#c7d9cd;margin-top:3px}
 .close-point{position:absolute;z-index:5;transform:translate(-50%,-50%);border:1px solid #b6c9be;background:#122727ed;color:#fff2d2;border-radius:6px;padding:3px 7px;font:600 18px/1.1 Georgia,serif;pointer-events:none;white-space:nowrap}
 .close-point small{font:9px sans-serif;margin-right:5px;color:#bacdc5}.close-point.correct{background:#226344;border-color:#c9f8d9}.close-point.wrong{background:#793d30}
 body.close-input [data-symbol]{border-color:#68857a;background:#17302e;color:#f3eddc;box-shadow:none}
 body.close-input [data-symbol][data-close-picked=true]{border-color:#f1c883;background:#34564a}
 #arena.close-exchange #sportFeed,#arena.close-exchange #playerLabel,#arena.close-exchange #cpuLabel{visibility:hidden}
 @media(max-height:450px){#closeCall{bottom:5px;font-size:14px;padding:3px 9px}#closeCall small{font-size:10px}.close-point{font-size:15px;padding:2px 5px}}
 </style>`);
 once("$('#start').addEventListener('click',start);",String.raw`
const closeV027={stage:'idle',time:0,turn:0,score:0,target:0,word:'',picked:-1,correct:false,cooldown:0,attempts:0,saved:null,points:[],origin:[],message:''};
const closeCallV027=document.createElement('div');closeCallV027.id='closeCall';closeCallV027.hidden=true;closeCallV027.setAttribute('aria-live','polite');$('#arena').appendChild(closeCallV027);
const closePointsV027=SOUNDS.map((s,i)=>{const e=document.createElement('div');e.className='close-point';e.hidden=true;e.innerHTML='<small>'+['頭','胸','腹','脚'][i]+'</small>/'+s.symbol+'/';$('#arena').appendChild(e);return e;});
const inCloseV027=()=>feelEnabledV023&&duelV022.phase==='close';
function closeCaptionV027(title,sub=''){closeCallV027.textContent=title;const small=document.createElement('small');small.textContent=sub;closeCallV027.appendChild(small);}
function closeCleanupV027(){closeCallV027.hidden=true;closePointsV027.forEach(e=>e.hidden=true);$('#arena').classList.remove('close-exchange');document.body.classList.remove('close-input');all('[data-symbol]').forEach((b,i)=>{delete b.dataset.closePicked;b.setAttribute('aria-pressed',String(i===state.selected));});}
const resetCloseV027=resetDuelV022;
resetDuelV022=function(keep=false){closeCleanupV027();Object.assign(closeV027,{stage:'idle',time:0,turn:0,score:0,cooldown:0,attempts:0,saved:null,points:[],picked:-1});return resetCloseV027(keep);};
function beginCloseV027(){
 const c=closeV027;c.saved={};for(const k of ['word','target','selected','shot','flightStart','duration','arc','wobble','aimZ','pendingDamage'])c.saved[k]=Array.isArray(state[k])?[...state[k]]:state[k];
 c.origin=[strideV024.player.x,strideV024.cpu.x];c.stage='enter';c.time=0;c.turn=0;c.score=0;c.picked=-1;c.attempts++;
 duelV022.phase='close';duelV022.time=0;state.pendingDamage=0;state.hitstop=0;state.pendingMiss=null;answerCardTimerV010=0;trail=[];player.kick=0;cpu.kick=0;
 strideV024.pending=false;for(const a of [strideV024.player,strideV024.cpu])a.attack=99;
 audio.stopVoice();audio.note(100,.18,.10,'triangle',0,45);closeCaptionV027('競り合い','音を聞いて、4音をタップ');audio.applyMix();
}
function askCloseV027(){
 const c=closeV027;c.stage='ask';c.time=0;c.picked=-1;c.correct=false;c.target=Math.floor(Math.random()*4);
 const words=ACTIVE_DECK.sounds[c.target].words,other=words.filter(w=>w.text!==c.word),choices=other.length?other:words;c.word=choices[Math.floor(Math.random()*choices.length)].text;
 if(!duelV022.words.includes(c.word))duelV022.words.push(c.word);
 feelV023.recent=feelV023.recent.filter(w=>w!==c.word);feelV023.recent.push(c.word);feelV023.recent=feelV023.recent.slice(-8);
 closeCaptionV027(c.turn%2?'返す':'受ける',(c.turn+1)+' / 4 · 音をタップ');
 speechV022(c.word); // same word voice, bypass only the cinematic mute guard
}
function answerCloseV027(index){
 const c=closeV027;if(!inCloseV027()||state.mode!=='playing'||c.stage!=='ask'||c.time<.25)return;
 c.picked=index;c.correct=index===c.target;c.score+=c.correct?1:0;c.stage='react';c.time=0;
 const defending=c.turn%2===0;
 c.message=c.correct?(defending?'受けた！':'通った！'):(defending?'押された':'受け止められた');
 closeCaptionV027(c.message,c.word+' · /'+SOUNDS[c.target].symbol+'/');
 audio.note(c.correct?(defending?440:110):75,.14,.075,defending?'triangle':'sine',0,c.correct?180:42);
}
const selectCloseV027=select;
select=function(index){if(inCloseV027()){answerCloseV027((index+4)%4);return;}return selectCloseV027(index);};
const kickCloseV027=kick;
kick=function(){
 if(inCloseV027())return;
 const before=state.rally,phase=duelV022.phase,r=kickCloseV027();
 if(!feelEnabledV023||phase!=='back'||state.mode!=='playing'||state.rally===before)return r;
 if(closeV027.cooldown>0)closeV027.cooldown--;
 if(duelV022.phase==='charge'){
  if(closeV027.cooldown>0){duelV022.phase='back';state.pendingDamage=0;strideV024.pending=false;stepV024('player',state.selected);audio.applyMix();}
  else beginCloseV027();
 }
 return r;
};
const speakCloseV027=speakWord;
speakWord=function(word=state.word,onDone){if(inCloseV027()){if(closeV027.stage==='ask')return speechV022(closeV027.word,onDone);return;}return speakCloseV027(word,onDone);};
const pauseCloseV027=pause;
pause=function(){const resume=state.mode==='paused',r=pauseCloseV027();if(resume&&inCloseV027()&&closeV027.stage==='ask'){closeV027.time=Math.min(closeV027.time,1.5);speechV022(closeV027.word);}return r;};
function finishCloseV027(win){
 const c=closeV027;audio.stopVoice();closeCleanupV027();
 for(const [i,key] of ['player','cpu'].entries()){
  const a=strideV024[key],x=win?(i===0?2.4:-2.4):(i===0?.6:-.6);Object.assign(a,{x,from:x,to:x,age:99,attack:99});
 }
 duelV022.spacing=(8.8+strideV024.cpu.x-strideV024.player.x)/8.8;duelV022.approach=clamp01V011((11.2-8.8*duelV022.spacing)/7.2);
 strideV024.flight=[strideV024.player.x,strideV024.cpu.x];
 all('[data-symbol]').forEach(b=>b.disabled=false);$('#kick span').textContent='返す';$('#kick small').textContent='タップで返球';
 if(win){
  Object.assign(state,c.saved);state.pendingDamage=state.cpuHp;state.direction=1;state.flight=0;state.hitstop=0;state.rescueStart=null;
  duelV022.phase='charge';duelV022.time=0;strideV024.pending=true;feelV023.pulse=0;audio.note(130,.5,.045,'sine',0,230);
 }else{
  c.cooldown=2;state.pendingDamage=0;state.pendingMiss=null;state.streak=0;state.hitstop=0;state.rescueStart=null;duelV022.phase='back';duelV022.time=0;
  cpuV016();$('#kick').disabled=false;refreshHud();
 }
 c.stage='idle';c.saved=null;audio.applyMix();
}
const gameCloseV027=updateGame;
updateGame=function(dt){
 if(!inCloseV027())return gameCloseV027(dt);
 if(state.mode!=='playing')return;
 const c=closeV027;c.time+=dt;duelV022.time+=dt;audio.update(dt,3,1);
 if(c.stage==='enter'&&c.time>=.85)askCloseV027();
 else if(c.stage==='ask'&&c.time>=3.2)answerCloseV027(-1);
 else if(c.stage==='react'&&c.time>=.8){
  c.turn++;if(c.turn<4)askCloseV027();else{c.stage=c.score>=3?'win':'lose';c.time=0;audio.stopVoice();closeCaptionV027(c.score>=3?'崩した！':'押し戻された',c.score+' / 4');audio.note(c.score>=3?80:65,.28,.1,'sine',0,30);}
 }else if((c.stage==='win'||c.stage==='lose')&&c.time>=.85)finishCloseV027(c.stage==='win');
};
const mixCloseV027=audio.applyMix.bind(audio);
audio.applyMix=function(){mixCloseV027();if(inCloseV027()&&this.ctx&&this.musicBus)this.musicBus.gain.setTargetAtTime(this.musicVolume*(this.ducked?.25:.45),this.ctx.currentTime,.07);};
const prepareCloseV027=prepareDepthRenderV022;
prepareDepthRenderV022=function(){
 prepareCloseV027();if(!inCloseV027())return;
 const c=closeV027,t=c.time,save=n=>{restoreRenderV022.push([n,n.pos,n.rot]);n.pos=[...n.pos];n.rot=[...n.rot]};
 const entering=c.stage==='enter'?smoothDepthV022(t/.85):1,leaving=['win','lose'].includes(c.stage)?smoothDepthV022(t/.85):0;
 const z=depthOffsetV022();if(motion)renderer.zoom+=.15*entering*(1-leaving);
 for(const [i,f] of [player,cpu].entries()){
  const initial=(i===0?-4.4:4.4)+c.origin[i],near=i===0?-1.4:1.4,end=c.stage==='lose'?(i===0?-3.8:3.8):(i===0?-2:2);
  f.n.pos[0]=initial+(near-initial)*entering+(end-near)*leaving;f.n.pos[2]=z;save(f.body);save(f.arm);save(f.farArm);
  f.body.pos[1]-=.08;f.arm.rot[2]+=(i===0?-.55:.55);f.farArm.rot[2]+=(i===0?.3:-.3);
 }
 if(c.stage==='react'){
  const defending=c.turn%2===0,attacker=defending?cpu:player,receiver=defending?player:cpu,pulse=Math.sin(Math.min(1,t/.8)*Math.PI);
  if(motion){const slot=defending?c.target:(c.picked<0?c.target:c.picked);strikePoseV024(attacker,{attack:t,age:99,slot:[2,1,0,3][slot]},save);attacker.n.pos[0]+=(defending?-.35:.35)*pulse;receiver.body.rot[2]+=(defending?1:-1)*pulse*(c.correct&&defending?.12:.32);receiver.n.pos[0]+=(defending?-.18:.18)*pulse;}
  if(c.correct&&defending){receiver.arm.rot[2]-=.7*pulse;receiver.farArm.rot[2]+=.4*pulse;}
 }
 if(c.stage==='win'){cpu.body.rot[2]-=.5*leaving;cpu.body.pos[1]-=.25*leaving;cpu.arm.rot[2]=0;}
 if(c.stage==='lose'&&motion){player.body.rot[2]+=.28*Math.sin(leaving*Math.PI);player.body.pos[1]-=.12*Math.sin(leaving*Math.PI);}
 ball.visible=false;shadow.visible=false;ghosts.forEach(n=>n.visible=false);
 const active=c.turn%2?cpu:player;c.points=[2.7,1.95,1.25,.55].map(y=>renderer.project([active.n.pos[0]+(c.turn%2?1.05:-1.05),y,z]));
};
const sceneCloseV027=updateScene;
updateScene=function(dt){
 sceneCloseV027(dt);const active=inCloseV027(),c=closeV027,visible=active&&state.mode==='playing';
 $('#arena').classList.toggle('close-exchange',active);document.body.classList.toggle('close-input',active);closeCallV027.hidden=!visible;if(active)closeCallV027.style.setProperty('--close-time',c.stage==='ask'?Math.max(0,100*(1-c.time/3.2))+'%':'0%');
 closePointsV027.forEach((e,i)=>{e.hidden=!visible||!['ask','react'].includes(c.stage);if(e.hidden)return;
  const p=c.points[i]||[renderer.width/2,100+i*28],height=renderer.height,gap=Math.min(30,(height-135)/3),start=Math.max(88,Math.min(height-45-3*gap,c.points[0]?.[1]||100));
  e.style.left=Math.max(43,Math.min(renderer.width-43,p[0]))+'px';e.style.top=(start+i*gap)+'px';
  e.classList.toggle('correct',c.stage==='react'&&i===c.target);e.classList.toggle('wrong',c.stage==='react'&&i===c.picked&&!c.correct);
 });
 if(active){$('#ballLabel').hidden=true;$('#practiceCard').hidden=true;wordV023.hidden=true;$('#kick').disabled=true;$('#kick span').textContent='選ぶ';$('#kick small').textContent=c.turn%2?'攻撃':'防御';$('#repeatWord').disabled=!visible||c.stage!=='ask';
 all('[data-symbol]').forEach((b,i)=>{b.disabled=!visible||c.stage!=='ask';b.dataset.closePicked=String(c.stage==='react'&&i===c.picked);b.setAttribute('aria-pressed',b.dataset.closePicked);});}
};
$('#start').addEventListener('click',start);`);
 once('select(0);refreshHud();requestAnimationFrame(frame);',`window.kemari.getClose=()=>({stage:closeV027.stage,turn:closeV027.turn,score:closeV027.score,time:closeV027.time,cooldown:closeV027.cooldown,attempts:closeV027.attempts,role:closeV027.turn%2?'attack':'defend'});
select(0);refreshHud();requestAnimationFrame(frame);`);
 return html;
};
