
(function () {
  "use strict";
  const course = window.AGENT_COURSE_DATA;
  if (!course || !Array.isArray(course.lessons) || course.lessons.length !== 12) {
    document.getElementById("course-notice").textContent = "수업 데이터를 불러오지 못했습니다. 새로고침하거나 관리자에게 알려 주세요.";
    return;
  }
  const lessons = course.lessons;
  const KEY = "ai-agent-smart-life:progress:v1";
  const defaultState = {selected:1,tab:"concept",mode:"student",checks:{},answers:{},notes:{},savedCodes:{},completed:[]};
  let state = JSON.parse(JSON.stringify(defaultState));
  function validId(id) { return Number.isInteger(id) && id >= 1 && id <= 12; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){ toast("저장 공간이 부족하거나 차단되어 진도가 유지되지 않습니다."); }
  }
  function recover(p) {
    if (!p || typeof p !== "object") return JSON.parse(JSON.stringify(defaultState));
    const safe = JSON.parse(JSON.stringify(defaultState));
    if (validId(Number(p.selected))) safe.selected = Number(p.selected);
    if (["concept","python","agent","quiz","teacher"].includes(p.tab)) safe.tab = p.tab;
    if (p.mode === "teacher") safe.mode = "teacher";
    if (p.checks && typeof p.checks === "object") for (let i=1; i<=12; i++) {
      const x = p.checks[i]; if (Array.isArray(x)) safe.checks[i] = [...new Set(x.filter(v => [0,1,2].includes(v)))];
    }
    if (p.answers && typeof p.answers === "object") for (let i=1; i<=12; i++) {
      if ([0,1,2,3].includes(p.answers[i])) safe.answers[i] = p.answers[i];
    }
    if (p.notes && typeof p.notes === "object") for (let i=1; i<=12; i++) {
      if (typeof p.notes[i] === "string") safe.notes[i] = p.notes[i].slice(0,4000);
    }
    if (p.savedCodes && typeof p.savedCodes === "object") for (let i=1; i<=12; i++) {
      if (typeof p.savedCodes[i] === "string") safe.savedCodes[i] = p.savedCodes[i].slice(0,12000);
    }
    if (Array.isArray(p.completed)) safe.completed = [...new Set(p.completed.filter(validId))].sort((a,b)=>a-b);
    return safe;
  }
  try { state = recover(JSON.parse(localStorage.getItem(KEY)||"null")); } catch(e){ state = recover(null); }
  let toastTimer = null;
  function toast(message) {
    const el=document.getElementById("toast");el.textContent=message;el.hidden=false;
    if(toastTimer)clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){el.hidden=true;},3200);
  }
  function lesson(){ return lessons[state.selected-1]; }
  function nav() {
    const navigation=document.getElementById("lesson-navigation");
    let html="",previous="";
    lessons.forEach(function(item){
      if(item.part!==previous) { html+='<div class="nav-group">'+esc(item.part)+'</div>'; previous=item.part; }
      const done=state.completed.includes(item.id);
      const active=state.selected===item.id;
      html+='<button type="button" data-lesson="'+item.id+'" class="lesson-button'+(active?' active':'')+(done?' done':'')+'"'+(active?' aria-current="step"':'')+'>';
      html+='<span class="lesson-number">'+String(item.id).padStart(2,"0")+'</span><span class="nav-txt">'+esc(item.title)+'</span>'+(done?'<span aria-label="학습 완료" class="nav-check">✓</span>':'')+'</button>';
    });
    navigation.innerHTML=html;
    const n=state.completed.length;
    document.getElementById("done-count").textContent=n+" / 12";
    document.getElementById("done-percent").textContent=Math.round(n/12*100)+"%";
    document.getElementById("progress-fill").style.width=(n/12*100)+"%";
  }
  function contentHead(label,title,desc) {
    return '<div class="content-head"><div><div class="kicker">'+esc(label)+'</div><h3>'+esc(title)+'</h3><p>'+esc(desc)+'</p></div></div>';
  }
  function list(arr,ordered) {
    const tag=ordered?"ol":"ul";
    return "<"+tag+">"+arr.map(function(t){return "<li>"+esc(t)+"</li>";}).join("")+"</"+tag+">";
  }
  function concepts() {
    const l=lesson();
    let html=contentHead("STEP 1 · 이해","오늘 배울 내용","실습에 앞서 핵심 개념과 생활 속 문제를 연결합니다.");
    html+='<div class="panel focus-panel"><h4>오늘의 질문</h4><p><strong>'+esc(l.hook)+'</strong></p></div>';
    html+='<div class="panel"><h4>🎯 학습 목표</h4>'+list(l.objectives,false)+'</div>';
    html+='<h4 style="margin:21px 0 12px">알아두어야 할 개념</h4><div class="concept-grid">';
    l.concepts.forEach(function(c){html+='<article class="concept-card"><h4>'+esc(c[0])+'</h4><p>'+esc(c[1])+'</p></article>';});
    html+='</div>';
    html+='<div class="panel"><h4>Arduino → 데이터 → AI</h4><p>센서를 통해 데이터를 읽고 조건에 따라 LED·부저를 제어하던 방식을 떠올려 보세요. 이번에는 표 데이터를 읽고, 분석하며, 검증된 결과를 다음 작업의 입력으로 전달합니다.</p></div>';
    html+='<div class="panel"><h4>50분 수업 흐름</h4><ol class="steps">'+l.flow.map(function(t){return '<li>'+esc(t)+'</li>';}).join("")+'</ol></div>';
    html+='<button type="button" class="primary-btn" data-next-tab="python">Python 실습으로 →</button>';
    return html;
  }
  function codeOf(l) {
    return (l.usesData ? course.pythonPrelude+"\n\n" : "")+l.code.join("\n");
  }
  function rows() {
    const lines=course.sampleCSV.trim().split(/\r?\n/);
    return lines.slice(1).map(function(line){
      const v=line.split(",");
      return {day:Number(v[0]),subject:v[1],minutes:Number(v[2]),correct:Number(v[3]),total:Number(v[4]),sleep:Number(v[5])};
    });
  }
  function summary() {
    const groups={};
    rows().forEach(function(r) {
      if(!groups[r.subject])groups[r.subject]={n:0,minutes:0,accuracy:0};
      const g=groups[r.subject];g.n++;g.minutes+=r.minutes;g.accuracy+=r.correct/r.total*100;
    });
    Object.keys(groups).forEach(function(k){
      groups[k].meanAccuracy=groups[k].accuracy/groups[k].n;
      groups[k].totalMinutes=groups[k].minutes;
    });
    return groups;
  }
  function chart(metric) {
    const groups=summary();
    const keys=["Math","English","Science"];
    let max=metric==="accuracy"?100:Math.max.apply(null,keys.map(function(k){return groups[k].totalMinutes;}));
    return '<div class="data-chart">'+keys.map(function(k){
      const value=metric==="accuracy"?groups[k].meanAccuracy:groups[k].totalMinutes;
      const display=metric==="accuracy"?value.toFixed(1)+"%":value.toFixed(0)+"분";
      return '<div class="chart-row"><span>'+k+'</span><div class="chart-track" aria-label="'+k+' '+display+'"><div class="chart-fill" style="width:'+Math.round(100*value/max)+'%"></div></div><span class="chart-value">'+display+'</span></div>';
    }).join("")+'</div>';
  }
  function python() {
    const l=lesson();
    let html=contentHead("STEP 2 · 실행","코드를 읽고 실행하고 바꿔 보기","① 먼저 출력 예측 → ② 코드를 복사 → ③ Google Colab 또는 학교 승인 Python 환경에서 실행");
    html+='<div class="tool-note">아래 코드는 <b>실제로 실행 가능한 Python 예제</b>입니다. 웹앱에서 보이는 예상 결과는 실제 실행 로그가 아닙니다. Colab을 사용할 수 없다면 학교 PC의 Python 환경에서 실행하세요.</div>';
    html+='<div class="codebar"><span>PYTHON · '+(l.usesData?"Pandas·가상 CSV 포함":"기본 Python")+'</span><div class="codebar-actions"><button id="copy-code" type="button">코드 복사</button><a href="https://colab.research.google.com/" target="_blank" rel="noopener noreferrer">Colab 열기 ↗</a></div></div>';
    html+='<pre class="codeblock"><code>'+esc(codeOf(l))+'</code></pre>';
    html+='<div class="result-hint"><b>예상 결과 (실행 전 예측)</b><br>'+esc(l.expected)+'</div>';
    html+='<details class="editor-panel"><summary>✍️ 코드 직접 고쳐 보기 · 브라우저 Python 실행 (선택)</summary>';
    html+='<p class="editor-description">코드를 수정한 다음 실행하세요. 외부 Pyodide 패키지가 처음 로딩되므로 학교 인터넷에서 제한될 수 있습니다. 필요한 경우 Colab이나 로컬 Python을 사용하세요.</p>';
    html+='<label class="term" for="python-editor">내가 수정하는 Python 코드</label>';
    html+='<textarea id="python-editor" class="python-editor" spellcheck="false" maxlength="12000" aria-label="수정할 Python 코드"></textarea>';
    html+='<div class="editor-actions"><button type="button" id="run-python" class="primary-btn">▶ 이 브라우저에서 실제 실행</button><button type="button" id="stop-python" class="secondary-btn">실행 취소</button><button type="button" id="reset-python" class="secondary-btn">원본 코드 복원</button></div>';
    html+='<div id="python-run-output" class="python-run-output" role="status" aria-live="polite">Python 실행 버튼을 누르면 여기에 실제 출력이 나타납니다.</div></details>';
    html+='<div class="panel"><h4>✍️ 오늘의 실습 미션</h4>'+list(l.tasks,true)+'</div>';
    if(l.usesData) {
      html+='<div class="panel"><h4>📊 데이터 탐색기 · 브라우저에서 실시간 계산</h4>';
      html+='<p>아래 그래프는 JavaScript로 가상 CSV를 분석한 결과입니다. Python 코드를 실제 실행한 그래프가 아닙니다.</p>';
      html+='<label class="chart-controls" for="chart-metric">표시 데이터 <select id="chart-metric"><option value="accuracy">과목별 평균 정답률</option><option value="minutes">과목별 총 학습시간</option></select></label>';
      html+='<div id="data-chart">'+chart("accuracy")+'</div>';
      html+='<button type="button" class="copy-btn" id="download-csv-inline">가상 CSV 파일 내려받기</button></div>';
    }
    html+='<div class="panel"><h4>🔎 조금 더 도전</h4><p>'+esc(l.extension)+'</p></div>';
    html+='<button type="button" class="primary-btn" data-next-tab="agent">AI 실습으로 →</button>';
    return html;
  }
  function agent() {
    const l=lesson();
    let html=contentHead("STEP 3 · 프로젝트","AI와 협업하여 문제 해결하기","좋은 요청서 작성 → 가상 도구 실행 관찰 → 결과 검증 → 개선");
    html+='<div class="panel"><h4>💬 AI에게 이렇게 요청해 보세요</h4><div class="prompt-box">'+esc(l.prompt)+'</div><button type="button" id="copy-prompt" class="copy-btn">프롬프트 복사</button></div>';
    html+='<div class="panel"><h4>🛠️ 안전한 도구 호출 시뮬레이터</h4><p>수업용 고정 자료와 미리 만든 규칙으로 도구 실행 순서를 재현합니다. <b>생성형 AI 모델과 연결된 실제 LLM 에이전트가 아닙니다.</b></p>';
    html+='<label for="agent-request" class="term">가상 AI 비서에게 할 일을 요청하세요</label>';
    html+='<div class="agent-input"><input id="agent-request" type="text" maxlength="100" value="과목별 평균 분석하고 취약 과목 알려 줘" placeholder="예: 학습 계획 세워 줘"><button type="button" id="simulate-agent" class="primary-btn">실행 · 로그 확인</button></div>';
    html+='<div id="agent-simulator-output" class="agent-output"><pre>목표를 입력하고 [실행 · 로그 확인]을 누르세요.</pre></div></div>';
    html+='<div class="panel"><h4>✅ 미션 확인 체크리스트</h4>';
    const selected=state.checks[l.id]||[];
    l.tasks.forEach(function(task,i){
      html+='<label class="task-check"><input type="checkbox" class="task-checkbox" data-index="'+i+'"'+(selected.includes(i)?" checked":"")+'> <span>'+esc(task)+'</span></label>';
    });
    html+='<p id="task-status">'+selected.length+' / 3개 활동 확인</p></div>';
    html+='<div class="teacher-alert">AI는 본인이나 친구의 실제 성적·주민등록번호·연락처·계정 비밀번호를 요구해서는 안 됩니다. 수업은 가상 CSV로 진행합니다. 개인 AI 계정 사용 및 외부 업로드는 학교 정책을 따르세요.</div>';
    html+='<p style="margin-top:20px"><button type="button" class="primary-btn" data-next-tab="quiz">형성평가로 →</button></p>';
    return html;
  }
  function agentSim(request) {
    const s=summary();const keys=Object.keys(s);
    const worst=keys.reduce(function(a,b){return s[a].meanAccuracy<s[b].meanAccuracy?a:b;});
    const overall=(rows().reduce(function(total,r){return total+r.correct/r.total*100;},0)/rows().length).toFixed(1);
    let steps=[],report="";
    if(/취약|평균|분석|정답/.test(request)){
      steps=["parse_mock_csv","groupby_subject","verify_nonempty","compose_report"];
      report="가상 기록 18개 분석 완료\n전체 평균 정답률: "+overall+"%\n과목별 평균: "+keys.map(function(k){return k+" "+s[k].meanAccuracy.toFixed(1)+"%";}).join(" / ")+"\n가장 낮은 평균: "+worst+"\n확인: 합성 데이터·표본 18행으로 개인 성적 판단 불가";
    } else if(/계획|추천|공부|일정/.test(request)){
      steps=["parse_mock_csv","groupby_subject","select_lowest","draft_plan","verify_minutes"];
      report="학습 계획 초안 (가상 데이터 기준)\n우선 과목: "+worst+"\n30분: "+worst+" 문제 풀이\n15분: 틀린 문제 점검\n검증: 30분 + 15분 = 45분\n※ 실제 학생에게 적합한지 본인·교사가 검토해야 함";
    } else {
      steps=["check_allowed_tools","reject_unsupported"];
      report="지원하지 않는 요청입니다.\n'평균 분석해 줘' 또는 '학습 계획 세워 줘'를 입력해 보세요.\n허용되지 않은 파일 삭제·연락처 접근·외부 전송은 실행하지 않습니다.";
    }
    const log=steps.map(function(s,i){return "0"+(i+1)+"  [TOOL]  "+s+"  → OK";}).join("\n");
    const output=document.getElementById("agent-simulator-output");
    output.innerHTML='<pre>'+esc("요청: "+request+"\n\n"+log+"\n\n[RESULT]\n"+report)+'</pre><div class="agent-badges"><span>규칙 기반 시뮬레이션</span><span>실제 LLM 연결 없음</span><span>가상 데이터</span></div>';
  }
  function quiz() {
    const l=lesson(), q=l.quiz;
    const a=state.answers[l.id];
    const selected=state.checks[l.id]||[];
    const done=state.completed.includes(l.id);
    let html=contentHead("STEP 4 · 확인","형성평가와 기말고사 대비","정답을 선택하면 해설이 열립니다. 공개 연습 문항이며 실제 지필시험 문제는 아닙니다.");
    html+='<div class="panel"><h4>객관식 · 개념 확인</h4><p style="font-weight:800;color:#1f3652">'+esc(q.q)+'</p>';
    q.a.forEach(function(v,i){
      html+='<label class="quiz-option"><input type="radio" name="quiz-choice" value="'+i+'"'+(a===i?" checked":"")+'> <span>'+(i+1)+'. '+esc(v)+'</span></label>';
    });
    if(a!==undefined) {
      const ok=a===q.correct;
      html+='<div role="status" class="quiz-feedback '+(ok?"pass":"fail")+'">'+(ok?"정답입니다! ":"다시 생각해 보세요. ")+'정답: '+(q.correct+1)+'번.<br>'+esc(q.why)+'</div>';
    }
    html+='</div>';
    html+='<div class="panel"><h4>서술형 · 시험형 질문</h4><p>'+esc(l.written)+'</p><label for="written-note" class="term">나의 답안 / 근거 (이 브라우저에만 저장)</label><textarea id="written-note" maxlength="4000" placeholder="자신의 언어로 설명해 보세요. 실제 성적이나 개인 정보는 입력하지 마세요."></textarea><p>정답 자동 채점은 제공하지 않습니다. 교사의 안내와 비교해 논리적으로 설명해 보세요.</p></div>';
    html+='<div class="panel checklist-footer"><h4>이번 차시 완료 조건</h4><p>① AI 실습 탭에서 활동 3개 확인 (현재 '+selected.length+'/3) ② 객관식 1문항 응답 (현재 '+(a===undefined?"미응답":"응답")+') ③ 스스로 코드 결과 확인</p>';
    html+='<button type="button" id="mark-complete" class="'+(done?"secondary-btn":"primary-btn")+'">'+(done?"완료 표시 취소":"이번 차시 완료하기")+'</button>';
    if(!done && (selected.length<3 || a===undefined)) html+='<p class="tool-note">활동 3개와 객관식 응답 후 완료 표시할 수 있습니다. 정답을 틀려도 해설을 학습한 뒤 완료할 수 있습니다.</p>';
    html+='</div>';
    return html;
  }
  function teacher() {
    const l=lesson();
    let html=contentHead("교사용 · 공개 자료","50분 수업 진행 가이드","이 영역은 공개 안내입니다. 실제 시험 원안·정답·학생 개인정보를 게시하지 않습니다.");
    html+='<div class="teacher-alert"><b>중요:</b> 교사 보기 기능은 단순한 화면 전환입니다. 비밀번호로 보호되는 비밀자료 보관소가 아닙니다. 실전 지필평가 문항과 정답은 학교 승인 비공개 공간에서만 관리하세요.</div>';
    html+='<div class="panel teacher-panel"><h4>차시별 수업 순서</h4>';
    l.flow.forEach(function(s){const parts=s.split(":");html+='<div class="teacher-step"><b>'+esc(parts[0])+'</b><span>'+esc(parts.slice(1).join(":").trim())+'</span></div>';});
    html+='</div>';
    html+='<div class="panel"><h4>교사 발문·지도 포인트</h4><p>'+esc(l.teacher)+'</p></div>';
    html+='<div class="panel"><h4>평가 연계 포인트</h4><p>'+esc(l.written)+'</p><p>개념 이해, 코드 흐름 파악, 문제 해결 이유 설명을 중심으로 채점합니다.</p></div>';
    html+='<div class="panel"><h4>오늘의 실습 관찰 지표</h4>'+list(l.objectives,true)+'</div>';
    html+='<div class="panel"><h4>올해와 내년 모두 유지할 원칙</h4><p>각 차시 수업은 50분, 가상 데이터만 사용하며 API 키·개인 성적·학생 이름은 웹앱에 입력하지 않습니다. Python 실행은 학교에서 허용된 환경에서 합니다. 특정 제품의 UI는 매년 교사 점검 후 갱신합니다.</p></div>';
    html+='<button type="button" class="secondary-btn" id="print-guide">이 화면 인쇄하기</button>';
    return html;
  }
  function render() {
    const l=lesson();
    nav();
    document.getElementById("lesson-crumb").textContent="LESSON "+String(l.id).padStart(2,"0")+" / 12 · "+l.part;
    document.getElementById("lesson-title").textContent=l.title;
    document.getElementById("lesson-subtitle").textContent=l.subtitle;
    document.getElementById("textbook-link").textContent="교과 연계 · "+l.textbook;
    document.title=String(l.id).padStart(2,"0")+"차시 "+l.title+" | AI AGENT SMART LIFE";
    document.getElementById("teacher-tab").hidden=state.mode!=="teacher";
    if(state.mode!=="teacher"&&state.tab==="teacher")state.tab="concept";
    document.querySelectorAll("[data-tab]").forEach(function(el){el.setAttribute("aria-selected",String(el.dataset.tab===state.tab));});
    const c=document.getElementById("lesson-content");
    c.innerHTML=state.tab==="concept"?concepts():state.tab==="python"?python():state.tab==="agent"?agent():state.tab==="quiz"?quiz():teacher();
    const textarea=document.getElementById("written-note"); if(textarea)textarea.value=state.notes[l.id]||"";
    const editor=document.getElementById("python-editor");if(editor)editor.value=state.savedCodes[l.id]===undefined?codeOf(l):state.savedCodes[l.id];
    document.getElementById("teacher-toggle").setAttribute("aria-pressed",String(state.mode==="teacher"));
    document.getElementById("teacher-toggle").textContent=state.mode==="teacher"?"학생용으로 전환":"교사용 보기";
    document.getElementById("prev-lesson").disabled=state.selected===1;
    document.getElementById("next-lesson").disabled=state.selected===12;
    save();
  }
  function choose(id,scroll) {
    if(!validId(id))return;
    state.selected=id;
    state.tab="concept";
    try { history.replaceState(null,"","#lesson="+id); } catch(e) {}
    render();
    if(scroll!==false) document.getElementById("lesson-title").scrollIntoView({behavior:"smooth",block:"start"});
  }
  async function copyText(value) {
    try { await navigator.clipboard.writeText(value);toast("복사했습니다. 승인된 Python·AI 환경에 붙여 넣으세요.");}
    catch(e) {
      const t=document.createElement("textarea");
      t.value=value;t.style.position="fixed";t.style.opacity="0";
      document.body.appendChild(t);t.select();
      try {document.execCommand("copy");toast("복사했습니다.");}catch(e2){toast("자동 복사가 실패했습니다. 코드 영역에서 직접 복사하세요.");}
      t.remove();
    }
  }
  function downloadBlob(filename,content,type) {
    const blob=new Blob([content],{type:type});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},2000);
  }
  function downloadCsv() {
    downloadBlob("ai-agent-sample-study.csv","\ufeff"+course.sampleCSV+"\n","text/csv;charset=utf-8");
    toast("가상 데이터 CSV를 내려받았습니다.");
  }
  function exportProgress() {
    const p=JSON.stringify({format:"ai-agent-smart-life-progress",version:1,created:new Date().toISOString(),progress:state},null,2);
    downloadBlob("ai-agent-study-progress.json",p,"application/json;charset=utf-8");
    toast("진도 백업 파일을 저장했습니다. 메모에 개인정보가 없는지 확인해 주세요.");
  }
  document.getElementById("lesson-navigation").addEventListener("click",function(e){
    const b=e.target.closest("[data-lesson]");if(b)choose(Number(b.dataset.lesson),true);
  });
  document.getElementById("section-tabs").addEventListener("click",function(e){
    const b=e.target.closest("[data-tab]");if(!b)return;
    if(b.dataset.tab==="teacher"&&state.mode!=="teacher")return;
    state.tab=b.dataset.tab;render();
  });
  let pythonWorker=null, pythonRunId=0;
  function stopPython() {
    if(pythonWorker){pythonWorker.terminate();pythonWorker=null;}
    pythonRunId++;
    const out=document.getElementById("python-run-output");
    if(out)out.textContent="실행을 취소했습니다. 다시 실행할 수 있습니다.";
  }
  function runPython() {
    const editor=document.getElementById("python-editor");
    const out=document.getElementById("python-run-output");
    if(!editor||!out)return;
    const code=editor.value;
    if(!code.trim()){toast("Python 코드를 입력해 주세요.");return;}
    if(pythonWorker){pythonWorker.terminate();pythonWorker=null;}
    const runId=++pythonRunId;
    const lessonId=state.selected;
    out.textContent="실행 환경 연결 중. 라이브러리 다운로드에 시간이 걸리면 Colab을 사용하세요.";
    pythonWorker=new Worker("./ai-agent-python-worker.js");
    pythonWorker.onmessage=function(event){
      const data=event.data||{};
      if(data.id!==runId||state.selected!==lessonId||!document.getElementById("python-run-output"))return;
      const target=document.getElementById("python-run-output");
      if(data.type==="status"){target.textContent=data.message;return;}
      if(data.type==="error"){target.textContent="실행 오류: "+data.message;return;}
      if(data.type==="done"){
        target.textContent="실제 Python 출력:\n"+data.output;
        if(data.svg){
          const blob=new Blob([data.svg],{type:"image/svg+xml"});
          const url=URL.createObjectURL(blob);
          const image=document.createElement("img");
          image.src=url;image.alt="Python Matplotlib 실행 결과 그래프";
          image.className="executed-chart";
          image.onload=function(){URL.revokeObjectURL(url);};
          target.appendChild(image);
        }
      }
    };
    pythonWorker.onerror=function(){const target=document.getElementById("python-run-output");if(target)target.textContent="Python 실행 환경을 불러오지 못했습니다. 학교 PC에서 Colab 또는 로컬 Python을 이용하세요.";};
    pythonWorker.postMessage({id:runId,code:code});
  }
  document.getElementById("lesson-content").addEventListener("click",function(e){
    const el=e.target, btn=el.closest("button"); if(!btn)return;
    if(btn.dataset.nextTab){state.tab=btn.dataset.nextTab;render();return;}
    if(btn.id==="copy-code"){const editor=document.getElementById("python-editor");copyText(editor?editor.value:codeOf(lesson()));return;}
    if(btn.id==="run-python"){runPython();return;}
    if(btn.id==="stop-python"){stopPython();return;}
    if(btn.id==="reset-python"){delete state.savedCodes[state.selected];save();render();toast("원본 코드로 되돌렸습니다.");return;}
    if(btn.id==="copy-prompt"){copyText(lesson().prompt);return;}
    if(btn.id==="download-csv-inline"){downloadCsv();return;}
    if(btn.id==="print-guide"){window.print();return;}
    if(btn.id==="simulate-agent"){
      const value=(document.getElementById("agent-request").value||"").trim();
      if(!value){toast("먼저 목표를 입력해 주세요.");return;}
      agentSim(value);return;
    }
    if(btn.id==="mark-complete"){
      const id=state.selected,done=state.completed.includes(id);
      if(done){state.completed=state.completed.filter(function(x){return x!==id;});toast("완료 표시를 취소했습니다.");}
      else if((state.checks[id]||[]).length<3 || state.answers[id]===undefined){toast("활동 3개와 객관식 1문항을 먼저 확인해 주세요.");return;}
      else{state.completed.push(id);state.completed.sort(function(a,b){return a-b;});toast(id+"차시 학습을 완료했습니다!");}
      render();return;
    }
  });
  document.getElementById("lesson-content").addEventListener("change",function(e){
    const el=e.target;
    if(el.matches(".task-checkbox")){
      const id=state.selected,i=Number(el.dataset.index),current=state.checks[id]||[];
      state.checks[id]=el.checked?[...new Set(current.concat(i))]:current.filter(function(x){return x!==i;});
      document.getElementById("task-status").textContent=state.checks[id].length+" / 3개 활동 확인";
      save();
    }else if(el.name==="quiz-choice"){
      state.answers[state.selected]=Number(el.value);render();
    }else if(el.id==="chart-metric"){
      document.getElementById("data-chart").innerHTML=chart(el.value);
    }
  });
  document.getElementById("lesson-content").addEventListener("input",function(e){
    if(e.target.id==="written-note"){state.notes[state.selected]=e.target.value.slice(0,4000);save();}
    if(e.target.id==="python-editor"){state.savedCodes[state.selected]=e.target.value.slice(0,12000);save();}
  });
  document.getElementById("teacher-toggle").addEventListener("click",function(){
    state.mode=state.mode==="teacher"?"student":"teacher";
    state.tab=state.mode==="teacher"?"teacher":"concept";render();
  });
  document.getElementById("prev-lesson").addEventListener("click",function(){choose(state.selected-1,true);});
  document.getElementById("next-lesson").addEventListener("click",function(){choose(state.selected+1,true);});
  document.getElementById("download-csv-side").addEventListener("click",downloadCsv);
  document.getElementById("export-btn").addEventListener("click",exportProgress);
  document.getElementById("import-btn").addEventListener("click",function(){document.getElementById("import-file").click();});
  document.getElementById("import-file").addEventListener("change",function(e){
    const file=e.target.files&&e.target.files[0];if(!file)return;
    if(file.size>1024*1024){toast("진도 파일이 너무 큽니다(1MB 이하).");return;}
    file.text().then(function(text){
      const x=JSON.parse(text);
      if(x.format!=="ai-agent-smart-life-progress"||x.version!==1||!x.progress)throw Error("파일 형식 오류");
      if(!confirm("이 파일의 진도로 현재 브라우저 학습 기록을 교체합니다. 진행할까요?"))return;
      state=recover(x.progress);render();toast("진도를 가져왔습니다.");
    }).catch(function(){toast("올바른 진도 파일인지 확인해 주세요.");});
    e.target.value="";
  });
  window.addEventListener("hashchange",function(){
    const match=location.hash.match(/^#lesson=(\d+)$/);
    if(match && validId(Number(match[1]))&&state.selected!==Number(match[1]))choose(Number(match[1]),false);
  });
  const hash=location.hash.match(/^#lesson=(\d+)$/);
  if(hash && validId(Number(hash[1]))) state.selected=Number(hash[1]);
  render();
})();
