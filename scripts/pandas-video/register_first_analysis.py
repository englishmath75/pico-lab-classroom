"""Publish only the verified festival walkthrough inside the existing lesson site."""
from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[2];S=R/'public/pandas-data-lab';O=S/'videos/first-analysis'
assert json.loads((O/'verification.json').read_text())['fullMp4AndHlsDecode']=='PASS'
ss=json.loads((O/'timeline.json').read_text())['scenes'];duration=sum(s['duration'] for s in ss)
episode={'id':'first-analysis','lesson':1,'title':'축제 간식 분석 · 전체 과정 따라 하기','duration':duration,'poster':'./videos/first-analysis/poster.jpg','variants':[{'id':'narrated','label':'강의','src':'./videos/first-analysis/index.m3u8','captions':'./videos/first-analysis/captions.vtt'}],'chapters':[{'at':round(s['start'],3),'title':s['title']} for s in ss]}
p=S/'video-catalog.json';catalog=json.loads(p.read_text());catalog['episodes']=[x for x in catalog['episodes'] if x['id']!='first-analysis']+[episode];p.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
# The walkthrough belongs on its own existing page, not among regular lesson 1's clips.
p=S/'first-analysis.html';html=p.read_text()
if 'id="walkthrough-video"' not in html:
 block='''<section class="panel" id="walkthrough-video"><h3>전체 실습 강의</h3><iframe class="walkthrough-video-frame" title="축제 간식 분석 전체 실습 강의" src="./video-player.html?episode=first-analysis&amp;embed=1&amp;layout=2" loading="lazy" allow="fullscreen" allowfullscreen></iframe><div class="actions"><a class="btn secondary" href="./video-player.html?episode=first-analysis" target="_blank" rel="noopener">큰 화면으로 보기 ↗</a></div></section>\n'''
 html=html.replace('<nav class="flow"',block+'<nav class="flow"',1)
 html=html.replace('<a class="btn secondary" href="#prepare">','<a class="btn secondary" href="#walkthrough-video">영상 보고 따라 하기</a><a class="btn secondary" href="#prepare">',1)
assert 'id="walkthrough-video"' in html
html=re.sub(r'first-analysis\.(css|js)\?v=[\w-]+',r'first-analysis.\1?v=20261028-video',html);p.write_text(html)
p=S/'first-analysis.css';css=p.read_text()
if '.walkthrough-video-frame' not in css:css+='\n.walkthrough-video-frame{display:block;width:100%;height:760px;min-height:240px;border:0;border-radius:10px;background:#071b26}@media print{#walkthrough-video{display:none}}\n'
p.write_text(css)
p=S/'first-analysis.js';js=p.read_text()
if 'pandas-video-height' not in js:js+='''\n// Size the embedded lesson player to its visible content.
(()=>{'use strict';const frame=document.querySelector('#walkthrough-video iframe');if(!frame)return;window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.type!=='pandas-video-height')return;const height=Number(event.data.height);if(Number.isFinite(height))frame.style.height=Math.min(3000,Math.max(240,height))+'px';});})();\n'''
p.write_text(js)
p=S/'video-player.js';js=p.read_text()
if "if(ep.id==='first-analysis')" not in js:
 marker="  $('variant').replaceChildren"
 extra=""" if(ep.id==='first-analysis'){video.setAttribute('aria-label','축제 간식 분석 전체 실습 강의');document.title='축제 간식 분석 강의 | 소프트웨어와 생활';document.querySelector('.intro h1').textContent='축제 간식 분석 전체 과정';for(const id of ['practice-return','practice-link'])$(id).href='./first-analysis.html';$('practice-return').textContent='← 전체 실습 안내';$('practice-link').textContent='전체 실습 안내 →';$('code-download').href='./first-analysis/analyze_festival.py';$('code-download').textContent='완성 예제 코드 ↓';$('csv-download').hidden=false;$('csv-download').href='./first-analysis/festival_orders.csv';$('csv-download').textContent='원본 CSV ↓';}\n"""
 assert marker in js;js=js.replace(marker,extra+marker,1)
p.write_text(js)
p=S/'video-player.html';p.write_text(re.sub(r'video-player\.js\?v=[\w-]+','video-player.js?v=20261028-first-analysis',p.read_text()))
def stamp(t):return f'{int(t//60):02}:{int(t%60):02}'
lines=['# 축제 간식 분석 · 전체 과정 따라 하기','',f'재생 시간: {duration:.3f}초','','완성 코드와 원본 CSV: ../../first-analysis/ 폴더의 analyze_festival.py 및 festival_orders.csv','']
for s in ss:
 lines+=['## '+stamp(s['start'])+' · '+s['title'],'',s['speech'],'','화면 표시: '+s['note'],'','```'+('python' if s['kind']=='code' else 'text'),s['code'],'```','','출력 또는 확인할 내용:','```text',s['output'],'```','',f"직접 실습을 위한 휴지: {s['pause']}초",'']
