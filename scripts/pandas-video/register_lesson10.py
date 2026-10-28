"""Register lesson 10 only after Python and full media decode verification."""
from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[2];S=R/'public/pandas-data-lab';O=S/'videos/lesson10'
assert json.loads((O/'verification.json').read_text())['fullMp4AndHlsDecode']=='PASS'
ss=json.loads((O/'timeline.json').read_text())['scenes'];d=sum(s['duration'] for s in ss);chapters=[{'at':round(s['start'],3),'title':s['title']} for s in ss]
episode={'id':'lesson10','lesson':10,'title':'10차시 · 분석 보고서·기말 종합','duration':d,'poster':'./videos/lesson10/poster.jpg','variants':[{'id':'narrated','label':'강의','src':'./videos/lesson10/index.m3u8','captions':'./videos/lesson10/captions.vtt'}],'chapters':chapters}
p=S/'video-catalog.json';c=json.loads(p.read_text());c['episodes']=[e for e in c['episodes'] if e['id']!='lesson10'];at=next((i for i,e in enumerate(c['episodes']) if e['id']=='first-analysis'),len(c['episodes']));c['episodes'].insert(at,episode);p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
p=S/'lesson-videos.json';c=json.loads(p.read_text());c['lessons']=[e for e in c['lessons'] if e.get('episode')!='lesson10']+[{'lesson':10,'episode':'lesson10','title':'분석 보고서·기말 종합','status':'verified','src':episode['variants'][0]['src'],'captions':episode['variants'][0]['captions'],'duration':d,'chapters':chapters}];p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
def stamp(t):return f'{int(t//60):02}:{int(t%60):02}'
lines=['# 10차시 · 분석 보고서·기말 종합','',f'재생 시간: {d:.3f}초','']
for s in ss:
 lines+=['## '+stamp(s['start'])+' · '+s['title'],'',s['speech'],'','화면 표시: '+s['note'],'','```'+('python' if s['kind'] in ['code','graph'] else 'text'),s['code'],'```','','출력 또는 확인할 내용:','```text',s['output'],'```','',f"직접 실습을 위한 휴지: {s['pause']}초",'']
 if s.get('runCode'):lines+=['앞 단계부터 연결한 전체 코드:','','```python',s['runCode'],'```','']
