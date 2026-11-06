import {readFile,writeFile,mkdir,cp,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {transform} from '../sw/legacy-transform.mjs';
import {routes,activityIds} from '../sw/src/registry.js';
const out=path.resolve('dist/pandas-data-lab'),assets=path.join(out,'sw-assets'),runtime=path.join(out,'sw-runtime');
await mkdir(assets,{recursive:true});await mkdir(path.join(out,'sw-content'),{recursive:true});await mkdir(path.join(runtime,'pyodide'),{recursive:true});
const json=async p=>JSON.parse(await readFile(p,'utf8')),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const lessons=await json('sw/datalab/content/sw-visual-lessons.json');
await writeFile('sw/provided-data.json',JSON.stringify(Object.fromEntries(lessons.map(l=>[l.id,{id:l.id,version:l.contentVersion,sha256:sha(l.csv),source:'provided-fictional'}])),null,2));
await build({entryPoints:['sw/src/app.js'],outfile:path.join(assets,'app.js'),bundle:true,minify:true,format:'esm',platform:'browser',target:'es2022',jsx:'automatic',sourcemap:false,legalComments:'eof'});
await build({entryPoints:['sw/src/legacy-bridge.js'],outfile:path.join(assets,'legacy-bridge.js'),bundle:true,minify:true,format:'iife',target:'es2022'});
await cp('sw/src/styles.css',path.join(assets,'site.css'));await cp('sw/src/legacy.css',path.join(assets,'legacy.css'));
const removeSessions=s=>s.replace(/<script\b[^>]*src=["'][^"']*(?:shared-pc-session|student-entry|python-runtime)\.js[^"']*["'][^>]*>\s*<\/script>/gi,'');
function relative(s){
 // HTML parser in the existing publisher resolves attributes before flattening.
 return s.replace(/\b(href|src|poster)=(["'])(\.\/[^"']*)\2/gi,(_,a,q,v)=>a+'='+q+'../'+v.slice(2)+q)
  .replaceAll('../learning-videos/','/sw/learning-videos/');
}
const originals=new Set(Object.values(routes).filter(r=>r.kind==='frame').map(r=>r.file));
for(const file of originals){
 let html=removeSessions(await readFile(path.join(out,file),'utf8'));
 html=transform(file,html);
 if(file==='index.html'||file==='step-by-step.html'){
  const id=file==='index.html'?'pythonCode':'editor';
  const expression=new RegExp('(<textarea\\b[^>]*id="'+id+'"[^>]*>[\\s\\S]*?<\\/textarea>)');
  if(!expression.test(html))throw Error('Missing code editor: '+file);
  html=html.replace(expression,'$1<label>실행 입력 · 한 줄에 하나<textarea id="stdin" rows="3"></textarea></label>');
 }
 if(file==='index.html')html=html.replace(/(<div[^>]*id="examQuiz"[^>]*>)/,'<label>문항 보기<select id="sw-exam-filter"><option value="all">전체 문항</option><option value="wrong">오답 기록 문항</option></select></label>$1');
 if(file==='mastery.html')html=html.replace(/(<button\b[^>]*id="run"[^>]*>.*?<\/button>)/,'$1<button class="btn secondary" id="sw-stop">실행 중지</button>');
 html=relative(html).replaceAll('../video-player.html','/sw-content/video-player-embed.html');
 html=html.replace(/<head>/i,'<head><base href="../"><script src="../sw-assets/legacy-bridge.js"></script>');
 html=html.replace(/<\/head>/i,'<link rel="stylesheet" href="../sw-assets/legacy.css"></head>');
 await writeFile(path.join(out,'sw-content',file),html);
}
const embed=relative(removeSessions(await readFile('public/pandas-data-lab/video-player.html','utf8'))).replace(/<head>/i,'<head><base href="../">');
await writeFile(path.join(out,'sw-content/video-player-embed.html'),embed);
for(const name of ['step-by-step.js','app.js','final-classroom.js','mastery.js','ai-avatar.js']){
 const original=await readFile(path.join(out,name),'utf8');
 await writeFile(path.join(out,name),transform(name,original));
}
for(const name of ['lesson-video.js','first-analysis.js']){
 const target=path.join(out,name),text=await readFile(target,'utf8');
 await writeFile(target,text.replaceAll('./video-player.html','/sw-content/video-player-embed.html')
  .replaceAll('이 브라우저에 임시 저장됨 · 수업 후 TXT로 내려받으세요','입력 반영됨 · 위쪽 계정 저장 상태를 확인하세요'));
}
const shell=await readFile('sw/shell.html','utf8');
for(const name of new Set([...originals,'student-room.html'])){
 await writeFile(path.join(out,name),shell.replace('AVATAR_CURRENT',name==='ai-avatar.html'?'aria-current="page"':''));
}
await mkdir(path.join(out,'data-lab'),{recursive:true});
await writeFile(path.join(out,'data-lab/index.html'),shell.replaceAll('./sw-assets/','../sw-assets/').replaceAll('./classroom','../classroom').replaceAll('./assets/','../assets/').replaceAll('./ai-avatar.html','../ai-avatar.html').replace('AVATAR_CURRENT',''));
const modules='sw/node_modules/pyodide';
if((await json(modules+'/package.json')).version!=='0.28.3')throw Error('Pyodide version changed');
for(const name of ['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'])await cp(path.join(modules,name),path.join(runtime,'pyodide',name));
const lock=await json(path.join(modules,'pyodide-lock.json')),packages=new Map();
function visit(name){if(packages.has(name))return;const p=lock.packages[name];if(!p||!/^[\w.+-]+$/.test(p.file_name)||!/^[a-f0-9]{64}$/.test(p.sha256))throw Error('Invalid runtime package '+name);packages.set(name,p);p.depends.forEach(visit);}
['numpy','pandas','matplotlib'].forEach(visit);
const manifest=[];
const work=[...packages];
await Promise.all(Array.from({length:3},async()=>{
 for(;;){const next=work.shift();if(!next)return;const [name,p]=next;
 const r=await fetch('https://cdn.jsdelivr.net/pyodide/v0.28.3/full/'+p.file_name,{signal:AbortSignal.timeout(120000)});if(!r.ok)throw Error(name+' HTTP '+r.status);
 const bytes=Buffer.from(await r.arrayBuffer());if(sha(bytes)!==p.sha256)throw Error('Hash mismatch '+name);
 await writeFile(path.join(runtime,'pyodide',p.file_name),bytes);manifest.push({name,version:p.version,sha256:p.sha256,bytes:bytes.length});
 }
}));
await cp('sw/datalab/public',runtime,{recursive:true});
for(const font of await json('sw/font-lock.json')){
 const r=await fetch(font.url,{signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error('Font download HTTP '+r.status);const bytes=Buffer.from(await r.arrayBuffer());
 const blob=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');if(blob!==font.gitBlob)throw Error('Font blob differs from pinned official source');
 await writeFile(path.join(runtime,font.name),bytes);manifest.push({name:font.name,source:font.url,sha256:sha(bytes),bytes:bytes.length});
}
for(const asset of await json('sw/datalab/content/runtime-assets.json'))await stat(path.join(out,asset));
await cp('sw/datalab/NOTICE.md',path.join(runtime,'NOTICE.md'));await cp('sw/datalab/LICENSE',path.join(runtime,'LICENSE'));
await writeFile(path.join(out,'sw-build.json'),JSON.stringify({schemaVersion:2,sourceSha:process.env.GITHUB_SHA||'local',baseline:'c38e7ce5e057b68898d086dde1caaaceae4f6d00',datalabSource:'0c9ecc02c9f631edd5da48dd0126aef640887629',activityIds,runtime:manifest},null,2));
console.log('SW integrated build ready; source content preserved; '+activityIds.length+' finite activity IDs.');
