# MASTER AI OFFICE · 교육본부 프로젝트 상태 계약

이 파일은 총괄 AI 비서가 참고할 **AI AGENT SMART LIFE**의 프로젝트 등록부입니다. 실제 MASTER AI OFFICE 총괄 에이전트가 완성되었다는 뜻은 아닙니다.

## 프로젝트 기본 정보
- id: `education-ai-agent-smart-life`
- department: `education`
- parent: `MASTER AI OFFICE`
- repository: `englishmath75/pico-lab-classroom`
- production_base: `https://englishmath75.github.io/pico-lab-classroom/ai-agent-smart-life/`
- release_candidate_branch: `feature/ai-agent-smart-life-v2`
- review: `https://github.com/englishmath75/pico-lab-classroom/pull/10`
- target: 고2 소프트웨어와 생활, 12차시 × 50분
- status: v2_release_candidate (검증 후 main 병합 시 배포 트리거)

## 작업 원칙
1. 기존 Arduino·Pico 실습, 수행평가 코드를 임의로 수정하지 않는다.
2. 검증된 변경만 운영 브랜치에 병합한다.
3. 학생 학습 데이터는 브라우저와 JSON 파일에서 관리하며, 허락 없이 외부 서버에 전송하지 않는다.
4. 교사용 지도안은 **공개용 연습자료**만 포함한다. 비공개 시험 원안과 학생 실명은 포함하지 않는다.
5. ChatGPT 구독과 별도 API 계정/비용을 구분한다.
6. 공개 정적 GitHub Pages에서 API 비밀키를 저장하거나 호출하지 않는다.

## 기능 목록
- [x] 12차시 수업 화면, 50분 단계별 구성
- [x] Python 브라우저 실습 (Pyodide, 인터넷 다운로드 필요)
- [x] Pandas·Matplotlib·Scikit-learn 예제
- [x] 60개 형성평가, 28문항 기말 연습 모의고사
- [x] 교사용 12차시 수업 지도안
- [x] 학년도별 로컬 진도 저장 및 JSON 백업
- [x] Agent Studio: 목표·허용 도구·실행·검증·JSON 설계도
- [x] 코드 빈칸 실습 24문항
- [x] 교사용 실제 Responses API 함수 호출 샘플 및 무료 모의 실행
- [x] 학생 익명 코드로 파일 기반 진도 일괄 집계 화면
- [ ] v2 GitHub Actions CI의 최종 결과 확인 및 main 병합
- [ ] 배포 후 실제 공개 URL 브라우저 접근 확인
- [ ] 학교 29대 PC 네트워크/브라우저·Pyodide 실기 테스트
- [ ] 학교 공식 교과 성취기준·평가 계획 최종 대조
- [ ] 실제 학생 개인별 LLM 웹 API 호출 (별도 교사 서버·인증·예산 필요)

## 핵심 공개 화면
- `/ai-agent-smart-life/` — 12차시 학생 학습실
- `/ai-agent-smart-life/agent-studio.html` — 개인 에이전트 스튜디오
- `/ai-agent-smart-life/teacher.html` — 공개용 교사용 지도안
- `/ai-agent-smart-life/teacher-dashboard.html` — 파일 기반 학생 진도 통합
- `/ai-agent-smart-life/exam.html` — 기말 모의고사

## 총괄 AI 비서와의 연동
현재는 **GitHub 문서 기반 상태 관리**입니다. MASTER AI OFFICE의 자동 위임·상태 동기화·실제 멀티 에이전트 제어 기능은 별도 개발 대상이며 완료라고 표시하지 않습니다.
