import { createCloud, readableError, MAX_CODE, SAVE_INTERVAL } from './student-cloud.bundle.js';
import { StudentSession, clearTemporaryLessons } from './student-session.js';
import { runPython, drawTurtle } from './student-run.js';
import { activities, activityById } from './content.js';

const $=id=>document.getElementById(id), session=new StudentSession();
clearTemporaryLessons();
let selectedSpace=null;
let cloud,user=null,identity=null,workspace='scratch-01',busy=false,runner=null,autoTimer,lastActivity=Date.now(),lastWrite=0;
let runState='idle',loading=false,loggingOut=false,noticeAfterLogout='',idleSaveAttempted=false;
const channel='BroadcastChannel' in window ? new BroadcastChannel('englishmath-shared-pc') : null;
const labels=new Map([
  ...activities.map(a=>[a.id,a.title]),
  ['mk3-report','탐구 보고서'],['mk3-notebook','복습 오답 기록'],
  ['lesson-00','이전 과정 · 00 복습'],
  ...Array.from({length:10},(_,i)=>[`lesson-${String(i+1).padStart(2,'0')}`,`이전 과정 · 실습 ${i+1}`]),
  ...['a','b','c','d'].map(k=>['inquiry-'+k,'이전 과정 · 탐구실 '+k.toUpperCase()]),
  ...Array.from({length:10},(_,i)=>[`scratch-${String(i+1).padStart(2,'0')}`,`자유 실습 ${i+1}`])]);
function changed(kind='record'){dispatchEvent(new CustomEvent('mk-session',{detail:{kind,workspace,canWrite:!!canWrite()}}));}
for(const [id,label] of labels) $('workspace').add(new Option(label,id));
const requested=new URLSearchParams(location.search).get('workspace');
if(labels.has(requested)) workspace=requested;
$('workspace').value=workspace;

