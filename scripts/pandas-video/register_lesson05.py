"""Register only the successfully rendered lesson 5 and write timed teaching materials."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[2];S=R/'public/pandas-data-lab';O=S/'videos/lesson05'
assert json.loads((O/'verification.json').read_text())['fullMp4AndHlsDecode']=='PASS'
ss=json.loads((O/'timeline.json').read_text())['scenes'];d=sum(s['duration'] for s in ss);chapters=[{'at':round(s['start'],3),'title':s['title']} for s in ss]
episode={'id':'lesson05','lesson':5,'title':'5차시 · 결측·중복·자료형 정리','duration':d,'poster':'./videos/lesson05/poster.jpg','variants':[{'id':'narrated','label':'강의','src':'./videos/lesson05/index.m3u8','captions':'./videos/lesson05/captions.vtt'}],'chapters':chapters}
p=S/'video-catalog.json';c=json.loads(p.read_text());c['episodes']=[e for e in c['episodes'] if e['id']!='lesson05']+[episode];p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
p=S/'lesson-videos.json';c=json.loads(p.read_text());c['lessons']=[e for e in c['lessons'] if e.get('episode')!='lesson05']+[{'lesson':5,'episode':'lesson05','title':'결측·중복·자료형 정리','status':'verified','src':episode['variants'][0]['src'],'captions':episode['variants'][0]['captions'],'duration':d,'chapters':chapters}];p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
def stamp(t):return f'{int(t//60):02}:{int(t%60):02}'
lines=['# 5차시 · 결측·중복·자료형 정리','',f'재생 시간: {d:.3f}초','']
for s in ss:
 lines += ['## '+stamp(s['start'])+' · '+s['title'],'',s['speech'],'','화면 표시: '+s['note'],'','```'+('python' if s['kind']=='code' else 'text'),s['code'],'```','','출력 또는 확인할 내용:','```text',s['output'],'```','',f"직접 실습을 위한 휴지: {s['pause']}초",'']
(O/'transcript.md').write_text('\n'.join(lines)+'\n')
lines=['# 5차시 수업 운영 자료','', '교사용 일반 지도 자료. 학생 화면에는 연결하지 않는다.','', '| 수업 시간 | 활동 | 지도 포인트 |','|---|---|---|','| 0~5분 | 5차시 접속·전시 복습 | 기본 표 4행과 None 확인 |','| 5~15분 | 결측·중복 점검 | isna True의 뜻, 결측 개수와 행 수 구별 |','| 15~25분 | 중복 제거·직접 실습 | 반환 결과 3행, 원본은 4행 |','| 25~35분 | 평균 비교 | 원본 50/3, 원본 0 채움 12.5, clean 평균 20 |','| 35~42분 | 자료형·CSV 확장 | object와 숫자형, 변환 실패의 결측 개수 |','| 42~47분 | 형성평가 | 분모와 사용한 변수로 근거 설명 |','| 47~50분 | VS Code·기록 저장 | 기본 코드는 CSV 불필요, 확장에는 매점 CSV |','','## 실제 영상 구간','']
for s in ss:lines.append(f"- {stamp(s['start'])}~{stamp(s['start']+s['duration'])} · {s['title']}"+(' · 일시정지 후 직접 실습' if s['pause']>=20 else ''))
lines+=['','## 보충·심화 및 정답','','- 보충: 계산에 쓰인 값을 종이에 적고, 결측 제외와 0 채우기의 분모를 비교한다.','- 심화: drop_duplicates의 반환값을 새 변수에 저장하고 결측 처리 전후 평균과 행 수를 함께 보고한다.','- 정답: 원본 결측 제외 50/3, 원본 0 채우기 12.5, 원본 4행 유지, clean 결측 제외 20.0.','- 주의: 매점 CSV에는 sales가 아니라 sold 열이 있다. 자료를 확인하기 전에 결측이 있다고 가정하지 않는다.','- 제작 기록: 코드 장면은 실제 화면 녹화가 아닌 학습 장면이다. 출력은 실제 pandas 실행값이며 음성은 ko-KR-SunHiNeural 기본 AI 합성 음성이다. 교사 목소리 복제가 아니다. 이 기록은 낭독하지 않는다.']
(R/'docs/video-production/lesson05-teacher-guide.md').write_text('\n'.join(lines)+'\n')
print('REGISTERED',d,len(ss))
