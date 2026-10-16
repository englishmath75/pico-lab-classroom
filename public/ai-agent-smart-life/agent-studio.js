(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const safe = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const initialCSV = "subject,score\nMath,78\nEnglish,90\nScience,62\nHistory,85";
  const tools = [
    ["read_csv","tool-read","CSV 자료를 읽고 점수가 0~100인지 검사"],
    ["analyze","tool-analyze","평균과 과목별 순위를 계산"],
    ["make_plan","tool-plan","점수가 낮은 과목부터 복습 계획 생성"],
    ["verify","tool-verify","계산값과 출력값을 재검증"]
  ];
  let lastRun = null;
  let running = false;
  const trace = [];

  function clear() {
    trace.length=0;
    $("agent-trace").textContent = "실행 준비 중…";
    $("agent-output").classList.add("hidden");
    $("agent-output").textContent = "";
    $("agent-chart").classList.add("hidden");
    $("agent-bars").replaceChildren();
    $("export-plan").disabled = true;
    $("export-trace").disabled = true;
    $("agent-progress").style.width = "0%";
    lastRun = null;
  }
  function writeTrace(stage, text, error) {
    trace.push({step:stage,text,error:!!error});
    $("agent-trace").innerHTML =
      '<ol>' + trace.map(item=>'<li class="'+(item.error?'fail':'')+'"><strong>'+safe(item.step)+'</strong> · '+safe(item.text)+'</li>').join("")+'</ol>';
  }
  function getBlueprint() {
    return {
      version: 1,
      project: "AI AGENT SMART LIFE",
      name: $("agent-name").value.trim().slice(0,50) || "학습 비서",
      goal: $("agent-goal").value,
      userRequest: $("agent-request").value.trim().slice(0,300),
      dataSchema: {columns:["subject","score"], scoreRange:[0,100], source:"fictional-csv"},
      tools: tools.filter(t=>$(t[1]).checked).map(t=>({name:t[0],description:t[2]})),
      verification: {validateScoreRange:true, compareMean:true, compareSubjects:true},
      executionMode: "local-rule-based",
      note: "This is NOT a generative AI tool-calling agent. External model connection requires separate authorization."
    };
  }
  function parseRows(raw) {
    const lines=raw.replace(/\r\n?/g,"\n").trim().split("\n").map(x=>x.trim()).filter(Boolean);
    if (lines.length<2 || lines.length>51) throw Error("최대 50개 과목의 가상 데이터와 헤더를 입력하세요.");
    if (lines[0].toLowerCase().replace(/\s+/g,"")!=="subject,score") throw Error("CSV 첫 줄은 subject,score여야 합니다.");
    const rows = lines.slice(1).map((line,i)=>{
      const arr=line.split(",");
      if(arr.length!==2) throw Error((i+2)+"행은 과목과 점수 두 칸이어야 합니다.");
      const subject=arr[0].trim();
      const rawScore=arr[1].trim();
      const score=Number(rawScore);
      if(!subject || subject.length>35 || rawScore==="" || !Number.isFinite(score) || score<0 || score>100)
        throw Error((i+2)+"행을 확인하세요: 이름 1~35자, 점수 0~100");
      return {subject,score};
    });
    if (new Set(rows.map(r=>r.subject.toLowerCase())).size !== rows.length) throw Error("중복된 과목 이름은 사용할 수 없습니다.");
    return rows;
  }
  function summarize(rows) {
    const avg=rows.reduce((acc,row)=>acc+row.score,0)/rows.length;
    return {average:avg, order:[...rows].sort((a,b)=>a.score-b.score || a.subject.localeCompare(b.subject,"ko"))};
  }
  function makePlan(analysis) {
    return analysis.order.map((r,i)=>({priority:i+1,subject:r.subject,score:r.score,minutes:30}));
  }
  function verify(rows,analysis,plan) {
    if(!rows.length) throw Error("데이터가 없습니다.");
    const actual=rows.reduce((s,r)=>s+r.score,0)/rows.length;
    if(Math.abs(actual-analysis.average)>0.000001) throw Error("평균 계산 검증이 실패했습니다.");
    if(analysis.order.length!==rows.length) throw Error("과목 개수가 일치하지 않습니다.");
    if(plan) {
      if(plan.length!==rows.length || !plan.every((item,i)=>item.minutes===30&&item.priority===i+1&&item.score===analysis.order[i].score&&item.subject===analysis.order[i].subject))
        throw Error("복습 계획 검증이 실패했습니다.");
    }
    return true;
  }
  function download(name,body,mime) {
    const url=URL.createObjectURL(new Blob([body],{type:mime||"application/json;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  const selected = id => $(id).checked;
  function reportChart(rows) {
    const max=100;
    const panel=$("agent-chart");panel.classList.remove("hidden");
    const bars=$("agent-bars");bars.replaceChildren();
    rows.forEach(row=>{
      const div=document.createElement("div");div.className="bar";
      div.style.height=Math.max(3, (row.score/max)*100)+"%";
      const val=document.createElement("span");val.textContent=String(row.score);
      const label=document.createElement("small");label.textContent=row.subject;
      div.append(val,label);bars.appendChild(div);
    });
  }
  function run() {
    if(running)return;
    running=true;$("agent-execute").disabled=true;clear();
    const goal=$("agent-goal").value;
    $("agent-status").textContent="도구 실행 중…";
    try {
      const input=$("agent-csv").value;
      writeTrace("목표 확인", $("agent-goal").selectedOptions[0].text);
      $("agent-progress").style.width="20%";
      if(!selected("tool-read"))throw Error("read_csv 도구가 허용되지 않았습니다. 읽기 도구를 켜세요.");
      const rows=parseRows(input);
      writeTrace("read_csv",rows.length+"개 과목·숫자 범위 검사 통과");
      $("agent-progress").style.width="40%";
      if(!selected("tool-analyze"))throw Error("analyze 도구가 비활성화되어 계산할 수 없습니다.");
      const analysis=summarize(rows);
      writeTrace("analyze","평균 "+analysis.average.toFixed(1)+"점, 최저 과목 "+analysis.order[0].subject);
      $("agent-progress").style.width="65%";
      let plan=null;
      if(goal==="plan") {
        if(!selected("tool-plan"))throw Error("make_plan 도구가 허용되지 않았습니다.");
        plan=makePlan(analysis);
        writeTrace("make_plan",plan.map(x=>x.subject+" 30분").join(" → "));
      }
      const verified=selected("tool-verify") ? verify(rows,analysis,plan) : false;
      writeTrace("verify",verified?"원본과 평균 및 계획 항목 일치 검증 통과":"검증 도구를 끄셨습니다. 결과는 미검증 상태입니다.");
      $("agent-progress").style.width="100%";
      let result="목표: "+$("agent-goal").selectedOptions[0].text+"\n";
      if(goal==="weak") result+="취약 과목: "+analysis.order[0].subject+" ("+analysis.order[0].score+"점)";
      else if(goal==="mean") result+="평균: "+analysis.average.toFixed(1)+"점";
      else result+="복습 우선순위\n"+plan.map(x=>x.priority+". "+x.subject+": "+x.minutes+"분").join("\n");
      result+="\n검증: "+(verified?"완료":"미검증")+" · 가상 데이터에 대한 규칙 기반 결과";
      $("agent-output").textContent=result;
      $("agent-output").classList.remove("hidden");
      reportChart(rows);
      lastRun={at:new Date().toISOString(),blueprint:getBlueprint(),data:rows,analysis,plan,verified,trace:[...trace]};
      $("export-trace").disabled=false;
      $("export-plan").disabled=!(plan&&verified);
      $("agent-status").textContent=verified?"실행 및 검증 완료":"실행 완료 · 검증되지 않은 결과";
      $("agent-status").className=verified?"success":"error";
    } catch(err) {
      writeTrace("오류",err.message,true);
      $("agent-progress").style.width="0%";
      $("agent-status").textContent="실행 실패 — 허용 도구 또는 CSV 내용을 확인하세요.";
      $("agent-status").className="error";
    } finally {
      running=false;
      $("agent-execute").disabled=false;
    }
  }
  function exportPlan() {
    if(!lastRun || !lastRun.verified || !lastRun.plan)return;
    const rows=lastRun.plan.map(p=>[p.priority,p.subject,p.score,p.minutes]);
    const csv="priority,subject,score,minutes\n"+rows.map(a=>a.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(",")).join("\n")+"\n";
    download("ai-study-plan.csv","\uFEFF"+csv,"text/csv;charset=utf-8");
  }
  function exportTrace() {
    if(lastRun)download("ai-agent-report.json",JSON.stringify(lastRun,null,2));
  }
  function exportBlueprint() {
    download("my-ai-agent-blueprint.json",JSON.stringify(getBlueprint(),null,2));
  }
  function reset() {
    if(!confirm("입력 데이터와 도구 설정을 초기 예제로 되돌릴까요?"))return;
    $("agent-name").value="나의 학습 도우미";
    $("agent-goal").value="plan";
    $("agent-request").value="가상 학습 데이터를 읽고, 취약 과목과 평균을 확인한 뒤 복습 계획을 만들어 줘.";
    $("agent-csv").value=initialCSV;
    tools.forEach(t=>$(t[1]).checked=true);
    clear();$("agent-trace").textContent="아직 실행 기록이 없습니다.";
    $("agent-status").textContent="초기 예제를 복원했습니다.";
    $("agent-status").className="hint";
    document.querySelectorAll("[data-check]").forEach(e=>e.checked=false);
    $("check-status").textContent="학습 성찰: 0 / 4";
  }
  function copyInstruction() {
    const b=getBlueprint();
    const text="당신은 "+b.name+"입니다. 사용자 목표: "+$("agent-goal").selectedOptions[0].text+
      ". 허용 도구: "+(b.tools.map(x=>x.name).join(", ")||"없음")+
      ". 입력은 가상의 CSV 데이터로 한정합니다. 입력값 0~100을 검사하고 분석에 필요한 최소 도구만 사용합니다. "+
      "검증하지 않은 수치는 확정적 표현으로 보고하지 않습니다. 금전 결제, 이메일 전송, 외부 파일 업로드를 하지 않습니다.";
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(text).then(()=>alert("설계 지침을 복사했습니다.")).catch(()=>alert("복사 권한을 허용해 주세요."));
    }else {
      const temp=document.createElement("textarea");temp.value=text;document.body.appendChild(temp);temp.select();
      try {document.execCommand("copy");alert("설계 지침을 복사했습니다.");}
      catch(_){alert("클립보드에 접근할 수 없습니다.");}
      temp.remove();
    }
  }
  $("agent-execute").addEventListener("click",run);
  $("agent-reset").addEventListener("click",reset);
  $("export-blueprint").addEventListener("click",exportBlueprint);
  $("export-trace").addEventListener("click",exportTrace);
  $("export-plan").addEventListener("click",exportPlan);
  $("copy-instruction").addEventListener("click",copyInstruction);
  document.querySelectorAll("[data-check]").forEach(el=>el.addEventListener("change",()=>{
    const checked=document.querySelectorAll("[data-check]:checked").length;
    $("check-status").textContent="학습 성찰: "+checked+" / 4";
  }));
})();