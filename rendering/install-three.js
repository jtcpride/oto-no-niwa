window.otoInstallThree=function(html){
 const anchor='window.GardenGL={Node,Renderer,box,cylinder,ico,geometry,color,mergeStatic};';
 if(html.split(anchor).length!==2)throw Error('Three migration: engine export anchor');
 if(!window.FEGThreeSource)throw Error('Three migration: run npm run build:renderer');
 const setup=`\nif(!window.FEGRecordingRendererTest&&new URLSearchParams(window.location.search).get('renderer')!=='garden'){
 window.GardenGL.Renderer=window.FEGThreeRenderer;
}\n`;
 // Install between the original engine and the game. Keep legacy only as an
 // explicit comparison option; never silently substitute it for failed WebGL2.
 const boundary=anchor+'\n})();\n</script>';
 if(html.split(boundary).length!==2)throw Error('Three migration: script boundary');
 return html.replace(boundary,()=>boundary+'<script>'+window.FEGThreeSource.replaceAll('</script','<\\/script')+setup+'</script>');
};
