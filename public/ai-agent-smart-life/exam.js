(() => {
 "use strict";
 const lessons=window.AASL_LESSONS||[];
 const enrich=window.AASL_DEEP_DIVE||[];
 const bank=lessons.flatMap((l,i)=>l.questions.concat((enrich[i]||{}).extraQuestions||[]).map(q=>({lesson:i+1,q})));
 const short=[
 {title:"리스트의 원소 수",code:"scores = [60, 80, 100]\nprint(len(scores))",answer:["3"],explain:"리스트의 원소는 3개입니다."},
 {title:"리스트의 인덱스",code:"a = [10, 20, 30]\nprint(a[1])",answer:["20"],explain:"리스트의 인덱스는 0부터 시작합니다."},
 {title:"평균 계산",code:"scores = [70, 90, 80]\nprint(sum(scores) / len(scores))",answer:["80.0","80"],explain:"합 240을 원소 수 3으로 나눕니다."},
 {title:"조건 반복",code:"scores = [50, 80, 90]\nprint(len([x for x in scores if x >= 80]))",answer:["2"],explain:"80과 90 두 값이 조건에 맞습니다."},
 {title:"딕셔너리 최솟값 과목",code:"data = {'Math': 62, 'English': 83}\nprint(min(data, key=data.get))",answer:["Math"],explain:"값이 작은 Math 키를 반환합니다."},
 {title:"pandas의 평균",code:"import pandas as pd\ndf = pd.DataFrame({'score':[10,20,30]})\nprint(df['score'].mean())",answer:["20.0","20"],explain:"평균은 20.0입니다."},
 {title:"도구 함수 반환값",code:"def tool(n):\n    return n * 2\nprint(tool(7))",answer:["14"],explain:"7의 두 배인 14가 반환됩니다."},
 {title:"시뮬레이션",code:"def simulate(n, rate):\n    return round(n * rate)\nprint(simulate(20, 0.5))",answer:["10"],explain:"20×0.5=10입니다."}
 ];
 const $=id=>document.getElementById(id);
 const safe=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let picked=[];
 function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function draw(){
   picked=shuffle(bank).slice(0,20);
   $("multiple").innerHTML=picked.map((item,i)=>'<div class="q"><h3>객관식 '+(i+1)+'. '+safe(item.q[0])+'</h3><div class="options">'+
      item.q[1].map((opt,j)=>'<label><input type="radio" name="mc-'+i+'" value="'+j+'"/><span>'+String.fromCharCode(9312+j)+' '+safe(opt)+'</span></label>').join("")+
      '</div><div class="result" id="mc-result-'+i+'" hidden></div></div>').join("");
   $("short").innerHTML=short.map((x,i)=>'<div class="q"><h3>단답형 '+(i+1)+'. '+safe(x.title)+'</h3><pre>'+safe(x.code)+'</pre>'+
     '<label for="short-answer-'+i+'">실행 결과</label><input autocomplete="off" id="short-answer-'+i+'" class="short" placeholder="출력 결과를 입력하세요"/>'+
     '<div class="result" id="short-result-'+i+'" hidden></div></div>').join("");
   $("summary").textContent="";
   $("grade").disabled=false;
 }
 function grade(){
   let mcScore=0,shortScore=0;
   picked.forEach((item,i)=>{
     const el=document.querySelector('input[name="mc-'+i+'"]:checked');
     const yes=!!el&&Number(el.value)===item.q[2];
     if(yes)mcScore++;
     const out=$("mc-result-"+i);out.hidden=false;
     out.textContent=(yes?"정답":"오답 또는 미응답")+" · 정답 "+String.fromCharCode(9312+item.q[2])+" "+item.q[1][item.q[2]]+" — "+item.q[3];
   });
   short.forEach((item,i)=>{
     const user=$("short-answer-"+i).value.trim().toLowerCase().replace(/\s+/g,"");
     const yes=!!user&&item.answer.some(a=>a.toLowerCase().replace(/\s+/g,"")===user);
     if(yes)shortScore++;
     const out=$("short-result-"+i);out.hidden=false;
     out.textContent=(yes?"정답":"오답 또는 미응답")+" · 예시 정답: "+item.answer[0]+" — "+item.explain;
   });
   const total=mcScore+shortScore;
   $("summary").innerHTML='<h2>채점 결과: '+total+' / 28 문항</h2>'+
   '<p>객관식 '+mcScore+'/20 · 단답형 '+shortScore+'/8 · 정답률 '+Math.round(total/28*100)+'%</p>'+
   '<p class="muted">이 점수는 학습용 결과이며 학교 공식 평가 성적이 아닙니다.</p>';
   $("summary").scrollIntoView({behavior:"smooth"});
 }
 $("refresh").addEventListener("click",draw);
 $("grade").addEventListener("click",grade);
 draw();
})();