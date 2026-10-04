// Seven original low-poly silhouettes on the established v0.29.1 contact skeleton.
// This file is loaded before the stage compiler; its runtime patch runs AFTER joints.
window.FEGCharacterRigs=window.FEGCharacterRigs||{};
window.FEGCharacterRigs.seven=function({root,group,mesh},x,appearance,face){
 const a=appearance,id=a.model||'toru',isShadow=!!a.shadow;
 const profiles={
  toru:{head:1.40,shoulder:1.08,width:.34,headWidth:.285,headHeight:.46,height:2.96,stance:-.045,signature:'soft-office-suit-loose-tie',bow:.77},
  saku:{head:1.45,shoulder:1.12,width:.39,headWidth:.235,headHeight:.53,height:3.48,stance:.018,signature:'wide-court-sleeves-tall-cap',bow:.31},
  sokichi:{head:1.07,shoulder:.83,width:.42,headWidth:.28,headHeight:.43,height:2.58,stance:-.21,signature:'hunched-vest-white-brows',bow:.46},
  sumi:{head:1.40,shoulder:1.09,width:.31,headWidth:.238,headHeight:.48,height:2.95,stance:.01,signature:'triangle-hakama-ponytail-boots',bow:.56},
  nagi:{head:1.31,shoulder:1.0,width:.29,headWidth:.232,headHeight:.46,height:2.86,stance:-.14,signature:'short-jacket-slim-trousers-sneakers',bow:.48},
  kota:{head:.76,shoulder:.51,width:.32,headWidth:.32,headHeight:.48,height:2.34,stance:-.02,signature:'small-hoodie-cap-shorts',bow:.83},
  luka:{head:1.83,shoulder:1.40,width:.32,headWidth:.255,headHeight:.54,height:3.43,stance:.045,signature:'tall-split-longcoat',bow:.35}
 };
 const p=profiles[id]||profiles.toru,n=group(root,[x,.12,0]);n.rot[1]=face<0?Math.PI:0;n.renderRole='fighter';
 const body=group(n,[0,1.08,0]),head=group(body,[.03,p.head,0]);
 const visible=[],glow=[],cloth=[];
 function part(parent,shape,color,pos,scale,rot=[0,0,0],tag=''){
  const o=mesh(parent,shape,isShadow?'#111018':color,pos,scale,rot);o.fegPart=tag;visible.push(o);return o;
 }
 function edge(parent,pos,scale,rot=[0,0,0]){const e=mesh(parent,'box','#ffe8a8',pos,scale,rot,1);e.visible=false;glow.push(e);return e;}
 function panel(parent,pos,scale,color,rot=[0,0,0],tag='cloth',shape='box'){
  const g=group(parent,pos);g.rot=rot;part(g,shape,color,[0,0,0],scale,[0,0,0],tag);cloth.push({n:g,rest:[...rot],kind:tag});return g;
 }
 // Small sculpted solids: eight corners and a few authored cross-sections keep
 // broad, readable facets without increasing the number of moving scene nodes.
 function sculpt(rings,outline=[[1,.42],[.55,1],[-.55,1],[-1,.42],[-1,-.42],[-.55,-1],[.55,-1],[1,-.42]]){
  const positions=[],normals=[],sides=outline.length;
  const rows=rings.map(([y,x,z,cx=0,cz=0])=>outline.map(([u,v])=>[u*x+cx,y,v*z+cz]));
  function tri(a,b,c){const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n)||1;for(const q of [a,b,c]){positions.push(...q);normals.push(...n.map(x=>x/len));}}
  for(let j=1;j<rows.length;j++)for(let i=0;i<sides;i++){const k=(i+1)%sides;tri(rows[j-1][i],rows[j][i],rows[j][k]);tri(rows[j-1][i],rows[j][k],rows[j-1][k]);}
  for(const [row,flip] of [[rows[0],false],[rows.at(-1),true]])for(let i=1;i<sides-1;i++)flip?tri(row[0],row[i+1],row[i]):tri(row[0],row[i],row[i+1]);
  return {p:new Float32Array(positions),n:new Float32Array(normals),count:positions.length/3};
 }
 const tailored=sculpt([[-.5,.40,.43],[-.38,.5,.5],[.33,.5,.5],[.5,.40,.43]]);
 const feminine=id==='sumi'||id==='nagi';
 const faceShape=sculpt([[-.5,feminine?.50:id==='toru'?.68:.65,feminine?.56:id==='toru'?.75:.73,.025],[-.29,id==='toru'?.88:.85,id==='toru'?.94:.88],[.09,1,1],[.33,.94,.96,-.015],[.5,.67,.74,-.07]],[[1,.22],[.92,.62],[.60,.90],[0,1],[-.65,.88],[-1,.40],[-1,-.40],[-.65,-.88],[0,-1],[.60,-.90],[.92,-.62],[1,-.22]]);
 const hairCrown=sculpt([[-.5,.45,.48],[.16,.52,.52],[.5,.32,.39,-.025]]);
 // Flatten a small eight-sided solid onto the face; 28 triangles per eye layer.
 const almond=(()=>{const g=sculpt([[-.5,.5,.5],[.5,.5,.5]],[[1,0],[.62,.74],[0,1],[-.62,.74],[-1,0],[-.62,-.74],[0,-1],[.62,-.74]]);for(const array of [g.p,g.n])for(let i=0;i<array.length;i+=3){const x=array[i];array[i]=array[i+1];array[i+1]=-x;}return g;})();
 // Put eyes and brows on the actual cheek facets. Fixed box coordinates made
 // them float outside the faceted head, especially in a three-quarter view.
 const faceMesh=part(head,id==='kota'?'ico':faceShape,a.skin,[0,0,0],[p.headWidth,id==='kota'?p.headHeight*.60:p.headHeight,p.headWidth],[0,.12,0],'face');
 function faceFeature(y,z,width,height,color,tag,tilt=0,shape='box',lift=shape===almond?.004:.007){
  const geo=faceMesh.geo,verts=[];let hit=null;
  for(let i=0;i<geo.p.length;i+=3){const x=geo.p[i]*faceMesh.scale[0],zz=geo.p[i+2]*faceMesh.scale[2];verts.push([x*Math.cos(.12)+zz*Math.sin(.12),geo.p[i+1]*faceMesh.scale[1],-x*Math.sin(.12)+zz*Math.cos(.12)]);}
  for(let i=0;i<verts.length;i+=3){
   const [v,w,q]=verts.slice(i,i+3),den=(w[2]-q[2])*(v[1]-q[1])+(q[1]-w[1])*(v[2]-q[2]);if(Math.abs(den)<1e-8)continue;
   const u=((w[2]-q[2])*(y-q[1])+(q[1]-w[1])*(z-q[2]))/den,b=((q[2]-v[2])*(y-q[1])+(v[1]-q[1])*(z-q[2]))/den;
   if(u<0||b<0||u+b>1)continue;const x=u*v[0]+b*w[0]+(1-u-b)*q[0];if(hit&&hit.x>=x)continue;
   const d=w.map((n,j)=>n-v[j]),e=q.map((n,j)=>n-v[j]),nx=d[1]*e[2]-d[2]*e[1],ny=d[2]*e[0]-d[0]*e[2],nz=d[0]*e[1]-d[1]*e[0],len=Math.hypot(nx,ny,nz)||1,sign=nx<0?-1:1;hit={x,nx:nx*sign/len,ny:ny*sign/len,nz:nz*sign/len};
  }
  if(!hit)return;
  return part(head,shape,color,[hit.x+hit.nx*lift,y+hit.ny*lift,z+hit.nz*lift],[shape===almond?.004:.012,height,width],[tilt,Math.atan2(-hit.nz,Math.hypot(hit.nx,hit.ny)),Math.atan2(hit.ny,hit.nx)],tag);
 }
 // Small open eyes and soft smiles remain attached to the authored cheek planes.
 // White/pupil shapes carry expression without textures or a new animation rig.
 const expression={toru:[.052,.084,.025,-.12,-.003],saku:[.040,.078,.019,-.03,.0],sokichi:[.042,.083,.055,-.12,.003],sumi:[.056,.080,.016,-.08,.010],nagi:[.058,.083,.018,-.10,.014],kota:[.079,.090,.025,-.15,.017],luka:[.046,.080,.021,-.07,.008]}[id]||[.048,.080,.024,0,0];
 for(const z of [-1,1]){
  faceFeature(.044,z*p.headWidth*.38,expression[1],expression[0],'#e7dfca','eye',z*-.06,almond);
  faceFeature(.044,z*p.headWidth*.38-.006,expression[1]*.43,expression[0]*.81,a.eyes,'pupil',0,almond,.0085);
  faceFeature(.061,z*p.headWidth*.38,expression[1]*.86,feminine?.014:.012,a.eyes,'upper-eyelid',z*-.07);
  faceFeature(.111,z*p.headWidth*.38,expression[1]*1.22,expression[2],a.hair,id==='sokichi'?'thick-white-brow':'brow',z*expression[3]);
  faceFeature(-.123+expression[4],z*.025,.051,id==='kota'?.018:.010,id==='sokichi'?'#806143':'#956652','mouth',z*(id==='saku'?-.09:-.23));
  part(head,'ico',a.skin,[-.04,-.055,z*p.headWidth*.91],[feminine?.043:.055,feminine?.075:.087,.038],[0,0,0],'ear');
 }
 part(head,id==='toru'||id==='sokichi'?'ico':tailored,a.nose,[p.headWidth*.91,-.049,0],[id==='sokichi'?.080:id==='toru'?.069:feminine?.058:.080,id==='luka'?.12:id==='toru'||id==='sokichi'?.065:feminine?.073:.09,id==='toru'||id==='sokichi'?.072:feminine?.069:.095],[0,0,-.10],'nose');
 const hairTop=p.headHeight*.45;
 part(head,hairCrown,a.hair,[-.04,hairTop,0],[p.headWidth*1.98,.17,p.headWidth*2.07],[0,0,-.045],'hair');
 part(head,tailored,a.hair,[-p.headWidth*.70,.066,0],[.135,.32,p.headWidth*1.73],[0,0,-.12],'back-hair');
 if(id==='toru'){
  part(head,sculpt([[-.5,.34,.44],[.05,.5,.5],[.5,.36,.40,-.02]]),a.hair,[.064,hairTop+.004,.074],[.32,.115,.36],[.13,.12,.13],'parted-hair');
  part(head,tailored,a.hair,[.107,hairTop-.061,-.129],[.26,.103,.143],[-.12,.1,-.14],'combed-side-part');
 }else if(id==='saku'){
  part(head,'box',a.cap,[-.075,.43,0],[.38,.28,.40],[0,0,-.12],'cap-base');
  part(head,'box',a.cap,[-.13,.66,0],[.22,.48,.27],[0,0,-.18],'high-eboshi');
  part(head,'box',a.trim,[.09,.34,.215],[.03,.23,.022],[0,0,-.08],'cap-cord');
 }else if(id==='sokichi'){
  for(const z of [-.21,.21]){
   part(head,'box',a.hair,[.08,-.12,z],[.13,.05,.055],[0,0,.15],'white-sideburn');
  }
  part(head,sculpt([[-.5,.24,.24],[.25,.5,.5],[.5,.36,.45]]),a.hair,[.14,-.203,0],[.24,.13,.30],[0,0,0],'short-white-beard');
 }else if(id==='sumi'){
  part(head,sculpt([[-.5,.29,.33],[0,.5,.5],[.5,.38,.42]]),a.hair,[-.060,.186,-.02],[.37,.20,.49],[.18,0,.16],'swept-hair');
  for(const z of [-1,1])part(head,sculpt([[-.5,.09,.24],[.05,.5,.5],[.5,.40,.40]]),a.hair,[.057,.068,z*.201],[.19,.28,.079],[z*.12,0,z<0?-.14:.12],'temple-lock');
  const pony=group(head,[-.245,.095,-.018]);pony.rot=[0,0,-.18];
  part(pony,sculpt([[-.69,.031,.045,.09],[-.48,.075,.080,.025],[-.12,.098,.092],[0,.065,.068]]),a.hair,[0,0,0],[1,1,1],[0,0,0],'ponytail');
  cloth.push({n:pony,rest:[...pony.rot],kind:'ponytail'});
  part(head,tailored,a.trim,[-.247,.048,-.02],[.15,.075,.20],[0,0,-.10],'hair-tie');
 }else if(id==='nagi'){
  part(head,sculpt([[-.5,.29,.39],[-.18,.5,.5],[.25,.5,.5],[.5,.30,.36]]),a.hair,[-.085,.066,.005],[.37,.37,.49],[0,0,.12],'short-slanted-hair');
  part(head,sculpt([[-.5,.10,.26],[0,.5,.5],[.5,.37,.42]]),a.hair,[.10,.163,.075],[.28,.20,.27],[.22,.08,.24],'fringe');
  part(head,sculpt([[-.5,.10,.16],[.13,.5,.5],[.5,.35,.42]]),a.hair,[.021,-.008,.201],[.21,.30,.107],[0,0,-.10],'bob-tip');
  part(head,tailored,a.hair,[-.15,-.077,-.188],[.16,.15,.09],[0,0,.22],'tucked-bob');
 }else if(id==='kota'){
  part(head,'head',a.cap,[-.025,.25,0],[.34,.20,.33],[0,0,0],'red-cap');
  part(head,'box',a.cap,[-.31,.235,0],[.36,.045,.48],[0,0,-.06],'backward-cap-brim');
  part(head,'box',a.shirt,[.265,.25,0],[.04,.07,.16],[0,0,0],'cap-strap');
 }else{
  part(head,tailored,a.hair,[-.12,.12,0],[.30,.36,.45],[0,0,-.08],'swept-back-hair');
  part(head,'ico',a.hair,[-.34,.05,0],[.13,.11,.12],[0,0,0],'tied-hair');
 }
 // Upper body design. All trims are actual low-poly geometry.
 if(id==='toru'){
  part(body,tailored,a.trousers,[0,.07,0],[.53,.27,.66],[0,0,0],'suit-waist');
  part(body,sculpt([[-.5,.48,.47],[-.22,.57,.53,.035],[.14,.51,.52],[.38,.48,.48],[.5,.33,.39]]),a.robe,[0,.65,0],[.56,1.08,.75],[0,0,0],'suit-jacket');
  part(body,tailored,a.shirt,[.314,.82,0],[.047,.62,.40],[0,0,-.07],'white-shirt');
  for(const z of [-1,1]){
   part(body,tailored,a.robe,[.327,.84,z*.23],[.07,.62,.19],[z*.32,0,-.07],'jacket-lapel');
   part(body,tailored,a.shirt,[.329,1.065,z*.105],[.055,.19,.17],[z*.43,0,0],'shirt-collar');
   edge(body,[.337,.84,z*.20],[.018,.60,.018],[z*.30,0,0]);
   part(body,'box',a.trousers,[.291,.37,z*.267],[.017,.17,.019],[z*.18,0,-.31],'jacket-crease');
  }
  const tie=panel(body,[.359,.707,.016],[.044,.45,.119],a.trim,[.04,0,-.13],'tie',sculpt([[-.5,.3,.03],[-.37,.5,.5],[.5,.35,.31]]));
  part(body,tailored,a.trim,[.34,.968,0],[.077,.10,.121],[0,0,-.07],'loosened-tie-knot');
  part(body,'box',a.accent,[.304,.55,.275],[.025,.024,.15],[0,0,-.06],'pocket');
  for(const y of [.58,.39])part(body,'box',a.accent,[.343,y,-.056],[.023,.026,.026],[0,0,0],'button');
  for(const z of [-1,1])panel(body,[-.06,.18,z*.25],[.47,.30,.25],a.robe,[0,0,-.055],'jacket-hem',tailored);
 }else if(id==='saku'){
  part(body,'robe',a.robe,[0,.67,0],[.44,1.05,.44],[0,0,0],'court-robe');
  part(body,tailored,a.shirt,[.26,1.08,0],[.25,.23,.32],[.15,0,-.22],'crossed-collar');
  part(body,'box',a.trim,[.02,.32,0],[.69,.13,.81],[0,0,0],'court-belt');
  for(const z of [-1,1])panel(body,[.05,.12,z*.29],[.57,.65,.29],a.trousers,[z*.02,0,0],'court-hakama');
  part(body,'box',a.accent,[.38,.78,.23],[.035,.60,.06],[0,0,-.10],'robe-seam');
 }else if(id==='sokichi'){
  part(body,'robe',a.robe,[.03,.43,0],[.42,.85,.42],[0,0,0],'work-shirt');
  part(body,tailored,a.trim,[-.17,.55,0],[.32,.92,.79],[0,0,.10],'vest-back');
  for(const z of [-1,1]){
   part(body,tailored,a.trim,[.18,.50,z*.28],[.26,.79,.23],[0,0,-.06],'vest-front');
   part(body,tailored,a.accent,[.32,.26,z*.27],[.065,.18,.20],[0,0,0],'vest-pocket');
  }
  part(body,'box',a.shirt,[.23,.64,0],[.08,.52,.27],[0,0,-.17],'work-shirt-collar');
 }else if(id==='sumi'){
  part(body,sculpt([[-.5,.36,.39],[-.23,.40,.43],[.26,.5,.5],[.5,.30,.38]]),a.robe,[0,.77,0],[.62,.83,.65],[0,0,0],'white-kosode');
  part(body,'cyl',a.skin,[.018,1.15,0],[.082,.23,.082],[0,0,0],'neck');
  for(const z of [-1,1])part(body,tailored,a.shirt,[.225,1.00,z*.085],[.068,.37,.108],[z*.48,0,-.18],'cross-collar');
  part(body,tailored,a.trousers,[0,.34,0],[.61,.19,.72],[0,0,0],'hakama-obi');
  // Two large faceted panels preserve the broad triangular hem and split for kicks.
  for(const z of [-1,1]){
   const skirt=group(body,[0,-.09,z*.27]);
   part(skirt,sculpt([[-.5,.49,.48],[-.43,.5,.5],[.5,.27,.30]]),a.trousers,[0,0,0],[.94,.83,.70],[0,0,0],'hakama-panel');
   cloth.push({n:skirt,rest:[0,0,0],kind:'hakama'});
   for(const x of [-.20,.08,.30])part(skirt,'box',a.trim,[x,-.12,z*(.335-Math.abs(x)*.16)],[.018,.56,.025],[0,0,x*.12],'hakama-pleat');
  }
  part(body,sculpt([[-.5,.33,.45],[0,.5,.31],[.5,.33,.5]]),a.trim,[.35,.32,.05],[.10,.19,.34],[0,0,-.15],'hakama-knot');
 }else if(id==='nagi'){
  part(body,tailored,a.trousers,[0,.04,0],[.40,.22,.52],[0,0,0],'sports-waist');
  part(body,sculpt([[-.5,.47,.5],[-.12,.39,.39],[.5,.5,.48]]),a.shirt,[.02,.49,0],[.43,.97,.56],[0,0,-.04],'sports-top');
  part(body,'cyl',a.skin,[.016,1.08,0],[.082,.23,.082],[0,0,0],'neck');
  part(body,sculpt([[-.5,.39,.43],[-.30,.43,.46],[.23,.51,.5],[.5,.33,.41]]),a.robe,[-.025,.79,0],[.50,.63,.63],[0,0,0],'cropped-windbreaker');
  part(body,'box',a.trim,[.22,.81,0],[.022,.48,.025],[0,0,0],'jacket-zip');
  for(const z of [-1,1]){
   part(body,'box',a.trim,[.06,.63,z*.285],[.30,.035,.025],[0,0,.18],'diagonal-reflector');
   part(body,tailored,a.robe,[.02,1.08,z*.145],[.30,.12,.15],[0,0,-.22],'sports-collar');
  }
 }else if(id==='kota'){
  part(body,tailored,a.robe,[0,.32,0],[.60,.65,.76],[0,0,0],'oversize-yellow-hoodie');
  part(body,'ico',a.trim,[-.18,.52,0],[.30,.29,.37],[0,0,0],'hood');
  part(body,'box',a.robe,[.24,.30,0],[.21,.42,.70],[0,0,0],'hoodie-front');
  part(body,'box',a.trim,[.35,.23,0],[.025,.17,.39],[0,0,0],'kangaroo-pocket');
  for(const z of [-.11,.11])part(body,'box',a.shirt,[.35,.50,z],[.025,.23,.024],[0,0,z],'drawstring');
 }else{
  part(body,'cyl',a.skin,[0,1.53,0],[.12,.32,.12],[0,0,0],'neck');
  part(body,tailored,a.shirt,[0,.86,0],[.47,1.19,.62],[0,0,0],'rust-inner');
  part(body,tailored,a.robe,[-.24,.83,0],[.20,1.45,.77],[0,0,.035],'coat-back');
  for(const z of [-1,1]){
   part(body,tailored,a.robe,[.13,.90,z*.29],[.37,1.16,.23],[0,0,0],'sleeveless-coat-front');
   part(body,tailored,a.accent,[.27,1.37,z*.22],[.10,.34,.18],[z*.18,0,-.15],'coat-lapel');
   panel(body,[-.075,-.04,z*.28],[.60,.85,.28],a.robe,[z*.045,0,-.07],'longcoat-tail',sculpt([[-.5,.48,.45],[-.33,.5,.5],[.5,.34,.39]]));
   part(body,'box',a.trim,[.34,.65,z*.29],[.035,.04,.20],[0,0,0],'coat-pocket');
  }
  part(body,'box',a.trim,[0,.41,0],[.61,.13,.72],[0,0,0],'travel-belt');
 }
 const shoulderWidth=feminine?.33:.40,arm=group(body,[.025,p.shoulder,shoulderWidth]),farArm=group(body,[.025,p.shoulder,-shoulderWidth]),arms=[];
 const shoulderShape=sculpt([[-.5,.39,.41],[.16,.50,.5],[.5,.23,.31]]),sleeveShape=sculpt([[-.5,.34,.38],[.12,.48,.5],[.5,.40,.44]]);
 for(const [i,shoulder] of [arm,farArm].entries()){
  const elbow=group(shoulder,[.07,-.35,0]),wrist=group(elbow,[.05,-.35,0]);arms.push(elbow,wrist);
  const clothColor=id==='luka'?a.shirt:a.robe,wide=id==='saku'?.43:id==='sumi'?.255:id==='nagi'?.165:id==='kota'?.29:.21,upperWide=wide*(id==='saku'?.85:id==='sumi'?.83:1);
  if(id==='luka'){
   part(shoulder,'robe',a.skin,[.025,-.16,0],[.145,.38,.145],[0,0,.08],'bare-upper-arm');
   part(elbow,'robe',a.skin,[.025,-.16,0],[.125,.35,.125],[0,0,.08],'bare-forearm');
  }else{
   part(shoulder,shoulderShape,clothColor,[.015,-.183,0],[upperWide*1.83,.37,upperWide*1.85],[0,0,.08],id==='saku'?'court-upper-sleeve':'upper-sleeve');
   part(elbow,sleeveShape,clothColor,[.015,-.16,0],[wide*1.62,.37,wide*1.64],[0,0,.08],'fore-sleeve');
  }
  if(id==='saku'){
   const sleeve=panel(elbow,[-.14,-.11,0],[.50,.50,.68],a.robe,[0,0,-.15],'hanging-court-sleeve',tailored);
   part(sleeve,'box',a.trim,[.25,-.23,0],[.025,.045,.69],[0,0,0],'sleeve-border');
  }
  if(id==='nagi')part(elbow,'box',a.trim,[.01,-.12,(i?-.131:.131)],[.21,.035,.022],[0,0,-.12],'sleeve-reflector');
  if(id==='toru')part(elbow,'box',a.shirt,[.04,-.31,0],[.23,.08,.24],[0,0,0],'shirt-cuff');
  part(wrist,'ico',a.skin,[0,-.035,0],[id==='sokichi'?.16:feminine?.105:.13,feminine?.13:.15,feminine?.10:.13],[0,0,0],'hand');
 }
 // Fixed hip / knee / ankle / toe pivots: contact solver and shot timing are unchanged.
 const leg=group(n,[.08,1.05,.22]),back=group(n,[-.13,1.05,-.23]),joints=[],toes=[];
 for(const l of [leg,back]){
  const thigh=group(l),knee=group(thigh,[0,-.48,0]),shoe=group(knee,[0,-.48,0]),toe=group(shoe,[.16,0,0]);shoe.renderRole='foot';joints.push(thigh,knee,shoe);toes.push(toe);
  const wide=id==='saku'?.29:id==='sumi'?.27:id==='sokichi'?.245:id==='kota'?.235:.19;
  part(thigh,id==='toru'||id==='nagi'?tailored:'robe',a.trousers,[0,-.22,0],[id==='toru'||id==='nagi'?wide*1.70:wide,.47,wide*1.14],[0,0,0],id==='kota'?'navy-shorts':'upper-trousers');
  part(knee,id==='toru'||id==='nagi'?tailored:'robe',id==='kota'?a.skin:a.trousers,[0,-.22,0],[id==='toru'||id==='nagi'?wide*1.50:wide*.80,.46,wide*.98],[0,0,0],id==='kota'?'bare-shin':'lower-trousers');
  if(id==='sokichi'){
   part(knee,'robe',a.trim,[0,-.31,0],[.19,.27,.21],[0,0,0],'gaiter');
   for(const y of [-.22,-.30,-.38])part(knee,'box',a.accent,[.17,y,.01],[.026,.025,.31],[0,0,0],'gaiter-tie');
  }
  if(id==='sumi'){
   part(knee,'box',a.shoes,[.03,-.31,.005],[.27,.31,.28],[0,0,0],'boot-shaft');
   for(const y of [-.22,-.29,-.36])part(knee,'box',a.accent,[.18,y,.01],[.024,.02,.12],[0,0,0],'boot-lace');
  }
  if(id==='kota')part(knee,'cyl',a.shirt,[0,-.35,0],[.145,.20,.145],[0,0,0],'white-sock');
  part(shoe,'box',a.shoes,[.025,0,.02],[.27,.16,.29],[0,0,0],'heel');
  part(toe,'box',a.shoes,[.08,0,.02],[.19,.16,.29],[0,0,0],'square-toe');
  part(shoe,'box',id==='nagi'||id==='kota'?a.shirt:a.eyes,[.035,-.08,.02],[.29,.035,.31],[0,0,0],'sole');
  part(toe,'box',id==='nagi'||id==='kota'?a.shirt:a.eyes,[.08,-.08,.02],[.20,.035,.31],[0,0,0],'toe-sole');
  if(id==='nagi'||id==='kota')for(const xx of [.005,.07])part(shoe,'box',a.shirt,[xx,.085,.02],[.027,.018,.21],[0,0,0],'sneaker-lace');
  edge(shoe,[.04,-.042,.176],[.30,.02,.018]);
 }
 // Small attached emissive edging floats with the same suit/model; no replacement body.
 for(const z of [-1,1]){edge(body,[-.02,.18,z*.39],[.48,.025,.02]);edge(head,[-.055,hairTop+.075,z*p.headWidth*.83],[.40,.015,.015]);}
 const actor={n,body,head,arm,farArm,leg,back,thigh:joints[0],knee:joints[1],shoe:joints[2],backThigh:joints[3],backKnee:joints[4],backShoe:joints[5],elbow:arms[0],wrist:arms[1],farElbow:arms[2],farWrist:arms[3],toe:toes[0],backToe:toes[1],kick:0,phase:face<0?1.7:0};
 for(let i=0;i<2;i++)joints[i*3+2].toe=toes[i];
 actor.chestHeight=1.08+p.shoulder-.19;
 actor.characterV030={id,isShadow,profile:p,parts:visible,glow,cloth,godMode:false,pose:'idle',headHeight:p.head,meshCount:visible.length,markers:[[.26,p.head,.22],[.34,p.shoulder-.19,.24],[.34,id==='kota'?-.10:.27,.24],[.05,id==='kota'?.45:.55,.24]],poses:['idle','bow','kick','stagger','pursuit','win'],contactContract:'garden-v0291:hip=1.05;segments=.48;toe=.16'};
 return actor;
};

