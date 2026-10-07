# Pico 2 W AI BLE 학생 UX 완료 및 검증 보고서

검증일: 2026-10-07 KST
대상: http://127.0.0.1:4180/?view=ai-ble
브랜치: feat/ai-ble-classroom
기준 HEAD: 864d0a567bb1b7fda1a5ae0748bc791392278f72 + 기존 구현 + 이번 학생 UX 변경

## 결과

학생 화면을 한 차시 집중형으로 변경했다. 기존 기능과 자료를 유지하고, 선택 차시에 관련된 도구만 표시한다. 교사 모드는 전체 도구와 자료에 접근할 수 있다. 이전 보고서의 최근 BLE 로그 누락은 이번 요청의 상세 데이터 accordion에 최근 기록을 추가하면서 해소했다.

이번 작업은 완료된 LOCAL QA를 처음부터 반복하는 작업이 아니라 학생 UX 수정이며, 수정 후 회귀 검증을 수행했다.

## 적용 내용

| 차시 | 학생 화면의 실습 도구 |
| --- | --- |
| 1 | 목표·질문·개념·준비 체크·LED 실습·led.py·평가 |
| 2 | CDS/DHT11 관찰·배선·sensor_read.py/sensors.py·평가 |
| 3 | BLE 개념·연결 진단·advertise/counter 코드 |
| 4 | BLE LIVE LAB·Sensor Dashboard·CSV 수집·센서 전송 코드 |
| 5 | Feature/Label 설명·실제 데이터/CSV 수집·BLE/센서 확인 |
| 6 | Colab 8단계·Decision Tree·accuracy/baseline·export_text·predict 생성 안내 |
| 7 | model.py·predict·model selftest·LED/부저 출력 코드 |
| 8 | BLE/센서 확인·통합 main.py·Final Project·최종 검증·수행평가 체크 |

- Roadmap: 현재 cyan, 완료 check/emerald, 미완료 gray. 완료 체크와 저장 구조 유지.
- 하단 이전/다음 차시, 현재 n/8 표시. 첫/마지막 경계 버튼 비활성화. 차시 변경 시 본문 위치로 이동.
- AI BLE 범위 본문 17px, 작은 본문 16px, 차시 제목 30~36px, section 제목 24px, 코드 15px. 기존 view의 스타일 규칙은 변경하지 않았다.
- Hero 디자인 유지 및 센서 → Pico 2 W → Bluetooth LE → 스마트폰 → CSV → AI 학습 → Edge AI 흐름 추가.
- 학생 Hero의 개발 상태 정보 제거. 교사 모드에서 하드웨어 NOT_RUN과 QA 보고서 안내 제공.
- BLE 대기값은 -- raw / -- °C / -- %, AI 판단은 연결 대기. 센서 수신 시 숫자 포맷과 상태별 한국어 의미 표시.
- 상세 데이터 보기: 진단 카운터·수신/오류 개수·최근 30개 연결 상태 및 파싱된 BLE 데이터(JSON) 기록. 기본 접힘. 원시 무선 바이트 캡처 기능을 의미하지 않는다.
- 5차시의 관찰 라벨 가림 정책 및 state/label 분리 유지. 4·8차시는 실시간 값을 표시한다.
- 코드 복사/원본 다운로드 유지. 학생은 차시별 파일, 교사는 전체 diagnostics/firmware 파일 제공.
- Colab session 단위 train/test 분리, baseline, model-meta.json, model-tests.json 및 로컬 ipynb 다운로드 유지.
- Final Project에 센서 → Pico → Decision Tree → LED/부저 및 BLE/스마트폰 흐름도 추가.
- 차시/모드 전환 시 BLE hook과 CSV/최종 검증 컴포넌트를 유지하여 수집 데이터 유실 방지. 관련 도구가 숨겨진 차시에서는 대기 중인 수집/검증을 중지하고 기존 행은 보존한다.
- 교사 운영안·대본·발문·해설·오류·하드웨어 체크·타이머·전체 코드 유지.

## 원격 노트북 404 확인

`git ls-remote origin refs/heads/main`은 위 기준 HEAD를 반환했다. 동일한 origin/main 트리에서 `public/downloads/ai-ble/PICO2W_AI_Classroom.ipynb`가 없음을 확인했다. 로컬 노트북은 기존 구현에 추가된 파일이며 원격 main에는 아직 반영되지 않았다. 이는 확인된 404와 일치한다.

외부 링크를 임의로 바꾸지 않았다. 로컬 다운로드를 유지하고, 실제 원격 응답에서 nbformat/cells를 확인한 경우에만 GitHub 노트북의 Colab 실행 링크를 표시하는 기존 검증 흐름을 유지했다. 원격 404 상황과 유효 notebook 응답 상황 모두 회귀 테스트 통과.

## 수정 후 실제 검증

| 검증 | 결과 |
| --- | --- |
| npm run build | PASS, 종료 코드 0 |
| TypeScript tsc --noEmit | PASS, 종료 코드 0 |
| 기존 regression | 11/11 PASS |
| 신규 학생 UX Playwright | 1/1 PASS |
| AI BLE protocol/collection unit | 17/17 PASS |
| 최종 학생용 질문/힌트 문구 반영 후 학생 UX 재실행 | 1/1 PASS |

