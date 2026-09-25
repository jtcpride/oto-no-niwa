window.otoPatchPlayV012=function(html){
// Built on main 440bf13 (v0.11.6). Fail closed if an upstream patch changes an anchor.
function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.12 patch anchor: '+from.slice(0,80));html=html.replace(from,to);}
replaceOnce("version:'0.11.6-readable-human-stagger'","version:'0.12.0-mix-and-kick-flight'");
replaceOnce('発音記号蹴鞠 · v0.10 PRACTICE','発音記号蹴鞠 · v0.12.0 PRACTICE');
replaceOnce('<title>音の庭 — 発音記号蹴鞠</title>','<title>音の庭 — v0.12.0</title>');
replaceOnce('</style>',`\n.audio-mix{display:flex;justify-content:flex-end;gap:18px;flex-wrap:wrap;margin:-6px 0 12px;font-size:12px;color:var(--muted)}.audio-mix label{display:flex;align-items:center;gap:8px;min-height:32px}.audio-mix input{width:100px;accent-color:var(--jade)}.audio-mix output{min-width:3ch;text-align:right;font-variant-numeric:tabular-nums}\n</style>`);
replaceOnce('<section id="arena"',`<div class="audio-mix" role="group" aria-label="音量"><label>BGM <input id="musicVolume" type="range" min="0" max="100" value="65" aria-label="BGM音量"><output id="musicValue" for="musicVolume">65</output></label><label>発音 <input id="voiceVolume" type="range" min="0" max="100" value="100" aria-label="発音の音量"><output id="voiceValue" for="voiceVolume">100</output></label></div><section id="arena"`);
// Articulated legs: hip direction, thigh, knee and ankle; no changes to the root height.
replaceOnce("for(const l of [leg,back]){mesh(l,'robe','#e4ddba',[0,-.34,0],[.2,.76,.22]);mesh(l,'box','#394338',[.14,-.79,.04],[.49,.16,.34]);}",`const joints=[];for(const l of [leg,back]){const thigh=group(l),knee=group(thigh,[0,-.48,0]),shoe=group(knee,[0,-.48,0]);mesh(thigh,'robe','#e4ddba',[0,-.23,0],[.21,.49,.23]);mesh(knee,'robe','#e4ddba',[0,-.22,0],[.18,.47,.20]);mesh(shoe,'box','#394338',[.12,0,.02],[.40,.14,.29]);joints.push(thigh,knee,shoe);}`);
replaceOnce('return {n,body,head,arm,farArm,leg,back,kick:0,phase:', 'return {n,body,head,arm,farArm,leg,back,thigh:joints[0],knee:joints[1],shoe:joints[2],backThigh:joints[3],backKnee:joints[4],backShoe:joints[5],kick:0,phase:');
replaceOnce("const KICK_NODES_V011=['body','head','arm','farArm','leg','back'];","const KICK_NODES_V011=['body','head','arm','farArm','leg','back','thigh','knee','shoe','backThigh','backKnee','backShoe'];");
// Restore before computing the base pose; the old order restored stale base rotations.
replaceOnce('resetFailPoseV0115();pose(player,dt);pose(cpu,dt);state.hurt=Math.max(0,state.hurt-dt);resetKickFormV011();poseFoot(dt);','resetFailPoseV0115();resetKickFormV011();pose(player,dt);pose(cpu,dt);state.hurt=Math.max(0,state.hurt-dt);poseFoot(dt);');
replaceOnce('const k=f.kick>0?Math.sin((.38-f.kick)/.38*Math.PI):0;', 'const k=f!==player&&f.kick>0?Math.sin((.38-f.kick)/.38*Math.PI):0;');
replaceOnce('player.kick=.92;player.kickSlot=state.selected;', 'player.kick=.72;player.contactV012=[...contact];player.kickSlot=state.selected;');
replaceOnce('bodyHitV010=Math.max(0,bodyHitV010-dt);knockdownV010=Math.max(0,knockdownV010-dt);}return r;', '}bodyHitV010=Math.max(0,bodyHitV010-dt);knockdownV010=Math.max(0,knockdownV010-dt);return r;');
// v0.10.4 reintroduced an older failure overlay after the one v0.11.5 disabled.
// Keep the bow, and let the restored v0.11.6 stagger be the only failure animation.
replaceOnce(" if(bodyHitV010>0){const h=Math.sin(bodyHitV010/.62*Math.PI);player.n.pos[0]-=h*.16;player.head.rot[2]+=h*.18;}", "");
replaceOnce(" if(knockdownV010>0){const t=1-knockdownV010/KNOCKDOWN_DURATION_V010,travel=Math.sin(Math.min(1,t/.72)*Math.PI/2),drop=Math.sin(Math.min(1,t/.58)*Math.PI/2);player.n.pos[2]+=knockDirV010*2.0*travel;player.body.pos[1]-=.48*drop;player.body.rot[0]+=knockDirV010*Math.PI*1.45*travel;player.body.rot[2]+=knockDirV010*.55*travel;player.arm.rot[2]-=knockDirV010*.9*travel;player.farArm.rot[2]+=knockDirV010*.7*travel;}", "");
// Reuse the word/ceremony voice selection, with one shared volume and ducking lifecycle.
if((html.match(/u\.volume=1;/g)||[]).length!==2)throw new Error('v0.12 speech anchor');
html=html.replaceAll('u.volume=1;','u.volume=audio.voiceVolume;');
if((html.match(/window\.speechSynthesis\.speak\(u\);/g)||[]).length!==2)throw new Error('v0.12 speech dispatch anchor');
html=html.replaceAll('window.speechSynthesis.speak(u);','audio.speak(u);');
replaceOnce("if(!word||!('speechSynthesis' in window))return;","if(!word||!audio.enabled||audio.voiceVolume===0||!('speechSynthesis' in window))return;");
replaceOnce("if(!text||!('speechSynthesis' in window))return;","if(!text||!audio.enabled||audio.voiceVolume===0||!('speechSynthesis' in window))return;");
replaceOnce("$('#start').addEventListener('click',start);",String.raw`
// Separate music/effect buses. Browser TTS has its own volume outside Web Audio.
audio.musicVolume=.65;audio.voiceVolume=1;audio.voiceToken=0;audio.ducked=false;audio.layers=0;
const ensureAudioV012=audio.ensure.bind(audio);
audio.ensure=function(){ensureAudioV012();if(!this.ctx||this.musicBus)return;this.musicBus=this.ctx.createGain();this.fxBus=this.ctx.createGain();this.musicBus.connect(this.master);this.fxBus.connect(this.master);this.applyMix();};
audio.applyMix=function(){if(!this.ctx||!this.musicBus)return;const t=this.ctx.currentTime;this.musicBus.gain.setTargetAtTime(this.musicVolume*(this.ducked?.20:1),t,this.ducked?.025:.22);this.fxBus.gain.setTargetAtTime(this.ducked?.32:.72,t,.04);};
audio.releaseVoice=function(token){if(token!==this.voiceToken)return;clearTimeout(this.voiceTimer);this.ducked=false;this.applyMix();};
audio.stopVoice=function(){const token=++this.voiceToken;clearTimeout(this.voiceTimer);if('speechSynthesis' in window)window.speechSynthesis.cancel();this.releaseVoice(token);};
audio.speak=function(u){if(!this.enabled||!this.voiceVolume)return;const token=++this.voiceToken;clearTimeout(this.voiceTimer);this.ducked=true;this.applyMix();u.onend=u.onerror=()=>this.releaseVoice(token);u.onstart=()=>{if(token===this.voiceToken){this.ducked=true;this.applyMix();}};this.voiceTimer=setTimeout(()=>this.releaseVoice(token),Math.max(2500,u.text.length*180));try{window.speechSynthesis.speak(u);}catch(e){this.releaseVoice(token);throw e;}};
const setAudioV012=audio.set.bind(audio);
audio.set=function(on){setAudioV012(on);if(!this.enabled)this.stopVoice();};
audio.note=function(freq,dur,vol,type='sine',delay=0,slide=0,bus='fx'){if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0001,vol),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(bus==='music'?this.musicBus:this.fxBus);o.onended=()=>{o.disconnect();g.disconnect();};o.start(t);o.stop(t+dur+.02);};
audio.update=function(dt,phase,speed){
 if(!this.enabled||!this.ctx)return;
 this.layers+=(phase-this.layers)*(1-Math.exp(-dt/1.5));this.nextBeat-=dt;if(this.nextBeat>0)return;
 this.nextBeat=60/Math.max(64,Math.min(112,68+18*(speed-1)));this.beat++;
 const layer=n=>Math.max(0,Math.min(1,this.layers-n)),norm=1/Math.sqrt(1+this.layers*.85);
 const note=(f,d,v,type='sine',delay=0)=>this.note(f,d,v*norm,type,delay,0,'music');
 // A quiet pulse from the start; melody, harmony and percussion fade in over 1.5s.
 if(this.beat%2===0)note(110,.7,.045);
 if(layer(0)>.01){const notes=[220,293.66,329.63,440,329.63,293.66];note(notes[this.beat%6],.35,.09*layer(0),'triangle');}
 if(layer(1)>.01&&this.beat%2===0){note(110,1.05,.095*layer(1));note(220,1,.04*layer(1),'triangle',.02);note(293.66,.9,.03*layer(1),'triangle',.035);}
 if(layer(2)>.01){note(880,.075,.035*layer(2),'triangle',.16);note(55,.15,.10*layer(2));}
};
for(const [id,key,out] of [['musicVolume','musicVolume','musicValue'],['voiceVolume','voiceVolume','voiceValue']]){
 $('#'+id).addEventListener('input',e=>{audio[key]=Number(e.target.value)/100;$('#'+out).value=e.target.value;if(key==='voiceVolume')audio.stopVoice();audio.applyMix();});
}
const pauseV012=pause;pause=function(){const r=pauseV012();if(state.mode==='paused')audio.stopVoice();return r;};

// Kemari lift / takraw inside / outside / toe scoop, stylized for the existing four slots.
const KICKS_V012=[
 {name:'浮かし',leg:'leg',arc:.18,curve:.05,time:1.04,spin:2.4,prep:[.24,.28,.22],follow:[.74,.90,.22],lean:.06},
 {name:'内回し',leg:'back',arc:.06,curve:.72,time:1,spin:5.2,prep:[.12,.62,-.56],follow:[.54,1.03,.52],lean:.13},
 {name:'外払い',leg:'leg',arc:-.12,curve:-.78,time:.94,spin:-7.2,prep:[.18,.72,.56],follow:[.72,1.22,-.48],lean:.24},
 {name:'すくい上げ',leg:'back',arc:.42,curve:.24,time:1.10,spin:3.6,prep:[-.10,.25,-.23],follow:[.62,1.47,-.12],lean:.19}
];
let flightStyleV012=-1,flightCurveV012=0,flightSpinV012=2.4,flightSkewV012=0;
const launchV012=launchShot;
launchShot=function(kind,direction,startPoint){
 if(kind==='normal')flightStyleV012=-1;
 if(direction===1)flightStyleV012=kind==='rescue'?-1:state.selected;
 launchV012(kind,direction,startPoint);
 const style=KICKS_V012[flightStyleV012];
 if(!style||kind==='rescue'){flightCurveV012=0;flightSpinV012=2.4;flightSkewV012=0;return;}
 const timing=Math.max(-1,Math.min(1,(state.lastError||0)/CONFIG.hitWindow));
 state.arc=Math.max(.24,.92+style.arc-(timing<0?1.05:.60)*timing);
 state.duration=Math.max(CONFIG.minShotTime,Math.min(CONFIG.maxShotTime,flightDuration()*style.time*(1-.19*timing)*(direction===-1?1.06:1)*(kind==='perfect'?1-Math.min(4,Math.max(0,state.streak-1))*.025:1)));
 flightCurveV012=style.curve*(1+.25*timing)*(direction===-1?-.65:1);flightSpinV012=style.spin*(1+.25*timing);flightSkewV012=timing*.24;
};
// Keep TIME's roll/fade wrappers; only normal rally flight is replaced.
const sampleV012=sampleBall;
sampleBall=function(progress=state.flight/state.duration){
 if(!['practice','match'].includes(ceremony))return sampleV012(progress);
 const t=Math.max(0,Math.min(1.18,progress)),q=Math.min(1,t),a=state.flightStart;
 const incoming=state.direction===-1,endX=incoming?-3.78+foot.x:3.3,endY=incoming?.68:1.2;
 // Ease the final approach into the reachable foot area without altering the timing window.
 const travel=incoming?1-Math.pow(1-q,3):q,arch=4*q*(1-q),bend=Math.sin(Math.PI*q);
 return [a[0]+(endX-a[0])*travel-(incoming?1:-1)*Math.max(0,t-1)*.7,
 a[1]+(endY-a[1])*q+arch*state.arc*(1+flightSkewV012*(1-2*q))-Math.max(0,t-1)*1.4,
 a[2]*(1-q)+(incoming?state.aimZ:0)*q+flightCurveV012*bend+state.wobble*Math.sin(q*3*Math.PI)*bend];
};
const refreshV012=refreshHud;
refreshHud=function(){refreshV012();if(KICKS_V012[flightStyleV012]&&state.shot!=='rescue')$('#shotType').textContent=KICKS_V012[flightStyleV012].name+' · '+SHOTS[state.shot].name;};
function legTargetV012(which,target,weight=1){
 const hip=player[which],thigh=player[which==='leg'?'thigh':'backThigh'],knee=player[which==='leg'?'knee':'backKnee'];
 const dx=target[0]-hip.pos[0],dy=target[1]-hip.pos[1],dz=target[2]-hip.pos[2],h=Math.hypot(dx,dz),d=Math.max(.16,Math.min(.95,Math.hypot(h,dy))),bend=Math.acos(d/.96);
 // Hip turns the movement plane, then thigh/knee flex within that plane.
 hip.rot[0]*=1-weight;hip.rot[2]*=1-weight;hip.rot[1]=Math.atan2(-dz,dx)*weight;
 thigh.rot[2]=(Math.atan2(h,-dy)+bend)*weight;knee.rot[2]=-2*bend*weight;
}
function localContactV012(world){const dx=world[0]-player.n.pos[0],dz=world[2]-player.n.pos[2],a=player.n.rot[1];return [Math.cos(a)*dx-Math.sin(a)*dz,world[1]-player.n.pos[1]-.20,Math.sin(a)*dx+Math.cos(a)*dz];}
applyKickFormV011=function(){
 if(!['practice','match'].includes(ceremony)||bodyHitV010>0||knockdownV010>0)return;
 const striking=player.kick>0&&player.shot!=='rescue';
 const remaining=state.duration-state.flight;
 const preparing=!striking&&state.mode==='playing'&&state.direction===-1&&!state.pendingMiss&&remaining<.38&&remaining>-.02;
 if(!striking&&!preparing)return;
 snapshotKickPoseV011();
 const slot=striking?player.kickSlot:state.selected,style=KICKS_V012[slot];if(!style)return;
 const t=striking?clamp01V011(1-player.kick/.72):0;
 const strength=motion?1:.30;
 const prep=preparing?smoothV011((.38-remaining)/.38):0;
 // Impact is immediate, then the foot follows through and returns; the ball never waits for a wind-up.
 const recovery=striking?1-smoothV011((t-.42)/.58):prep;
 let target=style.prep;
 if(striking){const hit=localContactV012(player.contactV012||state.flightStart),follow=smoothV011(t/.38);target=hit.map((v,i)=>v+(style.follow[i]-v)*follow);}
 legTargetV012(style.leg,target,recovery*strength);
 const balance=recovery*strength;
 player.body.rot[2]-=style.lean*balance;player.body.rot[1]+=(slot===1?-.26:slot===2?.32:0)*balance;
 player.body.pos[1]-=(slot===3?.10:.035)*balance;
 player.arm.rot[2]-=(slot===2?.62:.30)*balance;player.farArm.rot[2]+=(slot===1?.48:.26)*balance;
 player.head.rot[2]+=style.lean*.45*balance;
 const support=style.leg==='leg'?'back':'leg';
 // Slight knee give in the planted leg, keeping its ankle near its original ground position.
 legTargetV012(support,[player[support].pos[0],.10,player[support].pos[2]],.18*balance);
};
const startV012=start;
start=function(){resetFailPoseV0115();resetKickFormV011();flightStyleV012=-1;flightCurveV012=0;flightSpinV012=2.4;flightSkewV012=0;audio.layers=0;audio.stopVoice();return startV012();};
const sceneV012=updateScene;
updateScene=function(dt){const before=[...ball.rot];sceneV012(dt);if(state.mode==='paused')ball.rot=before;else if(motion){ball.rot[0]=before[0]+dt*flightSpinV012;ball.rot[1]+=dt*flightCurveV012*3;ball.rot[2]=before[2]+dt*(state.direction===-1?1:-1)*Math.abs(flightSpinV012);}};
`+"\n$('#start').addEventListener('click',start);");
replaceOnce('select(0);refreshHud();requestAnimationFrame(frame);',`window.kemari.getAudioMix=()=>({music:audio.musicVolume,voice:audio.voiceVolume,ducked:audio.ducked,layers:audio.layers,musicGain:audio.musicBus?.gain.value,effectsGain:audio.fxBus?.gain.value});
window.kemari.getKick=()=>({style:KICKS_V012[flightStyleV012]?.name||null,curve:flightCurveV012,spin:flightSpinV012,nodes:Object.fromEntries(KICK_NODES_V011.map(k=>[k,{pos:[...player[k].pos],rot:[...player[k].rot]}]))});
select(0);refreshHud();requestAnimationFrame(frame);`);
return html;
};
