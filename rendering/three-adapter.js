import * as THREE from 'three';

// Phase 1: preserve the Garden node/pose contract while Three owns GPU resources,
// the scene graph, camera and drawing. No gameplay state is read here.
class ThreeRenderer {
  constructor(canvas) {
    this.canvas=canvas;
    this.presentation=new URLSearchParams(window.location.search).get('look')!=='baseline';
    this.feet=Array.from({length:4},()=>new THREE.Vector4(0,0,0,0));
    this.viewEye=new THREE.Vector3();
    this.viewProjection=new THREE.Matrix4();
    this.engine=new THREE.WebGLRenderer({canvas,antialias:this.presentation,alpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
    this.engine.outputColorSpace=THREE.LinearSRGBColorSpace;
    this.engine.toneMapping=THREE.NoToneMapping;
    this.engine.sortObjects=false;
    this.gl=this.engine.getContext();
    this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,100);
    this.eye=[1.25,5.6,17];this.target=[0,2,0];this.zoom=1;this.shake=[0,0];
    this.vp=new Float32Array(16);this.nodes=new Map();this.geometries=new Map();
    this.fogColor=[.37,.48,.46];this.fogCenter=0;this.fogStrength=.65;
    this.engine.setClearColor(new THREE.Color().setRGB(.39,.51,.49));
  }
  resize() {
    const r=this.canvas.getBoundingClientRect();this.width=Math.max(1,r.width);this.height=Math.max(1,r.height);
    const d=Math.min(window.devicePixelRatio||1,1,960/this.width),w=Math.round(this.width*d),h=Math.round(this.height*d);
    if(this.canvas.width!==w||this.canvas.height!==h)this.engine.setSize(w,h,false);
  }
  project(p) {
    const m=this.vp,[x,y,z]=p,w=m[3]*x+m[7]*y+m[11]*z+m[15];
    return [(m[0]*x+m[4]*y+m[8]*z+m[12])/w*this.width/2+this.width/2,-(m[1]*x+m[5]*y+m[9]*z+m[13])/w*this.height/2+this.height/2];
  }
  geometry(source) {
    if(this.geometries.has(source))return this.geometries.get(source);
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(source.p,3));g.setAttribute('normal',new THREE.BufferAttribute(source.n,3));
    const colors=source.c||new Float32Array(source.p.length).fill(1);
    g.setAttribute('color',new THREE.BufferAttribute(colors,3));g.setDrawRange(0,source.count);
    this.geometries.set(source,g);return g;
  }
  material() {
    return new THREE.RawShaderMaterial({side:THREE.DoubleSide,depthFunc:THREE.LessDepth,
      uniforms:{uPresentation:{value:this.presentation?1:0},uRole:{value:0},uFeet:{value:this.feet},uEye:{value:this.viewEye},uColor:{value:new THREE.Vector3()},uUnlit:{value:0},uFogColor:{value:new THREE.Vector3()},uFogCenter:{value:0},uFogStrength:{value:0},uWorldNormal:{value:new THREE.Matrix3()}},
      vertexShader:`precision highp float;
        attribute vec3 position;attribute vec3 normal;attribute vec3 color;
        uniform mat4 modelMatrix;uniform mat4 viewMatrix;uniform mat4 projectionMatrix;uniform mat3 uWorldNormal;
        varying vec3 vColor;varying vec3 vNormal;varying vec3 vWorld;
        void main(){vColor=color;vec4 p=modelMatrix*vec4(position,1.0);vWorld=p.xyz;vNormal=normalize(uWorldNormal*normal);gl_Position=projectionMatrix*viewMatrix*p;}`,
      fragmentShader:`precision mediump float;
        uniform float uPresentation;uniform float uRole;uniform vec4 uFeet[4];uniform vec3 uEye;
        uniform vec3 uColor;uniform float uUnlit;uniform vec3 uFogColor;uniform float uFogCenter;uniform float uFogStrength;
        varying vec3 vColor;varying vec3 vNormal;varying vec3 vWorld;
        void main(){vec3 n=normalize(vNormal);float light=.56+.44*max(dot(n,normalize(vec3(-.5,.85,.65))),0.0);
        vec3 c=uColor*vColor*mix(light,1.0,uUnlit);float fog=smoothstep(10.0,42.0,length(vec2(vWorld.x,vWorld.z-uFogCenter)))*uFogStrength;
        if(uPresentation>.5){
          if(uRole>.5&&uRole<1.5&&uUnlit<.5){
            // Sculpted flat faces, with a restrained sky fill and edge light.
            float key=max(dot(n,normalize(vec3(-.4,.8,.7))),0.0);
            float fill=max(dot(n,normalize(vec3(.6,.3,-.6))),0.0);
            float rim=pow(1.0-max(dot(n,normalize(uEye-vWorld)),0.0),3.0);
            c=uColor*vColor*(.48+.53*key+.12*fill)+vec3(.075,.09,.10)*rim;
          }
          if(uRole<.5&&n.y>.7&&vWorld.y>-.16&&vWorld.y<.13){
            float shade=0.0;
            for(int i=0;i<4;i++){
              vec2 delta=(vWorld.xz-uFeet[i].xy)/vec2(.40,.28);
              shade=max(shade,exp(-dot(delta,delta)*1.6)*uFeet[i].w);
            }
            c*=1.0-.30*shade;
          }
        }
        c=mix(c,uFogColor,fog);gl_FragColor=vec4(c,1.0);}`
    });
  }
  render(root) {
    this.resize();
    const aspect=this.width/this.height,w=Math.max(12.3,aspect*6.8)/this.zoom,h=w/aspect,c=this.camera;
    Object.assign(c,{left:-w/2,right:w/2,top:h/2,bottom:-h/2});c.updateProjectionMatrix();
    c.position.set(this.eye[0]+this.shake[0],this.eye[1]+this.shake[1],this.eye[2]);
    c.lookAt(this.target[0]+this.shake[0],this.target[1]+this.shake[1],this.target[2]);c.updateMatrixWorld(true);
    this.vp.set(this.viewProjection.multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse).elements);
    this.viewEye.copy(c.position);
    // Scenery already owns the clear color; retain that contract during migration.
    const clear=this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE);
    this.engine.setClearColor(new THREE.Color().setRGB(clear[0],clear[1],clear[2]),clear[3]);
    const live=new Set(),used=new Set(),feet=[];
    const visit=(n,parent,role=0)=>{
      if(n.renderRole==='fighter')role=1;
      if(n.renderRole==='ball')role=2;
      live.add(n);let record=this.nodes.get(n);
      if(!record){record={object:new THREE.Group(),mesh:null};record.object.rotation.order='ZYX';this.nodes.set(n,record);}
      const o=record.object;if(o.parent!==parent)parent.add(o);
      if(n.renderRole==='foot')feet.push(o);
      o.position.fromArray(n.pos);o.rotation.set(...n.rot,'ZYX');o.scale.fromArray(n.scale);o.visible=n.visible;
      if(n.geo){
        used.add(n.geo);const geometry=this.geometry(n.geo);
        if(!record.mesh){record.mesh=new THREE.Mesh(geometry,this.material());record.mesh.frustumCulled=false;o.add(record.mesh);
          record.mesh.onBeforeRender=()=>record.mesh.material.uniforms.uWorldNormal.value.getNormalMatrix(record.mesh.matrixWorld);}
        record.mesh.geometry=geometry;const u=record.mesh.material.uniforms;
        u.uRole.value=role;u.uColor.value.fromArray(n.color);u.uUnlit.value=n.unlit||0;u.uFogColor.value.fromArray(this.fogColor);
        u.uFogCenter.value=this.fogCenter||0;u.uFogStrength.value=this.fogStrength;
      }else if(record.mesh){o.remove(record.mesh);record.mesh.material.dispose();record.mesh=null;}
      for(const child of n.children)visit(child,o,role);
    };
    visit(root,this.scene);
    for(const [node,record] of this.nodes)if(!live.has(node)){record.object.removeFromParent();record.mesh?.material.dispose();this.nodes.delete(node);}
    for(const [source,g] of this.geometries)if(!used.has(source)){g.dispose();this.geometries.delete(source);}
    this.scene.updateMatrixWorld(true);
    for(let i=0;i<4;i++){
      const f=feet[i],v=this.feet[i];
      if(f){const p=f.matrixWorld.elements;let visible=true;for(let n=f;n;n=n.parent)visible=visible&&n.visible;
        v.set(p[12],p[14],p[13],visible?Math.max(0,1-Math.max(0,p[13]-.10)/.65):0);
      }else v.w=0;
    }
    this.engine.render(this.scene,c);
  }
  dispose(){for(const r of this.nodes.values())r.mesh?.material.dispose();for(const g of this.geometries.values())g.dispose();this.nodes.clear();this.geometries.clear();this.engine.dispose();}
}
window.FEGThreeRenderer=ThreeRenderer;
window.FEGThreeRevision=THREE.REVISION;
