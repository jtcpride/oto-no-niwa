// Source review: 2026-10-02. Dictionary transcription, not device TTS acceptance.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../content/decks.js'),'utf8'),context);
const decks=JSON.parse(JSON.stringify(context.window.FEGContent.decks));
const originalDigest='9f8bf300c4cfda9b5d80067e0520d500867ecdb07e7a240632fea5165c61297c';
assert.equal(crypto.createHash('sha256').update(JSON.stringify(decks.slice(0,2))).digest('hex'),originalDigest,'the original 2 decks remain exact');
const expected={
 'stop-and-release':[['p','pea /piː/;pine /paɪn/;push /pʊʃ/'],['b','bee /biː/;bay /beɪ/;bun /bʌn/'],['t','tea /tiː/;ten /tɛn/;toe /toʊ/'],['d','day /deɪ/;dough /doʊ/;dawn /dɑn/']],
 'back-and-burst':[['k','key /kiː/;car /kɑr/;cow /kaʊ/'],['g','go /goʊ/;game /geɪm/;gum /gʌm/'],['tʃ','chain /tʃeɪn/;chair /tʃɛr/;chin /tʃɪn/'],['dʒ','jam /dʒæm/;joy /dʒɔɪ/;June /dʒuːn/']],
 'liquid-and-glide':[['r','rain /reɪn/;rice /raɪs/;run /rʌn/'],['l','leaf /liːf/;lake /leɪk/;lip /lɪp/'],['w','wave /weɪv/;wet /wɛt/;win /wɪn/'],['j','yes /jɛs/;yet /jɛt/;young /jʌŋ/']],
 'four-vowels':[['æ','cat /kæt/;cap /kæp/;back /bæk/'],['ɪ','kit /kɪt/;kick /kɪk/;lip /lɪp/'],['ʌ','cut /kʌt/;cup /kʌp/;bus /bʌs/'],['ɑ','cot /kɑt/;cop /kɑp/;rock /rɑk/']]
};
// Every added word was inspected at the following primary dictionary entries.
// OUP /e/ -> our broad US /ɛ/; /ɑː/ -> /ɑ/; /ɡ/ -> /g/. /r/ is a broad
// phonemic symbol for the English approximant [ɹ]. Sources are not recordings.
const oxford='https://www.oxfordlearnersdictionaries.com/definition/english/';
const oxfordEntries='pea pine_1 push_1 bee_1 bay_1 bun tea ten day key_1 car cow_1 game_1 gum_1 chain_1 chair_1 chin jam_1 joy june rain_1 rice run_1 leaf_1 lake lip wave_1 wet_1 win_1 yes_1 yet_1 young_1 cat_1 cap_1 back_1 kit_1 kick_1 cut_1 cup_1 bus_1 cot cop_1 rock_1'.split(' ');
const sources=Object.fromEntries(oxfordEntries.map(w=>[w.replace(/_\d$/,'').toLowerCase(),oxford+w]));
Object.assign(sources,{
 toe:'https://dictionary.cambridge.org/us/pronunciation/english/toe',
 go:'https://dictionary.cambridge.org/pronunciation/english/go',
 dough:'https://dictionary.cambridge.org/us/pronunciation/english/dough',
 dawn:'https://dictionary.cambridge.org/us/dictionary/english/dawn'
});
// Cambridge dawn accepts both /dɔn/ and /dɑn/ in US usage. Target /d/ is
// unambiguous either way. LOT cot/cop/rock are US /ɑ/ (UK usually /ɒ/).
// Duplicate words across decks are deliberate: rice, leaf and lip. A mixed
// deck must be audited separately rather than unioning these lists blindly.
const multi=['tʃ','dʒ','aɪ','aʊ','eɪ','oʊ','ɔɪ'];
function phonemes(ipa){const rest=ipa.replace(/[\/ˈˌː.]/g,'').replace(/ɡ/g,'g');const result=[];for(let i=0;i<rest.length;){const p=multi.find(m=>rest.startsWith(m,i))||rest[i];result.push(p);i+=p.length;}return result;}
assert.equal(decks.length,6);let words=0;
for(const [id,slots]of Object.entries(expected)){
 const deck=decks.find(d=>d.id===id);assert(deck,id);assert.equal(deck.sounds.length,4);assert.equal(new Set(deck.sounds.flatMap(s=>s.words.map(w=>w.text.toLowerCase()))).size,12);
 for(let i=0;i<4;i++){
  const s=deck.sounds[i],[symbol,pairs]=slots[i];assert.equal(s.symbol,symbol);assert.equal(s.words.length,3);assert.equal(s.words.map(w=>w.text+' '+w.ipa).join(';'),pairs);
  assert(s.words.some(w=>w.text===s.practice));assert(s.words.some(w=>w.text===s.example));
  for(const w of s.words){const hits=deck.sounds.map(s=>s.symbol).filter(p=>phonemes(w.ipa).includes(p));assert.deepEqual(hits,[symbol],`${id}/${w.text}: exactly one target, not substring matching`);assert(sources[w.text.toLowerCase()],w.text+' source');words++;}
 }
}
// Audit the existing material with the same target-set rule, without editing it.
for(const d of decks.slice(0,2))for(const s of d.sounds)for(const w of s.words)assert.deepEqual(d.sounds.map(s=>s.symbol).filter(p=>phonemes(w.ipa).includes(p)),[s.symbol],w.text);
console.log(JSON.stringify({passed:true,decks:6,totalWords:84,newWordsAudited:words,dictionarySources:Object.keys(sources).length,originalDecks:'unchanged',deviceTTS:'iPhone/iPad listening not performed'}));
