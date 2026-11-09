import test from 'node:test';
import assert from 'node:assert/strict';
import {nextScratch,occupiedScratch,scratchIds} from '../mk/src/code-library.js';
import {LearningDraft} from '../mk/src/learning-draft.js';
test('new codes preserve cloud records, unsaved local drafts and the copied source',()=>{
 const items=[{workspaceId:'scratch-01',title:'같은 제목'},{workspaceId:'scratch-03',title:'같은 제목'}];
 const records=new Map([['scratch-02',{version:0,isDirty:()=>true}],['scratch-04',{version:0,isDirty:()=>false}]]);
 assert.equal(nextScratch(items,records,['scratch-04']),'scratch-05');
 assert.equal(occupiedScratch(items,records).size,3);
});
test('ten occupied slots fail without reusing a saved document',()=>{
 assert.throws(()=>nextScratch(scratchIds.map(workspaceId=>({workspaceId})),new Map()),/10개 모두/);
 assert.equal(nextScratch(scratchIds.slice(1).map(workspaceId=>({workspaceId})),new Map()),'scratch-01');
});
test('explicit blank creation saves once, stale creation conflicts and failures keep the draft',async()=>{
 const seed={title:'자유 실습 1',code:'',completed:false,runState:'idle'};
 let cloud=null,writes=0;
 const draft=new LearningDraft({id:'scratch-01',seed,read:async()=>cloud,current:()=>true,canWrite:()=>true,
  write:async(data,version)=>{if(version!==(cloud?.version||0))throw Object.assign(Error('conflict'),{code:'conflict'});writes++;cloud={...data,version:version+1};return cloud.version;}});
 await draft.load();await draft.save();assert.equal(writes,0);
 draft.create(seed);assert.equal(draft.isDirty(),true);await draft.save();await draft.save();assert.equal(writes,1);
 assert.throws(()=>draft.create({...seed,code:'overwrite'}),e=>e.code==='conflict');assert.equal(cloud.code,'');
 const other=new LearningDraft({id:'scratch-02',seed,read:async()=>null,current:()=>true,canWrite:()=>true,write:async()=>{throw Error('offline');}});
 await other.load();other.create({...seed,code:'print(2)'});await assert.rejects(other.save());assert.equal(other.isDirty(),true);assert.equal(other.data.code,'print(2)');assert.notEqual(other.kind,'saved');
});
