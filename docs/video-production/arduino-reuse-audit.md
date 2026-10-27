# Arduino 제작 체계 재사용 조사 — 2026-10-27

확인 기준: GitHub main d957b29af9876a6d60f8165f50ee63582fe0ccd1, 실제 배포 페이지, 연결된 Google Drive의 제작 보고서와 원본 코드. 지시서의 목표와 실제 완료 기록은 구분했다.

## 실제 미디어 위치

| 대상 | 배포 중인 HLS | 확인한 원본 MP4 |
|---|---|---|
| STEP 1 V6 | public/learning-videos/v6/step1/index.m3u8 + part-000.ts~ | GitHub 내 MP4는 없음. V6 MP4 원본 위치는 미확인 |
| STEP 2 V5 | public/learning-videos/v5/ep03/index.m3u8 + 분할 파일 | V5 STEP2 MP4 원본은 아래 링크 |
| STEP 3 V6 | public/learning-videos/v6/step3/index.m3u8 + 분할 파일 | GitHub 내 MP4는 없음. V5 STEP3 원본은 아래 링크 |

확인한 V5 원본:
- STEP1: https://drive.google.com/file/d/10RLrGYTfbN0YVy1ykBPxCRp1k636RYxT/view (50,306,780 bytes)
- STEP2: https://drive.google.com/file/d/14_gXiF0GhBPe2NdFa0RxdTeRd7TtIvDI/view (73,554,038 bytes)
- STEP3: https://drive.google.com/file/d/1-gERT_50Yf7xbWAKTJ_8v33HaMFByH6i/view (75,201,546 bytes)

Drive 파일 메타데이터와 QA_REPORT_V5.md를 확인했다. 원본 영상 전체를 이번에 다시 내려받아 재검사한 것은 아니다.

## 제작 방식 구분

- STEP1 V6 SOURCE_REFERENCE.md: 회로를 재구성하고 배선을 한 선씩 추가했다. 실제 Tinkercad 녹화가 아니다. 코드 계산 출력과 실측 녹화를 구분했다. 음성 없이 화면 자막과 SRT를 제공했다.
- V5 QA_REPORT: 실제 Tinkercad 녹화를 FFmpeg로 편집·확대하고 자막을 넣었다. H.264/yuv420p/1920×1080/30fps/faststart, 음성 트랙 없음. 기존 TTS가 있었다고 주장하지 않는다.
- 별도 Arduino PART1: Drive render.py에서 PNG 장면을 ffconcat으로 지정하고, 30fps 정수 프레임 경계와 FFmpeg로 AAC를 합성했다. 이번에 원본 Python을 확보하여 scripts/pandas-video/arduino-render-reference.py에 보존하고 같은 조립 처리를 Pandas용으로 적용했다. 이 코드는 STEP1 V6 렌더러 자체는 아니다.
- SERIAL voice_alignment_report.md: React/TypeScript/Remotion 장면과 실제 교사 녹음을 동기화했다. 음성 복제가 아니며 이번에는 교사 녹음을 사용하지 않는다.

## 이번 Pandas 적용

- 기존 장면별 시간표 → 프레임 경계 → ffconcat → H.264/AAC/faststart → HLS 20초 분할 구조 재사용.
- 기존 learning-videos/player.js의 HLS.js/네이티브 HLS 분기, 5초 간격 재생 위치 저장, 구간 이동, 배속, 종료 후 다음 편 동작을 확인했다. Pandas에 같은 라이브러리와 재생 위치 저장 방식을 적용한다.
- 기존 .github/workflows/pages.yml: main push → npm ci → npm run build → dist 업로드 → deploy-pages. 별도 학생 사이트를 만들지 않는다.
- 실제 촬영과 재구성 구분: 이번 영상은 ‘학습용 재현 장면 · 실제 녹화 아님’을 지속 표시한다. 화면의 출력값은 실제 Python 실행으로 생성한다. VS Code 화면은 순서 안내 재현이며 VS Code 자체에서 실행한 캡처라고 표시하지 않는다.
- 한국어 음성: edge-tts 7.3.1 / ko-KR-SunHiNeural, rate -8%, 기본 합성 음성. 교사 목소리 복제 없음. 기존 무음판에 없던 신규 단계다. TLS 검증은 유지하고 설치된 시스템 인증서를 추가해 연결했다. 유료 결제 없음.
- 자막: 음성 생성 시 반환된 WordBoundary 타임스탬프를 실제 음성 파일 길이와 결합, 한국어 SRT/VTT, MP4 선택형 mov_text 자막과 웹 CC 자막 제공.

## 확인하지 못한 부분

STEP1 V6·STEP3 V6의 원본 렌더러는 현재 저장소와 조사한 Drive 폴더에서 확보하지 못했다. 따라서 그 소스를 그대로 복사했다고 보고하지 않는다. 확보한 Arduino PART1 렌더러와 배포 플레이어의 재사용 범위를 명시한다.
