// Validate authoring mistakes before the decoded game runs (also used by Node tests).
window.validateFEGContent=function(content,rigs){
 const fail=message=>{throw new Error('Stage content: '+message)};
 const text=(value,label)=>{if(typeof value!=='string'||!value.trim()||/[<>&]/.test(value))fail(label+' must be nonempty plain text')};
 const list=(value,label)=>{if(!Array.isArray(value)||!value.length)fail(label+' must be a nonempty array')};
 const ids=(items,label)=>{list(items,label);const seen=new Set();for(const item of items){if(!item||typeof item.id!=='string'||!/^[a-z][a-z0-9-]*$/.test(item.id)||seen.has(item.id))fail(label+' has an invalid or duplicate id');seen.add(item.id);text(item.name,label+' name')}return seen};
 if(!content||!rigs)fail('catalog or rigs missing');
 const deckIds=ids(content.decks,'decks'),characterIds=ids(content.characters,'characters');ids(content.stages,'stages');
 if(content.stages.length>7)fail('at most seven stages are supported');
 for(const deck of content.decks){
  if(!Array.isArray(deck.sounds)||deck.sounds.length!==4)fail(deck.id+' must have four sounds');
  const symbols=new Set(),words=new Set();
  for(const sound of deck.sounds){
   if(!sound)fail(deck.id+' has an empty sound');
   text(sound.symbol,'symbol');if(symbols.has(sound.symbol)||/[\s/]/.test(sound.symbol))fail(deck.id+' has an invalid or duplicate symbol');symbols.add(sound.symbol);
   text(sound.tip,'tip');list(sound.words,'words');
   for(const word of sound.words){
    if(!word)fail('empty word');text(word.text,'word');text(word.ipa,'IPA');
    if(!/^\/.+\/$/.test(word.ipa))fail('IPA must include / delimiters');
    if(words.has(word.text.toLowerCase()))fail(deck.id+' repeats a word across its slots');words.add(word.text.toLowerCase());
   }
   for(const key of ['example','practice'])if(!sound.words.some(w=>w.text===sound[key]))fail(deck.id+' '+key+' must reference a word in its sound');
  }
 }
 for(const character of content.characters){
  if(!Object.hasOwn(rigs,character.rig)||typeof rigs[character.rig]!=='function')fail(character.id+' references an unknown rig');
  for(const key of ['robe','trim','skin','hair','cap','eyes','nose','trousers','shoes'])if(!/^#[0-9a-f]{6}$/i.test(character.appearance?.[key]||''))fail(character.id+' invalid '+key+' color');
 }
 for(const stage of content.stages){
  if(!deckIds.has(stage.deck))fail(stage.id+' references an unknown deck');
  if(!characterIds.has(stage.player)||!characterIds.has(stage.opponent))fail(stage.id+' references an unknown character');
 }
 return content;
};
