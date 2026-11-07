import {chromium} from '@playwright/test';
import {build} from 'esbuild';
import {readFile,writeFile,cp} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const evidence='sw/evidence/integration-20261107',base=resolve('/tmp/sw-fixture-runtime');
await cp('dist/sw-runtime',base+'/sw-runtime',{recursive:true});
await cp('sw/datalab/public',base+'/sw-runtime',{recursive:true});
await build({stdin:{contents:`import {PythonEngine} from './sw/datalab/lib/engine';window.makeEngine=()=>{let e=new PythonEngine(s=>window.engineState=s);e.setPreparationAllowed(false);return e};`,resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',outfile:base+'/integration-engine.js'});
const types={'.js':'text/javascript','.json':'application/json','.wasm':'application/wasm','.html':'text/html','.py':'text/plain'};
const server=createServer(async(req,res)=>{try{if(req.url==='/test'){res.setHeader('Content-Type','text/html');res.end('<script src="/integration-engine.js"></script>');return;}const p=resolve(base,'.'+new URL(req.url,'http://local').pathname);assert(p.startsWith(base+sep));res.setHeader('Content-Type',types[extname(p)]||'application/octet-stream');res.end(await readFile(p));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});const page=await browser.newPage();await page.goto(origin+'/test');
const fixtures=JSON.parse(await readFile('sw/tests/integration-fixtures/fixture_manifest.json','utf8')).fixtures,only=process.env.SW_FIXTURES?.split(','),results=only?JSON.parse(await readFile(evidence+'/browser-runtime.json','utf8')).filter(r=>!only.includes(r.id)):[];
async function run(code,inputs=[],trace=true,files={}){return page.evaluate(async args=>{const e=window.makeEngine();try{return await e.run(...args);}finally{e.dispose();}},[code,inputs,trace,files]);}
try{
 for(const f of fixtures){
  if(only&&!only.includes(f.id))continue;
  if(['V19','V20','V22'].includes(f.id))continue;
  const started=Date.now();
  try{
   const code=await readFile('sw/tests/integration-fixtures/'+f.file,'utf8');
   const r=await run(code,f.defaultInputs,true,f.id==='V12'?{'sales.csv':await readFile('sw/tests/integration-fixtures/sales.csv','utf8')}:{});
   if(f.expectedRuntimeError)assert.equal(r.error?.name,f.expectedRuntimeError);else assert(!r.error,JSON.stringify(r.error));
   if(f.expectedStdout!==null)assert.equal(r.stdout,f.expectedStdout);
   assert(r.events.length>0,'no events');assert.equal(r.events[0].stdout,'');assert.equal(r.events[0].imageIds.length,0);assert.equal(r.events[0].drawing.pens.length,0);
   if(f.id==='V07')assert(r.events.some(e=>e.statementSpan&&e.statementSpan[1]>e.statementSpan[0]));
   if(f.id==='V13')await writeFile(evidence+'/matplotlib-korean.png',Buffer.from(r.images[0].split(',')[1],'base64'));
   if(f.id==='V12')assert.equal(r.events.at(-1).stdout,'(3, 2)\n18.0\n');
   if(f.id==='V13'){assert.equal(r.finalImageIds.length,2);assert(r.events.some(e=>e.imageIds.length===1));assert(r.events.some(e=>e.imageIds.length===2));}
   if(f.id==='V15'){assert.equal(r.drawing.arcs.length,36);assert.equal(r.drawing.background,'black');}
   if(f.id==='V21'){assert(!r.traceLimited);assert(!r.error);assert.equal(r.events.at(-1).stdout,r.stdout);}
   if(f.id==='V24'){const e=r.events.at(-1);assert.equal(e.objects[e.globals.df.ref].table.rows[0][1],4);}
   results.push({id:f.id,status:'PASS',environment:'Chromium 141 / actual Pyodide 0.28.3 isolated worker',ms:Date.now()-started,events:r.events.length,traceLimited:r.traceLimited,stdout:r.stdout});
   console.log('PASS',f.id,Date.now()-started);
  }catch(e){results.push({id:f.id,status:'FAIL',message:e.message});console.log('FAIL',f.id,e.message);}
  await writeFile(evidence+'/browser-runtime.json',JSON.stringify(results,null,2));
 }
 if(!only){const a=await run(await readFile('sw/tests/integration-fixtures/19_isolation_a.py','utf8'));const b=await run(await readFile('sw/tests/integration-fixtures/20_isolation_b.py','utf8'));assert(!a.error);assert(!b.error);assert(!b.stdout.includes('True'));results.push({id:'V19-V20',status:'PASS',stdout:b.stdout});
 const stopped=await page.evaluate(async()=>{const e=window.makeEngine();window.currentEngine=e;const r=e.run('while True:\n    pass',[],false);return r;});
 // Execution timeout is independently bounded; follow it with a fresh run.
 assert(stopped.limited);assert.equal((await run('print(42)')).stdout,'42\n');results.push({id:'V22-timeout-restart',status:'PASS'});
 }
}finally{await writeFile(evidence+'/browser-runtime.json',JSON.stringify(results,null,2));await browser.close();server.close();}
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
