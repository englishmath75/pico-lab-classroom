import {chromium} from '@playwright/test';
import {build} from 'esbuild';
import {readFile,writeFile,cp} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const evidence='sw/evidence/integration-20261107',base=resolve('/tmp/sw-catalog-runtime');
await cp('dist/sw-runtime',base+'/sw-runtime',{recursive:true});
await cp('sw/datalab/public',base+'/sw-runtime',{recursive:true});
await build({stdin:{contents:`import {PythonEngine} from './sw/datalab/lib/engine';window.makeEngine=()=>{let e=new PythonEngine(s=>window.engineState=s);e.setPreparationAllowed(false);return e};`,resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',outfile:base+'/integration-engine.js'});
const types={'.js':'text/javascript','.json':'application/json','.wasm':'application/wasm','.html':'text/html','.py':'text/plain'};
const server=createServer(async(req,res)=>{try{if(req.url==='/test'){res.setHeader('Content-Type','text/html');res.end('<script src="/integration-engine.js"></script>');return;}const p=resolve(base,'.'+new URL(req.url,'http://local').pathname);assert(p.startsWith(base+sep));res.setHeader('Content-Type',types[extname(p)]||'application/octet-stream');res.end(await readFile(p));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
const catalog=JSON.parse(await readFile('sw/exercises.json','utf8')),results=[];
async function run(page,code,inputs=[],trace=true,files={}){return page.evaluate(async args=>{const e=window.makeEngine();try{return await e.run(...args);}finally{e.dispose();}},[code,inputs,trace,files]);}
try{
 const prior=JSON.parse(await readFile(evidence+'/catalog-runtime.json','utf8').catch(()=>'[]'));const retryIds=new Set([...prior.filter(r=>r.status!=='PASS'||!r.traceVerified).map(r=>r.id),...catalog.filter(r=>!prior.some(x=>x.id===r.id)).map(r=>r.id)]);
 const queue=process.env.SW_RETRY_ONLY?catalog.filter(r=>retryIds.has(r.id)):catalog;
 if(process.env.SW_RETRY_ONLY)results.push(...prior.filter(r=>!retryIds.has(r.id))); 
 await Promise.all(Array.from({length:Math.min(2,Number(process.env.SW_CATALOG_JOBS)||1)},async()=>{const page=await browser.newPage();await page.goto(origin+'/test');
 for(;;){const f=queue.shift();if(!f)break;
  const started=Date.now();
  try{
   const tracing=true;const r=await run(page,f.teacherCode,[],tracing,f.files);
   assert(!r.error,JSON.stringify(r.error));assert(!r.limited,r.stderr);
   if(tracing){assert(!r.traceLimited,r.traceLimitReason);assert.equal(r.events.at(-1).event,'final');}
   if(f.outputKinds.includes('animation'))assert(r.graphicFrames.length>0,'no graphics');
   results.push({id:f.id,status:'PASS',environment:'Chromium / actual Pyodide',ms:Date.now()-started,stdout:r.stdout,images:r.images.length,frames:r.graphicFrames?.length||0,traceVerified:tracing,events:r.events.length});
   console.log('PASS',f.id,Date.now()-started);
  }catch(e){results.push({id:f.id,status:'FAIL',message:e.message});console.log('FAIL',f.id,e.message);}
  await writeFile(evidence+'/catalog-runtime.json',JSON.stringify(results,null,2));
 }await page.close();}));
}finally{await writeFile(evidence+'/catalog-runtime.json',JSON.stringify(results,null,2));await browser.close();server.close();}
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
