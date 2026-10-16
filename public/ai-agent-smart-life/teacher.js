(() => {
 const lessons=window.AASL_LESSONS||[], deep=window.AASL_DEEP_DIVE||[];
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 document.getElementById('lesson-index').innerHTML=lessons.map((l,i)=>'<a href="#guide-'+(i+1)+'">'+(i+1)+'차시</a>').join('');
 document.getElementById('lesson-guides').innerHTML=lessons.map((l,i)=>{
 const d=deep[i]||{hook:'',concepts:[],practice:[],debug:'',prompt:'',exit:''};
 const questions=l.questions.concat(d.extraQuestions||[]);
 return '<article id="guide-'+(i+1)+'"><span class="badge">LESSON '+String(i+1).padStart(2,'0')+'</span>'+
 '<h2>'+safe(l.title)+'</h2><p><strong>학습 목표:</strong> '+safe(l.goal)+'</p>'+
 '<h3>50분 수업 운영 및 교사 발문</h3><table><thead><tr><th>시간</th><th>학생 활동·지도 내용</th><th>교사 발문</th></tr></thead><tbody>'+
 '<tr><td>0~5분 (도입)</td><td>생활 속 문제를 읽고 자신의 생각 적기</td><td>'+safe(d.hook)+'</td></tr>'+
 '<tr><td>5~15분 (개념)</td><td>'+d.concepts.map(x=>safe(x[0])).join(' · ')+'</td><td>'+safe(l.concept)+'</td></tr>'+
 '<tr><td>15~35분 (실습)</td><td>코드 예상 출력 작성 → 실행 → 오류·값 수정</td><td>'+safe(l.task)+'</td></tr>'+
 '<tr><td>35~45분 (적용)</td><td>'+d.practice.map(x=>safe(x)).join('<hr>')+'</td><td>'+safe(d.debug)+'</td></tr>'+
 '<tr><td>45~50분 (평가)</td><td>형성평가 채점 · 학습 정리</td><td>'+safe(d.exit)+'</td></tr>'+
 '</tbody></table>'+
 '<h3>핵심 개념 보충 설명</h3>'+
 d.concepts.map((c,j)=>'<p><strong>'+(j+1)+'. '+safe(c[0])+'</strong> — '+safe(c[1])+'<br><span class="tiny">예시: '+safe(c[2])+'</span></p>').join('')+
 '<h3>학생 예상 코드 실행 결과</h3><pre class="card">'+safe(l.expect)+'</pre>'+
 '<h3>수업 중 점검할 오개념</h3><p>'+safe(d.debug)+'</p>'+
 '<h3>선택 AI 활용·검증 발문</h3><p class="card">'+safe(d.prompt)+'</p>'+
 '<h3>형성평가 정답·해설 ('+questions.length+'문항)</h3>'+
 '<ol>'+questions.map(q=>'<li><b>'+safe(q[0])+'</b><br>정답 '+String.fromCharCode(9312+q[2])+' '+safe(q[1][q[2]])+' — '+safe(q[3])+'</li>').join('')+'</ol>'+
 '<p class="tiny">학생에게 공개 가능한 연습 문제 정답·해설입니다. 실제 지필고사 원안은 포함하지 않습니다.</p></article>';
 }).join('');
})();