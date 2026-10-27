"""Register only the successfully rendered lesson 3 and write timed teaching materials."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[2];S=R/'public/pandas-data-lab';O=S/'videos/lesson03'
assert json.loads((O/'verification.json').read_text())['fullMp4AndHlsDecode']=='PASS'
ss=json.loads((O/'timeline.json').read_text())['scenes'];d=sum(s['duration'] for s in ss);chapters=[{'at':round(s['start'],3),'title':s['title']} for s in ss]
episode={'id':'lesson03','lesson':3,'title':'3차시 · CSV 읽기·행과 열 선택','duration':d,'poster':'./videos/lesson03/poster.jpg','variants':[{'id':'narrated','label':'강의','src':'./videos/lesson03/index.m3u8','captions':'./videos/lesson03/captions.vtt'}],'chapters':chapters}
p=S/'video-catalog.json';c=json.loads(p.read_text());c['episodes']=[e for e in c['episodes'] if e['id']!='lesson03']+[episode];p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
p=S/'lesson-videos.json';c=json.loads(p.read_text());c['lessons']=[e for e in c['lessons'] if e.get('episode')!='lesson03']+[{'lesson':3,'episode':'lesson03','title':'CSV 읽기·행과 열 선택','status':'verified','src':episode['variants'][0]['src'],'captions':episode['variants'][0]['captions'],'duration':d,'chapters':chapters}];p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
def stamp(t):return f'{int(t//60):02}:{int(t%60):02}'
lines=['# 3차시 · CSV 읽기·행과 열 선택','',f'재생 시간: {d:.3f}초','']
for s in ss:
 lines += ['## '+stamp(s['start'])+' · '+s['title'],'',s['speech'],'','화면 표시: '+s['note'],'','```'+('python' if s['kind']=='code' else 'text'),s['code'],'```','','출력 또는 확인할 내용:','```text',s['output'],'```','',f"직접 실습을 위한 휴지: {s['pause']}초",'']
(O/'transcript.md').write_text('\n'.join(lines)+'\n')
lines=['# 3차시 수업 운영 자료','', '교사용 일반 지도 자료. 학생용 화면에 연결하지 않는다.','', '| 수업 시간 | 활동 | 지도 포인트 |','|---|---|---|','| 0~5분 | 이전 시간 복습·CSV 내려받기 | 3차시 선택, 실제 파일 이름 확인 |','| 5~15분 | CSV 읽기·표 확인 | 첫 줄은 열 이름, (8, 6), head는 원본 유지 |','| 15~25분 | 두 열 선택·직접 실행 | 안쪽 리스트와 바깥쪽 선택, (8, 2) |','| 25~35분 | loc·iloc 비교 | 인덱스 1~8 실험, 이름표와 위치 구별 |','| 35~42분 | 오류 해결·VS Code 실행 | 현재 작업 폴더, 파일 이름, 열 대소문자 |','| 42~47분 | 형성평가·피드백 | 정답 (8, 6), 정수 위치; 보충: loc[1] |','| 47~50분 | 기록 백업·정리 | .py, CSV, JSON 저장 확인 |','','## 실제 영상 구간','']
for s in ss:lines.append(f"- {stamp(s['start'])}~{stamp(s['start']+s['duration'])} · {s['title']}"+(' · 일시정지 후 학생 직접 실행' if s['pause']>=20 else ''))
lines+=['','## 보충 및 심화','','- 보충: 표에 이름표 카드와 위치 번호를 따로 붙여 loc와 iloc를 소리 내어 읽게 한다.','- 심화: 인덱스를 101~108로 바꾼 뒤 loc[101]과 iloc[0]을 비교한다. loc 범위와 iloc 범위의 행 수를 예측한다.','- 자주 틀리는 코드: read_csv 밑줄 누락, 파일 이름 대소문자, shape(), df[\'player\', \'points\'], 인덱스 변경 후 loc[0].','- 재현 장면은 실제 화면 녹화가 아니며, 출력은 실제 pandas 실행값이다. 한국어 음성은 기본 AI 합성 음성이고 교사 목소리 복제가 아니다. 이 제작 정보는 낭독하지 않는다.']
(R/'docs/video-production/lesson03-teacher-guide.md').write_text('\n'.join(lines)+'\n')
print('REGISTERED',d,len(ss))
