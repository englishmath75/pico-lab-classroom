/* Software and Life 2026. Fictional classroom data, no API, local storage only. */
(() => {
"use strict";
const $=id=>document.getElementById(id), esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const KEY="pico-software-life-2026-v1",SAMPLE="subject,score\n국어,78\n영어,88\n수학,62\n과학,91\n사회,70\n정보,84\n역사,73\n음악,95";
const LESSONS=[
["학교생활 문제를 소프트웨어로","10/26(월)","1·2·5단원","누가 어떤 문제를 겪는지 관찰하고 검증 가능한 성공 기준을 세운다.","0~5분 아두이노 입력-처리-출력 복습|5~15분 생활 문제와 사용자 찾기|15~35분 프로젝트 여권에 문제·사용자·성공 기준 작성|35~45분 짝과 요구사항 인터뷰|45~50분 형성평가","사용자와 문제, 달성할 목표가 적힌 기획서","실제 사용자가 겪는 문제부터 정하게 하세요. 아두이노 수행평가를 2단원의 피지컬 컴퓨팅 경험으로 연결합니다."],
["데이터 수집과 CSV·윤리","10/28(수)","3단원","자료의 종류와 구조를 이해하고 CSV를 편집하며 개인정보와 편향을 점검한다.","0~5분 필요한 데이터 질문|5~15분 정형·비정형·CSV 설명|15~35분 가상 CSV 편집과 검증|35~45분 수집 편향·정보보호 토의|45~50분 형성평가","분석용 가상 CSV와 수집 계획","실제 학생 성적이나 실명을 넣지 않도록 합니다. 문제에 맞는 관측 단위를 선택하게 지도합니다."],
["Pandas 분석과 해석","10/30(금)","3단원","DataFrame의 행·열, 평균, 조건 검색과 정렬의 의미를 이해한다.","0~5분 CSV 복습|5~15분 DataFrame·mean·필터 소개|15~35분 분석 실습과 Python 코드 해석|35~45분 수치의 의미·한계 적기|45~50분 형성평가","평균·조건 검색 결과와 근거 설명","라이브러리 설치가 막히면 웹앱 기본 분석 결과와 Python 코드 해석으로 대체합니다."],
["Matplotlib 데이터 시각화","11/2(월)","3단원","비교 목적에 맞는 그래프를 만들고 축과 단위가 해석에 미치는 영향을 설명한다.","0~5분 왜곡된 그래프 토의|5~15분 막대·꺾은선 그래프 설명|15~35분 데이터 변경에 따른 그래프 실습|35~45분 결과 해석과 주의사항|45~50분 형성평가","시각화와 핵심 해석 문장","그래프를 그리는 것뿐 아니라 그래프만으로 알 수 없는 사실을 꼭 설명하게 합니다."],
["머신러닝 결정트리","11/4(수)","3단원 심화","특징·레이블과 fit·predict의 차이, 과적합과 검증을 설명한다.","0~5분 규칙과 학습의 차이|5~15분 특징·레이블·과적합|15~35분 가상 결정트리 코드 실행 또는 해석|35~45분 신뢰도와 편향 토론|45~50분 형성평가","가상 예측 모델의 원리와 한계","AI 학습은 확장 활동입니다. 실제 학생 성적·진로를 예측하는 모델로 오해하지 않게 지도하세요."],
["시뮬레이션 가상 실험","11/6(금)","4단원","모델의 가정을 밝히고 입력 조건을 변경해 출력 변화와 한계를 해석한다.","0~5분 분석과 시뮬레이션 비교|5~15분 모델·변수·가정 설명|15~35분 0·30·90분 시나리오 실습|35~45분 결과의 현실 적용 한계 토론|45~50분 형성평가","조건별 결과표와 모델 검증 의견","수업용 가정에 의한 계산입니다. 실제 점수 상승을 보장하거나 인과관계를 증명하지 않는다는 점을 강조하세요."],
["사용자 중심 서비스 설계","11/9(월)","5단원","요구사항을 핵심 기능·화면 흐름·검증 계획으로 바꾼다.","0~5분 사용자 관점 복습|5~15분 스타트업·비즈니스 모델·MVP|15~35분 화면 흐름과 핵심 기능 설계|35~45분 짝 사용자 테스트|45~50분 형성평가","최소 기능 제품 설계와 사용 시나리오","가치 창출은 매출만이 아니라 비용 절감, 편의·접근성·공공성도 포함합니다."],
["AI 학습 비서와 자동화","11/11(수)","3·5단원 융합","CSV 분석→판단→추천→검증을 하나의 기능으로 설계한다.","0~5분 데이터·프로젝트 연결|5~15분 함수와 규칙 기반 에이전트 개념|15~35분 기존 AI 스튜디오와 CSV 실습|35~45분 예외 처리와 오류 검증|45~50분 형성평가","분석 도구와 검증 절차를 갖춘 서비스 제안","기존 AI 에이전트 스튜디오는 규칙 기반입니다. 실제 LLM API 실행과 구별하고 키를 공개 웹에 입력하지 마세요."],
["최종 발표·사용자 가치 검증","11/13(금)","1~5단원 통합","문제→분석→모의실험→기능→사용자 검증을 연결한 프로젝트를 발표한다.","0~5분 처음 작성한 문제 확인|5~15분 기능·사회·윤리 검토|15~35분 프로젝트 여권 완성·HTML 내려받기|35~45분 2분 발표·동료 피드백|45~50분 종합 형성평가","최종 포트폴리오와 2분 발표","완성도보다 문제 해결 근거, 사용자 검증 과정과 한계에 주목합니다. 정식 성적은 학교 평가계획을 따릅니다."]
];
const QA=[
[1,"이용자 요구를 파악할 때 먼저 물어야 하는 것은?",["누가 언제 어떤 불편을 겪는가","버튼을 몇 개 넣을까","배경색은 무엇이 좋을까"],0,"사용자와 문제 상황을 먼저 정의합니다."],
[1,"소프트웨어 문제 해결의 성공 기준으로 적절한 것은?",["코드가 길다","30초 안에 필요한 정보를 찾는다","화면이 화려하다"],1,"행동으로 확인할 수 있어야 합니다."],
[1,"피지컬 컴퓨팅에서 입력→처리→출력의 사례는?",["LED→센서→코드","코드→부저→센서","조도센서→조건 판단→LED"],2,"센서로 수집한 값을 처리하여 출력합니다."],
[1,"소프트웨어 융합이란?",["생활의 문제를 다양한 기술과 연결해 해결","하나의 앱 이름을 정하는 일","컴퓨터를 가장 비싸게 구입"],0,"다른 분야의 지식과 소프트웨어를 결합합니다."],
[1,"이해관계자는 누구인가?",["파일 이름","결과에 영향을 받는 사용자·관리자 등","개발 언어"],1,"문제와 결과에 영향을 받는 사람들을 고려합니다."],
[2,"조도센서는?",["출력장치","데이터 저장소","빛을 감지하는 입력장치"],2,"센서는 주변 환경 정보를 수집합니다."],
[2,"아두이노의 LED는?",["액추에이터(출력장치)","입력센서","컴파일러"],0,"LED는 빛으로 상태를 출력합니다."],
[2,"미디어 아트에서 상호작용의 예시는?",["영상이 항상 동일","관람자의 동작에 작품이 반응","센서 제거"],1,"관람자와 작품 간 입력·반응 관계가 핵심입니다."],
[2,"PWM을 활용한 LED 제어는?",["데이터 파일 압축","센서 제거","켜짐 비율을 조절해 체감 밝기 변경"],2,"듀티비 조절로 평균 출력을 제어할 수 있습니다."],
[2,"센서 측정에서 점검할 것은?",["측정 오차와 환경 조건","모든 값은 항상 정확","접촉 불량 무시"],0,"센서에 오류와 오차가 생길 수 있습니다."],
[3,"CSV의 특징은?",["동영상 전용","쉼표 등으로 구분하는 표 형식 텍스트","센서의 전압 신호"],1,"정형 데이터를 텍스트로 저장합니다."],
[3,"정형 데이터의 대표적 형태는?",["임의의 사진","음성 녹음","행과 열이 있는 표"],2,"표 구조를 갖춘 데이터입니다."],
[3,"비정형 데이터는?",["자유 문장·사진 등","숫자 표만","고정 열을 가진 CSV만"],0,"자유 형식의 자료가 비정형 데이터에 속합니다."],
[3,"결측값이란?",["항상 0인 값","관측값이 빠져 있는 상태","항상 최댓값"],1,"결측값을 임의로 0으로 처리하지 않도록 주의합니다."],
[3,"데이터 편향을 줄이려면?",["원하는 사례만 남긴다","틀린 자료를 숨긴다","표본의 대표성과 수집 방법을 점검한다"],2,"대표성 없는 자료는 결론을 왜곡합니다."],
[3,"DataFrame은?",["행과 열이 있는 표 자료구조","모터 신호","음악 파일"],0,"Pandas의 대표적인 표 자료구조입니다."],
[3,"df['score'].mean()의 의미는?",["열 삭제","score 열 평균 계산","문자열 압축"],1,"mean()은 평균을 구합니다."],
[3,"df[df['score'] < 75]는?",["모든 행","열 삭제","75 미만인 행만 선택"],2,"조건이 참인 행을 필터링합니다."],
[3,"sort_values()가 하는 일은?",["특정 열 기준 정렬","그래프 출력만","파일 삭제"],0,"지정한 기준에 따라 행의 순서를 조정합니다."],
[3,"항목별 수치를 비교할 때 좋은 그래프는?",["폴더 구조도","막대그래프","전자 회로도"],1,"항목 크기 비교에 유용합니다."],
[3,"plt.ylim(0,100)은?",["모든 데이터를 100으로 변경","표를 삭제","세로축 표시 범위 설정"],2,"표시축을 바꿀 뿐 데이터 자체를 수정하지 않습니다."],
[3,"그래프를 볼 때 중요한 것은?",["축·단위·표본 출처 확인","축을 임의로 잘라 과장","숫자보다 색상만 보기"],0,"왜곡과 누락을 주의해야 합니다."],
[3,"지도학습에서 레이블(label)은?",["배경색","학습 예시의 정답","파일명"],1,"모델이 예측할 대상 정답입니다."],
[3,"특징(feature)이란?",["코드 글꼴","출력 장치","모델의 입력 변수"],2,"특징을 입력으로 사용합니다."],
[3,"model.fit(X,y)의 역할은?",["모델 학습","웹페이지 배포","CSV 삭제"],0,"입력 특징과 정답을 이용합니다."],
[3,"model.predict()는?",["변수 이름 바꾸기","학습된 모델로 새 입력 예측","그래프만 작성"],1,"모델의 학습 결과를 새 값에 적용합니다."],
[3,"과적합이란?",["테스트에서 언제나 정확","축 범위 변경","학습 자료에 지나치게 맞춤"],2,"새 데이터에서 성능이 떨어질 수 있습니다."],
[3,"상관관계만으로 단정할 수 없는 것은?",["원인과 결과 관계","두 값의 함께 움직임","자료의 분포"],0,"함께 움직인다는 사실은 원인의 증명이 아닙니다."],
[4,"시뮬레이션의 목적은?",["파일 크기 증가","가상 조건에서 모델의 동작 실험","무조건 정확한 미래 예언"],1,"모델을 활용해 조건에 따른 결과를 탐구합니다."],
[4,"모델링은?",["모든 변수를 반드시 다 포함","결과를 미리 정한다","현실의 필요한 특성을 단순화해 표현"],2,"목적에 맞는 추상화가 필요합니다."],
[4,"시뮬레이션 입력 변수는?",["모델에 넣어 조건을 바꾸는 값","파일 확장자","화면 제목"],0,"입력 변화에 따른 결과를 비교합니다."],
[4,"결과가 현실과 다른 이유는?",["항상 컴퓨터가 틀려서","가정·누락 변수·측정 오차 등이 있어서","결과가 항상 동일해서"],1,"모델의 적용 범위를 확인해야 합니다."],
[4,"모델 검증에서 적절한 방법은?",["결과가 다르면 숨긴다","색상을 바꾼다","실제 관측 자료와 가능한 범위에서 비교"],2,"모델을 실제 자료와 대조해야 합니다."],
[4,"데이터 분석과 시뮬레이션의 차이는?",["관측 자료 해석과 조건을 바꾼 가상 실험","둘 다 똑같이 파일 삭제","둘 다 코딩이 불가능"],0,"이미 관측된 현상의 분석과 가정에 따른 실험을 구분합니다."],
[4,"모델의 가정을 밝히는 이유는?",["점수를 높여 보이기 위해","결과의 제한 조건을 알리기 위해","실제 데이터가 필요 없어서"],1,"모델에서 성립하는 조건을 명확히 해야 합니다."],
[5,"스타트업의 문제 해결 출발점은?",["메뉴를 무한히 추가","코드를 10만 줄 작성","사용자에게 필요한 가치 찾기"],2,"사용자의 문제 해결을 중심에 둡니다."],
[5,"MVP의 뜻은?",["핵심 가치 검증을 위한 최소 기능 제품","모든 기능을 갖춘 최종 제품","무조건 유료 서비스"],0,"최소 기능으로 사용자의 반응을 검증합니다."],
[5,"좋은 화면 흐름은?",["개발자에게만 편리","사용자가 목적을 쉽게 달성할 수 있음","설명 없이 복잡한 절차"],1,"사용자 경험과 접근성을 살핍니다."],
[5,"사용성 테스트는?",["로고 색상을 고른다","성공한 것처럼 발표","사용자가 실제 과업을 끝내는지 관찰"],2,"목표 과업 달성 여부가 검증 기준입니다."],
[5,"서비스의 사회적 가치 사례는?",["정보 접근성·시간 절감·공공성","버튼 개수만 늘림","이용자의 불편을 무시"],0,"사회적 효용을 포함합니다."],
[5,"협업에서 중요한 것은?",["역할을 감추기","의견 수렴·역할 분담·피드백","혼자 모든 결과를 정하기"],1,"협력해 수정·검증하는 과정이 중요합니다."],
[5,"윤리적으로 적절한 자료 사용은?",["무조건 전부 공개","실명 포함해 게시","필요한 최소 정보만 안전하게 취급"],2,"개인정보와 접근 권한을 관리해야 합니다."],
[5,"규칙 기반 학습 비서는?",["미리 정의한 함수·조건을 따른다","항상 생성형 언어모델이다","반드시 유료 API를 호출한다"],0,"규칙 기반 자동화와 생성형 모델은 다릅니다."],
[5,"웹페이지에 적으면 안 되는 것은?",["공개 실습 안내","비공개 API 키","가상 점수표"],1,"공개 소스에 비밀키를 포함하면 유출됩니다."],
[5,"오류 검증이 필요한 까닭은?",["예쁘게 보이려고","문항 수를 늘리려고","잘못된 입력과 결과를 확인하려고"],2,"사용자를 보호하고 결과의 신뢰성을 높입니다."],
[5,"개선 과정을 설명하는 방법은?",["테스트 결과와 변경 전후 비교","장점만 적기","근거를 모두 삭제"],0,"검증 근거와 변경 과정을 남깁니다."],
[5,"비즈니스 모델의 핵심 질문은?",["어떤 글꼴을 쓸까?","누구에게 어떻게 가치를 지속 제공할까?","코드가 몇 글자인가?"],1,"사용자·가치·비용·자원·지속가능성을 고민합니다."]
];
const TERMS=[
["1단원 · 세상을 변화시키는 소프트웨어",[["문제 정의","누구에게 어떤 상황에서 불편이 발생하는지 명확히 파악"],["소프트웨어 융합","다른 학문과 생활 문제에 컴퓨팅을 적용"],["사용자 요구","문제를 겪는 사람의 실제 필요를 조사"],["성공 기준","문제 해결 여부를 확인할 수 있는 행동과 수치"]]],
["2단원 · 창작을 지원하는 소프트웨어",[["피지컬 컴퓨팅","현실 세계의 입력을 받아 소프트웨어로 처리·출력하는 시스템"],["미디어 아트","디지털 매체와 사용자 상호작용으로 표현하는 창작"],["센서·액추에이터","물리량 측정 장치와 출력을 만드는 구동 장치"],["PWM","고속으로 켜고 끄는 비율을 조절하여 평균 출력 변경"]]],
["3단원 · 현상을 분석하는 소프트웨어",[["정형·비정형","행·열 표 형태와 자유로운 사진·문장 등의 데이터"],["CSV·DataFrame","구분자로 저장된 표 데이터와 Pandas 자료구조"],["Pandas","조건별 추출·정렬·평균 등 데이터 처리용 Python 도구"],["Matplotlib","수치 자료를 그래프로 표현해 비교·해석"],["편향·결측","대표성 문제와 빠진 값으로 인해 왜곡될 위험"],["머신러닝(심화)","특징·레이블을 학습해 예측하며 과적합을 검증"]]],
["4단원 · 모의 실험하는 소프트웨어",[["모델·시뮬레이션","현실을 단순화한 모델로 가상 조건을 비교하는 활동"],["입력·출력·가정","변화시키는 값, 관찰하는 결과, 모델의 전제"],["타당성","모델을 현실 자료와 비교해 적용 범위를 검토"]]],
["5단원 · 가치를 창출하는 소프트웨어",[["소프트웨어 스타트업","사용자 문제 해결과 새로운 가치의 지속적인 제공"],["MVP","가장 중요한 가설을 검증하는 최소 기능 제품"],["사용자 경험","사용자가 실제 기능을 편리하고 안전하게 이용하는 과정"],["테스트·윤리·가치","기능 검증과 접근성, 개인정보, 공정성, 사회적 효용"]]]
];
const FIELDS=[
["projectTitle","프로젝트 제목","예: 우리 반 공부 계획 도우미"],
["user","① 사용자","누가 언제 이 소프트웨어를 쓰나요?"],
["problem","② 해결할 문제","누구에게 어떤 불편이 생기나요?"],
["criteria","③ 성공 기준","어떤 행동이나 수치로 개선을 확인하나요?"],
["data","④ 데이터 계획·윤리","필요한 데이터, 출처, 결측·편향·개인정보 원칙"],
["analysis","⑤ 분석 결과와 그래프 해석","평균·조건 비교의 의미, 알 수 없는 것"],
["model","⑥ 시뮬레이션 모델·가정","변화시킬 입력과 세 가지 시나리오, 한계"],
["features","⑦ 핵심 서비스 기능","최소 기능 2개, 입력→처리→출력"],
["flow","⑧ 사용자 화면 흐름","3단계 사용자 행동 및 오류 메시지"],
["feedback","⑨ 사용자 테스트·개선","실명 없이 관찰한 피드백과 바꾼 점"],
["value","⑩ 사회적 가치·윤리 검토","누구에게 어떤 도움이 되나요? 예상 부작용은?"]
];
const CODE={
pandas:"import pandas as pd\nfrom io import StringIO\ncsv = \"subject,score\\nMath,78\\nEnglish,88\\nScience,62\\nInformation,91\"\ndf = pd.read_csv(StringIO(csv))\nprint(\"평균:\", round(df['score'].mean(), 2))\nprint(df[df['score'] < 80])\nprint(df.sort_values('score', ascending=False))",
chart:"import matplotlib.pyplot as plt\nsubjects = ['Math','English','Science','Information']\nscores = [78,88,62,91]\nplt.bar(subjects,scores)\nplt.ylim(0,100)\nplt.ylabel('Fictional score')\nplt.title('Fictional practice data')\nplt.show()",
tree:"from sklearn.tree import DecisionTreeClassifier\n# 가상 데이터일 뿐 실제 성적 예측 용도가 아닙니다.\nX=[[10],[20],[30],[60],[90],[120]]\ny=[0,0,0,1,1,1]\nmodel=DecisionTreeClassifier(max_depth=2,random_state=42)\nmodel.fit(X,y)\nprint('70분 예측:',model.predict([[70]])[0])",
sim:"base_score = 75\nfor extra_minutes in [0,30,90]:\n    fictional_result = min(100,base_score + extra_minutes/10)\n    print(extra_minutes, '분:', fictional_result)\n# 실제 성적의 인과관계나 미래 예측이 아닙니다."
};
const empty=()=>({version:1,code:"",csv:SAMPLE,done:[],notes:{},answers:{},fields:{},simMinutes:30,simReflection:"",updatedAt:""});
let state=empty(),active=0,codeTab="pandas",rows=[],activeQuestions=[];
try{const old=JSON.parse(localStorage.getItem(KEY));if(old&&old.version===1&&Array.isArray(old.done)&&old.fields&&typeof old.fields==="object"){state={...empty(),...old,done:old.done.filter(x=>Number.isInteger(x)&&x>=0&&x<9),fields:old.fields||{},notes:old.notes||{},answers:old.answers||{}};}}catch(_){}
function save(){state.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(state));$("save-status").textContent="자동 저장 완료";}catch(_){$("save-status").textContent="저장 불가 · JSON으로 내보내세요";}meter();}
function meter(){const n=new Set(state.done).size;$("meter-text").textContent=n+" / 9 차시";$("meter-bar").style.width=n/9*100+"%";}
function download(name,content,type){const u=URL.createObjectURL(new Blob([content],{type})),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);}
function switchPage(page){document.querySelectorAll(".page").forEach(e=>e.classList.toggle("hidden",e.id!==page));document.querySelectorAll("[data-view]").forEach(e=>e.classList.toggle("selected",e.dataset.view===page));if(page==="lessons")showLesson(active);if(page==="project")fillProject();if(page==="exam")drawExam();try{history.replaceState(null,"","#"+page);}catch(_){}window.scrollTo(0,0);}
document.addEventListener("click",e=>{const v=e.target.closest("[data-view]");if(v)switchPage(v.dataset.view);const l=e.target.closest("[data-lesson]");if(l){active=Number(l.dataset.lesson);switchPage("lessons");}});
$("unit-steps").innerHTML=["학교의 문제 찾기","센서와 창작 연결","CSV·Pandas·그래프","변수 변경 실험","사용자 가치 검증"].map((x,i)=>'<div class="step"><b>'+(i+1)+'. '+esc(x)+'</b><p>'+esc(["문제와 사람 이해","아두이노 복습","데이터로 근거 만들기","모델 가정 확인","소프트웨어 설계·발표"][i])+'</p></div>').join("");
function quizHtml(q,id){return '<fieldset class="quiz"><legend><b>'+esc(q[0])+'</b></legend>'+q[1].map((c,k)=>'<label><input type="radio" name="'+id+'" value="'+k+'"> '+esc(c)+'</label>').join("")+'<div class="answer" id="feedback-'+id+'" hidden></div></fieldset>';}
function showLesson(i){if(i<0||i>=9)return;active=i;$("lesson-list").innerHTML=LESSONS.map((l,j)=>'<button data-lesson="'+j+'" class="lesson-item '+(j===i?"active ":"")+(state.done.includes(j)?"done":"")+'"><span class="lesson-num">'+(state.done.includes(j)?"✓":j+1)+'</span><span><b>'+esc(l[0])+'</b><small>'+esc(l[1]+" · "+l[2])+'</small></span></button>').join("");const l=LESSONS[i];$("lesson-detail").innerHTML='<span class="badge">LESSON '+(i+1)+' · '+esc(l[1])+'</span><h2>'+esc(l[0])+'</h2><p><b>교과서 연계:</b> '+esc(l[2])+'</p><div class="callout"><b>목표</b><br>'+esc(l[3])+'</div><h3>50분 수업 진행</h3><ol>'+l[4].split("|").map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol><div class="learning-note"><b>오늘의 결과물</b><p>'+esc(l[5])+'</p></div><div class="row"><button class="primary small" data-view="'+([2,3,4,5,7].includes(i)?"lab":"project")+'">실습 시작 →</button><a class="plain small" target="_blank" rel="noopener" href="../ai-agent-smart-life/">기존 Python 실습실 ↗</a></div><h3 style="margin-top:24px">형성평가 · 3문항</h3><form id="lesson-quiz">'+Array.from({length:3},(_,j)=>{const q=QA.filter(v=>v[0]===(i===0?1:i===1||i===2||i===3||i===4?3:i===5?4:5))[j]||QA[j];return quizHtml([q[1],q[2],q[3],q[4]],"l-"+i+"-"+j);}).join("")+'<button class="primary small" type="button" id="grade-lesson">채점과 해설</button><p id="lesson-score" role="status"></p></form><label class="wide-label">오늘 배운 점<textarea id="lesson-note" rows="3" placeholder="개념과 내 프로젝트에 적용할 점"></textarea></label><div class="row"><button class="primary small" id="finish-lesson">'+(state.done.includes(i)?"✓ 완료 기록됨":"차시 학습 완료 표시")+'</button><button class="plain small" id="next-lesson">다음 차시 →</button></div><details class="teacher-guide" style="margin-top:20px"><summary>교사 지도 포인트</summary><p>'+esc(l[6])+'</p></details>';
$("lesson-note").value=state.notes[i]||"";$("lesson-note").addEventListener("input",e=>{state.notes[i]=e.target.value;save();});$("finish-lesson").addEventListener("click",()=>{if(!state.done.includes(i)){state.done.push(i);save();}showLesson(i);});$("next-lesson").addEventListener("click",()=>{showLesson(Math.min(8,i+1));window.scrollTo(0,0);});$("grade-lesson").addEventListener("click",()=>{const unit=i===0?1:i<=4?3:i===5?4:5;const qs=QA.filter(v=>v[0]===unit).slice(0,3);let right=0,answered=0;qs.forEach((q,j)=>{const sel=document.querySelector('input[name="l-'+i+'-'+j+'"]:checked'),msg=$("feedback-l-"+i+"-"+j);if(sel){answered++;const good=Number(sel.value)===q[3];right+=Number(good);msg.hidden=false;msg.className="answer"+(good?"":" wrong");msg.textContent=(good?"정답. ":"정답: "+q[2][q[3]]+". ")+q[4];}});$("lesson-score").textContent=answered===3?"점수: "+right+" / 3":"3문항 모두 응답해 주세요.";if(answered===3){state.answers["lesson-"+i]={right,total:3};save();}});}
function parseCSV(raw){const lines=String(raw||"").replace(/^\uFEFF/,"").trim().split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(lines.length<2||lines.length>101)throw Error("헤더 포함 2~101줄이어야 합니다.");if(lines[0].replace(/\s/g,"").toLowerCase()!=="subject,score")throw Error("첫 줄은 subject,score 이어야 합니다.");return lines.slice(1).map((s,i)=>{const a=s.split(",");if(a.length!==2||!a[0].trim()||a[0].length>35||!a[1].trim()||!Number.isFinite(Number(a[1]))||Number(a[1])<0||Number(a[1])>100)throw Error((i+2)+"번째 행을 확인하세요(이름, 0~100 숫자).");return {subject:a[0].trim(),score:Number(a[1])};});}
function calc(){const values=rows.map(r=>r.score),avg=values.length?values.reduce((a,b)=>a+b,0)/values.length:75;const min=Number($("minutes").value);$("minutes-output").textContent=min;$("sim-result").innerHTML='<div class="numbers"><div><small>가상 평균</small><strong>'+avg.toFixed(1)+'</strong></div><div><small>추가 시간</small><strong>'+min+'분</strong></div><div><small>모델 결과</small><strong>'+Math.min(100,avg+min/10).toFixed(1)+'</strong></div></div><p>가정: 10분당 1점 증가, 상한 100점. <b>실제 성적을 예측하는 것이 아닌 단순 가상 실험입니다.</b></p>';}
function analyze(persist=true){try{rows=parseCSV($("csv-input").value);state.csv=$("csv-input").value;const nums=rows.map(r=>r.score),avg=nums.reduce((a,b)=>a+b,0)/nums.length;$("stats").innerHTML='<div class="numbers"><div><small>자료 수</small><strong>'+rows.length+'</strong></div><div><small>평균</small><strong>'+avg.toFixed(1)+'</strong></div><div><small>범위</small><strong>'+Math.min(...nums)+'–'+Math.max(...nums)+'</strong></div></div>';$("bar-chart").innerHTML=rows.slice(0,20).map(r=>'<div class="barline"><span>'+esc(r.subject.slice(0,8))+'</span><div class="bartrack"><span style="width:'+r.score+'%"></span></div><b>'+r.score+'</b></div>').join("");$("csv-message").textContent=rows.length+"개 가상 자료 분석 완료";$("home-preview").textContent="가상 자료 "+rows.length+"개 · 평균 "+avg.toFixed(1)+"점";if(persist)save();}catch(e){rows=[];$("csv-message").textContent=e.message;$("stats").textContent="CSV를 수정한 뒤 다시 분석하세요.";$("bar-chart").textContent="";}calc();}
$("csv-input").value=state.csv||SAMPLE;$("csv-analyze").addEventListener("click",()=>analyze());$("csv-reset").addEventListener("click",()=>{$("csv-input").value=SAMPLE;analyze();});$("csv-save").addEventListener("click",()=>download("fictional-practice.csv","\uFEFF"+$("csv-input").value,"text/csv;charset=utf-8"));
$("minutes").value=state.simMinutes??30;$("minutes").addEventListener("input",e=>{state.simMinutes=Number(e.target.value);save();calc();});$("sim-reflect").value=state.simReflection||"";$("sim-reflect").addEventListener("input",e=>{state.simReflection=e.target.value;save();});
function codeDraw(){$("python-code").textContent=CODE[codeTab];document.querySelectorAll("[data-code]").forEach(e=>e.classList.toggle("active",e.dataset.code===codeTab));}
document.querySelectorAll("[data-code]").forEach(e=>e.addEventListener("click",()=>{codeTab=e.dataset.code;codeDraw();}));$("copy-code").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(CODE[codeTab]);$("copy-code").textContent="복사 완료";setTimeout(()=>$("copy-code").textContent="코드 복사",1700);}catch(_){}});
$("project-fields").innerHTML=FIELDS.map(([id,label,hint])=>'<label for="field-'+id+'">'+esc(label)+'<span>'+esc(hint)+'</span><textarea id="field-'+id+'" rows="'+(id==="projectTitle"?2:4)+'" maxlength="3000" placeholder="'+esc(hint)+'"></textarea></label>').join("");function fillProject(){FIELDS.forEach(([id])=>{const e=$("field-"+id);if(document.activeElement!==e)e.value=state.fields[id]||"";});}FIELDS.forEach(([id])=>$("field-"+id).addEventListener("input",e=>{state.fields[id]=e.target.value;save();}));
function portfolio(){const value=k=>esc(state.fields[k]||"아직 작성되지 않았습니다.").replace(/\n/g,"<br>");return '<!doctype html><html lang="ko"><meta charset="utf-8"><title>소프트웨어와 생활 프로젝트</title><style>body{max-width:850px;margin:35px auto;padding:0 18px;color:#192b40;font:15px/1.8 sans-serif}section{border-bottom:1px solid #ccc;padding:10px}h2{font-size:17px;color:#4059aa}</style><h1>'+value("projectTitle")+'</h1><p>고2 소프트웨어와 생활 · 9차시 프로젝트</p>'+FIELDS.slice(1).map(([id,label])=>'<section><h2>'+esc(label)+'</h2><p>'+value(id)+'</p></section>').join("")+'<p>개인정보와 실제 성적을 포함하지 않는 교육용 포트폴리오</p></html>';}
$("project-export").addEventListener("click",()=>download("software-life-project.html",portfolio(),"text/html;charset=utf-8"));$("project-print").addEventListener("click",()=>{download("software-life-print.html",portfolio(),"text/html;charset=utf-8");alert("인쇄용 HTML을 저장했습니다. 파일을 열고 Ctrl+P로 인쇄하거나 PDF로 저장하세요.");});
$("student-code").value=state.code||"";$("student-code").addEventListener("input",e=>{state.code=e.target.value.replace(/[^A-Za-z0-9-]/g,"").slice(0,8);e.target.value=state.code;save();});
$("export-all").addEventListener("click",()=>{state.csv=$("csv-input").value;save();download("software-life-backup-"+(state.code||"anonymous")+".json",JSON.stringify(state,null,2),"application/json;charset=utf-8");});
const loadBtn=document.createElement("button"),file=document.createElement("input");loadBtn.textContent="기록 가져오기 ↑";file.type="file";file.accept=".json,application/json";file.hidden=true;$("export-all").after(loadBtn,file);loadBtn.addEventListener("click",()=>file.click());file.addEventListener("change",async()=>{try{if(!file.files[0])return;const obj=JSON.parse(await file.files[0].text());if(obj.version!==1||!Array.isArray(obj.done)||!obj.fields||typeof obj.csv!=="string"||obj.csv.length>15000)throw Error("기록 파일 형식이 다릅니다.");if(!confirm("현재 내용을 백업 파일의 기록으로 덮어쓸까요?"))return;state={...empty(),...obj,done:obj.done.filter(x=>Number.isInteger(x)&&x>=0&&x<9),fields:obj.fields||{},notes:obj.notes||{},answers:obj.answers||{}};$("csv-input").value=state.csv;$("student-code").value=state.code||"";$("minutes").value=state.simMinutes??30;$("sim-reflect").value=state.simReflection||"";save();analyze(false);showLesson(active);fillProject();alert("복원 완료");}catch(e){alert("불러오기 실패: "+e.message);}finally{file.value="";}});
$("concept-list").innerHTML=TERMS.map((u,i)=>'<article class="card"><h3><span class="badge">'+(i+1)+'단원</span> '+esc(u[0])+'</h3><div class="termgrid">'+u[1].map(([a,b])=>'<div class="term"><b>'+esc(a)+'</b><p>'+esc(b)+'</p></div>').join("")+'</div></article>').join("");
function drawExam(){const unit=$("exam-unit").value;activeQuestions=QA.filter(q=>unit==="all"||String(q[0])===unit);$("exam-meta").textContent=activeQuestions.length+"개 공개 연습문항 · 1~5단원 범위 · 공식 기말 시험 원안이 아닙니다";$("exam-form").innerHTML=activeQuestions.map((q,i)=>'<div class="exam-question"><h4>'+(i+1)+'. [제'+q[0]+'단원] '+esc(q[1])+'</h4>'+q[2].map((c,j)=>'<label><input type="radio" name="exam-'+i+'" value="'+j+'"> '+esc(["①","②","③"][j]+" "+c)+'</label>').join("")+'<div class="answer" id="e-'+i+'" hidden></div></div>').join("");$("exam-result").textContent="";}
$("exam-unit").addEventListener("change",drawExam);$("exam-new").addEventListener("click",drawExam);$("exam-reset").addEventListener("click",drawExam);$("exam-grade").addEventListener("click",()=>{let correct=0,answered=0;activeQuestions.forEach((q,i)=>{const input=document.querySelector('input[name="exam-'+i+'"]:checked'),box=$("e-"+i),good=input&&Number(input.value)===q[3];if(input)answered++;if(good)correct++;box.hidden=false;box.className="answer"+(good?"":" wrong");box.textContent=(good?"정답. ":"정답: "+q[2][q[3]]+". ")+q[4];});$("exam-result").textContent="점수 "+correct+" / "+activeQuestions.length+" · 응답 "+answered+"문항. 해설을 보고 다시 복습하세요.";state.answers.exam={correct,total:activeQuestions.length,unit:$("exam-unit").value};save();});
$("teacher-guides").innerHTML=LESSONS.map((l,i)=>'<details class="card teacher-guide"><summary>'+(i+1)+'차시 '+esc(l[0])+' · '+esc(l[1])+'</summary><p><b>목표:</b> '+esc(l[3])+'</p><ol>'+l[4].split("|").map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol><p><b>학생 결과물:</b> '+esc(l[5])+'</p><p><b>지도 포인트:</b> '+esc(l[6])+'</p></details>').join("");
meter();showLesson(0);codeDraw();analyze(false);drawExam();fillProject();const hash=location.hash.slice(1);switchPage(["home","lessons","lab","project","concepts","exam","teacher"].includes(hash)?hash:"home");
})();