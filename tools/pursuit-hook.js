// Injected only by the local development server, inside the real game's closure.
// No replacement animation: every sample goes through updateGame/updateScene.
const pursuitLabV1={time:0,duration:4.7,playing:false,speed:1,loop:true,last:null,frame:null};
const pursuitFieldsV1={
 limbDelay:{label:'手の遅れ',min:0,max:.14,step:.01,unit:'秒'},
 kneeTuck:{label:'空中の膝のたたみ',min:.6,max:1.4,step:.05,unit:'倍'},
 landingDepth:{label:'着地の沈み込み',min:.08,max:.34,step:.01,unit:''},
 recoveryEnd:{label:'脚を構えに戻す時刻',min:2.45,max:3.1,step:.05,unit:'秒'},
 runStride:{label:'追走の手足の振り',min:.65,max:1.25,step:.05,unit:'倍'},
 cameraOrbit:{label:'カメラの回り込み',min:.75,max:1.1,step:.025,unit:'倍'},
 cameraAir:{label:'空中への視線',min:.3,max:1.1,step:.05,unit:''},
 cameraPullback:{label:'回り込み中の引き',min:.08,max:.23,step:.01,unit:''}
};
// Saved v0.37.2 presentation for comparison; the adopted preset comes from production.
const pursuitBaselineV1={limbDelay:0,kneeTuck:1,landingDepth:.20,recoveryEnd:2.75,runStride:1,cameraOrbit:1,cameraAir:.9,cameraPullback:.15};
const pursuitRenderV1=renderer.render.bind(renderer);
renderer.render=function(scene){
 pursuitRenderV1(scene);
 pursuitLabV1.frame={phase:duelV022.phase,phaseTime:duelV022.time,
  player:[...player.n.pos],cpu:[...cpu.n.pos],eye:[...renderer.eye],target:[...renderer.target],zoom:renderer.zoom,
  joints:Object.fromEntries(['body','head','arm','farArm','leg','back','knee','backKnee'].map(k=>[k,{pos:[...cpu[k].pos],rot:[...cpu[k].rot]}])),
  draws:renderer.engine.info.render.calls,triangles:renderer.engine.info.render.triangles,
  pixels:[renderer.canvas.width,renderer.canvas.height]};
};
function beginPursuitLabV1(){
 window.__pursuitSeed=318;visualTime=1;
 campaignV030.phase='match';campaignV030.intro=false;
 document.body.classList.remove('campaign-screen','campaign-cinematic');
 $('#campaignUI').hidden=true;$('#intro').hidden=true;$('#overlay').hidden=true;
 audio.userChoice=true;audio.set(false);state.mode='over';start();beginMatch();state.mode='playing';
 setMotion(true);select(0);resetFoot();state.cpuHp=CONFIG.maxCpuHp/2+1;state.target=0;
 state.word=ACTIVE_DECK.sounds[0].words[0].text;
 launchShot('normal',-1,[3.3,1.2,0]);state.hitstop=0;state.flight=state.duration;kick();
 if(duelV022.phase!=='breakCharge')throw Error('調整室の開始場面を作れませんでした');
 state.feedbackTime=0;$('#feedback').textContent='';pursuitLabV1.time=0;updateScene(0);
}
function tickPursuitLabV1(seconds){
 for(let left=seconds;left>1e-8;){const dt=Math.min(1/120,left);visualTime+=dt;updateGame(dt);updateScene(dt);left-=dt;}
 pursuitLabV1.time=Math.min(pursuitLabV1.duration,pursuitLabV1.time+seconds);
}
function seekPursuitLabV1(time){
 const target=Math.max(0,Math.min(pursuitLabV1.duration,Number(time)||0)),saved=renderer.render;
 renderer.render=()=>{};try{beginPursuitLabV1();tickPursuitLabV1(target);}finally{renderer.render=saved;}
 updateScene(0);pursuitLabV1.last=null;
}
window.FEGPursuitLab={
 defaults:{...PURSUIT_DEFAULTS_V028},baseline:{...pursuitBaselineV1},proposal:{...PURSUIT_DEFAULTS_V028},fields:pursuitFieldsV1,
 set(values){
  if(!values||typeof values!=='object'||Array.isArray(values))throw Error('設定データを確認してください');
  const result={...PURSUIT_DEFAULTS_V028};
  for(const [key,value] of Object.entries(values)){
   const field=pursuitFieldsV1[key];if(!Object.hasOwn(pursuitFieldsV1,key)||typeof value!=='number'||!Number.isFinite(value)||value<field.min||value>field.max)throw Error('設定値が範囲外です: '+key);
   result[key]=value;
  }
  Object.assign(pursuitTuneV028,result);seekPursuitLabV1(pursuitLabV1.time);
 },
 seek:seekPursuitLabV1,
 play(value){if(value&&pursuitLabV1.time>=pursuitLabV1.duration)seekPursuitLabV1(0);pursuitLabV1.playing=!!value;pursuitLabV1.last=null;},
 speed(value){if(![.25,.5,1].includes(value))throw Error('再生速度を確認してください');pursuitLabV1.speed=value;pursuitLabV1.last=null;},
 loop(value){pursuitLabV1.loop=!!value;},
  snapshot(){return{...pursuitLabV1,last:undefined,settings:{...pursuitTuneV028},mode:state.mode,stage:ACTIVE_STAGE.id,renderer:renderer.engine?.isWebGLRenderer?'Three.js r'+window.FEGThreeRevision:'unknown'};},
 export(){return{format:'feg-pursuit-v1',stage:ACTIVE_STAGE.id,base:'v0.37.3-pursuit',settings:{...pursuitTuneV028}};}
};
function animatePursuitLabV1(now){
 if(pursuitLabV1.playing&&!document.hidden){
  const dt=pursuitLabV1.last===null?0:Math.min(.05,(now-pursuitLabV1.last)/1000)*pursuitLabV1.speed;
  const left=pursuitLabV1.duration-pursuitLabV1.time;
  if(left>1e-8)tickPursuitLabV1(Math.min(left,dt));
  else if(pursuitLabV1.loop)seekPursuitLabV1(0);else pursuitLabV1.playing=false;
 }
 pursuitLabV1.last=now;requestAnimationFrame(animatePursuitLabV1);
}
document.addEventListener('visibilitychange',()=>{pursuitLabV1.last=null;});
select(0);refreshHud();seekPursuitLabV1(0);requestAnimationFrame(animatePursuitLabV1);
