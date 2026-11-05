// Build a byte-faithful first-grade classroom copy from the proven 2nd-grade course.
// Large existing learning videos remain served through sw.englishmath.kr via Vercel rewrites.
// The original second-grade code, database and sw publisher are never changed.
import { mkdir, readdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const source = path.resolve('public/pandas-data-lab');
const target = path.resolve('mk-dist');
const textTypes = new Set(['.html','.js','.css','.json','.txt','.md','.py','.vtt','.svg','.xml']);
await rm(target, { recursive: true, force: true });
let count = 0;
async function copyDirectory(from, to, relative = '') {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    const rel = path.posix.join(relative, entry.name);
    // Avoid duplicating ~404 MB of video files; Vercel proxies these exact URLs
    // to the public second-grade video host, preserving video playback.
    if (rel === 'videos' || rel === 'learning-videos') continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) { await copyDirectory(src, dest, rel); continue; }
    if (!entry.isFile()) continue;
    if (textTypes.has(path.extname(entry.name))) {
      let text = await readFile(src, 'utf8');
      text = text.replaceAll('../learning-videos/', '/learning-videos/');
      text = text.replaceAll('/pico-lab-classroom/pandas-data-lab/', '/');
      text = text.replaceAll('/sw/pandas-data-lab/', '/');
      // MK-only presentation/flows. Never modify the live Grade-2 source files.
      if (rel === 'student-room.html') {
        const oldEnrollment = '<h1>내 학급 등록</h1><p>학교 Google 계정으로 로그인한 뒤 학급을 선택하세요. 선생님이 승인하면 개인 코드 저장을 사용할 수 있습니다.</p>';
        const newEnrollment = '<h1 id="enrollment-heading">학급 등록</h1><p id="enrollment-description">학교 학생은 선택한 학년도의 학급을 등록하고 승인받으세요. 개인 학습자는 학급 등록 없이 코드 보관함을 사용할 수 있습니다.</p>';
        if (!text.includes(oldEnrollment)) throw Error('MK enrollment heading missing');
        text = text.replace(oldEnrollment, newEnrollment);
        const oldButtons = '<button id="register">학급 등록 요청</button><button id="refresh-approval">';
        if (!text.includes(oldButtons)) throw Error('MK enrollment buttons missing');
        text = text.replace(oldButtons,'<button id="register">학급 등록 요청</button><button id="register-personal">개인 학습자로 시작 (승인 불필요)</button><button id="refresh-approval">');
        text = text.replace('<section id="enrollment"', '<section id="learning-space-panel" class="panel" hidden><label>학년도·학년 / 개인 학습 <select id="learning-space"></select></label><p>진급하면 새 학년도를 선택해 학급 등록을 요청하세요. 이전 학년도를 선택하면 당시 학습 기록을 불러올 수 있습니다.</p></section>\n<section id="enrollment"');
        text = text.replace('<span class="eyebrow">나의 학습 공간</span>', '<span id="space-title" class="eyebrow">나의 학습 공간</span>');
        text = text.replace('<h1>교사용 관리실</h1>','<h1>교사용 통합 관리실</h1>');
        text = text.replace('<label>담당 학급 <select id="teacher-class">','<label>관리할 학년도·학년·반 <select id="teacher-class">');
        text = text.replace('<div class="table-scroll">', '<p id="roster-summary" role="status"></p><div class="table-scroll">');
        text = text.replace('학교에서 시작한 코드를 집에서도 이어서 작성하세요.','학교와 집, 어느 곳에서든 내 코드를 이어서 작성하세요.');
      }
      if (rel === 'student-room.js') {
        const edits = [
          ["let cloud,user=null", "let selectedSpace=null;\nlet cloud,user=null"],
          ["function wipe(uid=null) {", "function wipe(uid=null) {\n  $('learning-space-panel').hidden=true;\n  if(!uid) selectedSpace=null;"],
          ["await cloud.approve(student.uid,value);","await cloud.approve(student.uid,value,student.classKey);"],
          ["cloud.teacherDetails(student.uid,student.classId)","cloud.teacherDetails(student.uid,student.classKey)"],
          ["await cloud.register(user,$('class-select').value)","await cloud.register(user,$('class-select').value,selectedSpace)"],
          ["action('refresh-approval',refreshIdentity);",
           `action('register-personal',async()=>{
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
action('refresh-approval',refreshIdentity);`],
          ["$('student-list').replaceChildren();$('student-details').replaceChildren();\n  for(const student", `$('student-list').replaceChildren();$('student-details').replaceChildren();
  const visibleStudents=students.filter(student=>student.uid!==user.uid);
  const pendingCount=visibleStudents.filter(student=>student.status==='pending').length;
  $('roster-summary').textContent=visibleStudents.length
    ? '등록 '+visibleStudents.length+'명 · 승인 대기 '+pendingCount+'명'
    : '등록된 학생이 없습니다.';
  for(const student`],
          ["action('submit',async()=>{",
           "action('submit',async()=>{if(identity?.profile?.userType==='personal')throw Error('개인 학습자는 교사 제출 대신 내 코드 보관함을 사용합니다.');"],
          ["else notice(noticeAfterLogout||'학교 Google 계정으로 로그인하면 개인 코드를 저장하고 다른 기기에서 이어서 학습할 수 있습니다.');",
           "else notice(noticeAfterLogout||'Google 계정으로 로그인하면 학교 학습자 또는 개인 학습자로 코드를 저장하고 다른 기기에서 이어서 학습할 수 있습니다.');"]
        ];
        for (const [from,to] of edits) {
          if (!text.includes(from)) throw Error('MK UI patch anchor missing: '+from.slice(0,80));
          text = text.replace(from,to);
        }
        const identityStart = text.indexOf('async function refreshIdentity() {');
        const identityEnd = text.indexOf('async function logout(', identityStart);
        if (identityStart < 0 || identityEnd < 0) throw Error('MK identity UI anchor missing');
        text = text.slice(0, identityStart) + `async function refreshIdentity() {
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
  $('student-area').hidden=true;
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
  if(teacher) {
    $('enrollment').hidden=true;
    const previousClass=$('teacher-class').value;
    $('teacher-class').replaceChildren(...identity.teacherClasses.map(c=>new Option(c.title,c.id)));
    if(identity.teacherClasses.some(c=>c.id===previousClass)) $('teacher-class').value=previousClass;
    if(!canWrite()) {notice('교사 계정으로 로그인했습니다. 학년도·학년·반을 선택해 명단을 확인하세요.');await showTeacher();}
  }
}
` + text.slice(identityEnd);
        // Each accepted identity carries its own store, so delayed identity responses
        // cannot redirect a save into another academic year or the personal space.
        text = text.replaceAll('cloud.service', 'identity.service');
      }
      await writeFile(dest, text, 'utf8');
    } else {
      await copyFile(src, dest);
    }
    count++;
  }
}
await copyDirectory(source, target);
// Override the copied Grade-2 SDK bundle with Grade-1 database routing.
// This does not modify public/pandas-data-lab nor the sw.englishmath.kr deployment.
await build({entryPoints:['mk/grade1-cloud.js'],outfile:path.join(target,'student-cloud.bundle.js'),
  bundle:true,minify:true,format:'esm',platform:'browser',target:['es2022'],legalComments:'eof'});

for (const needed of ['index.html','student-room.html','student-cloud.bundle.js','student-config.json','student-room.js']) {
  await readFile(path.join(target, needed));
}
await writeFile(path.join(target, 'mk-build-info.json'), JSON.stringify({
  site:'mk.englishmath.kr', from:'englishmath75/pico-lab-classroom',
  base:'public/pandas-data-lab', grade:'grade1-isolated-data',
  academicYears:[2026,2027], commit:process.env.VERCEL_GIT_COMMIT_SHA || null,
  sharedFirebaseProject:'englishmath-python-classroom', videoOrigin:'sw.englishmath.kr'
},null,2));
console.log('MK student classroom staged, '+count+' site files');
