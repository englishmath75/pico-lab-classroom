import test from 'node:test';
import assert from 'node:assert/strict';
import {NotebookDraft} from '../mk/src/notebook-draft.js';
import {SpaceWriteQueue} from '../mk/src/write-queue.js';

const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(overrides={}) {
  let generation=1,record=null,writes=0;
  const draft=new NotebookDraft({
    ids:Array.from({length:40},(_,i)=>'q'+String(i+1).padStart(2,'0')),
    read:async()=>record,
    write:async(code,version)=>{writes++;record={code,version:version+1};return version+1;},
    scope:()=>generation,current:snapshot=>snapshot===generation,canWrite:()=>true,
    ...overrides
  });
  return{draft,changeScope:()=>{generation++;draft.reset();},setRecord:value=>{record=value;},get record(){return record;},get writes(){return writes;}};
}

test('initial remote/local overlap requires a choice without discarding the local answer',async()=>{
  const read=deferred(),{draft}=fixture({read:()=>read.promise});
  const loading=draft.load();
  draft.set('q01',{answer:'typed during login',status:'draft'});
  read.resolve({code:JSON.stringify({q01:{answer:'older',status:'correct'},q02:{answer:'untouched cloud answer',status:'wrong'}}),version:3});
  await assert.rejects(loading,error=>error.code==='conflict');
  assert.equal(draft.data.q01.answer,'typed during login');
  assert.equal(draft.loaded,false);
  assert.equal(draft.dirty,true);
});

test('save acknowledges only captured revisions across read, wait and write',async()=>{
  const reading=deferred(),writing=deferred();let sent;
  const {draft}=fixture({read:()=>reading.promise,write:async(code)=>{sent=JSON.parse(code);await writing.promise;return 8;}});
  draft.set('q01',{answer:'first version',status:'draft'});
  const saving=draft.save();
  draft.set('q01',{answer:'edited during read',status:'draft'});
  reading.resolve({code:JSON.stringify({q02:{answer:'server-only',status:'correct'}}),version:7});
  await tick();
  assert.equal(sent.q01.answer,'first version');
  draft.set('q01',{answer:'edited during write',status:'wrong'});
  draft.set('q03',{answer:'new question during write',status:'draft'});
  writing.resolve();
  assert.equal(await saving,false);
  assert.equal(draft.data.q01.answer,'edited during write');
  assert.equal(draft.data.q02.answer,'server-only');
  assert.equal(draft.data.q03.answer,'new question during write');
  assert.equal(draft.revisions.size,2);
  assert.equal(draft.version,8);
});

test('successful save becomes clean and unchanged autosave performs no writes',async()=>{
  const f=fixture();f.draft.set('q01',{answer:'answer',status:'correct'});
  assert.equal(await f.draft.save(),true);
  assert.equal(f.draft.dirty,false);
  assert.equal(JSON.parse(f.record.code).q01.answer,'answer');
  assert.equal(await f.draft.save(),true);
  assert.equal(f.writes,1);
});

test('a pending read cannot bring the previous account into a new space',async()=>{
  const read=deferred(),f=fixture({read:()=>read.promise});
  const loading=f.draft.load();f.changeScope();
  f.draft.set('q02',{answer:'new space answer',status:'draft'});
  read.resolve({code:JSON.stringify({q01:{answer:'previous account',status:'correct'}}),version:4});
  assert.equal(await loading,false);
  assert.deepEqual(f.draft.data,{q02:{answer:'new space answer',status:'draft'}});
  assert.equal(f.draft.version,0);
});

test('a pending write cannot clear or replace the new account draft',async()=>{
  const writing=deferred(),f=fixture({write:async()=>{await writing.promise;return 5;}});
  f.draft.set('q01',{answer:'previous account',status:'draft'});
  const saving=f.draft.save();await tick();f.changeScope();
  f.draft.set('q01',{answer:'new account',status:'draft'});writing.resolve();
  assert.equal(await saving,false);
  assert.equal(f.draft.data.q01.answer,'new account');
  assert.equal(f.draft.dirty,true);
  assert.equal(f.draft.version,0);
});

test('the notebook size limit retains every answer and never writes a truncated record',async()=>{
  const f=fixture();
  for(let i=1;i<=40;i++)f.draft.set('q'+String(i).padStart(2,'0'),{answer:'가'.repeat(800),status:'draft'});
  await assert.rejects(f.draft.save(),error=>error.code==='notebook-size');
  assert.equal(f.writes,0);assert.equal(f.draft.dirty,true);
  assert.equal(Object.values(f.draft.data).reduce((sum,item)=>sum+item.answer.length,0),32000);
});

