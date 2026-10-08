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
let timeLandingV018=null;
const sampleTimeV018=sampleBall;
function timeLandingStartV018(){
 if(timeLandingV018)return timeLandingV018;
 // Read the incoming curve immediately before its old floor-only wrapper.
 // Position and tangent belong to the flight that was actually launched.
 const flight=state.flight,step=.001;
 let point,previous;
 try{state.flight=state.duration;point=sampleTimeV018(1);previous=sampleTimeV018(1-step/state.duration);}finally{state.flight=flight;}
 const velocity=point.map((v,i)=>(v-previous[i])/step),gravity=6.5,radius=.245;
 const landing=(velocity[1]+Math.sqrt(velocity[1]*velocity[1]+2*gravity*Math.max(0,point[1]-radius)))/gravity;
 return timeLandingV018={point,velocity,gravity,radius,landing};
}
sampleBall=function(progress=state.flight/state.duration){
 if(ceremony!=='time'||state.flight<=state.duration)return sampleTimeV018(progress);
 const a=timeLandingStartV018(),post=state.flight-state.duration,air=Math.min(post,a.landing),roll=Math.max(0,post-a.landing);
 const travel=air+(1-Math.exp(-1.8*roll))/1.8;
 const bounce=Math.min(.48,Math.max(0,a.gravity*a.landing-a.velocity[1])*.13),bounceTime=2*bounce/a.gravity;
 const y=post<a.landing?a.point[1]+a.velocity[1]*post-a.gravity*post*post/2:a.radius+(roll<bounceTime?bounce*roll-a.gravity*roll*roll/2:0);
 return [a.point[0]+a.velocity[0]*travel,Math.max(a.radius,y),a.point[2]+a.velocity[2]*travel];
};
function rotateBallV018(dt,pos){
 if(state.mode==='paused')return;
 if(ceremony==='time'&&state.flight>state.duration+timeLandingStartV018().landing){
  const previous=lastRollPositionV018||pos;
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
beginTimePass=function(){lastRollPositionV018=null;timeLandingV018=null;return timePassV018();};
$('#start').addEventListener('click',start);`);
return html;
};
