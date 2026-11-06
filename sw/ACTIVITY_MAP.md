# SW 메뉴·입력·보관함 연결표

각 내부 메뉴는 같은 최상위 문서의 인증 세션을 사용합니다. 읽기 전용 콘텐츠는 동일 출처의 기존 HTML을 표시하고, 데이터 시각화는 내부 React 구성 요소와 격리 Python 실행기를 직접 사용합니다.

| 화면 | 기존 주소/별칭 | 저장 종류 | 활동 ID | 해제 |
|---|---|---|---|---|
| home | index.html | none |  | release-frame |
| data | index.html | mixed | sw2-free-code, sw2-free-state | release-frame |
| exam | index.html | answers | sw2-review | release-frame |
| report | index.html | report | sw2-report | release-frame |
| lab | index.html | code | sw2-free-code, sw2-free-state | release-frame |
| examples | index.html | mixed | sw2-archive-01, sw2-archive-02, sw2-archive-03, sw2-archive-04, sw2-archive-05, sw2-archive-06, sw2-archive-07, sw2-archive-08, sw2-archive-09, sw2-archive-10 | release-frame |
| final-course | index.html | mixed | sw2-archive2-01, sw2-archive2-02, sw2-archive2-03, sw2-archive2-04, sw2-archive2-05, sw2-archive2-06, sw2-archive2-07, sw2-archive2-08, sw2-archive2-09, sw2-archive2-10 | release-frame |
| lesson | step-by-step.html | mixed | lesson-01, sw2-lesson-01-state, lesson-02, sw2-lesson-02-state, lesson-03, sw2-lesson-03-state, lesson-04, sw2-lesson-04-state, lesson-05, sw2-lesson-05-state, lesson-06, sw2-lesson-06-state, lesson-07, sw2-lesson-07-state, lesson-08, sw2-lesson-08-state, lesson-09, sw2-lesson-09-state, lesson-10, sw2-lesson-10-state | release-frame |
| python-review | python-review.html | answers | sw2-basics | release-frame |
| questions-supplement | questions-supplement.html | answers | sw2-binary | release-frame |
| first-analysis | first-analysis.html | reflection | sw2-first-analysis | release-frame |
| mastery | mastery.html | mixed | sw2-mastery-01, sw2-mastery-02, sw2-mastery-03, sw2-mastery-04, sw2-mastery-05, sw2-mastery-06, sw2-mastery-07, sw2-mastery-08, sw2-mastery-09, sw2-mastery-10, sw2-mastery-11, sw2-mastery-12, sw2-mastery-13, sw2-mastery-14, sw2-mastery-15, sw2-mastery-16, sw2-mastery-17, sw2-mastery-18 | release-frame |
| simulation | simulation.html | mixed | sw2-simulation, sw2-free-code, sw2-free-state | release-frame |
| avatar | ai-avatar.html | none |  | release-frame |
| avatar-notices | ai-avatar-notices.html | none |  | release-frame |
| lesson01-guide | lesson01-guide.html | none |  | release-frame |
| list-tuple-dictionary | list-tuple-dictionary.html | none |  | release-frame |
| radians | radians.html | none |  | release-frame |
| textbook-classroom | textbook-classroom.html | none |  | release-frame |
| textbook-guide | textbook-guide.html | none |  | release-frame |
| math-function-graphs | math-function-graphs.html | none |  | release-frame |
| physics-explanation | physics-explanation.html | none |  | release-frame |
| graphics-gallery | graphics-gallery.html | none |  | release-frame |
| teacher-10 | teacher-10.html | none |  | release-frame |
| video-player | video-player.html | none |  | release-frame |
| four-turtles | four-turtles.html | mixed | inquiry-d, sw2-inquiry-d-state | release-frame |
| kosis-project | kosis-project.html | report | sw2-kosis | release-frame |
| practice | student-room.html | code | lesson-00, lesson-01, lesson-02, lesson-03, lesson-04, lesson-05, lesson-06, lesson-07, lesson-08, lesson-09, lesson-10, scratch-01, scratch-02, scratch-03, scratch-04, scratch-05, scratch-06, scratch-07, scratch-08, scratch-09, scratch-10, inquiry-a, inquiry-b, inquiry-c, inquiry-d | engine |
| library | student-room.html?panel=library | none |  | generation |
| teacher | student-room.html?panel=teacher | none |  | generation |
| data-lab | data-lab | mixed | sw2-datalab-SW01-code, sw2-datalab-SW01-state, sw2-datalab-SW03-code, sw2-datalab-SW03-state, sw2-datalab-SW04-code, sw2-datalab-SW04-state | engine |

| 입력 | 저장 범위 | 복원 방식 |
|---|---|---|
| 정규 1~10차시 | 기존 lesson-01~10 plain Python; 신규 단계·완료·예측·해석·stdin·미채점/채점 답 | 현재 차시 코드/단계 전용 폼 |
| 복습 20문항 | 미채점 선택, 채점 여부, 오답 이력, 필터 | 복습 문제 |
| SW 보고서 | question, source, method, finding, graph, limits, next | 기존 7개 입력란 |
| Python 핵심 복습/진법 | 선택 답과 채점 상태 | 원래 복습 페이지 |
| 이전 차시/통합 예제, 기초 다지기 | 기존 답안·완료와 편집 코드·메모·선택·채점 | 종류별 페이지·unit 앵커 |
| 자유 실습 | 기존 scratch/inquiry 코드·제목·완료·실행 상태 | 원래 활동 ID를 선택한 Python 편집기 |
| 네 마리 거북이 | inquiry-d 코드; 설명·자기 점검 | 기존 코드/설명 폼 |
| 전체 과정 따라 하기 | 해석 메모 | 기존 메모 입력란 |
| KOSIS | 해석 보고서·자기 점검·파일 재선택 안내 | 기존 탐구 폼; 로컬 CSV 제외 |
| 모의실험 | 가설·정책값·설계·해석·한계·제안·확인 답 | 기존 시뮬레이션 |
| 자료 연결 자유 실습 | 코드·stdin·가상 CSV/제공 자료 식별자 | 자료 연결 실습; 사용자 파일은 재선택 |
| 내부 시각화 SW01/SW03/SW04 | 각 코드, 예측, 설명, 가상 CSV, 제공 데이터 ID/버전/해시 | 해당 시각화 차시 |
| 아바타 | 없음 | 체험 종료·이탈 때 모두 폐기 |
| 설명·갤러리·영상 | 없음 | 읽기 전용 |

현재 고2 저장 루트는 기존 2026 SW `users/{uid}`입니다. 학년도는 이 경로의 기존 학습 맥락을 표시하며 현재 연도를 자동 대입하지 않습니다. MK의 2026/2027/cohort/개인 공간은 이번 SW에서 병합·이관하지 않습니다.
로그인 전에 남아 있던 localStorage/sessionStorage 기록은 읽거나 자동 업로드하지 않습니다. 사용자가 선택한 파일만 미리보기·본인 확인·충돌 확인 후 초안으로 가져옵니다.
모든 활동의 계정 저장과 선생님께 제출은 별도 동작입니다.
