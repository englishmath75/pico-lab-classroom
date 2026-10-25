(()=>{"use strict";
const S=(title,guide,append,question,hint)=>({title,guide,append,question,hint});
const L=(title,goal,dataset,steps)=>({title,goal,dataset,steps});
const LESSONS=[
L("데이터 분석의 질문과 CSV","행은 관찰 대상, 열은 변수라는 점을 이해하고 Pandas 표의 구조를 확인합니다.","school_store_fictional.csv",[
S("Pandas 불러오기","첫 줄에 Pandas를 pd라는 이름으로 불러오세요.","import pandas as pd","아직 출력 문장이 없는데 오류 없이 실행되면 무엇을 의미할까요?","import는 데이터 분석 도구를 준비합니다."),
S("매점 데이터를 표로 만들기","다음 줄에 매점의 상품과 판매량을 사용해 DataFrame을 만드세요.","df = pd.DataFrame({'item':['juice','bread','milk'],'sales':[12,20,16]})","표에 몇 개의 행과 열이 있을까요?","DataFrame은 행과 열이 있는 2차원 자료구조입니다."),
S("표 전체 출력","지금까지 코드를 유지한 채 print 함수로 df를 출력하세요.","print(df)","인덱스 번호가 0부터 시작하나요?","print는 실제 프로그램 출력창에 데이터를 보여 줍니다."),
S("앞의 두 행 살펴보기","df.head(2)로 처음 두 행을 살펴보세요. print로 감싸야 출력창에 나옵니다.","print(df.head(2))","앞의 두 행만 출력될까요, 열도 줄어들까요?","head(2)는 앞에서부터 2행을 선택합니다."),
S("조건으로 자료 선택","판매량이 15 이상인 행만 출력하세요.","print(df[df['sales'] >= 15])","어떤 상품이 남을까요? 이유를 숫자로 설명하세요.","대괄호 안의 조건식이 True인 행만 선택합니다.")]),
L("처음 배우는 DataFrame","열 선택, 행·열 개수, 평균을 확인하며 표 형태의 데이터를 다룹니다.","school_store_fictional.csv",[
S("Pandas 시작","분석에 사용할 pandas를 불러오세요.","import pandas as pd","왜 모듈에 짧은 별칭을 붙일까요?","pd는 pandas라는 긴 이름을 줄인 별칭입니다."),
S("DataFrame 만들기","매점 상품 세 가지의 가격을 표로 만드세요.","df = pd.DataFrame({'item':['A','B','C'],'price':[1000,1500,2000]})","행 개수와 열 개수를 예측하세요.","딕셔너리의 키가 DataFrame의 열 이름이 됩니다."),
S("행과 열의 크기","표의 크기를 출력하세요.","print(df.shape)","결과는 (3, 2)일까요, (2, 3)일까요?","shape는 (행 개수, 열 개수) 형태의 튜플입니다."),
S("열 이름 확인","모든 열 이름을 리스트 형태로 출력하세요.","print(df.columns.tolist())","출력되는 두 이름은 무엇일까요?","columns는 열 이름을 나타냅니다."),
S("가격 평균 계산","price 열의 평균을 계산하세요.","print(df['price'].mean())","평균은 얼마일까요?","한 열을 선택한 뒤 mean()을 적용합니다.")]),
L("CSV 읽기·행과 열 선택","CSV 문자열을 데이터프레임으로 읽고 필요한 행과 열만 골라냅니다.","sports_fictional.csv",[
S("Pandas 불러오기","pandas를 불러오세요.","import pandas as pd","CSV 데이터를 읽는 데 어떤 도구가 필요할까요?","pd.read_csv가 나중에 사용됩니다."),
S("문자열 파일 도구","문자열을 파일처럼 읽을 수 있는 StringIO를 불러오세요.","from io import StringIO","실제 파일 없이도 CSV 읽기를 연습할 수 있을까요?","StringIO는 문자열을 파일처럼 다룹니다."),
S("CSV 만들기","줄바꿈 문자와 쉼표를 사용해 가상 CSV를 만들어 보세요.","csv_text = 'player,points\\nMinji,17\\nYuna,21\\nSora,13'","첫 줄은 데이터인가요, 열 이름인가요?","\\n은 줄바꿈을 나타냅니다. 코드에는 백슬래시와 n을 입력합니다."),
S("CSV 읽어 표로 만들기","CSV를 Pandas DataFrame으로 읽으세요.","df = pd.read_csv(StringIO(csv_text))","df에는 몇 개의 행이 있을까요?","pd.read_csv(StringIO(csv_text))를 사용합니다."),
S("필요한 열 출력","player 열과 points 열을 선택해 출력하세요.","print(df[['player','points']])","대괄호가 두 겹인 이유는 무엇일까요?","여러 열을 선택할 때 열 이름의 리스트를 전달합니다.")]),
L("조건 검색·정렬로 선수 찾기","스포츠 기록을 조건으로 걸러내고 값에 따라 정렬합니다.","sports_fictional.csv",[
S("Pandas 시작","pandas를 불러오세요.","import pandas as pd","분석 라이브러리의 별칭을 써 보세요.","관례적으로 as pd를 사용합니다."),
S("스포츠 표 작성","세 선수의 점수와 포지션을 만드세요.","df = pd.DataFrame({'name':['Minji','Yuna','Sora'],'position':['G','F','G'],'points':[17,21,13]})","가드(G)는 몇 명인가요?","같은 길이의 리스트를 열별로 작성합니다."),
S("점수 조건 검색","득점이 15 이상인 선수를 찾으세요.","print(df[df['points'] >= 15])","누가 결과에 남을까요?","조건식은 참·거짓의 Series가 됩니다."),
S("내림차순 정렬","득점이 높은 순서로 정렬해 출력하세요.","print(df.sort_values('points',ascending=False))","첫 번째 선수는 누구일까요?","ascending=False는 큰 값에서 작은 값 순입니다."),
S("두 조건 결합","가드이면서 15점 이상인 선수를 찾으세요.","print(df[(df['position']=='G') & (df['points']>=15)])","괄호와 &가 왜 필요할까요?","조건을 각각 소괄호로 감싸고 &로 동시에 만족하는 행을 선택합니다.")]),
L("결측·중복·자료형 정리","누락 값과 중복 행을 확인하고 처리 전후 통계를 비교합니다.","school_store_fictional.csv",[
S("Pandas 시작","pandas를 불러오세요.","import pandas as pd","비어 있는 데이터도 표에 들어갈까요?","결측값은 NaN으로 표현될 수 있습니다."),
S("결측과 중복이 있는 자료","의도적으로 값이 빠지거나 반복된 표를 만드세요.","df = pd.DataFrame({'item':['A','A','B','C'],'sales':[10,10,None,30]})","몇 행이 중복이고, 값이 없는 곳은 어디일까요?","None은 수치 열에서 결측값으로 처리됩니다."),
S("결측값 개수 확인","각 열의 결측값 개수를 출력하세요.","print(df.isna().sum())","sales에 결측값이 몇 개 있을까요?","isna()로 결측 여부를 확인하고 sum()으로 개수를 셉니다."),
S("중복행 제거","중복된 행을 제거한 결과를 출력하세요.","print(df.drop_duplicates())","첫째·둘째 행이 같으면 몇 행이 남을까요?","drop_duplicates()는 기본적으로 원본 df 자체를 수정하지 않습니다."),
S("결측을 0으로 처리","결측을 0으로 채운 값의 평균을 비교하세요.","print(df['sales'].fillna(0).mean())","0으로 채우기 전 평균과 왜 다를까요?","fillna(0)는 계산상 0을 넣지만, 실제 매출이 0이었다는 뜻은 아닙니다.")]),
L("groupby로 팀별 평균 비교","개별 기록과 집단 평균의 차이를 이해합니다.","sports_fictional.csv",[
S("Pandas 시작","pandas를 불러오세요.","import pandas as pd","팀별로 여러 선수 기록을 묶을 준비를 합니다.","as pd 별칭을 사용합니다."),
S("팀 기록 입력","A팀 2명, B팀 2명의 득점을 만드세요.","df = pd.DataFrame({'team':['A','A','B','B'],'points':[10,20,15,25]})","각 팀의 총득점은 얼마일까요?","team은 분류 기준, points는 계산할 숫자입니다."),
S("팀별 평균","팀별 점수 평균을 출력하세요.","print(df.groupby('team')['points'].mean())","A팀과 B팀의 평균을 예상하세요.","groupby로 팀을 묶고 mean으로 평균을 구합니다."),
S("팀별 합계","팀별 점수 합계를 출력하세요.","print(df.groupby('team')['points'].sum())","평균과 합계는 어떤 점에서 다를까요?","sum()은 합계, mean()은 평균입니다."),
S("팀별 선수 수","팀별 데이터 개수를 출력하세요.","print(df.groupby('team')['points'].count())","인원이 다른 팀의 평균만 비교하면 어떤 한계가 있을까요?","count()는 결측값이 아닌 값의 수를 계산합니다.")]),
L("문자열 분석·merge 심화","단어 빈도를 세고 서로 다른 표를 키 열로 연결합니다.","sports_fictional.csv",[
S("Pandas 시작","pandas를 불러오세요.","import pandas as pd","비정형 문장을 어떻게 숫자로 분석할까요?","단어로 분리해 출현 횟수를 계산합니다."),
S("문장 준비","가상의 기후 관련 문장을 리스트에 담으세요.","texts = ['climate change','climate risk','climate change']","climate라는 단어가 몇 번 등장할까요?","문장은 학습용 가상 예시입니다."),
S("단어별 빈도 세기","문장을 합치고 단어로 나눈 뒤 빈도표를 출력하세요.","print(pd.Series(' '.join(texts).split()).value_counts())","가장 자주 등장하는 단어는 무엇일까요?","value_counts()는 각 단어의 출현 횟수를 셉니다."),
S("정보표 두 개 만들기","공통 열 key를 가진 두 표를 만드세요.","left = pd.DataFrame({'key':['A','B'],'score':[80,90]}); right = pd.DataFrame({'key':['A','B'],'grade':['B','A']})","두 표를 합치려면 어떤 공통 열이 필요할까요?","세미콜론은 파이썬에서 한 줄에 두 문장을 이어 씁니다. 심화 단계입니다."),
S("merge로 연결","두 표를 공통 key로 결합하세요.","print(pd.merge(left,right,on='key'))","결합 결과에 어떤 열이 생길까요?","merge는 기준 키 값이 일치하는 행을 연결합니다.")]),
L("Matplotlib 기후 시각화","표의 수치를 꺾은선그래프로 나타내고 축 단위와 출처를 생각합니다.","climate_fictional.csv",[
S("Pandas 시작","pandas를 불러오세요.","import pandas as pd","연도별 기온을 표로 만들 준비를 합니다.","기초 데이터 구조는 DataFrame입니다."),
S("그래프 도구 불러오기","Matplotlib의 pyplot을 plt라는 이름으로 불러오세요.","import matplotlib.pyplot as plt","Pandas와 pyplot의 역할은 어떻게 다를까요?","Pandas는 표 분석, pyplot은 시각화에 주로 사용됩니다."),
S("기온 데이터 표 만들기","가상의 연도별 온도 기록을 만드세요.","df = pd.DataFrame({'year':[2021,2022,2023,2024],'temp':[13.1,13.4,13.0,13.8]})","어느 해의 온도가 가장 높을까요?","이 수치는 실제 기후 통계가 아닌 가상 예시입니다."),
S("꺾은선그래프 작성","연도를 가로축으로 기온 추이를 그리세요.","plt.plot(df['year'],df['temp'],marker='o')","2023년의 점은 전년보다 높을까요?","plot(x,y,marker='o')를 사용합니다."),
S("축과 제목 달기","그래프에 축 이름과 제목을 추가하고 화면에 출력하세요.","plt.xlabel('Year'); plt.ylabel('Temperature (C)'); plt.title('Fictional climate'); plt.show()","그래프의 제목과 단위가 없다면 어떤 오해가 생길까요?","세미콜론으로 여러 명령을 이어 썼습니다. 실제 발표 때는 한 줄씩 나누어도 됩니다.")]),
L("인구 변화 데이터 분석","인구 증감량과 증감률을 구분하고 해석합니다.","population_fictional.csv",[
S("Pandas 시작","pandas를 불러오세요.","import pandas as pd","증감량과 증감률은 같은 값일까요?","비율은 비교 기준이 되는 원래 값을 고려합니다."),
S("두 해의 가상 인구 입력","연도와 인구를 표로 만드세요.","df = pd.DataFrame({'year':[2023,2024],'population':[1000,950]})","인구는 몇 명 감소했나요?","단순화를 위해 가상 수치로 학습합니다."),
S("인구 증감량 구하기","diff()로 연도 간 차이를 출력하세요.","print(df['population'].diff())","2024년의 증감량은 얼마일까요?","diff()는 현재 값에서 앞 행의 값을 뺍니다."),
S("인구 증감률 구하기","pct_change()로 증감률을 백분율로 바꾸세요.","print(df['population'].pct_change()*100)","인구가 1000에서 950으로 되면 몇 퍼센트 감소인가요?","pct_change()에 100을 곱해 백분율로 표현합니다."),
S("마지막 증감률 선택","마지막 연도의 증감률만 출력하세요.","print(df['population'].pct_change().iloc[-1]*100)","처음 행은 증감률을 계산할 수 없는데 이유는 무엇일까요?","비교할 이전 연도가 없으므로 처음 값은 NaN입니다.")]),
L("분석 보고서·기말 종합","표 만들기부터 요약과 그래프까지 스스로 연결하고 해석합니다.","school_store_fictional.csv",[
S("Pandas 시작","pandas를 불러오세요.","import pandas as pd","오늘의 분석 질문은 무엇일까요?","예시 질문: 가장 많이 팔린 상품은 무엇인가?"),
S("매점 데이터 만들기","가상 매점 판매량을 작성하세요.","df = pd.DataFrame({'item':['juice','bread','milk'],'sales':[12,30,18]})","어떤 항목이 가장 많이 팔렸나요?","실제 학교 판매 기록이나 개인정보는 사용하지 않습니다."),
S("판매량 내림차순","판매량이 높은 순서로 출력하세요.","print(df.sort_values('sales',ascending=False))","가장 판매량이 높은 상품을 확인해 보세요.","sort_values()의 ascending=False를 사용합니다."),
S("평균 계산","세 상품 판매량의 평균을 출력하세요.","print(df['sales'].mean())","계산한 평균과 개별 상품 판매량은 어떻게 다를까요?","평균만으로 하루 전체의 판매 성향을 확정할 수는 없습니다."),
S("최댓값과 분석 결론","판매량의 최댓값을 출력한 뒤 아래 해석 칸에 분석의 한계를 적으세요.","print(df['sales'].max())","가상의 하루치 자료만으로 연간 판매 경향을 알 수 있을까요?","결론에는 출처, 기간, 관측 수, 한계를 함께 기록합니다.")])
];
const KEY="data-detective-step-by-step-2026-v1";
const $=id=>document.getElementById(id);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fresh=()=>({lesson:0,records:{}});
let state=fresh();try{const p=JSON.parse(localStorage.getItem(KEY)||"null");if(p&&p.records&&typeof p.records==="object")state={...state,...p}}catch(_){}
let which=Math.max(0,Math.min(LESSONS.length-1,Number(state.lesson)||0)),pyPromise=null,running=false;
function record(i=which){if(!state.records[i])state.records[i]={step:0,code:"",done:[],predict:{},reflection:"",verified:{}};return state.records[i]}
function save(){state.lesson=which;try{localStorage.setItem(KEY,JSON.stringify(state));$("saveInfo").textContent="✓ 내 브라우저에 저장"}catch(_){$("saveInfo").textContent="저장 실패: JSON 백업 권장"}}
function currentStep(){const r=record();r.step=Math.max(0,Math.min(4,Number(r.step)||0));return LESSONS[which].steps[r.step]}
function setStatus(s,bad=false){$("status").textContent=s;$("status").classList.toggle("bad",bad)}
function renderNav(){$("lessonNav").innerHTML=LESSONS.map((l,i)=>'<button type="button" class="lesson-nav'+(which===i?" active":"")+'" data-lesson="'+i+'">'+(i+1)+'차시 · '+esc(l.title)+'<small>'+(record(i).done.length)+' / 5단계 완료</small></button>').join("");document.querySelectorAll("[data-lesson]").forEach(b=>b.onclick=()=>{saveEditor();which=Number(b.dataset.lesson);render()})}
function saveEditor(){let r=record();r.code=$("editor").value;r.predict[r.step]=$("predictInput").value;r.reflection=$("reflection").value;save()}
function showStep(){const l=LESSONS[which],r=record(),s=currentStep();$("heroTitle").textContent=(which+1)+"차시 · "+l.title;$("lessonTitle").textContent=l.title;$("lessonNumber").textContent="LESSON "+String(which+1).padStart(2,"0");$("lessonGoal").textContent=l.goal;$("stepNumber").textContent="STEP "+String(r.step+1).padStart(2,"0")+" / 05";$("stepTitle").textContent=s.title;$("stepGuide").textContent=s.guide;$("stepPredict").textContent="생각해보기: "+s.question;$("snippet").textContent=s.append;$("hintText").textContent=s.hint;$("reflectQuestion").textContent=s.question;$("completeLabel").textContent=r.done.length+" / 5단계 완료";$("stepbar").innerHTML=l.steps.map((v,i)=>'<span class="step-dot '+(r.step===i?"on":r.done.includes(i)?"done":"")+'">'+(i+1)+(r.done.includes(i)?" ✓":"")+"</span>").join("");$("hintPanel").classList.add("hide");$("predictInput").value=r.predict[r.step]||"";$("prev").disabled=r.step===0;$("next").textContent=r.step===4?"이 차시 마무리":"다음 단계 →";$("next").disabled=!r.done.includes(r.step)||r.verified[r.step]!==r.code;$("output").textContent="코드를 실행하면 이곳에 실제 출력 결과가 나타납니다.";$("plot").style.display="none";setStatus(r.done.includes(r.step)?"✓ 이전에 통과한 단계입니다. 코드를 수정했다면 다시 실행하세요.":"이번 단계 목표 코드를 추가한 후 실행해 보세요.");}
function render(){const r=record();$("editor").value=r.code;$("reflection").value=r.reflection;renderNav();showStep();save()}
function append(){const r=record(),s=currentStep(),code=$("editor").value.trimEnd();$("editor").value=code+(code?"\n":"")+s.append+"\n";r.code=$("editor").value;$("editor").focus();$("next").disabled=true;setStatus("예시 코드를 추가했습니다. 직접 읽고 ▶ 실행을 눌러 확인하세요.");save()}
function download(filename,data,type){const u=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement("a");a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)}
async function runtime(){if(pyPromise)return pyPromise;pyPromise=(async()=>{if(!window.loadPyodide)await new Promise((ok,fail)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";s.onload=ok;s.onerror=()=>fail(Error("Python 엔진 파일을 불러올 수 없습니다. 학교 인터넷과 차단 정책을 확인하세요."));document.head.appendChild(s)});const p=await window.loadPyodide();await p.loadPackage(["pandas","matplotlib"]);return p})();try{return await pyPromise}catch(e){pyPromise=null;throw e}}
function normalize(x){return String(x).replace(/\s+/g,"")}
function requiredPresent(code,s){return normalize(code).includes(normalize(s.append))}
async function execute(){if(running)return;const r=record(),s=currentStep(),code=$("editor").value;
saveEditor();$("output").textContent="";$("plot").style.display="none";
if(!code.trim()){setStatus("먼저 코드 편집기에 명령을 입력하세요.",true);return}
if(!requiredPresent(code,s)){setStatus("이번 단계의 목표 명령이 아직 없습니다. 직접 입력하거나 ‘한 줄 힌트’를 확인하세요.",true);return}
running=true;$("run").disabled=true;$("next").disabled=true;setStatus("Python 엔진 준비 중… 첫 실행 시 다운로드에 시간이 걸릴 수 있습니다.");
let ns=null;
try{const p=await runtime(),out=[];p.setStdout({batched:t=>out.push(t)});p.setStderr({batched:t=>out.push(t)});
await p.runPythonAsync("import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nplt.close('all')");
ns=p.runPython("dict(__name__='__main__')");
setStatus("작성한 코드를 실행하고 있습니다…");
await p.runPythonAsync(code,{globals:ns});
let img=await p.runPythonAsync("import matplotlib.pyplot as plt\nimport io,base64\n_picture=''\nif plt.get_fignums():\n    _buf=io.BytesIO()\n    plt.savefig(_buf,format='png',bbox_inches='tight')\n    _picture=base64.b64encode(_buf.getvalue()).decode('ascii')\n    plt.close('all')\n_picture");
$("output").textContent=out.join("\n")||"✓ 오류 없이 실행되었습니다. (print 출력 없음)";
if(img){$("plot").src="data:image/png;base64,"+img;$("plot").style.display="block"}
if(!r.done.includes(r.step))r.done.push(r.step);r.done.sort((a,b)=>a-b);r.verified[r.step]=code;save();showStep();$("output").textContent=out.join("\n")||"✓ 오류 없이 실행되었습니다. (print 출력 없음)";if(img){$("plot").src="data:image/png;base64,"+img;$("plot").style.display="block"}$("next").disabled=false;setStatus("✓ 실제 Python 실행 성공! 출력과 예측을 비교한 뒤 다음 단계로 넘어가세요.");renderNav();
}catch(e){$("output").textContent=String(e);setStatus("실행 오류입니다. 오류 메시지를 보고 코드를 고친 다음 다시 실행하세요.",true)}
finally{if(ns)ns.destroy();running=false;$("run").disabled=false}}
$("lessonNav").addEventListener("keydown",e=>{if(e.key==="ArrowDown"||e.key==="ArrowUp"){const items=[...document.querySelectorAll("[data-lesson]")];let at=items.indexOf(document.activeElement);items[(at+(e.key==="ArrowDown"?1:items.length-1))%items.length].focus();e.preventDefault()}});
$("editor").addEventListener("input",()=>{record().code=$("editor").value;$("next").disabled=true;save()});
$("editor").addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();const a=e.target,s=a.selectionStart,n=a.selectionEnd;a.value=a.value.slice(0,s)+"    "+a.value.slice(n);a.selectionStart=a.selectionEnd=s+4;a.dispatchEvent(new Event("input"))}});
$("predictInput").addEventListener("input",()=>{record().predict[record().step]=$("predictInput").value;save()});
$("reflection").addEventListener("input",()=>{record().reflection=$("reflection").value;save()});
$("hintButton").onclick=()=>$("hintPanel").classList.toggle("hide");
$("addExample").onclick=append;
$("run").onclick=execute;
$("prev").onclick=()=>{saveEditor();const r=record();r.step=Math.max(0,r.step-1);render()};
$("next").onclick=()=>{const r=record();if(!r.done.includes(r.step)||r.verified[r.step]!==$("editor").value){setStatus("현재 코드를 성공적으로 실행해야 다음 단계로 넘어갈 수 있습니다.",true);return}saveEditor();if(r.step===4){if(which<9){which++;render()}else{setStatus("🎉 10차시 완료! VS Code용 .py 저장으로 학습 코드를 보관하세요.")}}else{r.step++;render()}};
$("resetLesson").onclick=()=>{if(!window.confirm("이 차시의 코드와 단계 기록을 초기화할까요? 다른 차시는 그대로입니다."))return;state.records[which]={step:0,code:"",done:[],predict:{},reflection:"",verified:{}};render()};
$("savePy").onclick=()=>download("data_detective_lesson_"+String(which+1).padStart(2,"0")+".py",$("editor").value,"text/x-python;charset=utf-8");
$("exportJson").onclick=()=>{saveEditor();download("data_detective_step_learning_backup.json",JSON.stringify(state,null,2),"application/json;charset=utf-8")};
$("downloadCsv").onclick=()=>{const a=document.createElement("a");a.href="./datasets/"+LESSONS[which].dataset;a.download=LESSONS[which].dataset;document.body.appendChild(a);a.click();a.remove()};
render();
})();