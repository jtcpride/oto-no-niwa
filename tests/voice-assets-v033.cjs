'use strict';
// Artifact/phoneme integrity, not a subjective pronunciation acceptance test.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),c={window:{}};
for(const file of ['content/decks.js','content/stages.js','content/voice-clips.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),c);
const clips=c.window.FEGVoiceClips,words=new Set(c.window.FEGContent.decks.flatMap(d=>d.sounds.flatMap(s=>s.words.map(w=>w.text))));
const before=JSON.parse(fs.readFileSync(path.join(root,'audio/voice-v032/generation-report.json'))),after=JSON.parse(fs.readFileSync(path.join(root,'audio/voice-v033/generation-report.json')));
const dialogue=JSON.parse(fs.readFileSync(path.join(root,'audio/voice-v0375/generation-report.json'))),lines=c.window.FEGContent.stages.flatMap(stage=>stage.dialogue.map((line,index)=>({...line,stageId:stage.id,lineIndex:index}))),dialogueTexts=new Set(lines.map(line=>line.spoken));
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
assert.equal(words.size,81);assert.equal(Object.keys(clips).length,102);assert.equal(after.clips,88);assert.equal(after.generatedClips,82);assert.equal(Object.keys(after.retainedClips).length,6);
assert.equal(lines.length,14);assert.equal(dialogueTexts.size,14);
const legacy=Object.entries(clips).filter(([text])=>!dialogueTexts.has(text)).sort(([a],[b])=>a<b?-1:a>b?1:0);
assert.equal(legacy.length,88);
// Pin the original 88 text/file/voice/kind/duration/size/hash records as one digest.
assert.equal(hash(Buffer.from(JSON.stringify(legacy))),'98f1480519407c30759c01305f24dccb13d9ac6c8f745dd7063c1b168a35fbfb','original 88 manifest records unchanged');
assert.equal(after.sourceDeckSha256,hash(fs.readFileSync(path.join(root,'content/decks.js'))));
for(const [text,clip]of Object.entries(clips)){
 const bytes=fs.readFileSync(path.join(root,clip.file));assert.equal(bytes.length,clip.bytes,text+' bytes');assert.equal(hash(bytes),clip.sha256,text+' SHA-256');
 if(words.has(text)||clip.kind==='title')assert.equal(clip.voice,'Kokoro-82M-v1.0/af_kore',text+' neutral female');
 else if(dialogueTexts.has(text)){assert.equal(clip.voice,'Kokoro-82M-v1.0/am_fenrir',text+' existing male call voice');assert.equal(clip.kind,'call');assert.match(clip.file,/^audio\/voice-v0375\/\d{3}-[a-f0-9]{12}\.mp3$/);assert.equal(path.basename(clip.file).slice(4,16),clip.sha256.slice(0,12));}
 else assert.deepEqual(JSON.parse(JSON.stringify(clip)),after.retainedClips[text],text+' original nonword unchanged');
}
assert.equal(dialogue.clips,102);assert.equal(dialogue.dialogueClips,14);assert.equal(dialogue.generatedClips+dialogue.reusedDialogueClips,14);assert.equal(dialogue.preservedExistingClips,88);
assert.equal(dialogue.sourceStageSha256,hash(fs.readFileSync(path.join(root,'content/stages.js'))));
assert.deepEqual(dialogue.model,after.model);assert.deepEqual(dialogue.voices,after.voices);assert.equal(dialogue.sampleRate,24000);assert.equal(dialogue.channels,1);assert.equal(dialogue.codec,'MP3 libmp3lame 64 kbit/s');
assert.equal(dialogue.details.length,14);assert.equal(fs.readdirSync(path.join(root,'audio/voice-v0375')).filter(file=>file.endsWith('.mp3')).length,14);
for(const line of lines){
 const record=dialogue.details.find(item=>item.text===line.spoken),clip=clips[line.spoken];assert(record,line.spoken+' dialogue audit');
 assert.equal(record.spoken,line.spoken);assert.equal(record.stageId,line.stageId);assert.equal(record.lineIndex,line.lineIndex);
 assert.equal(record.voice,'am_fenrir');assert.equal(record.speed,.8);assert.equal(record.kind,'call');assert.equal(record.headGuardSeconds,.035);
 assert.equal(record.g2p,record.synthesizedPhonemes,line.spoken+' unchanged automatic phonemes');assert.equal(record.decodedSeconds,clip.duration);
 assert.equal(record.clippedSamples,0);assert(record.leadingSilenceSeconds<.05,line.spoken+' prompt onset');assert(record.trailingSilenceSeconds<.1,line.spoken+' bounded tail');
 assert(Number.isFinite(record.rmsDbfs)&&record.rmsDbfs>-30,line.spoken+' audible PCM');assert(Number.isFinite(record.peakDbfs)&&record.peakDbfs<-.5,line.spoken+' unclipped peak');
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
console.log(JSON.stringify({passed:true,clips:102,unchangedExistingClips:88,neutralWordAndTitleClips:82,newDialogueClips:14,unchangedCallsAndEnding:6,wordPhonemes:81,comparisonRows:comparison.window.voiceComparison.length,maxLeadingSilenceSeconds:Math.max(...after.details.map(r=>r.leadingSilenceSeconds)),maxDialogueLeadingSilenceSeconds:Math.max(...dialogue.details.map(r=>r.leadingSilenceSeconds)),limitation:'Asset and synthesis-input checks; physical speakers and subjective pronunciation unverified.'}));
