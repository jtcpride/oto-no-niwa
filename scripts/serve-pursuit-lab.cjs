'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assemble=require('../tests/assemble.cjs');
function labGame(){
 const source=assemble(),anchor='select(0);refreshHud();requestAnimationFrame(frame);';
 if(source.split(anchor).length!==2)throw Error('Pursuit lab runtime seam changed');
 const isolation=`<script>
 const pursuitMemory=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>pursuitMemory.get(k)??null,setItem:(k,v)=>pursuitMemory.set(k,String(v)),removeItem:k=>pursuitMemory.delete(k),clear:()=>pursuitMemory.clear()}});
 window.__pursuitSeed=318;Math.random=()=>((window.__pursuitSeed=(Math.imul(window.__pursuitSeed,1664525)+1013904223)>>>0)/4294967296);
 <\/script>`;
 return source.replace('<head>','<head>'+isolation).replace(anchor,fs.readFileSync(path.join(root,'tools/pursuit-hook.js'),'utf8'));
}
function createServer(){return http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/__pursuit-game'){
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(labGame());
  }
  const relative=decodeURIComponent(url.pathname==='/'?'/tools/pursuit-lab.html':url.pathname).replace(/^\/+/,''),file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)||relative.split('/').some(p=>p.startsWith('.'))||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('Not found');}
  const type={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.mp4':'video/mp4','.mp3':'audio/mpeg','.css':'text/css'}[path.extname(file)]||'text/plain';
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
 }catch(error){res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});res.end(error.message);}
 });}
module.exports={createServer,labGame};
if(require.main===module){const port=Number(process.env.FEG_LAB_PORT||8770);createServer().listen(port,'127.0.0.1',()=>console.log(`FEG 調整室: http://127.0.0.1:${port}/`));}
