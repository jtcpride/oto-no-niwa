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
garden.click('#stationAgain');garden.click('#gardenGo');assert(garden.w.__qaNavigate.includes('stage=jingu'));assert(garden.w.__qaNavigate.includes('intro=1'));
assert.equal(garden.w.kemari.getAudioDiagnostics().disposed,true,'navigation has released the previous page audio');
restored(garden,false);assert.equal(garden.w.__qaReloads,undefined,'normal page load does not reload');
restored(garden,true);assert.equal(garden.w.__qaReloads,1,'cached outgoing garden reloads the latest save and audio settings');
assert.deepEqual(garden.errors,[]);garden.close();
const title=vmFixture(html,{url:'http://feg-qa.test/'});restored(title,true);
assert.equal(title.w.__qaReloads,undefined,'title recovery remains in the original page');
assert.deepEqual(title.errors,[]);title.close();
for(const stage of ['jingu','gendo','chion','sanjo','shinkyogoku','million','gion']){
 const storage=new Map([['feg.campaign.v1',JSON.stringify({version:1,introComplete:true,acquired:['saku','sokichi','sumi','nagi','kota','luka'],completed:false,wins:{}})]]);
 const f=vmFixture(html,{url:'http://feg-qa.test/?stage='+stage,storage});const before=JSON.stringify(f.snapshot().campaign.save);
 f.click('#start');if(stage==='gion')f.tick(4.4);assert.equal(f.snapshot().campaign.phase,'dialogue',stage+' pre-match dialogue reached');
 f.click('#dialogueGarden');assert.equal(f.snapshot().campaign.phase,'garden',stage+' can leave before PRACTICE');assert.equal(JSON.stringify(f.snapshot().campaign.save),before,stage+' dialogue cannot alter progression');
 assert.equal(new URL(f.w.location.href).searchParams.get('view'),'garden');assert.equal(new URL(f.w.location.href).searchParams.get('stage'),null);assert.equal(f.w.kemari.getCampaign().godmode,false);
 f.click('[data-stage="jingu"]');f.click('#gardenGo');assert(f.w.__qaNavigate.includes('stage=jingu'));assert.equal(f.w.kemari.getAudioDiagnostics().disposed,true);assert.deepEqual(f.errors,[]);f.close();
}
console.log('PASS: BFCache after stage navigation rebuilds canonical saved state; ordinary/title restores do not loop; all seven dialogues return to garden without progression or godmode residue');
