import {LearningDraft} from './learning-draft.js';
import {SpaceWriteQueue} from './write-queue.js';
import {validActivity,structured,titleFor} from './registry.js';
export function encode(id,value){return JSON.stringify({schemaVersion:1,kind:id,value});}
export function decode(id,code){
 let d;try{d=JSON.parse(code);}catch{throw Error('저장된 JSON을 읽지 못했습니다. 원문을 내려받아 보관하세요.');}
 if(!d||d.schemaVersion!==1||d.kind!==id||!d.value||typeof d.value!=='object'||Array.isArray(d.value))throw Error('지원하지 않는 학습 기록 형식입니다. 원문을 보존합니다.');
 return d.value;
}
export class ClassroomStore{
 constructor(service,{onChange=()=>{},gap=16000,timeout=10000,now=()=>Date.now()}={}){
  Object.assign(this,{service,onChange,now});this.queue=new SpaceWriteQueue({gap,timeout,now});
  this.generation=0;this.uid=null;this.writable=false;this.drafts=new Map();this.errors=new Map();this.temp=new Map();
 }
 change(uid,writable=false){this.generation++;for(const d of this.drafts.values())d.reset();this.drafts.clear();this.errors.clear();this.temp.clear();this.uid=uid;this.writable=writable;this.onChange();}
 draft(id){
  if(!validActivity(id))throw Error('허용되지 않은 학습 활동입니다.');
  if(this.drafts.has(id))return this.drafts.get(id);
  const uid=this.uid,generation=this.generation,current=()=>uid===this.uid&&generation===this.generation;
  let d;d=new LearningDraft({id,seed:{title:titleFor(id),code:structured(id)?encode(id,{}):'',runState:'idle',completed:false},current,canWrite:()=>this.writable,now:this.now,
   read:()=>this.service.load(uid,id),
   write:(data,version)=>this.queue.run(uid,()=>{
    if(globalThis.navigator?.onLine===false)throw Object.assign(Error('인터넷 연결이 없어 저장하지 못했습니다. 초안을 내려받아 주세요.'),{code:'unavailable'});
    return this.service.mutate(uid,id,'save',data,version);
   },{current:()=>current()&&this.writable,onWait:ms=>{d.waitMs=ms;d.notify('queued');}}),
   onChange:()=>this.onChange()
  });this.drafts.set(id,d);return d;
 }
 async prepare(ids){
  return Promise.all(ids.map(async id=>{
   const d=this.draft(id);
   if(this.writable&&!d.loaded){
    try{await d.load();if(structured(id))decode(id,d.data.code);this.errors.delete(id);}
    catch(e){this.errors.set(id,e);}
   }
   return d;
  }));
 }
 get(id){const d=this.draft(id);if(!structured(id))return d.data.code;try{return decode(id,d.data.code);}catch(e){this.errors.set(id,e);return {};}}
 set(id,value,extra={}){
  if(this.errors.has(id)){this.onChange();return false;}
  const d=this.draft(id);d.update({...d.data,...extra,code:structured(id)?encode(id,value):String(value)});return true;
 }
 dirty(){return [...this.drafts.values()].filter(d=>d.dirty);}
 async flush(ids=null){
  const selected=ids?ids.map(id=>this.draft(id)):this.dirty();
  let ok=!selected.some(d=>this.errors.has(d.id));for(const d of selected){
   if(!d.dirty)continue;
   if(this.errors.has(d.id)){ok=false;continue;}
   try{if(!await d.save())ok=false;}catch{ok=false;}
  }
  return ok&&!selected.some(d=>d.dirty);
 }
 async autoSave(){
  for(const d of this.dirty()){
   if(d.saving||d.kind==='conflict'||this.errors.has(d.id)||this.now()-d.dirtyAt<60000)continue;
   try{await d.save();}catch{}
  }
 }
 backup(){return {schemaVersion:1,application:'englishmath-sw',records:[...this.drafts.values()].filter(d=>d.dirty||d.version).map(d=>({id:d.id,data:d.export(),version:d.version}))};}
 async remote(id){return this.service.load(this.uid,id);}
 async useRemote(id){
  const d=this.draft(id);if(d.saving)throw Error('진행 중인 저장 응답을 먼저 확인해 주세요.');
  const gen=this.generation,edit=d.edit,remote=await this.remote(id);
  if(gen!==this.generation||edit!==d.edit)throw Error('계정 또는 초안이 바뀌었습니다. 다시 비교해 주세요.');
  const data=remote?{title:remote.title,code:remote.code,completed:!!remote.completed,runState:remote.runState||'idle'}:{title:titleFor(id),code:structured(id)?encode(id,{}):'',completed:false,runState:'idle'};
  if(structured(id))decode(id,data.code);
  d.data=data;d.base={...data};d.version=remote?.version||0;d.loaded=true;d.dirty=false;d.dirtyAt=0;d.edit++;d.notify('loaded');
  this.errors.delete(id);this.temp.clear();this.onChange();
 }
 async keepMine(id,comparedVersion){
  const d=this.draft(id),generation=this.generation,edit=d.edit,remote=await this.remote(id);
  if(generation!==this.generation||edit!==d.edit)throw Error('계정 또는 초안이 바뀌었습니다. 다시 비교해 주세요.');
  if(comparedVersion!==undefined&&(remote?.version||0)!==comparedVersion)throw Error('비교한 뒤 서버 저장본이 다시 바뀌었습니다. 다시 비교해 주세요.');
  d.version=remote?.version||0;d.loaded=true;this.errors.delete(id);return d.save();
 }
 async submit(id,classId){
  const d=this.draft(id);if(!await this.flush([id])||!d.loaded)throw Error('계정 저장을 먼저 완료해 주세요.');
  const uid=this.uid,generation=this.generation,data={...d.data,classId},version=d.version;
  return this.queue.run(uid,()=>this.service.mutate(uid,id,'submit',data,version),{current:()=>this.writable&&uid===this.uid&&generation===this.generation});
 }
}
