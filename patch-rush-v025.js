window.otoPatchRushV025=function(html){
 function replaceOnce(a,b){if(html.split(a).length!==2)throw Error('v0.25 anchor: '+a.slice(0,60));html=html.replace(a,b);}
 replaceOnce("version:'0.24.0-step-and-strike'","version:'0.25.0-vocabulary-barrage'");
 replaceOnce('FIFTEENTH EVER GARDEN — v0.24.0','FIFTEENTH EVER GARDEN — v0.25.0');
 replaceOnce('</style>',String.raw`
 .rush-word-v025{position:absolute;z-index:4;pointer-events:none;color:#fff4cf;text-shadow:2px 3px 0 #442021,0 0 2px #17191d;font:italic 900 32px/.95 Impact,"Arial Black",sans-serif;letter-spacing:-.025em;text-transform:uppercase;white-space:nowrap;transform:translate(-50%,-50%);-webkit-text-stroke:.65px #392321;paint-order:stroke fill}
 .rush-word-v025[hidden],.rush-glow-v025[hidden]{display:none}
 .rush-glow-v025{position:absolute;z-index:3;pointer-events:none;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(ellipse,#fffceb 0%,#fff3bbcc 10%,#ffd0648c 28%,#f9a53c3d 49%,#e8842412 62%,transparent 73%);mix-blend-mode:screen}
 .rush-glow-v025 i{position:absolute;inset:9%;border:2px solid #ffefb8;border-radius:50%;box-shadow:0 0 12px #ffd16a88;opacity:0}
 .barrage-v025 #playerLabel,.barrage-v025 #cpuLabel{visibility:hidden}.barrage-v025 + .console .kick{padding:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}.barrage-v025 + .console .kick span{white-space:nowrap;font-size:18px;line-height:1.15}.barrage-v025 + .console .kick small{font-size:10px;line-height:1;margin:0}
 </style>`);
 // Run after every character/pose layer, and restore light even if drawing fails.
 replaceOnce('prepareDepthRenderV022();renderer.render(root);','prepareDepthRenderV022();prepareBarrageV025();try{renderer.render(root);}finally{restoreBarrageV025();}');
 replaceOnce('</style>','.kick.rush-ended-input{cursor:default;opacity:.5}</style>');
 replaceOnce("$('#kick').addEventListener('pointerdown',e=>{e.preventDefault();kick()});$('#kick').addEventListener('click',e=>{if(e.detail===0)kick()});",String.raw`
$('#kick').addEventListener('pointerdown',e=>{e.preventDefault();if(!rushEndedV025())kick()});
$('#kick').addEventListener('click',e=>{if(rushEndedV025())e.preventDefault();else if(e.detail===0)kick()});
$('#kick').addEventListener('touchstart',e=>{if(rushEndedV025())e.preventDefault()},{passive:false});`);
 replaceOnce("$('#start').addEventListener('click',start);",String.raw`
// Keep an inert event surface after the rush: leftover taps must not zoom the page.
const rushEndedV025=()=>['settle','done'].includes(duelV022.phase);
const barrageV025={serial:0,technique:0,lastSwing:99,hits:0,energy:0,heat:0,hitAge:99,hitSide:1,finishHit:false,center:null,light:0};
const FINISH_CONTACT_V025=.36;
const wordsV025=feelEnabledV023?Array.from({length:12},()=>{const e=document.createElement('span');e.className='rush-word-v025';e.hidden=true;$('#arena').appendChild(e);return {e,age:99,index:0};}):[];
const glowV025=document.createElement('div');glowV025.className='rush-glow-v025';glowV025.setAttribute('aria-hidden','true');glowV025.hidden=true;glowV025.appendChild(document.createElement('i'));$('#arena').appendChild(glowV025);
const finishBallV025=group(root);finishBallV025.renderRole='ball';mesh(finishBallV025,'ico','#fff1b6',[0,0,0],[.23,.23,.23],[0,0,0],1);mesh(finishBallV025,'cyl','#b95453',[0,0,0],[.235,.035,.235]);finishBallV025.visible=false;
let lightRestoreV025=[];
function restoreBarrageV025(){for(const [n,color,unlit] of lightRestoreV025){n.color=color;n.unlit=unlit;}lightRestoreV025=[];}
const resetV025=resetDuelV022;
resetDuelV022=function(keep=false){resetV025(keep);restoreBarrageV025();Object.assign(barrageV025,{serial:0,technique:0,lastSwing:99,hits:0,energy:0,heat:0,hitAge:99,hitSide:1,finishHit:false,center:null,light:0});wordsV025.forEach(w=>{w.age=99;w.e.hidden=true;});rushBallsV022.forEach(b=>b.volley=null);finishBallV025.visible=false;glowV025.hidden=true;$('#arena').classList.remove('barrage-v025');};
const kickV025=kick;
kick=function(){
 const taps=duelV022.taps,oldSlot=strideV024.player.slot,oldAttack=strideV024.player.attack,r=kickV025();
 if(!feelEnabledV023||duelV022.taps===taps)return r;
 // Technique sequence is independent of tap cadence: fast tapping cannot alias into one kick.
 if(barrageV025.lastSwing>=.14){strideV024.player.slot=barrageV025.technique++%4;strideV024.player.attack=.12;barrageV025.lastSwing=0;}
 else{strideV024.player.slot=oldSlot;strideV024.player.attack=oldAttack;}
 const index=barrageV025.serial++,word=feelV023.word,z=depthOffsetV022(),px=-3.78+foot.x+strideV024.player.x,cx=4.4+strideV024.cpu.x;
 const sources=[[px,.85,z],[px-.4,1.6,z+.55],[px+.2,1.1,z-.6],[px-.2,2.0,z-.4],[px-.6,.6,z+.6],[px+.1,1.4,z+.8]];
 for(let j=0;j<(motion?3:1);j++){
  const b=rushBallsV022[(taps+j*5)%rushBallsV022.length],n=index*3+j;
  b.age=0;b.slot=n%4;b.word=word;b.n.visible=true;
  b.volley={from:[...sources[motion?n%sources.length:0]],to:[cx-.2,1.0+(n%4)*.32,z+(n%3-1)*.13],arc:j===0?.14:.35,spread:[0,(n%3-1)*.19,(n%3-1)*.14]};
 }
 const w=wordsV025[index%wordsV025.length];w.age=0;w.index=index;w.e.textContent=word;
 return r;
};
const gameV025=updateGame;
updateGame=function(dt){
 const active=state.mode==='playing',phase=duelV022.phase;
 const incoming=active&&['rush','settle'].includes(phase)?rushBallsV022.filter(b=>b.volley&&b.age<.3):[];
 const r=gameV025(dt);if(state.mode==='paused')return r;
 barrageV025.lastSwing+=dt;wordsV025.forEach(w=>w.age+=dt);
 if(!active)return r;
 barrageV025.hitAge+=dt;barrageV025.heat=Math.max(0,barrageV025.heat-dt*.9);
 for(const b of incoming)if(b.age>=.3){
  barrageV025.hits++;barrageV025.energy=Math.min(1,barrageV025.energy+.027);barrageV025.heat=Math.min(1,barrageV025.heat+.13);barrageV025.hitAge=0;barrageV025.hitSide=b.volley.spread?.[2]<0?-1:1;
 }
 if(phase==='rush'&&duelV022.phase==='settle'){audio.stopVoice();barrageV025.finishHit=false;}
 if(duelV022.phase==='settle'&&duelV022.time>=FINISH_CONTACT_V025&&!barrageV025.finishHit){
  barrageV025.finishHit=true;barrageV025.hitAge=0;audio.hit(false,4,true);
 }
 return r;
};
const prepareV025=prepareDepthRenderV022;
prepareDepthRenderV022=function(){prepareV025();if(!feelEnabledV023||!['rush','settle'].includes(duelV022.phase))return;
 for(const b of rushBallsV022)if(b.n.visible&&b.volley){const t=clamp01V011(b.age/.3),v=b.volley;b.n.pos=v.from.map((x,i)=>x+(v.to[i]-x)*t);b.n.pos[1]+=Math.sin(t*Math.PI)*v.arc;b.n.rot[0]=t*10;b.n.rot[2]=t*14;}
 if(motion&&duelV022.phase==='rush'){cpu.n.rot[0]+=.10*Math.sin(barrageV025.serial*1.7)*Math.min(1,feelV023.pulse*6);cpu.n.rot[2]+=.12*Math.cos(barrageV025.serial*2.3)*Math.min(1,feelV023.pulse*6);}
};
function prepareBarrageV025(){
 finishBallV025.visible=false;barrageV025.center=null;barrageV025.light=0;
 const phase=duelV022.phase,t=duelV022.time;
 if(!feelEnabledV023||!['rush','settle'].includes(phase)||!['playing','paused'].includes(state.mode))return;
 const save=n=>{restoreRenderV022.push([n,n.pos,n.rot]);n.pos=[...n.pos];n.rot=[...n.rot];};
 const energy=barrageV025.energy,heat=barrageV025.heat,snap=Math.pow(Math.max(0,1-barrageV025.hitAge/.18),2),settle=phase==='settle';
 const release=settle?easeV023(t,FINISH_CONTACT_V025,FINISH_CONTACT_V025+.085):0;
 const tail=settle?1-easeV023(t,.63,.85):1;
 if(motion){
  save(cpu.n);save(cpu.body);save(cpu.head);
  cpu.n.rot[2]=settle?.22+1.03*easeV023(t,FINISH_CONTACT_V025,.72):.18+.13*snap;
  cpu.n.pos[1]=.16+(settle?.19*release:.025*energy);cpu.n.pos[0]+=.08*snap;
  cpu.body.rot[0]+=.08*snap*barrageV025.hitSide;cpu.body.rot[2]-=.10*snap;cpu.head.rot[2]-=.13*snap;
  if(!settle){
   // A low, steady brace under the existing alternating kicks. Render-only.
   for(const key of ['body','arm','farArm'])save(player[key]);
   const brace=.65+.35*energy;player.body.pos[1]-=.085*brace;player.body.rot[2]-=.075*brace;
   player.arm.rot[2]-=.10*brace;player.farArm.rot[2]+=.10*brace;
  }
  if(settle){
   for(const key of KICK_NODES_V011)save(player[key]);
   if(t<.14){player.body.pos[1]-=.14;player.body.rot[2]-=.23;player.arm.rot[2]-=.35;}
   else strikePoseV024(player,{attack:.12+(t-.14)*.8,age:99,slot:0},save);
  }
  const push=(.10*energy+.075*heat)*(renderer.height<300?.45:1)*(settle?1-easeV023(t,.48,.85):easeV023(t,0,.45));
  renderer.zoom+=push;
  const shift=(cpu.n.pos[0]+player.n.pos[0])*.09*energy;
  renderer.target[0]+=shift;renderer.eye[0]+=shift;
  const recoil=(settle?.065:.025)*snap*(settle?release:heat);
  renderer.shake=[recoil*barrageV025.hitSide,-recoil*.45];
 }
 const center=typeof campaignChestV030==='function'?campaignChestV030(cpu):[cpu.n.pos[0],1.3,cpu.n.pos[2]];
 barrageV025.center=[...center];
 for(const b of rushBallsV022)if(b.n.visible&&b.volley){
  const v=b.volley,u=clamp01V011(b.age/.3);v.to=center.map((x,i)=>x+(v.spread?.[i]||0));
  b.n.pos=v.from.map((x,i)=>x+(v.to[i]-x)*u);b.n.pos[1]+=Math.sin(u*Math.PI)*v.arc;
 }
 if(settle&&t>=.14&&t<FINISH_CONTACT_V025){
  const u=clamp01V011((t-.14)/(FINISH_CONTACT_V025-.14)),from=[player.n.pos[0]+.65,.95,player.n.pos[2]];
  finishBallV025.visible=true;finishBallV025.pos=from.map((x,i)=>x+(center[i]-x)*u);finishBallV025.pos[1]+=.2*Math.sin(u*Math.PI);
  const size=motion?1.4+1.1*energy:1;finishBallV025.scale=[size*(1+.35*u),size,size];finishBallV025.rot=[u*9,0,u*14];
 }
 if(!motion)return;
 const light=(settle?(energy*.72+release*(1.05+energy*.25))*tail:energy*(.58+.14*snap));barrageV025.light=light;
 const tint=settle?Math.min(.96,(energy*.22+release*.85)*tail):energy*.22;
 const walk=n=>{if(n.geo){lightRestoreV025.push([n,n.color,n.unlit]);n.color=n.color.map((x,i)=>x+( [1,.92,.67][i]-x)*tint);n.unlit=Math.max(n.unlit||0,tint);}for(const child of n.children)walk(child);};
 walk(cpu.n);
}
const sceneV025=updateScene;
updateScene=function(dt){sceneV025(dt);
 const button=$('#kick');
 if(rushEndedV025()){
  button.disabled=false;button.classList.add('rush-ended-input');
  button.setAttribute('aria-disabled','true');button.tabIndex=-1;
 }else if(button.classList.contains('rush-ended-input')){
  button.classList.remove('rush-ended-input');button.removeAttribute('aria-disabled');button.removeAttribute('tabindex');
 }
 if(!feelEnabledV023)return;
 const active=['rush','settle'].includes(duelV022.phase)&&['playing','paused'].includes(state.mode);
 $('#arena').classList.toggle('barrage-v025',active);
 if(!active){wordsV025.forEach(w=>w.e.hidden=true);glowV025.hidden=true;return;}
 if(active){wordV023.hidden=true;wordBallsV023.forEach(e=>e.hidden=true);}
 const width=renderer.width,height=renderer.height,compact=height<300,settle=duelV022.phase==='settle',energy=barrageV025.energy;
 const arenaRect=$('#arena').getBoundingClientRect(),hudRect=$('.hud').getBoundingClientRect();
 const top=Math.max(compact?58:90,hudRect.bottom-arenaRect.top+12),bottom=height-12;
 const slots=[[.10,.23],[.84,.77],[.20,.82],[.74,.19],[.08,.57],[.91,.43],[.38,.09],[.61,.91],[.32,.63],[.69,.59],[.49,.31],[.50,.76]];
 wordsV025.forEach(w=>{
  const life=motion?.64+energy*.20:.55,latest=w.index===barrageV025.serial-1;
  w.e.hidden=!active||state.mode==='paused'||w.age>=life||(settle&&duelV022.time>=.16)||(!motion&&!latest)||(compact&&barrageV025.serial-w.index>8);
  if(w.e.hidden)return;
  const size=motion?(compact?23:Math.min(44,28+width*.017))+(w.index%3)*3+energy*(compact?3:8):24;
  w.e.style.fontSize=Math.min(size,(width-24)/Math.max(2,w.e.textContent.length)*1.2)+'px';
  const angle=motion?[-13,11,-7,16,-10,8][w.index%6]:0,radians=angle*Math.PI/180,scale=motion?1+.30*(1-easeV023(w.age,0,.13)):1;
  const ew=w.e.offsetWidth||w.e.textContent.length*size*.65,eh=w.e.offsetHeight||size;
  const halfW=(Math.abs(Math.cos(radians))*ew+Math.abs(Math.sin(radians))*eh)*scale/2+6,halfH=(Math.abs(Math.sin(radians))*ew+Math.abs(Math.cos(radians))*eh)*scale/2+6;
  const [u,v]=motion?slots[w.index%slots.length]:[.5,.35],x=Math.max(halfW,Math.min(width-halfW,width*u)),y=Math.max(top+halfH,Math.min(bottom-halfH,top+(bottom-top)*v));
  w.e.style.left=x+'px';w.e.style.top=y+'px';w.e.style.transform='translate(-50%,-50%) rotate('+angle+'deg) scale('+scale+')';
  w.e.style.opacity=String((1-easeV023(w.age,life-.24,life))*(settle?1-duelV022.time/.16:1));
  w.e.style.color=latest?'#fff8dc':w.index%3===0?'#ffc779':'#ffe7a6';w.e.style.zIndex=latest?'5':'4';
 });
 glowV025.hidden=!active||!motion||!barrageV025.center||barrageV025.light<=.001;
 if(!glowV025.hidden){
  const center=barrageV025.center,[x,y]=renderer.project(center),up=renderer.project([center[0],center[1]+1,center[2]]),unit=Math.max(16,Math.hypot(up[0]-x,up[1]-y));
  const release=settle?easeV023(duelV022.time,FINISH_CONTACT_V025,.55):0,size=unit*(1.3+energy*3.1+release*6);
  glowV025.style.left=x+'px';glowV025.style.top=y+'px';glowV025.style.width=size+'px';glowV025.style.height=size+'px';glowV025.style.opacity=String(Math.min(1,barrageV025.light));
  const ring=glowV025.firstChild;ring.style.opacity=String(settle?release*(1-easeV023(duelV022.time,.45,.75))*.8:0);ring.style.transform='scale('+(1+release*.5)+')';
 }
};
$('#start').addEventListener('click',start);`);
 return html;
};
