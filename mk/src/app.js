import {activities,activityById,lessons,codeup,questions,candidates} from './content.js';
import {room} from './student-room.js';
import {runPython} from './student-run.js';
import {reverseCompareMarkup,wireReverseCompare,stopReverseCompare} from './reverse-compare.js';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const topicNames={list:'리스트',turtle:'Turtle',matplotlib:'matplotlib',control:'제어·문자열',nested:'중첩 반복',fstring:'f-string',codeup:'CodeUp'};
const reviewSections=[['basics','기초·리스트·출력','mk3-basics'],['turtle','Turtle 그래픽','mk3-turtle-square'],['graphs','matplotlib·수학 그래프','mk3-plot-math'],['gravity','속도·중력 · 선택','mk3-gravity'],['coordinates','화면 좌표계·그래픽 원리','mk3-coordinates'],['gallery','그래픽 작품 체험실 · 선택',null]];
const optional=a=>a.scope==='optional'?'<span class="badge optional">선택 심화 · 기본 평가에 자동 포함하지 않음</span>':'<span class="badge">기본 학습</span>';
const link=(label,page,extra='')=>`<a data-route href="./?page=${page}${extra}">${esc(label)}</a>`;
const table=rows=>rows?.length?`<div class="table-scroll"><table><thead><tr>${rows[0].map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
const list=items=>`<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
const heading=(eyebrow,title,description='')=>`<div class="page-heading"><span class="eyebrow">${esc(eyebrow)}</span><h1 tabindex="-1">${esc(title)}</h1><p>${esc(description)}</p></div>`;
const activityLink=(a,from='lessons')=>a.id.startsWith('mk3-cu')?`./?page=codeup&id=${a.id.replace('mk3-cu','').replace('-v','')}${a.id.endsWith('-v')?'&variant=1':''}&from=${from}`:`./?page=activity&id=${a.id}&from=${from}`;
const activityCards=(ids,from='lessons')=>`<div class="grid two">${ids.map(id=>{const a=activityById.get(id);return a?`<a data-route href="${activityLink(a,from)}" class="card card-link topic-strip topic-${a.topic}"><span class="badge">${esc(topicNames[a.topic])}</span><h3>${esc(a.title)}</h3><p>${esc(a.description.slice(0,95))}${a.description.length>95?'…':''}</p>${a.scope==='optional'?'<span class="badge optional">선택</span>':''}<span class="card-arrow">↗</span></a>`:'';}).join('')}</div>`;
let route=new URL(location.href),navGeneration=0,shownWorkspace=null,publicRunner=null,rawOutput='',whitespace=false;
let notebook={},notebookVersion=0,touched=new Set();
let questionTopic='all',questionLevel='all',wrongOnly=false;
const reportFields=[['topic','탐구 주제'],['prediction','실행 전 예상'],['conditions','바꾼 조건'],['before','변경 전 코드'],['after','변경 후 코드'],['result','입력과 실행 결과'],['reason','결과가 달라진 이유'],['next','다음에 탐구할 질문']];
$('review-nav').innerHTML=reviewSections.map(([key,title])=>link(title,'review','&section='+key)).join('')+'<strong>궁금증을 파헤치는 탐구실</strong>'+['a','b','c','d'].map(k=>link(activityById.get('mk3-inquiry-'+k).title,'inquiry','&id='+k)).join('');
function aliasPage(url){
 if(url.searchParams.has('page'))return;
 const file=url.pathname.split('/').pop();
 const map={'student-room.html':['practice'],'python-review.html':['review','section',url.hash==='#basics'?'basics':({'#turtle':'turtle','#math':'graphs','#physics':'gravity','#coordinates':'coordinates','#gallery':'gallery','#inquiry':'inquiries'})[url.hash]||'basics'],'list-tuple-dictionary.html':['inquiry','id','a'],'binary.html':['inquiry','id','b'],'binary-color.html':['inquiry','id','b'],'radians.html':['inquiry','id','c'],'four-turtles.html':['inquiry','id','d'],'graphics-gallery.html':['review','section','gallery'],'math-function-graphs.html':['review','section','graphs'],'physics-explanation.html':['review','section','coordinates'],'simulation.html':['review','section','gravity'],'mastery.html':['questions'],'questions-supplement.html':['questions'],'lesson01-guide.html':['lesson','unit','01'],'first-analysis.html':['lesson','unit','01'],'step-by-step.html':['lessons'],'textbook-classroom.html':['lessons'],'textbook-guide.html':['resources'],'teacher-10.html':['resources'],'kosis-project.html':['report']};
 const target=map[file]||['home'];url.searchParams.set('page',target[0]);if(target[1])url.searchParams.set(target[1],target[2]);
 if(file==='student-room.html'&&url.searchParams.get('panel')==='library')url.searchParams.set('page','practice');
}
function home(){return heading('01 / 수업 안내','오늘은 어떤 코드를 바꿔 볼까요?','고1 · 2026학년도 정보 — Python 프로그래밍 · 기말 대비')+`<section class="hero"><div><span class="eyebrow">READ. CHANGE. EXPLAIN.</span><h2>코드를 읽고, 바꾸고,<br>설명하는 Python</h2><p class="lead">리스트, 거북이 그래픽, 그래프와 반복문을 직접 실행하며 기말 학습을 정리해요.</p><div class="toolbar"><a data-route class="button primary" href="./?page=lessons">차시별 실습 시작 <span>→</span></a><a data-route class="button" href="./?page=review&section=basics">00 핵심 복습</a></div></div><div class="hero-visual" aria-label="리스트와 반복으로 색상 선택"><div class="visual-label"><span>MY FIRST PYTHON</span><span>● ● ●</span></div><pre class="mini-code"><span class="code-keyword">colors</span> = ["violet", "mint", "coral"]
<span class="code-keyword">for</span> i <span class="code-keyword">in</span> range(len(colors)):
    print(i, colors[i])</pre><div class="color-chips"><i style="background:#9b87e8"></i><i style="background:#81d4ba"></i><i style="background:#ef9a85"></i></div><div class="flow"><span>01 읽기</span><span>02 바꾸기</span><span>03 설명하기</span></div></div></section><div class="section-heading"><h2>다섯 묶음, 열 개의 학습 단위</h2>${link('전체 차시 보기 →','lessons')}</div><div class="grid five">${[['turtle','Turtle','명령·좌표 → 반복 작품'],['matplotlib','matplotlib','선·막대 → 산점도·그래프'],['list','리스트','수정·추가 → 슬라이싱'],['control','제어·반복','조건·출력 → 중첩 반복'],['codeup','CodeUp','핵심 사고력 문제 1~10']].map((x,i)=>`<a class="card card-link topic-${x[0]}" data-route href="./?page=lesson&unit=${String(i*2+1).padStart(2,'0')}"><span class="number">0${i+1}</span><h3>${x[1]}</h3><p>${x[2]}</p></a>`).join('')}</div><p class="progress-line">Classroom의 5묶음을 웹에서 10개 단위로 나누었습니다. 한 묶음을 한 시간 안에 모두 끝내야 한다는 뜻은 아닙니다.</p><ol class="steps"><li><strong>먼저 예측하기</strong>코드가 만들 결과를 말이나 표로 적어 보세요.</li><li><strong>하나씩 바꾸기</strong>값·조건·반복 횟수를 바꾸고 실행해 보세요.</li><li><strong>이유 설명하기</strong>변수 추적과 결과를 비교하고 보고서에 남기세요.</li></ol><div class="grid two section-spacer"><section class="card"><span class="eyebrow">CHECK YOUR UNDERSTANDING</span><h3>기본 복습 40문항</h3><p>출력 예측부터 오류 수정까지. 틀린 문제를 다시 풀어 보세요.</p>${link('복습 문제 열기 →','questions')}</section><section class="card"><span class="eyebrow">YOUR OWN QUESTION</span><h3>궁금증을 파헤치는 탐구실</h3><p>리스트, 진법과 색, 라디안, 네 마리 거북이. A는 기본 복습, B~D는 선택 탐구입니다.</p>${link('탐구실 A~D 보기 →','review','&section=inquiries')}</section></div><section class="panel section-spacer"><h3>어디서든 이어가는 내 학습</h3><p>학교 학생은 학년도와 학급을 선택해 승인받습니다. 일반 이용자는 ‘개인 학습자로 시작’을 선택하면 학급 없이 자기 코드를 저장할 수 있습니다.</p><p class="hint">진급한 학년도에 새로 등록해도 이전 공간의 코드는 남습니다. 공유 PC에서는 저장 완료를 확인한 뒤 ‘이 PC 학습 마치기’를 누르세요.</p></section>`;}