test('legacy long answers load without silent shortening; malformed records are not overwritten',async()=>{
  const f=fixture();f.setRecord({code:JSON.stringify({q01:{answer:'x'.repeat(900),status:'draft'}}),version:2});
  await f.draft.load();assert.equal(f.draft.data.q01.answer.length,900);
  f.setRecord({code:'not valid JSON',version:3});
  f.draft.set('q02',{answer:'keep local',status:'draft'});
  await assert.rejects(f.draft.save());
  assert.equal(f.writes,0);assert.equal(f.draft.data.q02.answer,'keep local');
});

test('code and notebook writes share one space queue and a full cooldown',async()=>{
  let now=1000;const waits=[],started=[],first=deferred();
  const queue=new SpaceWriteQueue({timeout:0,gap:16000,now:()=>now,wait:async ms=>{waits.push(ms);now+=ms;}});
  const one=queue.run('student:2026-1',async()=>{started.push(['code',now]);await first.promise;return 1;});
  const two=queue.run('student:2026-1',async()=>{started.push(['notebook',now]);return 2;});
  await tick();assert.deepEqual(started,[['code',1000]]);
  first.resolve();assert.equal(await one,1);assert.equal(await two,2);
  assert.deepEqual(waits,[16000]);assert.deepEqual(started,[['code',1000],['notebook',17000]]);
});

test('different learning spaces do not block each other',async()=>{
  const queue=new SpaceWriteQueue({timeout:0}),first=deferred();
  const one=queue.run('student:school',()=>first.promise);
  assert.equal(await queue.run('student:personal',async()=>2),2);
  first.resolve(1);assert.equal(await one,1);
});

test('a queued operation checks scope again after cooldown',async()=>{
  let current=true,called=0,now=1;
  const queue=new SpaceWriteQueue({timeout:0,now:()=>now,wait:async ms=>{now+=ms;current=false;}});
  await queue.run('space',async()=>1);
  await assert.rejects(queue.run('space',async()=>{called++;},{current:()=>current}),error=>error.code==='stale-scope');
  assert.equal(called,0);
});

test('external-device cooldown is retried once; quota errors do not retry',async()=>{
  let now=1,calls=0;const waits=[];
  const queue=new SpaceWriteQueue({timeout:0,now:()=>now,wait:async ms=>{waits.push(ms);now+=ms;}});
  assert.equal(await queue.run('space',async()=>{if(++calls===1)throw Object.assign(Error(),{code:'cooldown'});return 3;}),3);
  assert.equal(calls,2);assert.deepEqual(waits,[16000]);
  calls=0;
  await assert.rejects(queue.run('another space',async()=>{calls++;throw Object.assign(Error(),{code:'daily-limit'});}),error=>error.code==='daily-limit');
  assert.equal(calls,1);
});

test('a timeout reports failure without allowing a write to overtake the pending transaction',async()=>{
  const queue=new SpaceWriteQueue({gap:0,timeout:15}),first=deferred();let secondStarted=false;
  const one=queue.run('space',()=>first.promise);
  const two=queue.run('space',async()=>{secondStarted=true;return 2;});
  await assert.rejects(one,error=>error.code==='deadline');
  assert.equal(secondStarted,false);
  first.resolve(1);assert.equal(await two,2);
});

test('stale notebook cannot overwrite the same question from another device',async()=>{
 const f=fixture();f.setRecord({code:JSON.stringify({q01:{answer:'base',status:'draft'}}),version:1});
 await f.draft.load();f.draft.set('q01',{answer:'local',status:'wrong'});
 f.setRecord({code:JSON.stringify({q01:{answer:'remote changed',status:'correct'}}),version:2});
 await assert.rejects(f.draft.save(),e=>e.code==='conflict');
 assert.equal(f.writes,0);assert.equal(f.draft.data.q01.answer,'local');assert.equal(f.draft.dirty,true);
});
test('nonoverlapping notebook changes merge while retaining the loaded baseline',async()=>{
 const f=fixture();f.setRecord({code:JSON.stringify({q01:{answer:'base',status:'draft'}}),version:1});
 await f.draft.load();f.draft.set('q01',{answer:'local',status:'wrong'});
 f.setRecord({code:JSON.stringify({q01:{answer:'base',status:'draft'},q02:{answer:'remote second',status:'correct'}}),version:2});
 assert.equal(await f.draft.save(),true);assert.equal(f.draft.data.q02.answer,'remote second');
});
