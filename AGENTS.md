# AGENTS.md — PICO LAB CLASSROOM 운영 지침

## 프로젝트 정체성
- 저장소: englishmath75/pico-lab-classroom
- 배포: GitHub Pages (main 브랜치의 .github/workflows/pages.yml)
- 교육 대상: 고등학교 「소프트웨어와 생활」 학생
- 현재 기능: Arduino, Arduino 수행평가 연습, Raspberry Pi Pico 실습, AI AGENT SMART LIFE 12차시
- 총괄 업무 등록부: 개인 Drive 「00_프로젝트_통합관리_시작점_2026-10-12」를 우선 확인. 프로젝트 번호는 기존 00~13을 유지한다.

## 모든 Codex/AI 작업의 우선 규칙
1. 기존 Arduino·Pico·assessment 관련 파일·배포 링크를 삭제/덮어쓰지 않는다. 변경 요청이 있어도 정확한 대상부터 확인한다.
2. 교육 데이터는 합성 자료만 사용한다. 학교 비공개 기말고사 원안, 학생 이름, 실성적, 학급 연락처, 계정 정보, API 키 등을 public/ 또는 GitHub issue/PR에 올리지 않는다.
3. AI 에이전트와 규칙 기반 시뮬레이터는 혼동하지 않는다. 모델을 호출하지 않는 도구 라우터는 생성형 AI 에이전트라고 홍보하지 않는다.
4. AGENTS.md는 업무 지침일 뿐 에이전트 자체가 아니다. 실제 실행 권한과 도구 연결, 상태 기록을 별도로 검증한다.
5. 작은 기능 단위로 수정한다. 원본을 보존하고, 변경한 파일·테스트 결과·배포 상태를 보고한다.
6. 브랜치에서 검토한 뒤 CI를 통과해야 main으로 병합한다. 배포가 필요하면 사용자 승인 정책을 따른다.
7. 학생이 기말고사 대비에 사용할 Python 코드의 실행 가능성·해석 가능성·출력 예측을 확인한다.
8. 화면은 학생 29명이 PC에서 동시에 사용할 수 있도록 서버 로그인 의무 없이 동작하게 만든다. 수업용 진도 저장은 로컬이고 기기간 자동 동기화가 아니라고 명시한다.
9. 교사용 공개 설명을 비밀 시험지와 혼동하지 않는다. 홈페이지의 교사용 보기 기능은 인증 보안 장치가 아니다.
10. 완료 주장 전에 코드 변경, 빌드 통과, 브라우저 실동작, 학교 PC/네트워크 확인 여부를 구별한다.

## AI AGENT SMART LIFE 변경 시 점검
- 모든 12차시 데이터: public/ai-agent-course-data.js
- 학생 웹앱: public/ai-agent-smart-life.html + .css + .js
- 선택적 브라우저 Python 실행: public/ai-agent-python-worker.js (Pyodide CDN 연결이 불가능하면 Colab/로컬 대체)
- 기존 포털 연결: app/page.tsx의 정적 페이지 링크.
- 테스트: python3 scripts/validate-ai-agent-course.py; node --check public/ai-agent-*.js; npm run build.
- 전체 지도안: docs/ai-agent-smart-life-12lesson.md.
- 12차시 실전 지필 원안과 정답은 웹앱에 포함하지 않는다.

## 전문 AI 역할
- 기획 담당: 교수·학습 목표, 성취기준과 학기평가계획의 정합성, 수업 시간 배분.
- 구현 담당: 기존 코드를 해치지 않는 작은 수정과 테스트.
- 검증 담당: Python 예제, 진도, 퀴즈, 접근성, 공개 범위 검증.
- 총괄 담당: 결과만 종합해 기존 00 프로젝트 등록부에 상태를 업데이트. 같은 파일에 대한 병렬 수정은 금지.

## 보고 형식
- 작업한 내용 / 실제로 확인한 테스트 / 아직 확인하지 못한 조건 / 다음 행동 1~3개.
