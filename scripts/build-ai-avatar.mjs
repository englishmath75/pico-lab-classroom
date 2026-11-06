// Version-pinned, same-origin ML/Python assets. No user data is processed at build time.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='public/pandas-data-lab/avatar-vendor';
const version='0.10.21';
const mp=`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${version}/`;
const py='https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const files=[['vision_bundle.mjs',mp+'vision_bundle.mjs'],['mediapipe-package.json',mp+'package.json'],['MEDIAPIPE-LICENSE.txt','https://raw.githubusercontent.com/google-ai-edge/mediapipe/v0.10.21/LICENSE'],['PYODIDE-LICENSE.txt','https://raw.githubusercontent.com/pyodide/pyodide/0.26.4/LICENSE'],
 ...['vision_wasm_internal.js','vision_wasm_internal.wasm','vision_wasm_nosimd_internal.js','vision_wasm_nosimd_internal.wasm'].map(f=>['wasm/'+f,mp+'wasm/'+f]),
 ['face_landmarker.task','https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'],
 ...['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'].map(f=>['python/'+f,py+f])];
const manifest={mediapipe:version,model:'face_landmarker/float16/1',pyodide:'0.26.4',assets:[]};
for(const [path,url] of files){
 const response=await fetch(url,{signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw Error(`Avatar asset ${path}: HTTP ${response.status}`);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length<100)throw Error(`Empty avatar asset: ${path}`);
 const target=`${root}/${path}`;await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});await writeFile(target,bytes);
 manifest.assets.push({path,url,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await writeFile(`${root}/manifest.json`,JSON.stringify(manifest,null,2));
console.log(`Avatar: ${manifest.assets.length} version-pinned assets, ${manifest.assets.reduce((s,a)=>s+a.bytes,0)} bytes; SHA-256 manifest written.`);
