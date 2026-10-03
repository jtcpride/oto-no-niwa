const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function assemble(read){
 const dir=path.resolve(__dirname,'..');read=read||(file=>fs.readFileSync(path.join(dir,file),'utf8'));
 const index=read('index.html'),context={window:{}};
 vm.createContext(context);
 for(const [,file] of index.matchAll(/<script src="([^"?]+)/g))vm.runInContext(read(file),context,{filename:file});
 let html=Buffer.from([1,2,3,4,5].map(i=>read(`app${i}.b64`)).join('').replace(/\s/g,''),'base64').toString('utf8');
 for(const [,name] of index.matchAll(/html=window\.(\w+)\(html\)/g))html=context.window[name](html);
 for(const [,script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script);
 return html;
}
module.exports=assemble;
if(require.main===module){const html=assemble();if(process.argv[2])fs.writeFileSync(process.argv[2],html);console.log('Assembly and script syntax OK');}
