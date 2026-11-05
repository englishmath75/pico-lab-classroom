// Build the first-grade classroom from the proven course, retaining lesson assets.
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
      if (path.extname(rel) === '.html') {
        text = text.replaceAll('고2 · 2026학년도 소프트웨어와 생활', '2026학년도 고1 정보');
        text = text.replaceAll('소프트웨어와 생활 · 3단원', '2026학년도 고1 정보');
        text = text.replace(/(<span class="classroom-unit">)[^<]*(<\/span>)/g, '$12026학년도 고1 정보$2');
        text = text.replace(/(<span class="classroom-subject">)[^<]*(<\/span>)/g, '$1Python 기초 · 데이터 탐구$2');
        text = text.replaceAll('<small>학생 개인 학습실</small>', '<small>2026학년도 고1 정보</small>');
        text = text.replaceAll('<small>고2 · 소프트웨어와 생활</small>', '<small>2026학년도 고1 정보</small>');
        text = text.replace(/(<a[^>]*class="curriculum-brand"[^>]*>[\s\S]*?<span>)[^<]*(<\/span>)/g, '$1Python 기초 · 데이터 탐구$2');
        text = text.replace(/<meta content="[^"]*" name="theme-color"\/?\s*>/, '<meta content="#292e2b" name="theme-color"/>');
        text = text.replace('</head>', '<link rel="stylesheet" href="/mk-theme.css?v=20261105">\n</head>');
      }
      if (rel === 'index.html') {
        text = text.replace('씨마스 소프트웨어와 생활 3단원 집중: Pandas 데이터 분석, 스포츠 기록, 인구 변화, 기말 대비 10차시 실습실', '영수쌤의 Python 교실 · 2026학년도 고1 정보. Python 코드를 직접 실행하고 나의 학습 기록을 이어가는 교실입니다.');
        text = text.replace('<h3>3단원 데이터 분석 수업</h3>', '<h3>한 줄의 코드에서<br/>시작하는 배움</h3>');
        text = text.replace('<p>표 만들기 → 자료 읽기 → 정리·분석 → 그래프 → 결과 해석</p>', '<p>Python 기초부터 데이터 탐구까지.<br/>읽고, 실행하고, 나의 코드로 남기세요.</p>');
        text = text.replace('<div class="actions"><a class="btn secondary" href="./python-review.html">', '<div class="actions"><a class="btn primary mk-start" href="./student-room.html">내 Python 실습실 열기 →</a><a class="btn secondary" href="./python-review.html">');
        text = text.replaceAll('3단원 「현상을 분석하는 소프트웨어」의 학습 순서와 자료를 확인합니다.', '오늘의 실습을 고르고, 직접 실행하며 Python을 익혀 보세요.');
      }
      if (rel === 'app.js') {
        text = text.replace('" | 소프트웨어와 생활 · 3단원"', '" | 영수쌤의 Python 교실 · 2026학년도 고1 정보"');
        text = text.replace('3단원 「현상을 분석하는 소프트웨어」의 학습 순서와 자료를 확인합니다.', '오늘의 실습을 고르고, 직접 실행하며 Python을 익혀 보세요.');
      }
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
await copyFile('mk/theme.css', path.join(target, 'mk-theme.css'));
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