(O/'transcript.md').write_text('\n'.join(lines)+'\n')
lines=['# 축제 간식 전체 실습 수업 운영 자료','','교사용 일반 지도 자료. 학생 화면에는 연결하지 않는다.','','| 수업 시간 | 영상·학생 활동 | 순회 지도 |','|---|---|---|','| 0~7분 | 질문·ZIP 받기·압축 풀기·VS Code 폴더 | CSV와 my_analysis.py가 같은 폴더인지 |','| 7~15분 | 도구·CSV 읽기·첫 실행 | (16,5), __file__은 파일 전체 실행 |','| 15~25분 | 중복·문자·숫자 정리·직접 실습 | 16→15→12, 결측 2와 제외 3 구별 |','| 25~34분 | 매출 열·groupby·정렬·CSV 저장 | 12건·30개·101000원, 원본 유지 |','| 34~43분 | 그래프 코드·전체 실행 | 축 단위, 0 기준, PNG와 창 닫기 |','| 43~50분 | 질문·해석·TXT·폴더 백업 | 매출과 이익 구별, 제외 자료의 한계 |','','## 영상 구간·일시정지 시점','']
for s in ss:lines.append(f"- {stamp(s['start'])}~{stamp(s['start']+s['duration'])} · {s['title']}"+(' · 직접 실습 후 재생' if s['pause']>=20 else ''))
lines+=['','## 순회 지도·보충','','- 모든 코드를 직접 입력하되, 페이지의 6개 단계를 순서대로 누적한다. 영상의 중간 확인용 print는 원본 분석 결과를 바꾸지 않는다.','- ZIP 안에서 바로 실행하지 않는다. Python 인터프리터와 설치 환경을 맞춘다.','- 늦은 학생은 1~3단계 12건 확인까지 먼저 완성한 뒤 교사와 4~6단계로 연결한다. 함수 암기보다 각 단계 역할을 말하게 한다.','- quantity 결측 O013·O014와 음수 O015를 구별한다. 제외한 값은 0으로 임의 대체하지 않는다.','- summary의 메뉴명 인덱스는 저장할 때 포함한다. 원본은 덮어쓰지 않는다.','','## 자주 틀리는 부분','','- 파일 이름 뒤 (1), 압축 내부 실행, 다른 폴더의 CSV, __file__을 대화형 창에서 실행하는 경우.','- unit_price 쉼표 제거 전 숫자 변환, 양수 조건 괄호·& 누락, 열 이름 철자.','- matplotlib 그래프 창이 열린 동안 실행 종료를 기다리는 경우. PNG 저장 후 창을 닫는다.','','## 정답·해설','','- 정제 후 12건, 중복 제거 1건, 분석 제외 3건, 수량 결측 2건.','- 와플 8개·36000원 / 떡볶이 10개·35000원 / 레몬에이드 12개·30000원. 총 30개·101000원.','- 판매량 1위 레몬에이드, 매출 1위 와플. 단가가 달라 순위가 다르다.','- 비용 자료가 없어 이익 1위는 알 수 없다. 제외 자료의 올바른 수량도 모르므로 원본 전체 주문의 확정 매출이 아니다.','','## 빠른 학생·집에서 반복','','- 수량 기준 정렬: Lemonade·Tteokbokki·Waffle, 전체 매출은 동일하다.','- day 기준 집계: 1일 19000, 2일 24500, 3일 27000, 4일 30500원. 질문과 그래프 제목도 함께 바꾼다.','- 매번 새 폴더에서 시작하고 코드·원본·가공 CSV·그래프·기록 TXT를 함께 보관한다.','','## 제작 관리 기록','','- 실제 Python 파일을 별도 작업 폴더에서 실행해 각 장면과 그래프를 검증했다. 그래프 검증에는 Matplotlib Agg를 사용했다. VS Code 순서는 학습용 구성 장면이다. 기본 AI 음성 ko-KR-SunHiNeural을 사용했으며 교사 목소리 복제가 아니다. 이 기록은 낭독하지 않는다.']
(R/'docs/video-production/first-analysis-teacher-guide.md').write_text('\n'.join(lines)+'\n')
print('REGISTERED',duration,len(ss))
