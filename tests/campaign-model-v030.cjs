const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('content/campaign.js','utf8'),context);const m=context.window.FEGCampaign();
const plain=v=>JSON.parse(JSON.stringify(v));let save=m.fresh();assert.equal(m.orbCount(save),1);assert.equal(m.unlocked(save),false);assert.equal(save.player,'toru');
for(const id of ['sumi','kota','saku','luka','sokichi','nagi']){const before=m.orbCount(save);save=m.award(save,id);assert.equal(m.orbCount(save),before+1);const repeat=m.award(save,id);assert.equal(m.orbCount(repeat),before+1);assert.equal(repeat.wins[id],2);}
assert.equal(m.orbCount(save),7);assert.equal(m.unlocked(save),true);assert.deepEqual(plain(m.award(save,'shadow')),plain(save));
assert.deepEqual(plain(m.normalize({version:99,acquired:m.opponents})),plain(m.fresh()));assert.deepEqual(plain(m.normalize(null)),plain(m.fresh()));
const broken=m.normalize({version:1,acquired:['saku','saku','shadow','hacker'],completed:true,wins:{saku:Infinity,kota:-5,luka:9999999999999}});assert.deepEqual(plain(broken.acquired),['saku']);assert.equal(broken.completed,false);assert.deepEqual(plain(broken.wins),{luka:9999});
const restored=m.normalize(JSON.parse(JSON.stringify({...save,completed:true,introComplete:true})));assert.equal(restored.completed,true);assert.equal(restored.introComplete,true);assert.equal(m.orbCount(restored),7);assert.equal(m.unlocked(restored),true);
const tampered=m.normalize({version:1,acquired:'saku',completed:true,player:'shadow'});assert.equal(tampered.player,'toru');assert.equal(m.orbCount(tampered),1);assert.equal(tampered.completed,false);
vm.runInNewContext(fs.readFileSync('content/stages.js','utf8'),context);
assert.deepEqual(plain(context.window.FEGContent.stages.map(s=>s.opponent)),[...plain(m.opponents),'shadow'],'dialogue covers the existing six opponents and player mirror');
for(const stage of context.window.FEGContent.stages){assert.equal(stage.dialogue.length,2,stage.id+' has two brief lines');for(const line of stage.dialogue)for(const key of ['en','ja','spoken'])assert(typeof line[key]==='string'&&line[key].trim()&&!/[<>&]/.test(line[key]),stage.id+' plain '+key);}
console.log('PASS campaign model: six free-order unique awards, seven total orbs, replay idempotency, invalid/versioned saves, unlock, persistence, shadow exclusion and seven two-line dialogue entries');
