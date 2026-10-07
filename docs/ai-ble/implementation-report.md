# AI BLE 과정 구현·검증 보고서

검증일: 2026-10-07 (Asia/Seoul)

## 변경 기준과 범위

- 원본 저장소: englishmath75/pico-lab-classroom
- 기준 HEAD: `864d0a567bb1b7fda1a5ae0748bc791392278f72` (제공 명세의 분석 커밋과 일치)
- 로컬 브랜치: `feat/ai-ble-classroom`
- 시작 시 작업 트리 깨끗함. 저장소 및 작업 경로 상위에 적용할 AGENTS.md 없음.
- 지정 저장소가 현재 작업 폴더/등록 프로젝트에 없어 같은 기존 GitHub 저장소를 로컬 복제하여 작업함.
- 기준선: npm ci 성공, 기존 화면 통합 전 Vite build와 TypeScript 검사 통과.
- 기존 React/Vite/Tailwind, 네 기존 URL, Pages workflow와 DOCX 복원 단계 유지.
- 추가 경로: `?view=ai-ble`. 원격 배포는 하지 않음.

## 구현 내용

1. 8개 50분 수업 데이터, 24개 평가 문항, 발문·예상답·오류 분기, 교사 공개 지도안·타이머·100점 루브릭.
2. GPIO/API·물리 핀 병기, USB 위 방향 보드 도식, 고정 CDS 회로, DHT11 구매 규격·부저 드라이버 준비 조건.
3. BLE 20바이트 프레임 재조립, 512바이트 상한, UTF-8 검증, seq wrap/중복/과거 패킷 제거, 2초 timeout·복구.
4. 사용자 click만 연결, 세대 토큰과 동일 기기 소유권, 취소/권한/서비스/연결 오류 구분, WAITING/STALE/재연결/cleanup.
5. 실제 센서 대시보드, 최근60개 추이, DEMO·진단 카운터 분리, 5행 회차 수집·CSV 검증/병합/중복/충돌 검토.
6. 새로운 관찰 label을 먼저 정하는 최종 검증 기록과 `final_validation.csv` 별도 내보내기. 오류와 원시 state 기록.
7. 학습/최종 기록 합계 최대3000행, 최종 기록 최대30행. 로그는 메모리만 사용. 이동/새로고침 경고와 내보내기.
8. 센서/통신/추론/출력 분리 Pico 코드. 수집 모드 기본, 미학습 stub, 모델 누락·오류·학습 범위 밖 출력 정지.
9. 출력은 3회 연속 일치 후 변경, 무효 즉시 OFF, 기본 무음·30초 소리 간격. 모델의 학습 규칙과 구분.
10. 실제 CSV만 받는 10셀 Colab, 회차 단위 stratified train_test_split, accuracy/baseline/혼동행렬, tree_ 자동 변환.
11. 모델 메타·소스 SHA256·학습 범위·CSV hash·환경·회차 ID·tests 생성. 원본/변환 전체행·1000개 변환검사용 입력·경로별 cut±1 검사.

기존 진도 로드/쓰기 effect의 초기 빈 값 덮어쓰기 위험을 `app/page.tsx`, `app/arduino-lab.tsx`,
`app/arduino-only-course.tsx`에서 loaded guard로 최소 수정했다. 키·형식·교재 내용은 유지했다.
새 과정 직접 URL은 최초 렌더부터 선택하여 기존 과정의 저장소 접근이 먼저 실행되지 않는다.

## 자동 검증

| 검사 | 결과 |
|---|---|
| 기준선 npm ci / build / typecheck | PASS |
| 변경된 lockfile npm ci 재설치 | PASS (테스트 서버 파일 잠금 해제 후) |
| 최종 npm run build, GitHub Pages base 설정 | PASS |
| 최종 tsc --noEmit | PASS |
| TypeScript 프로토콜·수집·CSV·진도·타임라인·최종 검증 | 17 PASS |
| Python 변환·메타·노트북 전체 코드 셀·펌웨어 정책 stub | 10 PASS |
| Playwright 브라우저 회귀 | 11 PASS |
| 실제 dist의 /pico-lab-classroom/ 진입·13개 다운로드 HTTP 200 | PASS |
| 360/768/1440px 가로 넘침 검사 | PASS |

총38개 자동 테스트. 브라우저 검증은 Chromium과 Bluetooth mock이며 실제 Galaxy/BLE 검증이 아니다.
Python 펌웨어 검증은 machine/dht/aioble stub를 사용하는 정책 검사이며 MicroPython 실기 PASS가 아니다.
소프트웨어 fixture는 테스트에서만 만들고 실제 classroom 데이터나 학습 완료 모델로 제공하지 않는다.

회귀 범위: 기본·Arduino·PWM·C-basic, 새 직접 URL·reload·back/forward, 코드 복사,
진도 키 보존/새 키 초기화/손상 JSON/접근 차단, 사용자 취소·서비스 NotFoundError,
비동기 연결 중 이동·listener 해제, 진단 카운터 수집 방지, 실측 수집·다운로드,
센서 오류·stale·seq 초기화 재연결, 교사 탭 데이터 유지, 미저장 이동 경고,
새 실측 검증 CSV 분리, 원격 notebook 공개 상태에 따른 Colab 링크.

이 환경의 기본 PATH에는 npm/Python 실행 파일이 없어 번들 Node 24.19.0과 Python 런타임을 사용했다.
npm10은 pnpm dlx로 실행했으며 저장소에는 일반 npm 스크립트를 제공한다.
Python 검증 버전은 requirements-test.txt에 기록했다.
Windows 테스트 서버 자동 시작은 timeout이 발생하여 Vite를 직접 실행하고 AI_TEST_URL로 검증했다.

기존부터 존재한 경고: 500KB 초과 Vite chunk, npm audit 32건(설치 전후 동일 건수).
요청 범위 밖 의존성 일괄 업그레이드나 audit fix는 수행하지 않았다.

## 원격·실기 준비 상태

- push / PR / Pages 배포: 수행하지 않음.
- 원격 notebook raw URL: HTTP404 확인. Colab shell의 HTTP200은 notebook 존재 증거가 아님.
- UI는 실제 원격 nbformat4 notebook을 확인한 뒤 공식 GitHub Colab 링크를 활성화한다.
  현재는 ipynb 다운로드 → Colab 노트북 업로드로 실행한다.
- 실제 교실 CSV: 미제공. 학습 accuracy나 완성 모델을 꾸며 넣지 않음.
- Pico 2 W / DHT11 / Galaxy / 학교 PC 직접 BLE: **NOT_RUN**.
- UF2 버전·SHA256, aioble commit/패키지, DHT SKU·3.3V 지원, 부저 드라이버 SKU,
  브라우저/OS는 교사가 실제 준비 후 classroom-environment.json에 기록해야 함.
- 필요한 실제 자료: 라벨별 독립4회차×5행 이상·총80행 (권장100행). 같은 키트·배선·저항·시간/조건 출처 확인.
- 정식 M5 항목과 교사용10분 점검은 hardware-acceptance.md에 제공.

## 재현

README의 npm/Python 검증 명령을 사용한다. 새 URL은 배포 후
`https://englishmath75.github.io/pico-lab-classroom/?view=ai-ble`이다.
현재 로컬 실행은 `npm run dev -- --host 127.0.0.1 --port 4180` 후 `/?view=ai-ble`로 연다.
