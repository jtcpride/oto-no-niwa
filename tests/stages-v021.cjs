// Run the gameplay regressions on each deck, then check every content path.
const assert=require('node:assert/strict');
for(const id of ['first-court','second-court','unknown-stage']){
 process.env.FEG_TEST_STAGE=id;delete require.cache[require.resolve('./battle-v016.cjs')];
 const {g,s,elements,spoken,context}=require('./battle-v016.cjs');
 assert.equal(g.ACTIVE_STAGE.id,id==='unknown-stage'?'first-court':id);
 const sounds=g.ACTIVE_DECK.sounds,words=new Set(sounds.flatMap(x=>x.words.map(w=>w.text)));
 assert.equal(elements.get('#stageSelect').value,g.ACTIVE_STAGE.id);
 assert.equal(elements.get('.player-name .eyebrow').textContent,'PLAYER / '+g.PLAYER_CHARACTER.name);
 assert.equal(elements.get('.cpu-name .eyebrow').textContent,'CPU / '+g.CPU_CHARACTER.name);
 const color=hex=>Array.from(context.window.GardenGL.color(hex));
 assert.deepEqual(Array.from(g.player.body.children[0].color),color(g.PLAYER_CHARACTER.appearance.robe));
 assert.deepEqual(Array.from(g.cpu.body.children[0].color),color(g.CPU_CHARACTER.appearance.robe));
 // Begin a clean practice using the real start wrapper (already beyond the title screen).
 g.audio.ctx.state='suspended';g.audio.userChoice=true;g.audio.set(false);g.start();s.mode='playing';
 for(let turn=0;turn<8;turn++){
  const slot=turn%4;s.mode='playing';g.newQuestion();
  assert.equal(s.target,slot);assert.equal(s.word,sounds[slot].practice);
  assert.equal(g.PRACTICE_SET[slot].ipa,g.WORD_IPA_V010[s.word]);
  assert(elements.get('#practiceCard').innerHTML.includes(g.WORD_IPA_V010[s.word]));
  g.select(slot);assert(elements.get('#lesson').textContent.includes('/'+sounds[slot].symbol+'/'));
  assert.equal(elements.get('[data-symbol="'+slot+'"] span').textContent,'/'+sounds[slot].symbol+'/');
  s.hitstop=0;s.direction=1;g.cpuReturn();
 }
 assert.equal(g.ceremony,'time','eight practices finish normally');
 g.beginMatch();s.mode='playing';
 const observed=new Set();for(let i=0;i<80;i++){g.newQuestion();assert(words.has(s.word));observed.add(s.target);g.showAnswerCardV010(true);assert(elements.get('#practiceCard').innerHTML.includes(g.WORD_IPA_V010[s.word]));}
 assert.equal(observed.size,4);
 const retry={word:s.word,target:s.target};g.queueRetryV010();g.newQuestion();g.newQuestion();
 assert.equal(s.isRetry,true);assert.equal(s.word,retry.word);assert.equal(s.target,retry.target);
 g.audio.enabled=true;g.beginHajime();g.beginMatch();const utterance=spoken.at(-1);assert(words.has(utterance.text),'match speech belongs to deck');
 g.start();assert.equal(s.cpuHp,100);assert.equal(s.pendingDamage,0);assert.equal(s.word,sounds[0].practice);assert.equal(s.isRetry,false);
 console.log('PASS stage:',id,'practice, four-slot questions, IPA answers, retry, speech, both character palettes, restart');
}
delete process.env.FEG_TEST_STAGE;