function lessonsPage(){return heading('02 / 차시별 실습','열 번의 작은 실험','기본 개념을 읽고, 직접 실행한 뒤, 바꾼 이유를 설명합니다.')+`<div class="grid two">${lessons.map(l=>`<a data-route href="./?page=lesson&unit=${l.id}" class="card card-link topic-strip topic-${l.topic}"><span class="number">${l.id}</span><span class="badge">Classroom ${l.group}묶음</span><h3>${esc(l.title)}</h3><p>${esc(l.goals.join(' '))}</p><span class="card-arrow">↗</span></a>`).join('')}</div>`;}
function lessonPage(l){return heading('02 / Classroom '+l.group+'묶음 · 웹 단위 '+l.id,l.title,l.goals.join(' '))+`<section class="panel topic-${l.topic}"><h2>오늘의 목표</h2>${list(l.goals)}${Number(l.id)===10?'<div class="callout">1468·6097·6098은 중첩 리스트 연결 활동 뒤에 선택하는 심화입니다. 기본 평가 범위에 자동 포함되지 않습니다.</div>':''}<h3>활동 선택</h3>${activityCards(l.activities)}${Number(l.id)===6?`<div class="callout reverse-entry"><h3>새 실험 · 리스트 뒤집기 비교 실험실</h3><p><code>a[::-1]</code>과 <code>a.reverse()</code>를 한 단계씩 비교해 보세요. 원본, 반환값, 메모리 차이를 색과 애니메이션으로 확인합니다.</p><a data-route class="button" href="./?page=activity&id=mk3-list-sort">비교 실험실 열기 →</a></div>`:''}${l.tasks.length?`<div class="section-spacer"><h3>두 가지 바꿔 보기</h3>${list(l.tasks)}<h3>스스로 확인하기</h3>${l.checks.map(c=>`<details><summary>${esc(c.question)}</summary><p>${esc(c.answer)}</p></details>`).join('')}</div>`:''}</section>${Number(l.id)<10?`<p>${link('다음 학습 단위 →','lesson','&unit='+String(Number(l.id)+1).padStart(2,'0'))}</p>`:''}`;}
function detailPage(a){return heading('직접 실행 / '+topicNames[a.topic],a.title)+`<section class="panel topic-${a.topic}">${optional(a)}<p class="section-spacer">${esc(a.description)}</p>${a.trace.length?'<h3>실행 전에 예측하는 추적 표</h3>'+table(a.trace):''}${a.id==='mk3-list-edit'||a.id==='mk3-list-slices'||a.id==='mk3-inquiry-a'?listExplorer():''}${a.id==='mk3-inquiry-b'?colorExplorer():''}${a.id.startsWith('mk3-gugudan')?'<div class="callout">입력 확인: 2↵4, 7↵7, 2↵9는 정상 범위입니다. 5↵3, 1↵4, 2↵10은 안내를 출력해야 합니다.</div>'+activityCards(activities.filter(x=>x.id.startsWith('mk3-gugudan')).map(x=>x.id)):''}${a.id==='mk3-inquiry-a'?activityCards(['mk3-list-slices','mk3-list-sort','mk3-list-search'],'review'):''}${a.id==='mk3-list-sort'?reverseCompareMarkup():''}<p class="hint">실제 실행 후 ‘변수·리스트 추적’을 펼치면 각 줄을 실행하기 직전의 값이 보입니다.</p></section>`;}
function reviewPage(section){const entry=reviewSections.find(x=>x[0]===section)||reviewSections[0];
 if(section==='inquiries')return heading('00 / 궁금증을 파헤치는 탐구실','질문에서 시작하는 네 가지 탐구','A는 리스트 기본 복습입니다. B~D의 수학·그래픽 심화는 선택 체험입니다.')+activityCards(['mk3-inquiry-a','mk3-inquiry-b','mk3-inquiry-c','mk3-inquiry-d'],'review');
 if(section==='gallery')return galleryPage();
 const groups={basics:['mk3-basics','mk3-list-edit','mk3-list-slices','mk3-list-sort','mk3-list-search','mk3-fstring'],turtle:['mk3-turtle-square','mk3-turtle-coordinates','mk3-turtle-circles','mk3-turtle-star','mk3-turtle-illusion'],graphs:['mk3-plot-line','mk3-plot-bar','mk3-plot-scatter','mk3-plot-math','mk3-plot-conditional'],gravity:['mk3-gravity'],coordinates:['mk3-coordinates','mk3-turtle-coordinates']};
 return heading('00 / Python 핵심 복습',entry[1],'설치 없이 코드를 실행하고 결과와 변수를 함께 살펴보세요.')+`<div class="panel"><h2>읽고 → 실행하고 → 설명하기</h2><p>${esc(activityById.get(entry[2]).description)}</p>${section==='basics'?listExplorer():''}</div>`+activityCards(groups[entry[0]],'review');}
