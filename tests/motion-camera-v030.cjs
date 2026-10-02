'use strict';
// Real presentation math through the product renderer command recorder.
// No GPU or subjective motion-quality pass is claimed by this regression test.
const assert=require('node:assert/strict');
const {vmFixture}=require('./complete-browser-v030.cjs');
const assemble=require('./assemble.cjs');
const source=assemble(),checks=[];
for(const stage of ['jingu','gendo','chion','sanjo','shinkyogoku','million']){
 const f=vmFixture(source,{url:'http://feg-qa.test/?stage='+stage}),q=f.w.qa;
 try{
  q.begin();q.duel.phase='break';q.duel.entered=true;q.duel.time=3.4-1/120;q.draw();
  const before={eye:[...q.renderer.eye],target:[...q.renderer.target],zoom:q.renderer.zoom};
  q.tick(1/60);assert.equal(q.duel.phase,'back');
  const after={eye:[...q.renderer.eye],target:[...q.renderer.target],zoom:q.renderer.zoom};
  assert(Math.abs(after.zoom-before.zoom)<.001,stage+' no lens jump at pursuit handoff');
  assert(Math.hypot(...after.eye.map((v,i)=>v-before.eye[i]))<.01,stage+' camera position continuous');
  assert(Math.hypot(...after.target.map((v,i)=>v-before.target[i]))<.01,stage+' camera target continuous');
  const duration=q.state.duration,flight=q.state.flight;for(let i=0;i<20;i++)q.draw();
  assert.equal(q.state.duration,duration);assert.equal(q.state.flight,flight,'presentation does not advance gameplay');
  assert.equal(q.renderer.zoom,after.zoom,'redrawing cannot accumulate the lens adjustment');
  checks.push({stage,before,after});assert.deepEqual(f.errors,[]);
 }finally{f.close()}
}
console.log(JSON.stringify({passed:true,checks,verification:'Presentation math only; native Chrome comparison captured separately'}));
