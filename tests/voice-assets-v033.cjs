'use strict';
// Artifact/phoneme integrity, not a subjective pronunciation acceptance test.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),c={window:{}};
for(const file of ['content/decks.js','content/voice-clips.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),c);
const clips=c.window.FEGVoiceClips,words=new Set(c.window.FEGContent.decks.flatMap(d=>d.sounds.flatMap(s=>s.words.map(w=>w.text))));
const before=JSON.parse(fs.readFileSync(path.join(root,'audio/voice-v032/generation-report.json'))),after=JSON.parse(fs.readFileSync(path.join(root,'audio/voice-v033/generation-report.json')));
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
assert.equal(words.size,81);assert.equal(Object.keys(clips).length,88);assert.equal(after.generatedClips,82);assert.equal(Object.keys(after.retainedClips).length,6);
assert.equal(after.sourceDeckSha256,hash(fs.readFileSync(path.join(root,'content/decks.js'))));
for(const [text,clip]of Object.entries(clips)){
 const bytes=fs.readFileSync(path.join(root,clip.file));assert.equal(bytes.length,clip.bytes,text+' bytes');assert.equal(hash(bytes),clip.sha256,text+' SHA-256');
 if(words.has(text)||clip.kind==='title')assert.equal(clip.voice,'Kokoro-82M-v1.0/af_kore',text+' neutral female');
 else assert.deepEqual(JSON.parse(JSON.stringify(clip)),after.retainedClips[text],text+' original nonword unchanged');
}
for(const record of after.details){
 const original=before.details.find(r=>r.text===record.text);assert(original,record.text+' source');
 assert.equal(record.synthesizedPhonemes,original.synthesizedPhonemes,record.text+' unchanged phonemes');
 assert.equal(record.speed,record.kind==='word'?1:.95);assert.equal(record.headGuardSeconds,.015);assert.equal(record.clippedSamples,0);
 assert(record.leadingSilenceSeconds<.025,record.text+' prompt onset');assert(record.trailingSilenceSeconds<.1,record.text+' bounded tail');
 assert(record.rmsDbfs>-19.1&&record.rmsDbfs<-18.5,record.text+' consistent RMS');assert(record.peakDbfs<-.5,record.text+' unclipped peak');
 assert(record.modelPhonemeTimings.length>0,record.text+' model timing audit');
}
for(const text of ['mother','she']){const original=before.details.find(r=>r.text===text),current=after.details.find(r=>r.text===text);assert(current.decodedSeconds<original.decodedSeconds,text+' less extended utterance');}
const comparison={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'docs/evidence/voice-v033/comparison-data.js'),'utf8'),comparison);
for(const row of comparison.window.voiceComparison){assert.equal(row.after.sha256,clips[row.text].sha256,row.text+' comparison uses production candidate');for(const clip of [row.before,row.after])assert.equal(hash(fs.readFileSync(path.join(root,clip.file))),clip.sha256,row.text+' comparison file');}
console.log(JSON.stringify({passed:true,clips:88,newClips:82,unchangedCallsAndEnding:6,wordPhonemes:81,comparisonRows:comparison.window.voiceComparison.length,maxLeadingSilenceSeconds:Math.max(...after.details.map(r=>r.leadingSilenceSeconds)),limitation:'Asset and synthesis-input checks; physical speakers and subjective pronunciation unverified.'}));
