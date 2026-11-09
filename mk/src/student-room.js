import { createCloud, readableError, MAX_CODE, SAVE_INTERVAL, WRITE_GAP } from './student-cloud.bundle.js';
import { StudentSession, clearTemporaryLessons } from './student-session.js';
import { runPython, drawTurtle } from './student-run.js';
import { activities, activityById } from './content.js';
import { SpaceWriteQueue } from './write-queue.js';
import { LearningDraft } from './learning-draft.js';
import { recordKind } from './routes.js';
import { nextScratch, occupiedScratch } from './code-library.js';

const $=id=>document.getElementById(id), session=new StudentSession();
clearTemporaryLessons();
let selectedSpace=null;
let cloud,user=null,identity=null,workspace='scratch-01',runner=null,autoTimer,lastActivity=Date.now(),lastWrite=Date.now();
let runState='idle',loading=false,loggingOut=false,noticeAfterLogout='',idleSaveAttempted=false;
let scopeGeneration=0,identityRequest=0,flushPromise=null,guardPromise=null,authObserved=false;
const records=new Map(),drafts=new Map(),writes=new SpaceWriteQueue({gap:WRITE_GAP});
let libraryItems=[],creatingCode=false;
const channel='BroadcastChannel' in window ? new BroadcastChannel('englishmath-shared-pc') : null;
const labels=new Map([
  ...activities.map(a=>[a.id,a.title]),
  ['mk3-report','탐구 보고서'],['mk3-notebook','복습 오답 기록'],
  ['lesson-00','이전 과정 · 00 복습'],
  ...Array.from({length:10},(_,i)=>[`lesson-${String(i+1).padStart(2,'0')}`,`이전 과정 · 실습 ${i+1}`]),
  ...['a','b','c','d'].map(k=>['inquiry-'+k,'이전 과정 · 탐구실 '+k.toUpperCase()]),
  ...Array.from({length:10},(_,i)=>[`scratch-${String(i+1).padStart(2,'0')}`,`자유 실습 ${i+1}`])]);
function changed(kind='record',extra={}){dispatchEvent(new CustomEvent('mk-session',{detail:{kind,workspace,canWrite:!!canWrite(),...extra}}));}
for(const [id,label] of labels)if(recordKind(id)==='code')$('workspace').add(new Option(label,id));
const requested=new URLSearchParams(location.search).get('workspace');
if(labels.has(requested)&&recordKind(requested)==='code') workspace=requested;
$('workspace').value=workspace;

