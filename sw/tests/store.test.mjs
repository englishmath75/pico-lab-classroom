import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ClassroomStore,encode,decode} from '../src/store.js';
import {SpaceWriteQueue} from '../src/write-queue.js';
import {activityIds,newIds,legacyIds,resolveRoute,routeForActivity,structured} from '../src/registry.js';
const defer=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
function fixture(){
 const records=new Map(),writes=[];
 const service={async load(uid,id){return records.get(uid+'/'+id)||null;},async mutate(uid,id,kind,data,version){const key=uid+'/'+id,old=records.get(key);if((old?.version||0)!==version)throw Object.assign(Error('conflict'),{code:'conflict'});writes.push({uid,id,kind,data:{...data}});if(kind==='save')records.set(key,{...data,workspaceId:id,version:version+1});return version+1;}};
 const store=new ClassroomStore(service,{gap:0,timeout:1000});store.change('a',true);return{store,service,records,writes};
}
test('finite ids, old codes remain plain and structured kinds have separate ids',()=>{
 assert.equal(new Set(activityIds).size,activityIds.length);for(const id of legacyIds)assert.equal(structured(id),false);
 for(const id of activityIds)assert.ok(resolveRoute(routeForActivity(id)));assert.equal(resolveRoute('https://evil.test/'),null);
 assert.equal(resolveRoute('/student-room.html?panel=library').id,'library');
 assert.equal(resolveRoute('/step-by-step.html?lesson=7').params.lesson,'7');
 assert.equal(resolveRoute('/python-review.html#physics').hash,'#physics');
 assert.equal(resolveRoute('/?page=unknown'),null);
 assert.equal(resolveRoute('/?page=practice&workspace=../../admin').params.workspace,'scratch-01');
});
test('read before write, no initial/default write, code and report restore into their own types',async()=>{
 const {store,writes,service}=fixture();await store.prepare(['lesson-01','sw2-report']);await store.flush();assert.equal(writes.length,0);
 store.set('lesson-01','print(1)');store.set('sw2-report',{question:'질문',source:'가상 자료',method:'평균',finding:'3',graph:'축',limits:'표본',next:'후속'});
 assert.equal(await store.flush(),true);assert.equal(writes.length,2);
 const fresh=new ClassroomStore(service,{gap:0});fresh.change('a',true);await fresh.prepare(['lesson-01','sw2-report']);
 assert.equal(fresh.get('lesson-01'),'print(1)');assert.equal(fresh.get('sw2-report').next,'후속');
 await fresh.flush();assert.equal(writes.length,2);
});
test('new edit made during save remains dirty after old write acknowledgement',async()=>{
 const {store,service}=fixture();await store.prepare(['lesson-01']);const pending=defer(),original=service.mutate;service.mutate=async(...args)=>{await pending.promise;return original(...args);};
 store.set('lesson-01','old');const save=store.flush();await Promise.resolve();store.set('lesson-01','new');pending.resolve();assert.equal(await save,false);assert.equal(store.draft('lesson-01').dirty,true);assert.equal(store.draft('lesson-01').kind,'dirty');
 assert.equal(await store.flush(),true);assert.equal((await service.load('a','lesson-01')).code,'new');
});
test('late read is ignored after account change; pending write does not change new account state',async()=>{
 const {store,service,writes}=fixture(),pending=defer();service.load=()=>pending.promise;const prep=store.prepare(['lesson-01']);store.change('b',true);pending.resolve({code:'A',title:'A',version:1});await prep;
 assert.equal(store.get('lesson-01'),'');assert.equal(store.draft('lesson-01').version,0);assert.equal(writes.length,0);
});
test('failed read cannot be treated as missing record or overwritten by default',async()=>{
 const {store,service,writes}=fixture();service.load=async()=>{throw Error('network');};await store.prepare(['lesson-01']);assert.equal(store.errors.has('lesson-01'),true);
 assert.equal(store.set('lesson-01','default'),false);await store.flush();assert.equal(writes.length,0);
});
test('malformed JSON and future schemas retain the original raw record',async()=>{
 for(const code of ['broken','{"schemaVersion":99,"kind":"sw2-report","value":{}}']){
  const {store,records,writes}=fixture();records.set('a/sw2-report',{code,title:'보고서',version:3});await store.prepare(['sw2-report']);store.set('sw2-report',{question:'new'});assert.equal(store.draft('sw2-report').data.code,code);assert.equal(writes.length,0);
 }
 assert.throws(()=>decode('sw2-report',encode('sw2-review',{})));
});
test('version conflict retains local draft and explicit remote resolution reads new version',async()=>{
 const {store,records}=fixture();await store.prepare(['lesson-01']);store.set('lesson-01','mine');records.set('a/lesson-01',{title:'다른 기기',code:'remote',version:1,runState:'idle'});
 assert.equal(await store.flush(),false);assert.equal(store.get('lesson-01'),'mine');assert.equal(store.draft('lesson-01').kind,'conflict');
 await store.useRemote('lesson-01');assert.equal(store.get('lesson-01'),'remote');assert.equal(store.draft('lesson-01').dirty,false);
});
test('20,000 character limit never truncates and quota/network failures never report saved',async()=>{
 for(const failure of ['size','daily-limit','permission-denied','unavailable']){
  const {store,service,writes}=fixture();await store.prepare(['lesson-01']);store.set('lesson-01',failure==='size'?'x'.repeat(20001):failure);
  if(failure!=='size')service.mutate=async()=>{throw Object.assign(Error(failure),{code:failure});};
  assert.equal(await store.flush(),false);assert.equal(store.draft('lesson-01').kind,'error');assert.equal(store.draft('lesson-01').dirty,true);assert.equal(writes.length,0);
 }
});
test('UID-wide queue serializes across activities and honors 16 seconds between requests',async()=>{
 let now=0;const starts=[];const q=new SpaceWriteQueue({gap:16000,timeout:0,now:()=>now,wait:async ms=>{now+=ms;}});
 await Promise.all([q.run('a',async()=>starts.push(now)),q.run('a',async()=>starts.push(now)),q.run('a',async()=>starts.push(now))]);assert.deepEqual(starts,[0,16000,32000]);
});
test('a timed-out transaction retains its queue slot until actual settlement',async()=>{
 const a=defer(),calls=[];const q=new SpaceWriteQueue({gap:0,timeout:20});
 const first=q.run('uid',async()=>{calls.push('a');await a.promise;});const second=q.run('uid',async()=>calls.push('b'));
 await assert.rejects(first,{code:'deadline'});assert.deepEqual(calls,['a']);a.resolve();await second;assert.deepEqual(calls,['a','b']);
});
test('queued operation checks ownership immediately before it can write',async()=>{
 const a=defer();let current=true,calls=0;const q=new SpaceWriteQueue({gap:0,timeout:0});
 const one=q.run('a',()=>a.promise),two=q.run('a',async()=>calls++,{current:()=>current});current=false;a.resolve();await one;await assert.rejects(two,{code:'stale-scope'});assert.equal(calls,0);
});
test('rules proposal preserves old allowlist and full MK/cohort/public tail byte for byte',()=>{
 const old=readFileSync('sw/security/last-confirmed.rules','utf8'),next=readFileSync('sw/security/proposed.rules','utf8'),marker='    // Academic-year-scoped 2026 Grade 1';
 assert.equal(old.slice(old.indexOf(marker)),next.slice(next.indexOf(marker)));
 assert.ok(next.includes("function workspaceId(id) {\n      return id.matches('lesson-(0[0-9]|10)|scratch-(0[1-9]|10)|inquiry-[a-d]');"));
 for(const id of newIds)assert.ok(next.includes("'"+id+"'"));
 assert.ok(!next.includes('allow read, write: if true'));
});

