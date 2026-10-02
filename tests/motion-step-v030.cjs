'use strict';
// Presentation-only stepping: measure stance feet, boundaries and restoration.
const assert=require('node:assert/strict');
const {vmFixture}=require('./complete-browser-v030.cjs');
const assemble=require('./assemble.cjs');
const anchor='select(0);refreshHud();requestAnimationFrame(frame);';
const source=assemble().replace(anchor,String.raw`
window.stepQA={set(side,age){const a=strideV024[side];Object.assign(a,{from:0,to:side==='player'?1.2:-1.2,age,attack:age,slot:0});a.x=a.from+(a.to-a.from)*easeV023(age,.42,.88);duelV022.entered=true;duelV022.phase='back';motionV029[side].point=null;updateScene(0);},
 roots(){return JSON.stringify([player.n.pos,player.n.rot,cpu.n.pos,cpu.n.rot,...KICK_NODES_V011.map(k=>[player[k].pos,player[k].rot,cpu[k].pos,cpu[k].rot])])}};
const stepRender=renderer.render.bind(renderer);renderer.render=function(scene){stepRender(scene);stepQA.draw=Object.fromEntries([['player',player],['cpu',cpu]].map(([key,f])=>[key,{root:[...f.n.pos],leg:footMotionV029(f,'leg'),back:footMotionV029(f,'back'),ankles:[f.shoe.rot[2],f.backShoe.rot[2]]}]));};
`+anchor);
const results=[];
for(const stage of ['jingu','chion','shinkyogoku'])for(const side of ['player','cpu']){
 const f=vmFixture(source,{url:'http://feg-qa.test/?stage='+stage}),q=f.w.qa,p=f.w.stepQA;
 try{
  q.begin();const frames=[];
  for(let n=430;n<=870;n+=5){p.set(side,n/1000);frames.push({age:n/1000,...JSON.parse(JSON.stringify(p.draw[side]))});}
  const drift=(key,min,max)=>{const a=frames.filter(x=>x.age>=min&&x.age<=max),origin=a[0][key];return {max:Math.max(...a.map(x=>Math.hypot(x[key][0]-origin[0],x[key][2]-origin[2]))),vertical:Math.max(...a.map(x=>x[key][1]))-Math.min(...a.map(x=>x[key][1]))};};
  const first=drift('back',.46,.64),second=drift('leg',.66,.84);
  assert(first.max<.025,stage+' '+side+' rear stance foot slides '+first.max);assert(second.max<.025,stage+' '+side+' front stance foot slides '+second.max);
  assert(first.vertical<.02&&second.vertical<.02,stage+' planted feet must not hop');
  const limits=[];for(const edge of [.42,.88]){p.set(side,edge-.0001);const a=JSON.parse(JSON.stringify(p.draw[side]));p.set(side,edge+.0001);const b=JSON.parse(JSON.stringify(p.draw[side]));
   const root=Math.hypot(...b.root.map((v,i)=>v-a.root[i])),ankle=Math.max(...b.ankles.map((v,i)=>Math.abs(v-a.ankles[i])));
   assert(root<.002,stage+' root jumps at '+edge);assert(ankle<.002,stage+' ankle jumps at '+edge);limits.push({edge,root,ankle});}
  p.set(side,.65);const before=p.roots();for(let i=0;i<30;i++)q.draw();assert.equal(p.roots(),before,'repeated drawing cannot accumulate presentation offsets');
  q.setMotion(false);p.set(side,.65);assert(Math.abs(p.draw[side].root[1]-.12)<.001,'effects OFF keeps reduced original movement');
  results.push({stage,side,first,second,limits});assert.deepEqual(f.errors,[]);
 }finally{f.close()}
}
console.log(JSON.stringify({passed:true,results,verification:'Renderer math; native Chrome suit/hakama/child frames reviewed separately'}));
