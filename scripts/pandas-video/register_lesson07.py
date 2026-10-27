"""Register only the successfully rendered lesson 7 and write timed teaching materials."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[2];S=R/'public/pandas-data-lab';O=S/'videos/lesson07'
assert json.loads((O/'verification.json').read_text())['fullMp4AndHlsDecode']=='PASS'
ss=json.loads((O/'timeline.json').read_text())['scenes'];d=sum(s['duration'] for s in ss);chapters=[{'at':round(s['start'],3),'title':s['title']} for s in ss]
episode={'id':'lesson07','lesson':7,'title':'7차시 · 단어 빈도·표 결합 맛보기','duration':d,'poster':'./videos/lesson07/poster.jpg','variants':[{'id':'narrated','label':'강의','src':'./videos/lesson07/index.m3u8','captions':'./videos/lesson07/captions.vtt'}],'chapters':chapters}
p=S/'video-catalog.json';c=json.loads(p.read_text());c['episodes']=[e for e in c['episodes'] if e['id']!='lesson07']+[episode];p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
p=S/'lesson-videos.json';c=json.loads(p.read_text());c['lessons']=[e for e in c['lessons'] if e.get('episode')!='lesson07']+[{'lesson':7,'episode':'lesson07','title':'단어 빈도·표 결합 맛보기','status':'verified','src':episode['variants'][0]['src'],'captions':episode['variants'][0]['captions'],'duration':d,'chapters':chapters}];p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
def stamp(t):return f'{int(t//60):02}:{int(t%60):02}'
lines=['# 7차시 · 단어 빈도·표 결합 맛보기','',f'재생 시간: {d:.3f}초','']
for s in ss:
 lines += ['## '+stamp(s['start'])+' · '+s['title'],'',s['speech'],'','화면 표시: '+s['note'],'','```'+('python' if s['kind']=='code' else 'text'),s['code'],'```','','출력 또는 확인할 내용:','```text',s['output'],'```','',f"직접 실습을 위한 휴지: {s['pause']}초",'']
(O/'transcript.md').write_text('\n'.join(lines)+'\n')
lines=['# 7차시 수업 운영 자료','','교사용 일반 지도 자료. 학생 화면에는 연결하지 않는다.','','| 수업 시간 | 활동 | 지도 포인트 |','|---|---|---|','| 0~5분 | 7차시 접속·전시 복습 | 숫자 집계와 값의 등장 횟수 구별 |','| 5~15분 | 문장·join·split·Series | 공백 구분자, 문장 3개와 단어 값 6개 |','| 15~25분 | value_counts·직접 실습 | climate 3·change 2·risk 1, 빈도 합 6 |','| 25~33분 | 값 변경·문자 정리·오류 해결 | 대소문자·문장부호는 split이 자동 제거하지 않음 |','| 33~39분 | 형성평가·해석 | 빈도와 문맥, 관찰과 추론 구별 |','| 39~46분 | 선택 심화 또는 기본 보충 | merge는 같은 key, 행 위치로 결합하지 않음 |','| 46~50분 | VS Code·기록 저장 | 기본 CSV 불필요, 확장에서는 스포츠 CSV 필요 |','','## 실제 영상 구간','']
for s in ss:lines.append(f"- {stamp(s['start'])}~{stamp(s['start']+s['duration'])} · {s['title']}"+(' · 일시정지 후 직접 실습' if s['pause']>=20 else ''))
lines+=['','## 순회 지도·오류 해결','','- join의 따옴표 사이 공백 한 칸을 확인한다. 문장이 경계에서 붙지 않도록 한다.','- split 뒤의 ()와 value_counts의 복수형 s 및 ()를 확인한다.','- 문장 리스트 길이 3, 단어 Series 길이 6, 빈도표 길이 3을 구별시킨다.','- 반복 문장은 이 예제에서는 의도된 입력이다. 실제 수집 자료에서는 수집 중복과 원문의 반복을 구별한다.','- 한국어 공백 분리 결과를 정교한 형태소 분석으로 부르지 않는다.','- 기본 세 단계까지만 마쳐도 핵심 학습을 완료한다. 표 결합 4~5단계는 선택 심화다.','','## 보충·심화','','- 느린 학생: join, split, Series, value_counts를 별도 변수로 나누고 중간 결과를 출력한다.','- 빠른 학생: 소문자 변환·쉼표 정리 전후 빈도와 적용 이유를 기록한다.','- 선택 심화: right 순서 변경 시에도 key 대응이 유지됨을 확인한다. right에 A만 남기면 기본 inner 결합 결과는 A 1행이다.','- 결합 이후 행 수와 키의 대응을 확인한다. key가 중복되는 다른 상황까지 항상 2행으로 일반화하지 않는다.','','## 형성평가 정답·해설','','1. climate는 3회. 문장마다 한 번씩 등장한다.','2. 전체 단어 값 6개, 서로 다른 값 3종류. 3+2+1=6이다.','3. split은 공백 분리다. 대소문자·문장부호 정리는 따로 정한다.','4. 빈도만으로 글의 의도를 확정할 수 없다. 문맥과 사용 방식을 살핀다.','- 기존 웹앱 두 문항 정답: 3 / 아니요.','','## CSV·선택 심화 검증','','- sports_fictional.csv: 8행·6열. team 값의 빈도 파랑 4, 빨강 4. 기본 문장 및 표 결합 코드에는 CSV가 필요 없다.','- 기본 merge 결과: A 80 B / B 90 A, 2행·3열.','','## 제작 관리 기록','','- 코드 장면은 실제 화면 녹화가 아닌 학습 장면이다. 출력은 실제 pandas 실행값이며 음성은 ko-KR-SunHiNeural 기본 AI 합성 음성이다. 교사 목소리 복제가 아니다. 이 기록은 낭독하지 않는다.']
(R/'docs/video-production/lesson07-teacher-guide.md').write_text('\n'.join(lines)+'\n')
print('REGISTERED',d,len(ss))