function notice(text,error=false) { $('notice').textContent=text;$('notice').classList.toggle('error',error); }
function state(text,error=false) { $('save-state').textContent=text;$('save-state').classList.toggle('error',error); }
function canWrite() { return !!user && identity?.profile?.status==='approved'; }
function scope() {return {generation:scopeGeneration,uid:user?.uid||null,spaceId:selectedSpace,store:identity?.service};}
function scopeCurrent(snapshot) {return snapshot.generation===scopeGeneration&&snapshot.uid===(user?.uid||null)&&snapshot.spaceId===selectedSpace;}
function allDrafts(){return [...records.entries(),...drafts.entries()];}
function hasUnsaved() {return allDrafts().some(([,draft])=>draft.isDirty());}
function activity() {lastActivity=Date.now();idleSaveAttempted=false;document.body.classList.remove('idle-private');}
function summary() {
  const count=allDrafts().filter(([,d])=>d.isDirty()).length;
  $('pending-summary').textContent=count?`아직 저장되지 않은 학습물 ${count}개 · 다른 메뉴로 이동해도 초안은 이 탭에 유지됩니다.`:canWrite()?'현재 학습 공간의 저장 상태를 각 학습물에서 확인할 수 있습니다.':'로그인 전 내용은 이 탭에만 있습니다. 파일로 보관한 뒤 로그인할 수 있습니다.';
  $('pending-summary').classList.toggle('error',count>0);
  $('save-all').hidden=!count;$('backup-all').hidden=!count;
}
let nextSaveDue=0;
function scheduleSave(retry=false) {
  clearTimeout(autoTimer);summary();
  if(!canWrite()||!hasUnsaved()){nextSaveDue=0;return;}
  if(flushPromise)return;
  if(retry||!nextSaveDue)nextSaveDue=Date.now()+SAVE_INTERVAL;
  autoTimer=setTimeout(()=>{nextSaveDue=0;saveAll().catch(showError);},Math.max(0,nextSaveDue-Date.now()));
}
function getRecord(id) {
  if(records.has(id)&&scopeCurrent(records.get(id).owner))return records.get(id);
  if(records.get(id)?.dirty)throw Object.assign(Error('계정 확인 전에 작성한 초안이 있습니다. 먼저 내려받아 주세요.'),{code:'conflict'});
  const owner=scope();
  const record=new LearningDraft({id,seed:{title:labels.get(id),code:activityById.get(id)?.code||'',completed:false,runState:'idle'},
    read:()=>bounded(owner.store.load(owner.uid,id)),
    write:(data,version)=>mutateRecord(owner,id,'save',data,version),
    current:()=>scopeCurrent(owner),canWrite,
    onChange:d=>{if(scopeCurrent(owner)){if(workspace===id)renderSaveState(d);summary();renderCodeChoices();}}
  });
  record.owner=owner;record.stdin=activityById.get(id)?.stdin||'';records.set(id,record);return record;
}
function renderSaveState(record) {
  const messages={guest:'로그인 전 임시 초안 · 파일로 보관할 수 있습니다.',dirty:'아직 저장되지 않은 내용이 있습니다.',loading:'내 기록을 확인하고 있습니다.',saving:'클라우드에 저장 중입니다.',loaded:'저장한 학습물을 불러왔습니다.',empty:'새 활동 · 예제는 아직 저장하지 않았습니다.',exported:'파일로 보관했습니다. 클라우드에는 반영되지 않았습니다.',saved:`✓ 클라우드 저장 완료 · ${new Date(record.savedAt||Date.now()).toLocaleTimeString('ko-KR')}`};
  state(record.error?readableError(record.error):(messages[record.kind]||messages.dirty),!!record.error);
  if(record.dirty&&record.kind==='saved')state(messages.dirty);
}
async function mutateRecord(snapshot,id,kind,data,version) {
  if(!scopeCurrent(snapshot)||!canWrite())throw Object.assign(Error('학습 공간이 바뀌었습니다. 현재 공간에서 다시 저장해 주세요.'),{code:'stale-scope'});
  if(!navigator.onLine)throw Object.assign(Error('offline'),{code:'network'});
  const next=await writes.run(`${snapshot.uid}:${snapshot.store.root||snapshot.spaceId}`,()=>snapshot.store.mutate(snapshot.uid,id,kind,data,version),{
    current:()=>scopeCurrent(snapshot)&&canWrite(),
    onWait:()=>{if(id===workspace&&kind==='save'&&scopeCurrent(snapshot))state('저장 대기 중 · 다른 기록 저장 후 이어집니다. 메뉴를 이동해도 유지됩니다.');}
  });
  if(!scopeCurrent(snapshot))throw Object.assign(Error('학습 공간이 바뀌어 이전 저장 결과를 표시하지 않습니다.'),{code:'stale-scope'});
  lastWrite=Date.now();return next;
}
function date(value) {return value?.toDate?.().toLocaleString('ko-KR') || '기록 없음';}
function renderCodeChoices() {
  const titles=new Map(libraryItems.map(item=>[item.workspaceId,item.title]));
  for(const [id,record] of records)if(record.version>0||record.isDirty())titles.set(id,record.data.title);
  for(const option of $('workspace').options)option.textContent=titles.has(option.value)?`${titles.get(option.value)} · ${labels.get(option.value)}`:labels.get(option.value);
  const count=occupiedScratch(libraryItems,records).size;
  $('code-count').textContent=`자유 코드 ${count} / 10개 · 수업 실습은 별도 저장`;
  for(const id of ['new-code','save-as'])$(id).disabled=creatingCode||loading||!canWrite();
}
async function refreshCodeChoices() {
  const owner=scope();
  const items=await bounded(owner.store.list(owner.uid));
  if(scopeCurrent(owner)){libraryItems=items;renderCodeChoices();}
  return items;
}
function askCodeTitle(copy) {
  const dialog=$('code-name-dialog');
  $('code-name-heading').textContent=copy?'다른 이름으로 저장':'새 코드 만들기';
  $('new-code-title').value=copy?`${$('title').value} 사본`.slice(0,80):'새 Python 코드';
  return new Promise(resolve=>{
    const done=value=>{dialog.close();dialog.oncancel=null;$('code-name-form').onsubmit=null;resolve(value);};
    $('code-name-form').onsubmit=e=>{e.preventDefault();const title=$('new-code-title').value.trim();if(title)done(title);else $('new-code-title').focus();};
    $('code-name-cancel').onclick=()=>done(null);dialog.oncancel=e=>{e.preventDefault();done(null);};
    dialog.showModal();$('new-code-title').select();
  });
}
async function createCode(copy=false) {
  if(creatingCode||loading)return;
  if(!canWrite())throw Error('로그인과 학급 승인을 확인한 뒤 새 코드를 저장해 주세요.');
  const owner=scope(),snapshot=session.checkpoint(),original=workspace;
  const source=copy?{code:$('editor').value,completed:false,runState,stdin:$('stdin').value}:{code:'',completed:false,runState:'idle',stdin:''};
  creatingCode=true;renderCodeChoices();
  try {
    const title=await askCodeTitle(copy);
    if(!title||!scopeCurrent(owner)||!session.current(snapshot))return;
    notice('새 코드 저장 공간을 확인하고 있습니다.');
    const items=await refreshCodeChoices();
    if(!scopeCurrent(owner)||!session.current(snapshot))return;
    const id=nextScratch(items,records,copy?[original]:[]),record=getRecord(id);
    // Force a server read even if an empty slot was visited earlier. A later
    // concurrent creation is still rejected by mutate's version-zero check.
    if(!await record.load({force:true})||!scopeCurrent(owner)||!session.current(snapshot))return;
    record.create({title,code:source.code,completed:source.completed,runState:source.runState});record.stdin=source.stdin;
    try {
      const saved=await record.save();
      if(saved&&scopeCurrent(owner))notice(`“${title}”을 별도 코드로 저장했습니다. 내 코드 보관함에서 다시 열 수 있습니다.`);
    } finally {
      if(scopeCurrent(owner)){
        if(session.current(snapshot))changed('open-record',{id});
        scheduleSave(true);
      }
    }
  } finally {creatingCode=false;renderCodeChoices();}
}
function button(label,action) {const b=document.createElement('button');b.textContent=label;b.addEventListener('click',()=>Promise.resolve().then(action).catch(showError));return b;}
function showError(error) {
  if(error.code==='stale-scope')return;
  const message=readableError(error);
  if(user&&hasUnsaved()&&!loggingOut&&Date.now()-lastActivity>14*60000)notice('자동 로그아웃 전 저장에 실패했습니다. 코드와 오답 기록을 내려받아 보관하거나 인터넷 연결을 복구해 주세요. '+message,true);
  else notice(message,true);
}
function bounded(promise,ms=10000) {let t;return Promise.race([promise,new Promise((_,reject)=>t=setTimeout(()=>reject(Object.assign(Error('연결 응답이 지연되고 있습니다.'),{code:'deadline'})),ms))]).finally(()=>clearTimeout(t));}
function confirmAction(title,message,label='확인') {
  $('dialog-title').textContent=title;$('dialog-message').textContent=message;$('dialog-yes').textContent=label;
  return new Promise(resolve=>{
    const d=$('confirm-dialog');d.showModal();
    const done=value=>{d.close();d.oncancel=null;resolve(value);};
    $('dialog-yes').onclick=()=>done(true);$('dialog-no').onclick=()=>done(false);d.oncancel=e=>{e.preventDefault();done(false);};
  });
}
function download(code=$('editor').value,name=workspace,id=workspace) {
  const url=URL.createObjectURL(new Blob([code],{type:'text/x-python;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=name.replace(/[^\p{L}\p{N}_-]/gu,'_')+(recordKind(id)==='code'?'.py':'.json');link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function wipe(uid=null,{initialAnonymous=false}={}) {
  scopeGeneration++;identityRequest++;identity=null;flushPromise=null;guardPromise=null;
  for(const record of records.values())record.reset();records.clear();
  libraryItems=[];
  $('membership-panel').hidden=true;$('member-info').hidden=true;$('membership-result').textContent='';$('membership-current').textContent='';$('membership-name').value='';$('registration-name').value='';
  if($('membership-note-dialog').open)$('membership-note-cancel').click();
  if($('code-name-dialog').open)$('code-name-cancel').click();
  renderCodeChoices();
  for(const draft of drafts.values())draft.reset();nextSaveDue=0;document.body.classList.remove('idle-private');
  $('learning-space-panel').hidden=true;
  if(!uid) selectedSpace=null;
  session.change(uid);clearTimeout(autoTimer);runner?.stop();runner=null;loading=false;runState='idle';lastWrite=Date.now();
  $('editor').value='';$('title').value='';$('completed').checked=false;$('output').textContent='실행 결과가 여기에 표시됩니다.';
  $('plot').removeAttribute('src');$('plot').hidden=true;$('run-state').textContent='실행 대기';
  for(const id of ['history-list','library-list','student-list','student-details']) $(id).replaceChildren();
  for(const id of ['history-panel','library-panel','teacher-area','student-area','enrollment','teacher-tab']) $(id).hidden=true;
  $('stop').disabled=true;$('run').disabled=false;$('editor').readOnly=false;$('code-length').textContent='0 / 20,000자';
  if($('confirm-dialog').open) $('dialog-no').click();
  $('stdin').value='';$('turtle-result').hidden=true;$('trace-body').replaceChildren();$('student-area').hidden=false;changed('wipe',{initialAnonymous});
}
function dirty() {
  if(loading)return;
  const record=getRecord(workspace);
  record.update({title:$('title').value.trim()||labels.get(workspace),code:$('editor').value,completed:$('completed').checked,runState});
  record.stdin=$('stdin').value;
  session.code=record.data.code;session.version=record.version;session.dirty=record.dirty;session.edit++;
  $('code-length').textContent=`${record.data.code.length.toLocaleString()} / 20,000자`;
  renderSaveState(record);scheduleSave();
}
async function save() {
  if(loading)return false;
  const record=records.get(workspace);if(!record)return true;
  try{return await record.save();}finally{scheduleSave(true);}
}
async function saveAll() {
  if(flushPromise)return flushPromise;
  const space=scope();
  const pending=(async()=>{
    let failure=null;
    // Insertion order retains every visited activity; one failing record cannot
    // starve the remaining code, report or notebook drafts.
    for(const [,draft] of allDrafts()) {
      if(!scopeCurrent(space))return false;
      if(draft.isDirty())try{await draft.save();}catch(error){failure=error;}
    }
    if(!scopeCurrent(space))return false;
    if(failure)throw failure;
    return !hasUnsaved();
  })();
  flushPromise=pending;
  try{return await pending;}finally{if(flushPromise===pending){flushPromise=null;scheduleSave(true);}}
}
function downloadDrafts({discard=false}={}) {
  const entries=allDrafts().filter(([,d])=>d.isDirty());
  const backup={format:'mk-learning-backup-v2',space:selectedSpace,createdAt:new Date().toISOString(),records:Object.fromEntries(entries.map(([id,d])=>[id,d.export()]))};
  const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='MK_미저장_학습_백업.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  if(discard){for(const [,d] of entries)d.discard();session.dirty=false;}
  summary();
}
async function protectDraft() {
  if(guardPromise)return guardPromise;
  if(!hasUnsaved())return true;
  const space=scope();
  const pending=(async()=>{
    try {
      if(await bounded(saveAll(),30000))return true;
    }catch(error){if(scopeCurrent(space))showError(error);}
    if(!scopeCurrent(space))return false;
    if(!hasUnsaved())return true;
    const hasNotebook=[...drafts.values()].some(draft=>draft.isDirty());
    const accepted=await confirmAction('아직 저장하지 못한 학습 내용이 있습니다',hasNotebook?'코드·보고서와 복습 오답 기록 중 저장하지 못한 내용을 하나의 학습 백업 파일로 내려받은 뒤 이동할 수 있습니다.':'현재 코드·보고서를 파일로 내려받은 뒤 이동할 수 있습니다.',hasNotebook?'학습 백업 내려받고 이동':'파일 내려받고 이동');
    if(!accepted||!scopeCurrent(space))return false;
    downloadDrafts({discard:true});return true;
  })();
  guardPromise=pending;
  try{return await pending;}finally{if(guardPromise===pending)guardPromise=null;}
}
function leavePage() {
  const previous=records.get(workspace);if(previous)previous.stdin=$('stdin').value;
  runner?.stop();runner=null;session.change(user?.uid||null);loading=false;
  $('run').disabled=false;$('stop').disabled=true;
}
async function loadWorkspace(id,force=false) {
  if(!labels.has(id))return false;
  if(id==='mk3-notebook'){changed('notebook');return true;}
  leavePage();const snapshot=session.checkpoint();workspace=id;
  if(recordKind(id)==='code')$('workspace').value=id;
  const record=getRecord(id);loading=!!user&&!identity||canWrite()&&(!record.loaded||force);
  $('editor').value='';$('editor').readOnly=loading;$('title').value='';$('completed').checked=false;
  $('output').textContent='';$('plot').hidden=true;$('turtle-result').hidden=true;$('trace-body').replaceChildren();
  $('run-state').textContent='실행 대기';$('stdin').value=record.stdin;
  renderSaveState(record);changed('loading');
  try {
    if(user&&!identity){state('계정과 학습 공간을 확인하고 있습니다.');return false;}
    if(canWrite())await record.load({force});
    if(!session.current(snapshot))return false;
    session.code=record.data.code;session.version=record.version;session.dirty=record.dirty;
    $('editor').value=record.data.code;$('title').value=record.data.title;$('completed').checked=record.data.completed;
    runState=record.data.runState;$('code-length').textContent=`${record.data.code.length.toLocaleString()} / 20,000자`;
    renderSaveState(record);return true;
  }catch(error){if(session.current(snapshot)){// Retain local content even when the server read fails.
    $('editor').value=record.data.code;$('title').value=record.data.title;session.code=record.data.code;
    renderSaveState(record);showError(error);
  }return false;}
  finally{if(session.current(snapshot)){loading=!!user&&!identity;$('editor').readOnly=loading;changed();summary();renderCodeChoices();}}
}
async function reloadWorkspace() {
  const record=getRecord(workspace),space=scope();
  if(record.saving){notice('진행 중인 저장 결과를 확인한 뒤 다시 불러와 주세요.',true);return;}
  if(record.dirty){
    if(!await confirmAction('클라우드 기록 다시 불러오기','현재 초안을 파일로 보관한 뒤 클라우드 저장본으로 바꿉니다. 자동으로 덮어쓰지 않습니다.','초안 내려받고 불러오기'))return;
    if(!scopeCurrent(space))return;download(record.data.code,record.data.title,workspace);record.discard();
  }
  await loadWorkspace(workspace,true);
}
async function refreshIdentity() {
  const request=++identityRequest,generation=scopeGeneration,uid=user?.uid;
  if(!uid)return;
  const result=await bounded(cloud.identity(user,selectedSpace));
  if(request!==identityRequest||generation!==scopeGeneration||user?.uid!==uid)return;
  identity=result;
  selectedSpace=identity.spaceId;
  const teacher=!!identity.staff?.classIds?.length;
  const personal=selectedSpace==='personal';
  $('teacher-tab').hidden=!teacher;
  $('learning-space-panel').hidden=false;
  $('learning-space').replaceChildren(...identity.spaces.map(space=>new Option(space.title,space.id)));
  $('learning-space').value=selectedSpace;
  $('space-title').textContent=identity.spaceTitle;
  $('enrollment-heading').textContent=personal?'개인 코드 보관함 시작':identity.spaceTitle+' 학급 등록';
  $('class-select').replaceChildren(...identity.classes.map(c=>new Option(c.title,c.id)));
  $('class-select').closest('label').hidden=personal;
  const cancelled=identity.profile?.status==='cancelled';
  $('class-select').disabled=!!identity.profile&&!cancelled;
  if(identity.profile)$('class-select').value=identity.profile.classId;
  $('registration-name-label').hidden=personal||!!identity.profile&&!cancelled;
  $('registration-name').value=identity.profile?.displayName||user.displayName||'';
  $('register').textContent=cancelled?'학급 재신청':'학급 등록 요청';
  renderMembership();
  $('register').hidden=personal||!!identity.profile&&!cancelled;
  $('register-personal').hidden=!!identity.profile;
  $('enrollment').hidden=!!identity.profile||teacher;
  $('student-area').hidden=false;
  if(identity.profile?.status==='approved') {
    $('student-area').hidden=false;
    $('submit').hidden=personal;
    notice(identity.spaceTitle+'에 연결되었습니다. 자리를 떠나기 전에 저장 상태를 확인하고 로그아웃하세요.');
    // A student can start typing while account/approval requests are in flight.
    // Retain those edits; optimistic version checks protect an older cloud copy.
    await loadWorkspace(workspace);
    if(request!==identityRequest||generation!==scopeGeneration||user?.uid!==uid)return;
    await refreshCodeChoices();
    if(request!==identityRequest||generation!==scopeGeneration||user?.uid!==uid)return;
    if(new URLSearchParams(location.search).get('panel')==='library') await showLibrary();
  } else if(identity.profile) {
    $('enrollment').hidden=false;
    notice(cancelled?'등록이 취소되었습니다. 이름과 학급을 확인해 재신청하세요. 이전 학습 기록은 보존됩니다.':identity.profile.status==='pending'?'학급 승인 대기 중입니다. 선생님 승인 후 승인 상태 새로고침을 눌러 주세요.':'이 학급은 이용 중지 상태입니다. 선생님께 문의하세요.',true);
  } else if(!teacher) {
    notice(personal?'개인 학습자로 시작 버튼을 누르면 학급 등록 없이 코드를 저장할 수 있습니다.':identity.spaceTitle+' 학급을 선택해 등록 요청을 눌러 주세요.');
  }
  if(!canWrite())await loadWorkspace(workspace);
  if(request!==identityRequest||generation!==scopeGeneration||user?.uid!==uid)return;
  changed('identity');
  if(teacher) {
    $('enrollment').hidden=true;
    const previousClass=$('teacher-class').value;
    $('teacher-class').replaceChildren(...identity.teacherClasses.map(c=>new Option(c.title,c.id)));
    if(identity.teacherClasses.some(c=>c.id===previousClass)) $('teacher-class').value=previousClass;
    if(!canWrite()) {notice('교사 계정으로 로그인했습니다. 학년도·학년·반을 선택해 명단을 확인하세요.');await showTeacher();}
  }
}
async function logout(automatic=false,remote=false) {
  if(loggingOut)return;
  if(!user){if(!remote&&!await protectDraft())return;wipe();notice('이 PC의 임시 학습 내용을 지웠습니다.');changed('logout');return;}
  if(!cloud)return;
  loggingOut=true;
  if(automatic||remote) {
    try {await bounded(saveAll(),5000);} catch {}
    if(hasUnsaved()) {noticeAfterLogout='공용 PC 보호를 위해 로그아웃했습니다. 연결 문제로 마지막 코드·보고서·오답 변경 사항은 클라우드에 저장되지 않았습니다.';}
    else noticeAfterLogout='공용 PC 보호를 위해 로그아웃했습니다.';
  } else if(!await protectDraft()) {loggingOut=false;return;}
  if(!remote) channel?.postMessage({type:'logout'});
  wipe();user=null;identity=null;
  try {await cloud.logout();} catch {noticeAfterLogout='로그아웃 연결을 마치지 못해 현재 화면과 임시 코드를 지웠습니다. 탭을 닫아 주세요.';}
  $('identity').textContent='로그인하지 않음';$('login').hidden=false;$('logout').hidden=true;
  notice(noticeAfterLogout||'로그아웃하고 이 탭의 개인 학습 내용을 지웠습니다. 공용 PC에서는 Google 계정도 확인해 주세요.');noticeAfterLogout='';loggingOut=false;
}
async function showLibrary() {
  if(!canWrite()) {notice('로그인과 학급 승인이 필요합니다.',true);return;}
  const snapshot=session.checkpoint(),space=scope(),items=await bounded(identity.service.list(user.uid));if(!session.current(snapshot)||!scopeCurrent(space)) return;
  libraryItems=items;renderCodeChoices();
  $('library-list').replaceChildren();
  if(!items.length) $('library-list').textContent='아직 저장한 코드가 없습니다.';
  for(const item of items) {
    const row=document.createElement('div');row.className='entry';
    const text=document.createElement('span');text.textContent=`${item.title} · ${date(item.savedAt)}${item.completed?' · 완료':''}`;
    const actions=document.createElement('div');actions.className='toolbar';
    actions.append(button('열기',()=>changed('open-record',{id:item.workspaceId})),button(recordKind(item.workspaceId)==='code'?'.py 다운로드':'기록 내려받기',()=>download(item.code,item.title,item.workspaceId)),button('삭제',async()=>{
      if(!await confirmAction('저장한 코드 삭제',`“${item.title}”의 현재 저장본을 삭제합니다. 최근 수정 이력은 복원용으로 남습니다.`,'현재 저장본 삭제')) return;
      if(!scopeCurrent(space)||!await protectDraft())return;
      await mutateRecord(space,item.workspaceId,'delete',null,item.version);
      if(!session.current(snapshot)||!scopeCurrent(space)) return;
      records.get(item.workspaceId)?.reset();records.delete(item.workspaceId);if(drafts.has(item.workspaceId)){drafts.get(item.workspaceId).reset();changed('draft-reload');}
      if(item.workspaceId===workspace) await loadWorkspace(workspace,true);await showLibrary();
    }));row.append(text,actions);$('library-list').append(row);
  }
  $('library-panel').hidden=false;$('library-panel').scrollIntoView({behavior:'smooth'});
}
async function showHistory() {
  const snapshot=session.checkpoint(),id=workspace,items=await bounded(identity.service.revisions(user.uid,id));if(!session.current(snapshot)) return;
  $('history-list').replaceChildren();
  if(!items.length) $('history-list').textContent='저장 이력이 없습니다.';
  for(const item of items) {
    const row=document.createElement('div');row.className='entry';const text=document.createElement('span');text.textContent=`${item.title} · ${date(item.savedAt)} · ${item.version}번째 저장`;
    row.append(text,button('이 기록으로 복원',async()=>{
      if(!session.current(snapshot)) return;
      if(!await confirmAction('이전 기록 복원','이전 기록을 복원합니다. 현재 변경 사항은 먼저 파일로 보관해 주세요.','편집기에 복원')) return;
      $('editor').value=item.code;$('title').value=item.title;$('completed').checked=item.completed;runState=item.runState;dirty();
      $('history-panel').hidden=true;changed();notice('이전 기록을 복원했습니다. 지금 저장을 눌러 클라우드에 반영하세요.');
    }));$('history-list').append(row);
  }
  $('history-panel').hidden=false;
}
async function showTeacher() {
  if(!identity?.staff) return;
  $('teacher-area').hidden=false;const snapshot=session.checkpoint(),classId=$('teacher-class').value;
  if(!classId) {notice('활성화된 담당 학급이 없습니다.',true);return;}
  const students=await bounded(cloud.students(classId));if(!session.current(snapshot)||$('teacher-class').value!==classId) return;
  $('student-list').replaceChildren();$('student-details').replaceChildren();
  const visibleStudents=students.filter(student=>student.uid!==user.uid&&($('show-cancelled').checked||student.status!=='cancelled'));
  const pendingCount=visibleStudents.filter(student=>student.status==='pending').length;
  $('roster-summary').textContent=visibleStudents.length
    ? '등록 '+visibleStudents.length+'명 · 승인 대기 '+pendingCount+'명 · 정보 변경 요청 '+visibleStudents.filter(s=>s.changeRequest?.status==='pending').length+'명'
    : '등록된 학생이 없습니다.';
  for(const student of visibleStudents) {
    const row=document.createElement('tr'),name=document.createElement('td'),status=document.createElement('td'),actions=document.createElement('td');
    name.textContent=`${student.displayName} (${student.email})`;status.textContent=({approved:'승인됨',pending:'승인 대기',blocked:'이용 중지',cancelled:'등록 취소'})[student.status]||student.status;
    const mkClass=!student.classKey.startsWith('2026:class-2-');
    const current=()=>session.current(snapshot)&&$('teacher-class').value===classId&&!!identity?.staff;
    const process=async(action,input={})=>{
      if(!current())throw Error('계정 또는 학급이 바뀌었습니다. 명단을 다시 열어 주세요.');
      await bounded(cloud.manageMembership(student.uid,student.classKey,action,input,student));
      if(current())await showTeacher();
    };
    for(const [label,value] of [[student.status==='blocked'?'이용 중지 해제':'승인','approved'],[student.status==='cancelled'?'등록 복구 · 승인 대기':'승인 대기','pending'],['이용 중지','blocked']]) {
      if(student.status==='cancelled'&&value!=='pending')continue;
      const b=button(label,async()=>{if(await confirmAction('학생 승인 상태 변경',`${student.displayName} 학생의 상태를 “${label}”으로 변경합니다. 처리 중인 정보 변경 요청은 취소됩니다.`,label)){
        if(!current())return;
        if(mkClass)await process('status',{status:value});else {await cloud.approve(student.uid,value,student.classKey);if(current())await showTeacher();}
      }});
      b.disabled=value===student.status;actions.append(b);
    }
    if(mkClass) {
      if(student.status!=='cancelled')actions.append(button('등록 취소',async()=>{
        if(await confirmAction('학급 등록 취소',`${student.displayName} 학생을 등록 명단에서 제외합니다. 학습 기록은 삭제하지 않습니다. 재신청 또는 등록 복구 후 다시 승인할 수 있습니다.`, '등록 취소'))await process('cancel');
      }));
      const request=student.changeRequest;
      if(request?.status==='pending') {
        const compare=document.createElement('p');compare.className='membership-comparison';
        compare.textContent=`정보 변경 요청: ${student.displayName} · ${classLabel(student.classId)} → ${request.displayName} · ${classLabel(request.classId)}`;actions.append(compare);
        if(['pending','approved'].includes(student.status)) {
          actions.append(button('정보 변경 승인',async()=>{
            if(await confirmAction('정보 변경 승인',compare.textContent+' · 기존 학급 승인 상태는 유지됩니다.','변경 승인'))await process('approve');
          }),button('정보 변경 반려',async()=>{const note=await membershipNote();if(note!==null)await process('reject',{note});}));
        }
      }
      actions.append(button('회원 처리 이력',async()=>{
        const history=await bounded(cloud.membershipHistory(student.uid,student.classKey));if(!current())return;
        const target=$('student-details');target.replaceChildren();const h=document.createElement('h2');h.textContent=student.displayName+' 회원 처리 이력 · 최근 30건';target.append(h);
        if(!history.length){const p=document.createElement('p');p.textContent='이 기능 적용 이후의 처리 이력이 없습니다.';target.append(p);}
        for(const item of history){const p=document.createElement('p');p.textContent=`${date(item.at)} · ${membershipActionLabel(item.action)} · ${item.before.displayName} ${classLabel(item.before.classId)} (${statusLabel(item.before.status)}) → ${item.after.displayName} ${classLabel(item.after.classId)} (${statusLabel(item.after.status)})${item.after.changeRequest?.note?' · 사유: '+item.after.changeRequest.note:''}`;target.append(p);}
      }));
    }
    actions.append(button('학습·제출 확인',async()=>{
      const details=await bounded(cloud.teacherDetails(student.uid,student.classKey));if(!current()) return;
      const target=$('student-details');target.replaceChildren();const h=document.createElement('h2');h.textContent=`${student.displayName} 학생의 학습 현황`;target.append(h);
      const last=document.createElement('p');last.textContent=`마지막 저장·제출: ${date(details.quota?.updatedAt)} · 오늘 저장·제출 횟수: ${details.quota?.count||0}`;target.append(last);
      for(const p of details.progress) {const line=document.createElement('p');line.textContent=`${labels.get(p.workspaceId)||p.workspaceId} · ${p.completed?'완료':'학습 중'} · ${p.runState==='success'?'마지막 실행 성공':p.runState==='error'?'마지막 실행 오류':'실행 전'} · ${date(p.savedAt)}`;target.append(line);}
      if(!details.submissions.length) {const p=document.createElement('p');p.textContent='제출된 코드가 없습니다.';target.append(p);}
      for(const submission of details.submissions) {const title=document.createElement('h3'),code=document.createElement('pre');title.textContent=`제출: ${submission.title} · ${date(submission.savedAt)}`;code.textContent=submission.code;target.append(title,code);}
    }));row.append(name,status,actions);$('student-list').append(row);
  }
}
function action(id,fn) {$(id).addEventListener('click',()=>Promise.resolve().then(fn).catch(showError));}

function classLabel(id){return String(id||'').replace(/^class-([12])-(\d+)$/,'$1학년 $2반');}
function statusLabel(status){return ({approved:'승인됨',pending:'승인 대기',blocked:'이용 중지',cancelled:'등록 취소'})[status]||status;}
function membershipActionLabel(action){return ({request:'정보 변경 요청',approve:'정보 변경 승인',reject:'정보 변경 반려',withdraw:'변경 요청 취소',cancel:'등록 취소',reapply:'학급 재신청',status:'승인 상태 변경'})[action]||action;}
function renderMembership(){
  const p=identity?.profile,eligible=!!p&&!identity.staff&&selectedSpace!=='personal';
  $('member-info').hidden=!eligible;
  if(!eligible){$('membership-panel').hidden=true;return;}
  $('membership-current').textContent=`${identity.spaceTitle} · ${p.displayName} · ${classLabel(p.classId)} · ${statusLabel(p.status)}`;
  $('membership-name').value=p.displayName;
  $('membership-class').replaceChildren(...identity.classes.map(c=>new Option(c.title,c.id)));
  $('membership-class').value=p.classId;
  const pending=p.changeRequest?.status==='pending',allowed=['approved','pending'].includes(p.status);
  $('membership-request').disabled=pending||!allowed;
  $('membership-name').disabled=pending||!allowed;$('membership-class').disabled=pending||!allowed;
  $('membership-withdraw').hidden=!pending||!allowed;
  const r=p.changeRequest;
  $('membership-result').textContent=r?`${membershipActionLabel(r.status==='pending'?'request':r.status==='approved'?'approve':r.status==='rejected'?'reject':'withdraw')}: ${r.displayName} · ${classLabel(r.classId)}${r.note?' · 사유: '+r.note:''}`:'변경 요청이 없습니다.';
}
function membershipNote(){
  const dialog=$('membership-note-dialog');$('membership-note').value='';
  return new Promise(resolve=>{const done=value=>{dialog.close();resolve(value);};
    $('membership-note-form').onsubmit=e=>{e.preventDefault();const note=$('membership-note').value.trim();if(note)done(note);};
    $('membership-note-cancel').onclick=()=>done(null);dialog.oncancel=e=>{e.preventDefault();done(null);};dialog.showModal();$('membership-note').focus();
  });
}
action('member-info',()=>{$('membership-panel').hidden=false;$('membership-panel').scrollIntoView({block:'start'});});
action('membership-refresh',async()=>{if(await protectDraft())await refreshIdentity();});
for(const [id,kind] of [['membership-request','request'],['membership-withdraw','withdraw']])action(id,async()=>{
  if(!await protectDraft())return;
  const snapshot=scope(),expected=identity?.profile,input={displayName:$('membership-name').value,classId:$('membership-class').value};
  if(!expected)return;
  $(id).disabled=true;
  try {await bounded(cloud.membership(user,selectedSpace,kind,input,expected));if(scopeCurrent(snapshot))await refreshIdentity();}
  finally {if(scopeCurrent(snapshot))renderMembership();}
});

action('login',async()=>{if(!await protectDraft())return;if(!cloud){notice('아직 Google 로그인 연결을 준비하고 있습니다.',true);return;}await cloud.login();});
action('new-code',()=>createCode());action('save-as',()=>createCode(true));
action('logout',()=>logout());action('finish',()=>logout());action('save',async()=>{if(loading){notice('코드를 불러온 뒤 저장해 주세요.');return;}if(!canWrite()){notice('Google 로그인 후 개인 학습을 시작하거나 학급 승인을 확인하세요.',true);return;}await save();});action('library-tab',showLibrary);action('teacher-tab',showTeacher);
action('refresh-students',showTeacher);$('show-cancelled').onchange=()=>showTeacher().catch(showError);$('teacher-class').onchange=()=>showTeacher().catch(showError);
action('register',async()=>{
  if(!$('class-select').value)throw Error('등록 가능한 학급이 없습니다.');
  const snapshot=scope(),input={displayName:$('registration-name').value,classId:$('class-select').value};
  $('register').disabled=true;
  try {if(identity?.profile?.status==='cancelled')await cloud.membership(user,selectedSpace,'reapply',input,identity.profile);
    else await cloud.register(user,input.classId,selectedSpace,input.displayName);
    if(scopeCurrent(snapshot))await refreshIdentity();
  } finally {$('register').disabled=false;}
});
action('register-personal',async()=>{
  if(!await protectDraft())return;
  const snapshot=scope();
  await cloud.registerPersonal(user);
  if(!scopeCurrent(snapshot))return;
  wipe(user.uid);
  selectedSpace='personal';
  await refreshIdentity();
});
$('learning-space').onchange=async()=>{
  const selector=$('learning-space'),nextSpace=selector.value;
  selector.disabled=true;
  try {
    if(!await protectDraft()) {selector.value=selectedSpace;return;}
    wipe(user.uid);
    identity=null;
    selectedSpace=nextSpace;
    await refreshIdentity();
  } catch(error) {showError(error);}
  finally {selector.disabled=false;}
};
action('refresh-approval',async()=>{if(await protectDraft())await refreshIdentity();});
action('save-all',saveAll);action('backup-all',()=>downloadDrafts());
action('download',()=>download());action('copy',async()=>{await navigator.clipboard.writeText($('editor').value);notice('코드를 복사했습니다.');});
action('reset',async()=>{if(await confirmAction('편집기 초기화','편집기의 코드를 비웁니다. 이전 저장본은 수정 이력에서 복원할 수 있습니다.','코드 비우기')){$('editor').value='';runState='idle';dirty();}});
action('load-example',async()=>{
  const example=activityById.get(workspace);
  if(!example){notice('이전 과정 기록에는 새 수업 예제를 덮어쓰지 않습니다. 차시별 실습에서 새 활동을 여세요.');return;}
  if(!await protectDraft())return;
  if($('editor').value&& !await confirmAction('기본 예제 불러오기','현재 편집기를 이 활동의 기본 예제로 바꿉니다. 저장 기록은 이전 저장본에 남습니다.','예제 불러오기'))return;
  $('editor').value=example.code;$('stdin').value=example.stdin||'';runState='idle';dirty();changed();
});
action('cloud-reload',reloadWorkspace);action('history',showHistory);
action('submit',async()=>{if(identity?.profile?.userType==='personal')throw Error('개인 학습자는 교사 제출 대신 내 코드 보관함을 사용합니다.');
  if(!canWrite()||loading)throw Error('로그인과 학급 승인을 확인하고 코드를 불러온 뒤 제출해 주세요.');
  if(!await confirmAction('선생님께 코드 제출','현재 편집기의 코드가 담당 선생님께 전달됩니다. 자동 저장본과 별도로 제출합니다.','현재 코드 제출'))return;
  if(!canWrite()||!identity.profile.classId)return;
  const snapshot=session.checkpoint(),space=scope(),data={title:$('title').value.trim()||labels.get(workspace),code:snapshot.code,runState,completed:$('completed').checked,classId:identity.profile.classId};
  await mutateRecord(space,workspace,'submit',data,snapshot.version);
  if(scopeCurrent(space)&&session.current(snapshot))notice('현재 코드를 선생님께 제출했습니다.');
});
async function executeCurrent(){
  if(runner||loading)return;
  const snapshot=session.checkpoint(),code=$('editor').value;
  if(!code.trim())throw Error('코드를 먼저 입력해 주세요.');if(code.length>MAX_CODE)throw Error('코드는 20,000자 이내로 작성하세요.');
  $('run').disabled=true;$('stop').disabled=false;$('editor').readOnly=true;$('output').textContent='';$('plot').hidden=true;$('turtle-result').hidden=true;$('trace-body').replaceChildren();$('run-state').textContent='실행 준비 중…';
  try {
    runner=runPython(code,$('stdin').value,text=>{if(session.current(snapshot))$('run-state').textContent=text;});
    const result=await runner.promise;if(!session.current(snapshot))return;
    $('output').textContent=result.output+(result.error?'\n'+result.error:'')||'오류 없이 실행되었습니다. (print 출력 없음)';
    if(result.picture){$('plot').src='data:image/png;base64,'+result.picture;$('plot').hidden=false;}
    if(result.turtle.length){drawTurtle($('turtle-canvas'),result.turtle);$('turtle-result').hidden=false;}
    for(const step of result.trace){const row=document.createElement('tr');for(const value of [step.line,step.values||'아직 지정한 변수 없음']){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}$('trace-body').append(row);}
    $('run-state').textContent=result.error?'실행 오류':'실행 성공';runState=result.error?'error':'success';if(canWrite())dirty();
    changed('output');return result;
  }catch(error){if(session.current(snapshot)){$('output').textContent=String(error.message||error);$('run-state').textContent='실행 오류';runState='error';if(canWrite())dirty();changed('output');}throw error;}
  finally{if(session.current(snapshot)){runner=null;$('run').disabled=false;$('stop').disabled=true;$('editor').readOnly=false;}}
}
action('run',executeCurrent);
action('stop',()=>runner?.stop());
$('editor').addEventListener('input',()=>{runState='idle';dirty();});$('title').addEventListener('input',dirty);$('completed').addEventListener('change',dirty);
$('editor').addEventListener('keydown',event=>{if(event.key==='Tab'&&!event.shiftKey&&!event.ctrlKey&&!event.altKey){event.preventDefault();const e=event.target,start=e.selectionStart;e.setRangeText('    ',start,e.selectionEnd,'end');dirty();}});
$('workspace').onchange=()=>changed('open-record',{id:$('workspace').value});
$('import').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>80000)throw Error('파일이 너무 큽니다. 최대 20,000자 코드만 불러올 수 있습니다.');const code=await file.text();if(code.length>MAX_CODE)throw Error('코드가 20,000자를 초과했습니다.');if(!await protectDraft())return;$('editor').value=code;runState='idle';dirty();}catch(error){showError(error);}finally{event.target.value='';}};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).hidden=true);
for(const event of ['pointerdown','keydown','touchstart'])addEventListener(event,e=>{if(e.isTrusted)activity();},{passive:true});
setInterval(()=>{
  if(!user||loggingOut)return;
  const idle=Date.now()-lastActivity;
  if(idle>15*60000)logout(true).catch(showError);
  else if(idle>14*60000&&!idleSaveAttempted){
    document.body.classList.add('idle-private');dispatchEvent(new CustomEvent('mk-idle'));
    idleSaveAttempted=true;
    notice('1분 뒤 자동 로그아웃합니다. 계속 학습하려면 화면을 누르세요. 코드·보고서와 오답 기록의 저장 상태를 확인하세요.',true);
    if(hasUnsaved())saveAll().catch(error=>notice('자동 로그아웃 전 저장에 실패했습니다. 코드와 오답 기록을 내려받거나 인터넷 연결을 복구해 주세요. '+readableError(error),true));
  }
},10000);
addEventListener('offline',()=>{if(user)state('인터넷 연결 끊김 · 미저장 학습물 내려받기로 코드·보고서·답안을 보관해 주세요.',true);});
addEventListener('online',()=>{if(canWrite()){notice('인터넷 연결이 복구되었습니다. 저장을 다시 시도합니다.');saveAll().catch(showError).finally(()=>scheduleSave(true));}});
addEventListener('beforeunload',event=>{if(hasUnsaved()){event.preventDefault();event.returnValue='';}});
channel?.addEventListener('message',event=>{if(event.data?.type==='logout')logout(true,true).catch(showError);});

