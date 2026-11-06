import test from 'node:test';
import assert from 'node:assert/strict';
import {LearningDraft} from '../mk/src/learning-draft.js';
import {routes,legacyAliases,normalizeRoute,recordRoute} from '../mk/src/routes.js';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const seed={title:'lesson',code:'print(1)',completed:false,runState:'idle'};
function fixture(overrides={}){
 let cloud=null,writes=0,active=true;
 const draft=new LearningDraft({id:'mk3-basics',seed,read:async()=>cloud,write:async(data,v)=>{if(v!==(cloud?.version||0))throw Object.assign(Error(),{code:'conflict'});writes++;cloud={...data,version:v+1};return v+1;},current:()=>active,canWrite:()=>true,...overrides});
 return {draft,setCloud:v=>cloud=v,invalidate:()=>active=false,get cloud(){return cloud;},get writes(){return writes;}};
}
test('edits survive leaving a page; server acknowledgement covers only the submitted edit',async()=>{
 const writing=deferred();const f=fixture({write:()=>writing.promise});await f.draft.load();
 f.draft.update({...seed,code:'first'});const saved=f.draft.save();
 f.draft.update({...seed,code:'second'});writing.resolve(1);
 assert.equal(await saved,false);assert.equal(f.draft.data.code,'second');assert.equal(f.draft.kind,'dirty');assert.equal(f.draft.version,1);
});
test('read failure never becomes an empty record eligible for writing',async()=>{
 const f=fixture({read:async()=>{throw Error('offline');}});
 await assert.rejects(f.draft.load());f.draft.update({...seed,code:'local'});
 await assert.rejects(f.draft.save(),e=>e.code==='load-required');assert.equal(f.writes,0);assert.equal(f.draft.data.code,'local');
});
test('same activity edited on two devices conflicts against loaded version',async()=>{
 const f=fixture();f.setCloud({...seed,version:1});await f.draft.load();f.draft.update({...seed,code:'mine'});
 f.setCloud({...seed,code:'other device',version:2});await assert.rejects(f.draft.save(),e=>e.code==='conflict');
 assert.equal(f.draft.data.code,'mine');assert.equal(f.cloud.code,'other device');assert.equal(f.writes,0);
});
test('late saves from a previous owner never mark its successor saved',async()=>{
 const request=deferred();const f=fixture({write:()=>request.promise});await f.draft.load();f.draft.update({...seed,code:'student A'});
 const pending=f.draft.save();f.invalidate();f.draft.reset();request.resolve(4);
 assert.equal(await pending,false);assert.equal(f.draft.data.code,'');
});
test('unchanged samples, repeated save buttons and identical IME input do not consume writes',async()=>{
 const f=fixture();await f.draft.load();await f.draft.save();f.draft.update({...seed});await f.draft.save();assert.equal(f.writes,0);
 f.draft.update({...seed,code:'한글'});f.draft.update({...seed,code:'한글'});await f.draft.save();await f.draft.save();assert.equal(f.writes,1);
});
test('code and report payload limit retains the whole draft',async()=>{
 const f=fixture();await f.draft.load();f.draft.update({...seed,code:'가'.repeat(20001)});
 await assert.rejects(f.draft.save(),e=>e.code==='size');assert.equal(f.draft.data.code.length,20001);assert.equal(f.writes,0);
});
test('all legacy aliases resolve to registered routes; avatar has no storage adapter',()=>{
 for(const name of Object.keys(legacyAliases))assert.ok(routes[normalizeRoute(new URL('https://mk.englishmath.kr/'+name+'.html')).searchParams.get('page')]);
 assert.equal(routes.avatar.storage,'none');assert.equal(routes['avatar-notices'].storage,'none');
 assert.equal(recordRoute('mk3-report'),'./?page=report');assert.equal(recordRoute('mk3-notebook'),'./?page=questions');
 assert.equal(recordRoute('mk3-cu1173-v'),'./?page=codeup&id=1173&variant=1');
});
