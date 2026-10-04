'use strict';
// Geometry/contact invariants for the dynamic bell striker. No GPU or audio claim.
const assert=require('node:assert/strict');
const {create}=require('./scenery-v030.cjs');
const scene=create('chion');
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
const same=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-6);
// Scenery bakes neutral base/underside shading into vertex colors. Select the
// bell material by chromaticity so its darker bottom vertices still participate
// in the bounds/contact check; the geometry and tolerances remain unchanged.
const sameMaterial=(a,b)=>{const ratio=a[0]/b[0];return ratio>=.75&&ratio<=1.01&&a.every((v,i)=>Math.abs(v-b[i]*ratio)<1e-6);};
function records(node,parents=[],out=[]){out.push({node,parents});for(const child of node.children)records(child,[node,...parents],out);return out;}
function transform(p,n){let[x,y,z]=p.map((v,i)=>v*n.scale[i]);let c=Math.cos(n.rot[0]),s=Math.sin(n.rot[0]);[y,z]=[y*c-z*s,y*s+z*c];c=Math.cos(n.rot[1]);s=Math.sin(n.rot[1]);[x,z]=[x*c+z*s,-x*s+z*c];c=Math.cos(n.rot[2]);s=Math.sin(n.rot[2]);return[x*c-y*s+n.pos[0],x*s+y*c+n.pos[1],z+n.pos[2]];}
function points(record,tint){const n=record.node,g=n.geo,out=[];if(!g)return out;for(let i=0;i<g.p.length;i+=3){const color=g.c?Array.from(g.c.slice(i,i+3)):n.color;if(tint&&!sameMaterial(color,rgb(tint)))continue;out.push([n,...record.parents].reduce((p,node)=>transform(p,node),Array.from(g.p.slice(i,i+3))));}return out;}
function bounds(pts){assert(pts.length);return[0,1,2].map(i=>[Math.min(...pts.map(p=>p[i])),Math.max(...pts.map(p=>p[i]))]);}
const all=records(scene.root),log=all.find(r=>r.node.geo&&same(r.node.color,rgb('#977251')));
const bell=all.find(r=>points(r,'#445f5e').length),support=all.find(r=>points(r,'#594239').length);
assert(log&&bell&&support,'bell, roof support and movable wooden striker exist');
const hammer=log.parents[0],tower=bell.parents[1];
assert.equal(log.parents[1],tower,'striker inherits the bell pavilion height and cutaway');
assert.equal(support.parents[1],tower);
const bellBox=bounds(points(bell,'#445f5e')),supportBox=bounds(points(support,'#594239'));
let logBox=bounds(points(log));
assert(Math.abs(logBox[0][0]-bellBox[0][1])<.08,'striker tip reaches the bell rim, not a disconnected floating log');
assert(Math.abs((logBox[1][0]+logBox[1][1]-bellBox[1][0]-bellBox[1][1])/2)<.08,'striker strikes at the bell body height');
const hand=all.flatMap(r=>points(r,'#aa9170')),handle=[logBox[0][1],(logBox[1][0]+logBox[1][1])/2,(logBox[2][0]+logBox[2][1])/2];
assert(hand.length&&Math.min(...hand.map(p=>Math.hypot(...p.map((v,i)=>v-handle[i]))))<.15,'the monk can reach the striker handle');
const ropes=all.filter(r=>r.parents[0]===hammer&&r.node.geo&&same(r.node.color,rgb('#433d3b')));
assert.equal(ropes.length,2);
for(const rope of ropes){const box=bounds(points(rope));assert(box[1][1]>=supportBox[1][0]&&box[1][1]<=supportBox[1][1],'suspension reaches the actual roof beam');}
let minGap=Infinity,maxGap=-Infinity;
for(let i=0;i<100;i++){scene.tick(.1);logBox=bounds(points(log));const gap=logBox[0][0]-bellBox[0][1];minGap=Math.min(minGap,gap);maxGap=Math.max(maxGap,gap);}
assert(minGap<.02&&minGap>-.16&&maxGap<.21,'swing reaches the bell while remaining suspended nearby');
let cutaways=0;
for(let i=0;i<24;i++){scene.draw(false,i*Math.PI/12);if(!tower.visible){cutaways++;assert(![log.node,...log.parents].every(n=>n.visible),'striker disappears with its pavilion during camera orbit');}}
assert(cutaways>0,'the camera exercised a foreground cutaway');
console.log(JSON.stringify({passed:true,scene:'CHION',strikerGap:[minGap,maxGap],cutawayViews:cutaways,rendering:'native scene geometry; no GPU or device claim'},null,2));
