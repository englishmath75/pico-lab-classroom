# PICO LAB | 라즈베리파이 피코 실습실

소프트웨어와 생활 수업에서 사용하는 라즈베리파이 Pico 웹 실습실입니다.

- 0차시: Thonny 설치, MicroPython 펌웨어, 인터프리터·COM 포트, 저장 위치, 라이브러리 및 연결 오류 점검
- 1~10차시: 개념 학습, Wokwi 가상 실습, Thonny로 실제 Pico 실행, 형성평가
- 학생별 진행 상황은 각 브라우저에 저장

## 웹앱 주소

저장소 이름이 `pico-lab-classroom`이면 다음 주소로 배포됩니다.

`https://englishmath75.github.io/pico-lab-classroom/`

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포

`main` 브랜치에 변경 사항이 올라오면 `.github/workflows/pages.yml`이 웹앱을 빌드하여 GitHub Pages에 자동 배포합니다.
# PICO 2 W AI SMART CLASSROOM 추가 과정

새 진입 경로: `?view=ai-ble`. 기존 기본 화면과 `?view=arduino`, `?view=pwm`,
`?view=c-basic`을 유지합니다. React/Vite/Tailwind 구조와 Pages workflow를 유지하며,
이 변경 자체는 원격 push/배포를 수행하지 않습니다.

- 8차시 학생/교사 자료, GPIO·물리 핀맵, 공개 지도안·100점 루브릭
- 사용자 클릭 기반 Web Bluetooth, 20바이트 조각 재조립, 오류·끊김·stale·재연결
- 실측 5행 회차 수집·CSV 검사/병합/내보내기. DEMO와 진단 카운터는 수집 불가
- 새 관찰 라벨을 먼저 선택한 최종 실측 검증 및 `final_validation.csv` 별도 내보내기
- 모듈별 Pico 코드와 실제 CSV 학습 Colab 10셀, tree_ 변환과 동등성 검사

새 localStorage 키는 `pico-ai-ble-progress-v1`이며 완료·체크만 저장합니다.
센서·라벨·모델·기기 ID는 영구 저장하지 않습니다. 3000행 메모리 제한, 그래프 최근60개.
최종 검증은 최대30행이며 학습/검증 합계가 3000행을 넘지 않습니다. 최종 CSV의 state는
학습 CSV에 포함되지 않으며 학습 노트북은 최종 검증 CSV 헤더를 거부합니다.
기존 키 `pico-lab-progress`, `arduino-lab-progress`, `arduino-3class-progress`,
`arduino-teacher-password`를 삭제하거나 통합하지 않습니다.

## 준비 상태

**실기 NOT_RUN / 실제 교실 CSV 미제공 / 학습 모델 미제공**.
제공 `model.py`는 미학습 stub이며 기본 수집 모드에서는 정상적으로 센서만 송신합니다.
Colab 생성 모델을 Thonny로 배포하고 `INFERENCE_MODE=True`로 변경해야 추론합니다.
Pico 2 W with headers, 3.3V 지원 DHT11, CDS·10kΩ, LED·330Ω, 검증한 능동 부저
드라이버, Galaxy Chrome·HTTPS·권한, UF2/aioble 사전 준비가 필요합니다.
라벨별 4개 독립 회차·회차당5행·총80행 이상 실제 자료를 준비하세요.

소스: `app/ai-ble/`, `hooks/use-pico-ble.ts`, `lib/ai-ble/`.
다운로드: `public/downloads/ai-ble/`. Colab notebook 생성 원본: `scripts/ai_ble/`.
교사 문서: `docs/ai-ble/teacher-guide.md`, `docs/ai-ble/hardware-acceptance.md`.
GitHub notebook은 아직 원격에 없으므로 내려받아 Colab에서 업로드합니다.
원격 공개 후 공식 링크 형식은
`https://colab.research.google.com/github/englishmath75/pico-lab-classroom/blob/main/public/downloads/ai-ble/PICO2W_AI_Classroom.ipynb`입니다.
이는 현재 동작하는 실행 링크로 표시하지 않습니다.

## 검증 명령

```sh
npm ci
npm run build
npm run typecheck
npm run test:ai
npx playwright install chromium
npm run test:ai:browser
python -m pip install -r scripts/ai_ble/requirements-test.txt
npm run test:ai:python
npm run build:notebook
```

Python 테스트의 합성 fixture는 변환기 검사 전용이며 실제 측정이나 수업 accuracy가 아닙니다.
Vite 서버를 따로 실행하는 환경에서는 `AI_TEST_URL=http://127.0.0.1:포트`로 브라우저
테스트 대상을 지정할 수 있습니다. 실제 M5 점검은 브라우저 mock으로 대체하지 않습니다.
