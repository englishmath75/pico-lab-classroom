(()=>{'use strict';
const key='pandas-first-analysis-note-v1',note=document.getElementById('analysisNote'),status=document.getElementById('noteStatus');
try{note.value=localStorage.getItem(key)||'';}catch(_){status.textContent='임시 저장을 사용할 수 없습니다. TXT로 내려받으세요.';}
note.addEventListener('input',()=>{try{localStorage.setItem(key,note.value);status.textContent='이 브라우저에 임시 저장됨 · 수업 후 TXT로 내려받으세요';}catch(_){status.textContent='임시 저장 실패 · TXT로 내려받으세요';}});
document.getElementById('saveNote').onclick=()=>{const text='축제 간식 부스 분석 기록\n\n'+note.value;const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='analysis_note.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);status.textContent='TXT 저장을 요청했습니다. 내려받은 파일을 실습 폴더에 넣으세요.';};
let timer;document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const out=document.getElementById('copyStatus');try{await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);out.textContent='코드를 복사했습니다. VS Code의 이전 코드 아래에 붙여 넣으세요.';}catch(_){out.textContent='자동 복사를 사용할 수 없습니다. 코드 내용을 직접 선택해 복사하세요.';}clearTimeout(timer);timer=setTimeout(()=>{out.textContent='';},4500);}));
})();
