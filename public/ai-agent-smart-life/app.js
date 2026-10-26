(() => {
  "use strict";
  const lessons = window.AASL_LESSONS || [];
  const codeChallenges = window.AASL_CODE_CHALLENGES || [];
  const deepDives = window.AASL_DEEP_DIVE || [];
  deepDives.forEach((unit, i) => {
    if (lessons[i] && Array.isArray(unit.extraQuestions)) lessons[i].questions = lessons[i].questions.concat(unit.extraQuestions);
  });
  const $ = (id) => document.getElementById(id);
  if (!lessons.length) {
    $("lesson-content").textContent = "수업 데이터를 불러올 수 없습니다. 페이지를 새로고침해 주세요.";
    return;
  }

  let current = 0;
  let year = 2026;
  let progress;
  let pyodidePromise;
  let toastTimer;
  let running = false;
  let latestAgentCSV = "";
  // Visible public practice items only; the original 60 questions are never mutated.
  let displayedQuestions = [];
  const SAMPLE_CSV = "subject,score\nMath,72\nEnglish,88\nScience,64\nHistory,81";

  function safe(s) {
    return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  const key = () => "aasl-progress-v1-" + year;
  const emptyProgress = () => ({ version: 1, year, studentCode: "", completed: [], quizzes: {}, notes: {}, updatedAt: null });
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(key()));
      if (!raw || !Array.isArray(raw.completed) || typeof raw.quizzes !== "object" || typeof raw.notes !== "object")
        return emptyProgress();
      return { version: 1, year, studentCode: typeof raw.studentCode==="string" ? raw.studentCode.slice(0,6) : "", completed: [...new Set(raw.completed.filter(n => Number.isInteger(n) && n >= 0 && n < lessons.length))],
        quizzes: raw.quizzes || {}, notes: raw.notes || {}, updatedAt: raw.updatedAt || null };
    } catch (_) { return emptyProgress(); }
  }
  function persist() {
    progress.updatedAt = new Date().toISOString();
    try { localStorage.setItem(key(), JSON.stringify(progress)); }
    catch (_) { notify("브라우저에 저장하지 못했습니다. 기록을 별도로 내보내세요."); }
  }
  function notify(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("hidden"), 3700);
  }
  const button = (label, cls, id) => '<button type="button" class="' + cls + '" id="' + id + '">' + safe(label) + '</button>';
  function refreshStats() {
    const count = progress.completed.length;
    $("stat-complete").textContent = count + " / " + lessons.length;
    $("progress-bar").style.width = (100 * count / lessons.length) + "%";
    const quizScores = Object.values(progress.quizzes).filter(x => x && Number.isFinite(x.score)).map(x => x.score);
    $("stat-quiz").textContent = quizScores.length ?
      Math.round(100 * quizScores.reduce((a,b) => a + b, 0) / quizScores.length) + "%" : "—";
    $("stat-current").textContent = String(current + 1).padStart(2,"0");
  }
  function renderNavigation() {
    $("lesson-nav").innerHTML = lessons.map((lesson, i) => {
      const complete = progress.completed.includes(i);
      return '<button type="button" data-lesson="' + i + '" class="lesson-link ' +
        (i === current ? "active " : "") + (complete ? "done" : "") +
        '" aria-current="' + (i === current ? "step" : "false") + '">' +
        '<span class="num">' + (complete ? "✓" : String(i+1).padStart(2,"0")) + '</span><span>' +
        safe(lesson.title) + '</span></button>';
    }).join("");
    $("lesson-nav").querySelectorAll("[data-lesson]").forEach(el =>
      el.addEventListener("click", () => {
        selectLesson(Number(el.dataset.lesson));
        $("sidebar").classList.remove("show");
        $("mobile-menu").setAttribute("aria-expanded", "false");
      }));
  }
  function quizHtml(questions) {
    return questions.map((q,i) =>
      '<div class="quiz-question"><b>Q' + (i+1) + '. ' + safe(q[0]) + '</b>' +
      '<div class="quiz-options">' + q[1].map((opt,j) =>
      '<label><input type="radio" name="quiz-' + i + '" value="' + j + '"/><span>' +
      String.fromCharCode(9312+j) + ' ' + safe(opt) + '</span></label>').join("") +
      '</div><div class="quiz-feedback hidden" id="feedback-' + i + '"></div></div>').join("");
  }
  function renderEnrichment(n) {
    const unit = deepDives[n];
    if (!unit) return "";
    const concepts = unit.concepts.map((c,i)=>
      '<div class="unit-card" style="margin:9px 0">' +
      '<b>'+(i+1)+'. '+safe(c[0])+'</b><p>'+safe(c[1])+'</p>' +
      '<p class="hint">예시: '+safe(c[2])+'</p></div>').join("");
    const activities=unit.practice.map((a,i)=>'<li>'+safe(a)+'</li>').join("");
    return '<section class="panel"><span class="pill">DEEP DIVE / 알아보기</span>' +
      '<h3 style="margin-top:12px">생각을 여는 질문</h3>' +
      '<div class="taskbox">'+safe(unit.hook)+'</div>' +
      '<h3 style="margin-top:20px">핵심 개념 세 가지</h3>'+concepts +
      '<h3 style="margin-top:20px">직접 탐구해 볼 활동</h3><ol>'+activities+'</ol>' +
      '<details class="teacher"><summary>코드 오류 탐구 / 더 생각하기</summary><p>'+safe(unit.debug)+'</p></details>' +
      '<details class="teacher"><summary>생성형 AI에 질문해 보기 — 선택 학습</summary><p class="hint">개인정보와 실제 성적을 업로드하지 마세요. 교사가 허용한 도구가 있을 때에만 사용하세요.</p>' +
      '<p>'+safe(unit.prompt)+'</p>'+button("프롬프트 복사","action","copy-prompt")+'</details>' +
      '</section>';
  }
  function challengeHtml(n) {
    const bank = codeChallenges[n];
    if (!bank || !Array.isArray(bank.items)) return "";
    return '<section class="panel" id="code-challenge-section">' +
      '<span class="pill">PYTHON CODE CHALLENGE</span><h3 style="margin-top:12px">지필시험 대비 · 빈칸 코드 완성</h3>' +
      '<p class="hint">코드의 빈칸(___)에 들어갈 함수·키워드를 적어 보세요. 이 연습은 선택형 심화 활동입니다.</p>' +
      bank.items.map((c,i)=>
        '<div class="unit-card" style="margin-bottom:11px">' +
        '<b>도전 '+(i+1)+'. '+safe(c.question)+'</b>' +
        '<pre style="white-space:pre-wrap;overflow-wrap:anywhere;background:#14233a;color:#e6f7ff;border-radius:9px;padding:13px;font-size:12px">'+safe(c.code)+'</pre>' +
        '<label for="challenge-input-'+i+'" class="hint">빈칸에 들어갈 코드</label>' +
        '<input id="challenge-input-'+i+'" class="challenge-input" type="text" maxlength="60" autocomplete="off" spellcheck="false" placeholder="함수·연산자·예약어 입력" aria-label="'+(i+1)+'번 코드 빈칸"/>' +
        '<div class="challenge-feedback" role="status" id="challenge-feedback-'+i+'"></div>' +
        '<details><summary style="font-size:12px;margin-top:8px">힌트 확인</summary><p class="hint">'+safe(c.hint)+'</p></details></div>'
      ).join("") +
      button("빈칸 코드 채점하기","primary","check-challenge") +
      '<p class="hint" id="challenge-score" role="status"></p></section>';
  }
  function gradeChallenges() {
    const bank=codeChallenges[current];
    if(!bank)return;
    let correct=0;
    bank.items.forEach((item,i)=>{
      const value=$("challenge-input-"+i).value.trim().replace(/\s/g,"");
      const ok=!!value && item.answers.some(answer=>answer.replace(/\s/g,"")===value);
      const out=$("challenge-feedback-"+i);
      if(ok)correct++;
      out.style.color=ok?"#127553":"#9e4e1b";
      out.style.fontWeight="700";
      out.style.fontSize="12px";
      out.textContent=(ok?"정답 · ":"다시 학습 · ")+item.explanation;
    });
    $("challenge-score").textContent="빈칸 코드 정답 "+correct+" / "+bank.items.length;
  }
  function agentHtml() {
    return '<section class="panel"><span class="pill">RULE-BASED TOOL LAB</span>' +
      '<h3 style="margin-top:12px">도구를 실행하는 에이전트 흐름 체험</h3>' +
      '<p>CSV를 읽고 목표에 맞는 분석 도구를 선택합니다. 이 체험은 생성형 AI가 아닌 <b>규칙 기반 자동화</b>입니다.</p>' +
      '<div class="agent-demo"><label for="csv-data"><b>가상 CSV 데이터</b></label>' +
      '<textarea id="csv-data" spellcheck="false"></textarea>' +
      '<label for="agent-task" style="display:block;margin-top:11px;font-size:13px"><b>수행 목표</b></label>' +
      '<select id="agent-task"><option value="weak">취약 과목 찾기</option><option value="mean">평균 점수 계산하기</option>' +
      '<option value="plan">우선 복습 계획 만들기</option></select> ' +
      button("도구 실행 → 검증", "primary", "agent-run") +
      '<div id="agent-steps" class="agent-steps" role="status">목표를 확인하고 실행 버튼을 누르세요.</div>' +
      button("복습 계획 CSV 저장","action hidden","agent-export") + '</div></section>';
  }
  function renderLesson() {
    const lesson = lessons[current];
    const completed = progress.completed.includes(current);
    displayedQuestions = lesson.questions.map(q => window.AASL_shuffleQuestion(q).question);
    $("lesson-heading").textContent = "LESSON " + String(current+1).padStart(2,"0") + " · " + lesson.title;
    $("lesson-subheading").textContent = lesson.tag + " · 50분";
    let html = '<section class="panel"><span class="pill">' + safe(lesson.tag) + '</span>' +
      '<h3 style="margin-top:12px">오늘의 학습 목표</h3><p class="lead">' + safe(lesson.goal) + '</p>' +
      '<div class="time-grid"><div><b>5분</b>도입</div><div><b>10분</b>개념</div>' +
      '<div><b>20분</b>실습</div><div><b>10분</b>AI·적용</div><div><b>5분</b>평가</div></div></section>' +
      '<section class="panel"><span class="pill">01 / UNDERSTAND</span>' +
      '<h3 style="margin-top:12px">핵심 개념</h3><p>' + safe(lesson.concept) + '</p>' +
      '<div class="unit-card"><b>생활 속 사례</b><p>' + safe(lesson.example) + '</p></div></section>' +
      renderEnrichment(current) + '<section class="panel"><span class="pill">02 / PYTHON LAB</span><h3 style="margin-top:12px">Python 코드를 수정하고 실행해 보세요</h3>' +
      '<p class="hint">먼저 결과를 예측한 후 실행하세요. 처음 실행할 때에는 인터넷과 Python 패키지 다운로드가 필요합니다. 코드는 현재 브라우저에서 실행됩니다.</p>' +
      '<div class="lab"><div class="lab-top"><span>● python · lesson_' + String(current+1).padStart(2,"0") + '.py</span>' +
      button("원본 복원","","reset-code") + '</div><textarea id="code-editor" spellcheck="false" aria-label="Python 코드 편집기"></textarea>' +
      '<div class="lab-controls">' + button("▶ Python 실행","primary","run-code") +
      '<small id="runtime-state">Python 엔진 준비 전 · 실행 시 다운로드</small></div></div>' +
      '<div class="output" id="code-output" role="status">실행 결과가 여기에 표시됩니다.</div>' +
      '<div class="taskbox"><b>도전 과제</b><div>' + safe(lesson.task) + '</div></div>' +
      '<details class="teacher"><summary>원본 코드 예상 결과 확인</summary><p>먼저 스스로 결과를 예측한 뒤 비교하세요.</p><pre>' +
      safe(lesson.expect) + '</pre></details></section>';
    html += challengeHtml(current);
    if (current === 0 || (current >= 8 && current <= 10)) html += agentHtml();
    html += '<section class="panel"><span class="pill">03 / CHECK</span>' +
      '<h3 style="margin-top:12px">형성평가 · ' + lesson.questions.length + '문항</h3>' +
      '<p class="hint">전부 응답한 뒤 채점하세요. 결과는 현재 학년도에 저장됩니다.</p>' +
      quizHtml(displayedQuestions) + button("정답 확인·채점","primary","grade-quiz") +
      '<p id="quiz-score" class="lead" role="status"></p></section>' +
      '<section class="panel"><span class="pill">04 / REFLECT</span><h3 style="margin-top:12px">오늘의 학습 정리</h3>' +
      '<p class="hint">핵심 개념과 고친 오류를 2~3문장으로 작성하세요.</p>' +
      '<div class="taskbox"><b>마무리 질문</b><div>'+safe((deepDives[current]||{}).exit||"오늘의 학습 목표를 다시 설명해 보세요.")+'</div></div>' +
      '<textarea id="reflection" class="notes" placeholder="오늘 새로 알게 된 것과 다음에 보완할 점"></textarea>' +
      '<p class="hint">메모는 현재 브라우저에만 자동 저장됩니다.</p>' +
      button(completed ? "✓ 완료 기록됨" : "학습 완료 표시","primary","mark-complete") +
      '<p class="hint" id="completion-note">형성평가를 채점한 뒤 완료할 수 있습니다.</p>' +
      '<details class="teacher"><summary>50분 수업 운영 가이드</summary>' +
      '<p>0~5분: 지난 학습 연결, 생활 속 문제 제시<br>' +
      '5~15분: 오늘의 개념과 코드 핵심 설명<br>' +
      '15~35분: 실행 결과 예측 → 코드 실행 → 수정 실습<br>' +
      '35~45분: 도전 과제 및 AI 활용·검증 토의<br>' +
      '45~50분: 형성평가 채점과 학습 정리</p>' +
      '<p><b>학습 목표:</b> ' + safe(lesson.goal) + '</p></details></section>';
    $("lesson-content").innerHTML = html;
    if ($("copy-prompt")) $("copy-prompt").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(deepDives[current].prompt); notify("프롬프트를 복사했습니다."); }
      catch (_) { notify("브라우저의 클립보드 권한을 확인하세요."); }
    });
    $("code-editor").value = lesson.code;
    $("reflection").value = progress.notes[current] || "";
    $("reflection").addEventListener("input", (e) => { progress.notes[current] = e.target.value; persist(); });
    $("reset-code").addEventListener("click", () => {
      if (!confirm("현재 작성한 코드를 원본으로 복원할까요?")) return;
      $("code-editor").value = lesson.code;
      $("code-output").textContent = "원본 코드로 복원했습니다.";
    });
    $("run-code").addEventListener("click", runPython);
    if ($("check-challenge")) $("check-challenge").addEventListener("click", gradeChallenges);
    $("grade-quiz").addEventListener("click", gradeQuiz);
    $("mark-complete").addEventListener("click", markCompleted);
    if ($("agent-run")) {
      $("csv-data").value = SAMPLE_CSV;
      $("agent-run").addEventListener("click", runAgentDemo);
      $("agent-export").addEventListener("click", () => {
        if (latestAgentCSV) download("study-plan-" + year + ".csv", "\uFEFF" + latestAgentCSV,"text/csv;charset=utf-8");
      });
    }
    const previousQuiz = progress.quizzes[current];
    if (previousQuiz && Number.isFinite(previousQuiz.score)) {
      $("quiz-score").textContent = "이전 채점 기록: " + Math.round(previousQuiz.score*100) + "점 · 다시 풀어 갱신할 수 있습니다.";
    }
    $("previous").disabled = current === 0;
    $("next").disabled = current === lessons.length-1;
    refreshStats();
  }
  function selectLesson(index) {
    if (!Number.isInteger(index) || index < 0 || index >= lessons.length) return;
    current = index;
    renderNavigation();
    renderLesson();
    try { history.replaceState(null,"","#lesson-" + (index+1)); } catch (_) {}
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function gradeQuiz() {
    const questions=displayedQuestions;
    const answers=[];
    for (let i=0;i<questions.length;i++) {
      const selected=document.querySelector('input[name="quiz-'+i+'"]:checked');
      if (!selected) { notify("모든 문항에 답한 뒤 채점해 주세요."); return; }
      answers.push(Number(selected.value));
    }
    let right=0;
    questions.forEach((q,i)=>{
      const yes=answers[i]===q[2];
      if (yes) right++;
      const feedback=$("feedback-"+i);
      feedback.classList.remove("hidden");
      feedback.textContent=(yes?"정답입니다. ":"오답입니다. 정답: "+String.fromCharCode(9312+q[2])+". ")+q[3];
      feedback.style.background=yes?"#eff9f4":"#fff4e5";
      feedback.style.color=yes?"#0b634d":"#9b4b0c";
    });
    const score=right/questions.length;
    progress.quizzes[current]={score,answers,at:new Date().toISOString()};
    persist();
    $("quiz-score").textContent="이번 채점 결과: "+right+" / "+questions.length+"문항 ("+Math.round(score*100)+"점)";
    notify("채점 결과가 저장되었습니다.");
    refreshStats();
  }
  function markCompleted() {
    if (!progress.quizzes[current]) { notify("형성평가를 먼저 채점하세요."); return; }
    if (!progress.completed.includes(current)) {
      progress.completed.push(current);
      progress.completed.sort((a,b)=>a-b);
      persist();
      notify("차시 학습 완료가 저장되었습니다.");
    } else notify("이미 완료한 차시입니다.");
    renderNavigation();
    $("mark-complete").textContent="✓ 완료 기록됨";
    refreshStats();
  }
  async function loadPythonRuntime(status) {
    if (!pyodidePromise) {
      if (typeof window.loadPyodide !== "function") throw new Error("Python 로더를 불러오지 못했습니다. 네트워크 연결을 확인하세요.");
      pyodidePromise = window.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"})
        .catch(err=>{pyodidePromise=null;throw err;});
    }
    if (status) status.textContent="Python 엔진 다운로드 및 준비 중...";
    return pyodidePromise;
  }
  async function runPython() {
    if (running) return;
    const runBtn=$("run-code"),status=$("runtime-state"),output=$("code-output");
    running=true;
    runBtn.disabled=true;
    output.textContent="코드를 실행하고 있습니다...";
    try {
      const py=await loadPythonRuntime(status);
      const code=$("code-editor").value;
      if (code.length > 14000) throw new Error("실습 코드가 너무 깁니다. 14,000자 이하로 작성하세요.");
      const packages=[];
      if (/(?:\bimport\s+pandas\b|\bfrom\s+pandas\b)/.test(code)) packages.push("pandas");
      if (/(?:\bimport\s+matplotlib\b|\bfrom\s+matplotlib\b)/.test(code)) packages.push("matplotlib");
      if (/(?:\bimport\s+sklearn\b|\bfrom\s+sklearn\b)/.test(code)) packages.push("scikit-learn");
      if (packages.length) {
        status.textContent="실습 라이브러리 로딩 중: "+packages.join(", ");
        await py.loadPackage(packages);
      }
      const script = "import io, contextlib, traceback, json, base64\n" +
        "__aasl_out=io.StringIO()\n__aasl_error=''\n__aasl_plot=''\n" +
        "try:\n" +
        "    with contextlib.redirect_stdout(__aasl_out), contextlib.redirect_stderr(__aasl_out):\n" +
        "        exec(compile("+JSON.stringify(code)+", '<student>', 'exec'), {'__name__':'__main__'})\n" +
        "    try:\n" +
        "        import sys\n" +
        "        if 'matplotlib.pyplot' in sys.modules:\n" +
        "            import matplotlib.pyplot as plt\n" +
        "            if plt.get_fignums():\n" +
        "                __aasl_buf=io.BytesIO()\n" +
        "                plt.savefig(__aasl_buf, format='png', bbox_inches='tight')\n" +
        "                __aasl_plot=base64.b64encode(__aasl_buf.getvalue()).decode('ascii')\n" +
        "                plt.close('all')\n" +
        "    except Exception:\n" +
        "        __aasl_out.write('\\n그래프 이미지 변환 중 오류가 발생했습니다.')\n" +
        "except Exception:\n" +
        "    __aasl_error=traceback.format_exc(limit=5)\n" +
        "__aasl_result=json.dumps({'text':__aasl_out.getvalue(),'error':__aasl_error,'plot':__aasl_plot})\n";
      await py.runPythonAsync(script);
      const result=JSON.parse(py.globals.get("__aasl_result"));
      output.textContent=result.error || result.text || "코드가 실행되었습니다. 출력할 내용이 없습니다.";
      if (result.plot) {
        const img=document.createElement("img");
        img.alt="Python Matplotlib로 작성한 그래프";
        img.src="data:image/png;base64,"+result.plot;
        output.appendChild(img);
      }
      status.textContent="실행 완료 · 브라우저 로컬 Python";
    } catch(err) {
      output.textContent="실행 오류: "+(err && err.message ? err.message : String(err));
      status.textContent="오류 · 네트워크 및 코드 확인";
    } finally {
      running=false;
      runBtn.disabled=false;
    }
  }
  function parseSimpleCSV(input) {
    const lines=input.trim().replace(/\r/g,"").split("\n").map(s=>s.trim()).filter(Boolean);
    if (lines.length<2 || lines.length>101) throw new Error("헤더를 포함해 2~101줄의 CSV를 입력하세요.");
    if (lines[0].toLowerCase().replace(/\s/g,"")!=="subject,score")
      throw new Error("첫 줄은 subject,score 이어야 합니다.");
    const rows=lines.slice(1).map((line,i)=>{
      const parts=line.split(",");
      if(parts.length!==2) throw new Error((i+2)+"행: 과목과 점수 두 칸을 입력하세요.");
      const subject=parts[0].trim(), score=Number(parts[1].trim());
      if(!subject || !Number.isFinite(score) || score<0 || score>100 || parts[1].trim()==="")
        throw new Error((i+2)+"행: 이름과 0~100점 사이의 숫자를 확인하세요.");
      return {subject,score};
    });
    return rows;
  }
  function csvSafeSubject(subject) {
    const text=String(subject);
    // Spreadsheet apps may evaluate formula-like CSV cells even when quoted.
    const guarded=/^[\u0000-\u0020]*[=+\-@]/.test(text) ? "'"+text : text;
    return '"'+guarded.replace(/"/g,'""')+'"';
  }
  function runAgentDemo() {
    const output=$("agent-steps");
    latestAgentCSV="";
    $("agent-export").classList.add("hidden");
    try {
      const rows=parseSimpleCSV($("csv-data").value);
      const task=$("agent-task").value;
      const tool=task==="mean"?"average_tool":task==="weak"?"weak_subject_tool":"study_plan_tool";
      const average=rows.reduce((a,b)=>a+b.score,0)/rows.length;
      const weak=rows.reduce((a,b)=>a.score<=b.score?a:b);
      let message="1. 목표 파악 → "+$("agent-task").selectedOptions[0].text+"\n";
      message+="2. CSV 도구 실행 → "+rows.length+"개 과목, 점수 검증 완료\n";
      message+="3. 분석 도구 선택 → "+tool+"\n";
      if(task==="mean") message+="4. 실행 결과 → 평균 "+average.toFixed(1)+"점\n";
      else if(task==="weak") message+="4. 실행 결과 → 취약 과목: "+weak.subject+" ("+weak.score+"점)\n";
      else {
        const sorted=[...rows].sort((a,b)=>a.score-b.score);
        message+="4. 실행 결과 → 복습 우선순위: "+sorted.map(x=>x.subject).join(" → ")+"\n";
        latestAgentCSV="priority,subject,score,plan_minutes\n"+
          sorted.map((r,i)=>[i+1,csvSafeSubject(r.subject),r.score,30].join(",")).join("\n")+"\n";
        $("agent-export").classList.remove("hidden");
      }
      message+="5. 결과 검증 → 점수 0~100 확인, 가상 입력에 근거한 결과\n";
      message+="※ 생성형 AI가 판단한 결과가 아니라 미리 정한 규칙으로 실행한 결과입니다.";
      output.textContent=message;
    } catch(err) { output.textContent="입력 검증 오류: "+err.message; }
  }
  function download(name,text,type) {
    const blob=new Blob([text],{type:type||"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download=name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportProgress() {
    const proposed = $("student-code").value.trim().toUpperCase();
    if (proposed && !/^[A-Z][0-9]{2,3}$/.test(proposed)) {
      notify("익명 코드 형식은 A01, A02, B123처럼 영문 대문자 1자+숫자 2~3자리입니다.");return;
    }
    progress.studentCode = proposed;
    persist();
    download("ai-agent-smart-life-"+year+"-"+(proposed||"anonymous")+"-progress.json",JSON.stringify(progress,null,2));
    notify("학습 기록을 JSON 파일로 내려받았습니다.");
  }
  function importProgress(file) {
    if (!file || file.size>300000) {notify("300KB 이하의 JSON 기록 파일만 가져올 수 있습니다.");return;}
    const reader=new FileReader();
    reader.onload=()=>{
      try {
        const imported=JSON.parse(reader.result);
        if(imported.version!==1 || imported.year!==year || !Array.isArray(imported.completed) ||
          !imported.quizzes || typeof imported.quizzes!=="object" || !imported.notes || typeof imported.notes!=="object")
          throw new Error("현재 학년도와 형식이 일치하지 않습니다.");
        const valid=imported.completed.every(n=>Number.isInteger(n)&&n>=0&&n<lessons.length);
        if(!valid) throw new Error("잘못된 차시 번호가 포함되어 있습니다.");
        if(!confirm(year+"학년도 현재 학습 기록을 가져온 기록으로 교체할까요?"))return;
        const clean=emptyProgress();
        clean.completed=[...new Set(imported.completed)];
        for(const [k,v] of Object.entries(imported.quizzes)) {
          if(/^(?:[0-9]|1[01])$/.test(k) && v && Number.isFinite(v.score) && v.score>=0 && v.score<=1)
            clean.quizzes[k]={score:v.score,answers:Array.isArray(v.answers)?v.answers.slice(0,10):[],at:String(v.at||"")};
        }
        for(const [k,v] of Object.entries(imported.notes))
          if(/^(?:[0-9]|1[01])$/.test(k) && typeof v==="string") clean.notes[k]=v.slice(0,4000);
        clean.studentCode=typeof imported.studentCode==="string" && /^[A-Z][0-9]{2,3}$/.test(imported.studentCode) ? imported.studentCode : "";
        progress=clean;
        $("student-code").value=progress.studentCode;
        persist();
        renderNavigation();
        renderLesson();
        notify("학습 기록을 가져왔습니다.");
      }catch(err){notify("가져오기 실패: "+err.message);}
      $("import-file").value="";
    };
    reader.readAsText(file);
  }

  $("school-year").addEventListener("change",function(){
    const proposed=Number(this.value);
    if(!Number.isInteger(proposed)||proposed<2026||proposed>2100){
      this.value=year;notify("2026~2100 사이의 학년도를 입력하세요.");return;
    }
    year=proposed;progress=load();$("student-code").value=progress.studentCode;selectLesson(0);
    notify(year+"학년도 학습 기록을 불러왔습니다.");
  });
  $("export-progress").addEventListener("click",exportProgress);
  $("import-progress").addEventListener("click",()=>$("import-file").click());
  $("import-file").addEventListener("change",e=>importProgress(e.target.files[0]));
  $("previous").addEventListener("click",()=>selectLesson(current-1));
  $("next").addEventListener("click",()=>selectLesson(current+1));
  $("mobile-menu").addEventListener("click",()=>{
    const open=$("sidebar").classList.toggle("show");
    $("mobile-menu").setAttribute("aria-expanded",String(open));
  });

  progress=load();
  $("student-code").value=progress.studentCode;
  $("student-code").addEventListener("change",function(){
    const code=this.value.trim().toUpperCase();
    if (code && !/^[A-Z][0-9]{2,3}$/.test(code)) {notify("익명 코드 예시: A01, A29, B103");return;}
    this.value=code;
    progress.studentCode=code;persist();
  });
  const match=window.location.hash.match(/^#lesson-(\d+)$/);
  if(match) current=Math.min(lessons.length-1,Math.max(0,Number(match[1])-1));
  renderNavigation();
  renderLesson();
})();