function notice(text,error=false) { $('notice').textContent=text;$('notice').classList.toggle('error',error); }
function state(text,error=false) { $('save-state').textContent=text;$('save-state').classList.toggle('error',error); }
function canWrite() { return user && identity?.profile?.status==='approved'; }
function date(value) {return value?.toDate?.().toLocaleString('ko-KR') || '기록 없음';}
function button(label,action) {const b=document.createElement('button');b.textContent=label;b.addEventListener('click',()=>Promise.resolve().then(action).catch(showError));return b;}
function showError(error) {
  const message=readableError(error);
  if(user&&session.dirty&&!loggingOut&&Date.now()-lastActivity>14*60000)notice('자동 로그아웃 전 저장에 실패했습니다. 1분 안에 .py 다운로드를 눌러 보관하거나 인터넷 연결을 복구해 주세요. '+message,true);
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
function download(code=$('editor').value,name=workspace) {
  const url=URL.createObjectURL(new Blob([code],{type:'text/x-python;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=name.replace(/[^\p{L}\p{N}_-]/gu,'_')+(['mk3-report','mk3-notebook'].includes(workspace)?'.txt':'.py');link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function wipe(uid=null) {
  $('learning-space-panel').hidden=true;
  if(!uid) selectedSpace=null;
  session.change(uid);clearTimeout(autoTimer);runner?.stop();runner=null;busy=false;loading=false;runState='idle';lastWrite=0;
  $('editor').value='';$('title').value='';$('completed').checked=false;$('output').textContent='실행 결과가 여기에 표시됩니다.';
  $('plot').removeAttribute('src');$('plot').hidden=true;$('run-state').textContent='실행 대기';
  for(const id of ['history-list','library-list','student-list','student-details']) $(id).replaceChildren();
  for(const id of ['history-panel','library-panel','teacher-area','student-area','enrollment','teacher-tab']) $(id).hidden=true;
  $('stop').disabled=true;$('run').disabled=false;$('editor').readOnly=false;$('code-length').textContent='0 / 20,000자';
  if($('confirm-dialog').open) $('dialog-no').click();
  $('stdin').value='';$('turtle-result').hidden=true;$('trace-body').replaceChildren();$('student-area').hidden=false;changed('wipe');
}
function dirty() {
  if(loading) return;
  session.set($('editor').value);$('code-length').textContent=`${session.code.length.toLocaleString()} / 20,000자`;
  if(!canWrite()){state('이 화면에만 임시 보관 · 로그인 후 저장하거나 내려받으세요.');return;}
  state(session.code.length>MAX_CODE?'20,000자를 초과했습니다. 줄이거나 .py 파일로 보관하세요.':'저장 대기 · 이 화면을 유지하세요',session.code.length>MAX_CODE);
  clearTimeout(autoTimer);autoTimer=setTimeout(()=>save().catch(showError),Math.max(1000,SAVE_INTERVAL-(Date.now()-lastWrite)));
}
async function save() {
  if(!session.dirty)return true;
  if(!canWrite())return false;
  if(busy) return false;
  if(!navigator.onLine) throw Object.assign(Error('offline'),{code:'network'});
  if(session.code.length>MAX_CODE) throw Error('코드는 최대 20,000자까지 클라우드에 저장할 수 있습니다.');
  const snapshot=session.checkpoint(),id=workspace;
  const data={title:$('title').value.trim()||labels.get(id),code:snapshot.code,completed:$('completed').checked,runState};
  busy=true;state('클라우드에 저장 중…');
  try {
    const version=await bounded(identity.service.mutate(snapshot.uid,id,'save',data,snapshot.version));
    if(session.saved(snapshot,version)) {lastWrite=Date.now();state(session.dirty?'추가 변경 사항 저장 대기':`✓ 클라우드 저장 완료 · ${new Date().toLocaleTimeString('ko-KR')}`);}
    return !session.dirty;
  } catch(error) {if(session.current(snapshot)) state(readableError(error),true);throw error;}
  finally {if(session.current(snapshot)){busy=false;if(session.dirty){clearTimeout(autoTimer);autoTimer=setTimeout(()=>save().catch(showError),SAVE_INTERVAL);}}}
}
async function protectDraft() {
  if(!session.dirty) return true;
  try {if(await save()) return true;} catch(error) {showError(error);}
  if(await confirmAction('아직 저장하지 못한 코드가 있습니다','현재 코드를 .py 파일로 내려받은 뒤 이동할 수 있습니다. 다운로드한 파일은 다음에 불러올 수 있습니다.','.py 다운로드 후 이동')) {download();session.dirty=false;return true;}
  return false;
}
async function loadWorkspace(id,discard=false) {
  if(!labels.has(id)||loading)return false;
  if(!discard&&!await protectDraft()){$('workspace').value=workspace;return false;}
  runner?.stop();runner=null;busy=false;$('run').disabled=false;$('stop').disabled=true;
  session.change(user?.uid||null);const snapshot=session.checkpoint(),store=identity?.service;workspace=id;$('workspace').value=id;loading=true;
  $('editor').value='';$('editor').readOnly=true;$('title').value='';$('completed').checked=false;
  $('output').textContent='';$('plot').hidden=true;$('turtle-result').hidden=true;$('trace-body').replaceChildren();
  $('stdin').value=activityById.get(id)?.stdin||'';
  state(canWrite()?'클라우드에서 불러오는 중…':'로그인 없이 실행 · 아직 클라우드에 저장되지 않았습니다.');
  try {
    const saved=canWrite()?await bounded(store.load(snapshot.uid,id)):null;
    if(!session.current(snapshot))return false;
    // Only NEW course IDs have seeds. No legacy record is migrated or replaced.
    session.code=saved?saved.code:(activityById.get(id)?.code||'');session.version=saved?.version||0;
    lastWrite=Date.now();$('editor').value=session.code;$('title').value=saved?.title||labels.get(id);$('completed').checked=!!saved?.completed;
    runState=saved?.runState||'idle';$('code-length').textContent=`${session.code.length.toLocaleString()} / 20,000자`;
    state(saved?`✓ 불러옴 · ${date(saved.savedAt)}`:canWrite()?'새 활동 · 예제는 아직 저장하지 않았습니다.':'이 화면에만 임시 보관 · 로그인하면 개인 코드를 저장할 수 있습니다.');
    changed();return true;
  }catch(error){if(session.current(snapshot)){state('불러오기 실패 · 클라우드 다시 불러오기를 눌러 주세요.',true);showError(error);}return false;}
  finally{if(session.current(snapshot)){loading=false;$('editor').readOnly=false;}}
}
async function refreshIdentity() {
  const snapshot=session.checkpoint(),result=await bounded(cloud.identity(user,selectedSpace));
  if(!session.current(snapshot)) return;
  identity=result;
  selectedSpace=identity.spaceId;
  const teacher=!!identity.staff?.classIds?.length;
  const personal=selectedSpace==='personal';
  $('teacher-tab').hidden=!teacher;
  $('learning-space-panel').hidden=teacher;
  $('learning-space').replaceChildren(...identity.spaces.map(space=>new Option(space.title,space.id)));
  $('learning-space').value=selectedSpace;
  $('space-title').textContent=identity.spaceTitle;
  $('enrollment-heading').textContent=personal?'개인 코드 보관함 시작':identity.spaceTitle+' 학급 등록';
  $('class-select').replaceChildren(...identity.classes.map(c=>new Option(c.title,c.id)));
  $('class-select').closest('label').hidden=personal;
  $('class-select').disabled=!!identity.profile;
  $('register').hidden=personal||!!identity.profile;
  $('register-personal').hidden=!!identity.profile;
  $('enrollment').hidden=!!identity.profile||teacher;
  $('student-area').hidden=false;
  if(identity.profile?.status==='approved') {
    $('student-area').hidden=false;
    $('submit').hidden=personal;
    notice(identity.spaceTitle+'에 연결되었습니다. 자리를 떠나기 전에 저장 상태를 확인하고 로그아웃하세요.');
    await loadWorkspace(workspace,true);
    if(new URLSearchParams(location.search).get('panel')==='library') await showLibrary();
  } else if(identity.profile) {
    $('enrollment').hidden=false;
    notice(identity.profile.status==='pending'?'학급 승인 대기 중입니다. 선생님 승인 후 승인 상태 새로고침을 눌러 주세요.':'이 학급은 이용 중지 상태입니다. 선생님께 문의하세요.',true);
  } else if(!teacher) {
    notice(personal?'개인 학습자로 시작 버튼을 누르면 학급 등록 없이 코드를 저장할 수 있습니다.':identity.spaceTitle+' 학급을 선택해 등록 요청을 눌러 주세요.');
  }
  if(!canWrite())await loadWorkspace(workspace,true);
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
    try {await bounded(save(),5000);} catch {}
    if(session.dirty) {noticeAfterLogout='공용 PC 보호를 위해 로그아웃했습니다. 연결 문제로 마지막 변경 사항은 클라우드에 저장되지 않았습니다.';}
    else noticeAfterLogout='공용 PC 보호를 위해 로그아웃했습니다.';
  } else if(!await protectDraft()) {loggingOut=false;return;}
  if(!remote) channel?.postMessage({type:'logout'});
  wipe();user=null;identity=null;
  try {await cloud.logout();} catch {noticeAfterLogout='로그아웃 연결을 마치지 못해 현재 화면과 임시 코드를 지웠습니다. 탭을 닫아 주세요.';}
  $('identity').textContent='로그인하지 않음';$('login').hidden=false;$('logout').hidden=true;
  notice(noticeAfterLogout||'로그아웃했습니다. 이 화면의 개인 코드를 지웠습니다.');noticeAfterLogout='';loggingOut=false;
}
async function showLibrary() {
  if(!canWrite()) {notice('로그인과 학급 승인이 필요합니다.',true);return;}
  const snapshot=session.checkpoint(),items=await bounded(identity.service.list(user.uid));if(!session.current(snapshot)) return;
  $('library-list').replaceChildren();
  if(!items.length) $('library-list').textContent='아직 저장한 코드가 없습니다.';
  for(const item of items) {
    const row=document.createElement('div');row.className='entry';
    const text=document.createElement('span');text.textContent=`${item.title} · ${date(item.savedAt)}${item.completed?' · 완료':''}`;
    const actions=document.createElement('div');actions.className='toolbar';
    actions.append(button('열기',()=>loadWorkspace(item.workspaceId)),button('.py 다운로드',()=>download(item.code,item.title)),button('삭제',async()=>{
      if(!await confirmAction('저장한 코드 삭제',`“${item.title}”의 현재 저장본을 삭제합니다. 최근 수정 이력은 복원용으로 남습니다.`,'현재 저장본 삭제')) return;
      if(item.workspaceId===workspace&&!await protectDraft()) return;
      await identity.service.mutate(snapshot.uid,item.workspaceId,'delete',null,item.version);
      if(!session.current(snapshot)) return;
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
    row.append(text,button('이 코드로 복원',async()=>{
      if(!session.current(snapshot)) return;
      if(!await confirmAction('이전 코드 복원','이전 코드가 편집기에 복원됩니다. 현재 변경 사항이 필요하면 먼저 .py 파일로 내려받아 주세요.','편집기에 복원')) return;
      $('editor').value=item.code;$('title').value=item.title;$('completed').checked=item.completed;runState=item.runState;dirty();
      $('history-panel').hidden=true;notice('이전 코드를 편집기에 복원했습니다. 지금 저장을 눌러 클라우드에 반영하세요.');
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
  const visibleStudents=students.filter(student=>student.uid!==user.uid);
  const pendingCount=visibleStudents.filter(student=>student.status==='pending').length;
  $('roster-summary').textContent=visibleStudents.length
    ? '등록 '+visibleStudents.length+'명 · 승인 대기 '+pendingCount+'명'
    : '등록된 학생이 없습니다.';
  for(const student of students.filter(student=>student.uid!==user.uid)) {
    const row=document.createElement('tr'),name=document.createElement('td'),status=document.createElement('td'),actions=document.createElement('td');
    name.textContent=`${student.displayName} (${student.email})`;status.textContent=({approved:'승인됨',pending:'승인 대기',blocked:'이용 중지'})[student.status]||student.status;
    for(const [label,value] of [['승인','approved'],['승인 대기','pending'],['이용 중지','blocked']]) {
      const b=button(label,async()=>{if(await confirmAction('학생 승인 상태 변경',`${student.displayName} 학생의 상태를 “${label}”으로 변경합니다.`,label)){await cloud.approve(student.uid,value,student.classKey);await showTeacher();}});
      b.disabled=value===student.status||student.uid===user.uid;actions.append(b);
    }
    actions.append(button('학습·제출 확인',async()=>{
      const details=await bounded(cloud.teacherDetails(student.uid,student.classKey));if(!session.current(snapshot)) return;
      const target=$('student-details');target.replaceChildren();const h=document.createElement('h2');h.textContent=`${student.displayName} 학생의 학습 현황`;target.append(h);
      const last=document.createElement('p');last.textContent=`마지막 저장·제출: ${date(details.quota?.updatedAt)} · 오늘 저장·제출 횟수: ${details.quota?.count||0}`;target.append(last);
      for(const p of details.progress) {const line=document.createElement('p');line.textContent=`${labels.get(p.workspaceId)||p.workspaceId} · ${p.completed?'완료':'학습 중'} · ${p.runState==='success'?'마지막 실행 성공':p.runState==='error'?'마지막 실행 오류':'실행 전'} · ${date(p.savedAt)}`;target.append(line);}
      if(!details.submissions.length) {const p=document.createElement('p');p.textContent='제출된 코드가 없습니다.';target.append(p);}
      for(const submission of details.submissions) {const title=document.createElement('h3'),code=document.createElement('pre');title.textContent=`제출: ${submission.title} · ${date(submission.savedAt)}`;code.textContent=submission.code;target.append(title,code);}
    }));row.append(name,status,actions);$('student-list').append(row);
  }
}
function action(id,fn) {$(id).addEventListener('click',()=>Promise.resolve().then(fn).catch(showError));}
action('login',async()=>{if(!await protectDraft())return;if(!cloud){notice('아직 Google 로그인 연결을 준비하고 있습니다.',true);return;}await cloud.login();});
action('logout',()=>logout());action('finish',()=>logout());action('save',async()=>{if(!canWrite()){notice('Google 로그인 후 개인 학습을 시작하거나 학급 승인을 확인하세요.',true);return;}if(!session.dirty)session.set($('editor').value);await save();});action('library-tab',showLibrary);action('teacher-tab',showTeacher);
action('refresh-students',showTeacher);$('teacher-class').onchange=()=>showTeacher().catch(showError);
action('register',async()=>{if(!$('class-select').value)throw Error('등록 가능한 학급이 없습니다.');await cloud.register(user,$('class-select').value,selectedSpace);await refreshIdentity();});
action('register-personal',async()=>{
  await cloud.registerPersonal(user);
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
action('refresh-approval',refreshIdentity);
action('download',()=>download());action('copy',async()=>{await navigator.clipboard.writeText($('editor').value);notice('코드를 복사했습니다.');});
action('reset',async()=>{if(await confirmAction('편집기 초기화','편집기의 코드를 비웁니다. 이전 저장본은 수정 이력에서 복원할 수 있습니다.','코드 비우기')){$('editor').value='';runState='idle';dirty();}});
action('load-example',async()=>{
  const example=activityById.get(workspace);
  if(!example){notice('이전 과정 기록에는 새 수업 예제를 덮어쓰지 않습니다. 차시별 실습에서 새 활동을 여세요.');return;}
  if(!await protectDraft())return;
  if($('editor').value&& !await confirmAction('기본 예제 불러오기','현재 편집기를 이 활동의 기본 예제로 바꿉니다. 저장 기록은 이전 저장본에 남습니다.','예제 불러오기'))return;
  $('editor').value=example.code;$('stdin').value=example.stdin||'';runState='idle';dirty();changed();
});
action('cloud-reload',()=>loadWorkspace(workspace));action('history',showHistory);
action('submit',async()=>{if(identity?.profile?.userType==='personal')throw Error('개인 학습자는 교사 제출 대신 내 코드 보관함을 사용합니다.');
  if(!await confirmAction('선생님께 코드 제출','현재 편집기의 코드가 담당 선생님께 전달됩니다. 자동 저장본과 별도로 제출합니다.','현재 코드 제출'))return;
  const snapshot=session.checkpoint(),data={title:$('title').value.trim()||labels.get(workspace),code:snapshot.code,runState,completed:$('completed').checked,classId:identity.profile.classId};
  await bounded(identity.service.mutate(snapshot.uid,workspace,'submit',data,snapshot.version));
  if(session.current(snapshot)){lastWrite=Date.now();notice('현재 코드를 선생님께 제출했습니다.');}
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
    $('run-state').textContent=result.error?'실행 오류':'실행 성공';runState=result.error?'error':'success';dirty();
    return result;
  }catch(error){if(session.current(snapshot)){$('output').textContent=String(error.message||error);$('run-state').textContent='실행 오류';runState='error';dirty();}throw error;}
  finally{if(session.current(snapshot)){runner=null;$('run').disabled=false;$('stop').disabled=true;$('editor').readOnly=false;}}
}
action('run',executeCurrent);
action('stop',()=>runner?.stop());
$('editor').addEventListener('input',()=>{runState='idle';dirty();});$('title').addEventListener('input',dirty);$('completed').addEventListener('change',dirty);
$('editor').addEventListener('keydown',event=>{if(event.key==='Tab'&&!event.shiftKey&&!event.ctrlKey&&!event.altKey){event.preventDefault();const e=event.target,start=e.selectionStart;e.setRangeText('    ',start,e.selectionEnd,'end');dirty();}});
$('workspace').onchange=()=>loadWorkspace($('workspace').value).catch(showError);
$('import').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>80000)throw Error('파일이 너무 큽니다. 최대 20,000자 코드만 불러올 수 있습니다.');const code=await file.text();if(code.length>MAX_CODE)throw Error('코드가 20,000자를 초과했습니다.');if(!await protectDraft())return;$('editor').value=code;runState='idle';dirty();}catch(error){showError(error);}finally{event.target.value='';}};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).hidden=true);
for(const event of ['pointerdown','keydown','touchstart'])addEventListener(event,()=>{lastActivity=Date.now();idleSaveAttempted=false;},{passive:true});
setInterval(()=>{
  if(!user||loggingOut)return;
  const idle=Date.now()-lastActivity;
  if(idle>15*60000)logout(true).catch(showError);
  else if(idle>14*60000&&!idleSaveAttempted){
    idleSaveAttempted=true;
    notice('1분 뒤 자동 로그아웃합니다. 계속 학습하려면 화면을 누르세요. 저장 상태를 확인하고 필요한 코드는 .py로 직접 내려받아 주세요.',true);
    if(session.dirty)save().catch(error=>notice('자동 로그아웃 전 저장에 실패했습니다. 1분 안에 .py 다운로드를 눌러 보관하거나 인터넷 연결을 복구해 주세요. '+readableError(error),true));
  }
},10000);
addEventListener('offline',()=>{if(user)state('인터넷 연결 끊김 · 아직 저장되지 않은 코드를 .py로 내려받아 주세요.',true);});
addEventListener('online',()=>{if(canWrite()){notice('인터넷 연결이 복구되었습니다. 저장을 다시 시도합니다.');save().catch(showError);}});
addEventListener('beforeunload',event=>{if(session.dirty){event.preventDefault();event.returnValue='';}});
channel?.addEventListener('message',event=>{if(event.data?.type==='logout')logout(true,true).catch(showError);});

try {
  const response=await fetch('./student-config.json',{cache:'no-store'});if(!response.ok)throw Error('학습실 설정을 읽지 못했습니다.');const config=await response.json();
  if(!config.enabled||!config.firebase) {notice('개인 학습실의 Google 로그인·클라우드 저장 연결을 준비하고 있습니다. 기존 수업은 수업 안내에서 이용할 수 있습니다.');$('login').disabled=true;}
  else {
    cloud=createCloud(config.firebase,config.emulator===true);
    cloud.observe(async current=>{
      wipe(current?.uid||null);user=current;identity=null;lastActivity=Date.now();
      $('identity').textContent=current?`${current.displayName||'학생'} · ${current.email}`:'로그인하지 않음';$('login').hidden=!!current;$('logout').hidden=!current;
      if(current){try{await refreshIdentity();}catch(error){showError(error);}}
      else {notice(noticeAfterLogout||'로그인 없이 실행할 수 있습니다. Google 로그인 후 학교 또는 개인 공간에 코드를 저장하세요.');await loadWorkspace(workspace,true);changed('identity');}
    });
  }
} catch(error) {showError(error);$('login').disabled=true;}

export const room={
  open:loadWorkspace,guard:protectDraft,canWrite,save,logout,execute:executeCurrent,
  current:()=>workspace,
  setText(text){$('editor').value=text;dirty();},
  async readRecord(id){
    if(!canWrite())throw Error('로그인 후 승인된 학교 공간 또는 개인 공간을 선택하세요.');
    const snapshot=session.checkpoint(),store=identity.service,data=await bounded(store.load(snapshot.uid,id));
    if(!session.current(snapshot))throw Error('학습 공간이 바뀌어 이전 응답을 취소했습니다.');return data;
  },
  async writeRecord(id,code,version){
    if(!canWrite())throw Error('로그인 후 승인된 학교 공간 또는 개인 공간을 선택하세요.');
    if(!await protectDraft())throw Error('편집 중인 코드를 먼저 보관하세요.');
    const snapshot=session.checkpoint(),store=identity.service;
    const next=await bounded(store.mutate(snapshot.uid,id,'save',{code,title:labels.get(id),completed:false,runState:'idle'},version));
    if(!session.current(snapshot))throw Error('학습 공간이 바뀌었습니다. 저장 결과를 새 공간에 적용하지 않습니다.');
    lastWrite=Date.now();return next;
  }
};