window.otoPatchCharactersV030=function(html){
 function once(a,b){if(html.split(a).length!==2)throw Error('v0.30 characters anchor: '+a.slice(0,90));html=html.replace(a,b);}
 // Resolve a shadow at runtime from the selected player, including future player choices.
 once('const CPU_CHARACTER=STAGE_CONTENT.characters.find(c=>c.id===ACTIVE_STAGE.opponent);',`const CPU_SOURCE_CHARACTER=STAGE_CONTENT.characters.find(c=>c.id===ACTIVE_STAGE.opponent);
const CPU_CHARACTER=CPU_SOURCE_CHARACTER.derivedFromPlayer?{...PLAYER_CHARACTER,id:'shadow',name:CPU_SOURCE_CHARACTER.name,derivedFromPlayer:true,appearance:{...PLAYER_CHARACTER.appearance,shadow:true}}:CPU_SOURCE_CHARACTER;`);
 once(' const actor=CHARACTER_RIGS[character.rig]({root,group,mesh},x,character.appearance,face);',' const actor=CHARACTER_RIGS[character.rig]({root,group,mesh},x,character.appearance,face);actor.characterId=character.id;actor.characterName=character.name;');
 once("$('#start').addEventListener('click',start);",String.raw`
// Pose accents are render-only. The canonical two-link legs remain untouched.
// All saves participate in the existing reverse restore stack, including pauses.
function characterPoseV030(f,key){
 const c=f.characterV030;if(!c)return;
 const p=c.profile,phase=duelV022.phase,age=feelEnabledV023&&duelV022.entered?strideV024[key].attack:motionV029[key].age;
 const bow=bowAmountV0104(),inClose=inCloseV027(),win=f===player&&state.cpuDefeated;
 const hurt=f===cpu?state.cpuHurt:Math.max(bodyHitV010,knockdownV010,state.hurt),chasing=phase==='break';
 const k=age<.72?1-easeV023(age,.12,.60):0,strength=motion?1:.3;
 c.pose=bow>0?'bow':win?'win':chasing?'pursuit':hurt>0?'stagger':k>0||inClose?'kick':'idle';
 const sway=motion?Math.sin(visualTime*(c.id==='kota'?5.8:2.1)+f.phase):0;
 for(const node of [f.body,f.head,f.arm,f.farArm,f.elbow,f.farElbow,f.wrist,f.farWrist])saveDramaV028(node);
 // Close-combat torso anchors are already used by the foot solver. Preserve them.
 if(!inClose){
  f.body.rot[2]+=p.stance*(bow>0?.25:1);
  if(c.id==='toru'){
   f.arm.rot[2]-=.08+.13*k;f.farArm.rot[2]+=.07+.12*k;f.head.rot[2]+=.04;
   f.elbow.rot[2]+=.07;f.farElbow.rot[2]+=.08;
   if(win){f.body.rot[2]+=.10;f.head.rot[2]-=.12;f.arm.rot[2]-=.18;f.farArm.rot[2]-=.10;}
  }else if(c.id==='saku'){
   f.arm.rot[2]-=.24;f.farArm.rot[2]-=.24;f.elbow.rot[2]+=.47;f.farElbow.rot[2]+=.47;
   f.head.rot[2]-=.025;f.body.rot[1]+=.06*k;f.body.pos[1]-=.009*sway;
   if(win){f.elbow.rot[2]+=.40;f.farElbow.rot[2]+=.40;f.head.rot[2]+=.05;}
  }else if(c.id==='sokichi'){
   f.head.rot[2]+=.13;f.arm.rot[2]-=.29;f.farArm.rot[2]-=.26;f.elbow.rot[2]+=.18;f.farElbow.rot[2]+=.18;
   f.body.pos[1]-=.08;f.body.rot[2]-=.08*Math.max(0,hurt)*strength;
   if(duelV022.entered)f.body.rot[2]+=.10;
   if(win){f.body.rot[2]+=.12;f.farArm.rot[2]+=1.0;f.farElbow.rot[2]+=.30;}
  }else if(c.id==='sumi'){
   f.body.rot[1]+=.10+.24*k*strength;f.arm.rot[2]-=.17;f.farArm.rot[2]+=.12;f.head.rot[1]-=.10;
   f.elbow.rot[2]+=.22;f.farElbow.rot[2]+=.18;
   if(win){f.arm.rot[2]-=.25;f.farArm.rot[2]-=.25;f.head.rot[2]+=.07;}
  }else if(c.id==='nagi'){
   f.arm.rot[2]+=.18+.20*k;f.farArm.rot[2]-=.16+.17*k;f.elbow.rot[2]+=.48;f.farElbow.rot[2]+=.35;
   f.head.rot[2]+=.10;f.body.pos[1]-=.015*(sway+1)*strength;
   if(win){f.arm.rot[2]+=1.03;f.elbow.rot[2]+=.53;f.body.rot[2]+=.12;}
  }else if(c.id==='kota'){
   f.body.pos[1]+=.018*Math.max(0,sway)*strength;f.arm.rot[0]-=.27+.58*k;f.farArm.rot[0]+=.27+.58*k;
   f.elbow.rot[2]+=.45;f.farElbow.rot[2]+=.40;f.head.rot[2]+=.055*sway*strength;
   if(win){f.arm.rot[0]-=.95;f.farArm.rot[0]+=.95;f.elbow.rot[2]+=.3;f.farElbow.rot[2]+=.3;}
  }else{
   f.arm.rot[2]-=.22;f.farArm.rot[2]+=.14;f.elbow.rot[2]+=.25;f.farElbow.rot[2]+=.20;
   f.body.rot[1]+=.10*k*strength;f.head.rot[2]-=.045;
   if(win){f.arm.rot[2]+=.6;f.elbow.rot[2]+=1.05;f.head.rot[2]+=.08;}
  }
  if(chasing&&motion){
   const run=Math.sin(duelV022.time*(c.id==='kota'?21:c.id==='luka'?12:16));
   f.arm.rot[2]+=run*(c.id==='saku'?.12:.18);f.farArm.rot[2]-=run*(c.id==='saku'?.12:.18);
   f.elbow.rot[2]+=.2;f.farElbow.rot[2]+=.2;
  }
  if(hurt>0&&!win){f.head.rot[2]+=(c.id==='kota'?-.16:c.id==='sokichi'?.05:-.07)*Math.min(1,hurt)*strength;}
 }
 for(const cloth of c.cloth){
  saveDramaV028(cloth.n);const speed=chasing?Math.sin(duelV022.time*14)*.11:0;
  const flutter=(.018*sway+.16*k+speed)*strength+(c.godMode?.11:0);
  cloth.n.rot[2]+=cloth.kind==='ponytail'?-flutter:flutter;
  if(cloth.kind==='hakama')cloth.n.rot[0]+=(cloth.n.pos[2]>0?1:-1)*.24*k*strength;
  if(cloth.kind==='tie'&&c.godMode){cloth.n.rot[2]-=.28;cloth.n.rot[0]+=.15*Math.sin(visualTime*2)*strength;}
 }
 for(const e of c.glow)e.visible=c.godMode&&!c.isShadow;
}
// Individual bows retain the exact ceremony clock and repeated-bow behavior.
applyBowPose=function(){
 const k=bowAmountV0104();if(k<=0)return;
 for(const f of [player,cpu]){
  const c=f.characterV030,p=c?.profile,amount=p?p.bow:.62;
  f.body.rot[2]-=k*amount;f.body.pos[1]-=k*(c?.id==='sokichi'?.11:.07);f.head.rot[2]+=k*.16;
  f.arm.rot[2]-=k*(c?.id==='luka'?-.38:c?.id==='sokichi'?.43:.12);f.farArm.rot[2]-=k*.12;
  // Named elbows are transient in the final presentation layer, so use shoulders here.
  if(c?.id==='kota')f.head.rot[2]-=k*.14;
 }
};
const markerCharactersV030=markerDramaV028;
markerDramaV028=function(f,i){
 const c=f.characterV030;if(!c)return markerCharactersV030(f,i);
 const local=c.markers[i];return transformDramaV028(i===3?local:transformDramaV028(local,f.body),f.n);
};
const prepareCharactersV030=prepareDepthRenderV022;
prepareDepthRenderV022=function(){prepareCharactersV030();characterPoseV030(player,'player');characterPoseV030(cpu,'cpu');
 if(inCloseV027()&&(closeV027.turn%2?cpu:player).characterV030?.id==='kota'){
  // Child-body markers remain on the model; frame them at a readable pixel scale.
  renderer.zoom=Math.max(renderer.zoom,62*Math.max(12.3,renderer.width/renderer.height*6.8)/renderer.width);
  renderer.target[1]=Math.min(renderer.target[1],1.65);
 }
};
function setGodModeCharactersV030(enabled){
 const c=player.characterV030;if(!c)return false;c.godMode=!!enabled;
 for(const e of c.glow)e.visible=c.godMode;
 for(const o of c.parts){if(!o.fegBaseColor)o.fegBaseColor=[...o.color];o.color=c.godMode?o.fegBaseColor.map((v,i)=>Math.min(1,v*.75+[.29,.25,.17][i])):[...o.fegBaseColor];}
 return c.godMode;
};
function getCharactersV030(){return [player,cpu].map(f=>{const c=f.characterV030;return {id:f.characterId,name:f.characterName,model:c?.id,shadow:!!c?.isShadow,godMode:!!c?.godMode,pose:c?.pose,height:c?.profile.height,chestHeight:f.chestHeight,signature:c?.profile.signature,meshCount:c?.meshCount,poses:c?.poses,contactContract:c?.contactContract};});};
$('#start').addEventListener('click',start);`);
 once('select(0);refreshHud();requestAnimationFrame(frame);','window.kemari.setGodMode=setGodModeCharactersV030;window.kemari.getCharacters=getCharactersV030;\nselect(0);refreshHud();requestAnimationFrame(frame);');
 return html;
};
