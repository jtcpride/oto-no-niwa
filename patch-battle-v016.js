window.otoPatchBattleV016=function(html){
function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.16 patch anchor: '+from.slice(0,72));html=html.replace(from,to);}
replaceOnce("version:'0.15.1-compact-ui'","version:'0.16.0-hp-battle'");
replaceOnce('<title>音の庭 — v0.15.1</title>','<title>音の庭 — v0.16.0</title>');
replaceOnce('<p>音を選んで、足元で返す。</p>','<p>音を選び、蹴り返して相手を倒す。</p>');
replaceOnce('<span id="goal">/ 16 RETURNS</span>','<span id="goal">RETURNS</span>');
replaceOnce('<div class="health"><i></i></div>','<div class="health" id="cpuHpTrack" role="progressbar" aria-label="相手の体力" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><i id="cpuHpBar"></i></div><small id="cpuHpValue">体力 100 / 100</small>');
replaceOnce('<span>SECONDS</span>','<span>DAMAGE</span>');
replaceOnce('</style>','\n.clock{display:none}#cpuHpTrack,#cpuHpBar{height:7px;border-radius:2px}#cpuHpTrack{overflow:hidden}#cpuHpBar{transition:width .2s}#cpuHpValue{display:block;font-size:13px;margin-top:7px;color:#fff0db;letter-spacing:.03em}@media(max-width:680px){#cpuHpValue{font-size:11px}}\n</style>');
replaceOnce("if(state.rally>=CONFIG.goal)end('win');",'');
replaceOnce("if(state.mode==='playing'&&state.elapsed>=CONFIG.maxSeconds)end('time');",'');
replaceOnce("const win=kind==='win'||kind==='time';","const win=kind==='win';");
replaceOnce("$('#start').addEventListener('click',start);",String.raw`
// Successful returns deal damage only when the outgoing ball reaches the opponent.
CONFIG.maxCpuHp=100;CONFIG.returnDamage=10;CONFIG.perfectDamage=15;
CONFIG.maxSeconds=null;CONFIG.goal=null;
function resetBattleV016(){Object.assign(state,{cpuHp:CONFIG.maxCpuHp,pendingDamage:0,damageDealt:0,cpuHurt:0,cpuDefeated:false});}
resetBattleV016();
const hpV016=refreshHp;
refreshHp=function(){hpV016();$('#cpuHpBar').style.width=(state.cpuHp/CONFIG.maxCpuHp*100)+'%';$('#cpuHpTrack').setAttribute('aria-valuenow',state.cpuHp);$('#cpuHpValue').textContent='体力 '+state.cpuHp+' / '+CONFIG.maxCpuHp;};
const startV016=start;
start=function(){resetBattleV016();return startV016();};
const matchV016=beginMatch;
beginMatch=function(){resetBattleV016();return matchV016();};
const kickV016=kick;
kick=function(){const before=state.rally,r=kickV016();if(ceremony==='match'&&state.rally>before)state.pendingDamage=state.shot==='perfect'?CONFIG.perfectDamage:CONFIG.returnDamage;return r;};
const cpuV016=cpuReturn;
cpuReturn=function(){
 if(state.mode!=='playing'||state.direction!==1)return;
 if(ceremony==='match'&&state.pendingDamage>0){
  const damage=Math.min(state.cpuHp,state.pendingDamage);state.pendingDamage=0;
  state.cpuHp-=damage;state.damageDealt+=damage;state.cpuHurt=.45;refreshHp();
  burst(sampleBall(1));sportNoticeV010('相手 −'+damage,'');
  if(state.cpuHp===0){state.cpuDefeated=true;cpu.kick=0;end('win');return;}
 }
 return cpuV016();
};
const endV016=end;
end=function(kind){
 if(!['ready','playing','finishing'].includes(state.mode))return;
 if(kind==='time'||(kind==='win'&&!state.cpuDefeated))return;
 endV016(kind);
 $('#resultTitle').textContent=kind==='win'?'勝利':'敗北';
 $('#reason').textContent=kind==='win'?'相手を倒した。':'体力が尽きた。';
 $('#finalTime').textContent=state.damageDealt;
 $('#review').textContent='';$('#review').hidden=true;
 if(kind==='win')announce('K.O.','',1.25);
};
const poseV016=pose;
pose=function(f,dt){
 poseV016(f,dt);if(f!==cpu)return;
 state.cpuHurt=Math.max(0,state.cpuHurt-dt);
 const down=state.cpuDefeated?1:0,hit=motion?Math.sin(state.cpuHurt/.45*Math.PI):0;
 // Always derive from the normal pose: no accumulated rotations on repeated hits.
 f.body.pos[1]-=down*.38;f.body.rot[2]+=down*.55-hit*.22;
 f.head.rot[2]+=down*.15+hit*.10;
 f.leg.rot[2]+=down*.65;f.back.rot[2]=down*.65;
 f.knee.rot[2]=-down*1.15;f.backKnee.rot[2]=-down*1.15;
};
$('#start').addEventListener('click',start);`);
return html;
};
