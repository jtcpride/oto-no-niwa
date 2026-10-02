// Validate authored content independently of rendering and game-state adapters.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),context={window:{}};
vm.createContext(context);
for(const file of ['content/decks.js','content/characters.js','content/stages.js','characters/garden-rig.js','characters/seven-rigs.js','content/validate.js']){
 vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}
const {FEGContent:content,FEGCharacterRigs:rigs,validateFEGContent:validate}=context.window;
const clone=value=>JSON.parse(JSON.stringify(value));
let checks=0;
function accepts(value,label){const before=JSON.stringify(value);assert.equal(validate(value,rigs),value,label);assert.equal(JSON.stringify(value),before,label+' leaves input unchanged');checks++;}
function rejects(edit,label){const value=clone(content);edit(value);const before=JSON.stringify(value);assert.throws(()=>validate(value,rigs),e=>e?.name==='Error'&&typeof e.message==='string'&&e.message.length>0,label);assert.equal(JSON.stringify(value),before,label+' leaves invalid input unchanged');checks++;}
assert.equal(content.stages.length,7,'six authored opponents and the final stage');
accepts(content,'authored content');
const seven=clone(content);
assert.equal(seven.stages.length,7);accepts(seven,'seven stages');
const two=clone(content);two.stages=two.stages.slice(0,2);accepts(two,'two-stage subset remains supported');
rejects(c=>{c.stages=clone(seven.stages);c.stages.push({...c.stages[0],id:'court-eight'});},'eight stages');
for(const collection of ['decks','characters','stages']){
 rejects(c=>c[collection].push(clone(c[collection][0])),'duplicate '+collection+' IDs');
 rejects(c=>{c[collection][0].id='Bad ID';},'invalid '+collection+' ID');
}
rejects(c=>c.decks[0].sounds.pop(),'three sound slots');
rejects(c=>c.decks[0].sounds.push(clone(c.decks[1].sounds[0])),'five sound slots');
rejects(c=>{c.decks[0].sounds[1].symbol=c.decks[0].sounds[0].symbol;},'duplicate symbol');
rejects(c=>{c.decks[0].sounds[0].symbol='';},'empty symbol');
rejects(c=>{c.decks[0].sounds[0].words=[];},'empty words');
rejects(c=>{c.decks[0].sounds[0].words[0].text='';},'empty word text');
rejects(c=>{delete c.decks[0].sounds[0].words[0].ipa;},'missing IPA');
rejects(c=>{c.decks[0].sounds[0].words[0].ipa='';},'empty IPA');
for(const field of ['example','practice'])rejects(c=>{c.decks[0].sounds[0][field]='absent';},field+' outside its words');
rejects(c=>c.decks[0].sounds[1].words.push(clone(c.decks[0].sounds[0].words[0])),'word shared across sound slots');
for(const field of ['deck','player','opponent'])rejects(c=>{c.stages[0][field]='unknown';},'unknown stage '+field);
rejects(c=>{c.characters[0].rig='unknown';},'unknown rig');
for(const color of ['robe','trim','skin','hair','cap','eyes','nose','trousers','shoes']){
 rejects(c=>{c.characters[0].appearance[color]='not-a-color';},'invalid '+color+' color');
 rejects(c=>{delete c.characters[0].appearance[color];},'missing '+color+' color');
}
console.log('PASS: '+checks+' content validations; authored seven stages / two-stage subset, rejected invalid decks/characters/references, input immutability');
