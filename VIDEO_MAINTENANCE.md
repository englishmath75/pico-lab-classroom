# 수행평가 자율학습 영상 V5

학생 경로: `?view=assessment` → 자율학습 영상 또는 EP별 카드.
재생 화면: `learning-videos/index.html`. 전체 이어보기는 EP01~05를 순서대로 재생한다.
현재 버전은 실제 Tinkercad 시연을 편집한 무음 자막 영상이다. 대본은 공개하지 않는다.

## 음성판 추가

`public/learning-videos/catalog.json`의 해당 episode.variants에 실제 완성한 음성판 파일 경로를 추가한다.

```json
{"id":"narrated","label":"음성 해설","src":"./voice/ep01/index.m3u8","duration":260,"chapters":[{"at":5,"title":"수업 활동 선택"}]}
```

MP4도 지원한다. 시간 편집이 바뀌면 그 버전의 duration과 chapters를 반드시 맞춘다.
variants가 두 개 이상일 때 영상 버전 선택기가 표시된다. 미완성 음성판의 가짜 링크는 등록하지 않는다.
ElevenLabs 음성 생성·결제는 이번 변경에 포함되지 않았다.

## 미디어와 검증

- HLS 구간 파일은 원본 H.264 무음 MP4를 재인코딩하지 않고 분할했다. 각 파일은 25 MiB 미만이다.
- hls.js는 로컬 정적 파일로 제공하고 HLS_LICENSE.txt를 포함한다.
- 기본 주소, 영상/포스터/챕터 주소는 GitHub Pages의 저장소 하위 경로에서 동작한다.
- 로컬 Chrome에서 실제 HLS 재생·챕터 이동·배속·위치 저장·EP 직접 링크·수행평가 복귀 확인.
- 원본 영상 6개의 전체 디코딩 검사 통과. 원본 자료는 별도 보존.
- 교사의 전체 연속 시청과 독립 학생 사용성 테스트는 실시하지 않았다. 이는 영상 기계 검사와 구별한다.
