export const NOTEBOOK_MAX_LENGTH=20000,NOTEBOOK_ANSWER_LENGTH=800;
const statuses=new Set(['draft','correct','wrong','retry','review']);

// No localStorage/IndexedDB: personal answers only live in this signed-in page.
// Keep complete answers on read; a size error must never silently shorten them.
export class NotebookDraft {
  constructor({ids,read,write,scope,current,canWrite,onChange=()=>{},onStatus=()=>{},onDirty=()=>{}}) {
    Object.assign(this,{ids:new Set(ids),read,write,scope,current,canWrite,onChange,onStatus,onDirty});
    this.data={};this.base={};this.revisions=new Map();this.edit=0;this.generation=0;this.version=0;
    this.loading=null;this.saving=null;this.loaded=false;
  }
  get dirty(){return this.revisions.size>0;}
  get length(){return JSON.stringify(this.data).length;}
  validate(value) {
    if(!value||typeof value!=='object'||Array.isArray(value))throw Error('저장된 오답 기록의 형식을 읽지 못했습니다. 원본을 내려받아 확인해 주세요.');
    const clean={};
    for(const [id,entry] of Object.entries(value)) {
      if(!this.ids.has(id))throw Error('현재 문항에 없는 기록이 있습니다. 원본을 내려받아 확인해 주세요.');
      if(!entry||typeof entry.answer!=='string'||!statuses.has(entry.status))throw Error('저장된 오답 기록의 형식을 읽지 못했습니다. 원본을 내려받아 확인해 주세요.');
      clean[id]={answer:entry.answer,status:entry.status};
    }
    return clean;
  }
  parse(record){return this.validate(JSON.parse(record?.code||'{}'));}
  set(id,entry) {
    if(!this.ids.has(id)||typeof entry.answer!=='string'||!statuses.has(entry.status))throw Error('문항과 답안을 확인해 주세요.');
    if(JSON.stringify(this.data[id])===JSON.stringify(entry))return;
    this.data[id]={answer:entry.answer,status:entry.status};
    this.revisions.set(id,++this.edit);this.onChange('edit');this.onDirty();
    this.status(this.length>NOTEBOOK_MAX_LENGTH?'size':'dirty');
  }
  restore(record) {
    if(!this.loaded||this.saving)throw Error('불러오기 또는 저장이 끝난 뒤 복원해 주세요.');
    const previous=this.parse(record);
    for(const id of new Set([...Object.keys(this.data),...Object.keys(previous)]))this.set(id,previous[id]||{answer:'',status:'draft'});
    this.onChange('restore');
  }
  status(kind,error=null){this.onStatus({kind,error,length:this.length,dirty:this.dirty,version:this.version});}
  reset() {
    this.generation++;this.data={};this.base={};this.revisions.clear();this.version=0;
    this.loading=null;this.saving=null;this.loaded=false;this.onChange('reset');this.status('ready');
  }
  discard(){this.revisions.clear();this.status('exported');}
  async load({force=false}={}) {
    if(this.loaded&&!force)return true;
    if(!this.canWrite()){this.status('guest');return false;}
    if(this.saving&&this.loaded)return this.saving;
    if(this.loading)return this.loading;
    const scope=this.scope(),generation=this.generation;
    const current=()=>this.generation===generation&&this.current(scope);
    this.status('loading');
    const pending=Promise.resolve().then(async()=>{
      try {
        const record=await this.read(scope);
        if(!current())return false;
        const merged=this.parse(record);
        for(const id of this.revisions.keys())if(merged[id]&&JSON.stringify(merged[id])!==JSON.stringify(this.data[id]))
          throw Object.assign(Error('불러오는 동안 입력한 답안과 저장된 답안이 다릅니다. 현재 답안을 내려받은 뒤 다시 불러오세요.'),{code:'conflict'});
        this.base=structuredClone(merged);
        for(const id of this.revisions.keys())merged[id]=this.data[id];
        this.data=merged;this.version=record?.version||0;this.loaded=true;
        this.onChange('load');this.status(this.dirty?'dirty':record?'loaded':'empty');
        if(this.dirty)this.onDirty();
        return true;
      }catch(error){if(!current())return false;this.status('error',error);throw error;}
      finally{if(this.loading===pending)this.loading=null;}
    });
    this.loading=pending;return pending;
  }
  async save() {
    if(this.saving)return this.saving;
    if(!this.dirty)return true;
    if(!this.canWrite()){this.status('guest');return false;}
    const scope=this.scope(),generation=this.generation;
    const current=()=>this.generation===generation&&this.current(scope);
    // Copy both values and revision numbers before the first asynchronous read.
    const edits=new Map([...this.revisions].map(([id,revision])=>[id,{revision,value:{...this.data[id]}}]));
    this.status('saving');
    const pending=Promise.resolve().then(async()=>{
      try {
        if(!this.loaded)await this.load();
        if(this.loading)await this.loading;
        if(!current())return false;
        const record=await this.read(scope);
        if(!current())return false;
        const merged=this.parse(record);
        for(const [id,{value}] of edits) {
          if(JSON.stringify(merged[id])!==JSON.stringify(this.base[id])&&JSON.stringify(merged[id])!==JSON.stringify(value))
            throw Object.assign(Error('다른 기기에서 같은 문항의 답안을 바꾸었습니다. 현재 답안을 내려받은 뒤 저장본을 다시 불러와 주세요.'),{code:'conflict'});
          merged[id]=value;
        }
        const text=JSON.stringify(merged);
        if(text.length>NOTEBOOK_MAX_LENGTH)throw Object.assign(Error('오답 기록 전체가 20,000자를 넘었습니다. 답안을 줄이거나 기록을 내려받아 보관하세요. 입력한 내용은 그대로 남아 있습니다.'),{code:'notebook-size'});
        const version=await this.write(text,record?.version||0,scope);
        if(!current())return false;
        this.base=structuredClone(merged);
        for(const [id,{revision}] of edits)if(this.revisions.get(id)===revision)this.revisions.delete(id);
        // Edits made during the read, queue wait, or write always win locally.
        for(const id of this.revisions.keys())merged[id]=this.data[id];
        this.data=merged;this.version=version;this.loaded=true;
        this.onChange('save');this.status(this.dirty?'dirty':'saved');
        return !this.dirty;
      }catch(error){if(!current())return false;this.status('error',error);throw error;}
      finally{if(this.saving===pending)this.saving=null;}
    });
    this.saving=pending;return pending;
  }
}
