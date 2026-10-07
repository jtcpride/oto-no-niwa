'use strict';
const el=id=>document.getElementById(id),iframe=el('game');
let lab=null,custom=null,baseline=false;
const phases={breakCharge:'溜め',breakShot:'突破の一球',break:'吹き飛び → 着地 → 追走',back:'奥舞台で再び向き合う'};
function controls(){
 for(const [key,field] of Object.entries(lab.fields)){
  const input=document.querySelector('[data-setting="'+key+'"]');if(!input)continue;
  input.value=custom[key];input.previousElementSibling.querySelector('output').textContent=Number(custom[key]).toFixed(field.step<.01?3:2)+field.unit;
 }
}
function apply(useBaseline){baseline=useBaseline;lab.set(baseline?lab.baseline:custom);el('baseline').setAttribute('aria-pressed',String(baseline));el('adjusted').setAttribute('aria-pressed',String(!baseline));controls();}
iframe.addEventListener('load',()=>{
 lab=iframe.contentWindow.FEGPursuitLab;
 if(!lab){el('status').textContent='npm run lab:pursuit で調整室を開いてください。';return;}
 custom={...lab.defaults};el('controls').replaceChildren();
 for(const [key,field] of Object.entries(lab.fields)){
  const label=document.createElement('label');label.className='control';const caption=document.createElement('span'),name=document.createElement('span'),value=document.createElement('output');name.textContent=field.label;caption.append(name,value);
  const input=document.createElement('input');input.type='range';input.setAttribute('aria-label',field.label);input.dataset.setting=key;input.min=field.min;input.max=field.max;input.step=field.step;input.addEventListener('input',()=>{custom[key]=Number(input.value);apply(false);});label.append(caption,input);el('controls').append(label);
 }
 for(const id of ['play','restart','timeline'])el(id).disabled=false;
 apply(false);el('status').textContent='採用版（本編の既定値）から開始しています。';
});
el('baseline').onclick=()=>lab&&apply(true);el('adjusted').onclick=()=>lab&&apply(false);
el('proposal').onclick=()=>{if(lab){custom={...lab.proposal};apply(false);el('status').textContent='採用版：手の遅れ、着地の重み、追走の振りを強めています。';}};
el('play').onclick=()=>lab&&lab.play(!lab.snapshot().playing);
el('restart').onclick=()=>{if(lab){lab.seek(0);lab.play(true);}};
el('speed').onchange=()=>lab&&lab.speed(Number(el('speed').value));
el('loop').onchange=()=>lab&&lab.loop(el('loop').checked);
el('timeline').oninput=()=>{if(lab){lab.play(false);lab.seek(Number(el('timeline').value));}};
function fitPreview(){
 const portrait=el('orientation').value==='portrait',ratio=portrait?390/844:844/390,view=iframe.parentElement;
 view.dataset.orientation=portrait?'portrait':'landscape';
 const width=Math.min(view.clientWidth,view.clientHeight*ratio),height=width/ratio;
 // Use a real viewport, not a CSS-scaled canvas: DOM markers and projected
 // coordinates must share the same dimensions as in ordinary gameplay.
 Object.assign(iframe.style,{position:'absolute',left:'50%',top:'50%',width:width+'px',height:height+'px',transform:'translate(-50%,-50%)'});
}
iframe.parentElement.style.position='relative';
el('orientation').onchange=fitPreview;
if(matchMedia('(max-width:760px)').matches)el('orientation').value='portrait';
new ResizeObserver(fitPreview).observe(iframe.parentElement);fitPreview();
el('reset').onclick=()=>{if(lab){custom={...lab.defaults};apply(false);el('status').textContent='採用値に戻しました。';}};
el('export').onclick=()=>{
 if(!lab)return;const data=lab.export(),blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='feg-pursuit.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);el('status').textContent=baseline?'変更前の設定を書き出しました。':'調整中の設定を書き出しました。';
};
el('load').onclick=()=>el('import').click();
el('import').onchange=async()=>{
 const file=el('import').files[0];if(!file||!lab)return;
 try{if(file.size>16000)throw Error('設定ファイルが大きすぎます');const data=JSON.parse(await file.text());if(data.format!=='feg-pursuit-v1'||data.stage!=='jingu')throw Error('一ノ庭の調整室の設定を選んでください');lab.set(data.settings);custom={...lab.snapshot().settings};apply(false);el('status').textContent='設定を読み込みました。';}catch(error){el('status').textContent=error.message;}finally{el('import').value='';}
};
function monitor(){
 if(lab){const snap=lab.snapshot();el('time').textContent=snap.time.toFixed(2)+' / '+snap.duration.toFixed(2)+'秒';el('timeline').value=snap.time;el('play').textContent=snap.playing?'一時停止':'再生';el('phase').textContent=phases[snap.frame?.phase]||'';const f=snap.frame;if(f)el('stats').textContent=snap.renderer+' · '+f.draws+'描画 · '+f.triangles.toLocaleString()+'三角形 · '+f.pixels.join(' × ')+'px';}
 requestAnimationFrame(monitor);
}requestAnimationFrame(monitor);