npm이 기본 PATH에 없어 아래 npm 10 런처로 실제 package build script를 실행했다.

```powershell
& 'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm.cmd' dlx npm@10 run build
node node_modules/typescript/bin/tsc --noEmit
node --import tsx --test tests/ai-ble/protocol.test.ts tests/ai-ble/collection.test.ts
$env:AI_TEST_URL='http://127.0.0.1:4180'
node node_modules/playwright/cli.js test
```

기존 테스트의 기능 검증은 유지하고, 도구 접근을 교사 모드 또는 해당 차시로 이동하도록 조정했다. 로그에 오류 메시지가 함께 기록되므로 오류 검증 선택자를 status 영역으로 한정했다. 첫 실행의 선택자 중복 실패는 이 조정 후 해결됐으며 최종 전체 12개 브라우저 테스트는 통과했다.

### 학생 UX·모바일 확인

390×844에서 1~8차시를 모두 선택하여 상세 패널, 관련 영역의 표시/숨김, 차시별 코드 목록을 검증했다. 이전/다음 경계와 이동, 완료 체크/reload, 학생↔교사 모드, BLE 버튼·대기값·접힌 로그, 교사 전체 코드·Final Project 접근을 검증했다.

8개 차시 모두 문서 가로 overflow가 없었다. 모바일 Hero·본문·센서 카드·Colab·차시 이동 화면을 캡처하여 시각 검토했다. 검토 화면에서 텍스트 겹침/잘림을 발견하지 않았다. 코드 pre의 내부 스크롤을 유지했으며 버튼은 최소 높이 44px이다. 센서 카드는 모바일 1열이다.

회귀 테스트로 Arduino/PWM/C/Pico 경로, 기존 진도, 코드 복사/다운로드, 미지원 BLE, 취소/서비스 오류, stale/재연결, CSV 및 최종 검증 분리, 미저장 경고를 확인했다. 차시 5→6→5와 학생/교사 전환 뒤 CSV 행 보존도 확인했다. 테스트는 mock BLE를 사용하며 실제 장치 수신으로 간주하지 않는다.

### 빌드 경고

최종 Vite 8.0.13 빌드: 1990 modules, CSS 98.94 kB, JS 722.06 kB (gzip 212.57 kB). 500 kB chunk 경고가 남아 있다. 기존 view의 로딩 경로와 상태 수명 변경을 피하기 위해 이번에는 dynamic import 구조 변경을 하지 않았다. 경고는 비치명적이며 빌드가 통과했다.

## 증빙·미실행 범위

- `work/ux-build.log`, `ux-typescript.log`, `ux-unit.log`, `ux-regression.log`, `ux-final-student.log`
- `work/ux-lesson-1-390.png` ~ `ux-lesson-8-390.png`, Hero/도구/내비게이션 캡처, `ux-visual.json`
- 테스트: `tests/ai-ble/navigation.spec.ts`, `tests/ai-ble/student-ux.spec.ts`
- 이전 QA 보고서는 `work/QA_REPORT_before_student_UX.md`에 보존.

실제 Pico/Galaxy 하드웨어, 펌웨어 실기 실행, 실제 Colab 학습 및 정확도 검증은 NOT_RUN이다. 기존 firmware·diagnostics·model 테스트 자료를 변경하거나 삭제하지 않았다. Git commit/push/main merge/deploy를 수행하지 않았다.

아래 상태는 실제 장치 시험에 진입할 소프트웨어 준비 상태이며, 하드웨어 합격 판정이 아니다.

## 배포 전 정리 확인 (2026-10-07)

- 기능·UX 추가 및 앱 소스 수정 없음. 기존 staged/unstaged 상태 유지.
- 이번 단계에서 npm run build 최종 1회 실행: PASS (exit 0). JS 722.06 kB, gzip 212.57 kB. 기존 chunk 크기 경고 유지.
- TypeScript 최종 검사: PASS (exit 0).
- git diff 최종 검토 및 공백 오류 검사 완료. 배포 workflow 변경 없음.
- commit 후보 61개: 구현·테스트·문서·학생 다운로드 자료·설정/lockfile 유지.
- work/, dist/, node_modules/, test-results/, Python 캐시, tsbuildinfo는 Git 제외 유지. QA 원본을 삭제하지 않음.
- 최신 UX의 unstaged 수정과 새 QA 보고서/학생 UX 테스트는 향후 commit 시 함께 포함해야 함. 현재 index만 commit하면 최신 작업이 빠지므로 그대로 commit하지 말 것.
- 이번 단계에서는 기존 성공한 브라우저·단위 테스트를 반복하지 않음.
- REAL HARDWARE STATUS: NOT_RUN — PICO 2 W NOT YET PURCHASED
- commit / push / main merge / GitHub Pages deploy 수행하지 않음.

READY FOR REAL DEVICE TEST
