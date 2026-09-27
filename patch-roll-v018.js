window.otoPatchRollV018=function(html){
function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.18 patch anchor: '+from.slice(0,72));html=html.replace(from,to);}
replaceOnce("version:'0.17.0-responsive-controls'","version:'0.18.0-roll-and-shobu-ari'");
replaceOnce('<title>音の庭 — v0.17.0</title>','<title>音の庭 — v0.18.0</title>');
replaceOnce('.225+Math.abs(Math.sin(r*Math.PI*2.6))*.04*(1-r)','.245+Math.abs(Math.sin(r*Math.PI*2.6))*.02*(1-r)');
// Rotate before rendering, rather than overriding the rendered pose afterwards.
replaceOnce('if(motion){ball.rot[0]+=dt*2.4;ball.rot[2]+=dt*(state.direction===-1?2.5:-2.5);}','rotateBallV018(dt,pos);');
replaceOnce('updateScene=function(dt){const before=[...ball.rot];sceneV012(dt);if(state.mode===\'paused\')ball.rot=before;else if(motion){ball.rot[0]=before[0]+dt*flightSpinV012;ball.rot[1]+=dt*flightCurveV012*3;ball.rot[2]=before[2]+dt*(state.direction===-1?1:-1)*Math.abs(flightSpinV012);}};','updateScene=function(dt){sceneV012(dt);};');
replaceOnce('cpuHurt:0,cpuDefeated:false','cpuHurt:0,cpuDefeated:false,victoryAnnounced:false');
replaceOnce("if(kind==='win')announce('K.O.','',1.25);", "if(kind==='win'&&!state.victoryAnnounced){state.victoryAnnounced=true;announce('SHOUBU ARI!','',1.25);speakCallV010('Shobu ari!');}");
replaceOnce("$('#start').addEventListener('click',start);",String.raw`
let lastRollPositionV018=null;
function rotateBallV018(dt,pos){
 if(state.mode==='paused')return;
 if(ceremony==='time'&&state.flight>state.duration){
  const previous=lastRollPositionV018||[-3.3,.245,state.aimZ||0];
  if(motion){
   // Y is up: leftward travel rolls counterclockwise about Z.
   ball.rot[2]-=(pos[0]-previous[0])/.245;
   ball.rot[0]+=(pos[2]-previous[2])/.245;
  }
  lastRollPositionV018=[...pos];
 }else{
  lastRollPositionV018=null;
  if(motion){ball.rot[0]+=dt*flightSpinV012;ball.rot[1]+=dt*flightCurveV012*3;ball.rot[2]+=dt*(state.direction===-1?1:-1)*Math.abs(flightSpinV012);}
 }
}
const timePassV018=beginTimePass;
beginTimePass=function(){lastRollPositionV018=null;return timePassV018();};
$('#start').addEventListener('click',start);`);
return html;
};