try {
  const response=await fetch('./student-config.json',{cache:'no-store'});if(!response.ok)throw Error('학습실 설정을 읽지 못했습니다.');const config=await response.json();
  if(!config.enabled||!config.firebase) {notice('개인 학습실의 Google 로그인·클라우드 저장 연결을 준비하고 있습니다. 기존 수업은 수업 안내에서 이용할 수 있습니다.');$('login').disabled=true;}
  else {
    cloud=createCloud(config.firebase,config.emulator===true);
    cloud.observe(async current=>{
      const initialAnonymous=!authObserved&&!current;authObserved=true;
      wipe(current?.uid||null,{initialAnonymous});user=current;identity=null;lastActivity=Date.now();
      $('identity').textContent=current?`${current.displayName||'학생'} · ${current.email}`:'로그인하지 않음';$('login').hidden=!!current;$('logout').hidden=!current;
      if(current){try{await refreshIdentity();}catch(error){showError(error);$('enrollment').hidden=false;$('register').hidden=true;$('register-personal').hidden=true;}}
      else {notice(noticeAfterLogout||'로그인 없이 실행할 수 있습니다. Google 로그인 후 학교 또는 개인 공간에 코드를 저장하세요.');await loadWorkspace(workspace);changed('identity');}
    });
  }
} catch(error) {showError(error);$('login').disabled=true;}

