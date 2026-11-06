const num=i=>String(Number(i)+1).padStart(2,'0');
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
export const keys={
 step:'data-detective-step-by-step-2026-v1',main:'pandas-data-detective-v1',final:'data-detective-final-v1',
 mastery:'pandas-masterclass-2026-v1',first:'pandas-first-analysis-note-v1',simulation:'simulation-biodiversity-v1',
 turtle:'englishmath-inquiry-c-four-turtles-v1',reason:'englishmath-inquiry-c-four-turtles-v1-reason'
};
export function rawFor(key,store){
 let transient;try{transient=JSON.parse(store.temp.get(key)||'null');}catch{}
 const get=id=>store.get(id);let data;
 if(key===keys.step){data={lesson:0,records:{}};for(let i=0;i<10;i++){const meta=get('sw2-lesson-'+num(i)+'-state');data.records[i]={...meta,code:get('lesson-'+num(i))};}}
 if(key===keys.main){
  const free=get('sw2-free-state'),review=get('sw2-review');
  data={done:[],answers:{},lesson:0,code:get('sw2-free-code'),report:get('sw2-report'),exam:review.answers||{},examGraded:!!review.graded,wrong:review.wrong||[],examFilter:review.filter||'all',...free};
  if(!data.csv)delete data.csv;if(free.dataMode==='user-file')data.csv=transient?.dataMode==='user-file'&&typeof transient.csv==='string'?transient.csv:'';
  for(let i=0;i<10;i++){const a=get('sw2-archive-'+num(i));data.answers[i]=a.answers||{};if(a.completed)data.done.push(i);}
 }
 if(key===keys.final||key===keys.mastery){
  data={done:[],notes:{},codes:{},choices:{},graded:{},answers:{},current:0,lesson:0};
  for(let i=0;i<(key===keys.final?10:18);i++){const a=get((key===keys.final?'sw2-archive2-':'sw2-mastery-')+num(i));
   if(a.completed)data.done.push(i);data.notes[i]=a.note||'';if(typeof a.code==='string')data.codes[i]=a.code;
   data.choices[i]=a.choices??{};data.graded[i]=!!a.graded;data.answers[i]=a.score??null;
  }
 }
 if(key===keys.simulation)data=get('sw2-simulation');
 if(key===keys.first)return get('sw2-first-analysis').note??null;
 if(key===keys.turtle)return get('inquiry-d')||null;
 if(key===keys.reason)return get('sw2-inquiry-d-state').reason??null;
 return data?JSON.stringify(data):null;
}
export function project(key,raw){
 const out={};let x;
 if(key===keys.first)return {'sw2-first-analysis':{note:String(raw)}};
 if(key===keys.turtle)return {'inquiry-d':String(raw)};
 if(key===keys.reason)return {'sw2-inquiry-d-state':{reason:String(raw)}};
 try{x=JSON.parse(raw);}catch{return out;}if(!x||typeof x!=='object')return out;
 if(key===keys.step)for(const [i,r] of Object.entries(obj(x.records))){
  if(!/^(?:[0-9])$/.test(i)||!r||typeof r!=='object')continue;
  out['lesson-'+num(i)]=String(r.code??'');
  out['sw2-lesson-'+num(i)+'-state']={step:r.step??0,done:r.done??[],predict:r.predict??{},reflection:r.reflection??'',verified:r.verified??{},revision:r.revision??'20261027-classroom',stdin:r.stdin??'',quiz:r.quiz??{},quizGraded:!!r.quizGraded};
 }
 if(key===keys.main){
  out['sw2-report']=obj(x.report);out['sw2-review']={answers:obj(x.exam),graded:!!x.examGraded,wrong:x.wrong||[],filter:x.examFilter||'all'};
  out['sw2-free-code']=String(x.code??'');
  out['sw2-free-state']={dataset:x.dataset||'sports',dataMode:x.dataMode||'provided',stdin:x.stdin||'',providedVersion:'SW-20261106'};
  if(x.dataMode!=='user-file'&&typeof x.csv==='string')out['sw2-free-state'].csv=x.csv;
  for(let i=0;i<10;i++)out['sw2-archive-'+num(i)]={answers:obj(x.answers?.[i]),completed:Array.isArray(x.done)&&x.done.includes(i)};
 }
 if(key===keys.final||key===keys.mastery)for(let i=0;i<(key===keys.final?10:18);i++){
  const id=(key===keys.final?'sw2-archive2-':'sw2-mastery-')+num(i);
  out[id]={note:x.notes?.[i]||'',choices:x.choices?.[i]??{},graded:!!x.graded?.[i],score:x.answers?.[i]??null,completed:Array.isArray(x.done)&&x.done.includes(i)};
  if(typeof x.codes?.[i]==='string')out[id].code=x.codes[i];
 }
 if(key===keys.simulation)out['sw2-simulation']={policy:obj(x.policy),hypothesis:x.hypothesis||'',design:x.design||'',interpretation:x.interpretation||'',limitations:x.limitations||'',proposal:x.proposal||'',answers:obj(x.answers),graded:!!x.graded};
 return out;
}
export function updateRaw(key,raw,store,previous,{initial=false}={}){
 const projected=project(key,raw),before=previous===null?{}:project(key,previous);store.temp.set(key,raw);
 if(initial)return;
 for(const [id,value] of Object.entries(projected)){
  if(JSON.stringify(value)===JSON.stringify(before[id]))continue;
  if(id==='sw2-free-state'&&store.providedData?.[value.dataset])value.providedData=store.providedData[value.dataset];
  if(id==='sw2-inquiry-d-state')store.set(id,{...store.get(id),...value});else store.set(id,value);
 }
}
export function importRecords(value){
 if(value?.application==='englishmath-sw'&&value.schemaVersion===1&&Array.isArray(value.records))return value.records;
 let key;if(value?.records&&typeof value.records==='object')key=keys.step;
 else if(value?.report&&value?.answers)key=keys.main;
 else if(value?.notes&&Array.isArray(value.done)&&Object.hasOwn(value,'current'))key=keys.mastery;
 else if(value?.notes&&Array.isArray(value.done)&&Object.hasOwn(value,'lesson'))key=keys.final;
 if(!key)throw Error('지원하는 SW 학습 백업 형식이 아닙니다.');
 return Object.entries(project(key,JSON.stringify(value))).map(([id,value])=>({id,value}));
}
