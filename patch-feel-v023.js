// One-court presentation study. Keep logical flight paths and answer windows intact.
window.otoPatchFeelV023=function(html){
 function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.23 patch anchor: '+from.slice(0,72));html=html.replace(from,to);}
 replaceOnce("version:'0.22.0-depth-rush'","version:'0.23.0-match-feel'");
 replaceOnce('FIFTEENTH EVER GARDEN — v0.22.0','FIFTEENTH EVER GARDEN — v0.23.0');
 replaceOnce("const cinematicV022=()=>['break','charge','shot','rush'].includes(duelV022.phase);","const cinematicV022=()=>['break','charge','shot','rush','impact','settle'].includes(duelV022.phase);");
 replaceOnce("if(duelV022.phase==='back')duelV022.approach=Math.min(1,duelV022.approach+.25);","if(duelV022.phase==='back')duelV022.approach=Math.min(1,duelV022.approach+(feelEnabledV023?.5:.25));\n  if(feelEnabledV023){feelV023.resumePhase=duelV022.phase;duelV022.phase='impact';duelV022.time=0;cpu.kick=0;feelV023.pulse=.3;audio.note(92,.18,.12,'sine',0,42);return;}");
 replaceOnce("const target=1.12-.42*duelV022.approach;","const target=1.12-(feelEnabledV023?.65:.42)*duelV022.approach;");
 replaceOnce('for(const [n,pos,rot] of restoreRenderV022)', 'for(const [n,pos,rot] of [...restoreRenderV022].reverse())');
 replaceOnce('</style>',String.raw`
 #duelWord{position:absolute;z-index:4;left:50%;top:25%;transform:translateX(-50%);pointer-events:none;text-align:center;color:#fff1cb;text-shadow:0 2px 5px #101b20;font:600 clamp(24px,4vw,40px)/1.1 Georgia,serif;white-space:nowrap}
 #duelWord small{display:block;font:10px/1.8 sans-serif;letter-spacing:.14em;color:#ffe4a2}
 #duelWord[hidden]{display:none}.duel-word-ball{position:absolute;z-index:3;pointer-events:none;transform:translate(-50%,-140%);padding:2px 6px;border-radius:3px;background:#172328dc;color:#fff4d2;font:15px Georgia,serif}
 #arena.duel-pressure{box-shadow:inset 0 0 48px #0a101e70}#arena.duel-finisher .timing{border-color:#f0d693}
 @media(max-height:500px){#duelWord{top:74px;font-size:22px}.duel-word-ball{font-size:12px}}
 </style>`);
 replaceOnce("$('#start').addEventListener('click',start);",String.raw`
const feelEnabledV023=ACTIVE_STAGE.id==='first-court';
const feelV023={pulse:0,resumePhase:'front',recent:[],word:'',voiceAge:99,voiceDone:true,voiceSerial:0,voiceIndex:0,kickAge:99};
const wordV023=document.createElement('div');wordV023.id='duelWord';wordV023.hidden=true;$('#arena').appendChild(wordV023);
const wordBallsV023=feelEnabledV023?rushBallsV022.map(()=>{const e=document.createElement('span');e.className='duel-word-ball';e.hidden=true;$('#arena').appendChild(e);return e;}):[];
const easeV023=(t,a,b)=>smoothDepthV022((t-a)/(b-a));
const resetV023=resetDuelV022;
resetDuelV022=function(keepWords=false){
 resetV023(keepWords);Object.assign(feelV023,{pulse:0,resumePhase:'front',recent:[],word:'',voiceAge:99,voiceDone:true,voiceSerial:feelV023.voiceSerial+1,voiceIndex:0,kickAge:99});
 wordV023.hidden=true;wordBallsV023.forEach(e=>e.hidden=true);$('#arena').classList.remove('duel-pressure','duel-finisher');audio.applyMix();
};
const questionV023=newQuestion;
newQuestion=function(){const r=questionV023();if(feelEnabledV023&&ceremony==='match'&&state.word){feelV023.recent=feelV023.recent.filter(w=>w!==state.word);feelV023.recent.push(state.word);feelV023.recent=feelV023.recent.slice(-8);}return r;};
const depthV023=beginDepthV022;
beginDepthV022=function(){depthV023();if(!feelEnabledV023)return;feelV023.pulse=.45;cpu.kick=0;announce('','',0);audio.note(64,.45,.16,'sine',0,28);audio.applyMix();};
const rushV023=beginRushV022;
beginRushV022=function(){rushV023();if(!feelEnabledV023)return;feelV023.pulse=.5;feelV023.voiceAge=99;feelV023.voiceDone=true;feelV023.voiceIndex=0;feelV023.word='';duelV022.rushRemaining=5;$('#kick').disabled=true;announce('','',0);audio.applyMix();};
// Music recedes during anticipation and speech. Effects retain their attack, at a bounded gain.
const mixV023=audio.applyMix.bind(audio);
audio.applyMix=function(){mixV023();if(!feelEnabledV023||!this.ctx||!this.musicBus)return;
 const phase=duelV022.phase,factor=['charge','settle'].includes(phase)?.18:phase==='break'?.48:phase==='rush'?(this.ducked?.40:.85):1;
 this.musicBus.gain.setTargetAtTime(this.musicVolume*(this.ducked?.60:1)*factor,this.ctx.currentTime,.07);
};
const kickV023=kick;
kick=function(){
 if(!feelEnabledV023)return kickV023();
 if(state.mode!=='playing')return;
 if(duelV022.phase==='rush'){
  if(duelV022.time<.35||duelV022.time>=5.35)return;
  const words=feelV023.recent.length?feelV023.recent:[state.word];
  // No queue: rapid taps fire the current word. Advance only after a recognizable utterance.
  if(feelV023.voiceAge>=.65&&(feelV023.voiceDone||feelV023.voiceAge>=1.25)){
   const word=words[(words.length-1-feelV023.voiceIndex%words.length+words.length)%words.length];
   feelV023.voiceIndex++;feelV023.word=word;feelV023.voiceAge=0;feelV023.voiceDone=false;
   const serial=++feelV023.voiceSerial;rushSpeechV022=true;
   try{speakWord(word,()=>{if(serial===feelV023.voiceSerial)feelV023.voiceDone=true;});}finally{rushSpeechV022=false;}
  }
  const index=duelV022.taps++,p=rushBallsV022[index%rushBallsV022.length];
  p.age=0;p.slot=index%4;p.word=feelV023.word;p.n.visible=true;
  // Each tap recoils the body; the leg can complete its stroke rather than freeze at the start.
  if(feelV023.kickAge>=.15){player.kick=.48;player.kickSlot=index%4;player.shot='perfect';player.contactV012=[-3.78+foot.x,.68,foot.z*.72];feelV023.kickAge=0;}
  feelV023.pulse=Math.max(feelV023.pulse,.14);audio.note(145+(index%3)*25,.09,.065,'triangle',0,48);
  return;
 }
 const before=duelV022.phase,r=kickV023();
 if(duelV022.phase==='charge'&&before!=='charge'){announce('','',0);feelV023.pulse=0;audio.applyMix();audio.note(130,.5,.045,'sine',0,230);}
 return r;
};
const cpuV023=cpuReturn;
cpuReturn=function(){if(feelEnabledV023&&cinematicV022()&&duelV022.phase!=='shot')return;return cpuV023();};
const gameV023=updateGame;
updateGame=function(dt){
 if(!feelEnabledV023)return gameV023(dt);
 if(state.mode==='paused')return;
 feelV023.pulse=Math.max(0,feelV023.pulse-dt);feelV023.voiceAge+=dt;feelV023.kickAge+=dt;
 const p=duelV022.phase;
 if(state.mode==='playing'&&p==='impact'){
  duelV022.time+=dt;if(duelV022.time>=.24){duelV022.phase=feelV023.resumePhase;duelV022.time=0;cpuV016();}return;
 }
 if(state.mode==='playing'&&p==='break'){
  duelV022.time+=dt;
  if(duelV022.time>=(motion?2.65:.6)){duelV022.phase='back';duelV022.time=0;duelV022.spacing=1.12;trail=[];cpuV016();$('#kick').disabled=false;audio.applyMix();}
  return;
 }
 if(state.mode==='playing'&&p==='rush'){
  duelV022.time+=dt;duelV022.rushRemaining=Math.max(0,5.35-duelV022.time);
  for(const b of rushBallsV022)if(b.age<.3){b.age+=dt;if(b.age>=.3){b.n.visible=false;burst([3.3,1.2,0]);state.cpuHurt=.2;feelV023.pulse=Math.max(feelV023.pulse,.16);}}
  audio.update(dt,3,1);
  if(duelV022.time>=5.35){duelV022.phase='settle';duelV022.time=0;$('#kick').disabled=true;audio.applyMix();}
  return;
 }
 if(state.mode==='playing'&&p==='settle'){
  duelV022.time+=dt;
  for(const b of rushBallsV022)if(b.age<.3){b.age+=dt;if(b.age>=.3){b.n.visible=false;burst([3.3,1.2,0]);feelV023.pulse=.28;}}
  if(duelV022.time>=.85){duelV022.phase='done';rushBallsV022.forEach(b=>b.n.visible=false);audio.stopVoice();$('#arena').classList.remove('rush');end('win');}
  return;
 }
 const r=gameV023(dt);
 if(p==='charge'&&duelV022.phase==='shot'){feelV023.pulse=.25;audio.applyMix();}
 return r;
};
const progressV023=depthProgressV022;
depthProgressV022=function(){if(feelEnabledV023&&duelV022.phase==='break')return motion?easeV023(duelV022.time,.25,2.12):smoothDepthV022(duelV022.time/.6);return progressV023();};
const prepareV023=prepareDepthRenderV022;
prepareDepthRenderV022=function(){
 prepareV023();if(!feelEnabledV023||ceremony!=='match')return;
 const save=n=>{restoreRenderV022.push([n,n.pos,n.rot]);n.pos=[...n.pos];n.rot=[...n.rot]};
 const phase=duelV022.phase,t=duelV022.time,z=depthOffsetV022();
 // Cut away the occluding wall only after the hit and backward fall have started.
 // The continuous camera and delayed pursuit carry the movement across the cut.
 const progress=depthProgressV022();frontSceneryV022.visible=progress<.14;backSceneryV022.visible=progress>=.14;
 const turn=motion&&phase==='break'?Math.sin(progress*Math.PI)*.42:0;
 const yaw=motion?.073+.23*progress+turn:.073;
 const close=duelV022.entered?Math.max(0,(1.12-duelV022.spacing)/.65):0;
 renderer.eye=[Math.sin(yaw)*17,5.6-close*.6,z+Math.cos(yaw)*17];renderer.target=[0,1.9,z];
 // Modest framing change leaves both heads, IPA labels, and high lobs inside mobile viewports.
 renderer.zoom=motion?1+close*.16-(phase==='break'?.17*Math.sin(progress*Math.PI):0):1;
 if(phase==='charge'&&motion)renderer.zoom+=.035*easeV023(t,0,.7);
 if(motion&&state.mode!=='paused')renderer.shake=[Math.sin(visualTime*83)*feelV023.pulse*.035,Math.cos(visualTime*71)*feelV023.pulse*.025];
 if(phase==='break'&&motion){
  // Opponent leads, player follows on foot, camera catches up, then both settle before the prompt.
  const enemy=easeV023(t,.13,1.6),pursue=easeV023(t,.65,2.12),recover=easeV023(t,1.4,2.2),fall=easeV023(t,.12,.65)*(1-recover);
  cpu.n.pos[2]=-8*enemy;player.n.pos[2]=foot.z-8*pursue;
  cpu.n.pos[1]=.12+.35*Math.sin(enemy*Math.PI);cpu.n.rot[0]=fall*1.05;cpu.n.rot[2]=fall*.8;
  save(cpu.body);cpu.body.pos[1]-=fall*.42;
  const step=Math.sin(pursue*Math.PI*6)*Math.sin(pursue*Math.PI);
  save(player.leg);save(player.back);player.leg.rot[2]+=.3*step;player.back.rot[2]-=.3*step;
  save(player.body);player.body.rot[0]=-.12*Math.sin(pursue*Math.PI);player.body.pos[1]+=Math.abs(step)*.055;
 }
 if(phase==='impact'&&motion){save(cpu.body);cpu.body.rot[2]-=.32*Math.sin(Math.PI*Math.min(1,t/.3));cpu.n.pos[0]+=.18*Math.sin(Math.PI*Math.min(1,t/.3));}
 if(phase==='charge'){
  save(player.body);save(player.arm);save(player.farArm);
  const gather=easeV023(t,0,.48);player.body.pos[1]-=.18*gather;player.body.rot[2]=-.22*gather;player.arm.rot[2]-=.28*gather;player.farArm.rot[2]+=.3*gather;
 }
 if(['rush','settle','done'].includes(phase)){
  const recoil=motion?Math.sin(feelV023.pulse/.28*Math.PI)*.1:0;
  cpu.n.rot[2]=phase==='rush'?.8+recoil:1.25;cpu.n.pos[1]=.35;cpu.n.pos[0]+=Math.max(0,recoil);
  if(phase==='rush'&&motion){save(player.body);player.body.rot[2]-=Math.max(0,feelV023.pulse)*.3;}
  ball.visible=false;shadow.visible=false;
 }
 for(const b of rushBallsV022){
  b.n.visible=['rush','settle'].includes(phase)&&b.age<.3;
  if(b.n.visible){const u=Math.min(1,b.age/.3);b.n.pos=depthPointV022([-3.78+foot.x+(7.08-foot.x)*u,.8+.4*u+Math.sin(u*Math.PI)*.3,(b.slot-1.5)*.12*Math.sin(u*Math.PI)]);}
 }
};
const sceneV023=updateScene;
updateScene=function(dt){sceneV023(dt);if(!feelEnabledV023)return;
 const p=duelV022.phase,active=state.mode==='playing';
 $('#arena').classList.toggle('duel-pressure',duelV022.entered&&motion);
 $('#arena').classList.toggle('duel-finisher',ceremony==='match'&&state.cpuHp>0&&state.cpuHp<=15);
 wordV023.hidden=!active||!['charge','rush','settle'].includes(p);
 if(!wordV023.hidden){wordV023.textContent=p==='charge'?'決める':feelV023.word||'VOCABULARY RUSH';const label=document.createElement('small');label.textContent=p==='charge'?'':feelV023.word?'VOCABULARY RUSH · '+duelV022.taps+' HIT':'連打で解き放て';wordV023.appendChild(label);}
 if(p==='rush'){$('#kick').disabled=!active||duelV022.time<.35;$('#kick small').textContent=duelV022.taps+' HIT';}
 if(p==='settle'){$('#kick').disabled=true;$('#kick small').textContent=duelV022.taps+' HIT';}
 if(ceremony==='match'&&!cinematicV022()&&state.cpuHp>0&&state.cpuHp<=15){$('#phaseName').textContent='決着球';$('#kick span').textContent='決める';}
 wordBallsV023.forEach((e,i)=>{const b=rushBallsV022[i];e.hidden=!active||!motion||!b.n.visible||i!==((duelV022.taps-1)%16);if(!e.hidden){const [x,y]=renderer.project(b.n.pos);e.style.left=x+'px';e.style.top=y+'px';e.textContent=b.word||'';}});
};
$('#start').addEventListener('click',start);`);
 return html;
};
