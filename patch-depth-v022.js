window.otoPatchDepthV022=function(html){
function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.22 patch anchor: '+from.slice(0,72));html=html.replace(from,to);}
replaceOnce("version:'0.21.0-stage-modules'","version:'0.22.0-depth-rush'");
replaceOnce('FIFTEENTH EVER GARDEN — v0.21.0','FIFTEENTH EVER GARDEN — v0.22.0');
replaceOnce("if(state.cpuHp===0){state.cpuDefeated=true;cpu.kick=0;end('win');return;}","if(state.cpuHp===0){state.cpuDefeated=true;cpu.kick=0;beginRushV022();return;}\n  if(!duelV022.entered&&state.cpuHp<=CONFIG.maxCpuHp/2){beginDepthV022();return;}\n  if(duelV022.phase==='back')duelV022.approach=Math.min(1,duelV022.approach+.25);");
// World-space mapping happens before drawing. Logical contact points and timing stay unchanged.
replaceOnce('renderer.render(root);','prepareDepthRenderV022();renderer.render(root);');
replaceOnce('renderer.project([x,y,z])[1]','renderer.project(depthPointV022([x,y,z]))[1]');
replaceOnce("place($('#ballLabel'),[x,y+.3,z],highBall?40:-2);","place($('#ballLabel'),depthPointV022([x,y+.3,z]),highBall?40:-2);");
replaceOnce("place($('#cpuLabel'),[4.4,.1,.3],16);","place($('#cpuLabel'),[cpu.n.pos[0],.1,cpu.n.pos[2]+.3],16);");

replaceOnce('</style>','\n.rush + .console .kick small{display:block}\n</style>');
replaceOnce("$('#start').addEventListener('click',start);",String.raw`
const duelV022={phase:'front',entered:false,time:0,approach:0,spacing:1,words:[],taps:0,rushRemaining:0};
const frontSceneryV022=root.children[0],backSceneryV022=group(root);
// A second procedural courtyard makes the spatial break visible without replacing the stage art system.
mesh(backSceneryV022,'box','#303d50',[0,-.24,-8],[60,.4,55]);
mesh(backSceneryV022,'box','#737485',[0,.03,-8],[18,.10,8]);
for(let x=-8;x<=8;x+=2)mesh(backSceneryV022,'box','#b5aa94',[x,.09,-8],[.03,.015,8]);
for(const x of [-8,-4,0,4,8]){
 mesh(backSceneryV022,'box',CPU_CHARACTER.appearance.robe,[x,2.3,-14],[.35,4.6,.35]);
 mesh(backSceneryV022,'box','#ddd1a4',[x,3.5,-13.9],[1,.7,.6],[0,0,0],1);
 mesh(backSceneryV022,'box','#374353',[x,4.8,-14],[4.4,.3,1.4]);
}
for(const x of [-9,9])for(const z of [-11,-7,-3]){
 mesh(backSceneryV022,'box','#c5ad78',[x,.65,z],[.4,1.3,.4]);
 mesh(backSceneryV022,'ico','#ffd492',[x,1.5,z],[.35,.4,.35],[0,0,0],1);
}
mesh(backSceneryV022,'ico','#e8dfbd',[-6,7,-19],[1.1,1.1,.3],[0,0,0],1);
G.mergeStatic(backSceneryV022);backSceneryV022.visible=false;
const rushBallsV022=Array.from({length:16},()=>{const n=group(root);mesh(n,'ico','#ffdd93',[0,0,0],[.23,.23,.23],[0,0,0],1);mesh(n,'cyl','#b95453',[0,0,0],[.235,.035,.235]);n.visible=false;return {n,age:1,slot:0}});
let restoreRenderV022=[];
const cinematicV022=()=>['break','charge','shot','rush'].includes(duelV022.phase);
const smoothDepthV022=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
function depthProgressV022(){return duelV022.phase==='break'?smoothDepthV022(duelV022.time/(motion?2.2:.6)):duelV022.entered?1:0;}
function depthOffsetV022(){return -8*depthProgressV022();}
function depthPointV022(p){
 const offset=4.4*(1-duelV022.spacing),left=-3.78+foot.x,u=(p[0]-left)/(3.3-left);
 return [p[0]+offset*(1-2*u),p[1],p[2]+depthOffsetV022()];
}
function resetDuelV022(keepWords=false){
 Object.assign(duelV022,{phase:'front',entered:false,time:0,approach:0,spacing:1,words:keepWords?duelV022.words:[],taps:0,rushRemaining:0});
 rushBallsV022.forEach(p=>{p.age=1;p.n.visible=false});frontSceneryV022.visible=true;backSceneryV022.visible=false;
 renderer.eye=[1.25,5.6,17];renderer.target=[0,2,0];renderer.zoom=1;ball.visible=true;shadow.visible=true;
 $('#kick span').textContent='返す';$('#kick small').textContent='タップで返球';$('#arena').classList.remove('rush');
}
function beginDepthV022(){
 duelV022.entered=true;duelV022.phase='break';duelV022.time=0;audio.stopVoice();state.hitstop=0;answerCardTimerV010=0;trail=[];
 $('#kick').disabled=true;$('#repeatWord').disabled=true;announce('奥舞台','',2.2);
}
function beginRushV022(){
 duelV022.phase='rush';duelV022.time=0;duelV022.rushRemaining=5;duelV022.taps=0;state.pendingDamage=0;audio.stopVoice();
 $('#kick').disabled=false;$('#repeatWord').disabled=true;$('#kick span').textContent='連打！';$('#kick small').textContent='VOCABULARY RUSH';$('#arena').classList.add('rush');
 announce('VOCABULARY RUSH','',5);audio.hit(false,4,true);
}
const questionV022=newQuestion;
newQuestion=function(){const r=questionV022();if(state.word&&!duelV022.words.includes(state.word))duelV022.words.push(state.word);return r;};
const startV022=start;
start=function(){if(titlePendingV020)return;audio.stopVoice();resetDuelV022();return startV022();};
const matchV022=beginMatch;
beginMatch=function(){resetDuelV022(true);return matchV022();};
const speechV022=speakWord;
let rushSpeechV022=false;
speakWord=function(word=state.word,onDone){if(cinematicV022()&&!rushSpeechV022){onDone?.();return;}return speechV022(word,onDone);};
const kickV022=kick;
kick=function(){
 if(state.mode!=='playing')return;
 if(duelV022.phase==='rush'){
  const words=duelV022.words;if(!words.length)return;
  const index=duelV022.taps++,word=words[index%words.length];
  player.kick=.72;player.kickSlot=index%4;player.shot='perfect';player.contactV012=[-3.78+foot.x,.68,foot.z*.72];
  const p=rushBallsV022[index%rushBallsV022.length];p.age=0;p.slot=index%4;p.n.visible=true;
  audio.hit(false,index,true);rushSpeechV022=true;try{speakWord(word)}finally{rushSpeechV022=false}
  $('#feedback').textContent=word;state.feedbackTime=.7;return;
 }
 if(cinematicV022())return;
 const before=state.rally,r=kickV022();
 if(ceremony==='match'&&state.rally>before&&state.pendingDamage>=state.cpuHp){
  duelV022.phase='charge';duelV022.time=0;audio.stopVoice();state.hitstop=0;
  $('#kick').disabled=true;$('#repeatWord').disabled=true;announce('…','',.7);
 }
 return r;
};
const endV022=end;
end=function(kind){if(kind==='win'&&duelV022.phase!=='done')return;return endV022(kind);};
const gameV022=updateGame;
updateGame=function(dt){
 if(state.mode==='paused')return;
 if(state.mode==='playing'&&cinematicV022()){
  duelV022.time+=dt;
  if(duelV022.phase==='break'){
   if(duelV022.time>=(motion?2.2:.6)){
    duelV022.phase='back';duelV022.time=0;duelV022.spacing=1.12;
    cpuV016();$('#kick').disabled=false;announce('奥舞台','',.8);
   }
  }else if(duelV022.phase==='charge'){
   if(duelV022.time>=.7){duelV022.phase='shot';duelV022.time=0;state.duration=.28;state.flight=0;player.kick=.72;audio.hit(false,3,true);}
  }else if(duelV022.phase==='shot'){
   state.flight=Math.min(state.duration,state.flight+dt);if(state.flight>=state.duration)cpuReturn();
  }else if(duelV022.phase==='rush'){
   duelV022.rushRemaining=Math.max(0,5-duelV022.time);
   for(const p of rushBallsV022)if(p.age<.30){p.age+=dt;if(p.age>=.30){p.n.visible=false;burst([3.3,1.2,0]);state.cpuHurt=.2;}}
   audio.update(dt,3,1);
   if(duelV022.time>=5){
    duelV022.phase='done';rushBallsV022.forEach(p=>p.n.visible=false);audio.stopVoice();$('#arena').classList.remove('rush');$('#kick').disabled=true;end('win');
   }
  }
  return;
 }
 if(duelV022.phase==='back'){
  const target=1.12-.42*duelV022.approach;duelV022.spacing+=(target-duelV022.spacing)*(1-Math.exp(-dt*4));
 }
 return gameV022(dt);
};
const sampleV022=sampleBall;
sampleBall=function(p=state.flight/state.duration){if(duelV022.phase==='charge')return [...state.flightStart];return sampleV022(p);};
function prepareDepthRenderV022(){
 restoreRenderV022=[];
 const save=n=>{restoreRenderV022.push([n,n.pos,n.rot]);n.pos=[...n.pos];n.rot=[...n.rot]};
 const t=depthProgressV022(),z=depthOffsetV022(),offset=4.4*(1-duelV022.spacing);
 frontSceneryV022.visible=t<.25;backSceneryV022.visible=t>=.25;
 const yaw=motion?.073+.40*t+(duelV022.phase==='break'?Math.sin(t*Math.PI)*.75:0):.073;
 renderer.eye=[Math.sin(yaw)*17,5.6,z+Math.cos(yaw)*17];renderer.target=[0,2,z];renderer.zoom=motion&&duelV022.phase==='break'?1-.40*Math.sin(t*Math.PI):1;
 renderer.gl?.clearColor?.(...(t<.25?[.39,.51,.49,1]:[.20,.25,.33,1]));
 for(const n of [ball,shadow,...ghosts,...sparks.map(s=>s.n)]){save(n);n.pos=depthPointV022(n.pos);}
 save(player.n);save(cpu.n);player.n.pos[0]+=offset;cpu.n.pos[0]-=offset;player.n.pos[2]+=z;cpu.n.pos[2]+=z;
 if(duelV022.phase==='break'&&motion){
  const u=Math.min(1,duelV022.time/1.6);cpu.n.pos[2]-=3*Math.sin(t*Math.PI);cpu.n.pos[1]+=.9*Math.sin(u*Math.PI);cpu.n.rot[0]+=Math.sin(u*Math.PI)*2.4;cpu.n.rot[2]+=Math.sin(u*Math.PI)*1.3;
 }
 if(duelV022.phase==='charge'){
  save(player.body);player.body.rot[2]-=.22*Math.sin(Math.min(1,duelV022.time/.7)*Math.PI);player.body.pos[1]-=.12;
 }
 if(duelV022.phase==='rush'||duelV022.phase==='done'){
  cpu.n.rot[2]=1.25;cpu.n.pos[1]=.35;
 }
 ball.visible=!['break','rush','done'].includes(duelV022.phase);shadow.visible=ball.visible;
 for(const p of rushBallsV022){
  p.n.visible=duelV022.phase==='rush'&&p.age<.30;
  if(p.n.visible){const u=Math.min(1,p.age/.30);p.n.pos=depthPointV022([-3.78+foot.x+(7.08-foot.x)*u,.8+.4*u+Math.sin(u*Math.PI)*.3,(p.slot-1.5)*.12*Math.sin(u*Math.PI)]);p.n.rot[2]=u*8;}
 }
}
const sceneV022=updateScene;
updateScene=function(dt){
 try{sceneV022(dt);}finally{for(const [n,pos,rot] of restoreRenderV022){n.pos=pos;n.rot=rot;}restoreRenderV022=[];}
 if(cinematicV022()||duelV022.phase==='done'){
  $('#ballLabel').hidden=true;$('#practiceCard').hidden=true;$('.timing').style.visibility='hidden';
  $('#kick').classList.remove('ready');$('#kick').disabled=duelV022.phase!=='rush'||state.mode!=='playing';
  $('#repeatWord').disabled=true;all('[data-symbol]').forEach(b=>b.disabled=true);
  if(duelV022.phase==='rush')$('#kick small').textContent=duelV022.rushRemaining.toFixed(1)+'s';
 }else{$('#ballLabel').hidden=false;$('.timing').style.visibility='';}
};
$('#start').addEventListener('click',start);`);
replaceOnce('select(0);refreshHud();requestAnimationFrame(frame);',`window.kemari.getDuel=()=>({...duelV022,words:[...duelV022.words],camera:[...(renderer.eye||[1.25,5.6,17])],projectiles:rushBallsV022.filter(p=>p.n.visible).length});
select(0);refreshHud();requestAnimationFrame(frame);`);
return html;
};
