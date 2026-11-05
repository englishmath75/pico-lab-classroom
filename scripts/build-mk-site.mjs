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
        const newEnrollment = '<h1>학습자 유형 선택</h1><p>무학여고 학생은 2026학년도 1학년 학급을 등록하고 승인받으세요. 다른 학교 학생·교사·일반 이용자는 학급 등록 없이 개인 코드 보관함을 사용할 수 있습니다.</p>';
        if (!text.includes(oldEnrollment)) throw Error('MK enrollment heading missing');
        text = text.replace(oldEnrollment, newEnrollment);
        const oldButtons = '<button id="register">학급 등록 요청</button><button id="refresh-approval">';
        if (!text.includes(oldButtons)) throw Error('MK enrollment buttons missing');
        text = text.replace(oldButtons,'<button id="register">1학년 학급 등록 요청</button><button id="register-personal">개인 학습자로 시작 (승인 불필요)</button><button id="refresh-approval">');
        text = text.replace('<h1>교사용 관리실</h1>','<h1>교사용 통합 관리실 · 2026학년도</h1>');
        text = text.replace('<label>담당 학급 <select id="teacher-class">','<label>관리할 학년·학급 <select id="teacher-class">');
        text = text.replace('학교에서 시작한 코드를 집에서도 이어서 작성하세요.','학교와 집, 어느 곳에서든 내 코드를 이어서 작성하세요.');
      }
      if (rel === 'student-room.js') {
        const edits = [
          ["$('class-select').replaceChildren(...identity.classes.map(c=>new Option(c.title,c.id)));",
           "$('class-select').replaceChildren(...identity.classes.filter(c=>c.id.startsWith('class-1-')).map(c=>new Option(c.title,c.id)));"],
          ["$('student-area').hidden=false;notice('개인 학습실에 연결되었습니다. 자리를 떠나기 전에 저장 상태를 확인하고 로그아웃하세요.');",
           "$('student-area').hidden=false;$('submit').hidden=identity.profile.userType==='personal';notice('개인 학습실에 연결되었습니다. 자리를 떠나기 전에 저장 상태를 확인하고 로그아웃하세요.');"],
          ["else if(!teacher) { $('register').hidden=false;$('class-select').disabled=false;notice('학급을 선택한 뒤 등록 요청을 눌러 주세요.'); }",
           "else if(!teacher) { $('register').hidden=false;$('register-personal').hidden=false;$('class-select').disabled=false;notice('학교 학생은 1학년 학급을 등록하거나, 다른 이용자는 개인 학습자로 바로 시작할 수 있습니다.'); }"],
          ["await cloud.approve(student.uid,value);","await cloud.approve(student.uid,value,student.classId);"],
          ["action('refresh-approval',refreshIdentity);",
           "action('register-personal',async()=>{await cloud.registerPersonal(user);await refreshIdentity();});\naction('refresh-approval',refreshIdentity);"],
          ["action('submit',async()=>{",
           "action('submit',async()=>{if(identity?.profile?.userType==='personal')throw Error('개인 학습자는 교사 제출 대신 내 코드 보관함을 사용합니다.');"],
          ["else notice(noticeAfterLogout||'학교 Google 계정으로 로그인하면 개인 코드를 저장하고 다른 기기에서 이어서 학습할 수 있습니다.');",
           "else notice(noticeAfterLogout||'Google 계정으로 로그인하면 학교 학습자 또는 개인 학습자로 코드를 저장하고 다른 기기에서 이어서 학습할 수 있습니다.');"]
        ];
        for (const [from,to] of edits) {
          if (!text.includes(from)) throw Error('MK UI patch anchor missing: '+from.slice(0,80));
          text = text.replace(from,to);
        }
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
  sharedFirebaseProject:'englishmath-python-classroom', videoOrigin:'sw.englishmath.kr'
},null,2));
console.log('MK student classroom staged, '+count+' site files');
