# 조사 기록 — 2026-10-27

기준 커밋: d957b29af9876a6d60f8165f50ee63582fe0ccd1。

정적 소스의 모든 HTML 입력·선택·버튼·링크는 동명 controls.json에 목록화했다. 동적으로 생성되는 실습은 아래 정규 차시와 course-data.js를 기준으로 한다. 목록화와 실제 클릭 검증은 구분한다.

| 조사 대상 | 기존 구현 | 확인 수준 |
|---|---|---|
| 첫 화면 | index.html / home | 실제 브라우저 확인 |
| 정규 10차시 | step-by-step.html?lesson=1~10 | 소스 전수 조사, 2차시 실제 실행 |
| 코드 실습 | 10차시×5단계, 힌트·전체 예제·실행·중지·기록 백업 | 50회 Python 회귀검사 |
| CSV·자료실 | index.html / data, datasets/ | 실제 자료실의 8행×6열 미리보기 확인; CSV 로컬 검사 |
| Python 자유 실습 | index.html / lab | 소스 조사 |
| 형성평가 | 차시별 2문항 | 20문항 정의 검사 |
| 기말 복습 | index.html / exam | 실제 20문항 화면 확인 |
| 탐구 보고서 | index.html / report | 실제 입력·HTML·JSON 저장 버튼 확인 |
| Pandas 추가 실습 | mastery.html, 18개 | 실제 18개 메뉴·편집기·채점 버튼 확인 |
| 교과서 학습실 | textbook-classroom.html, textbook-guide.html | 디지털 개념 정리 10개 섹션 실제 확인; 대응표 소스 조사 |
| KOSIS | kosis-project.html | 실제 프로젝트 화면과 파일 선택·인코딩·헤더·코드저장 버튼 확인; KOSIS 원사이트 다운로드 미검증 |
| 이전 통합 수업 | index.html / final-course | 정규 10차시와 구분해 보존 |

## 정규 차시와 데이터

### 1차시 · Pandas 시작 · 행·열·인덱스
- 목표: 작은 DataFrame을 만들고, 데이터 3행·2열과 행의 이름표인 인덱스를 구별합니다.
- CSV: school_store_fictional.csv
- 단계: Pandas 불러오기 → 매점 데이터를 표로 만들기 → 표 전체 출력 → 행과 열의 개수 확인 → 인덱스를 1부터 시작하기
- 관련 개념: lesson01-guide.html#basics

### 2차시 · 표 살펴보기 · Series와 평균
- 목표: 열 선택, 행·열 개수, 평균을 확인하며 표 형태의 데이터를 다룹니다.
- CSV: school_store_fictional.csv
- 단계: Pandas 시작 → DataFrame 만들기 → 앞의 두 행과 크기 → 열 이름과 한 열 선택 → 가격 평균 계산
- 관련 개념: lesson01-guide.html#dims

### 3차시 · CSV 읽기·행과 열 선택
- 목표: 다운로드한 스포츠 CSV와 같은 파일을 웹에서 읽고, 열 이름과 행의 레이블·위치를 구분합니다.
- CSV: sports_fictional.csv
- 단계: Pandas 불러오기 → CSV 파일 읽기 → 앞의 두 행 확인 → 두 열 고르기 → 레이블과 위치 비교
- 관련 개념: textbook-classroom.html#u02

### 4차시 · 조건 검색·정렬로 선수 찾기
- 목표: 스포츠 기록을 조건으로 걸러내고 값에 따라 정렬합니다.
- CSV: sports_fictional.csv
- 단계: Pandas 시작 → 스포츠 표 작성 → 점수 조건 검색 → 내림차순 정렬 → 두 조건 결합
- 관련 개념: textbook-classroom.html#u06

### 5차시 · 결측·중복·자료형 정리
- 목표: 누락 값과 중복 행을 확인하고 처리 전후 통계를 비교합니다.
- CSV: school_store_fictional.csv
- 단계: Pandas 시작 → 결측과 중복이 있는 자료 → 결측값 개수 확인 → 중복행 제거 → 결측을 0으로 처리
- 관련 개념: textbook-classroom.html#u02

### 6차시 · groupby로 팀별 평균 비교
- 목표: 개별 기록과 집단 평균의 차이를 이해합니다.
- CSV: sports_fictional.csv
- 단계: Pandas 시작 → 팀 기록 입력 → 팀별 평균 → 팀별 합계 → 팀별 선수 수
- 관련 개념: textbook-classroom.html#u06

### 7차시 · 단어 빈도 · 표 결합 맛보기
- 목표: 문장을 단어로 나누어 빈도를 셉니다. 뒤의 표 결합 2단계는 선택 심화입니다.
- CSV: sports_fictional.csv
- 단계: Pandas 시작 → 문장 준비 → 단어별 빈도 세기 → 정보표 두 개 만들기 → merge로 연결
- 관련 개념: textbook-classroom.html#u04

### 8차시 · Matplotlib 기후 시각화
- 목표: 표의 수치를 꺾은선그래프로 나타내고 축 단위와 출처를 생각합니다.
- CSV: climate_fictional.csv
- 단계: Pandas 시작 → 그래프 도구 불러오기 → 기온 데이터 표 만들기 → 꺾은선그래프 작성 → 축과 제목 달기
- 관련 개념: textbook-classroom.html#u03

### 9차시 · 인구 변화 데이터 분석
- 목표: 인구 증감량과 증감률을 구분하고 해석합니다.
- CSV: population_fictional.csv
- 단계: Pandas 시작 → 두 해의 가상 인구 입력 → 인구 증감량 구하기 → 인구 증감률 구하기 → 마지막 증감률 선택
- 관련 개념: textbook-classroom.html#u07

### 10차시 · 분석 보고서·기말 종합
- 목표: 표 만들기부터 요약과 그래프까지 스스로 연결하고 해석합니다.
- CSV: school_store_fictional.csv
- 단계: Pandas 시작 → 매점 데이터 만들기 → 판매량 내림차순 → 평균 계산 → 최댓값과 분석 결론
- 관련 개념: textbook-classroom.html#u10

## 발견한 차이와 처리

- 요청한 시범 2차시 제목은 기존 1차시 개념과 일부 겹친다. 차시 번호나 기존 예제를 바꾸지 않고 2차시에 보충 자료로 추가한다.
- 기본 예제는 CSV를 읽지 않고 Python 딕셔너리로 표를 만든다. CSV 다운로드는 확장 활동으로 설명한다.
- 정규 0·11·12차시는 아직 기존 COURSE_LESSONS에 없다. 영상 제작 검증 전 임의로 정규 차시를 추가하지 않는다.
- 최초 초안 단계에는 영상이 없었다. 후속 작업에서 실제 Python 결과를 바탕으로 재현 영상을 합성했고, 한국어 음성과 SRT/VTT/MP4 선택형 자막을 제작했다. 실제 화면 녹화와 구분 표시했다.
- 교과서 원문을 확보하지 않았으므로 페이지별 교과서 내용과 일치한다고 주장하지 않는다.
- 현재 2차시 완성 파일만 영상 목록에 등록했다. 다른 차시의 미완성 재생 버튼은 노출하지 않는다.
