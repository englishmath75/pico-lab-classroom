(() => {
  "use strict";
  const $=id=>document.getElementById(id);
  let records=[];
  const validCode = code => /^[A-Z][0-9]{2,3}$/.test(code);
  const timeValue = value => {
    const n=Date.parse(String(value||""));
    return Number.isFinite(n)?n:0;
  };
  const readOne=async(file,index,year)=>{
    if(file.size>300000)throw Error(file.name+": 300KB를 초과합니다.");
    let obj;
    try {obj=JSON.parse(await file.text());}catch(_){throw Error(file.name+": JSON을 읽지 못했습니다.");}
    if(obj.version!==1 || obj.year!==year || !Array.isArray(obj.completed) || typeof obj.quizzes!=="object" || obj.quizzes===null)
      throw Error(file.name+": 학년도나 기록 형식이 일치하지 않습니다.");
    const completed=[...new Set(obj.completed)];
    if(!completed.every(x=>Number.isInteger(x)&&x>=0&&x<12))
      throw Error(file.name+": 유효하지 않은 차시 번호가 있습니다.");
    const scores=Object.entries(obj.quizzes).filter(([k,v]) =>
      /^(?:[0-9]|1[01])$/.test(k) && v && Number.isFinite(v.score) && v.score>=0 && v.score<=1
    ).map(([,v])=>v.score);
    const fromContent=String(obj.studentCode||"").trim().toUpperCase();
    const nameMatch=file.name.toUpperCase().match(/(?:^|[-_])(A[0-9]{2,3})(?:[-_.]|$)/);
    const code=validCode(fromContent)?fromContent:nameMatch?nameMatch[1]:"익명-"+String(index+1).padStart(2,"0");
    const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*100):null;
    return {code,completed,scores,avg,year,updatedAt:String(obj.updatedAt||""),updatedMs:timeValue(obj.updatedAt)};
  };
  const csvCell=v=>'"'+String(v).replace(/"/g,'""')+'"';
  function draw() {
    const count=records.length;
    const completions=records.map(r=>r.completed.length);
    const totalComplete=completions.reduce((a,b)=>a+b,0);
    const allScores=records.flatMap(r=>r.scores);
    const meanScore=allScores.length?Math.round(allScores.reduce((a,b)=>a+b,0)/allScores.length*100):null;
    $("total").textContent=count+"명";
    $("done").textContent=count?(totalComplete/count).toFixed(1)+" / 12":"—";
    $("average").textContent=meanScore!==null?meanScore+"%":"—";
    $("all-done").textContent=records.filter(r=>r.completed.length===12).length+"명";
    const bars=$("bars");bars.replaceChildren();
    for(let i=0;i<12;i++){
      const value=records.filter(r=>r.completed.includes(i)).length;
      const bar=document.createElement("div");bar.className="bar";
      bar.style.height=count?Math.max(2,100*value/count)+"%":"2%";
      const label=document.createElement("small");label.textContent=String(i+1);
      const total=document.createElement("span");total.textContent=String(value);
      bar.append(total,label);bars.appendChild(bar);
    }
    const tbody=$("rows");tbody.replaceChildren();
    if(!count){
      const tr=document.createElement("tr");const cell=document.createElement("td");
      cell.colSpan=5;cell.textContent="표시할 학습 기록이 없습니다.";tr.appendChild(cell);tbody.appendChild(tr);
    }else{
      for(const r of records){
        const tr=document.createElement("tr");
        const data=[r.code,r.completed.length+" / 12",Math.round(r.completed.length/12*100)+"%",r.avg!==null?r.avg+"%":"미응시",r.updatedAt ? r.updatedAt.slice(0,19).replace("T"," "):"기록 없음"];
        for(const value of data){const td=document.createElement("td");td.textContent=value;tr.appendChild(td);}
        tbody.appendChild(tr);
      }
    }
    $("download-csv").disabled=!records.length;
  }
  async function analyze(){
    const year=Number($("year").value);
    const files=Array.from($("files").files||[]);
    $("errors").textContent="";
    if(!Number.isInteger(year)||year<2026||year>2100){$("errors").textContent="2026~2100 사이의 학년도를 선택하세요.";return;}
    if(!files.length){$("errors").textContent="학생이 내려받은 JSON 파일을 선택하세요.";return;}
    if(files.length>100){$("errors").textContent="한 번에 최대 100개 파일까지 분석합니다.";return;}
    const errors=[];
    const byCode=new Map();
    const parsed=await Promise.all(files.map(async (f,i)=>{
      try{return await readOne(f,i,year);}
      catch(e){errors.push(e.message);return null;}
    }));
    for(const row of parsed){
      if(!row)continue;
      const existing=byCode.get(row.code);
      if(!existing||row.updatedMs>=existing.updatedMs)byCode.set(row.code,row);
    }
    records=[...byCode.values()].sort((a,b)=>a.code.localeCompare(b.code,"ko"));
    const duplicateCount=parsed.filter(Boolean).length-records.length;
    $("errors").textContent=
      (errors.length?errors.length+"개 파일 제외: "+errors.slice(0,3).join(" / ")+(errors.length>3?" …":""):"")+
      (duplicateCount?(errors.length?" | ":"")+duplicateCount+"개 중복 코드는 최신 기록만 유지":"");
    draw();
  }
  function exportCsv(){
    if(!records.length)return;
    const lines=[["code","completed_lessons","completion_rate_percent","quiz_mean_percent","updated_at"]];
    for(const r of records)lines.push([r.code,r.completed.length,Math.round(100*r.completed.length/12),r.avg===null?"":r.avg,r.updatedAt]);
    const csv=lines.map(row=>row.map(csvCell).join(",")).join("\r\n")+"\r\n";
    const url=URL.createObjectURL(new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download="AI_AGENT_SMART_LIFE_"+$("year").value+"_progress.csv";
    document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  $("analyze").addEventListener("click",analyze);
  $("download-csv").addEventListener("click",exportCsv);
  draw();
})();