import {schoolsFor, enrollmentInput, affiliation, registrationMode, approvedStudent} from './enrollment.js';
import {createCloud,readableError} from './cloud.js';
import {ClassroomStore,encode,decode} from './store.js';
import {exercises,resolveRoute,routeForActivity,legacyIds,validActivity,structured,titleFor} from './registry.js';
import {rawFor,updateRaw,importRecords} from './models.js';
import {PythonEngine} from '../datalab/lib/engine.ts';
import {mountDataLab,mountPracticeLab} from '../datalab/mount.tsx';
import providedData from '../provided-data.json';
(function startApp(){
 'use strict';
 const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let cloud,user=null,identity=null,authReady=false,store,route,frame=null,disposeView=()=>{},engine=null,viewGeneration=0,sessionGeneration=0,lastActivity=Date.now(),ending=false,autoBusy=false,guestBackup=null,dialogResolve=null,stopProfile=null;
 const download=(name,text,type='application/json;charset=utf-8')=>{const u=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
 const activeExerciseIds=new Set();
 const side=document.querySelector('.side'),sideNav=side?.querySelector('nav');
 if(sideNav){sideNav.id='sw-sidebar-navigation';const toggle=document.createElement('button');toggle.id='sw-mobile-menu';toggle.className='sw-mobile-menu';toggle.textContent='수업 메뉴 펼치기 · 접기';toggle.setAttribute('aria-controls',sideNav.id);toggle.setAttribute('aria-expanded','false');toggle.onclick=()=>{const open=side.classList.toggle('sw-menu-open');toggle.setAttribute('aria-expanded',String(open));};sideNav.before(toggle);}

 const backup=()=>download('SW_learning_backup.json',JSON.stringify(store.backup(),null,2));
 function say(text,bad=false){$('sw-message').textContent=text;$('sw-message').classList.toggle('bad',bad);}
 function ask(title,body,actions){
  if(dialogResolve)dialogResolve('cancel');
  const dialog=$('sw-dialog');$('sw-dialog-title').textContent=title;$('sw-dialog-body').textContent=body;
  $('sw-dialog-actions').replaceChildren();
  return new Promise(resolve=>{
   dialogResolve=resolve;const finish=value=>{dialog.close();dialogResolve=null;resolve(value);};
   for(const [value,label] of actions){const b=document.createElement('button');b.textContent=label;b.className='btn secondary';b.onclick=()=>finish(value);$('sw-dialog-actions').append(b);}
   dialog.oncancel=e=>{e.preventDefault();finish('cancel');};dialog.showModal();
  });
 }
 function currentIds(){
  if(!route)return [];
  let ids=route.activityIds||[];
  if(route.id==='exercise')ids=[route.params.exercise];
  else if(route.id==='lesson'){const n=String(route.params.lesson).padStart(2,'0');ids=['lesson-'+n,'sw2-lesson-'+n+'-state'];}
  else if(route.id==='practice')ids=[route.params.workspace,'sw2-free-state'];
  else if(route.id==='data-lab')ids=['sw2-datalab-'+route.params.unit+'-code','sw2-datalab-'+route.params.unit+'-state'];
  return [...new Set([...ids,...activeExerciseIds])];
 }
 function updateStatus(){
  if(!store)return;
  const dirty=store.dirty(),all=[...store.drafts.values()],active=currentIds().map(id=>store.draft(id));
  const error=active.find(d=>d.error)||all.find(d=>d.dirty&&d.error);const readError=[...store.errors.values()][0];
  const saving=all.some(d=>d.kind==='saving'||d.kind==='queued');
  let label;
  if(ending)label='학습 종료 처리 중';
  else if(!user)label=dirty.length?'메모리 임시 보관 · 로그인 필요':'로그인 필요';
  else if(!identity)label='승인 확인 중';
  else if(!store.writable)label=identity?.staff?'교사 계정 · 학생용 저장 기능은 승인된 학생 계정에서 사용합니다.':!identity.profile?.enrollment?'학생 등록 필요':identity.profile?.status==='pending'?'학급 승인 대기':identity.profile?.status==='blocked'?'저장 권한이 중지됨 · 교사에게 정지 해제 요청':'학급 등록 필요';
  else if(readError)label='읽기 실패 · '+readError.message;
  else if(error)label=(error.kind==='conflict'?'충돌 · ':'저장 실패 · ')+error.error.message;
  else if(saving)label='저장 대기·처리 중 · 남은 초안 '+dirty.length+'개';
  else if(dirty.length)label='변경됨 · 저장할 초안 '+dirty.length+'개';
  else if(active.some(d=>d.kind==='saved'))label='클라우드 저장 완료 · '+new Date(Math.max(...active.map(d=>d.savedAt||0))).toLocaleTimeString('ko-KR');
  else if(active.some(d=>d.version>0))label='클라우드 저장본 불러옴';
  else label=route?.storageMode==='none'?(identity?.staff?'교사 계정 · 현재 안내 화면은 저장 대상이 아닙니다.':'이 안내 화면은 저장 대상이 아닙니다.'):'작성하면 계정에 자동 저장됩니다.';
  $('sw-save-state').textContent=label;
  $('sw-save').hidden=route?.storageMode==='none'&&!activeExerciseIds.size;
  $('sw-submit').hidden=route?.storageMode==='none'&&!activeExerciseIds.size||!store.writable;
  $('sw-resolve').hidden=!error&&!store.errors.size;
  $('sw-login').textContent=user?'계정 바꾸기':'Google 로그인';
  $('sw-user').textContent=user?((identity?.profile?.enrollment?identity.profile.displayName:user.displayName||'로그인한 사용자')+' · '+(user.email||'')):'로그인 전';
  $('sw-space').textContent=affiliation(identity?.profile)||(identity?.staff?'교사 계정':identity?.profile?'학생 소속 재등록 필요':user?'학생 소속 등록 필요':'고2 · 소프트웨어와 생활');
  $('sw-teacher').hidden=!identity?.staff;$('sw-teacher-menu').hidden=!identity?.staff;$('sw-teacher-shortcut').hidden=!identity?.staff;$('sw-refresh').hidden=!user;
 }
 function release(){
  viewGeneration++;activeExerciseIds.clear();try{frame?.contentWindow?.SWRelease?.();frame?.contentWindow?.SWDispose?.();}catch{}
  disposeView();disposeView=()=>{};engine?.dispose();engine=null;frame?.remove();frame=null;$('sw-view').replaceChildren();
 }
 function runtime(){
  if(!engine){engine=new PythonEngine(()=>{});engine.setPreparationAllowed(false);engine.setPackages(['pandas']);}
  return engine;
 }
 async function runPython(input,status=()=>{}){
  status('Python 준비·실행 중…');const files=input.datasets||{};
  let prefix='';
  for(const [name,text] of Object.entries(files)){
   if(!/^[\w.-]+\.csv$/.test(name)||typeof text!=='string'||text.length>1000000)throw Error('CSV 파일 형식과 크기를 확인하세요.');
   prefix+='with open('+JSON.stringify(name)+', "w", encoding="utf-8") as _sw_file:\n    _sw_file.write('+JSON.stringify(text)+')\n';
  }
  if(typeof input.csv==='string')prefix+='COURSE_CSV = '+JSON.stringify(input.csv)+'\n';
  const gen=viewGeneration,result=await runtime().run(prefix+String(input.code||''),String(input.stdin||'').split(/\r?\n/),false);
  if(gen!==viewGeneration)throw Error('화면을 이동하여 실행을 종료했습니다.');
  if(result.error)throw Error(result.error.traceback||result.error.message);
  if(result.limited)throw Error(result.stderr||'실행 제한에 도달했습니다.');
  status('실행 완료');
  const norm=s=>String(s).replace(/\s+/g,'');
  return {output:result.stdout+(result.stderr?'\n'+result.stderr:''),picture:result.images?.[0]?.split(',')[1]||'',drawing:result.drawing,matched:!input.required||norm(input.code).includes(norm(input.required))};
 }
 async function navigate(target,{replace=false}={}){
  const next=resolveRoute(target,location.origin+'/');
  if(!next){say('이 수업 주소를 찾지 못했습니다.',true);return false;}
  route=next;if(replace)history.replaceState(null,'',next.url);else history.pushState(null,'',next.url);
  release();const gen=viewGeneration;
  $('sw-view').textContent='학습 기록을 확인하고 있습니다…';
  if(!authReady)return false;
  for(const a of document.querySelectorAll('[data-route]')){const selected=a.dataset.route===route.id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
  updateStatus();
  const ids=route.id==='exercise'?[route.params.exercise]:route.id==='practice'?[route.params.workspace,'sw2-free-state']:route.id==='examples'?[...route.activityIds,'sw2-free-code','sw2-free-state']:route.activityIds;
  await store.prepare(ids);if(gen!==viewGeneration)return false;
  if(ids?.some(id=>store.errors.has(id))){$('sw-view').textContent='기존 학습 기록을 읽지 못해 편집 화면을 열지 않았습니다. 위쪽 저장 문제 확인에서 다시 읽거나 서버 원문과 초안을 확인하세요.';updateStatus();return false;}
  $('sw-view').replaceChildren();document.title=route.label+' | 영수쌤의 파이썬 교실';
  if(route.kind==='frame')mountFrame(gen);
  else if(route.kind==='practice')mountPractice();
  else if(route.kind==='exercise')mountExercise();
  else if(route.kind==='datalab')mountDatalab();
  else if(route.kind==='library')await showLibrary(gen);
  else if(route.kind==='teacher')await showTeacher(gen);
  document.querySelector('.side')?.classList.remove('sw-menu-open');$('sw-mobile-menu')?.setAttribute('aria-expanded','false');updateStatus();window.scrollTo(0,0);return true;
 }
 function mountFrame(gen){
  frame=document.createElement('iframe');frame.id='sw-classroom-frame';frame.title=route.label;frame.allow='camera';frame.referrerPolicy='same-origin';
  const q=new URLSearchParams(route.params);if(route.id==='examples')q.set('page','lesson');
  frame.src='/sw-content/'+route.file+'?'+q+route.hash;frame.style.height='800px';$('sw-view').append(frame);
 }
 window.SWFrame=caller=>{
  if(!frame||caller!==frame.contentWindow)return null;
  const gen=viewGeneration,current=()=>gen===viewGeneration;
  const savingAllowed=route.storageMode!=='none',id=route.id,url=route.url;
  return {
   id,storageMode:route.storageMode,url,
   examples:exercises.filter(e=>e.pageId===route.file?.replace('.html','')),downloadExamples:exercises.filter(e=>e.source.endsWith('.py')),
   mountExample:async(host,id)=>{
    const example=exercises.find(e=>e.id===id);if(!current()||!example)return()=>{};
    await store.prepare([id]);if(!current())return()=>{};
    if(store.errors.has(id)){host.textContent='기존 저장본을 읽지 못했습니다. 상단에서 다시 읽어 주세요.';return()=>{};}
    activeExerciseIds.add(id);updateStatus();const saved=store.get(id);
    return mountPracticeLab(host,{...example,hasSaved:!!(store.draft(id).version||store.draft(id).dirty),readCode:()=>Object.hasOwn(saved,'code')?saved.code:null,
     writeCode:code=>{if(current())store.set(id,{...store.get(id),code,teacherCodeVersion:example.teacherCodeVersion,persistenceVersion:1});},
     readInput:()=>saved.stdin||'',writeInput:stdin=>{if(current())store.set(id,{...store.get(id),stdin,persistenceVersion:1});},
     save:()=>store.flush([id])});
   },
   mountLegacyPractice:(host,config)=>{
    if(!current())return()=>{};
    return mountPracticeLab(host,{...config,autoRun:'visible-once',hasSaved:currentIds().some(id=>store.draft(id).version||store.draft(id).dirty),save:()=>store.flush(currentIds())});
   },
   activity:()=>{if(current())lastActivity=Date.now();},
   read:key=>current()&&savingAllowed?rawFor(key,store):null,
   write:(key,raw,previous,initial)=>{if(current()&&savingAllowed)updateRaw(key,raw,store,previous,{initial});},
   value:id=>current()&&savingAllowed?store.get(id):{},
   update:(id,value)=>{if(current()&&savingAllowed)store.set(id,value);},
   navigate:target=>{if(current())void navigate(target);},
   canNavigate:target=>!!resolveRoute(target,location.origin+'/'),
   importFile:file=>{if(current())void importFile(file);},
   lessonChanged:n=>{if(current()&&id==='lesson'){route.params.lesson=String(n);route.url='/?page=lesson&lesson='+n;history.replaceState(null,'',route.url);updateStatus();}},
   ready:()=>{if(current()&&route.hash)caller.document.getElementById(route.hash.slice(1))?.scrollIntoView();},
   height:h=>{if(current()&&frame)frame.style.height=Math.min(100000,Math.max(600,h))+'px';},
   run:(input,status)=>{if(!current())throw Error('종료된 수업입니다.');return runPython(input,status);},
   warm:async status=>{if(current()){runtime().prepare();status('실행 버튼을 누르면 Python을 준비합니다.');}},
   stop:()=>{if(current()){engine?.dispose();engine=null;}}
  };
 };
 function mountDatalab(){
  const unit=route.params.unit,codeId='sw2-datalab-'+unit+'-code',stateId='sw2-datalab-'+unit+'-state',gen=viewGeneration;
  disposeView=mountDataLab($('sw-view'),{
   unit,hasSaved:!!(store.draft(codeId).version||store.draft(codeId).dirty),readState:()=>store.get(stateId),readCode:()=>{const d=store.draft(codeId);return d.version||d.dirty?d.data.code:null;},
   writeCode:value=>{if(gen===viewGeneration)store.set(codeId,value);},
   writeState:part=>{if(gen===viewGeneration)store.set(stateId,{...store.get(stateId),...part,providedData:providedData[unit]});},
   save:()=>store.flush([codeId,stateId]),
   navigate:id=>navigate('/?page=data-lab&unit='+id),
   openLibrary:()=>navigate('/?page=library'),importFile:file=>importFile(file)
  });
 }
 function mountExercise(){
  const example=exercises.find(e=>e.id===route.params.exercise),id=example.id,gen=viewGeneration;
  const host=document.createElement('div');$('sw-view').append(host);
  const saved=store.get(id);
  disposeView=mountPracticeLab(host,{...example,hasSaved:!!(store.draft(id).version||store.draft(id).dirty),
   readCode:()=>Object.hasOwn(saved,'code')?saved.code:null,
   writeCode:code=>{if(gen===viewGeneration)store.set(id,{...store.get(id),code,teacherCodeVersion:example.teacherCodeVersion,persistenceVersion:1});},
   readInput:()=>saved.stdin||'',writeInput:stdin=>{if(gen===viewGeneration)store.set(id,{...store.get(id),stdin,persistenceVersion:1});},
   save:()=>store.flush([id])
  });
 }
 function mountPractice(){
  const id=route.params.workspace,d=store.draft(id),gen=viewGeneration;
  const heading=document.createElement('h1');heading.textContent='자유 Python 실습실';$('sw-view').append(heading);
  const select=document.createElement('select');select.setAttribute('aria-label','학습 활동');
  for(const key of legacyIds)select.append(new Option(titleFor(key),key));
  select.value=id;select.onchange=()=>navigate('/?page=practice&workspace='+select.value);$('sw-view').append(select);
  const host=document.createElement('div');$('sw-view').append(host);
  disposeView=mountPracticeLab(host,{id,title:titleFor(id),autoRun:'visible-once',hasSaved:!!(d.version||d.dirty),teacherCode:'books = [3, 5, 2]\nbooks.append(4)\nprint(books)\n',
   readCode:()=>d.version||d.dirty?d.data.code:null,
   writeCode:code=>{if(gen===viewGeneration)store.set(id,code);},
   readInput:()=>store.get('sw2-free-state').practiceInputs?.[id]||'',
   writeInput:value=>{if(gen===viewGeneration){const saved=store.get('sw2-free-state');store.set('sw2-free-state',{...saved,practiceInputs:{...saved.practiceInputs,[id]:value}});}},
   save:()=>store.flush([id,'sw2-free-state'])
  });
 }
 async function showLibrary(gen){
  if(!store.writable){$('sw-view').textContent='로그인과 학급 승인 후 내 학습 보관함을 사용할 수 있습니다.';return;}
  $('sw-view').innerHTML='<section class="panel"><h1>내 학습 보관함</h1><p>계정 저장과 선생님께 제출은 별도입니다. 종류에 맞는 작성 화면으로 이어집니다.</p><div id="sw-records">저장본을 읽고 있습니다…</div><div id="sw-history"></div></section>';
  try{
   const remote=await cloud.service.list(user.uid);if(gen!==viewGeneration)return;
   const all=new Map(remote.filter(r=>validActivity(r.workspaceId)).map(r=>[r.workspaceId,r]));
   for(const d of store.drafts.values())if(d.dirty)all.set(d.id,{...d.data,workspaceId:d.id,version:d.version,dirty:true});
   $('sw-records').replaceChildren();
   if(!all.size)$('sw-records').textContent='아직 저장한 학습물이 없습니다.';
   for(const [id,rec] of all){
    const row=document.createElement('article');row.className='sw-record';
    const h=document.createElement('h2');h.textContent=rec.title||titleFor(id);row.append(h);
    const p=document.createElement('p');p.textContent=titleFor(id)+(rec.dirty?' · 미저장 초안 있음':' · 저장 버전 '+rec.version);row.append(p);
    for(const [label,fn] of [
     ['이어서 작성',()=>navigate(routeForActivity(id))],
     ['내려받기',()=>download(id+(structured(id)?'.json':'.py'),rec.code,structured(id)?'application/json':'text/x-python;charset=utf-8')],
     ['최근 이력',async()=>{
      const history=await cloud.service.revisions(user.uid,id);if(gen!==viewGeneration)return;$('sw-history').replaceChildren();
      for(const old of history){const b=document.createElement('button');b.className='btn secondary';b.textContent=titleFor(id)+' · 이전 버전 '+old.version+' 복원';
       b.onclick=async()=>{if(await ask('이전본 복원','이전본을 현재 활동의 새 버전으로 저장합니다. 현재 초안은 먼저 내려받을 수 있습니다.',[['restore','새 버전으로 복원'],['cancel','취소']])!=='restore')return;if(gen!==viewGeneration)return;await store.prepare([id]);if(gen!==viewGeneration)return;if(store.errors.has(id)){say('현재 저장본을 읽지 못했습니다.',true);return;}if(structured(id))decode(id,old.code);store.draft(id).update({title:old.title,code:old.code,completed:!!old.completed,runState:old.runState||'idle'});await store.flush([id]);store.temp.clear();await navigate(routeForActivity(id));};$('sw-history').append(b);
      }
     }]
    ]){const b=document.createElement('button');b.className='btn secondary';b.textContent=label;b.onclick=()=>Promise.resolve(fn()).catch(e=>say(e.message,true));row.append(b);}
    $('sw-records').append(row);
   }
  }catch(e){if(gen===viewGeneration)$('sw-records').textContent='보관함을 읽지 못했습니다. '+readableError(e);}
 }
 async function showTeacher(gen){
  if(!identity?.staff){$('sw-view').textContent='담당 교사 권한이 필요합니다.';return;}
  const classes=identity.classes.filter(c=>identity.staff.classIds?.includes(c.id));
  $('sw-view').innerHTML='<section class="panel"><h1>교사용 관리실 · 학생 계정 관리</h1><p>담당 학급 학생의 승인·이용 정지·정지 해제를 관리합니다. 상태를 바꿔도 기존 학습 기록은 삭제되지 않습니다.</p><p class="sw-caption">승인 대기 → 학생 승인 · 승인됨 → 이용 정지 · 이용 중지 → 정지 해제. 학생 화면은 상태가 변경되면 자동으로 반영됩니다.</p><label for="sw-teacher-class">관리할 학급</label><select id="sw-teacher-class"></select><p id="sw-teacher-summary" role="status"></p><div id="sw-students"></div></section>';
  for(const c of classes)$('sw-teacher-class').append(new Option(c.title,c.id));
  async function list(){
   const classId=$('sw-teacher-class').value;
   if(!classId){$('sw-teacher-summary').textContent='담당 학급이 등록되어 있지 않습니다.';return;}
   $('sw-teacher-summary').textContent='학생 계정을 확인하고 있습니다…';
   const students=await cloud.students(classId);if(gen!==viewGeneration)return;
   $('sw-students').replaceChildren();
   const labels={pending:'승인 대기',approved:'승인됨',blocked:'이용 중지'};
   const counts={pending:0,approved:0,blocked:0};
   for(const student of students){
    if(student.uid===user?.uid||!student.enrollment)continue;
    if(Object.hasOwn(counts,student.status))counts[student.status]++;
    const card=document.createElement('article');card.className='sw-record';
    const title=document.createElement('h2');title.textContent=(student.displayName||'학생')+' · '+(labels[student.status]||'상태 확인 필요');card.append(title);
    const school=document.createElement('p');school.textContent=affiliation(student)||'테스트 등록 · 학생이 소속을 새로 등록하면 승인할 수 있습니다.';card.append(school);
    const email=document.createElement('p');email.className='sw-caption';email.textContent=student.email||'';card.append(email);
    const transitions={pending:['approved','학생 승인'],approved:['blocked','이용 정지'],blocked:['approved','정지 해제 · 이용 재개']};
    const next=student.enrollment?transitions[student.status]:null;
    if(next){
     const [status,label]=next;
     const b=document.createElement('button');b.className='btn '+(status==='approved'?'primary':'secondary');b.textContent=label;
     b.onclick=async()=>{
      const detail=(affiliation(student)||'기존 SW 수업 등록 학생')+'\n'+student.displayName+' 학생의 상태를 '+(labels[status]||status)+'(으)로 변경합니다. 학습 기록은 보존됩니다.';
      const answer=await ask(label,detail,[['confirm',label],['cancel','취소']]);
      if(answer!=='confirm')return;
      b.disabled=true;
      try{
       await cloud.changeStudentStatus(student.uid,student.status,status);
       if(gen!==viewGeneration)return;
       say(student.displayName+' 학생: '+(labels[student.status]||student.status)+' → '+(labels[status]||status)+' 변경 완료');
       await list();
      }catch(e){say('상태 변경 실패: '+readableError(e),true);b.disabled=false;}
     };
     card.append(b);
    }
    const b=document.createElement('button');b.className='btn secondary';b.textContent='진도·제출물 확인';
    b.onclick=async()=>{
     b.disabled=true;
     try{
      const data=await cloud.teacherDetails(student.uid,classId);if(gen!==viewGeneration)return;
      const detail=document.createElement('div');const p=document.createElement('p');p.textContent='진도 '+data.progress.length+'건 · 명시적 제출 '+data.submissions.length+'건';detail.append(p);
      for(const r of data.progress){const x=document.createElement('p');x.textContent=titleFor(r.workspaceId)+' · '+(r.completed?'완료':'진행 중');detail.append(x);}
      for(const r of data.submissions){const h=document.createElement('h3');h.textContent=r.title;const pre=document.createElement('pre');try{pre.textContent=structured(r.workspaceId)?JSON.stringify(decode(r.workspaceId,r.code),null,2):r.code;}catch{pre.textContent='기록 형식 확인 필요';}detail.append(h,pre);}
      card.querySelector('.sw-detail')?.remove();detail.className='sw-detail';card.append(detail);
     }catch(e){say('학습 기록 조회 실패: '+readableError(e),true);}
     finally{b.disabled=false;}
    };
    card.append(b);$('sw-students').append(card);
   }
   $('sw-teacher-summary').textContent='전체 '+(counts.pending+counts.approved+counts.blocked)+'명 · 승인 '+counts.approved+'명 · 승인 대기 '+counts.pending+'명 · 이용 중지 '+counts.blocked+'명';
   if(!Object.values(counts).some(Boolean))$('sw-students').textContent='새로 등록한 학생이 없습니다. 학생은 Google 로그인 후 학교·학년·반·이름을 입력하고 승인 요청을 보내면 됩니다.';
  }
  $('sw-teacher-class').onchange=()=>list().catch(e=>say('학생 목록 조회 실패: '+readableError(e),true));
  await list().catch(e=>{say('학생 목록 조회 실패: '+readableError(e),true);$('sw-teacher-summary').textContent='목록을 불러오지 못했습니다. 담당 학급 및 교사 권한을 확인하세요.';});
 }
 async function importFile(file){
  const generation=sessionGeneration,sourceRoute=route?.url,unit=route?.id==='data-lab'?route.params.unit:null;
  const current=()=>generation===sessionGeneration&&sourceRoute===route?.url;
  try{
   if(file.size>1000000)throw Error('1MB 이하의 SW 학습 백업을 선택해 주세요.');
   const text=await file.text();if(!current())return;let items;
   if(file.name?.endsWith('.py')&&unit)items=[{id:'sw2-datalab-'+unit+'-code',value:text}];
   else {const value=JSON.parse(text);if(unit&&value?.version===1&&typeof value.code==='string'&&typeof value.csv==='string'&&typeof value.concept==='string')items=[{id:'sw2-datalab-'+unit+'-code',value:value.code},{id:'sw2-datalab-'+unit+'-state',value:{csv:value.csv,concept:value.concept,dataMode:'fictional-edited',providedData:providedData[unit]}}];else items=importRecords(value);}
   if(items.some(r=>!validActivity(r.id)))throw Error('알 수 없는 활동이 있는 백업입니다.');
   const checked=items.map(r=>{
    const data=r.data||{title:titleFor(r.id),code:structured(r.id)?encode(r.id,r.value):String(r.value),runState:'idle',completed:false};
    if(typeof data.code!=='string'||data.code.length>20000)throw Error('20,000자를 넘거나 형식이 잘못된 활동이 있습니다. 원본 파일은 유지됩니다.');
    if(structured(r.id))decode(r.id,data.code);return{id:r.id,data};
   });
   const preview=checked.map(r=>titleFor(r.id)+'\n'+r.data.code.slice(0,250)).join('\n\n');
   if(await ask('내 자료 가져오기 미리보기',preview+'\n\n본인 자료인 경우에만 가져오세요. 원본 파일은 지우지 않습니다.',[['import','본인 자료 가져오기'],['cancel','취소']])!=='import')return;
   if(!current())return;await store.prepare(checked.map(r=>r.id));if(!current())return;
   if(checked.some(r=>store.errors.has(r.id)))throw Error('기존 저장본을 읽지 못해 가져오기를 중단했습니다.');
   const collisions=checked.filter(r=>{const d=store.draft(r.id);return(d.version||d.dirty)&&d.data.code!==r.data.code;});
   if(collisions.length&&await ask('기존 기록과 충돌',collisions.map(r=>titleFor(r.id)).join('\n')+'\n기존 내용 대신 선택한 백업을 새 버전으로 저장합니다.',[['replace','백업 내용으로 변경'],['cancel','취소']])!=='replace')return;
   if(!current())return;let changed=0;for(const r of checked){const d=store.draft(r.id);if(d.data.code===r.data.code)continue;d.update({title:r.data.title||titleFor(r.id),code:r.data.code,completed:!!r.data.completed,runState:['idle','success','error'].includes(r.data.runState)?r.data.runState:'idle'});changed++;}
   store.temp.clear();say(changed?'가져온 초안 '+changed+'개 · 계정 저장 상태를 확인해 주세요.':'이미 같은 내용입니다. 중복 저장하지 않았습니다.');
   await navigate(route.url,{replace:true});
  }catch(e){say(e.message,true);}
 }
 async function resolveFailure(){
  const gen=sessionGeneration,owner=user?.uid,current=()=>gen===sessionGeneration&&owner===user?.uid;
  const failed=[...store.drafts.values()].find(d=>d.error)||store.draft([...store.errors.keys()][0]);
  if(!failed)return;
  const choice=await ask('저장 상태 확인',titleFor(failed.id)+'\n'+(failed.error?.message||store.errors.get(failed.id)?.message||'')+'\n초안을 먼저 내려받아 보관할 수 있습니다.',[['export','모든 초안 내려받기'],['remote','서버 저장본 확인'],['retry','다시 읽기·저장'],['cancel','화면 유지']]);
  if(!current())return;
  if(choice==='export'){backup();return;}
  if(choice==='retry'){await store.prepare([failed.id]);await store.flush([failed.id]);return;}
  if(choice!=='remote')return;
  const remote=await store.remote(failed.id);if(!current())return;const selected=await ask('서버 저장본과 비교','서버 버전 '+(remote?.version||0)+'\n'+(remote?.code||'(기록 없음)').slice(0,5000),[['remote','서버 저장본 사용'],['mine','내 초안을 새 버전으로 저장'],['cancel','화면 유지']]);
  if(!current())return;
  if(selected==='remote'){await store.useRemote(failed.id);await navigate(route.url,{replace:true});}
  if(selected==='mine'){
   if(await ask('내 초안으로 저장','다른 기기의 최신 저장본을 내 초안으로 바꿉니다. 비교한 내용을 확인했을 때만 선택하세요.',[['save','내 초안 저장'],['cancel','취소']])==='save'&&current())await store.keepMine(failed.id,remote?.version||0);
  }
 }
 async function finish(force=false){
  if(ending&&!force)return false;if(force&&dialogResolve){dialogResolve('cancel');dialogResolve=null;$('sw-dialog').close();}ending=true;updateStatus();
  try{
   if(!force&&store.dirty().length){
    const n=store.dirty().length,choice=await ask('이 PC 학습 마치기','저장할 초안 '+n+'개가 있습니다. 요청 간 16초 간격이 적용됩니다. 모든 화면의 초안을 처리합니다.',[['save','모두 저장 후 종료'],['export','초안 내려받고 계속 학습'],['cancel','계속 학습']]);
    if(choice==='export'){backup();return false;}if(choice!=='save')return false;
    if(!await store.flush()){
     const after=await ask('아직 저장하지 못한 내용이 있습니다.','이 화면을 유지하거나 파일로 보관하세요. 미저장 종료하면 이 PC의 초안은 사라집니다.',[['stay','화면 유지'],['export','초안 내려받기'],['discard','미저장 종료']]);
     if(after==='export')backup();if(after!=='discard')return false;
     if(await ask('미저장 종료 확인','서버에 저장되지 않은 내용이 사라집니다.',[['end','미저장 내용 버리고 종료'],['cancel','취소']])!=='end')return false;
    }
   }
   release();store.change(null,false);identity=null;user=null;sessionGeneration++;await cloud.logout();lastActivity=Date.now();
   say(force?'15분 동안 조작이 없어 학습을 종료했습니다. 저장하지 못한 메모리 초안은 복원되지 않습니다.':'이 PC 학습을 마쳤습니다. 공용 PC에서는 Google 계정과 브라우저 프로필에서도 로그아웃해 주세요.');
   await navigate('/?page=home',{replace:true});return true;
  }finally{ending=false;updateStatus();}
 }
 async function login(){
  if(user&&!await finish())return;
  if(!user&&store.dirty().length){
   const selected=await ask('로그인 전 작성한 초안','이 화면에서 직접 작성한 초안을 보관할 수 있습니다. 이전 공용 PC 자료는 자동으로 가져오지 않습니다.',[['carry','로그인 후 본인 자료로 가져오기'],['export','내려받고 로그인'],['cancel','계속 작성']]);
   if(selected==='cancel')return;
   guestBackup=selected==='carry'?store.backup():null;if(selected==='export')backup();
  }
  try{await cloud.login();}catch(e){say(readableError(e),true);}
 }
 function renderRegistration(edit = false){
  const mode = registrationMode(identity?.profile, identity?.staff);
  $('sw-registration').hidden = !user || mode === 'hidden';
  if (!user || mode === 'hidden') { $('sw-registration-form').reset(); return; }
  const pending = mode === 'pending' && !edit;
  $('sw-registration-pending').hidden = !pending;
  $('sw-registration-form').hidden = pending;
  $('sw-pending-affiliation').textContent = affiliation(identity.profile) + ' · ' + (identity.profile?.displayName || '');
  $('sw-registration-note').textContent = pending ? '승인 요청이 접수되었습니다. 선생님 승인 전까지는 계정 저장을 사용할 수 없습니다.' : identity?.enrollmentError || '';
  if (pending) return;
  const catalog = identity?.enrollmentConfig, schools = schoolsFor(catalog, user.email), previous = identity?.profile?.enrollment;
  $('sw-registration-form').reset();
  $('sw-register-school').replaceChildren(new Option('학교 선택', ''));
  for (const school of schools) $('sw-register-school').append(new Option(school.name, school.id));
  $('sw-register-year').value = catalog?.academicYear ? catalog.academicYear + '학년도' : '';
  function choices(){
   const school = schools.find(s => s.id === $('sw-register-school').value);
   for (const [id, values, label] of [['sw-register-grade', school?.grades, '학년'], ['sw-register-class', school?.classNumbers, '반']]) {
    $(id).replaceChildren(new Option(label + ' 선택', '')); $(id).disabled = !school;
    for (const value of values || []) $(id).append(new Option(value + label, String(value)));
   }
   $('sw-register-confirm').checked = false;
  }
  $('sw-register-school').onchange = choices;
  if (previous) $('sw-register-school').value = previous.schoolId;
  choices();
  if (previous) { $('sw-register-grade').value=String(previous.grade); $('sw-register-class').value=String(previous.classNumber); }
  $('sw-register-name').value = previous ? identity.profile.displayName : '';
  $('sw-register').disabled = !schools.length;
  if (!schools.length && !identity?.enrollmentError) $('sw-registration-note').textContent = '현재 이 계정으로 신청할 수 있는 학교가 설정되지 않았습니다. 선생님께 학교 계정과 등록 설정을 확인해 달라고 요청하세요.';
  for (const id of ['sw-register-grade','sw-register-class','sw-register-name']) $(id).oninput = () => { $('sw-register-confirm').checked = false; };
 }
 async function boot(){
  const response=await fetch('/student-config.json',{cache:'no-store'});if(!response.ok)throw Error('로그인 설정을 불러오지 못했습니다.');
  const config=await response.json(),emulator=config.emulator===true&&['localhost','127.0.0.1'].includes(location.hostname)&&config.firebase?.projectId==='demo-englishmath-python';
  cloud=createCloud(config.firebase,emulator);store=new ClassroomStore(cloud.service,{onChange:updateStatus});store.providedData=providedData;
  $('sw-refresh').onclick=async()=>{const uid=user?.uid,gen=sessionGeneration;if(!uid)return;try{const next=await cloud.identity(user);if(uid!==user?.uid||gen!==sessionGeneration)return;identity=next;store.writable=approvedStudent(next.profile);renderRegistration();await navigate(route.url,{replace:true});updateStatus();}catch(e){say(readableError(e),true);}};
  $('sw-edit-enrollment').onclick=()=>renderRegistration(true);
  $('sw-registration-form').onsubmit=async e=>{
   e.preventDefault();
   const student=user, generation=sessionGeneration, current=()=>student?.uid===user?.uid&&generation===sessionGeneration;
   if(!student||$('sw-register').disabled)return;
   const fields={schoolId:$('sw-register-school').value,grade:$('sw-register-grade').value,classNumber:$('sw-register-class').value,displayName:$('sw-register-name').value,confirmed:$('sw-register-confirm').checked};
   try{
    enrollmentInput(identity?.enrollmentConfig,student.email,fields);
    $('sw-register').disabled=true;$('sw-registration-note').textContent='승인 요청을 서버에 저장하고 있습니다…';
    await cloud.register(student,fields);if(!current())return;
    const next=await cloud.identity(student);if(!current())return;
    identity=next;store.writable=approvedStudent(next.profile);renderRegistration();updateStatus();
   }catch(error){if(current()){$('sw-registration-note').textContent='승인 요청을 확인하지 못했습니다. '+readableError(error);$('sw-register').disabled=false;}}
  };
  $('sw-login').onclick=()=>void login();$('sw-end').onclick=()=>void finish();$('sw-export').onclick=backup;
  $('sw-save').onclick=async()=>{const ok=await store.flush();if(!ok)say('아직 저장되지 않은 초안이 있습니다. 위쪽 상태를 확인해 주세요.',true);};
  $('sw-resolve').onclick=()=>resolveFailure().catch(e=>say(readableError(e),true));
  $('sw-import').onchange=e=>{if(e.target.files?.[0])void importFile(e.target.files[0]);e.target.value='';};
  $('sw-submit').onclick=async()=>{
   const ids=currentIds().filter(id=>store.draft(id).dirty||store.draft(id).version);
   if(!ids.length){say('먼저 학습물을 작성하고 계정에 저장해 주세요.');return;}
   if(await ask('선생님께 제출',ids.map(titleFor).join('\n')+'\n이 자료의 본문을 현재 담당 선생님께 제출합니다. 계정 저장만으로는 제출되지 않습니다.',[['submit','이 자료 제출'],['cancel','취소']])!=='submit')return;
   try{for(const id of ids)await store.submit(id,identity.profile.classId);say('선택한 학습물을 선생님께 제출했습니다.');}catch(e){say(readableError(e),true);}
  };
  document.addEventListener('click',e=>{
   const a=e.target.closest('a[data-route]');if(a){e.preventDefault();void navigate(a.href);}
  });
  for(const name of ['pointerdown','keydown','input'])document.addEventListener(name,e=>{if(e.isTrusted)lastActivity=Date.now();},{passive:true});
  $('sw-continue').onclick=()=>{lastActivity=Date.now();$('sw-idle').hidden=true;};
  addEventListener('popstate',()=>void navigate(location.href,{replace:true}));
  addEventListener('beforeunload',e=>{if(store.dirty().length){e.preventDefault();e.returnValue='';}});
  cloud.observe(async next=>{
   const generation=++sessionGeneration;authReady=false;$('sw-registration').hidden=true;$('sw-registration-form').reset();$('sw-pending-affiliation').textContent='';if(stopProfile){stopProfile();stopProfile=null;}release();user=next;identity=null;store.change(next?.uid||null,false);updateStatus();
   if(next){
    say('');lastActivity=Date.now();
    try{
     const result=await cloud.identity(next);if(generation!==sessionGeneration)return;identity=result;store.writable=approvedStudent(result.profile);
     renderRegistration();
     stopProfile=cloud.watchProfile(next.uid,profile=>{
      if(generation!==sessionGeneration||!identity)return;
      const previous=identity.profile?.status||null,updated=profile?.status||null;
      identity={...identity,profile};store.writable=approvedStudent(profile);renderRegistration();updateStatus();
      if(previous===updated)return;
      if(updated==='blocked')say('교사가 계정 이용을 중지했습니다. 미저장 초안은 ‘초안 내려받기’로 보관하세요.',true);
      else if(updated==='approved'&&profile?.enrollment)say('학급 이용 승인이 확인되었습니다. 계정 저장 기능을 사용할 수 있습니다.');
      else say('학급 승인 상태가 변경되었습니다. 교사에게 확인해 주세요.',true);
      if(approvedStudent(profile))void navigate(route?.url||location.href,{replace:true}).catch(e=>say(readableError(e),true));
     },e=>{if(generation===sessionGeneration)say('실시간 승인 확인 오류: '+readableError(e)+' · 승인 상태 확인을 눌러 다시 조회하세요.',true);});

    }catch(e){if(generation===sessionGeneration)say('승인 정보를 읽지 못했습니다. '+readableError(e),true);}
   }else { $('sw-registration').hidden=true; $('sw-registration-form').reset(); }
   if(generation!==sessionGeneration)return;
   authReady=true;await navigate(route?.url||location.href,{replace:true});
   if(guestBackup){const backupData=guestBackup;guestBackup=null;await importFile(new Blob([JSON.stringify(backupData)],{type:'application/json'}));}
  });
  $('sw-view').textContent='로그인 상태와 학습 기록을 확인하고 있습니다…';
  setInterval(()=>{
   if(!autoBusy&&!ending){autoBusy=true;store.autoSave().finally(()=>{autoBusy=false;});}
   const elapsed=Date.now()-lastActivity;
   $('sw-idle').hidden=elapsed<14*60000||(!user&&!store.dirty().length);
   if(!$('sw-idle').hidden)$('sw-idle-count').textContent=Math.max(0,Math.ceil((15*60000-elapsed)/1000))+'초 뒤 학습이 종료됩니다. 저장 실패 시 초안을 내려받아 주세요.';
   if(elapsed>=15*60000&&(user||store.dirty().length))void finish(true);
  },1000);
 }
 boot().catch(e=>say('수업 연결을 시작하지 못했습니다. '+e.message,true));
})();