test('failure reading a selected remote copy preserves dirty text',async()=>{
 const {store,service}=fixture();await store.prepare(['lesson-01']);store.set('lesson-01','precious draft');
 service.load=async()=>{throw Error('offline');};await assert.rejects(store.useRemote('lesson-01'));
 assert.equal(store.get('lesson-01'),'precious draft');assert.equal(store.draft('lesson-01').dirty,true);
});
test('explicit keep-mine refuses a version changed since the comparison',async()=>{
 const {store,records}=fixture();await store.prepare(['lesson-01']);store.set('lesson-01','mine');
 records.set('a/lesson-01',{code:'another change',title:'other',version:3});
 await assert.rejects(store.keepMine('lesson-01',2));assert.equal(store.draft('lesson-01').version,0);assert.equal(store.get('lesson-01'),'mine');
});
test('valid envelope with malformed field shapes cannot overwrite a server record',async()=>{
 const {store,records,writes}=fixture(),code=encode('sw2-lesson-01-state',{predict:'invalid map'});
 records.set('a/sw2-lesson-01-state',{code,title:'raw',version:7});await store.prepare(['sw2-lesson-01-state']);
 assert.equal(await store.flush(['sw2-lesson-01-state']),false);assert.equal(store.set('sw2-lesson-01-state',{predict:{0:'new'}}),false);
 assert.equal(store.draft('sw2-lesson-01-state').data.code,code);assert.equal(writes.length,0);
});
