// A draft belongs to one UID/space generation, including while its page is absent.
// Its loaded version is the optimistic-write precondition; reading a newer
// version immediately before saving must never silently resolve a conflict.
export class LearningDraft {
  constructor({id,seed,read,write,current,canWrite,onChange=()=>{},now=()=>Date.now()}) {
    Object.assign(this,{id,read,write,current,canWrite,onChange,now});
    this.data={...seed};this.base={...seed};this.version=0;this.edit=0;
    this.loaded=false;this.dirty=false;this.dirtyAt=0;this.loading=null;this.saving=null;
    this.kind='guest';this.error=null;this.generation=0;
  }
  notify(kind,error=null){this.kind=kind;this.error=error;this.onChange(this);}
  create(data) {
    if(!this.loaded||this.version!==0||this.dirty)throw Object.assign(Error('이미 사용 중인 저장 공간입니다. 기존 기록을 덮어쓰지 않았습니다.'),{code:'conflict'});
    this.update(data);
    // Explicit creation also persists a deliberately empty document. Ordinary
    // visits to an unchanged sample still never create a cloud record.
    if(!this.dirty){this.dirty=true;this.dirtyAt=this.now();this.edit++;this.notify('dirty');}
  }
  update(data) {
    if(JSON.stringify(data)===JSON.stringify(this.data))return;
    this.data={...data};this.edit++;
    this.dirty=JSON.stringify(this.data)!==JSON.stringify(this.base);
    if(this.dirty&&!this.dirtyAt)this.dirtyAt=this.now();
    if(!this.dirty)this.dirtyAt=0;
    this.notify(this.dirty?'dirty':this.loaded?'loaded':'guest');
  }
  async load({force=false}={}) {
    if(!this.current()||!this.canWrite())return false;
    if(this.loading)return this.loading;
    if(this.loaded&&!force)return true;
    const generation=this.generation,edit=this.edit;
    this.notify('loading');
    const pending=Promise.resolve().then(async()=>{
      try {
        const record=await this.read();
        if(!this.current()||generation!==this.generation)return false;
        const data=record?{title:record.title,code:record.code,completed:!!record.completed,runState:record.runState||'idle'}:{...this.base};
        if(typeof data.code!=='string')throw Error('저장한 자료 형식을 읽지 못했습니다. 원본을 보관해 주세요.');
        // Editing while a read was pending requires an explicit choice when
        // the server already contains a different record.
        if((this.dirty||edit!==this.edit)&&record&&JSON.stringify(data)!==JSON.stringify(this.data))
          throw Object.assign(Error('불러오는 동안 작성한 내용과 저장본이 다릅니다. 현재 내용을 내려받은 뒤 다시 불러와 주세요.'),{code:'conflict'});
        this.version=record?.version||0;this.loaded=true;
        if(!this.dirty){this.data=data;this.base={...data};}
        this.notify(this.dirty?'dirty':record?'loaded':'empty');return true;
      }catch(error){if(this.current()&&generation===this.generation)this.notify(error.code==='conflict'?'conflict':'error',error);throw error;}
      finally{if(this.loading===pending)this.loading=null;}
    });
    this.loading=pending;return pending;
  }
  async save() {
    if(this.saving)return this.saving;
    if(!this.dirty)return true;
    if(!this.current()||!this.canWrite())return false;
    if(this.loading)await this.loading;
    if(!this.loaded)throw Object.assign(Error('기존 기록을 먼저 불러와야 저장할 수 있습니다. 현재 내용을 보관한 뒤 다시 불러오세요.'),{code:'load-required'});
    if(this.data.code.length>20000){const error=Object.assign(Error('20,000자를 넘었습니다. 내용을 줄이거나 파일로 보관해 주세요. 입력한 내용은 유지됩니다.'),{code:'size'});this.notify('error',error);throw error;}
    const generation=this.generation,edit=this.edit,data={...this.data},version=this.version;
    this.notify('saving');
    const pending=Promise.resolve().then(async()=>{
      try {
        const next=await this.write(data,version);
        if(!this.current()||generation!==this.generation)return false;
        this.version=next;this.base=data;
        this.dirty=edit!==this.edit&&JSON.stringify(this.data)!==JSON.stringify(data);
        if(!this.dirty)this.dirtyAt=0;
        this.savedAt=this.now();this.notify(this.dirty?'dirty':'saved');return !this.dirty;
      }catch(error){if(this.current()&&generation===this.generation)this.notify(error.code==='conflict'?'conflict':'error',error);throw error;}
      finally{if(this.saving===pending)this.saving=null;}
    });
    this.saving=pending;return pending;
  }
  isDirty(){return this.dirty;}
  export(){return {...this.data};}
  discard(){this.dirty=false;this.dirtyAt=0;this.base={...this.data};this.notify('exported');}
  reset(){this.generation++;this.dirty=false;this.dirtyAt=0;this.data={title:'',code:'',completed:false,runState:'idle'};this.loaded=false;}
}

