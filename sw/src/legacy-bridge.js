(()=>{'use strict';
const api=window.parent!==window?window.parent.SWFrame?.(window):null;
if(!api){location.replace('/?page=home');return;}
let interacted=false,disposed=false;
const local=new Map();
const signal=e=>{if(e.isTrusted){interacted=true;api.activity();}};
for(const name of ['pointerdown','keydown','input','change'])document.addEventListener(name,signal,{capture:true,passive:true});
window.ClassroomTemporaryStorage={
 getItem(key){const value=api.read(key);local.set(key,value);return value;},
 setItem(key,value){const text=String(value),previous=local.get(key)??null;local.set(key,text);api.write(key,text,previous,!interacted);},
 removeItem(){},clear(){}
};
window.SWPage={navigate:target=>api.navigate(target)};
let generation=0;
window.ClassroomPython={
 async run(input,status){const gen=++generation;const result=await api.run(input,status);if(disposed||gen!==generation)throw Error('이전 활동 실행이 종료되었습니다.');return result;},
 warm:status=>api.warm(status),stop:()=>{generation++;api.stop();},dispose:()=>{generation++;api.stop();}
};
document.addEventListener('click',e=>{
 const legacyLesson=e.target.closest('[data-lesson],#startFirst');
 if(legacyLesson&&['home','examples'].includes(api.id)){e.preventDefault();e.stopImmediatePropagation();api.navigate('/?page=examples#unit-'+(Number(legacyLesson.dataset.lesson||0)+1));return;}
 const page=e.target.closest('[data-page]');const final=e.target.closest('.final-open');
 if(page||final){e.preventDefault();e.stopImmediatePropagation();api.navigate('/?page='+(final?'final-course':page.dataset.page==='lesson'?'examples':page.dataset.page));return;}
 const a=e.target.closest('a[href]');if(!a||a.hasAttribute('download'))return;if(a.target==='_blank'&&!api.canNavigate(a.href))return;
 if(a.getAttribute('href').startsWith('#')){e.preventDefault();e.stopImmediatePropagation();api.navigate(api.url.split('#')[0]+a.getAttribute('href'));return;}
 if(api.canNavigate(a.href)){e.preventDefault();e.stopImmediatePropagation();api.navigate(a.href);}
},true);
document.addEventListener('change',e=>{
 if(e.target.id==='restoreJson'&&e.target.files?.[0]){e.stopImmediatePropagation();api.importFile(e.target.files[0]);e.target.value='';}
},true);
window.addEventListener('classroom:lesson',e=>api.lessonChanged(e.detail.lesson));
addEventListener('DOMContentLoaded',()=>{
 if(disposed)return;
 for(const id of ['saveStatus','saveInfo']){const n=document.getElementById(id);if(n)n.hidden=true;}
 const aside=document.querySelector('aside.side');
 if(aside?.querySelector('.brand'))aside.hidden=true;
 for(const n of document.querySelectorAll('.student-entry,.student-entry-bar,.side-foot'))n.hidden=true;
 const main=document.querySelector('main')||document.body;
 const input=main.querySelector('textarea:not([readonly])');
 if(input&&api.storageMode!=='none'){
  const notice=document.createElement('p');notice.className='notice sw-frame-note';
  notice.textContent='입력한 학습물은 현재 계정에 저장합니다. 위쪽 저장 상태를 확인하세요. 실제 개인정보는 코드·답안에 입력하지 마세요.';main.prepend(notice);
 }
 if(api.id==='avatar'){
  const notice=document.createElement('p');notice.className='notice';notice.textContent='아바타 체험 내용은 저장하지 않습니다. 카메라는 직접 시작하며, 화면을 떠나거나 학습을 마치면 꺼집니다.';main.prepend(notice);
 }
 const $=id=>document.getElementById(id);
 if(['python-review','questions-supplement'].includes(api.id)){
  const id=api.id==='python-review'?'sw2-basics':'sw2-binary';let saved=api.value(id);
  const radios=[...document.querySelectorAll('#quizItems input[type=radio]')];
  for(const el of radios)el.checked=saved.answers?.[el.name]===el.value;
  if(saved.graded)$('grade')?.click();
  const save=graded=>{saved={answers:Object.fromEntries(radios.filter(x=>x.checked).map(x=>[x.name,x.value])),graded};api.update(id,saved);};
  document.getElementById('quizItems')?.addEventListener('change',()=>save(false));
  $('grade')?.addEventListener('click',()=>save(true));
  $(api.id==='python-review'?'resetQuiz':'clear')?.addEventListener('click',()=>save(false));
 }
 if(api.id==='four-turtles'){
  const id='sw2-inquiry-d-state',checks=[...document.querySelectorAll('[data-points]')],saved=api.value(id);
  checks.forEach((el,i)=>{el.checked=!!saved.checks?.[i];el.addEventListener('change',()=>api.update(id,{...api.value(id),checks:checks.map(c=>c.checked)}));});
 }
 if(api.id==='kosis-project'){
  const id='sw2-kosis',saved=api.value(id),checks=[...document.querySelectorAll('input[type=checkbox]')];
  $('report').value=saved.report||'';checks.forEach((el,i)=>el.checked=!!saved.checks?.[i]);
  const save=()=>api.update(id,{report:$('report').value,checks:checks.map(c=>c.checked),fileRequired:!!$('file').files?.length||!!saved.fileRequired});
  $('report').addEventListener('input',save);checks.forEach(el=>el.addEventListener('change',save));$('file').addEventListener('change',save);
  const p=document.createElement('p');p.className='notice';p.textContent='사용자 CSV는 서버로 보내지 않습니다. 다른 PC에서는 CSV를 다시 선택하세요. 작성한 해석과 자기 점검은 계정에 저장합니다.';$('file').parentElement.append(p);
 }
 if(api.id==='data'||api.id==='lab'){
  const n=document.createElement('p');n.className='notice';n.textContent=api.value('sw2-free-state').dataMode==='user-file'&&!$('csvInput')?.value?'코드는 복원되었습니다. 사용자 CSV 재선택이 필요합니다. 파일 내용은 계정에 업로드하지 않았습니다.':'직접 선택한 CSV 파일은 계정에 업로드하지 않습니다. 다른 PC에서는 코드를 불러온 뒤 CSV를 다시 선택하세요. 교재의 가상 자료는 저장·복원할 수 있습니다.';$('uploadCsv')?.parentElement.append(n);
 }
 const resize=()=>api.height(Math.ceil(document.body.getBoundingClientRect().height));
 const observer=new ResizeObserver(resize);observer.observe(document.body);resize();
 window.SWRelease=()=>{if(disposed)return;disposed=true;observer.disconnect();window.SWDispose?.();window.ClassroomPython.dispose();};
 api.ready(document.title);
});
})();