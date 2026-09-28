window.otoPatchAudioV019=function(html){
function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.19 patch anchor: '+from.slice(0,72));html=html.replace(from,to);}
replaceOnce("version:'0.18.0-roll-and-shobu-ari'","version:'0.19.0-mobile-audio'");
replaceOnce('<title>音の庭 — v0.18.0</title>','<title>音の庭 — v0.19.0</title>');
// A common starting mix for phone/tablet speakers; existing sliders still override it.
replaceOnce('value="65" aria-label="BGM音量"','value="80" aria-label="BGM音量"');
replaceOnce('for="musicVolume">65</output>','for="musicVolume">80</output>');
replaceOnce('value="100" aria-label="発音の音量"','value="85" aria-label="発音の音量"');
replaceOnce('for="voiceVolume">100</output>','for="voiceVolume">85</output>');
replaceOnce('audio.musicVolume=.65;audio.voiceVolume=1;','audio.musicVolume=.80;audio.voiceVolume=.85;');
// SpeechSynthesis is outside this bus. Raise the game bus, retaining its limiter and mute.
replaceOnce('this.master.gain.value=.22;','this.master.gain.value=.32;');
replaceOnce('this.enabled?.22:0','this.enabled?.32:0');
replaceOnce('this.musicVolume*(this.ducked?.20:1)','this.musicVolume*(this.ducked?.60:1)');
// Keep impact/timing cues audible throughout pronunciation. Preserve smoothed gain changes.
replaceOnce('this.ducked?.32:.72','.80');
return html;
};
