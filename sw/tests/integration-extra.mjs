import {chromium} from '@playwright/test';
import {build} from 'esbuild';
import {readFile,writeFile,cp} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const evidence='sw/evidence/integration-20261107',base=resolve('/tmp/sw-extra-runtime');
await cp('dist/sw-runtime',base+'/sw-runtime',{recursive:true});
await cp('sw/datalab/public',base+'/sw-runtime',{recursive:true});
await build({stdin:{contents:`import {PythonEngine} from './sw/datalab/lib/engine';window.makeEngine=()=>{let e=new PythonEngine(s=>window.engineState=s);e.setPreparationAllowed(false);return e};`,resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',outfile:base+'/integration-engine.js'});
const types={'.js':'text/javascript','.json':'application/json','.wasm':'application/wasm','.html':'text/html','.py':'text/plain'};
const server=createServer(async(req,res)=>{try{if(req.url==='/test'){res.setHeader('Content-Type','text/html');res.end('<script src="/integration-engine.js"></script>');return;}const p=resolve(base,'.'+new URL(req.url,'http://local').pathname);assert(p.startsWith(base+sep));res.setHeader('Content-Type',types[extname(p)]||'application/octet-stream');res.end(await readFile(p));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});const page=await browser.newPage();await page.goto(origin+'/test');
const filter=process.env.SW_EXTRA_ONLY;
const results=filter?JSON.parse(await readFile(evidence+'/extra-runtime.json','utf8')).filter(r=>!r.name.includes(filter)):[];
async function run(code,inputs=[],trace=true,files={}){return page.evaluate(async args=>{const e=window.makeEngine();try{return await e.run(...args);}finally{e.dispose();}},[code,inputs,trace,files]);}
async function check(name,fn){if(filter&&!name.includes(filter))return;try{await fn();results.push({name,status:'PASS'});console.log('PASS',name);}catch(e){results.push({name,status:'FAIL',message:e.message});console.log('FAIL',name,e.message);}}
try{
 await check('whole run shows final values without print; run IDs and input hashes change',async()=>{
  const a=await run('X=7\nY=[1,2,3]',[],false),b=await run('X=7\nY=[1,2,3]',['different'],false);assert.equal(a.finalState.globals.X,7);assert.equal(a.events.length,0);assert.notEqual(a.runMetadata.runId,b.runMetadata.runId);assert.equal(a.runMetadata.codeHash,b.runMetadata.codeHash);assert.notEqual(a.runMetadata.inputHash,b.runMetadata.inputHash);assert.equal(a.runMetadata.runtime,'Pyodide 0.28.3');
 });
 await check('safe object snapshot never calls user repr or __dict__ property',async()=>{
  const r=await run('calls=0\nclass X:\n    @property\n    def __dict__(self):\n        global calls\n        calls+=1\n        return {}\n    def __repr__(self):\n        global calls\n        calls+=1\n        return "bad"\na=X()\nprint(calls)');assert.equal(r.stdout,'0\n');
 });
 await check('function call line stays unfinished until return, nested local state is visible',async()=>{
  const r=await run('def f(A):\n    B=A+1\n    return B\nX=f(3)\nprint(X)');assert(!r.error);const call=r.events.find(e=>e.event==='call'&&e.frames.some(f=>f.name==='f'));assert.equal(call.executedLine,0);assert(r.events.some(e=>e.frames.some(f=>f.name==='f'&&f.locals.B===4)));assert.equal(r.stdout,'4\n');
 });
 await check('input missing / invalid and UTF8 data / generated file',async()=>{
  assert.equal((await run('A=input()')).error.name,'EOFError');assert.equal((await run('A=int(input())',['wrong'])).error.name,'ValueError');
  const r=await run('import pandas as pd\ndf=pd.read_csv("자료.csv")\ndf.to_csv("결과.csv",index=False)\nprint(df.shape)',[],true,{'자료.csv':'상품,수량\n빵,2\n우유,3\n'});assert(!r.error);assert.equal(r.stdout,'(2, 2)\n');assert(r.files.some(f=>f.name==='결과.csv'));
  const overwrite=await run('with open("data.csv","w") as F:\n    F.write("value\\n7\\n")',[],false,{'data.csv':'value\n1\n'});assert.equal(Buffer.from(overwrite.files.find(f=>f.name==='data.csv').base64,'base64').toString(),'value\n7\n');
 });
 await check('large pandas table retains real shape, dtypes, missing values and explicit truncation',async()=>{
  const r=await run('import pandas as pd\ndf=pd.DataFrame({str(I):list(range(100)) for I in range(20)})\ndf.loc[0,"0"]=float("nan")\nS=df["1"]',[],true);assert(!r.error);const e=r.finalState,table=e.objects[e.globals.df.ref].table;assert.deepEqual(table.shape,[100,20]);assert.equal(table.rows.length,32);assert.equal(table.columns.length,12);assert.equal(table.rows[0][0],null);assert(table.truncated);assert.equal(e.objects[e.globals.S.ref].type,'Series');
 });
 await check('manual stop leaves UI responsive and next run fresh',async()=>{
  await page.evaluate(()=>{window.stopEngine=window.makeEngine();window.stopPromise=window.stopEngine.run('while True:\n    pass',[],false);});await page.waitForFunction(()=>window.engineState==='running',{timeout:120000});
  const r=await page.evaluate(async()=>{window.stopEngine.stop();return await window.stopPromise;});assert(r.limited);assert.equal((await run('print(19)',[],false)).stdout,'19\n');
 });
 const catalog=JSON.parse(await readFile('sw/exercises.json','utf8'));
 await check('four Turtle original completes every recorded step; shared history preserves clear and reset',async()=>{
  const e=catalog.find(e=>e.sourceId==='SWX0012');
  const r=await run(e.teacherCode,[],true);
  assert(!r.error,JSON.stringify(r.error));assert(!r.traceLimited,r.traceLimitReason);assert.equal(r.events.at(-1).event,'final');
  assert(r.drawingHistory.segments.length>1000);assert(r.events.every(e=>e.drawing.segments.length===0));
  const last=r.events.at(-1).drawing;const visible=r.drawingHistory.segments.filter(s=>s.order<last.historyEnd&&s.order>=(last.clearBefore[s.pen]||0));assert.deepEqual(visible,r.drawing.segments);
  const c=await run('import turtle\nt=turtle.Turtle()\nt.forward(10)\nt.clear()\nt.forward(20)\nt.reset()\nt.forward(30)');
  assert.equal(c.drawingHistory.segments.length,3);assert.equal(c.drawing.segments.length,1);
  assert(c.events.some(e=>e.drawing.historyEnd===1&&Object.keys(e.drawing.clearBefore).length===0));
  assert.equal(c.drawing.segments[0].x2,30);
 });
 await check('20k trace boundary does not truncate whole computation',async()=>{
  const r=await run('S=0\nfor I in range(12000):\n    S+=I\nprint(S)',[],true);assert(!r.error);assert(r.traceLimited);assert.equal(r.stdout,'71994000\n');assert.equal(r.finalState.globals.S,71994000);
 });
 await check('package failure can retry without stale state',async()=>{
  let blocked=0;await page.context().route('**/pandas-*.whl',r=>{blocked++;return r.abort();});const a=await run('import pandas as pd\nprint(pd.DataFrame({"A":[1]}).shape)',[],false);assert(blocked>0,'package request actually interrupted');assert(a.error||a.stderr||a.limited);
  await page.context().unroute('**/pandas-*.whl');const b=await run('import pandas as pd\nprint(pd.DataFrame({"A":[1]}).shape)',[],false);assert(!b.error);assert.equal(b.stdout,'(1, 1)\n');
 });
 const changes={SWX0125:[['self.vy += 0.15','self.vy += 0.45'],['self.vx *= 0.96','self.vx *= 0.70']],SWX0126:[['"amp": 60','"amp": 100'],['"speed": 1.5','"speed": 4.0']],SWX0127:[['self.angle += 0.04','self.angle += 0.10'],["s['z'] -= 20","s['z'] -= 40"]],SWX0128:[['self.dt = 0.008','self.dt = 0.004'],['scale = 11.5','scale = 16.5']]};
 for(const [id,pairs] of Object.entries(changes))await check(id+' actual Python parameters change recorded artwork geometry',async()=>{
  const e=catalog.find(e=>e.sourceId===id);const code='import random\nrandom.seed(7)\n'+e.teacherCode;
  const a=await run(code,[],true);assert(!a.error,JSON.stringify(a.error));assert(a.graphicFrames.length>=89);assert(a.animationBounded);assert.equal(a.traceKind,'animation-frame');assert.equal(a.events[0].graphicFrame,-1);assert.equal(a.events.filter(e=>e.event==='frame').length,a.graphicFrames.length);assert(a.events.filter(e=>e.event==='frame').every((e,i)=>e.graphicFrame===i));
  const before=JSON.stringify(a.graphicFrames);assert(a.graphicFrames.some(f=>f.clockSeconds>0));
  for(const [from,to] of pairs){assert(code.includes(from));const b=await run(code.replace(from,to),[],false);assert(!b.error,JSON.stringify(b.error));assert.notEqual(JSON.stringify(b.graphicFrames),before);assert.equal(b.graphicFrames.length,a.graphicFrames.length);}
 });
}finally{await writeFile(evidence+'/extra-runtime.json',JSON.stringify(results,null,2));await browser.close();server.close();}
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
