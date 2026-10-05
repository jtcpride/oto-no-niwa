window.otoPatchRushV025=function(html){
 function replaceOnce(a,b){if(html.split(a).length!==2)throw Error('v0.25 anchor: '+a.slice(0,60));html=html.replace(a,b);}
 replaceOnce("version:'0.24.0-step-and-strike'","version:'0.25.0-vocabulary-barrage'");
 replaceOnce('FIFTEENTH EVER GARDEN — v0.24.0','FIFTEENTH EVER GARDEN — v0.25.0');
 replaceOnce('</style>',`.rush-word-v025{position:absolute;z-index:4;pointer-events:none;color:#fff1c5;text-shadow:2px 2px 0 #782f27,0 2px 7px #101b20;font:700 clamp(21px,3vw,34px)/1 Georgia,serif;white-space:nowrap;transform:translate(-50%,-50%)}.rush-word-v025[hidden]{display:none}.barrage-v025 #playerLabel,.barrage-v025 #cpuLabel{visibility:hidden}.barrage-v025 + .console .kick{padding:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}.barrage-v025 + .console .kick span{white-space:nowrap;font-size:18px;line-height:1.15}.barrage-v025 + .console .kick small{font-size:10px;line-height:1;margin:0}</style>`);
 replaceOnce('</style>','.kick.rush-ended-input{cursor:default;opacity:.5}</style>');
 replaceOnce("$('#kick').addEventListener('pointerdown',e=>{e.preventDefault();kick()});$('#kick').addEventListener('click',e=>{if(e.detail===0)kick()});",String.raw`
$('#kick').addEventListener('pointerdown',e=>{e.preventDefault();if(!rushEndedV025())kick()});
$('#kick').addEventListener('click',e=>{if(rushEndedV025())e.preventDefault();else if(e.detail===0)kick()});
$('#kick').addEventListener('touchstart',e=>{if(rushEndedV025())e.preventDefault()},{passive:false});`);
 replaceOnce("$('#start').addEventListener('click',start);",String.raw`
// Keep an inert event surface after the rush: leftover taps must not zoom the page.
const rushEndedV025=()=>['settle','done'].includes(duelV022.phase);
const barrageV025={serial:0,technique:0,lastSwing:99};
const wordsV025=feelEnabledV023?Array.from({length:12},()=>{const e=document.createElement('span');e.className='rush-word-v025';e.hidden=true;$('#arena').appendChild(e);return {e,age:99,index:0};}):[];
const resetV025=resetDuelV022;
resetDuelV022=function(keep=false){resetV025(keep);Object.assign(barrageV025,{serial:0,technique:0,lastSwing:99});wordsV025.forEach(w=>{w.age=99;w.e.hidden=true;});rushBallsV022.forEach(b=>b.volley=null);$('#arena').classList.remove('barrage-v025');};
const kickV025=kick;
kick=function(){
 const taps=duelV022.taps,oldSlot=strideV024.player.slot,oldAttack=strideV024.player.attack,r=kickV025();
 if(!feelEnabledV023||duelV022.taps===taps)return r;
 // Technique sequence is independent of tap cadence: fast tapping cannot alias into one kick.
 if(barrageV025.lastSwing>=.14){strideV024.player.slot=barrageV025.technique++%4;strideV024.player.attack=.12;barrageV025.lastSwing=0;}
 else{strideV024.player.slot=oldSlot;strideV024.player.attack=oldAttack;}
 const index=barrageV025.serial++,word=feelV023.word,z=depthOffsetV022(),px=-3.78+foot.x+strideV024.player.x,cx=4.4+strideV024.cpu.x;
 const sources=[[px,.85,z],[px-1.5,2.9,z+.8],[cx+1.7,3.7,z-.7],[px+.5,3.9,z-1.1],[px-1.3,.45,z+1],[cx+1.4,.65,z+.8]];
 for(let j=0;j<(motion?3:1);j++){
  const b=rushBallsV022[(taps+j*5)%rushBallsV022.length],n=index*3+j;
  b.age=0;b.slot=n%4;b.word=word;b.n.visible=true;
  b.volley={from:[...sources[motion?n%sources.length:0]],to:[cx-.2,1.0+(n%4)*.32,z+(n%3-1)*.13],arc:j===0?.14:.5};
 }
 const w=wordsV025[index%wordsV025.length];w.age=0;w.index=index;w.e.textContent=word;
 return r;
};
const gameV025=updateGame;
updateGame=function(dt){const paused=state.mode==='paused',r=gameV025(dt);if(!paused){barrageV025.lastSwing+=dt;wordsV025.forEach(w=>w.age+=dt);}return r;};
const prepareV025=prepareDepthRenderV022;
prepareDepthRenderV022=function(){prepareV025();if(!feelEnabledV023||!['rush','settle'].includes(duelV022.phase))return;
 for(const b of rushBallsV022)if(b.n.visible&&b.volley){const t=clamp01V011(b.age/.3),v=b.volley;b.n.pos=v.from.map((x,i)=>x+(v.to[i]-x)*t);b.n.pos[1]+=Math.sin(t*Math.PI)*v.arc;b.n.rot[0]=t*10;b.n.rot[2]=t*14;}
 if(motion&&duelV022.phase==='rush'){cpu.n.rot[0]+=.10*Math.sin(barrageV025.serial*1.7)*Math.min(1,feelV023.pulse*6);cpu.n.rot[2]+=.12*Math.cos(barrageV025.serial*2.3)*Math.min(1,feelV023.pulse*6);}
};
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
 if(active){wordV023.hidden=true;wordBallsV023.forEach(e=>e.hidden=true);}
 wordsV025.forEach(w=>{
  w.e.hidden=!active||state.mode==='paused'||w.age>=.55||(!motion&&w.index!==barrageV025.serial-1)||(renderer.height<300&&barrageV025.serial-w.index>6);
  if(w.e.hidden)return;
  const width=renderer.width,height=renderer.height,compact=height<300;
  w.e.style.fontSize=(motion?(compact?20+(w.index%2)*2:24+(w.index%3)*4):24)+'px';
  const margin=Math.min(width/2,(w.e.offsetWidth||w.e.textContent.length*20)/2+10);
  const u=motion?(compact?(w.index%3+.5)/3:((w.index*7)%13)/12):.5,v=motion?(compact?Math.floor(w.index/3)%2:((w.index*5)%11)/10):.3;
  w.e.style.left=(compact?Math.max(margin,Math.min(width-margin,width*u)):margin+u*Math.max(0,width-2*margin))+'px';
  w.e.style.top=(140+v*Math.max(0,height-175)-(motion?Math.min(w.age,.35)*18:0))+'px';
  w.e.style.opacity=String(Math.max(0,1-Math.max(0,w.age-.30)/.25));

 });
};
$('#start').addEventListener('click',start);`);
 return html;
};
