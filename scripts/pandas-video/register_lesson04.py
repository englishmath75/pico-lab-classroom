"""Register only the successfully rendered lesson 4 and write timed teaching materials."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[2];S=R/'public/pandas-data-lab';O=S/'videos/lesson04'
assert json.loads((O/'verification.json').read_text())['fullMp4AndHlsDecode']=='PASS'
ss=json.loads((O/'timeline.json').read_text())['scenes'];d=sum(s['duration'] for s in ss);chapters=[{'at':round(s['start'],3),'title':s['title']} for s in ss]
episode={'id':'lesson04','lesson':4,'title':'4차시 · 조건 검색·정렬로 선수 찾기','duration':d,'poster':'./videos/lesson04/poster.jpg','variants':[{'id':'narrated','label':'강의','src':'./videos/lesson04/index.m3u8','captions':'./videos/lesson04/captions.vtt'}],'chapters':chapters}
p=S/'video-catalog.json';c=json.loads(p.read_text());c['episodes']=[e for e in c['episodes'] if e['id']!='lesson04']+[episode];p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
p=S/'lesson-videos.json';c=json.loads(p.read_text());c['lessons']=[e for e in c['lessons'] if e.get('episode')!='lesson04']+[{'lesson':4,'episode':'lesson04','title':'조건 검색·정렬로 선수 찾기','status':'verified','src':episode['variants'][0]['src'],'captions':episode['variants'][0]['captions'],'duration':d,'chapters':chapters}];p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
def stamp(t):return f'{int(t//60):02}:{int(t%60):02}'
lines=['# 4차시 · 조건 검색·정렬로 선수 찾기','',f'재생 시간: {d:.3f}초','']
for s in ss:
 lines += ['## '+stamp(s['start'])+' · '+s['title'],'',s['speech'],'','화면 표시: '+s['note'],'','```'+('python' if s['kind']=='code' else 'text'),s['code'],'```','','출력 또는 확인할 내용:','```text',s['output'],'```','',f"직접 실습을 위한 휴지: {s['pause']}초",'']
(O/'transcript.md').write_text('\n'.join(lines)+'\n')
lines=['# 4차시 수업 운영 자료','', '교사용 일반 지도 자료. 학생용 화면에 연결하지 않는다.','', '| 수업 시간 | 활동 | 지도 포인트 |','|---|---|---|','| 0~5분 | 이전 시간 복습·세 선수 표 확인 | 4차시 선택, 실제 파일 이름 확인 |','| 5~15분 | 조건식·행 선택 | 비교식은 True/False Series, 조건 검색은 원본 유지 |','| 15~25분 | 득점 정렬·직접 실행 | ascending=False, 결과 Yuna·Minji·Sora |','| 25~35분 | 두 조건 결합 | &와 | 비교, 조건마다 괄호 |','| 35~42분 | 오류 해결·VS Code 실행 | 현재 작업 폴더, 파일 이름, 열 대소문자 |','| 42~47분 | 형성평가·피드백 | 정답 ascending=False, &, 민지 한 명 |','| 47~50분 | 기록 백업·정리 | .py, CSV, JSON 저장 확인 |','','## 실제 영상 구간','']
for s in ss:lines.append(f"- {stamp(s['start'])}~{stamp(s['start']+s['duration'])} · {s['title']}"+(' · 일시정지 후 학생 직접 실행' if s['pause']>=20 else ''))
lines+=['','## 보충 및 심화','','- 보충: 세 선수별 두 조건의 참·거짓을 표로 적고 &와 | 결과를 비교한다.','- 심화: 기준을 17로 바꾸어 >=와 >를 비교한다. CSV에서 가드이면서 18점 이상인 선수를 내림차순으로 정렬한다.','- 자주 틀리는 코드: and 사용, 조건 괄호 누락, descending=True, 열 이름 대소문자 혼동.','- 재현 장면은 실제 화면 녹화가 아니며, 출력은 실제 pandas 실행값이다. 한국어 음성은 기본 AI 합성 음성이고 교사 목소리 복제가 아니다. 이 제작 정보는 낭독하지 않는다.']
(R/'docs/video-production/lesson04-teacher-guide.md').write_text('\n'.join(lines)+'\n')
print('REGISTERED',d,len(ss))
