"""Register lesson 8 only after actual media decode verification."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[2];S=R/'public/pandas-data-lab';O=S/'videos/lesson08'
assert json.loads((O/'verification.json').read_text())['fullMp4AndHlsDecode']=='PASS'
ss=json.loads((O/'timeline.json').read_text())['scenes'];d=sum(s['duration'] for s in ss);chapters=[{'at':round(s['start'],3),'title':s['title']} for s in ss]
episode={'id':'lesson08','lesson':8,'title':'8차시 · Matplotlib 기후 시각화','duration':d,'poster':'./videos/lesson08/poster.jpg','variants':[{'id':'narrated','label':'강의','src':'./videos/lesson08/index.m3u8','captions':'./videos/lesson08/captions.vtt'}],'chapters':chapters}
p=S/'video-catalog.json';c=json.loads(p.read_text());c['episodes']=[e for e in c['episodes'] if e['id']!='lesson08'];at=next((i for i,e in enumerate(c['episodes']) if e['id']=='first-analysis'),len(c['episodes']));c['episodes'].insert(at,episode);p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
p=S/'lesson-videos.json';c=json.loads(p.read_text());c['lessons']=[e for e in c['lessons'] if e.get('episode')!='lesson08']+[{'lesson':8,'episode':'lesson08','title':'Matplotlib 기후 시각화','status':'verified','src':episode['variants'][0]['src'],'captions':episode['variants'][0]['captions'],'duration':d,'chapters':chapters}];p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
def stamp(t):return f'{int(t//60):02}:{int(t%60):02}'
lines=['# 8차시 · Matplotlib 기후 시각화','',f'재생 시간: {d:.3f}초','']
for s in ss:
 lines+=['## '+stamp(s['start'])+' · '+s['title'],'',s['speech'],'','화면 표시: '+s['note'],'','```'+('python' if s['kind'] in ['code','graph'] else 'text'),s['code'],'```','','출력 또는 확인할 내용:','```text',s['output'],'```','',f"직접 실습을 위한 휴지: {s['pause']}초",'']
(O/'transcript.md').write_text('\n'.join(lines)+'\n')
lines=['# 8차시 수업 운영 자료','','교사용 일반 지도 자료. 학생 화면에는 연결하지 않는다.','','| 수업 시간 | 활동 | 지도 포인트 |','|---|---|---|','| 0~5분 | 전시 연결·8차시 접속 | Pandas와 pyplot의 역할 |','| 5~15분 | 표·plot·축·제목 | x=year, y=temp, marker는 소문자 o |','| 15~23분 | 직접 실습 1 | 5단계 누적 입력, 네 점과 표 대조 |','| 23~30분 | 값 변경·축 범위·오류 | 13.8→12.8, 대소문자와 길이 |','| 30~37분 | CSV 선택 확장 또는 기본 보충 | 봄 5행, temp_c, 연도 정렬 |','| 37~44분 | VS Code·PNG 저장 | savefig를 show 전에 작성 |','| 44~50분 | 형성평가·기록 | 코드·PNG·해석·JSON 백업 |','','## 실제 영상 구간','']
for s in ss:lines.append(f"- {stamp(s['start'])}~{stamp(s['start']+s['duration'])} · {s['title']}"+(' · 일시정지 후 직접 실습' if s['pause']>=12 else ''))
lines+=['','## 순회 지도·보충','','- 코드 입력: import 별칭, 괄호·따옴표·쉼표, DataFrame의 두 목록 길이 4를 확인한다.','- 원래 기온: 13.1, 13.4, 13.0, 13.8. 최고 2024, 최저 2023. 마지막−첫 값은 약 0.7도, 매년 상승은 아니다.','- 느린 학생: 표의 각 행을 좌표로 짝지어 적고 기존 5단계를 한 줄씩 누적한다. CSV 확장은 기본 완성 후 선택한다.','- 값 변경: 13.8→12.8이면 최고 2022년13.4, 최저 2024년12.8. 이후 원래 값 복원.','- 오류: 없는 Temp 열은 KeyError, x4개/y3개는 ValueError. 길이만 임의로 맞추기보다 같은 행 선택을 확인한다.','- 웹 결과에 print가 없어도 그래프는 나타난다. 최초 도구 준비 시간을 기다리고 결과 영역 확인.','- VS Code: 같은 인터프리터에 pandas/matplotlib 설치, 기본은 CSV 불필요. 확장은 같은 폴더에서 실행.','- 그림 저장은 plot·레이블·제목 뒤, show 앞. 실제 PNG를 열어 빈 그림이 아닌지 확인한다.','','## 빠른 학생 심화','','- ylim(0,20)과 자동 범위를 비교하고 수치는 같지만 그림의 인상이 달라지는 이유를 설명한다.','- 봄 CSV: season 조건 → year 정렬 → temp_c 시각화. 2020~2024년12.6→14.1, 차이1.5도.','- 봄과 여름을 각각 선택해 두 선으로 비교하되 범례·제목을 추가하고 원자료를 보존한다.','- 네 개의 가상 값이나 다섯 개의 가상 봄 값으로 실제 장기 기후의 원인을 입증하지 않는다.','','## 형성평가 정답·해설','','1. 꺾은선그래프: 시간 순서의 변화를 연결한다.','2. ylabel: 세로축 이름. 이 예제의 Temperature(C)는 섭씨 기온이다.','3. 2023년은 전년보다 낮다.13.4→13.0.','4. 매년 상승은 아님. 중간 하락 존재.','5. ylim은 표시 범위이며 표의 값은 바꾸지 않는다.','- 기존 웹 확인 문제 정답: 꺾은선그래프 / 세로축 이름.','','## 제작 관리 기록','','- 학습용 코드·사용 순서 장면이며 실제 화면 녹화가 아니다. 그래프와 오류 출력은 실제 Python 실행에서 캡처했다.','- ko-KR-SunHiNeural 기본 AI 한국어 합성 음성. 교사 목소리를 복제하지 않는다. 이 기록은 낭독하지 않는다.']
(R/'docs/video-production/lesson08-teacher-guide.md').write_text('\n'.join(lines)+'\n')
# Additive player mapping; leave existing lessons and walkthrough untouched.
p=S/'video-player.js';x=p.read_text();x=x.replace("ep.lesson===7?'단어 빈도·표 결합 맛보기'","ep.lesson===8?'Matplotlib 기후 시각화':ep.lesson===7?'단어 빈도·표 결합 맛보기'") if "ep.lesson===8?'Matplotlib 기후 시각화'" not in x else x
x=x.replace("ep.lesson===5?'./datasets/school_store_fictional.csv'","ep.lesson===8?'./datasets/climate_fictional.csv':ep.lesson===5?'./datasets/school_store_fictional.csv'") if "ep.lesson===8?'./datasets/climate_fictional.csv'" not in x else x
if "$('practice-link').textContent='코드 입력·실행 →';$('practice-return').textContent=" not in x:x=x.replace("$('practice-return').textContent=", "$('practice-link').textContent='코드 입력·실행 →';$('practice-return').textContent=",1)
p.write_text(x)
for name,needle in [('video-player.html','video-player.js'),('step-by-step.html','step-by-step.js'),('step-by-step.html','lesson-video.js')]:
 p=S/name;x=p.read_text();import re;x=re.sub(r'('+re.escape(needle)+r')\?v=[^"\s]+',r'\1?v=20261028-lesson08',x);p.write_text(x)
print('REGISTERED',d,len(ss))
