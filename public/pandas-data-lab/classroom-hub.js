(()=>{'use strict';const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lessons=window.COURSE_LESSONS;const root=document.getElementById('courseMap');
root.innerHTML=lessons.map((l,i)=>`<a class="course-card ${i===0?'first':''}" href="${i===0?'./lesson01-guide.html':'./step-by-step.html?lesson='+(i+1)}"><span class="course-number">${String(i+1).padStart(2,'0')}</span><div><strong>${esc(l.title)}</strong><p>${esc(l.goal)}</p><small>${i===0?'개념 안내 → 5단계 실습':i===6?'단어 빈도 + 선택 심화':'개념 + 5단계 실습'} →</small></div></a>`).join('');
try{const s=JSON.parse(localStorage.getItem('data-detective-step-by-step-2026-v1')||'{}');if(Number.isInteger(s.lesson)&&s.lesson>=0&&s.lesson<10){document.getElementById('resumeLesson').href='./step-by-step.html?lesson='+(s.lesson+1);document.getElementById('resumeLesson').textContent=(s.lesson+1)+'차시 실습 이어가기';}}catch(_){}
})();