(O/'transcript.md').write_text('\n'.join(lines)+'\n')
lines=['# 10차시 수업 운영 자료','','교사용 일반 지도 자료. 학생 화면에는 연결하지 않는다.','','| 수업 시간 | 활동 | 지도 포인트 |','|---|---|---|','| 0~5분 | 질문·자료 범위 확인 | 가상 하루·세 상품·단위 개 |','| 5~14분 | 기본 5단계 | 정렬 bread30/milk18/juice12, 평균20, 최대30 |','| 14~22분 | 값 변경·오류·직접 실습 | 12→42이면 평균30·최대42, 원래 값 복원 |','| 22~29분 | 그래프·관찰과 추측 | x상품/y개, 원인·연간 추세 확정 불가 |','| 29~38분 | 보고서 7개 항목·저장 | 입력→HTML/JSON, PNG 별도 보관 |','| 38~44분 | CSV 선택 확장 또는 기본 보충 | 실제 결측0·중복0, 판매량/매출 단위 |','| 44~50분 | 형성평가·VS Code·백업 | 결과물 묶음·재실행·한계 |','','## 실제 영상 구간','']
for s in ss:lines.append(f"- {stamp(s['start'])}~{stamp(s['start']+s['duration'])} · {s['title']}"+(' · 일시정지 후 직접 실습' if s['pause']>=8 else ''))
lines+=['','## 순회 지도·오류 해결','','- 기본 자료: item juice/bread/milk, sales12/30/18. 3행2열. 원본 다운로드 lesson_10.py와 영상 기본 코드 AST가 같다.','- 내림차순 정렬 결과 bread30,milk18,juice12. 인덱스1,2,0은 원래 행 이름. 재대입하지 않은 df는 입력 순서 유지.','- 평균은 세 상품 대상20.0개, 최댓값30개. 학생당 평균이나 하루 평균으로 부르지 않는다.','- juice12→42 변경 시 평균30,최대42,juice1위. 뒤의 기본 보고서는 원래12로 복원해 사용.','- Sales 열 오타는 KeyError, 정상 sales. mean()/max() 괄호 확인.','- 기본 막대그래프의 x상품,y판매량(개). 원인이나 실제 연간 추세는 이 가상 하루 자료로 확정할 수 없다.','','## 보고서 작성 지도','','- 7개 항목: 탐구 질문 / 자료 출처·수집 기간·단위 / 결측 처리와 Pandas 분석 과정 / 분석 결과·근거 수치 / 그래프 유형·축·해석 / 표본 편향·윤리·인과관계의 한계 / 후속 탐구와 해결 제안.','- 실제 하지 않은 전처리, 실제 조사하지 않은 출처를 쓰지 않는다. 기초 데이터에는 결측이 없다.','- 자료 범위는 가상 하루·세 상품. 실제 수집 날짜는 주어지지 않았다.','- HTML 보고서에는 작성한 텍스트가 저장된다. PNG는 별도 파일로 같은 폴더에 보관한다. 존재하지 않는 업로드·자동 제출 기능을 안내하지 않는다.','- 자동 저장은 현재 브라우저 저장, HTML은 읽을 보고서, JSON은 기록 복원용. 코드와 원자료, 그림도 함께 보관.','- 개인정보 없이 가상 예제로 설명한다. 저장은 자동 제출을 뜻하지 않는다.','','## 보충·심화','','- 느린 학생: 기본 표·정렬·평균·최대를 끝내고 두 문장 결론과 한계 한 문장을 먼저 쓴다. CSV는 선택 확장.','- 빠른 학생: CSV의 상품별 합계·평균·매출을 비교하되 기준과 단위를 설명하고 비의 인과효과를 단정하지 않는다.','- CSV 10행5열. 결측 칸0, 완전 중복행0. 불필요한 채움·중복 제거를 했다고 꾸며 쓰지 않는다.','- menu별 sold합계 김밥131개/주스86개, revenue합계458500원/172000원. 전체217개/630500원. 매출과 이익 구별.','- sold전체10행 평균21.7개, 상품별5요일 평균 김밥26.2개/주스17.2개. 기본 평균20과 섞지 않는다.','- day/rain별 하루 총 판매량으로 비교: rain0은3일평균50개, rain1은2일평균33.5개. 관측 일수가 다르고 다른 조건이 있으므로 원인 확정 불가.','','## 형성평가 정답·해설','','1. 평균20.0개, 최댓값30개.','2. bread30개.','3. 가상 하루·세 상품으로 실제 연간 경향 확정 불가.','4. 매출에서 비용을 빼지 않았으므로 이익과 다름.','5. 비가 있는 날 평균이 낮다는 관찰과 비가 원인이라는 주장은 다름.','- 기존 웹 정답:20.0 / 실제 연간 판매 경향.','','## 제작 관리 기록','','- 학습용 코드·사용 순서 장면이며 실제 화면 녹화가 아니다. 출력·오류·그래프는 실제 Python 실행에서 생성했다.','- ko-KR-SunHiNeural 기본 AI 한국어 합성 음성. 교사 목소리 복제 아님. 이 기록은 낭독하지 않는다.','- 원본은 pico-lab-classroom에 보존하고 기존 /sw/ 게시기로 같은 원본을 게시한다.']
(R/'docs/video-production/lesson10-teacher-guide.md').write_text('\n'.join(lines)+'\n')
p=S/'video-player.js';x=p.read_text()
if "ep.lesson===10?'분석 보고서·기말 종합'" not in x:x=x.replace("ep.lesson===9?'인구 변화 데이터 분석'","ep.lesson===10?'분석 보고서·기말 종합':ep.lesson===9?'인구 변화 데이터 분석'")
if "ep.lesson===10?'./datasets/school_store_fictional.csv'" not in x:x=x.replace("ep.lesson===9?'./datasets/population_fictional.csv'","ep.lesson===10?'./datasets/school_store_fictional.csv':ep.lesson===9?'./datasets/population_fictional.csv'")
p.write_text(x)
for name,needle in [('video-player.html','video-player.js'),('step-by-step.html','step-by-step.js'),('step-by-step.html','lesson-video.js')]:
 p=S/name;x=p.read_text();x=re.sub(r'('+re.escape(needle)+r')\?v=[^"\s]+',r'\1?v=20261028-lesson10',x);p.write_text(x)
print('REGISTERED',d,len(ss))
