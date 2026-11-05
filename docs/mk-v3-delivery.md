# MK 고1 V3 구현·검증 기록

기준 운영 커밋: `009b3be4b9f343873a6c56a6db0250c3af284a50`. 개발은 기존 PR #19 및 `feat/mk-grade1-clone-20261105`에서 이어갑니다. `main`은 병합하지 않으며 MK 운영은 검증 후 `release/mk-classroom`만 갱신합니다.

## 원본과 배포

- 학생용 원본: `mk/src`, `mk/content`, `mk/runtime`. `scripts/build-mk-site.mjs`로 `mk-dist`를 재생성합니다.
- SW 원본 HTML, 수업·학생·승인 데이터, 영상 자산은 변경하지 않습니다.
- 교사 제공 ZIP의 원본 코드와 참고 이미지는 저장소/학생 배포에 포함하지 않습니다.
- Turtle 수업 원리를 기본 반복·리스트 명령으로 재구성하고, 7색 목록은 `% len(colors)`로 모든 색을 사용합니다. 빈 G2 자료는 게시하지 않습니다.
- matplotlib 원본이 없는 부분은 가상 자료를 사용하는 독자 예제로 작성했습니다.
- 고급 pygame/Tk 작품은 선택 Canvas 체험으로 재구성하고 Python 실행 결과와 구분합니다.

## 페이지별 구성

| 메뉴 | 구현 |
|---|---|
| 00 핵심 복습 | 기초·리스트·출력, Turtle, 그래프, 속도·중력, 좌표계, 그래픽 6종 + 탐구실 A~D |
| 01 수업 안내 | 기본 첫 화면, 5묶음 안내, 학습 순서·저장 안내 |
| 02 차시별 실습 | 10단위, 독립 활동 53개; 01~08 수정 과제 2개와 확인 문제 3개씩 |
| 03 실습 자료 | 실행 링크, Python 예제 53개, 입력 파일, 점검표, 보고서 양식 |
| 04 복습 문제 | 기본 40문항·해설·힌트·필터·오답·재도전 + CodeUp 핵심 10개 |
| 05 탐구 보고서 | 8개 항목, 4가지 탐구 주제, TXT 내보내기·비공개 저장 |

## 학습 단위

| 번호 | 제목 | 활동 ID |
|---|---|---|
| 01 | Turtle 기본 명령과 좌표 | `mk3-turtle-square`, `mk3-turtle-coordinates` |
| 02 | 리스트와 반복으로 만드는 Turtle 작품 | `mk3-turtle-circles`, `mk3-turtle-star`, `mk3-turtle-illusion` |
| 03 | 리스트 데이터로 선·막대그래프 그리기 | `mk3-plot-line`, `mk3-plot-bar` |
| 04 | 산점도·수학 그래프·조건별 그래프 | `mk3-plot-scatter`, `mk3-plot-math`, `mk3-plot-conditional` |
| 05 | 리스트 생성·조회·수정·추가·삭제 | `mk3-basics`, `mk3-list-edit` |
| 06 | 슬라이싱·정렬·뒤집기·탐색 | `mk3-list-slices`, `mk3-list-sort`, `mk3-list-search` |
| 07 | 조건·반복·문자열·f-string | `mk3-control`, `mk3-fstring` |
| 08 | 구구단·별 찍기·중첩 제어 | `mk3-gugudan-vertical-comma`, `mk3-gugudan-vertical-fstring`, `mk3-gugudan-horizontal-comma`, `mk3-gugudan-horizontal-fstring`, `mk3-stars-left`, `mk3-stars-decrease`, `mk3-stars-right`, `mk3-stars-pyramid`, `mk3-stars-fstring` |
| 09 | CodeUp 사고력 도전 1~5 | `mk3-cu1173`, `mk3-cu1218`, `mk3-cu1274`, `mk3-cu1281`, `mk3-cu1411` |
| 10 | CodeUp 사고력 도전 6~10 | `mk3-cu1412`, `mk3-cu1425`, `mk3-cu1468`, `mk3-cu6097`, `mk3-cu6098` |

## 저장 계약

