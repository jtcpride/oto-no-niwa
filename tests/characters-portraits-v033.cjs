'use strict';
// Same production rig and renderer, deliberately exposing front/profile/three-quarter
// shape differences. This is a still-geometry review, not gameplay/device acceptance.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.FEG_CHARACTER_ART_DIR||'docs/art/v033-portraits');
const label=process.argv[2]||'portraits';fs.mkdirSync(OUT,{recursive:true});
const html=require('./assemble.cjs')(),engine=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('GardenGL 0.1'));
const source='<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#26323b;color:#e7e4d5;font:14px system-ui}h1{font-size:20px;margin:0 0 8px}p{margin:0 0 14px}section{display:grid;grid-template-columns:repeat(3,360px);gap:10px}section div{background:#34444f;text-align:center;padding-top:8px}canvas{display:block;width:360px;height:350px}</style></head><body><h1>Actual Three.js head study · '+label+'</h1><p>Three cameras share the production geometry, material and lighting. No image references are rendered.</p><section></section><script>'+engine+'</script><script>'+fs.readFileSync(path.join(ROOT,'rendering/three-runtime.js'),'utf8')+'; (0,eval)(window.FEGThreeSource);'+'</script><script>'+fs.readFileSync(path.join(ROOT,'content/characters.js'),'utf8')+'</script><script>'+fs.readFileSync(path.join(ROOT,'characters/seven-rigs.js'),'utf8')+'</script><script>'+String.raw`
const G=GardenGL,geometry={box:G.box(),ico:G.ico(),cyl:G.cylinder(1,1,8),cone:G.cylinder(0,1,5),robe:G.cylinder(.65,1,6),head:G.cylinder(.8,.9,6)},stats=[];
function group(p,pos=[0,0,0]){const n=new G.Node();n.pos=pos;p.add(n);return n;}
function mesh(p,shape,color,pos=[0,0,0],scale=[1,1,1],rot=[0,0,0],unlit=0){const n=new G.Node(typeof shape==='string'?geometry[shape]:shape,color);Object.assign(n,{pos,scale,rot,unlit});p.add(n);return n;}
for(const id of ['toru','sumi','nagi'])for(const view of ['front','three-quarter','profile']){
 const c=FEGContent.characters.find(c=>c.id===id),cell=document.createElement('div');cell.textContent=id+' · '+view;const canvas=document.createElement('canvas');cell.append(canvas);document.querySelector('section').append(cell);
 const root=new G.Node(),f=FEGCharacterRigs.seven({root,group,mesh},0,c.appearance,1),r=new FEGThreeRenderer(canvas),y=f.n.pos[1]+f.body.pos[1]+f.head.pos[1];r.gl.clearColor(.20,.265,.31,1);
 r.target=[0,y-.04,0];r.eye=view==='front'?[22,y+.9,0]:view==='profile'?[0,y+.9,22]:[18,y+1.4,13];r.zoom=12.4;r.render(root);
 const g=r.gl,x=g.getExtension('WEBGL_debug_renderer_info');stats.push({id,view,error:g.getError(),renderer:x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)});
}
window.portraits={stats};
`+'</script></body></html>';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{const page=await browser.newPage({viewport:{width:1140,height:1220}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent(source);assert.equal(errors.length,0,JSON.stringify(errors));await page.waitForFunction(()=>window.portraits);const stats=await page.evaluate(()=>portraits.stats);assert.equal(errors.length,0,JSON.stringify(errors));assert(stats.every(s=>s.error===0&&!/swiftshader|software/i.test(s.renderer)));await page.screenshot({path:path.join(OUT,label+'.png'),fullPage:true});fs.writeFileSync(path.join(OUT,label+'.json'),JSON.stringify({passed:true,stats},null,2));console.log(JSON.stringify({passed:true,out:OUT,views:stats.length},null,2));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
