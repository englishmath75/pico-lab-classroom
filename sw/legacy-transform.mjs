export function transform(name,s){
 function replace(a,b){if(!s.includes(a))throw Error(name+': missing patch anchor '+a.slice(0,80));s=s.replace(a,b);}
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
