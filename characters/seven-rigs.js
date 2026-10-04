// Seven original low-poly silhouettes on the established v0.29.1 contact skeleton.
// This file is loaded before the stage compiler; its runtime patch runs AFTER joints.
window.FEGCharacterRigs=window.FEGCharacterRigs||{};
window.FEGCharacterRigs.seven=function({root,group,mesh},x,appearance,face){
 const a=appearance,id=a.model||'toru',isShadow=!!a.shadow;
 const profiles={
  toru:{head:1.40,shoulder:1.08,width:.34,headWidth:.245,headHeight:.61,height:2.96,stance:-.045,signature:'soft-office-suit-loose-tie',bow:.77},
  saku:{head:1.45,shoulder:1.12,width:.39,headWidth:.219,headHeight:.60,height:3.48,stance:.018,signature:'wide-court-sleeves-tall-cap',bow:.31},
  sokichi:{head:1.07,shoulder:.83,width:.42,headWidth:.257,headHeight:.55,height:2.58,stance:-.21,signature:'hunched-vest-white-brows',bow:.46},
  sumi:{head:1.40,shoulder:1.09,width:.31,headWidth:.215,headHeight:.61,height:2.95,stance:.01,signature:'triangle-hakama-ponytail-boots',bow:.56},
  nagi:{head:1.31,shoulder:1.0,width:.29,headWidth:.211,headHeight:.58,height:2.86,stance:-.14,signature:'short-jacket-slim-trousers-sneakers',bow:.48},
  kota:{head:.76,shoulder:.51,width:.32,headWidth:.284,headHeight:.52,height:2.34,stance:-.02,signature:'small-hoodie-cap-shorts',bow:.83},
  luka:{head:1.83,shoulder:1.40,width:.32,headWidth:.230,headHeight:.66,height:3.43,stance:.045,signature:'tall-split-longcoat',bow:.35}
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
 // Thin tailored pieces follow the torso rather than reading as raised boxes.
 function sheet(points,depth=.015){
  const u=points[1].map((x,i)=>x-points[0][i]),v=points[2].map((x,i)=>x-points[0][i]),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...cross);
  const rows=[points,points.map(q=>q.map((x,i)=>x-cross[i]/length*depth))],p=[],n=[];
  function tri(a,b,c){const u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...cross)||1;for(const q of [a,b,c]){p.push(...q);n.push(...cross.map(x=>x/len));}}
  for(let i=1;i<points.length-1;i++){tri(rows[0][0],rows[0][i],rows[0][i+1]);tri(rows[1][0],rows[1][i+1],rows[1][i]);}
  for(let i=0;i<points.length;i++){const k=(i+1)%points.length;tri(rows[0][i],rows[1][i],rows[1][k]);tri(rows[0][i],rows[1][k],rows[0][k]);}
  return {p:new Float32Array(p),n:new Float32Array(n),count:p.length/3};
 }
 const tailored=sculpt([[-.5,.40,.43],[-.38,.5,.5],[.33,.5,.5],[.5,.40,.43]]);
 const feminine=id==='sumi'||id==='nagi';
 const round=id==='toru'||id==='sokichi'||id==='kota';
 // The cheek, jaw and chin each have a distinct section. Forward is +X.
 const headOutline=[[1,0],[.98,.28],[.88,.57],[.66,.83],[.29,.99],[-.20,.98],[-.65,.81],[-.94,.43],[-1,0],[-.94,-.43],[-.65,-.81],[-.20,-.98],[.29,-.99],[.66,-.83],[.88,-.57],[.98,-.28]];
 const faceShape=sculpt([[-.5,.55,round?.55:.38,.10],[-.39,.79,round?.83:.65,.055],[-.19,round?1.01:.96,round?1.02:.86,.008],[.06,1,1],[.29,.92,.94,-.015],[.46,.70,.78,-.045],[.5,.40,.47,-.065]],headOutline);
 const hairCrown=sculpt([[-.5,.44,.44],[-.08,.50,.5],[.28,.40,.44,-.035],[.5,.19,.27,-.025]],headOutline);
 function tint(hex,to,amount){const a=parseInt(hex.slice(1),16),b=parseInt(to.slice(1),16);return '#'+[16,8,0].map(shift=>Math.round(((a>>shift)&255)*(1-amount)+((b>>shift)&255)*amount).toString(16).padStart(2,'0')).join('');}
 // The outline selector is expanded into a facet-clipped surface below.
 const almond='almond';
 // Put eyes and brows on the actual cheek facets. Fixed box coordinates made
 // them float outside the faceted head, especially in a three-quarter view.
 const faceMesh=part(head,faceShape,a.skin,[0,0,0],[p.headWidth,p.headHeight,p.headWidth],[0,.12,0],'face');
 function faceHit(y,z){
  const geo=faceMesh.geo,verts=[];let hit=null;
  for(let i=0;i<geo.p.length;i+=3){const x=geo.p[i]*faceMesh.scale[0],zz=geo.p[i+2]*faceMesh.scale[2];verts.push([x*Math.cos(.12)+zz*Math.sin(.12),geo.p[i+1]*faceMesh.scale[1],-x*Math.sin(.12)+zz*Math.cos(.12)]);}
  for(let i=0;i<verts.length;i+=3){
   const [v,w,q]=verts.slice(i,i+3),den=(w[2]-q[2])*(v[1]-q[1])+(q[1]-w[1])*(v[2]-q[2]);if(Math.abs(den)<1e-8)continue;
   const u=((w[2]-q[2])*(y-q[1])+(q[1]-w[1])*(z-q[2]))/den,b=((q[2]-v[2])*(y-q[1])+(v[1]-q[1])*(z-q[2]))/den;
   if(u<0||b<0||u+b>1)continue;const x=u*v[0]+b*w[0]+(1-u-b)*q[0];if(hit&&hit.x>=x)continue;
   const d=w.map((n,j)=>n-v[j]),e=q.map((n,j)=>n-v[j]),nx=d[1]*e[2]-d[2]*e[1],ny=d[2]*e[0]-d[0]*e[2],nz=d[0]*e[1]-d[1]*e[0],len=Math.hypot(nx,ny,nz)||1,sign=nx<0?-1:1;hit={x,nx:nx*sign/len,ny:ny*sign/len,nz:nz*sign/len};
  }
  return hit;
 }
 function faceFeature(y,z,width,height,color,tag,tilt=0,shape='box'){
  // Clip each feature triangle to each actual cheek facet. Projecting only a
  // polygon's corners lets the interpolated interior sink through a convex face.
  const lift=tag==='pupil'?.0035:tag==='upper-eyelid'?.005:tag==='eye-glint'?.0055:.002;
  const hit=faceHit(y,z);if(!hit)return;
  const origin=[hit.x+lift,y,z],positions=[],normals=[];
  const outline=shape===almond?[[0,.5],[.36,.31],[.5,0],[.36,-.31],[0,-.5],[-.36,-.31],[-.5,0],[-.36,.31]]:[[.5,.5],[.5,-.5],[-.5,-.5],[-.5,.5]];
  function point(u,v){let yy=u*height,zz=v*width;const angle=tag==='mouth'?0:tilt;[yy,zz]=[yy*Math.cos(angle)-zz*Math.sin(angle),yy*Math.sin(angle)+zz*Math.cos(angle)];yy+=y;zz+=z;if(tag==='mouth')yy+=.018*(zz/.09)**2;return [yy,zz];}
  const middle=point(0,0),edge=outline.map(([u,v])=>point(u,v));
  const verts=[];for(let i=0;i<faceMesh.geo.p.length;i+=3){const x=faceMesh.geo.p[i]*faceMesh.scale[0],zz=faceMesh.geo.p[i+2]*faceMesh.scale[2];verts.push([x*Math.cos(.12)+zz*Math.sin(.12),faceMesh.geo.p[i+1]*faceMesh.scale[1],-x*Math.sin(.12)+zz*Math.cos(.12)]);}
  const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  function clip(poly,bounds){const sign=Math.sign(cross(bounds[0],bounds[1],bounds[2]));for(let i=0;i<3;i++){const a=bounds[i],b=bounds[(i+1)%3],next=[];for(let j=0;j<poly.length;j++){const p=poly[j],q=poly[(j+1)%poly.length],dp=cross(a,b,p)*sign,dq=cross(a,b,q)*sign;if(dp>=-1e-9)next.push(p);if((dp>=0)!==(dq>=0)){const t=dp/(dp-dq);next.push(p.map((x,k)=>x+(q[k]-x)*t));}}poly=next;if(!poly.length)break;}return poly;}
  for(let k=0;k<verts.length;k+=3){
   const [a,b,c]=verts.slice(k,k+3),u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...normal);if(Math.abs(normal[0])<1e-8)continue;const n=normal.map(x=>x/length*(normal[0]<0?-1:1)),bounds=[a,b,c].map(p=>p.slice(1));
   const onFace=p=>[a[0]-(normal[1]*(p[0]-a[1])+normal[2]*(p[1]-a[2]))/normal[0]+lift,p[0],p[1]];
   for(let i=0;i<edge.length;i++){const polygon=clip([middle,edge[i],edge[(i+1)%edge.length]],bounds);if(polygon.length<3)continue;const center=polygon.reduce((p,q)=>p.map((x,j)=>x+q[j]/polygon.length),[0,0]),front=faceHit(...center);if(!front||Math.abs(onFace(center)[0]-lift-front.x)>.00001)continue;
    for(let j=1;j<polygon.length-1;j++){if(Math.abs(cross(polygon[0],polygon[j],polygon[j+1]))<1e-11)continue;for(const p of [polygon[0],polygon[j],polygon[j+1]]){positions.push(...onFace(p).map((x,k)=>x-origin[k]));normals.push(...n);}}
   }
  }
  return part(head,{p:new Float32Array(positions),n:new Float32Array(normals),count:positions.length/3},color,origin,[1,1,1],[0,0,0],tag);
 }
 // Almond eye whites are broad enough to read at gameplay scale. Pupils sit
 // in their upper half; the top lid connects them to a deliberate expression.
 const expression={toru:[.051,.109,.027,-.09,-.008],saku:[.055,.101,.023,-.025,-.002],sokichi:[.052,.111,.045,-.12,.008],sumi:[.069,.114,.021,-.065,.004],nagi:[.070,.113,.022,-.11,.010],kota:[.099,.136,.031,-.16,.008],luka:[.064,.105,.029,-.06,-.008]}[id];
 const eyeY=id==='kota'?.035:.063,eyeZ=p.headWidth*(id==='kota'?.42:.43);
 for(const z of [-1,1]){
  faceFeature(eyeY,z*eyeZ,expression[1],expression[0],'#f3e8d3','eye',z*-.075,almond);
  faceFeature(eyeY+.007,z*eyeZ-.003,expression[1]*(feminine||id==='kota'?.45:.41),expression[0]*.86,a.eyes,'pupil',0,almond,.0085);
  faceFeature(eyeY+expression[0]*.38,z*eyeZ,expression[1]*.94,.011,a.eyes,'upper-eyelid',z*-.09,almond,.010);
  faceFeature(eyeY+.074,z*eyeZ,expression[1]*1.09,expression[2],a.hair,id==='sokichi'?'thick-white-brow':'brow',z*expression[3]);
  faceFeature(eyeY+.020,z*eyeZ-.011,.010,.010,'#fff3dc','eye-glint',0,almond);
  faceFeature(-p.headHeight*.267+expression[4],z*.043,.094,id==='kota'?.021:.012,id==='sokichi'?'#866043':'#99604f','mouth',z*-.27,almond);
  part(head,sculpt([[-.5,.21,.21],[-.2,.48,.5],[.26,.5,.44],[.5,.27,.24]]),a.skin,[-.032,-.054,z*p.headWidth*.94],[feminine?.076:.086,.144,.078],[z*-.18,0,0],'ear');
 }
 // Nasal bridge and tip are one faceted form, joined to the face at its back.
 part(head,round?sculpt([[-.5,.21,.25],[-.2,.48,.44,.03],[.06,.5,.50,.025],[.32,.25,.21],[.5,.12,.11,-.1]]):sculpt([[-.5,.23,.30,.02],[-.25,.54,.50,.09],[.06,.33,.31],[.5,.08,.10,-.10]]),tint(a.skin,a.nose,.42),[p.headWidth*.965,-.038,0],[round?.104:feminine?.078:.103,id==='luka'?.19:round?.121:.134,round?.111:feminine?.077:.091],[0,.12,-.12],'nose');
 const hairTop=p.headHeight*.42;
 part(head,hairCrown,a.hair,[-.043,hairTop-.007,0],[p.headWidth*2.13,.25,p.headWidth*2.16],[0,0,-.055],'hair');
 part(head,sculpt([[-.5,.24,.32],[-.24,.44,.46],[.28,.50,.50],[.5,.31,.37]],headOutline),a.hair,[-p.headWidth*.62,.034,0],[.20,.37,p.headWidth*1.94],[0,0,-.07],'back-hair');
 const lockShape=sculpt([[-.5,.07,.065,.18,-.14],[-.28,.30,.31,.09,-.06],[.12,.5,.5],[.5,.36,.38,-.09,.12]]);
 function lock(pos,scale,rot,tag='hair-lock',shade=0){return part(head,lockShape,tint(a.hair,'#75747d',shade),pos,scale,rot,tag);}
 if(id==='toru'){
  part(head,sheet([[.115,.369,-.122],[.246,.310,.025],[.251,.212,.176],[.206,.168,.180],[.228,.246,.032]],.039),tint(a.hair,'#75747d',.055),[0,0,0],[1,1,1],[0,0,0],'parted-hair');
  part(head,sheet([[.110,.342,-.155],[.221,.280,-.084],[.241,.178,-.149],[.142,.121,-.212]],.035),a.hair,[0,0,0],[1,1,1],[0,0,0],'combed-side-part');
  lock([-.016,.047,.220],[.12,.18,.080],[0,0,-.09],'sideburn');
 }else if(id==='saku'){
  part(head,sculpt([[-.5,.5,.5],[.27,.49,.5],[.5,.36,.44]]),a.cap,[-.050,.389,0],[.42,.245,.44],[0,0,-.10],'cap-base');
  part(head,sculpt([[-.5,.48,.5],[.31,.44,.44],[.5,.37,.43,-.015]]),a.cap,[-.12,.663,0],[.235,.47,.28],[0,0,-.15],'high-eboshi');
  part(head,'box',a.trim,[.158,.37,.178],[.022,.18,.022],[0,0,-.08],'cap-cord');
  for(const z of [-1,1])lock([-.003,.018,z*.203],[.12,.19,.06],[z*.08,0,-.10],'court-sideburn');
 }else if(id==='sokichi'){
  for(const z of [-1,1])lock([-.007,-.090,z*.236],[.105,.16,.065],[0,0,-.08],'white-sideburn');
  part(head,sculpt([[-.5,.25,.20,.02],[-.12,.51,.49],[.5,.44,.50]]),a.hair,[.143,-.222,0],[.25,.145,.33],[0,0,-.07],'short-white-beard');
  for(const z of [-1,1])lock([.135,.233,z*.10],[.19,.135,.24],[z*.35,0,-.6],'silver-hair-lock',.05);
 }else if(id==='sumi'){
  part(head,sheet([[.087,.372,-.095],[.231,.298,.030],[.233,.220,.123],[.161,.076,.204],[.157,.180,.172]],.034),tint(a.hair,'#75747d',.045),[0,0,0],[1,1,1],[0,0,0],'swept-hair');
  part(head,sheet([[.101,.347,-.128],[.218,.286,-.089],[.196,.132,-.175],[.112,.133,-.199]],.029),a.hair,[0,0,0],[1,1,1],[0,0,0],'parted-hair');
  for(const z of [-1,1])lock([.110,-.025,z*.181],[.098,.45,.065],[z*.08,0,-.08],'temple-lock');
  const pony=group(head,[-.235,.136,-.006]);pony.rot=[0,0,-.17];
  part(pony,sculpt([[-.81,.022,.03,.04],[-.62,.069,.07,-.006],[-.25,.101,.087],[-.04,.094,.095],[.035,.047,.060]]),a.hair,[0,0,0],[1,1,1],[0,0,0],'ponytail');
  cloth.push({n:pony,rest:[...pony.rot],kind:'ponytail'});
  part(head,tailored,a.trim,[-.259,.143,-.008],[.12,.098,.18],[0,0,-.10],'hair-tie');
 }else if(id==='nagi'){
  // A bob expands around the ears and ends at the jaw; the leading lock is
  // deliberately much longer than the tucked side.
  for(const z of [-1,1])part(head,sculpt([[-.5,.13,.19,.09],[-.24,.41,.50],[.15,.5,.48],[.5,.32,.30,-.06]]),a.hair,[-.065,.011,z*.182],[.39,.54,.21],[z*.04,0,-.06],z>0?'bob-tip':'tucked-bob');
  part(head,sheet([[.061,.360,-.111],[.222,.296,.039],[.227,.199,.125],[.145,.005,.230],[.135,.127,.202]],.039),tint(a.hair,'#75747d',.07),[0,0,0],[1,1,1],[0,0,0],'fringe');
  part(head,sheet([[.092,.333,-.121],[.214,.265,-.086],[.169,.048,-.207],[.074,.169,-.225]],.034),a.hair,[0,0,0],[1,1,1],[0,0,0],'short-slanted-hair');
 }else if(id==='kota'){
  part(head,sculpt([[-.5,.49,.5],[.04,.51,.50],[.39,.39,.39],[.5,.22,.27]]),a.cap,[-.025,.294,0],[.64,.24,.64],[0,0,0],'red-cap');
  part(head,tailored,a.cap,[-.315,.217,0],[.40,.045,.49],[0,0,-.12],'backward-cap-brim');
  part(head,tailored,a.shirt,[.286,.244,0],[.025,.079,.18],[0,0,0],'cap-strap');
  for(const z of [-1,0,1])lock([.209,.166,z*.16],[.17,.20,.13],[z*.24,.05,-.29],'child-fringe');
 }else{
  part(head,sheet([[.077,.379,-.120],[.230,.322,.026],[.242,.208,.120],[.126,.143,.207],[.144,.256,.102]],.037),tint(a.hair,'#75747d',.05),[0,0,0],[1,1,1],[0,0,0],'swept-back-hair');
  part(head,sheet([[.078,.360,-.161],[.225,.275,-.094],[.216,.157,-.151],[.122,.141,-.207]],.031),a.hair,[0,0,0],[1,1,1],[0,0,0],'traveller-fringe');
  for(const z of [-1,1])lock([.02,-.037,z*.201],[.09,.37,.062],[0,0,-.11],'temple-lock');
  part(head,'ico',a.hair,[-.285,.034,0],[.125,.115,.13],[0,0,0],'tied-hair');
 }
 function drapedRibbon(surface,rows){
  // The collar is clipped to actual garment facets, including the open neck.
  const vertices=[],positions=[],normals=[];
  for(let i=0;i<surface.geo.p.length;i+=3)vertices.push([0,1,2].map(j=>surface.geo.p[i+j]*surface.scale[j]+surface.pos[j]));
  function front(y,z){let best=-Infinity;for(let i=0;i<vertices.length;i+=3){const[a,b,c]=vertices.slice(i,i+3),d=(b[2]-c[2])*(a[1]-c[1])+(c[1]-b[1])*(a[2]-c[2]);if(Math.abs(d)<1e-9)continue;const u=((b[2]-c[2])*(y-c[1])+(c[1]-b[1])*(z-c[2]))/d,v=((c[2]-a[2])*(y-c[1])+(a[1]-c[1])*(z-c[2]))/d;if(u>=-1e-9&&v>=-1e-9&&u+v<=1.000000001)best=Math.max(best,u*a[0]+v*b[0]+(1-u-v)*c[0]);}return best;}
  const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  function clip(poly,bounds){const sign=Math.sign(cross(bounds[0],bounds[1],bounds[2]));for(let i=0;i<3;i++){const a=bounds[i],b=bounds[(i+1)%3],next=[];for(let j=0;j<poly.length;j++){const p=poly[j],q=poly[(j+1)%poly.length],dp=cross(a,b,p)*sign,dq=cross(a,b,q)*sign;if(dp>=-1e-9)next.push(p);if((dp>=0)!==(dq>=0)){const t=dp/(dp-dq);next.push(p.map((x,k)=>x+(q[k]-x)*t));}}poly=next;if(!poly.length)break;}return poly;}
  for(let k=0;k<vertices.length;k+=3){const [a,b,c]=vertices.slice(k,k+3),u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...normal);if(Math.abs(normal[0])<1e-8)continue;const n=normal.map(x=>x/length*(normal[0]<0?-1:1)),bounds=[a,b,c].map(p=>p.slice(1)),point=p=>[a[0]-(normal[1]*(p[0]-a[1])+normal[2]*(p[1]-a[2]))/normal[0],p[0],p[1]];
   for(let r=1;r<rows.length;r++){const p=rows[r-1],q=rows[r],polygon=clip([[p[1],p[2]],[p[1],p[3]],[q[1],q[3]],[q[1],q[2]]],bounds);if(polygon.length<3)continue;const center=polygon.reduce((a,b)=>a.map((x,i)=>x+b[i]/polygon.length),[0,0]),x=point(center)[0];if(x<.035||Math.abs(x-front(...center))>.00001)continue;
    for(let j=1;j<polygon.length-1;j++){if(Math.abs(cross(polygon[0],polygon[j],polygon[j+1]))<1e-11)continue;for(const p of [polygon[0],polygon[j],polygon[j+1]]){const v=point(p);positions.push(v[0]+.003,v[1],v[2]);normals.push(...n);}}
   }
  }
  return{p:new Float32Array(positions),n:new Float32Array(normals),count:positions.length/3};
 }
 // Lower only the front neckline; the shoulder and back seam stay high.
 function openNeck(geometry,drop){
  const p=[],n=[];for(let i=0;i<geometry.p.length;i+=9){if([1,4,7].every(k=>geometry.p[i+k]>.499))continue;p.push(...geometry.p.slice(i,i+9));}
  for(let i=0;i<p.length;i+=3)if(p[i+1]>.499&&p[i]>0)p[i+1]-=drop*Math.max(0,1-Math.abs(p[i+2])/.30);
  for(let i=0;i<p.length;i+=9){const u=[p[i+3]-p[i],p[i+4]-p[i+1],p[i+5]-p[i+2]],v=[p[i+6]-p[i],p[i+7]-p[i+1],p[i+8]-p[i+2]],cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...cross);for(let j=0;j<3;j++)n.push(...cross.map(x=>x/length));}
  return {p:new Float32Array(p),n:new Float32Array(n),count:p.length/3};
 }
 // Upper body design. All trims are actual low-poly geometry.
 if(id==='toru'){
  part(body,'cyl',a.skin,[.005,1.085,0],[.095,.235,.095],[0,0,0],'neck');
  part(body,tailored,a.trousers,[0,.07,0],[.53,.27,.66],[0,0,0],'suit-waist');
  part(body,sculpt([[-.5,.48,.47],[-.22,.57,.53,.035],[.14,.51,.52],[.38,.48,.48],[.5,.33,.39]]),a.robe,[0,.61,0],[.56,.96,.75],[0,0,0],'suit-jacket');
  part(body,sheet([[.283,1.085,-.117],[.283,1.085,.117],[.347,.32,.102],[.347,.32,-.102]]),a.shirt,[0,0,0],[1,1,1],[0,0,0],'white-shirt');
  for(const z of [-1,1]){
   part(body,sheet([[.232,1.09,z*.198],[.306,.985,z*.288],[.348,.81,z*.166],[.359,.52,z*.078]],.01),tint(a.robe,'#1e2b3d',.10),[0,0,0],[1,1,1],[0,0,0],'jacket-lapel');
   part(body,sheet([[.243,1.079,z*.018],[.316,1.049,z*.144],[.361,.929,z*.075]],.006),a.shirt,[0,0,0],[1,1,1],[0,0,0],'shirt-collar');
   edge(body,[.337,.84,z*.20],[.018,.60,.018],[z*.30,0,0]);
   part(body,'box',a.trousers,[.291,.37,z*.267],[.017,.17,.019],[z*.18,0,-.31],'jacket-crease');
  }
  const tie=panel(body,[.359,.707,.016],[.044,.45,.119],a.trim,[.04,0,-.13],'tie',sculpt([[-.5,.3,.03],[-.37,.5,.5],[.5,.35,.31]]));
  part(body,tailored,a.trim,[.34,.967,0],[.061,.083,.101],[0,0,-.07],'loosened-tie-knot');
  part(body,'box',a.accent,[.304,.55,.275],[.025,.024,.15],[0,0,-.06],'pocket');
  for(const y of [.58,.39])part(body,'box',a.accent,[.343,y,-.056],[.023,.026,.026],[0,0,0],'button');
  for(const z of [-1,1])panel(body,[-.06,.18,z*.25],[.47,.30,.25],a.robe,[0,0,-.055],'jacket-hem',tailored);
 }else if(id==='saku'){
  part(body,sculpt([[-.5,.43,.43],[-.23,.49,.49],[.25,.5,.5],[.5,.31,.36]]),a.robe,[0,.69,0],[.65,.98,.74],[0,0,0],'court-robe');
  part(body,sheet([[.260,1.115,-.13],[.309,1.065,-.045],[.346,.755,.091],[.338,.805,.127]]),a.shirt,[0,0,0],[1,1,1],[0,0,0],'crossed-collar');
  part(body,'box',a.trim,[.02,.32,0],[.69,.13,.81],[0,0,0],'court-belt');
  for(const z of [-1,1])panel(body,[.015,-.20,z*.225],[.74,1.11,.53],a.trousers,[z*.02,0,0],'court-hakama',sculpt([[-.5,.49,.50],[-.38,.48,.49],[.32,.33,.36],[.5,.29,.31]]));
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
  const kosode=part(body,openNeck(sculpt([[-.5,.37,.40],[-.15,.40,.43],[.23,.5,.5],[.5,.30,.35]],headOutline),.33),a.robe,[0,.72,0],[.56,.76,.64],[0,0,0],'white-kosode');
  part(body,'cyl',a.skin,[.018,1.10,0],[.080,.22,.080],[0,0,0],'neck');
  part(body,sheet([[.105,1.085,-.13],[.105,1.085,.13],[.286,.79,.05],[.286,.79,-.05]],.008),a.skin,[0,0,0],[1,1,1],[0,0,0],'neckline-skin');
  for(const z of [-1,1])part(body,drapedRibbon(kosode,[[.225,1.09,z*.059,z*.165],[.307,.91,z*.004,z*.102],[.306,.72,-z*.093,-z*.049],[.299,.65,-z*.131,-z*.087]]),a.shirt,[0,0,0],[1,1,1],[0,0,0],'cross-collar');
  part(body,tailored,a.trousers,[0,.34,0],[.61,.19,.72],[0,0,0],'hakama-obi');
  // Two large faceted panels preserve the broad triangular hem and split for kicks.
  for(const z of [-1,1]){
   const skirt=group(body,[0,-.09,z*.27]);
   part(skirt,sculpt([[-.5,.49,.48],[-.43,.5,.5],[.5,.27,.30]]),a.trousers,[0,0,0],[.94,.83,.70],[0,0,0],'hakama-panel');
   cloth.push({n:skirt,rest:[0,0,0],kind:'hakama'});
   for(const x of [-.20,.08,.30])part(skirt,sheet([[x*.60,.37,z*.213],[x*.60+.025,.37,z*.213],[x+.032,-.37,z*(.349-Math.abs(x)*.16)],[x,-.37,z*(.344-Math.abs(x)*.16)]]),tint(a.trousers,a.trim,.32),[0,0,0],[1,1,1],[0,0,0],'hakama-pleat');
  }
  part(body,sculpt([[-.5,.28,.45],[-.04,.5,.27],[.5,.29,.50]]),a.trousers,[.31,.34,.025],[.08,.15,.31],[0,0,-.09],'hakama-knot');
 }else if(id==='nagi'){
  part(body,tailored,a.trousers,[0,.04,0],[.40,.22,.52],[0,0,0],'sports-waist');
  part(body,sculpt([[-.5,.47,.5],[-.12,.39,.39],[.5,.5,.48]]),a.shirt,[.02,.49,0],[.43,.97,.56],[0,0,-.04],'sports-top');
  part(body,'cyl',a.skin,[.016,1.08,0],[.082,.23,.082],[0,0,0],'neck');
  part(body,sculpt([[-.5,.39,.43],[-.30,.43,.46],[.23,.51,.5],[.5,.33,.41]]),a.robe,[-.025,.73,0],[.50,.57,.63],[0,0,0],'cropped-windbreaker');
  part(body,'box',a.trim,[.22,.81,0],[.022,.48,.025],[0,0,0],'jacket-zip');
  for(const z of [-1,1]){
   part(body,'box',a.trim,[.06,.63,z*.285],[.30,.035,.025],[0,0,.18],'diagonal-reflector');
   part(body,tailored,a.robe,[.02,1.025,z*.145],[.30,.12,.15],[0,0,-.22],'sports-collar');
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
   part(body,tailored,a.accent,[.27,1.37,z*.22],[.036,.34,.18],[z*.18,0,-.15],'coat-lapel');
   panel(body,[-.075,-.04,z*.28],[.60,.85,.28],a.robe,[z*.045,0,-.07],'longcoat-tail',sculpt([[-.5,.48,.45],[-.33,.5,.5],[.5,.34,.39]]));
   part(body,'box',a.trim,[.34,.65,z*.29],[.035,.04,.20],[0,0,0],'coat-pocket');
  }
  part(body,'box',a.trim,[0,.41,0],[.61,.13,.72],[0,0,0],'travel-belt');
 }
 const shoulderWidth=feminine?.33:.40,arm=group(body,[.025,p.shoulder,shoulderWidth]),farArm=group(body,[.025,p.shoulder,-shoulderWidth]),arms=[];
 const shoulderShape=sculpt([[-.5,.32,.34],[-.12,.42,.44],[.23,.50,.5],[.5,.32,.35,-.035]]),sleeveShape=sculpt([[-.5,.29,.30],[-.30,.33,.34],[.23,.41,.43],[.5,.39,.41]]);
 for(const [i,shoulder] of [arm,farArm].entries()){
  const elbow=group(shoulder,[.07,-.35,0]),wrist=group(elbow,[.05,-.35,0]);arms.push(elbow,wrist);
  const clothColor=id==='luka'?a.shirt:a.robe,wide=id==='saku'?.285:id==='sumi'?.227:id==='nagi'?.178:id==='kota'?.24:.19,upperWide=wide*(id==='saku'?.85:id==='sumi'?.83:1);
  if(id==='luka'){
   part(shoulder,shoulderShape,a.skin,[.029,-.16,0],[.29,.44,.30],[0,0,.08],'bare-upper-arm');
   part(elbow,sleeveShape,a.skin,[.028,-.16,0],[.26,.42,.26],[0,0,.08],'bare-forearm');
  }else{
   part(shoulder,shoulderShape,clothColor,[.035,-.188,0],[upperWide*1.86,.45,upperWide*1.91],[0,0,.08],id==='saku'?'court-upper-sleeve':'upper-sleeve');
   part(elbow,sleeveShape,clothColor,[.036,-.16,0],[wide*1.65,.43,wide*1.74],[0,0,.08],'fore-sleeve');
  }
  if(id==='saku'){
   const sleeve=panel(elbow,[-.115,-.16,0],[.44,.59,.47],a.robe,[0,0,-.15],'hanging-court-sleeve',sculpt([[-.5,.48,.45],[-.33,.50,.5],[.5,.18,.34]]));
   part(sleeve,'box',a.trim,[.197,-.24,0],[.022,.040,.43],[0,0,0],'sleeve-border');
  }
  if(id==='nagi')part(elbow,'box',a.trim,[.01,-.12,(i?-.131:.131)],[.21,.035,.022],[0,0,-.12],'sleeve-reflector');
  if(id==='toru')part(elbow,tailored,a.shirt,[.04,-.32,0],[.21,.082,.21],[0,0,0],'shirt-cuff');
  part(wrist,sculpt([[-.5,.30,.28],[-.27,.44,.45],[.12,.50,.5],[.5,.34,.34]]),a.skin,[.015,-.077,0],[id==='sokichi'?.20:feminine?.144:.17,feminine?.20:.22,feminine?.134:.17],[0,0,-.13],'hand');
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
  part(shoe,sculpt([[-.5,.45,.48],[-.27,.50,.5],[.24,.45,.45],[.5,.30,.35,-.05]]),a.shoes,[.025,0,.02],[.28,.17,.28],[0,0,0],'heel');
  part(toe,sculpt([[-.5,.43,.44],[-.20,.5,.5],[.22,.46,.47],[.5,.32,.37,-.035]]),a.shoes,[.08,-.012,.02],[.21,.145,.28],[0,0,0],'beveled-toe');
  part(shoe,tailored,id==='nagi'||id==='kota'?a.shirt:a.eyes,[.035,-.08,.02],[.29,.035,.31],[0,0,0],'sole');
  part(toe,tailored,id==='nagi'||id==='kota'?a.shirt:a.eyes,[.08,-.08,.02],[.20,.035,.31],[0,0,0],'toe-sole');
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