export const room={
  open:loadWorkspace,leavePage,confirm:confirmAction,guard:protectDraft,canWrite,save,saveAll,hasUnsaved,scope,scopeCurrent,activity,logout,execute:executeCurrent,
  current:()=>workspace,isLoading:()=>loading,identityLoading:()=>!!user&&!identity,
  registerDraft(id,draft){drafts.set(id,draft);return()=>drafts.delete(id);},
  draftChanged(){scheduleSave();},
  setText(text){$('editor').value=text;dirty();},
  async history(id,snapshot=scope()){
    if(!canWrite()||!scopeCurrent(snapshot))throw Error('로그인과 학습 공간을 확인해 주세요.');
    const items=await bounded(snapshot.store.revisions(snapshot.uid,id));
    if(!scopeCurrent(snapshot))return [];return items;
  },
  async readRecord(id,snapshot=scope()){
    if(!canWrite())throw Error('로그인 후 승인된 학교 공간 또는 개인 공간을 선택하세요.');
    if(!scopeCurrent(snapshot))throw Object.assign(Error('학습 공간이 바뀌었습니다.'),{code:'stale-scope'});
    const data=await bounded(snapshot.store.load(snapshot.uid,id));
    if(!scopeCurrent(snapshot))throw Object.assign(Error('학습 공간이 바뀌었습니다.'),{code:'stale-scope'});return data;
  },
  async writeRecord(id,code,version,snapshot=scope()){
    if(!canWrite())throw Error('로그인 후 승인된 학교 공간 또는 개인 공간을 선택하세요.');
    if(code.length>MAX_CODE)throw Error('학습 기록은 최대 20,000자까지 저장할 수 있습니다. 내용을 줄이거나 내려받아 보관하세요.');
    return mutateRecord(snapshot,id,'save',{code,title:labels.get(id),completed:false,runState:'idle'},version);
  }
};

