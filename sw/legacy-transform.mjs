export function transform(name,s){
 if(name.endsWith('.html')){
  s=s.replaceAll('학습 진도와 입력 내용은 현재 기기의 브라우저에만 저장됩니다.','학습 진도와 입력 내용은 로그인한 계정에 저장합니다. 상단의 클라우드 저장 완료 표시를 확인하세요.')
   .replaceAll('학습 기록은 브라우저 로컬 저장이며 자동 제출되지 않습니다. PC를 옮길 때 ‘학습 기록 백업’과 ‘기록 복원’을 사용합니다.','학습 기록은 로그인한 계정에 저장하며 선생님께 제출은 별도로 선택합니다. 다른 PC에서도 같은 계정으로 이어서 학습합니다. 파일 백업·복원은 보조 수단으로 사용할 수 있습니다.')
   .replaceAll('코드와 이유는 이 브라우저에 저장됩니다. 다른 PC에서 이어 하려면 파일로 보관하세요. .py 다운로드에는 이유를 주석으로 함께 넣습니다. 로그인·교사에게 제출하는 기능은 아닙니다.','코드·설명·개념 확인 답안은 현재 계정에 저장합니다. .py 내려받기에는 설명을 주석으로 포함합니다. 선생님께 제출은 상단에서 별도로 선택하세요.')
   .replaceAll('아래 기록은 이 브라우저에만 임시 저장됩니다. 마지막에 TXT로 내려받아 실습 폴더에 넣으세요.','아래 기록은 현재 계정에 저장합니다. 위쪽 저장 상태를 확인하세요. TXT로 내려받아 실습 폴더에도 보관할 수 있습니다.')
   .replaceAll('이 브라우저에 임시 저장','작성하면 계정에 저장')
   .replaceAll('02번의 코드·예측·해석 칸과 05번의 보고서 칸은 현재 브라우저에 저장됩니다. 로그인 계정에 저장되거나 PC 사이에 자동 동기화되지는 않습니다. 공용 PC에서는 다음 사용자에게 기록이 남을 수 있으므로 개인 정보 대신 수업 코드만 작성하세요.','02번의 코드·예측·해석과 05번의 보고서는 로그인한 계정에 저장합니다. 다른 PC에서도 같은 계정으로 이어갈 수 있습니다. 공용 PC에서는 저장 상태를 확인하고 이 PC 학습 마치기를 누르세요.');
 }

 function replace(a,b){if(!s.includes(a))throw Error(name+': missing patch anchor '+a.slice(0,80));s=s.replace(a,b);}

 // The 00-class pages share the outer SW menu. Retain their topic links without
 // embedding the old sticky 100vh sidebar in an auto-height classroom frame.
 if(['python-review.html','math-function-graphs.html','physics-explanation.html','graphics-gallery.html'].includes(name)){
  const sidebar=s.match(/<aside class="curriculum-side"[^>]*>[\s\S]*?<\/aside>/);
  const topics=sidebar?.[0].match(/<div class="curriculum-subnav"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  if(!topics||!s.includes('</header>'))throw Error(name+': review topic navigation missing');
  s=s.replace(sidebar[0],'').replace(/<link\b[^>]*href=["'][^"']*curriculum-nav\.css[^"']*["'][^>]*\/?\s*>/gi,'');
  s=s.replace('</header>','</header><nav class="sw-review-topics curriculum-subnav" aria-label="00차시 주제 바로가기">'+topics+'</nav>');
 }

 if(name==='index.html'){
  replace("<section class=\"avatar-launch\" aria-label=\"AI 표정 아바타 실험실 바로가기\"><div><strong>추가 체험 · AI 표정 아바타 실험실</strong><p>동물 8종과 내 표정으로 배우는 Python 조건문 · 카메라 없이도 체험할 수 있어요.</p></div><a href=\"./ai-avatar.html\">아바타 실험실 시작 →</a></section>",'');
  replace("<div class=\"actions\"><a class=\"btn secondary\" href=\"./python-review.html\">00차시 Python 복습 →</a><a class=\"btn primary\" href=\"./lesson01-guide.html\">1차시 수업 시작 →</a><a class=\"btn experience-link\" href=\"./first-analysis.html\">전체체험</a></div>","<div class=\"actions\"><a class=\"btn primary\" href=\"./lesson01-guide.html\">1차시 수업 시작 →</a><a class=\"btn secondary\" href=\"./python-review.html\">00차시 Python 복습 →</a><a class=\"btn ghost\" href=\"/?page=library\">내 학습 이어가기 →</a></div>");
  replace('<div class="lesson-intro">',"<nav class=\"sw-home-route\" aria-label=\"수업 진행 순서\"><a href=\"./step-by-step.html?lesson=1\"><b>02</b><span>차시별 실습<small>예측 · 실행 · 해석</small></span></a><a href=\"./?page=data\"><b>03</b><span>실습 자료<small>CSV · 예제 확인</small></span></a><a href=\"./?page=exam\"><b>04</b><span>복습 문제<small>답안 · 오답 확인</small></span></a><a href=\"./?page=report\"><b>05</b><span>탐구 보고서<small>결과를 글로 정리</small></span></a></nav><div class=\"lesson-intro\">");
  replace('1차시 → 전체 과정 따라 하기(추가 1회) → 기존 2~10차시 순서로 진행합니다. 모든 차시에서 예제를 VS Code로 직접 실행하고 저장합니다.','1차시 → 전체 과정 따라 하기(추가 1회) → 2~10차시 순서로 진행합니다. 각 차시의 5단계 실습을 SW에서 실행하고 계정에 저장합니다. VS Code에서도 이어서 연습할 수 있습니다.');
  replace('<div class="panel supplemental"><h3>2. 보충 학습과 선택 탐구</h3>',"<section class=\"panel sw-home-extras\" aria-labelledby=\"sw-extra-title\"><span class=\"section-label\">수업과 함께 활용하기</span><h3 id=\"sw-extra-title\">2. 추가 실습·탐구</h3><div class=\"resource-grid\"><a href=\"/?page=data-lab&amp;unit=SW01\">데이터 시각화 실험실<span>코드를 실행하고 표의 변화를 확인합니다.</span></a><a href=\"/?page=practice\">자유 Python 실습실<span>내 코드를 작성하고 계정에 저장합니다.</span></a><a href=\"./first-analysis.html\">전체체험 · 데이터 분석 따라 하기<span>1차시 다음, 축제 간식 자료로 전체 과정을 익힙니다.</span></a></div><section class=\"avatar-launch\" aria-label=\"AI 표정 아바타 실험실 바로가기\"><div><strong>추가 체험 · AI 표정 아바타 실험실</strong><p>동물 8종과 내 표정으로 배우는 Python 조건문 · 카메라 없이도 체험할 수 있어요.</p></div><a href=\"./ai-avatar.html\">아바타 실험실 시작 →</a></section></section><div class=\"panel supplemental\"><h3>3. 보충 학습과 선택 탐구</h3>");
  replace('기초 실습을 마친 뒤, 필요한 자료만 골라 활용하세요.</p>','기초 실습을 마친 뒤, 필요한 자료만 골라 활용하세요.</p>'+"<div class=\"resource-grid sw-home-inquiries\" aria-label=\"보충 탐구 A부터 D\"><a href=\"./list-tuple-dictionary.html\">A. 리스트·튜플·딕셔너리 비교</a><a href=\"./questions-supplement.html\">B. 진법 표현</a><a href=\"./radians.html\">C. 호도법(라디안)</a><a href=\"./four-turtles.html\">D. 네 마리 거북이</a></div>");
  replace('선택 2. 파이썬 자유 실습</button>','자료 연결 자유 실습</button>');
  replace('3. 이전 예제 모음 · 필요할 때만 활용','4. 이전 예제 모음 · 필요할 때만 활용');
 }

 if(name==='step-by-step.js'){
  replace("verified,revision:z.revision","verified,stdin:typeof z.stdin==='string'?z.stdin:'',quiz:z.quiz||{},quizGraded:!!z.quizGraded,revision:z.revision");
  replace("function saveEditor(){const r=record();","function saveEditor(){const r=record();r.stdin=$('stdin').value;");
  replace("$('reflection').value=r.reflection;","$('reflection').value=r.reflection;$('stdin').value=r.stdin||'';");
  replace('value="${j}">','value="${j}" ${Number(r.quiz?.[i])===j?\'checked\':\'\'}>');
  replace("code,required:s.append,datasets:await datasets()","code,stdin:$('stdin').value,required:s.append,datasets:await datasets()");
  replace("$('editor').oninput=", "$('stdin').oninput=()=>{record().stdin=$('stdin').value;save();};$('lessonQuiz').addEventListener('change',e=>{if(e.target.name?.startsWith('q')){const r=record();r.quiz={...r.quiz,[e.target.name.slice(1)]:Number(e.target.value)};r.quizGraded=false;save();}});$('editor').oninput=");
  replace("$('quizScore').textContent=correct+' / 2 정답';","$('quizScore').textContent=correct+' / 2 정답';record().quizGraded=true;save();");
  replace("nav();save();history.replaceState", "nav();save();if(r.quizGraded)$('gradeQuiz').click();history.replaceState");
  replace("location.href='./first-analysis.html';return;","window.SWPage.navigate('./first-analysis.html');return;");
  replace("$('downloadCsv').onclick=()=>$('csvFileLink').click();render();","$('downloadCsv').onclick=()=>$('csvFileLink').click();render();");
 }
 if(name==='app.js'){
  replace('function screen(name){','function screen(name){const requested=new URLSearchParams(location.search).get("page")||"home";if(name!==requested&&name!=="home"){window.SWPage.navigate("/?page="+(name==="lesson"?"examples":name));return;}');

  replace('$(\"saveStatus\").textContent=\"✓ 자동 저장됨\"','$(\"saveStatus\").textContent=\"메모리 임시 보관\"');
  replace('exam:{}}','exam:{},examGraded:false,wrong:[],dataMode:\"provided\",stdin:\"\"}');
  replace('function loadCode(i){','function loadCode(i){if(state.code&&state.code!==LESSONS[i][5]&&!confirm(\"작성한 코드를 예제로 바꿀까요? 필요한 초안은 먼저 내려받아 주세요.\"))return;');
  replace('state.dataset=key;state.csv=DATA[key].csv;','state.dataset=key;state.dataMode=\"provided\";state.csv=DATA[key].csv;');
  replace('state.csv=await f.text();','state.dataMode=\"user-file\";state.csv=await f.text();');
  replace('state.csv=$(\"csvInput\").value;save()','state.csv=$(\"csvInput\").value;if(state.dataMode!==\"user-file\")state.dataMode=\"fictional-edited\";save()');
  replace('code:$(\"pythonCode\").value,csv:state.csv','code:$(\"pythonCode\").value,stdin:$(\"stdin\").value,csv:state.csv');
  replace('function renderExam(){','function filterExam(){document.querySelectorAll("#examQuiz .quiz-item").forEach((el,i)=>el.hidden=state.examFilter==="wrong"&&!(state.wrong||[]).includes(i));$("sw-exam-filter").value=state.examFilter||"all";}$("sw-exam-filter").onchange=e=>{state.examFilter=e.target.value;filterExam();save();};function renderExam(){');
  replace('$("examResult").textContent=""}','$("examResult").textContent="";filterExam()}');
  replace('const exam=window.COURSE_LESSONS.flatMap(l=>l.quiz);',`const exam=window.COURSE_LESSONS.flatMap(l=>l.quiz);
document.addEventListener('change',e=>{
 const m=/^(eq|lq)(\\d+)$/.exec(e.target.name||'');if(!m)return;
 const n=Number(m[2]);if(m[1]==='eq'){state.exam[n]=Number(e.target.value);state.examGraded=false;}else{state.answers[state.lesson]??={};state.answers[state.lesson][n]=Number(e.target.value);}save();
});
$('stdin').oninput=()=>{state.stdin=$('stdin').value;save();};
`);
  replace('$(\"examResult\").textContent=n+\" / 20점\";save()','$(\"examResult\").textContent=n+\" / 20점\";state.examGraded=true;state.wrong=[...new Set([...(state.wrong||[]),...exam.map((q,i)=>state.exam[i]!==q[2]?i:null).filter(i=>i!==null)])];save()');
  replace('state.exam={};renderExam();save()','state.exam={};state.examGraded=false;renderExam();save()');
  replace('renderExam();const requested=', 'renderExam();if(state.examGraded)$(\"gradeExam\").click();$(\"stdin\").value=state.stdin||\"\";const requested=');
  replace('screen([\"home\",\"lab\",\"data\",\"report\",\"exam\"].includes(requested)?requested:\"home\")','screen([\"home\",\"lab\",\"data\",\"report\",\"exam\",\"lesson\"].includes(requested)?requested:\"home\")');
  replace('init();',`if(/^#unit-\\d+$/.test(location.hash))state.lesson=Number(location.hash.slice(6))-1;
init();`);
 }
 if(name==='final-classroom.js'){
  replace("let state={lesson:0,done:[],notes:{},answers:{}}","let state={lesson:0,done:[],notes:{},answers:{},codes:{},choices:{},graded:{}}");
  replace("$('final-code').value=d.code;","$('final-code').value=state.codes[current]??d.code;");
  replace('value="\'+j+\'">','value="\'+j+\'" \'+(Number(state.choices[current]?.[i])===j?\'checked\':\'\')+\'>');
  replace("$('final-result').textContent='';","$('final-result').textContent=state.graded[current]?(state.answers[current]+' / 2 정답'):'';");
  replace("state.answers[current]=correct;save()","state.answers[current]=correct;state.graded[current]=true;save()");
  replace("$('final-note').addEventListener",`$('final-code').addEventListener('input',e=>{state.codes[current]=e.target.value;save();});$('final-choices').addEventListener('change',e=>{if(e.target.name?.startsWith('final-q')){state.choices[current]??={};state.choices[current][e.target.name.slice(7)]=Number(e.target.value);state.graded[current]=false;save();}});$('final-note').addEventListener`);
  replace("render();})();",`if(/^#unit-\\d+$/.test(location.hash))current=safe(Number(location.hash.slice(6))-1);render();if(new URLSearchParams(location.search).get('page')==='final-course')showFinal();})();`);
 }
 if(name==='mastery.js'){
  replace('let state={done:[],notes:{},current:0}','let state={done:[],notes:{},current:0,codes:{},choices:{},graded:{},answers:{}}');
  replace('$("code").value=u[4];','$("code").value=state.codes[state.current]??u[4];');
  replace('value="\'+j+\'">','value="\'+j+\'" \'+(Number(state.choices[state.current])===j?\'checked\':\'\')+\'>');
  replace('const u=UNITS[state.current];$("feedback").textContent=c?', 'const u=UNITS[state.current];state.graded[state.current]=true;state.answers[state.current]=c&&Number(c.value)===u[8]?1:0;save();$("feedback").textContent=c?');
  replace('$("note").oninput=',`$("code").oninput=e=>{state.codes[state.current]=e.target.value;save();};$("choices").onchange=e=>{state.choices[state.current]=Number(e.target.value);state.graded[state.current]=false;save();};$("note").oninput=`);
  replace('save();renderMenu();}', 'save();renderMenu();if(state.graded[state.current])$("grade").click();}');
  replace('$("reset").onclick=()=>{$("code").value=UNITS[state.current][4];','$("reset").onclick=()=>{if(!confirm("현재 코드를 원본 예제로 바꿀까요? 필요한 초안을 내려받아 보관하세요."))return;$("code").value=UNITS[state.current][4];state.codes[state.current]=$("code").value;save();');
  const start=s.indexOf('async function python()'),end=s.indexOf('select(state.current);',start);
  if(start<0||end<0)throw Error('mastery runner bounds');
  s=s.slice(0,start)+`$("run").onclick=async()=>{
 if(running)return;running=true;$("run").disabled=true;$("plot").classList.add("hidden");
 try{const x=await window.ClassroomPython.run({code:$("code").value},t=>$("runtime").textContent=t);$("output").textContent=x.output||"(출력 없음)";if(x.picture){$("plot").src="data:image/png;base64,"+x.picture;$("plot").classList.remove("hidden");}$("runtime").textContent="실행 완료";}
 catch(e){$("output").textContent=String(e.message||e);$("runtime").textContent="실행 실패";}finally{running=false;$("run").disabled=false;}
};$('sw-stop').onclick=()=>window.ClassroomPython.stop();
if(/^#unit-\\d+$/.test(location.hash))state.current=Math.max(0,Math.min(17,Number(location.hash.slice(6))-1));
`+s.slice(end);
 }
 if(name==='simulation.html'){
  replace('내용은 현재 브라우저에만 자동 저장됩니다.','작성한 학습물은 현재 계정에 저장합니다. 위쪽 저장 상태를 확인하세요.');

  s=s.replaceAll("localStorage.","window.ClassroomTemporaryStorage.");
  
  replace('s.dataset="sports";s.csv=csv();','s.dataset="sports";s.dataMode="fictional-edited";s.csv=csv();');
  replace('location.href="./?page=lab&from=simulation"','window.SWPage.navigate("./?page=lab&from=simulation")');
  replace('var quizAnswers=state.answers&&typeof state.answers==="object"?state.answers:{};','var quizAnswers=state.answers&&typeof state.answers==="object"?state.answers:{};');
  replace('$("grade").onclick=function(){',`$("quizzes").addEventListener("change",function(e){if(e.target.name?.startsWith("q")){quizAnswers[e.target.name.slice(1)]=Number(e.target.value);state.answers=quizAnswers;state.graded=false;save()}});
$("grade").onclick=function(){state.graded=true;`);
 }
 if(name==='simulation.html')replace('run();\n})();','run();if(state.graded)$("grade").click();\n})();');
 if(name==='ai-avatar.js')replace("addEventListener('pagehide',end);","window.SWDispose=end;addEventListener('pagehide',end);");
 return s;
}