- `identity.service`는 승인받은 학년도·학년 또는 개인 공간을 가리킵니다. 변경 시 미저장 보호와 세대 번호 검사로 늦은 응답을 버립니다.
- 기존 `lesson-*`, `inquiry-*`, `scratch-*`는 읽고 보존합니다. 새 예제는 옛 기록에 자동 저장하지 않습니다.
- 새 활동 53개 + `mk3-report`, `mk3-notebook` 2개만 추가합니다. 임의 문자열을 허용하지 않습니다.
- CodeUp 원문 `mk3-cu번호`, 변형 `mk3-cu번호-v`를 구분합니다. 02·04의 동일 활동은 같은 ID를 사용합니다.
- 문서 최대 20,000자, 서버 저장 간격/일일 150회, 버전 충돌 검사, 최근 이력 10개를 유지합니다. 개인 초안은 교사도 직접 읽지 못합니다.
- 퀴즈 답은 메모리에 있으며 명시적 클라우드 저장/내보내기를 제공합니다. 공용 PC 마치기 때 화면 답안도 지웁니다.

## 운영 규칙 적용 증거

2026-11-05 15:10 KST Firebase 게시 완료 후 새로고침하여 입력 원문과 일치함을 확인했습니다.

- 운영 백업 SHA-256: `e72e1b8da6b473c77f09e6db1a910012a7c5125d8ccfd72e495f04690b433990`
- 적용본 SHA-256: `707b90cfdef2e7604aeb2ea43aa81efc23fc02badd801e3fbebb966eb9806687`
- 변경: MK 한정 55개 활동 ID 허용. 기존 SW 규칙·접근 주체·승인 조건·쿼터는 동일.
- 적용 전 SW 13개 + MK 18개 규칙 테스트 통과. 실제 학생 문서를 수정·이동·삭제하지 않음.

## 검증 구분

- 자동 콘텐츠: 10단위/40문항/20후보/핵심10, 63 공개 사례, 구구단 24경계 사례, 별 찍기12, 학생 금지 문법 AST 검사.
- 자동 보안: SW13+MK18; 원문·변형·보고서·오답 및 학년도·개인 공간 분리/타인 접근 거부.
- 자동 브라우저: 기존 학년도/승인/개인 공간/재로그인 복원과 새 UI Python·Turtle·matplotlib, 390/768/1366/1920, 200% 확대. 최신 실행 결과는 GitHub Actions에서 커밋별 확인합니다.
- 실제 미리보기: 홈·차시·편집기 표시, Turtle 원 무늬와 한글 matplotlib 막대그래프 실행, CodeUp 1173 공개 테스트 3/3 일치 확인.
- 규칙 적용 후 SW 운영: 학교 관리자 Google 로그인 성공, 2026학년도 2학년 1반 26명(승인25/대기0/중지1) 조회. 상태 변경 없음.
- 실제 Google 로그인: 미리보기 호스트가 Firebase 승인 도메인에 없어 검증 전입니다. 현재 승인값은 localhost, Firebase 기본2개, mk.englishmath.kr, sw.englishmath.kr입니다.
- 운영 배포/운영 새 UI 로그인·저장: 미리보기 검증 후 진행해야 하므로 이 문서 작성 시 아직 미완료입니다.
- 공개 테스트는 자체 수업 검증이며 CodeUp 공식 채점 결과가 아닙니다.

## 롤백

운영 반영 전 현재 production 배포 ID를 기록합니다. 문제 발생 시 Vercel의 기존 MK 배포 `dpl_6vife7gvPZmcJPLsNDXgmNpa8Kmj`로 되돌립니다. SW 프로젝트와 main은 변경하지 않습니다. 새 규칙은 기존 코드와 호환되므로 먼저 UI 배포를 되돌리고, 규칙을 되돌릴 필요가 생기면 보관한 운영 백업을 검토해 게시합니다. 새 활동 문서는 삭제하지 않습니다.

## 활동 목록

