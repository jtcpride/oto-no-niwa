'use strict';
// Aggregate CURRENT-edition checks. Browser/GPU/device acceptance is separate.
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const suites=['assemble.cjs','content-v021.cjs','decks-v030.cjs','voice-assets-v033.cjs','campaign-model-v030.cjs','navigation-v030.cjs','dialogue-v0375.cjs','garden-ux-v0376.cjs','sound-v030.cjs','audio-campaign-v030.cjs','native-voice-v033.cjs','scenery-v030.cjs','scenery-polish-v030.cjs','chion-striker-v030.cjs','foreground-v030.cjs','characters-v030.cjs','motion-camera-v030.cjs','motion-step-v030.cjs','impact-motion-v037.cjs','match-presentation-v0375.cjs','complete-browser-v030.cjs'];
for(const suite of suites){
 console.log('\n=== '+suite+' ===');
 const args=[path.join(__dirname,suite),...(suite==='complete-browser-v030.cjs'?['--vm']:[])];
 const result=spawnSync(process.execPath,args,{stdio:'inherit',cwd:path.resolve(__dirname,'..'),env:process.env});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status||1);
}
console.log('\nPASS: current-edition non-browser aggregate. Real WebGL, CSS, audio and iPhone/iPad acceptance remain separate.');