function listExplorer(){return `<div class="callout"><h3>인덱스 실험대</h3><p>같은 출발 리스트에서 한 가지 명령씩 비교합니다. 아래 Python 편집기에서도 실행해 보세요.</p><div class="index-controls">${['처음','a[3]="테스트"','append(60)','insert(1,15)','remove(20)','del a[0]','a[1:3]','a[:3]','a[2:]','a[::2]','a[::-1]'].map(x=>`<button data-list-op="${esc(x)}">${esc(x)}</button>`).join('')}</div><p class="list-row-title">처음 리스트 <small>원본 값</small></p><div id="list-before" class="list-visual" aria-label="변경 전 리스트"></div><p id="list-operation" role="status">처음 리스트 · 인덱스는 0부터 시작</p><p class="list-row-title">버튼 실행 후 <small>색칠된 칸을 비교하세요</small></p><div id="list-after" class="list-visual" aria-label="변경 후 리스트"></div><div class="list-legend" aria-label="색상 설명"><span><i class="list-legend-dot added"></i>추가·수정</span><span><i class="list-legend-dot removed"></i>삭제·이전 값</span><span><i class="list-legend-dot moved"></i>인덱스 이동</span><span><i class="list-legend-dot selected"></i>슬라이싱 선택</span></div></div>`;}
function colorExplorer(){return `<div class="panel"><h3>RGB 빛의 세기 바꾸기</h3><div class="toolbar">${['R','G','B'].map((x,i)=>`<label>${x} (0~255)<input class="rgb-control" type="range" min="0" max="255" value="${[109,92,231][i]}" aria-label="${x} 빛 세기"></label>`).join('')}</div><div id="rgb-swatch" style="height:90px;border-radius:12px"></div><p id="rgb-value" role="status"></p><p class="hint">FF₁₆ = 15×16 + 15 = 255입니다. 이 조절판은 색의 원리를 살펴보는 웹 도구입니다.</p></div>`;}
function codeupPage(problem,variant){const a=activityById.get(variant?problem.variant:problem.activity);return heading('02·04 / CodeUp '+problem.number,a.title)+`<section class="panel topic-codeup"><div class="lesson-meta">${optional(a)}<span class="badge">${esc(problem.difficulty)} · 교실 기준</span></div><p><a href="${problem.url}" target="_blank" rel="noopener noreferrer">CodeUp 공식 원문 ↗</a>${problem.number===6097?' · 1098의 Python 대응':problem.number===6098?' · 1099의 Python 대응':''}</p><div class="toolbar">${link('원문 연결 활동','codeup','&id='+problem.number)}${link('독자적인 변형 연습','codeup','&id='+problem.number+'&variant=1')}</div><h3>${variant?'변형 과제':'문제의 핵심'}</h3><p>${esc(variant?problem.variantPrompt:problem.summary)}</p>${!variant?`<h3>입력과 출력</h3><p>${esc(problem.io)}</p>`:''}<p class="hint">선수 학습: ${esc(problem.prerequisites.join(' · '))}</p>${a.scope==='optional'?`<div class="callout">먼저 ${link('중첩 리스트 연결 활동','activity','&id=mk3-grid-bridge')}에서 행과 열을 연습하세요.</div>`:''}<h3>실행 전 예측</h3><p>${esc(variant?'원문과 달라진 조건은 무엇인가요? 첫 공개 테스트의 결과를 먼저 예측해 보세요.':problem.prediction)}</p>${!variant?table(problem.trace):''}<h3>힌트 세 단계</h3>${problem.hints.map((h,i)=>`<details><summary>힌트 ${i+1}</summary><p>${esc(variant?'원문 풀이와 연결해 생각하세요. ':'')}${esc(h)}</p></details>`).join('')}<details><summary>풀이와 해설 보기</summary><pre>${esc(a.code)}</pre><p>${esc(problem.explanation)}</p><p>원문과 변형은 서로 다른 저장 기록을 사용합니다. 동일 원문 활동을 02·04에서 열면 같은 기록을 불러옵니다.</p></details><p class="hint">${esc(problem.verified)} 문제 설명·해설·변형은 이 교실에서 새로 작성했습니다.</p></section>`;}
function resourcesPage(){return heading('03 / 실습 자료','필요한 코드와 활동지를 한곳에서','학생용으로 정리한 예제만 제공합니다. 선택 체험과 기본 학습을 구분해 사용하세요.')+`<section class="panel"><h2>사용 순서</h2><ol><li>‘웹에서 실행’으로 결과를 먼저 확인합니다.</li><li>‘Python 파일’은 PC에서 실행하거나 과제에 첨부할 때 내려받습니다.</li><li>입력 파일은 편집기 아래 표준 입력에 붙여 넣습니다. Turtle와 matplotlib는 웹에서 바로 실행됩니다.</li></ol><div class="toolbar"><a class="button" href="./downloads/study-checklist.txt" download>학습 점검표</a><a class="button" href="./downloads/inquiry-report.txt" download>탐구 보고서 양식</a></div></section><section class="panel resource-list"><h2>실행 예제 ${activities.length}개</h2>${activities.map(a=>`<div class="entry topic-${a.topic}"><div><strong>${esc(a.title)}</strong>${optional(a)}</div><div class="toolbar"><a data-route href="${activityLink(a)}">웹에서 실행</a><a href="./downloads/${a.id}.py" download>Python 파일</a>${a.stdin?`<a href="./downloads/${a.id}-input.txt" download>입력 파일</a>`:''}</div></div>`).join('')}</section>`;}
function catalog(){return `<section class="panel section-spacer"><h2>CodeUp 핵심 10문제</h2><p>1~7은 기본 연결, 8~10은 중첩 리스트 선택 심화입니다.</p>${activityCards(codeup.map(p=>p.activity),'questions')}<details><summary>기존 후보 20개 참고 목록</summary><p>1098/1099는 6097/6098로 연결하며 핵심 문제 수에 중복으로 세지 않습니다.</p>${table([['번호','문제','연결'],...candidates.map(c=>[c.id,c.title,c.pythonId?'Python '+c.pythonId:c.scope==='optional-extension'?'선택 심화':'추가 참고'])])}<div class="toolbar">${candidates.map(c=>`<a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.id}${c.pythonId?' → '+c.pythonId:''}</a>`).join('')}</div></details></section>`;}
function questionsPage(){return heading('04 / 복습 문제','예측하고 설명하는 40문항','공개 학습 연습입니다. 실제 비공개 시험 원안이나 정답표가 아닙니다.')+`<div class="quiz-stats"><span>리스트 12</span><span>Turtle 6</span><span>matplotlib 6</span><span>제어·문자열 6</span><span>f-string 4</span><span>중첩 반복 6</span></div><section class="panel"><div class="filters"><label>주제<select id="question-topic"><option value="all">전체</option>${['list','turtle','matplotlib','control','fstring','nested'].map(t=>`<option value="${t}">${topicNames[t]}</option>`).join('')}</select></label><label>난이도<select id="question-level"><option value="all">전체</option><option>기본</option><option>적용</option></select></label><label><input id="wrong-only" type="checkbox">오답만 보기</label><button id="retry-questions">현재 목록 다시 풀기</button></div><div class="toolbar"><button id="notebook-save">오답 기록 클라우드 저장</button><button id="notebook-load">저장한 오답 기록 불러오기</button><button id="notebook-export">오답 기록 내려받기</button></div><p id="notebook-status" class="hint" role="status">지금 답한 내용은 이 화면의 메모리에만 있습니다. 로그인 후 저장 버튼을 눌러야 클라우드에 보관됩니다.</p><p id="question-count"></p><div id="question-list"></div></section>${catalog()}`;}
function reportPage(){return heading('05 / 탐구 보고서','내가 바꾼 코드, 내가 찾은 이유','하나의 조건을 바꾸고 실행 전후의 차이를 증거와 함께 설명하세요.')+`<div class="panel"><h2>탐구를 시작할 네 가지 질문</h2><ul><li>리스트의 reverse()와 [::-1]은 원본을 어떻게 다르게 바꿀까요?</li><li>구구단의 바깥·안쪽 반복 순서를 바꾸면 출력은 어떻게 달라질까요?</li><li>Turtle 회전 각도를 90도에서 89도로 바꾸면 어떤 무늬가 될까요?</li><li>그래프의 데이터 한 개를 바꾸면 모양과 해석은 어떻게 달라질까요?</li></ul><h3>작성 예시: 색 목록을 늘리면?</h3><p><strong>예상</strong> 색을 하나 추가하면 마지막 색도 나올 것이다. <strong>변경</strong> 색상 목록에 새 색을 추가하고 %6을 %len(colors)로 바꾼다.</p><p><strong>관찰</strong> 변경 전에는 마지막 색이 나오지 않았고, 변경 뒤에는 모든 색이 순환했다. <strong>이유</strong> 나머지 범위가 색상 리스트의 길이와 맞아졌기 때문이다.</p><p class="hint">아래 입력은 편집기의 같은 보고서 기록에 연결됩니다. 로그인 전에는 메모리에만 있으며, 내보내기로 직접 보관하세요.</p></div>`;}
function galleryPage(){return heading('00 / 그래픽 작품 체험실','숫자와 반복이 만드는 움직임','선택 체험입니다. 아래는 첨부 작품의 원리를 웹 Canvas로 재구성한 시각 도구이며 Python 실행 결과로 표시하지 않습니다.')+`<section class="panel"><span class="badge optional">고급 수학·그래픽 · 기본 평가에 자동 포함하지 않음</span><div class="toolbar"><label>작품 선택<select id="gallery-mode"><option value="particles">빛 입자 · 위치와 속도</option><option value="aurora">오로라 · 곡선의 겹침</option><option value="warp">워프 터널 · 원근감</option><option value="chaos">궤적 · 작은 변화의 누적</option><option value="alpha">투명도 · 색의 겹침</option><option value="waves">파동 · 행과 열</option></select></label></div><iframe id="gallery-frame" class="gallery-frame" title="선택 그래픽 체험 도구" sandbox="allow-scripts"></iframe><div class="callout"><h3>관찰 질문</h3><p>속도를 바꾸면 궤적 간격이 어떻게 달라지나요? 입자 수를 늘리면 화면의 밀도와 성능은 어떻게 달라지나요? 한 번에 한 조건만 바꾸어 비교하세요.</p></div><p>고급 원본의 새 함수·클래스 정의는 기본 필수 예제에 넣지 않았습니다. 체험 중에는 중지·초기화 버튼을 사용할 수 있고, 화면을 떠나면 움직임을 멈춥니다.</p>${link('관찰 결과를 보고서로 남기기 →','report')}</section>`;}
async function navigate(next,{push=true,open=true}={}){
 const url=next instanceof URL?next:new URL(next,location.href);aliasPage(url);const generation=++navGeneration;
 if(push&&!await room.guard())return;if(generation!==navGeneration)return;
 publicRunner?.stop();publicRunner=null;route=url;
 const page=url.searchParams.get('page'),id=url.searchParams.get('id'),section=url.searchParams.get('section')||'basics';
 let html='',active=null;
 if(page==='home')html=home();
 else if(page==='lessons')html=lessonsPage();
 else if(page==='lesson'){const l=lessons.find(l=>l.id===url.searchParams.get('unit'))||lessons[0];html=lessonPage(l);}
 else if(page==='review'){html=reviewPage(section);}
 else if(page==='inquiry'){active='mk3-inquiry-'+(['a','b','c','d'].includes(id)?id:'a');html=detailPage(activityById.get(active));}
 else if(page==='codeup'){const p=codeup.find(p=>String(p.number)===id)||codeup[0];const variant=url.searchParams.get('variant')==='1';active=variant?p.variant:p.activity;html=codeupPage(p,variant);}
 else if(page==='activity'){const a=activityById.get(id);if(a){active=a.id;html=detailPage(a);}else html=heading('활동 찾기','등록된 활동이 아닙니다.','차시별 실습에서 활동을 다시 선택하세요.');}
 else if(page==='resources')html=resourcesPage();
 else if(page==='questions')html=questionsPage();
 else if(page==='report'){active='mk3-report';html=reportPage();}
 else {active=url.searchParams.get('workspace')||room.current()||'scratch-01';html=heading('내 Python 실습실','내 코드로 이어가는 학습','자유 실습과 이전 과정 기록을 선택하거나, 보관함에서 저장한 코드를 여세요.');}
 if(push){url.pathname='/';url.hash='';history.pushState({},'',url);}else if(!location.search&&location.pathname==='/')history.replaceState({},'',url);
 $('page-content').innerHTML=html;$('practice-panel').hidden=!active;$('teacher-area').hidden=true;$('library-panel').hidden=true;$('history-panel').hidden=true;
 $('review-nav').hidden=!(page==='review'||page==='inquiry'||url.searchParams.get('from')==='review');
 const mainPage=['review','inquiry'].includes(page)||url.searchParams.get('from')==='review'?'review':['lesson','activity','codeup'].includes(page)?url.searchParams.get('from')==='questions'?'questions':'lessons':page;
 document.querySelectorAll('.sidebar nav>a').forEach(a=>{const yes=new URL(a.href).searchParams.get('page')===mainPage;if(yes)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('sidebar').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');
 document.title=(document.querySelector('#page-content h1')?.textContent||'수업 안내')+' | 영수쌤의 Python 교실';
 shownWorkspace=active;
 configurePractice(active);
 wirePage(page);
 if(active&&open){await room.open(active);if(generation!==navGeneration)return;}
 if(active==='mk3-report')hydrateReport();
 if(push){$('main').scrollIntoView();document.querySelector('#page-content h1')?.focus({preventScroll:true});}
}
function configurePractice(id){
 const report=id==='mk3-report';$('code-workbench').hidden=report;$('report-fields').hidden=!report;$('trace-panel').hidden=report;$('public-tests').replaceChildren();
 $('report-fields').innerHTML=report?`<div class="report-grid">${reportFields.map(([key,label])=>`<label class="${['before','after','result'].includes(key)?'wide':''}">${label}<textarea data-report="${key}" maxlength="2000" rows="3" disabled></textarea></label>`).join('')}</div><div class="toolbar"><button id="report-export">탐구 보고서 TXT 내보내기</button></div>`:'';
 if(report){document.querySelectorAll('[data-report]').forEach(el=>el.addEventListener('input',()=>{const data={};document.querySelectorAll('[data-report]').forEach(x=>data[x.dataset.report]=x.value);room.setText(JSON.stringify(data,null,2));}));$('report-export').onclick=()=>downloadText('나의_탐구_보고서.txt',reportFields.map(([k,l])=>l+'\n'+(document.querySelector('[data-report="'+k+'"]').value||'')+'\n').join('\n'));}
 const a=activityById.get(id);if(a?.tests){$('public-tests').innerHTML=`<h3 class="section-spacer">공개 테스트 ${a.tests.length}개</h3><p class="hint">현재 편집기의 코드를 실행해 비교합니다. CodeUp 공식 채점 결과가 아니며 행별 공백·줄바꿈도 직접 확인하세요.</p><div class="toolbar"><button id="test-all">현재 코드로 공개 테스트 실행</button><button id="test-stop" disabled>테스트 중지</button></div><div id="test-status" role="status"></div>${a.tests.map((t,i)=>`<details><summary>테스트 ${i+1} · 입력과 기대 결과</summary><strong>입력</strong><pre>${esc(t.input)}</pre><strong>기대 결과 (·는 공백, ↵는 줄바꿈)</strong><pre>${esc(showSpace(t.expected))}</pre><button data-test-input="${i}">이 입력을 편집기에 넣기</button></details>`).join('')}`;
 document.querySelectorAll('[data-test-input]').forEach(b=>b.onclick=()=>$('stdin').value=a.tests[+b.dataset.testInput].input);
 $('test-all').onclick=()=>testAll(a);$('test-stop').onclick=()=>publicRunner?.stop();}
}
function hydrateReport(){if(room.current()!=='mk3-report')return;const fields=document.querySelectorAll('[data-report]');for(const el of fields)el.disabled=room.isLoading();if(room.isLoading())return;let data={};try{data=JSON.parse($('editor').value||'{}');}catch{$('notice').textContent='보고서 원문 형식을 읽지 못했습니다. 파일 다운로드로 원문을 보관할 수 있습니다.';return;}for(const [k] of reportFields){const el=document.querySelector('[data-report="'+k+'"]');if(el)el.value=typeof data[k]==='string'?data[k]:'';}}
function wirePage(page){
 stopReverseCompare();
 if($('reverse-compare'))wireReverseCompare(room);
 if($('list-before')){drawList('처음');document.querySelectorAll('[data-list-op]').forEach(b=>b.onclick=()=>drawList(b.dataset.listOp));}
 if($('rgb-swatch')){const update=()=>{const nums=[...document.querySelectorAll('.rgb-control')].map(e=>+e.value);const hex='#'+nums.map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();$('rgb-swatch').style.background=hex;$('rgb-value').textContent=`R ${nums[0]} · G ${nums[1]} · B ${nums[2]} → ${hex}`;};document.querySelectorAll('.rgb-control').forEach(e=>e.oninput=update);update();}
 if(page==='questions'){
 $('question-topic').value=questionTopic;$('question-level').value=questionLevel;$('wrong-only').checked=wrongOnly;
 $('question-topic').onchange=e=>{questionTopic=e.target.value;renderQuestions();};$('question-level').onchange=e=>{questionLevel=e.target.value;renderQuestions();};$('wrong-only').onchange=e=>{wrongOnly=e.target.checked;renderQuestions();};
 $('retry-questions').onclick=()=>{for(const q of filteredQuestions()){notebook[q.id]={answer:'',status:'retry'};touched.add(q.id);}wrongOnly=false;$('wrong-only').checked=false;renderQuestions();};
 $('notebook-save').onclick=saveNotebook;$('notebook-load').onclick=loadNotebook;$('notebook-export').onclick=()=>downloadText('복습_오답_기록.txt',JSON.stringify(notebook,null,2));renderQuestions();
 }
 if($('gallery-mode')){loadGallery('particles');$('gallery-mode').onchange=e=>loadGallery(e.target.value);}
}
async function loadGallery(mode){
 const frame=$('gallery-frame'),generation=navGeneration;
 try{const r=await fetch('./gallery.html');if(!r.ok)throw Error('체험 화면을 불러오지 못했습니다.');const html=await r.text();
 if(generation!==navGeneration||frame!==$('gallery-frame'))return;
 const safe=['particles','aurora','warp','chaos','alpha','waves'].includes(mode)?mode:'particles';
 frame.srcdoc=html.replace('<body>','<body data-mode="'+safe+'">');
 }catch(e){if(generation===navGeneration)showError(e);}
}
function drawList(op){
 const before=[10,20,30,40,50];
 const originals=before.map((value,origin)=>({value,origin}));
 const previousMarks=new Map();
 let output=originals.map(item=>({...item}));
 let explain='원본의 인덱스는 0~4입니다.';
 let chosen=null;
 if(op==='a[3]="테스트"'){
   previousMarks.set(3,'removed');
   output[3]={value:'테스트',origin:3,kind:'added'};
   explain='3번 인덱스의 이전 값 40은 빨강, 새 값 테스트는 초록으로 표시합니다.';
 }else if(op==='append(60)'){
   output.push({value:60,origin:null,kind:'added'});
   explain='새 값 60만 맨 뒤에 추가되며, 다른 값의 위치는 그대로입니다.';
 }else if(op==='insert(1,15)'){
   output.splice(1,0,{value:15,origin:null,kind:'added'});
   explain='15는 초록, 뒤로 한 칸씩 밀린 값은 노랑으로 표시합니다.';
 }else if(op==='remove(20)'){
   previousMarks.set(1,'removed');
   output.splice(1,1);
   explain='삭제된 20은 빨강, 앞으로 한 칸씩 이동한 값은 노랑입니다.';
 }else if(op==='del a[0]'){
   previousMarks.set(0,'removed');
   output.splice(0,1);
   explain='삭제된 10은 빨강, 앞으로 이동한 값은 노랑입니다.';
 }else if(op==='a[1:3]')chosen=[1,2];
 else if(op==='a[:3]')chosen=[0,1,2];
 else if(op==='a[2:]')chosen=[2,3,4];
 else if(op==='a[::2]')chosen=[0,2,4];
 else if(op==='a[::-1]')chosen=[4,3,2,1,0];
 if(chosen){
   for(const index of chosen)previousMarks.set(index,'selected');
   output=chosen.map(index=>({...originals[index],kind:'selected'}));
   explain='보라색은 슬라이싱으로 선택한 원소입니다. 결과 리스트의 인덱스는 0부터 새로 시작하며 원본은 그대로입니다.';
 }
 const captions={added:'추가·수정',removed:'삭제·이전 값',moved:'인덱스 이동',selected:'선택된 값'};
 const cells=(entries,isBefore)=>entries.map(({value,origin,kind},index)=>{
   const state=isBefore?(previousMarks.get(index)||''):(kind||(origin!==index?'moved':''));
   const caption=captions[state]||'';
   return `<div class="list-cell${state?` list-cell--${state}`:''}" aria-label="인덱스 ${index}, 값 ${esc(value)}${caption?`, ${caption}`:''}"><small>인덱스 ${index}</small><strong>${esc(value)}</strong>${caption?`<span class="list-cell-tag">${caption}</span>`:''}</div>`;
 }).join('');
 $('list-before').innerHTML=cells(originals,true);
 $('list-after').innerHTML=cells(output,false);
 $('list-operation').textContent=op+' → '+explain;
 document.querySelectorAll('[data-list-op]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.listOp===op)));
}
function filteredQuestions(){return questions.filter(q=>(questionTopic==='all'||q.topic===questionTopic)&&(questionLevel==='all'||q.difficulty===questionLevel)&&(!wrongOnly||notebook[q.id]?.status==='wrong'));}
const normalize=s=>s.trim().replace(/\s/g,'').replace(/'/g,'"');
const answerMatches=(q,answer)=>['q19','q29','q38'].includes(q.id)?answer.trim().replace(/\s+/g,' ')===q.expected:normalize(answer)===normalize(q.expected);
function renderQuestions(){const qs=filteredQuestions();$('question-count').textContent=`${qs.length} / 40문항 · ${Object.values(notebook).filter(x=>x.status==='correct').length}문항 확인 완료`;
 $('question-list').innerHTML=qs.length?qs.map(q=>`<article class="card question topic-${q.topic}" data-question="${q.id}"><span class="badge">${q.id.slice(1)} · ${topicNames[q.topic]} · ${q.difficulty} · ${q.type}</span><h3>${esc(q.prompt)}</h3>${q.starter?`<pre>${esc(q.starter)}</pre>`:''}<div class="answer-row"><input aria-label="${q.id} 답" value="${esc(notebook[q.id]?.answer||'')}" maxlength="800" placeholder="예상 결과 또는 이유를 적어 보세요"><button data-check="${q.id}">${q.mode==='self'?'해설과 대조':'답 확인'}</button>${link('연결 실습','activity','&id='+q.activity+'&from=questions')}</div><p class="feedback ${notebook[q.id]?.status==='correct'?'correct':notebook[q.id]?.status==='wrong'?'wrong':''}">${notebook[q.id]?.status==='correct'?'✓ 확인 완료':notebook[q.id]?.status==='wrong'?'다시 살펴볼 문제입니다.':''}</p><details><summary>힌트</summary><p>${esc(q.hints[0])}</p></details><details class="answer-detail"><summary>답과 해설</summary><p><strong>${esc(q.expected)}</strong></p><p>${esc(q.explanation)}</p>${q.mode==='self'?`<p>${esc(q.rubric)}</p><button data-self="${q.id}" data-value="correct">핵심 이유를 설명했어요</button><button data-self="${q.id}" data-value="wrong">다시 연습할게요</button>`:''}</details></article>`).join(''):'<p class="empty-state">현재 조건에 해당하는 문제가 없습니다. 주제·난이도 또는 오답 필터를 바꾸세요.</p>';
 document.querySelectorAll('[data-question] input').forEach(input=>input.oninput=()=>{const id=input.closest('[data-question]').dataset.question;notebook[id]={answer:input.value,status:'draft'};touched.add(id);});
 document.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{const q=questions.find(q=>q.id===b.dataset.check),card=b.closest('article'),answer=card.querySelector('input').value;notebook[q.id]={answer,status:q.mode==='self'?'review':answerMatches(q,answer)?'correct':'wrong'};touched.add(q.id);card.querySelector('.answer-detail').open=true;const f=card.querySelector('.feedback');f.textContent=q.mode==='self'?'해설의 핵심과 대조한 뒤 아래에서 직접 확인해 주세요.':notebook[q.id].status==='correct'?'✓ 맞았습니다. 이유도 설명해 보세요.':'다시 생각해 보세요. 힌트와 실행 결과를 확인하세요.';f.className='feedback '+notebook[q.id].status;});
 document.querySelectorAll('[data-self]').forEach(b=>b.onclick=()=>{const id=b.dataset.self;notebook[id]={answer:notebook[id]?.answer||'',status:b.dataset.value};touched.add(id);renderQuestions();});
}
function validateNotebook(data){if(!data||typeof data!=='object'||Array.isArray(data))return{};const clean={};for(const q of questions){const r=data[q.id];if(r&&typeof r.answer==='string'&&['draft','correct','wrong','retry','review'].includes(r.status))clean[q.id]={answer:r.answer.slice(0,800),status:r.status};}return clean;}
async function loadNotebook(){try{if(touched.size){$('notebook-status').textContent='현재 답안을 먼저 저장하거나 내려받은 뒤 불러오세요.';return;}const saved=await room.readRecord('mk3-notebook');notebook=validateNotebook(JSON.parse(saved?.code||'{}'));notebookVersion=saved?.version||0;renderQuestions();$('notebook-status').textContent=saved?'✓ 저장한 오답 기록을 불러왔습니다.':'이 공간에 저장된 오답 기록이 없습니다.';}catch(e){if($('notebook-status'))$('notebook-status').textContent=e.message;}}
async function saveNotebook(){try{const saved=await room.readRecord('mk3-notebook');const merged=validateNotebook(JSON.parse(saved?.code||'{}'));for(const id of touched)merged[id]=notebook[id];const text=JSON.stringify(merged);if(text.length>20000)throw Error('답안이 너무 깁니다. 일부 설명을 줄이거나 파일로 내려받으세요.');notebookVersion=await room.writeRecord('mk3-notebook',text,saved?.version||0);notebook=merged;touched.clear();if($('notebook-status'))$('notebook-status').textContent='✓ 오답 기록 클라우드 저장 완료';}catch(e){if($('notebook-status'))$('notebook-status').textContent=e.message;}}
function showSpace(text){return text.replaceAll(' ','·').replaceAll('\t','→   ').replaceAll('\n','↵\n');}
async function testAll(a){const code=$('editor').value,generation=navGeneration;const button=$('test-all');button.disabled=true;$('test-stop').disabled=false;$('test-status').replaceChildren();let passed=0;
 try{for(let i=0;i<a.tests.length;i++){if(generation!==navGeneration)return;const t=a.tests[i],line=document.createElement('p');line.textContent=`테스트 ${i+1}: 준비 중…`;$('test-status').append(line);publicRunner=runPython(code,t.input,s=>line.textContent=`테스트 ${i+1}: ${s}`);const r=await publicRunner.promise;if(generation!==navGeneration)return;const yes=!r.error&&r.output===t.expected;if(yes)passed++;line.textContent=`${yes?'✓ 일치':'차이 있음'} · 테스트 ${i+1}`;if(!yes){const pre=document.createElement('pre');pre.textContent='실제: '+showSpace(r.output||r.error)+'\n기대: '+showSpace(t.expected);$('test-status').append(pre);}}
 const summary=document.createElement('strong');summary.textContent=`${passed}/${a.tests.length} 공개 테스트 일치 · 공식 채점 아님`;$('test-status').append(summary);
 }catch(e){if($('test-status'))$('test-status').append(document.createTextNode(e.message));}finally{publicRunner=null;if(generation===navGeneration){button.disabled=false;$('test-stop').disabled=true;}}
}
function downloadText(name,text){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('menu-toggle').onclick=()=>{const yes=$('sidebar').classList.toggle('open');$('menu-toggle').setAttribute('aria-expanded',String(yes));};
addEventListener('keydown',e=>{if(e.key==='Escape'){$('sidebar').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');}});
document.addEventListener('click',e=>{const a=e.target.closest('a[data-route]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey)return;e.preventDefault();navigate(a.href).catch(showError);});
addEventListener('popstate',()=>navigate(new URL(location.href),{push:false}).catch(showError));
function showError(e){$('notice').textContent=e.message;$('notice').classList.add('error');}
$('space-view').onclick=()=>{whitespace=!whitespace;if(whitespace){rawOutput=$('output').textContent;$('output').textContent=showSpace(rawOutput);}else $('output').textContent=rawOutput;$('space-view').textContent=whitespace?'일반 출력 보기':'공백·줄바꿈 보기';};
$('plot-download').onclick=()=>{try{
 const data=!$('plot').hidden?$('plot').src:!$('turtle-result').hidden?$('turtle-canvas').toDataURL('image/png'):null;
 if(!data?.startsWith('data:image/png;base64,'))throw Error('먼저 Turtle 또는 matplotlib 코드를 실행하세요.');
 // Use the same Blob download path as code/report exports. Some browsers do
 // not deliver direct data-URL downloads to their download manager.
 const bytes=Uint8Array.from(atob(data.slice(data.indexOf(',')+1)),c=>c.charCodeAt(0));
 const url=URL.createObjectURL(new Blob([bytes],{type:'image/png'})),a=document.createElement('a');
 a.href=url;a.download='python-result.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}catch(e){showError(e);}};
$('library-tab').addEventListener('click',()=>{$('student-area').hidden=false;});
addEventListener('mk-session',e=>{
 const {kind,workspace,canWrite}=e.detail;
 if(['output','record','wipe'].includes(kind)){whitespace=false;rawOutput='';$('space-view').textContent='공백·줄바꿈 보기';}
 if(kind==='wipe'||kind==='logout'){notebook={};notebookVersion=0;touched.clear();publicRunner?.stop();publicRunner=null;if($('question-list'))renderQuestions();}
 if(kind==='identity'){$('space-details').open=!$('learning-space-panel').hidden;$('space-details').hidden=$('learning-space-panel').hidden;$('student-area').hidden=false;}
 $('save').disabled=!canWrite;$('submit').disabled=!canWrite;$('history').disabled=!canWrite;$('cloud-reload').disabled=!canWrite;
 if(kind==='record'&&shownWorkspace!==null&&workspace!==shownWorkspace){shownWorkspace=workspace;navigate('./?page=practice&workspace='+workspace,{push:true,open:false}).catch(showError);}
 if(workspace==='mk3-report'){hydrateReport();if(kind==='wipe')document.querySelectorAll('[data-report]').forEach(el=>{el.value='';el.disabled=true;});}
});
await navigate(route,{push:false});
fetch('./mk-build-info.json',{cache:'no-store'}).then(r=>r.json()).then(v=>$('version').textContent=`MK 정보 · V3 · ${(v.commit||'미리보기').slice(0,7)}`).catch(()=>{});