| ID | 이름 | 범위 |
|---|---|---|
| `mk3-basics` | 값과 리스트, 출력의 첫걸음 | 기본 |
| `mk3-turtle-square` | 거북이의 첫 사각형 | 기본 |
| `mk3-turtle-coordinates` | 펜을 들고 좌표 이동 | 기본 |
| `mk3-turtle-circles` | 리스트 색상으로 그리는 원 무늬 | 기본 |
| `mk3-turtle-star` | 별 나선과 반복 변수 | 기본 |
| `mk3-turtle-illusion` | 일곱 색의 사각 나선 | 기본 |
| `mk3-plot-line` | 하루의 기온: 선그래프 | 기본 |
| `mk3-plot-bar` | 우리 모둠의 독서량: 막대그래프 | 기본 |
| `mk3-plot-scatter` | 두 값의 관계: 산점도 | 기본 |
| `mk3-plot-math` | 반복으로 만드는 y = x² | 기본 |
| `mk3-plot-conditional` | 조건에 따라 점의 색 나누기 | 기본 |
| `mk3-list-edit` | 리스트 수정·추가·삭제 추적 | 기본 |
| `mk3-list-slices` | 다섯 가지 슬라이싱 | 기본 |
| `mk3-list-sort` | 정렬과 뒤집기는 다릅니다 | 기본 |
| `mk3-list-search` | 합계·개수·위치를 반복으로 찾기 | 기본 |
| `mk3-control` | 조건과 반복으로 분류하기 | 기본 |
| `mk3-fstring` | 콤마 print와 f-string 나란히 | 기본 |
| `mk3-gugudan-vertical-comma` | 세로 구구단 · 콤마 print | 기본 |
| `mk3-gugudan-vertical-fstring` | 세로 구구단 · f-string | 기본 |
| `mk3-gugudan-horizontal-comma` | 가로 구구단 · 콤마 print | 기본 |
| `mk3-gugudan-horizontal-fstring` | 가로 구구단 · f-string | 기본 |
| `mk3-stars-left` | 왼쪽 증가 별 찍기 | 기본 |
| `mk3-stars-decrease` | 왼쪽 감소 별 찍기 | 기본 |
| `mk3-stars-right` | 오른쪽 정렬 별 찍기 | 기본 |
| `mk3-stars-pyramid` | 피라미드 별 찍기 | 기본 |
| `mk3-stars-fstring` | 행 번호와 f-string 비교 | 기본 |
| `mk3-grid-bridge` | 리스트 안에 행 리스트 넣기 | 선택 심화 |
| `mk3-inquiry-a` | A. 리스트 명령어와 슬라이싱 실험실 | 기본 |
| `mk3-inquiry-b` | B. 숫자가 색이 되는 진법 탐구 | 선택 심화 |
| `mk3-inquiry-c` | C. 각도와 라디안, 회전의 비밀 | 선택 심화 |
| `mk3-inquiry-d` | D. 네 마리 거북이의 좌표·반복 탐구 | 선택 심화 |
| `mk3-gravity` | 속도·중력의 변화 관찰 | 선택 심화 |
| `mk3-coordinates` | 수학 좌표와 화면 좌표 | 기본 |
| `mk3-cu1173` | 1173 · 30분전 | 기본 |
| `mk3-cu1173-v` | 1173 · 30분전 · 변형 연습 | 기본 |
| `mk3-cu1218` | 1218 · 삼각형 판단하기 | 기본 |
| `mk3-cu1218-v` | 1218 · 삼각형 판단하기 · 변형 연습 | 기본 |
| `mk3-cu1274` | 1274 · 소수 판별 | 기본 |
| `mk3-cu1274-v` | 1274 · 소수 판별 · 변형 연습 | 기본 |
| `mk3-cu1281` | 1281 · 홀수는 더하고 짝수는 빼고 3 | 기본 |
| `mk3-cu1281-v` | 1281 · 홀수는 더하고 짝수는 빼고 3 · 변형 연습 | 기본 |
| `mk3-cu1411` | 1411 · 빠진 카드 | 기본 |
| `mk3-cu1411-v` | 1411 · 빠진 카드 · 변형 연습 | 기본 |
| `mk3-cu1412` | 1412 · 알파벳 개수 출력하기 | 기본 |
| `mk3-cu1412-v` | 1412 · 알파벳 개수 출력하기 · 변형 연습 | 기본 |
| `mk3-cu1425` | 1425 · 자리 배치 | 기본 |
| `mk3-cu1425-v` | 1425 · 자리 배치 · 변형 연습 | 기본 |
| `mk3-cu1468` | 1468 · 2차원 배열 지그재그 채우기 2-1 | 선택 심화 |
| `mk3-cu1468-v` | 1468 · 2차원 배열 지그재그 채우기 2-1 · 변형 연습 | 선택 심화 |
| `mk3-cu6097` | 6097 · 설탕과자 뽑기 · Python 대응 | 선택 심화 |
| `mk3-cu6097-v` | 6097 · 설탕과자 뽑기 · Python 대응 · 변형 연습 | 선택 심화 |
| `mk3-cu6098` | 6098 · 성실한 개미 · Python 대응 | 선택 심화 |
| `mk3-cu6098-v` | 6098 · 성실한 개미 · Python 대응 · 변형 연습 | 선택 심화 |
