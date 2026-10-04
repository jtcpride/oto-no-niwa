// Complete campaign around the unchanged v0.29.1 rally / ceremony kernel.
window.otoPatchCampaignV030=function(html){
 function once(a,b){if(html.split(a).length!==2)throw Error('v0.30 campaign anchor: '+a.slice(0,80));html=html.replace(a,b);}
 once("version:'0.29.1-articulated-motion'","version:'0.36.0-kyoto-depth'");
 once('FIFTEENTH EVER GARDEN — v0.29.1','FIFTEENTH EVER GARDEN — v0.36.0');
 once("const requestedStage=window.location?new URLSearchParams(window.location.search).get('stage'):null;", "const stageParamsV030=new URLSearchParams(window.location?.search||'');\nconst requestedStage=({'first-court':'jingu','second-court':'sanjo'})[stageParamsV030.get('stage')]||stageParamsV030.get('stage');");
 once("const feelEnabledV023=ACTIVE_STAGE.id==='first-court';","const feelEnabledV023=true;");
 once("$('#stageMenu').addEventListener('click',()=>{audio.stopVoice();window.location.assign(stageUrlV021(ACTIVE_STAGE.id));});","$('#stageMenu').addEventListener('click',()=>showGardenV030());");
 once("const highBall=renderer.project(depthPointV022([x,y,z]))[1]<195;$('#ballLabel').style.transform=highBall?'translate(-50%, 0)':'translate(-50%, -125%)';place($('#ballLabel'),depthPointV022([x,y+.3,z]),highBall?40:-2);$('#ballLabel').textContent=ballPrompt();","$('#ballLabel').textContent=ballPrompt();placeBallPromptV030();");
 once('</style>',String.raw`
/* Complete-edition navigation lives in the same native scene. */
.stage-picker{display:none!important}.campaign-ui{position:absolute;inset:0;z-index:8;pointer-events:none;color:#f5edda}.campaign-ui button,.campaign-ui input{pointer-events:auto}
.campaign-ui[hidden]{display:none!important}.campaign-top{position:absolute;top:18px;left:22px;right:22px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.campaign-top small{display:block;color:#afbfba;font-size:10px;letter-spacing:.17em}.campaign-top h2{margin:5px 0;font:500 23px/1.2 Georgia,'Yu Mincho',serif;letter-spacing:.15em}.campaign-orbs{font-size:12px;color:#eed594;text-align:right}.campaign-orbs span{display:block;margin-top:5px;font:23px Georgia,serif}
.campaign-stone{position:absolute;transform:translate(-50%,-50%);min-width:48px;min-height:48px;padding:2px;border:0;background:transparent;color:#f5edda;text-shadow:0 2px 3px #132023;font:10px/1.2 inherit;cursor:pointer}.campaign-stone:after{content:attr(data-label);position:absolute;top:92%;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10px;padding:2px 5px;background:#152824db;border-radius:2px}.campaign-stone[data-kind=ordinary]:after{display:none}.campaign-stone[data-kind=self]{cursor:default}.campaign-stone[aria-pressed=true]{outline:1px solid #e9ca8a;border-radius:50%;box-shadow:0 0 20px #e9ca8a55}.campaign-stone[data-acquired=true]:before{content:'●';position:absolute;left:50%;top:-5px;transform:translateX(-50%);color:#f6dd91;text-shadow:0 0 12px #f1c883}
.campaign-detail{position:absolute;left:22px;right:22px;bottom:18px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:14px 18px;border:1px solid #8f927365;background:linear-gradient(100deg,#132723ed,#1e3530ec);border-radius:4px}.campaign-detail h3{font:500 20px/1.2 Georgia,'Yu Mincho',serif;margin:0 0 6px}.campaign-detail p{margin:0;color:#becdc0;font-size:12px;line-height:1.7}.campaign-detail button,.campaign-small{min-height:44px;padding:10px 18px;border:1px solid #d1b67e;background:#e8d8ac;color:#192d26;border-radius:3px;font-size:12px}.campaign-small{background:#17302eed;color:#e7debd;padding:7px 12px}.campaign-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.campaign-gion{border-color:#f8dd8d!important;box-shadow:0 0 22px #efc87422}.campaign-note{position:absolute;bottom:4px;left:24px;color:#dfbf91;font-size:10px}
.campaign-dialogue{position:absolute;left:8%;right:8%;bottom:10%;padding:24px;border-top:1px solid #d4bd86;background:linear-gradient(90deg,#081419f2,#15242be6);box-shadow:0 12px 40px #0007}.campaign-dialogue .speaker{font-size:11px;letter-spacing:.18em;color:#dbc18d}.campaign-dialogue .en{font:500 clamp(22px,3.3vw,35px)/1.25 Georgia,serif;letter-spacing:.02em;margin:14px 0 8px}.campaign-dialogue .ja{font-size:14px;color:#d1d5cb;margin:0 0 20px}.campaign-dialogue button{float:right}.campaign-dialogue:after{content:'';display:block;clear:both}
.campaign-cinema{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;pointer-events:none}.campaign-cinema h2{font:400 clamp(30px,7vw,76px)/1.15 Georgia,'Yu Mincho',serif;letter-spacing:.14em;text-shadow:0 4px 20px #000}.campaign-cinema p{font-size:12px;color:#dddbc7;letter-spacing:.2em}.campaign-cinema button{position:absolute;right:14px;bottom:14px;opacity:.8}.campaign-flash{position:absolute;inset:0;background:#fff2ce;opacity:0;pointer-events:none;z-index:10}.campaign-end{position:absolute;inset:0;background:#030608;display:grid;place-content:center;text-align:center;gap:22px}.campaign-end h2{font:400 52px Georgia,serif;letter-spacing:.25em;margin:0 0 8px}.campaign-end p{margin:0;color:#bac4bf;font-size:11px;letter-spacing:.15em}
body.campaign-screen #app .console,body.campaign-screen #arena :is(.hud,.phase,.clock,.stage-caption,.ball-label,.fighter-label,.feedback,.practice-card,.ceremony-menu,.close-points-v027,.close-hud-v027){visibility:hidden!important;pointer-events:none!important}body.campaign-screen .console{display:none!important}body.campaign-screen #arena{height:calc(100svh - 130px);min-height:420px;max-height:850px;border-radius:5px}body.campaign-screen #pause{visibility:hidden}body.campaign-screen footer{display:none}body.campaign-screen #arena .grain{opacity:.35}
body.campaign-cinematic #arena :is(.ball-label,.fighter-label,.practice-card,.ceremony-menu){visibility:hidden!important}.campaign-home{margin:8px auto 0;min-height:44px;padding:8px 14px;background:transparent;color:#f3eddc;border:1px solid #789a8a;border-radius:4px}
@media(max-width:680px){.campaign-top{top:14px;left:14px;right:14px}.campaign-top h2{font-size:20px}.campaign-top small{font-size:9px}.campaign-detail{left:12px;right:12px;bottom:16px;padding:12px;gap:8px}.campaign-detail h3{font-size:17px}.campaign-detail p{font-size:10px}.campaign-detail button{padding:8px 11px}.campaign-top .campaign-small{font-size:10px;min-height:36px}.campaign-dialogue{left:4%;right:4%;bottom:8%;padding:18px}.campaign-dialogue .ja{font-size:12px}.campaign-stone:after{font-size:9px}.campaign-note{left:16px}body.campaign-screen #arena{height:calc(100svh - 100px);min-height:420px}}
@media(orientation:landscape) and (max-height:600px){body.campaign-screen .masthead{display:none}body.campaign-screen .audio-mix{position:absolute;top:7px;right:14px;z-index:15;font-size:9px}body.campaign-screen #arena{height:calc(100svh - 16px);min-height:280px;margin:0}body.campaign-screen #app{display:block}.campaign-top{top:11px;left:16px;right:16px}.campaign-top h2{font-size:17px}.campaign-orbs{margin-right:225px;font-size:9px}.campaign-orbs span{display:inline;font-size:15px;margin-left:5px}.campaign-detail{bottom:8px;padding:8px 12px;left:14px;right:14px}.campaign-detail h3{font-size:16px;margin:0 0 2px}.campaign-detail p{font-size:10px}.campaign-detail button{min-height:38px;padding:6px 10px}.campaign-stone:after{font-size:8px}.campaign-dialogue{bottom:6%;padding:16px 20px}.campaign-dialogue .en{font-size:25px;margin:8px 0}.campaign-dialogue .ja{margin-bottom:8px}.campaign-note{bottom:0;font-size:8px}}
/* Reserve the short landscape view for the stones between two readable rails. */
@media(orientation:landscape) and (max-height:600px){
 .campaign-top{z-index:1}.campaign-top:before{content:'';position:absolute;inset:-11px -16px -6px;background:linear-gradient(#112b2bf2,#112b2bb8);z-index:-1;pointer-events:none}
 .campaign-top>div:first-child{flex:none;display:grid;grid-template-columns:auto auto;align-items:center;column-gap:10px}.campaign-top small{grid-column:1/-1}.campaign-top h2{font-size:16px;letter-spacing:.08em;white-space:nowrap}
 .campaign-top .campaign-small{min-height:32px;padding:5px 9px}
 .campaign-orbs{position:absolute;right:0;top:28px;margin:0;font-size:10px}.campaign-orbs span{font-size:17px}
 .campaign-stone{min-width:44px;min-height:44px}.campaign-stone:after{font-size:9px}
}
.campaign-stone[data-kind=ordinary]{min-width:20px;min-height:20px;width:20px;height:20px;cursor:default}
/* Keep the figures and the inherited light readable through each scene change. */
.campaign-top{z-index:1}.campaign-top:before{content:'';position:absolute;inset:-18px -22px -9px;background:linear-gradient(#112b2be8,#112b2ba8);border-bottom:1px solid #bdbb8f33;z-index:-1;pointer-events:none}
.campaign-top>div:first-child{min-width:0}.campaign-top h2{white-space:nowrap;letter-spacing:.08em}.campaign-orbs{flex:none}
.campaign-cinema{align-items:flex-start;padding-top:clamp(18px,5vh,42px)}
.campaign-cinema>div{max-width:calc(100% - 32px);padding:8px 18px;animation:campaign-caption-enter .22s ease-out both}
.campaign-cinema h2{font-size:clamp(28px,5vw,54px);line-height:1.1;margin:0;letter-spacing:.12em}
.campaign-cinema p{margin:10px 0 0;line-height:1.5;text-shadow:0 2px 8px #071015}
.campaign-dialogue{animation:campaign-caption-enter .18s ease-out both}
.practice-card:not(.answer-card){top:max(78px,28%);transform:translateX(-50%)}
#intro p{max-width:none}#intro p .campaign-phrase{display:inline-block}
.ball-label{min-width:48px;padding:4px 8px 5px;font-size:26px;line-height:1.1;border-radius:5px;box-shadow:0 2px 0 #ab8a4c,0 3px 9px #0003}
.ball-label:after{left:var(--prompt-line-x,50%);top:var(--prompt-line-y,100%);bottom:auto;width:var(--prompt-line-length,0px);height:1px;border:0;background:#e4c98c;transform:rotate(var(--prompt-line-angle,0rad));transform-origin:0 50%;opacity:.8}
@media(max-width:680px){.ball-label{font-size:24px;min-width:44px;padding:4px 7px}}
@media(orientation:landscape) and (max-height:450px){.campaign-cinema{padding-top:10px}.campaign-cinema>div{padding:4px 14px}.campaign-cinema p{margin-top:4px}}
@keyframes campaign-caption-enter{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:680px){.campaign-top{gap:8px}.campaign-top:before{inset:-14px -14px -9px}.campaign-top h2{font-size:clamp(15px,4.5vw,20px)}.campaign-orbs{font-size:10px;min-width:54px}.campaign-orbs span{font-size:22px}.campaign-cinema p{font-size:11px}}
@media(orientation:landscape) and (min-width:560px) and (min-height:601px){body.campaign-screen #arena{grid-column:1/-1;grid-row:2/4;height:100%;min-height:0;max-height:none}}
@media(orientation:landscape) and (max-height:600px){.campaign-top:before{inset:-11px -16px -6px}.campaign-top h2{font-size:16px}.campaign-cinema{padding-top:18px}.campaign-cinema h2{font-size:30px}.campaign-cinema p{margin-top:5px}.campaign-orbs span{font-size:17px}.campaign-dialogue{padding:12px 18px;display:grid;grid-template-columns:1fr auto;column-gap:16px}.campaign-dialogue .speaker,.campaign-dialogue .en{grid-column:1/-1}.campaign-dialogue .en{font-size:24px;margin:6px 0}.campaign-dialogue .ja{margin:0;align-self:center}.campaign-dialogue button{float:none;grid-column:2;grid-row:3}.campaign-dialogue:after{display:none}}
body.reduced-motion .campaign-dialogue,body.reduced-motion .campaign-cinema>div{animation:none;transition:none}
@media(prefers-reduced-motion:reduce){.campaign-dialogue,.campaign-cinema>div{animation:none;transition:none}}
</style>`);
 once('<canvas id="world"', '<canvas id="world"'); // Assert the game canvas remains present.
 once("$('#start').addEventListener('click',start);",`const CampaignModelV030=(${window.FEGCampaign.toString()})();\n`+String.raw`
const SAVE_KEY_V030='feg.campaign.v1',SAVE_SESSION_V030='feg.campaign.session.v1';
let saveNoticeV030='',campaignSaveV030=CampaignModelV030.fresh();
try{campaignSaveV030=CampaignModelV030.normalize(JSON.parse(localStorage.getItem(SAVE_KEY_V030)||sessionStorage.getItem(SAVE_SESSION_V030)||'null'));}catch(e){try{campaignSaveV030=CampaignModelV030.normalize(JSON.parse(sessionStorage.getItem(SAVE_SESSION_V030)||'null'));}catch(_){} }
function persistCampaignV030(){
 const raw=JSON.stringify(campaignSaveV030);let durable=false,session=false;
 try{localStorage.setItem(SAVE_KEY_V030,raw);durable=true;}catch(e){}
 try{sessionStorage.setItem(SAVE_SESSION_V030,raw);session=true;}catch(e){}
 saveNoticeV030=durable?'':session?'このタブを閉じると進行が消える場合があります':'このブラウザでは進行を保存できません';
 return durable||session;
}
const campaignV030={phase:'title',time:0,selected:'jingu',intro:stageParamsV030.get('intro')==='1'||(!requestedStage&&!campaignSaveV030.introComplete),dialogue:0,committed:false,godmode:false,returning:false,pausedPhase:null};
const campaignUIV030=document.createElement('section');campaignUIV030.id='campaignUI';campaignUIV030.className='campaign-ui';campaignUIV030.hidden=true;$('#arena').appendChild(campaignUIV030);
const campaignFlashV030=document.createElement('div');campaignFlashV030.className='campaign-flash';$('#arena').appendChild(campaignFlashV030);
const ordinaryStonesV030=[[-4.1,-3.0],[-1.3,-3.25],[3.9,-2.95],[-3.2,-.15],[2.0,-.1],[-4.2,3.1],[0,3.3],[4.3,3.1]];
const chosenStonesV030=[{stage:'jingu',x:-2.7,z:-2.55},{stage:'gendo',x:.15,z:-2.8},{stage:'chion',x:2.9,z:-2.55},{stage:'sanjo',x:-4.0,z:1.35},{stage:'shinkyogoku',x:-1.1,z:1.1},{stage:'million',x:2.1,z:1.25}];
const stoneLayoutV030=[{kind:'self',x:4.35,z:.15},...chosenStonesV030.map(s=>({...s,kind:'opponent'})),...ordinaryStonesV030.map(([x,z])=>({kind:'ordinary',x,z}))];
const gardenRootV030=group(root);gardenRootV030.visible=false;
mesh(gardenRootV030,'box','#cdc8aa',[0,-.24,0],[18,.4,14]);mesh(gardenRootV030,'box','#807c67',[0,-.42,0],[19,.25,15]);
const rakesV030=group(gardenRootV030);
for(let i=-30;i<=30;i++)mesh(rakesV030,'box',i%3?'#d9d1b3':'#bab596',[0,-.031,i*.18],[17,.012,.018]);
for(const x of [-8.7,8.7])mesh(rakesV030,'box','#4d5543',[x,.1,0],[.22,.22,14]);
for(const z of [-6.8,6.8])mesh(rakesV030,'box','#4d5543',[0,.1,z],[17.4,.22,.22]);
G.mergeStatic(rakesV030);
const stoneNodesV030=stoneLayoutV030.map((s,i)=>{const n=group(gardenRootV030,[s.x,0,s.z]);const size=s.kind==='ordinary'?.23+(i%3)*.08:.49;mesh(n,'ico',s.kind==='self'?'#58655d':s.kind==='ordinary'?'#898d7b':'#5c6b64',[0,size*.49,0],[size*(1.1+i%3*.16),size,size*.88],[.1,i*.83,.1]);mesh(n,'cyl','#879273',[0,-.008,0],[size*1.65,.02,size*1.2]);if(s.kind!=='ordinary'){const orb=mesh(n,'ico','#ffe5a6',[0,1.05,0],[.14,.14,.14],[0,0,0],1);n.orb=orb;}return n;});
const inheritedOrbV030=group(root);mesh(inheritedOrbV030,'ico','#ffe4a2',[0,0,0],[.19,.19,.19],[0,0,0],1);mesh(inheritedOrbV030,'cyl','#e2a55f',[0,0,0],[.25,.025,.25],[.5,0,.4],1);inheritedOrbV030.visible=false;
const sevenOrbsV030=Array.from({length:7},(_,i)=>{const n=group(root);mesh(n,'ico',['#e1d4b2','#cadfe1','#e7c19b','#e7b5cd','#c1d9d7','#e6d57e','#b9c8eb'][i],[0,0,0],[.22,.22,.22],[0,0,0],1);mesh(n,'cyl','#edbd65',[0,0,0],[.23,.025,.23],[.45,i,.3],1);n.visible=false;return n;});
function campaignScreenV030(on){document.body.classList.toggle('campaign-screen',on);campaignUIV030.hidden=!on;setOverlay(null);$('#pause').disabled=on;$('#kick').disabled=on;}
function campaignNavV030(stage,intro=false){
 if(campaignV030.returning)return;campaignV030.returning=true;audio.stopVoice();audio.dispose?.();
 const url=new URL(window.location.href);url.searchParams.delete('view');url.searchParams.delete('intro');url.searchParams.set('stage',stage);if(intro)url.searchParams.set('intro','1');window.location.assign(url.href);
}
function campaignSetPhaseV030(phase){campaignV030.phase=phase;campaignV030.time=0;document.body.classList.toggle('campaign-cinematic',['inheritance','gather','scatter'].includes(phase));}
function gardenDetailV030(){
 const stage=STAGE_CONTENT.stages.find(s=>s.id===campaignV030.selected),character=STAGE_CONTENT.characters.find(c=>c.id===stage.opponent),deck=STAGE_CONTENT.decks.find(d=>d.id===stage.deck),owned=campaignSaveV030.acquired.includes(stage.opponent);
 const title=campaignUIV030.querySelector('#gardenName'),description=campaignUIV030.querySelector('#gardenDescription'),go=campaignUIV030.querySelector('#gardenGo');if(!title)return;
 title.textContent=character.name;description.textContent=stage.name+' · '+deck.sounds.map(s=>'/'+s.symbol+'/').join(' ')+' · '+(owned?'継承済み / 再戦できます':'未継承');go.textContent=owned?'再び勝負':'ここで勝負';
 campaignUIV030.querySelectorAll('[data-kind=opponent]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stage===stage.id)));
}
function showGardenV030(){
 audio.stopVoice();state.mode='idle';state.pendingDamage=0;campaignV030.committed=false;campaignV030.godmode=false;window.kemari?.setGodMode?.(false);campaignSetPhaseV030('garden');campaignScreenV030(true);persistCampaignV030();
 const url=new URL(window.location.href);url.searchParams.delete('stage');url.searchParams.delete('intro');url.searchParams.set('view','garden');history.replaceState(null,'',url.href);
 campaignUIV030.innerHTML='<header class="campaign-top"><div><small>相手を選ぶ</small><h2>十五の石、七つの鞠。</h2><button class="campaign-small" id="stationAgain">京都駅へ</button></div><div class="campaign-orbs">受け継いだ鞠<span>'+CampaignModelV030.orbCount(campaignSaveV030)+' / 7</span></div></header><div id="gardenStones"></div><div class="campaign-detail"><div><h3 id="gardenName"></h3><p id="gardenDescription"></p></div><div class="campaign-actions"><button id="gardenGo">ここで勝負</button>'+(CampaignModelV030.unlocked(campaignSaveV030)?'<button id="gardenFinal" class="campaign-gion">祇園へ ↗</button>':'')+'</div></div><span class="campaign-note">'+saveNoticeV030+'</span>';
 const host=campaignUIV030.querySelector('#gardenStones');
 for(const [i,s] of stoneLayoutV030.entries()){
  const b=document.createElement(s.kind==='ordinary'?'span':'button');b.className='campaign-stone';b.dataset.kind=s.kind;b.dataset.index=i;b.dataset.label=s.kind==='self'?'YOU':s.kind==='ordinary'?'':STAGE_CONTENT.characters.find(c=>c.id===STAGE_CONTENT.stages.find(t=>t.id===s.stage).opponent).name;b.setAttribute('aria-label',s.kind==='ordinary'?'石':s.kind==='self'?PLAYER_CHARACTER.name+' / 自分の石':b.dataset.label+'を選ぶ');
  if(s.kind==='opponent'){b.dataset.stage=s.stage;b.dataset.acquired=String(campaignSaveV030.acquired.includes(STAGE_CONTENT.stages.find(t=>t.id===s.stage).opponent));b.addEventListener('click',()=>{campaignV030.selected=s.stage;audio.note(330,.1,.04,'sine');gardenDetailV030();});}else if(s.kind==='self')b.setAttribute('aria-disabled','true');host.appendChild(b);
 }
 campaignUIV030.querySelector('#gardenGo').addEventListener('click',()=>campaignNavV030(campaignV030.selected));campaignUIV030.querySelector('#stationAgain').addEventListener('click',()=>campaignNavV030('jingu',true));campaignUIV030.querySelector('#gardenFinal')?.addEventListener('click',()=>campaignNavV030('gion'));
 gardenDetailV030();
}
function showDialogueV030(){
 campaignSetPhaseV030('dialogue');campaignScreenV030(true);state.mode='idle';
 // The fixed English male voice is shared with SHOUBU ARI. A direct intro URL
 // must offer a gesture for this first line instead of silently skipping it.
 const lines=[['Welcome back to Kyoto.','よう帰ってきはりましたな。','Yoh, kaette kiharimashita na.'],['Shall we see what you remember?','どれほど覚えてはるか、見せてもらいまひょか。','Dorehodo oboete haru ka, misete moraimahyoka.']],line=lines[campaignV030.dialogue];
 campaignUIV030.innerHTML='<div class="campaign-dialogue"><div class="speaker">KYOTO STATION / 烏丸 朔</div><p class="en">'+line[0]+'</p><p class="ja">'+line[1]+'</p><button id="dialogueNext" class="campaign-small">'+(campaignV030.dialogue?'鞠を受ける':'次へ')+' ↗</button></div>';
 campaignV030.dialogueText=line[2];campaignV030.dialogueNeedsGesture=audio.voiceVolume>0&&!audio.canPlayVoice?.()&&(!audio.userChoice||audio.enabled);
 const next=campaignUIV030.querySelector('#dialogueNext');if(campaignV030.dialogueNeedsGesture)next.textContent='台詞を聞く ↗';
 next.addEventListener('click',()=>{if(campaignV030.phase!=='dialogue')return;if(!audio.userChoice)audio.set(true);audio.resumeFromGesture?.();
  if(campaignV030.dialogueNeedsGesture){speakDialogueLineV030();return;}
  if(campaignV030.dialogue++===0)showDialogueV030();else startCampaignMatchV030();});
 if(!campaignV030.dialogueNeedsGesture)speakDialogueLineV030();
}
function speakDialogueLineV030(){if(campaignV030.phase!=='dialogue')return;campaignV030.dialogueNeedsGesture=false;const next=campaignUIV030.querySelector('#dialogueNext');if(next)next.textContent=(campaignV030.dialogue?'鞠を受ける':'次へ')+' ↗';speakCallV010(campaignV030.dialogueText);}
const campaignKernelStartV030=start;
function startCampaignMatchV030(){
 campaignSetPhaseV030('match');campaignScreenV030(false);campaignV030.committed=false;state.mode='over';campaignKernelStartV030();$('#stageName').textContent=campaignV030.intro?'KYOTO STATION / 帰郷':ACTIVE_STAGE.name;$('#pause').disabled=false;
}
function beginGatherV030(){
 if(!CampaignModelV030.unlocked(campaignSaveV030)){showGardenV030();return;}
 state.mode='idle';campaignSetPhaseV030('gather');campaignScreenV030(true);campaignV030.godmode=false;campaignUIV030.innerHTML='<div class="campaign-cinema"><div><h2>GION</h2><p>七つの鞠が、帰る。</p></div><button id="cinemaSkip" class="campaign-small">進む ↗</button></div>';campaignUIV030.querySelector('#cinemaSkip').addEventListener('click',()=>finishGatherV030());audio.note(146.83,3,.12,'sine');
}
function finishGatherV030(){if(campaignV030.phase!=='gather')return;campaignV030.godmode=true;window.kemari?.setGodMode?.(true);startCampaignMatchV030();}
start=function(){
 if(state.mode==='error'||campaignV030.returning)return;
 if(campaignV030.phase==='title'){
  if(titlePendingV020)return;titlePendingV020=true;$('#start').disabled=true;audio.ensure();if(!audio.userChoice)audio.set(true);const serial=++campaignTitleSerialV030;let done=false;
  const finish=()=>{if(done||serial!==campaignTitleSerialV030)return;done=true;titlePendingV020=false;$('#start').disabled=false;setOverlay(null);if(campaignSaveV030.introComplete)showGardenV030();else showDialogueV030();};speakWord('FIFTEENTH EVER GARDEN',finish);return;
 }
 if(campaignV030.phase==='stage-card'){if(ACTIVE_STAGE.id==='gion')beginGatherV030();else startCampaignMatchV030();return;}
 if(campaignV030.phase==='match'&&(state.mode==='over'||state.mode==='paused')){if(ACTIVE_STAGE.id==='gion')window.kemari?.setGodMode?.(true);startCampaignMatchV030();}
};
let campaignTitleSerialV030=0;
const campaignEndKernelV030=end;
end=function(kind){
 const result=campaignEndKernelV030(kind);
 if(kind==='win'&&state.victoryAnnounced&&duelV022.phase==='done'&&!campaignV030.committed){
  campaignV030.committed=true;state.mode='finishing';
  if(campaignV030.intro){campaignSaveV030.introComplete=true;persistCampaignV030();campaignSetPhaseV030('intro-win');state.finishDelay=1.25;}
  else if(ACTIVE_STAGE.id==='gion'){campaignSaveV030.completed=true;persistCampaignV030();campaignSetPhaseV030('scatter');campaignScreenV030(true);campaignUIV030.innerHTML='<div class="campaign-cinema"><div><h2>勝負あり</h2></div><button id="cinemaSkip" class="campaign-small">進む ↗</button></div>';campaignUIV030.querySelector('#cinemaSkip').addEventListener('click',showEndingV030);}
  else {campaignSaveV030=CampaignModelV030.award(campaignSaveV030,ACTIVE_STAGE.opponent);persistCampaignV030();campaignSetPhaseV030('inheritance');campaignScreenV030(true);campaignUIV030.innerHTML='<div class="campaign-cinema"><div><h2>勝負あり</h2><p>'+STAGE_CONTENT.characters.find(c=>c.id===ACTIVE_STAGE.opponent).name+'</p></div><button id="cinemaSkip" class="campaign-small">石庭へ ↗</button></div>';campaignUIV030.querySelector('#cinemaSkip').addEventListener('click',showGardenV030);}
 }
 return result;
};
function showEndingV030(){
 if(campaignV030.phase!=='scatter')return;campaignSetPhaseV030('ending');state.mode='over';audio.stopVoice();campaignScreenV030(true);campaignUIV030.innerHTML='<div class="campaign-end"><h2>THE END</h2><p>FIFTEENTH EVER GARDEN</p><button id="endingGarden" class="campaign-small">もう一球 ↗</button></div>';campaignUIV030.querySelector('#endingGarden').addEventListener('click',showGardenV030);
}
const campaignUpdateKernelV030=updateGame;
updateGame=function(dt){
 if(state.mode==='paused'||document.hidden)return;
 const phase=campaignV030.phase;
 if(['inheritance','gather','scatter','intro-win'].includes(phase)){
  campaignV030.time+=dt;
  if(phase==='inheritance'&&campaignV030.time>=(motion?4.1:1.3))showGardenV030();
  if(phase==='intro-win'&&campaignV030.time>=1.25)showGardenV030();
  if(phase==='gather'&&campaignV030.time>=(motion?4.3:1.3))finishGatherV030();
  if(phase==='scatter'){
   if(campaignV030.time-dt<.7&&campaignV030.time>=.7){audio.note(1200,.9,.22,'sine',0,160);if(audio.enabled&&audio.voiceVolume>0)audio.speak({text:'ひゃーん',kind:'ending'});}
   if(campaignV030.time>=(motion?2.8:1.5))showEndingV030();
  }
  audio.update(dt,phase==='gather'?3:1,1);return;
 }
 if(phase!=='match')return;
 return campaignUpdateKernelV030(dt);
};
const campaignPauseKernelV030=pause;
pause=function(){if(campaignV030.phase==='match')return campaignPauseKernelV030();};
const campaignKickKernelV030=kick;
kick=function(){if(campaignV030.phase==='match')return campaignKickKernelV030();};
function campaignTransformV030(n,p){
 const [rx,ry,rz]=n.rot,[sx,sy,sz]=n.scale;let [x,y,z]=p.map((v,i)=>v*[sx,sy,sz][i]);
 [y,z]=[y*Math.cos(rx)-z*Math.sin(rx),y*Math.sin(rx)+z*Math.cos(rx)];[x,z]=[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];[x,y]=[x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz)];
 return [x+n.pos[0],y+n.pos[1],z+n.pos[2]];
}
let promptPlaceV030=-1;
function placeBallPromptV030(){
 if(campaignV030.phase!=='match'||!['front','back'].includes(duelV022.phase))return;
 const label=$('#ballLabel'),active=['practice','match'].includes(ceremony);label.style.visibility=active?'':'hidden';if(!active)return;
 // Called between prepareDepthRenderV022 and its restoration: these positions
 // already include the exact depth shift and actor transforms used by WebGL.
 const [bx,by]=renderer.project(ball.pos),w=label.offsetWidth||48,h=label.offsetHeight||38,W=renderer.width,H=renderer.height;
 if(!Number.isFinite(bx+by)||!W||!H)return;
 const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
 const avoid=[];
 for(const f of [player,cpu])for(const [node,center,extent] of [[f.head,[0,.15,0],[.48,.66,.45]],[f.body,[0,.60,0],[.52,.68,.45]]]){
  const points=[];for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
   let p=campaignTransformV030(node,center.map((v,i)=>v+[x,y,z][i]*extent[i]));if(node===f.head)p=campaignTransformV030(f.body,p);points.push(renderer.project(campaignTransformV030(f.n,p)));
  }
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);avoid.push({x:Math.min(...xs)-4,y:Math.min(...ys)-4,w:Math.max(...xs)-Math.min(...xs)+8,h:Math.max(...ys)-Math.min(...ys)+8});
 }
 const arena=canvas.getBoundingClientRect();
 for(const e of [$('.hud'),$('#practiceCard')])if(e&&!e.hidden&&e.getClientRects().length){const r=e.getBoundingClientRect();avoid.push({x:r.left-arena.left-4,y:r.top-arena.top-4,w:r.width+8,h:r.height+8});}
 // Four nearby positions; retain the last safe one rather than changing sides
 // for a one-pixel preference. This changes only the prompt's screen position.
 const spots=[[bx-w-22,by-h/2],[bx+22,by-h/2],[bx-w/2,by-h-22],[bx-w/2,by+22]].map(([x,y],i)=>{
  const r={x:Math.max(5,Math.min(W-w-5,x)),y:Math.max(5,Math.min(H-h-5,y)),w,h};
  return {...r,i,clamp:Math.abs(r.x-x)+Math.abs(r.y-y),cover:avoid.reduce((n,b)=>n+overlap(r,b),0)};
 });
 const previous=spots[promptPlaceV030],preferred=bx>W/2?0:1;
 const chosen=previous&&previous.cover<1&&previous.clamp<1?previous:spots.reduce((a,b)=>{const score=c=>c.cover*100+c.clamp*2+(c.i===preferred?0:8);return score(a)<=score(b)?a:b});
 promptPlaceV030=chosen.i;label.style.transform='none';label.style.left=chosen.x+'px';label.style.top=chosen.y+'px';
 const dx=bx-(chosen.x+w/2),dy=by-(chosen.y+h/2),distance=Math.hypot(dx,dy),edge=1/Math.max(Math.abs(dx)/(w/2),Math.abs(dy)/(h/2),1);
 label.style.setProperty('--prompt-line-x',(w/2+dx*edge)+'px');label.style.setProperty('--prompt-line-y',(h/2+dy*edge)+'px');label.style.setProperty('--prompt-line-length',Math.max(0,distance*(1-edge)-4)+'px');label.style.setProperty('--prompt-line-angle',Math.atan2(dy,dx)+'rad');
}
function campaignChestV030(f){return campaignTransformV030(f.n,campaignTransformV030(f.body,[0,(f.chestHeight||1.9)-1.08,0]));}
const campaignPrepareKernelV030=prepareDepthRenderV022;
prepareDepthRenderV022=function(){
 campaignPrepareKernelV030();const phase=campaignV030.phase,t=campaignV030.time;
 gardenRootV030.visible=phase==='garden';inheritedOrbV030.visible=false;sevenOrbsV030.forEach(n=>n.visible=false);campaignFlashV030.style.opacity='0';
 if(phase==='garden'){
  frontSceneryV022.visible=false;backSceneryV022.visible=false;player.n.visible=false;cpu.n.visible=false;ball.visible=false;shadow.visible=false;ghosts.forEach(n=>n.visible=false);sparks.forEach(s=>s.n.visible=false);rushBallsV022.forEach(p=>p.n.visible=false);
  const viewHeight=canvas.clientHeight||renderer.height,aspect=(canvas.clientWidth||renderer.width)/viewHeight,shortLandscape=aspect>1&&viewHeight<600;
  renderer.eye=[0,17,8];renderer.target=[0,.3,0];renderer.zoom=shortLandscape?.55:1;renderer.shake=[0,0];
  for(const [i,n] of stoneNodesV030.entries()){const s=stoneLayoutV030[i];if(n.orb){const stage=STAGE_CONTENT.stages.find(t=>t.id===s.stage);n.orb.visible=s.kind==='self'||campaignSaveV030.acquired.includes(stage?.opponent);n.orb.pos[1]=.95+(motion?Math.sin(visualTime*1.2+i)*.05:0);}}
 }else{
  player.n.visible=phase!=='ending';
  // Reveal the mirror only after the seven orbs have transformed the player.
  cpu.n.visible=phase!=='ending'&&!(ACTIVE_STAGE.id==='gion'&&(phase==='stage-card'||(phase==='gather'&&t<3.4)));
  if(['title','dialogue','stage-card'].includes(phase)){ball.visible=false;shadow.visible=false;}
  if(ACTIVE_STAGE.id==='gion'&&['stage-card','gather'].includes(phase)){
   // Frame all seven arriving orbs around the player, then settle back before
   // the mirror appears. The card shares the first frame to avoid a start jump.
   const returning=motion&&phase==='gather'?smoothDepthV022((t-2.7)/.65):0,shift=campaignChestV030(player)[0]*(1-returning);
   renderer.eye[0]+=shift;renderer.target[0]+=shift;
  }
  if(['gather','inheritance','scatter','intro-win'].includes(phase)){
   ball.visible=false;shadow.visible=false;const playerChest=campaignChestV030(player),cpuChest=campaignChestV030(cpu);
   if(phase==='inheritance'){
    const u=Math.max(0,Math.min(1,(t-.85)/2.1)),s=u*u*(3-2*u);inheritedOrbV030.visible=t>.65&&u<1;inheritedOrbV030.pos=cpuChest.map((v,i)=>v+(playerChest[i]-v)*s+(i===1?Math.sin(u*Math.PI)*1.0:0));inheritedOrbV030.rot[1]=t*2.4;inheritedOrbV030.rot[2]=t;const flash=Math.max(0,1-Math.abs(t-3.15)/.2);campaignFlashV030.style.opacity=String(flash*(motion?.55:.08));
   }
   if(phase==='gather'||phase==='scatter'){
    const gather=phase==='gather',p=gather?Math.min(1,t/2.6):Math.max(0,(t-.7)/1.25);
    sevenOrbsV030.forEach((n,i)=>{const angle=i*Math.PI*2/7+(motion?t*.8:0),radius=gather?4.1*(1-p)+.8:1+p*15;n.visible=true;n.pos=[playerChest[0]+Math.cos(angle)*radius,playerChest[1]+.45+Math.sin(angle)*radius*.45+(gather?p*.35:p*3),playerChest[2]+Math.sin(angle)*radius];n.rot[2]=angle;});
    if(gather&&t>=2.7&&!campaignV030.godmode){campaignV030.godmode=true;window.kemari?.setGodMode?.(true);}if(gather)campaignFlashV030.style.opacity=String(Math.max(0,1-Math.abs(t-2.8)/.25)*(motion?.5:.08));
   }
  }
 }
};
const campaignSceneKernelV030=updateScene;
updateScene=function(dt){
 campaignSceneKernelV030(dt);
 if(campaignV030.phase==='garden')for(const b of campaignUIV030.querySelectorAll('.campaign-stone')){const n=stoneNodesV030[Number(b.dataset.index)],[x,y]=renderer.project([n.pos[0],.25,n.pos[2]]);b.style.left=x+'px';b.style.top=y+'px';}
};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&campaignV030.phase==='title'&&titlePendingV020){++campaignTitleSerialV030;titlePendingV020=false;$('#start').disabled=false;audio.stopVoice();}});
// A cached garden predates the match just played and its audio was disposed on
// navigation. Rebuild from the canonical URL and latest save instead of reviving it.
window.addEventListener('pageshow',event=>{if(event.persisted&&campaignV030.returning)window.location.reload();});
const exitGardenV030=document.createElement('button');exitGardenV030.className='campaign-home';exitGardenV030.textContent='石庭へ戻る';exitGardenV030.addEventListener('click',showGardenV030);$('#pausePanel').appendChild(exitGardenV030);
function initializeCampaignV030(){
 if(stageParamsV030.get('view')==='garden'){showGardenV030();return;}
 if(stageParamsV030.get('intro')==='1'){campaignV030.intro=true;showDialogueV030();return;}
 if(requestedStage){
  campaignV030.intro=false;campaignSetPhaseV030('stage-card');
  if(ACTIVE_STAGE.id==='gion'&&!CampaignModelV030.unlocked(campaignSaveV030)){showGardenV030();return;}
  $('#intro h2').textContent=ACTIVE_STAGE.id==='gion'?'GION':ACTIVE_STAGE.name.split(' / ')[0];$('#intro p').textContent=STAGE_CONTENT.characters.find(c=>c.id===ACTIVE_STAGE.opponent).name+' / '+ACTIVE_DECK.name;$('#start').innerHTML=(ACTIVE_STAGE.id==='gion'?'最後の勝負へ':'PRACTICEを始める')+' <span>↗</span>';const back=document.createElement('button');back.className='campaign-home';back.textContent='石庭へ戻る';back.addEventListener('click',showGardenV030);$('#intro').appendChild(back);return;
 }
 $('#intro p').innerHTML='<span class="campaign-phrase">音を聞く。</span><span class="campaign-phrase">記号を合わせる。</span><span class="campaign-phrase">鞠を返す。</span>';
}
$('#start').addEventListener('click',start);`);
 once('select(0);refreshHud();requestAnimationFrame(frame);',String.raw`
window.kemari.getCampaign=()=>({phase:campaignV030.phase,time:campaignV030.time,intro:campaignV030.intro,godmode:campaignV030.godmode,selected:campaignV030.selected,save:JSON.parse(JSON.stringify(campaignSaveV030)),orbs:CampaignModelV030.orbCount(campaignSaveV030),gionUnlocked:CampaignModelV030.unlocked(campaignSaveV030),stones:stoneLayoutV030.map(s=>({...s})),storageNotice:saveNoticeV030});
initializeCampaignV030();
select(0);refreshHud();requestAnimationFrame(frame);`);
 return html;
};
