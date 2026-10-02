'use strict';
// A BFCache restoration after internal stage navigation must reconstruct current
// save/audio state. Only the browser reload is replaced in this DOM fixture.
const assert=require('node:assert/strict');
const assemble=require('./assemble.cjs');
const {vmFixture}=require('./complete-browser-v030.cjs');
const source=assemble(),anchor='if(event.persisted&&campaignV030.returning)window.location.reload();';
assert.equal(source.split(anchor).length,2);
const html=source.replace(anchor,'if(event.persisted&&campaignV030.returning)window.__qaReloads=(window.__qaReloads||0)+1;');
function restored(f,persisted){const e=new f.w.Event('pageshow');Object.defineProperty(e,'persisted',{value:persisted});f.w.dispatchEvent(e);}
const garden=vmFixture(html,{url:'http://feg-qa.test/?view=garden'});
restored(garden,true);assert.equal(garden.w.__qaReloads,undefined,'ordinary garden restore does not reload');
garden.click('#gardenGo');assert(garden.w.__qaNavigate.includes('stage=jingu'));
assert.equal(garden.w.kemari.getAudioDiagnostics().disposed,true,'navigation has released the previous page audio');
restored(garden,false);assert.equal(garden.w.__qaReloads,undefined,'normal page load does not reload');
restored(garden,true);assert.equal(garden.w.__qaReloads,1,'cached outgoing garden reloads the latest save and audio settings');
assert.deepEqual(garden.errors,[]);garden.close();
const title=vmFixture(html,{url:'http://feg-qa.test/'});restored(title,true);
assert.equal(title.w.__qaReloads,undefined,'title recovery remains in the original page');
assert.deepEqual(title.errors,[]);title.close();
console.log('PASS: BFCache after stage navigation rebuilds canonical saved state; ordinary/title restores do not loop');
