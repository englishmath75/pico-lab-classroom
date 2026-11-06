# SW V2 검증표 — 운영 적용 승인 전
기준 소스: af113f41e0f209f6f0aedd18596fad6788bd2609. 운영 배포와 공유 규칙 변경은 아직 하지 않았습니다.
결과: PASS 37 / BLOCKED 17 / NOT_RUN 4 / FAIL 0. 복합 환경의 LIVE 미실시는 전체 PASS로 올리지 않았습니다.
전체 필수 검증 완료 또는 운영 배포 완료라는 뜻이 아닙니다.

- [전체 SW CI](https://github.com/englishmath75/pico-lab-classroom/actions/runs/42252447686): 성공.
- [최종 게시 후보 검사](https://github.com/englishmath75/sw/actions/runs/42255328515): 성공. 게시 SHA 8d7ac4e9f29505b6895bd3bdf1fd3d136fe7b170; 전체 경로·사용자 CSV 경계·저장 실패 중 유휴 종료 추가 시험 포함.
- [구현 PR #40](https://github.com/englishmath75/pico-lab-classroom/pull/40), [게시 PR #1](https://github.com/englishmath75/sw/pull/1): 초안, 미병합.
- [규칙 승인 검토](security/APPROVAL_REVIEW.md), [메뉴·저장 범위](ACTIVITY_MAP.md), [MK/SW 비교](COMPARISON.md), [교사용 사용법](TEACHER_GUIDE.md), [복구 절차](ROLLBACK.md).
- review-evidence의 화면은 가상 계정으로 테스트한 후보 화면입니다. 운영 화면·실제 학생·물리 카메라 증거가 아닙니다.

| ID | 우선 | 요구 환경 | 항목 | 결과 | 실제 근거와 제한 |
|---|---|---|---|---|---|
| B01 | P0 | READ_ONLY | 운영 기준 식별 | PASS | 시작 시 source c38e7ce / publisher 1716210, MK·상용 배포 ID·SHA·alias와 Firebase 프로젝트를 직접 확인. COMPARISON.md 및 security/live-read-20261107.json. |
| B02 | P0 | STATIC | SW 콘텐츠 보존 | PASS | 콘텐츠 보존 2개 시험: 10차시·50단계·20문항·7개 보고서 키·CSV 원본 해시·A~D·실행 자산. 1,054개 내부 링크 및 영상 카탈로그 자산 검사 통과. |
| B03 | P0 | STATIC | MK 코드 보호 | PASS | SW 전용 PR #40. MK PR #39 미병합·기존 7f1f2af 유지, source main 미변경. MK 프로젝트 설정 쓰기 없음. |
| B04 | P0 | READ_ONLY | 운영 규칙 확보 | PASS | 학교 계정으로 활성 규칙 전체 31,905자 재조회. SHA256 707b90cf…9806687, 보관본과 정확히 동일. 운영 규칙 미적용. |
| B05 | P0 | STATIC | 활동/경로 목록 완성 | PASS | ACTIVITY_MAP.md와 registry/schema/models에 화면·별칭·입력·89개 고정 활동·종류별 복원 연결. 실행기 전용 문서는 학습 메뉴가 아닌 내부 자산. |
| N01 | P0 | LIVE | 공통 인증·내부 이동 | BLOCKED | 에뮬레이터 한 번 로그인·전체 내부 메뉴 왕복 PASS. 실제 Google 운영 시험은 규칙 승인·SW 게시 및 브라우저 재연결 후 실시. |
| N02 | P0 | BROWSER | 옛 주소 직접 진입 | PASS | 게시 후보의 등록된 모든 화면, student-room panel/workspace, data-lab/index, 기존 pandas-data-lab 리다이렉트, 차시 7/8 직접 진입 확인. |
| N03 | P0 | BROWSER | 뒤로·앞으로·새로고침 | PASS | 브라우저 내부 이동·뒤로·새로고침 정책 시험, 보고서→복습→차시 복원 통과. 새로고침 후 재로그인이 필요한 정책을 화면에 표시. |
| N04 | P0 | BROWSER | 메뉴 연결 누락 없음 | PASS | 내부 DataLab 실제 실행과 보조 외부 링크의 주소·새 탭 검사. 외부 링크 이름/별도 기록 안내, 분홍색 아바타 메뉴 유지. |
| N05 | P0 | BROWSER | 정적 자료 보존 | PASS | 실제 CSV/.py/JSON/TXT/PNG 다운로드와 경로 검사 통과. 원본 영상·자료 자산 존재 검사. 모든 영상 전체 재생을 주장하지 않음. |
| N06 | P0 | BROWSER | 읽기/체험 무저장 | PASS | 모든 등록 경로의 읽기 전용 저장 버튼 숨김 검사, 아바타 실제 DB 무쓰기 확인. 자료 페이지는 편집 CSV/자유 코드가 있어 혼합 저장 대상. |
| N07 | P1 | BROWSER | 접근성·반응형 | NOT_RUN | 390/1440/1920px·키보드·200% 텍스트 크기 시험 PASS, 후보 스크린샷 육안 확인. 실제 브라우저 200% 확대 조작은 NOT_RUN. |
| S01 | P0 | EMULATOR+LIVE | 차시 코드 저장 | BLOCKED | 에뮬레이터 기존 plain lesson 코드 수정·60초 자동 저장·서버 기록 대조 PASS. LIVE 미실시. |
| S02 | P0 | EMULATOR+LIVE | 단계별 학습물 | BLOCKED | 에뮬레이터 단계 2 위치·1단계 완료·예측·해석·stdin·퀴즈/채점 복원 PASS. LIVE 미실시. |
| S03 | P0 | EMULATOR+LIVE | 복습·오답 | BLOCKED | 에뮬레이터 미채점 선택·채점·오답 기록·다시 풀기·오답 필터·서버 복원 PASS. LIVE 미실시. |
| S04 | P0 | EMULATOR+LIVE | 보고서 7개 항목 | BLOCKED | 에뮬레이터 7항목 입력·화면 왕복·별도 컨텍스트 복원 PASS. 기존 내보내기와 필드 보존. LIVE 미실시. |
| S05 | P0 | EMULATOR+LIVE | 보충·자유 실습 | BLOCKED | 기존 코드 ID 보존·scratch 저장/이력, 탐구 D 코드/설명/자기 점검/4문항, 전체체험 메모 연결 확인. 모든 보충 활동의 실제 Google 복원은 미실시. |
| S06 | P0 | EMULATOR | 같은 활동·다른 활동 | PASS | 유한 ID·별칭·종류별 라우팅 시험 및 별도 DataLab 차시 상태. 늦게 로드한 복습 기록을 이전 화면 캐시가 가리지 않는 회귀 시험 통과. |
| S07 | P0 | EMULATOR | 전역 저장 큐 | PASS | 16초 UID 단위 순차 큐·timeout 슬롯·기본값 무쓰기·변경 없을 때 무쓰기·150회 한도 규칙 시험. 실제 브라우저 다중 초안 종료 저장 확인. |
| S08 | P0 | EMULATOR | 저장 중 재입력 | PASS | 저장 중 새 편집이 기존 응답 뒤에도 dirty로 유지되는 제어된 비동기 시험 통과. |
| S09 | P0 | EMULATOR | 늦은 읽기·계정 변경 | PASS | 이전 UID 늦은 읽기/대기 쓰기 차단, 계정 세대 확인 시험. 별도 계정에서 앞 학생 기록 미노출. |
| S10 | P0 | EMULATOR | 읽기 실패 보호 | PASS | 읽기 실패/손상 JSON/미래 스키마의 원문 보존·쓰기 차단·수리 후 재읽기 시험. 편집 화면도 읽기 실패 시 열지 않음. |
| S11 | P0 | EMULATOR | 충돌·이력 | PASS | 버전 충돌·내 초안 보존·명시적 서버본 선택·비교 뒤 새 버전 발생 거부 시험. 브라우저 이력 1→새 버전 3 복원 확인. |
| S12 | P0 | EMULATOR | 오프라인·한도·길이 | PASS | 오프라인 브라우저 저장 실패와 초안 JSON 내보내기, 재연결 후 저장. 20,000자·일일 한도·권한 실패가 성공 표시로 바뀌지 않는 시험. |
| S13 | P0 | EMULATOR | 종류별 보관함 | PASS | 코드·상태·보고서·시각화 6개 항목 보관함 및 각 전용 화면의 서버 복원 확인. 모든 ID의 routeForActivity 계약 시험. |
| S14 | P0 | EMULATOR | 기존 로컬 자료 이관 | PASS | 소유자 불명 localStorage 시험 자료 미가져오기. 파일 미리보기·본인 확인·충돌 취소/수락·중복 무쓰기·원본 파일 유지 확인. |
| D01 | P0 | BROWSER+LIVE | DataLab 같은 사이트 | BLOCKED | 후보의 SW 동일 출처 네이티브 React DataLab과 격리 Python 실제 실행 PASS. 운영 동일 출처·실계정 검증은 게시 후. |
| D02 | P0 | BROWSER | pandas 첫 예제 | PASS | 첫 예제 import pandas as pd 단독, StringIO 없음. 실제 Python shape (3,2)와 표 출력 확인. |
| D03 | P0 | BROWSER | 실제 표 시각화 | PASS | 실제 loc (2,2), iloc (1,2), 필터 (2,2), 정렬 [20,30,10], 전후 표와 이벤트 이동 확인. |
| D04 | P0 | EMULATOR+LIVE | 시각화 저장 복원 | BLOCKED | 에뮬레이터 코드·예측·학습 설명·제공 CSV/ID/버전/SHA256 저장·다른 컨텍스트 복원 PASS. LIVE 미실시. |
| D05 | P0 | BROWSER | 사용자 CSV 경계 | PASS | 저장 코어에서 사용자 CSV 미전송·새 세션 재선택 확인. 최종 게시 CI에서 실제 파일 선택 대화상자·메뉴 왕복 메모리 유지·계정 백업 본문 제외와 user-file 표시까지 PASS. |
| D06 | P0 | BROWSER | Python 실행 회귀 | PASS | 실제 pandas/Matplotlib/input/한글 출력·한글 그래프/PNG 다운로드/무한 반복 중지/네트워크 차단/iframe 정리 확인. |
| D07 | P0 | STATIC+BROWSER | 교재 편집 권한 | PASS | 학생 DataLab에는 교재 게시 기능을 이식하지 않음. 원본 교재·상용 서비스는 읽기 전용 조사와 SW 사본만 사용. |
| P01 | P0 | EMULATOR+LIVE | 명시적 학습 종료 | BLOCKED | 에뮬레이터 전체 초안 저장 후 종료·개인 내용 정리·재로그인 복원 PASS. 운영 실계정 종료 시험은 미실시. |
| P02 | P0 | EMULATOR | 유휴 보호 | PASS | 가상 시계 14분 경고·15분 종료 PASS. 최종 게시 CI에서 실제 에뮬레이터 로그인→오프라인 저장 실패→유휴 강제 종료→코드 DOM/로그인 정리·서버 무쓰기까지 추가 통과. 실제 학교 PC 시험 아님. |
| P03 | P0 | EMULATOR | 계정·공간 격리 | PASS | 에뮬레이터 A→B 비노출·이전 세대 응답 차단·MK 학년도/cohort/개인/legacy users 분리 회귀 통과. |
| P04 | P0 | BROWSER | 아바타 저장 없음 | PASS | 다른 초안이 없는 새 가상 계정으로 아바타 조작 전후 workspaces/progress/revisions/submissions/limits 동일·내용 쓰기 0 확인. 코드 재진입 폐기. |
| P05 | P0 | MOCK_MEDIA | 카메라 수명 | PASS | MOCK_MEDIA 명시 시작·중지·재시작·이탈 track 종료·재진입 비활성, 권한 거부·가상 모드·슬라이더 초기화 PASS. 물리 카메라 아님. |
| P06 | P0 | STATIC+BROWSER | 인증/얼굴 유출 없음 | PASS | 실행기에 인증/학생 프로필 전달 없음, 불투명 iframe/worker CSP·고정 자산 브로커·제한 다운로드 코드 검토 및 Python 네트워크 차단 실행. 실제 얼굴 영상은 수집하지 않음. |
| R01 | P0 | EMULATOR | 승인 상태 | PASS | 전체 규칙 에뮬레이터 미로그인/pending/blocked/approved 및 기존 승인 경계 회귀 통과. |
| R02 | P0 | EMULATOR | 학생 A/B 보안 | PASS | 직접 UID·잘못된 ID/필드/버전/quota 거부, 신규 64개 ID의 A 저장·B/교사 개인 본문 거부 확인. |
| R03 | P0 | EMULATOR+LIVE | 저장과 교사 제출 | BLOCKED | 에뮬레이터 자동 저장과 명시 제출 분리, 담당 교사 제출본 읽기·개인 본문 거부 PASS. LIVE 교사 경계 미실시. |
| R04 | P0 | EMULATOR | 학년도·MK 회귀 | PASS | 확인한 전체 운영 규칙 기반 제안으로 MK legacy/cohort/학년도/개인 계약 회귀 통과. MK 영역 바이트 보존 검사. |
| R05 | P0 | REVIEW | 규칙 승인 | BLOCKED | 최소 확장안·운영 원문·회귀 시험·복구안 준비. 명시적 사용자 승인과 운영 적용 전 재조회가 필요하며 아직 게시하지 않음. |
| R06 | P0 | STATIC | 비밀/우회 없음 | PASS | 운영 자격 증명 추가 없음. Firebase 공개 클라이언트 설정과 비밀을 구분. 테스트는 demo 프로젝트+localhost만 사용, 운영 우회 없음. |
| C01 | P0 | LIVE_INDEPENDENT | 실계정 독립 복원 | BLOCKED | Chromium의 별도 컨텍스트 에뮬레이터 복원은 PASS. 실제 Google 계정의 독립 브라우저/격리 프로필 복원은 미실시. 같은 Chrome 새 탭으로 대체하지 않음. |
| C02 | P0 | LIVE | 실계정 종료/재로그인 | BLOCKED | SW 새 기능 운영 배포 전이며 현재 연결 브라우저도 끊김. 학교 Google/Firebase Console 로그인 확인과 SW 운영 저장 시험을 구분. |
| C03 | P1 | LIVE_STUDENT_B | 실제 두 번째 학생 | BLOCKED | 허가된 실제 학생 B 계정으로 운영 시험을 하지 않음. 가상 학생 B 시험만 PASS이며 교사 계정으로 대체하지 않음. |
| C04 | P1 | SCHOOL_REAL | 학교 PC 2대 | NOT_RUN | 학교망 PC 2대에 대한 현장 접근 없음. |
| C05 | P1 | CAMERA_REAL | 실제 카메라 | NOT_RUN | 물리 카메라·실제 얼굴 표정 검증 없음. 가상 영상 시험만 별도 PASS. |
| C06 | P1 | LOAD_SIMULATION | 29계정 동시 접근 | PASS | 가상 29계정 초기 프로필/기록 읽기·동시 저장·옆 UID 접근 거부 916ms. 브라우저/CDN 29개 동시 다운로드나 물리 29PC 시험은 아님. |
| C07 | P1 | SCHOOL_REAL | 학교 29PC 확대 | NOT_RUN | 학교 29PC 현장 확대를 하지 않음. 먼저 실제 PC 2대 시험이 필요. |
| X01 | P0 | CI | 빌드·패키징 | PASS | 정확한 source af113f4의 SW 전체 CI PASS: 19 코어,35 규칙,2 콘텐츠,11 브라우저 시나리오,2 패키지 검사 및 1,054 링크. MK build로 대체하지 않음. |
| X02 | P0 | CI | 검증 SHA 게시 | BLOCKED | 후보 source/publisher 고정 및 승인 없는 게시 차단 확인. 운영 publisher main/Pages 미변경, 공개 버전 대조는 게시 후. |
| X03 | P0 | LIVE | 공개 사이트 반영 | BLOCKED | 공개 SW는 기존 정상 버전 그대로. 후보 화면을 운영 화면으로 표시하지 않음. 해시 자산/버전 URL과 게시 후 검사 준비. |
| X04 | P0 | READ_ONLY | MK 무변경 | BLOCKED | 배포 전 MK·상용 운영 ID/SHA/alias/Node 설정·공개 자산을 확인했고 변경하지 않음. 마지막 재조회도 동일 배포 ID/SHA/alias 및 source/publisher main 확인. SW 게시 후 재대조는 아직 미실시. |
| X05 | P0 | STAGING+REVIEW | 복구 재현 | PASS | 정상 source c38e7ce + publisher 1716210 재빌드/자료/브랜드 검사 통과. source 고정·예약 재배포 방지·기록 보존 복구 절차와 산출물 확보. |
| X06 | P0 | REVIEW | 최종 증거·비교표 | PASS | 58개 표 전체에 환경별 실제 결과·미실시 범위 기록. 비교표·사용법·실행 링크·후보 화면·정확한 SHA 제시. 최종 운영 완료 선언 아님. |

## 남은 운영 절차
공유 규칙의 SW 고정 64개 항목 확장 승인 → 현재 활성 규칙 전체 재확인 → 후보 규칙 게시·재대조 → 검증된 source/publisher 조합의 기존 GitHub Pages 게시 → 공개 버전과 기능 확인 → 실제 Google 계정 저장·종료·재로그인 → 독립 브라우저 복원.
현재 Work 연결 브라우저는 연결이 끊겨 재연결이 필요합니다. 학교 계정의 Firebase Console 로그인은 앞서 확인했습니다. 비밀번호는 요청하거나 저장하지 않습니다.
실제 학생 B, 학교 PC 2대·29대, 물리 카메라는 해당 환경을 확보하기 전까지 보류합니다. MK의 기존 보류 항목은 변경하지 않았습니다.
