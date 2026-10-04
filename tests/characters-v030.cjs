'use strict';
// Deterministic geometry + real animation/IK tests. Renderer records commands without executing WebGL:
// this suite does not claim GPU/WebGL, audible TTS, or device acceptance.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const html=process.argv[2]?fs.readFileSync(process.argv[2],'utf8'):require('./assemble.cjs')();
function load(stage){
 const {vmFixture}=require('./complete-browser-v030.cjs');
 const seam=`window.ct={root,player,cpu,renderer,state,duelV022,closeV027,dramaV028,motionV029,strideV024,pose,launchShot,select,kick,start,setMotion,beginMatch,updateScene,resetDuelV022,
 bow(){state.mode='playing';ceremony='bow-wait';bowAnim=.85;updateScene(0)},
 setup(){state.mode='over';if(typeof campaignV030!=='undefined'){campaignV030.phase='match';campaignV030.intro=false;audio.userChoice=true;audio.set(false);}start();beginMatch();state.mode='playing';duelV022.phase='front';updateScene(0)},
 draw(){updateScene(0)},
 close(o){Object.assign(closeV027,{origin:[0,0]},o);duelV022.phase='close';duelV022.entered=true;updateScene(0)},
 roots(){return JSON.stringify([player.n.pos,player.n.rot,cpu.n.pos,cpu.n.rot,...KICK_NODES_V011.map(k=>[player[k].pos,player[k].rot,cpu[k].pos,cpu[k].rot])])}
 };select(0);refreshHud();requestAnimationFrame(frame);`;
 const source=html.replace('select(0);refreshHud();requestAnimationFrame(frame);',seam);
 const fixture=vmFixture(source,{url:'http://characters.test/?stage='+stage,width:1280,height:800});
 return {window:fixture.w,fixture};
}
const rigCtx={window:{}};vm.createContext(rigCtx);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];vm.runInContext(scripts.find(s=>s[1].includes('GardenGL 0.1'))[1],rigCtx);
for(const f of ['content/characters.js','characters/seven-rigs.js'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'),rigCtx);
const G=rigCtx.window.GardenGL,geom={box:G.box(),ico:G.ico(),cyl:G.cylinder(1,1,8),cone:G.cylinder(0,1,5),robe:G.cylinder(.65,1,6),head:G.cylinder(.8,.9,6)};
function transform(p,n){let[x,y,z]=p.map((v,i)=>v*n.scale[i]);let[c,s]=[Math.cos(n.rot[0]),Math.sin(n.rot[0])];[y,z]=[y*c-z*s,y*s+z*c];[c,s]=[Math.cos(n.rot[1]),Math.sin(n.rot[1])];[x,z]=[x*c+z*s,-x*s+z*c];[c,s]=[Math.cos(n.rot[2]),Math.sin(n.rot[2])];return [x*c-y*s+n.pos[0],x*s+y*c+n.pos[1],z+n.pos[2]];}
function triangles(node){const out=[];function visit(n,parents){if(!n.visible)return;const chain=[n,...parents];if(n.geo)for(let i=0;i<n.geo.p.length;i+=9){const v=[];for(let j=0;j<3;j++)v.push(chain.reduce((p,k)=>transform(p,k),Array.from(n.geo.p.slice(i+j*3,i+j*3+3))));out.push({v,c:Array.from(n.color),part:n.fegPart});}for(const c of n.children)visit(c,chain);}visit(node,[]);return out;}
function pointTriangleDistance(p,[a,b,c]){
 const sub=(u,v)=>u.map((n,i)=>n-v[i]),dot=(u,v)=>u.reduce((s,n,i)=>s+n*v[i],0),ab=sub(b,a),ac=sub(c,a),ap=sub(p,a);
 const aa=dot(ab,ab),bb=dot(ac,ac),d=dot(ab,ac),u=(dot(ap,ab)*bb-dot(ap,ac)*d)/(aa*bb-d*d),v=(dot(ap,ac)*aa-dot(ap,ab)*d)/(aa*bb-d*d);
 if(u>=0&&v>=0&&u+v<=1)return Math.hypot(...ap.map((n,i)=>n-u*ab[i]-v*ac[i]));
 return Math.min(...[[a,b],[b,c],[c,a]].map(([s,e])=>{const edge=sub(e,s),delta=sub(p,s),t=Math.max(0,Math.min(1,dot(delta,edge)/dot(edge,edge)));return Math.hypot(...delta.map((n,i)=>n-t*edge[i]));}));
}
const models=[],sigs=new Set();
for(const c of rigCtx.window.FEGContent.characters.filter(c=>!c.derivedFromPlayer)){
 const root=new G.Node(),group=(parent,pos=[0,0,0])=>{const n=new G.Node();n.pos=pos;parent.add(n);return n;},mesh=(parent,shape,tint,pos=[0,0,0],scale=[1,1,1],rot=[0,0,0],unlit=0)=>{const n=new G.Node(typeof shape==='string'?geom[shape]:shape,tint);Object.assign(n,{pos,scale,rot,unlit});parent.add(n);return n;};
 const f=rigCtx.window.FEGCharacterRigs.seven({root,group,mesh},0,c.appearance,1);
 for(const key of ['n','body','head','arm','farArm','leg','back','thigh','knee','shoe','backThigh','backKnee','backShoe','elbow','wrist','farElbow','farWrist','toe','backToe'])assert(f[key]?.pos&&f[key]?.rot,c.id+' '+key);
 assert.equal(f.knee.pos[1],-.48);assert.equal(f.backKnee.pos[1],-.48);assert.equal(f.shoe.pos[1],-.48);assert.equal(f.toe.pos[0],.16);
 const metadata=f.characterV030;sigs.add(metadata.profile.signature);assert(metadata.meshCount>=35,c.id+' actual detail');
 assert(metadata.meshCount<=76,c.id+' bounded mesh budget');
 const triangleCount=metadata.parts.reduce((sum,n)=>sum+n.geo.count/3,0);assert(triangleCount<=5000,c.id+' bounded low-poly budget');
 for(const n of metadata.parts){
  assert.equal(n.geo.p.length,n.geo.n.length,c.id+' geometry has matching normals');assert.equal(n.geo.p.length,n.geo.count*3,c.id+' draw count matches geometry');
  assert(Array.from(n.geo.p).every(Number.isFinite),c.id+' finite sculpted positions');
  assert(Array.from(n.geo.n).every(Number.isFinite),c.id+' finite surface normals');
  if(!Object.values(geom).includes(n.geo))for(let i=0;i<n.geo.n.length;i+=3)assert(Math.abs(Math.hypot(...n.geo.n.slice(i,i+3))-1)<1e-5,c.id+' nondegenerate sculpted surface normals');
 }
 const face=metadata.parts.find(n=>n.fegPart==='face'),faceTriangles=triangles(face);
 for(const tag of ['eye','pupil','upper-eyelid','mouth','eye-glint',c.id==='sokichi'?'thick-white-brow':'brow']){
  const features=metadata.parts.filter(n=>n.fegPart===tag);assert(tag==='mouth'?features.length>=1&&features.length<=2:features.length===2,c.id+' '+tag+' present');
  for(const feature of features){
   assert(Math.min(...faceTriangles.map(t=>pointTriangleDistance(feature.pos,t.v)))<.02,c.id+' '+tag+' centre attached');
   for(const t of triangles(feature)){
    const p=t.v[0].map((_,i)=>t.v.reduce((s,v)=>s+v[i]/3,0));let front=-Infinity;
    for(const {v:[a,b,d]} of faceTriangles){const den=(b[2]-d[2])*(a[1]-d[1])+(d[1]-b[1])*(a[2]-d[2]);if(Math.abs(den)<1e-9)continue;const u=((b[2]-d[2])*(p[1]-d[1])+(d[1]-b[1])*(p[2]-d[2]))/den,v=((d[2]-a[2])*(p[1]-d[1])+(a[1]-d[1])*(p[2]-d[2]))/den;if(u>=-1e-7&&v>=-1e-7&&u+v<=1.0000001)front=Math.max(front,u*a[0]+v*b[0]+(1-u-v)*d[0]);}
    assert(p[0]-front>.0005&&p[0]-front<.007,c.id+' '+tag+' triangle interior neither clips into nor floats off face');
   }
  }
 }
 if(c.id==='luka'){
  assert.equal(metadata.parts.filter(n=>n.fegPart==='bare-upper-arm').length,2);assert.equal(metadata.parts.filter(n=>n.fegPart==='bare-forearm').length,2);
  assert(!metadata.parts.some(n=>['upper-sleeve','fore-sleeve'].includes(n.fegPart)),'Luka skin is not buried inside a larger sleeve');
  const ys=n=>triangles(n).flatMap(t=>t.v.map(p=>p[1])),neck=ys(metadata.parts.find(n=>n.fegPart==='neck')),shirt=ys(metadata.parts.find(n=>n.fegPart==='rust-inner'));
  assert(Math.min(...neck)<Math.max(...shirt)&&Math.max(...neck)>Math.min(...ys(face))+f.head.pos[1],'Luka neck joins both torso and head');
 }
 const t=triangles(f.n),ys=t.flatMap(t=>t.v.map(p=>p[1]));const maxY=Math.max(...ys),minY=Math.min(...ys);models.push({id:c.id,height:maxY-minY,triangles:t,triangleCount,parts:metadata.meshCount});
 // Shadow factory must preserve every vertex and named joint, with a black palette.
 const shadow=rigCtx.window.FEGCharacterRigs.seven({root,group,mesh},0,{...c.appearance,shadow:true},1),st=triangles(shadow.n);
 assert.equal(JSON.stringify(t.map(t=>t.v)),JSON.stringify(st.map(t=>t.v)));assert(st.every(t=>t.c.every(v=>v<.12)));
}
assert.equal(sigs.size,7);assert(models.find(m=>m.id==='kota').height<models.find(m=>m.id==='toru').height*.85,'child visibly smaller');assert(models.find(m=>m.id==='luka').height>models.find(m=>m.id==='toru').height*1.08,'Luka visibly taller');
const STAGES={saku:'jingu',sokichi:'gendo',sumi:'chion',nagi:'sanjo',kota:'shinkyogoku',luka:'million',shadow:'gion'};
const contentMatch=html.match(/const STAGE_CONTENT=([^\n]+);/),runtimeStages=JSON.parse(contentMatch[1]).stages;
let contacts=0;
for(const id of Object.keys(STAGES)){
 const stage=runtimeStages.find(s=>s.opponent===id)?.id||STAGES[id],ctx=load(stage),g=ctx.window.ct;assert(g,'runtime initialized');
 assert.equal(g.cpu.characterId,id);g.setup();
 for(const actor of [g.player,g.cpu])assert(actor.characterV030,'seven rig active');
 for(let slot=0;slot<4;slot++){
  g.select(slot);g.state.target=slot;g.state.pendingMiss=null;g.state.hitstop=0;g.launchShot('normal',-1,[3.3,1.2,0]);g.draw();
  let hit=g.motionV029.contactFoot;assert(Math.hypot(...hit.foot.map((v,i)=>v-hit.point[i]))<.10,id+' CPU foot contact');contacts++;
  g.state.flight=g.state.duration;g.kick();g.draw();hit=g.motionV029.contactFoot;assert(Math.hypot(...hit.foot.map((v,i)=>v-hit.point[i]))<.10,id+' player foot contact');contacts++;
 }
 const before=g.roots();for(let n=0;n<30;n++)g.draw();assert.equal(g.roots(),before,id+' no accumulated transforms');
 ctx.window.kemari.setGodMode(true);assert(g.player.characterV030.glow.every(n=>n.visible));assert(g.cpu.characterV030.glow.every(n=>!n.visible));ctx.window.kemari.setGodMode(false);assert(g.player.characterV030.glow.every(n=>!n.visible));
 // Enable the common close presentation in the isolated fixture, independently of stage.
 // The integrated acceptance suite additionally checks naturally reached close exchanges.
 if(stage==='first-court'||!html.includes("const feelEnabledV023=ACTIVE_STAGE.id==='first-court'")){
  for(const turn of [0,1])for(let target=0;target<4;target++){
   g.close({stage:'react',turn,correct:true,target,picked:target,time:.24});
   assert(Math.hypot(...g.dramaV028.foot.map((v,i)=>v-g.dramaV028.contact[i]))<.05,id+' close contact '+JSON.stringify({turn,target,foot:g.dramaV028.foot,contact:g.dramaV028.contact}));contacts++;
  }
 }
 ctx.fixture.close();
}
const out=process.env.FEG_CHARACTER_GEOMETRY;if(out)fs.writeFileSync(out,JSON.stringify(models));
console.log(JSON.stringify({passed:true,models:models.map(({id,height,parts,triangleCount})=>({id,height,parts,triangleCount})),uniqueSilhouettes:sigs.size,contactChecks:contacts,rendering:'VM WebGL command recorder; GPU and real-device audio not tested'},null,2));
