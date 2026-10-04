'use strict';
// Side-by-side revisions of the real game renderer at phone sizes, no UI automation.
// Supply the pre-refinement Git revision; only the rig factory is replaced for comparison.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process'),{chromium}=require('playwright');
const {sourceSeam}=require('./complete-browser-v030.cjs');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.FEG_CHARACTER_ART_DIR||'../work/characters-art');
const base=process.argv[2];assert(base,'Usage: node tests/characters-game-art-v030.cjs <pre-refinement-git-revision>');
function factory(source){const c={window:{}};vm.createContext(c);vm.runInContext(source,c);return c.window.FEGCharacterRigs.seven.toString();}
const oldFactory=factory(execFileSync('git',['show',base+':characters/seven-rigs.js'],{cwd:ROOT,encoding:'utf8'})),newFactory=factory(fs.readFileSync(path.join(ROOT,'characters/seven-rigs.js'),'utf8'));
const html=require('./assemble.cjs')(),anchor='select(0);refreshHud();requestAnimationFrame(frame);';assert.equal(html.split(newFactory).length,2);
const variants={before:html.replace(newFactory,oldFactory),after:html};
for(const key of Object.keys(variants))variants[key]=sourceSeam(variants[key].replace(anchor,'window.characterArtMotion=motionV029;'+anchor));
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.__artRAF=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return[]},speak(u){u.onstart?.();u.onend?.()}}});});
 await page.route('http://character-game.test/**',route=>{
  const url=new URL(route.request().url());
  if(/^\/audio\/voice-v03[23]\/[0-9a-z-]+\.mp3$/.test(url.pathname))return route.fulfill({contentType:'audio/mpeg',body:fs.readFileSync(path.join(ROOT,url.pathname.slice(1)))});
  return route.fulfill({contentType:'text/html',body:variants[url.searchParams.get('variant')]});
 });
 async function capture(variant,stage,pose,width,height){
  await page.setViewportSize({width,height});await page.goto('http://character-game.test/?stage='+stage+'&variant='+variant);await page.waitForFunction(()=>window.qa);
  const result=await page.evaluate(pose=>{
   qa.campaign.phase='match';qa.campaign.intro=false;document.body.classList.remove('campaign-screen','campaign-cinematic');document.querySelector('#campaignUI').hidden=true;document.querySelector('#intro').hidden=true;document.querySelector('#overlay').hidden=true;qa.begin();
   qa.select(0);qa.state.target=0;qa.launchShot('normal',-1,[3.3,1.2,0]);characterArtMotion.cpu.age=pose==='kick'?.18:99;characterArtMotion.player.age=99;
   if(pose==='close'){qa.duel.phase='close';qa.duel.entered=true;Object.assign(qa.close,{stage:'react',time:.24,turn:0,target:1,picked:1,correct:true,origin:[0,0]});}
   qa.draw();return{characters:kemari.getCharacters(),frame:__qaFrame,stats:qa.renderStats()};
  },pose);
  assert.equal(result.stats.error,0);assert(!/swiftshader|software/i.test(result.stats.renderer));assert(result.stats.sampledColors>8);
  await page.evaluate(()=>new Promise(resolve=>__artRAF(()=>__artRAF(resolve))));const file=variant+'-'+stage+'-'+pose+'-'+width+'x'+height+'.png';await page.screenshot({path:path.join(OUT,file)});checks.push({file,...result});
 }
 try{for(const variant of ['before','after']){for(const stage of ['jingu','gendo','chion','sanjo','shinkyogoku','million'])await capture(variant,stage,'kick',390,844);for(const pose of ['idle','kick','close'])await capture(variant,'million',pose,844,390);}assert.equal(errors.length,0,JSON.stringify(errors));fs.writeFileSync(path.join(OUT,'game-comparison-report.json'),JSON.stringify({passed:true,base,checks},null,2)+'\n');console.log(JSON.stringify({passed:true,base,screenshots:checks.length,out:OUT},null,2));}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
