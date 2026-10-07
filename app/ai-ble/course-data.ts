import type { LessonPlan } from "./types";
export const lessons: LessonPlan[] = [
  {
    id: 1,
    title: "Pico 2 W와 MicroPython",
    objectives: [
      "각 학생이 3.3V/GND/GP26을 지목하고 LED 재부팅 실행을 확인한다.",
    ],
    timeline: [
      {
        start: 0,
        end: 5,
        title: "도입",
        actions: [
          "Arduino에서 LED를 켜던 경험을 떠올리고 이번에는 스마트폰까지 연결하는 목표를 보여준다.",
        ],
      },
      {
        start: 5,
        end: 15,
        title: "개념",
        actions: [
          'RP2350, GPIO, 3.3V, ADC, MicroPython, Thonny의 역할. GPIO 번호와 물리 핀을 구별한다. W 모델의 LED는 Pin("LED")를 사용한다.',
        ],
      },
      {
        start: 15,
        end: 35,
        title: "실습",
        actions: [
          'Thonny 인터프리터/COM 확인 → Shell print → Pin("LED") 켜기/끄기 → 0.5초 주기 깜빡임 → Pico에 main.py 저장 → 재부팅 후 실행.',
        ],
      },
      {
        start: 35,
        end: 45,
        title: "실패·회복",
        actions: [
          "충전 전용 케이블, PC에만 저장, GP25 복사, COM 점유를 진단한다. 5분 내 해결 안 되면 예비 보드로 교체하고 원인을 기록한다.",
        ],
      },
      {
        start: 45,
        end: 50,
        title: "평가",
        actions: [
          'Q1 GP16의 물리 핀은? 정답 21. Q2 5V Arduino 센서 신호를 그대로 연결해도 되는가? 정답 아니며 Pico GPIO 전압 규격을 맞춰야 함. Q3 내장 LED가 안 켜질 때 핀 설정은? 정답 Pin("LED").',
        ],
      },
    ],
    opening:
      "Arduino에서 LED를 켜던 경험을 떠올리고 이번에는 스마트폰까지 연결하는 목표를 보여준다.",
    concepts: [
      {
        term: "핵심 개념",
        body: 'RP2350, GPIO, 3.3V, ADC, MicroPython, Thonny의 역할. GPIO 번호와 물리 핀을 구별한다. W 모델의 LED는 Pin("LED")를 사용한다.',
      },
    ],
    practice: [
      "Thonny 인터프리터/COM 확인",
      "Shell print",
      'Pin("LED") 켜기/끄기',
      "0.5초 주기 깜빡임",
      "Pico에 main.py 저장",
      "재부팅 후 실행.",
    ],
    wiringIds: ["led"],
    codeFiles: ["diagnostics/led.py"],
    failures: [
      {
        symptom: "USB 포트가 안 보임",
        cause: "충전 전용 케이블 또는 COM 점유",
        fix: "데이터 USB로 교체하고 다른 직렬 프로그램을 종료한 뒤 Thonny 인터프리터/포트를 다시 선택한다.",
      },
      {
        symptom: "내장 LED가 안 켜짐",
        cause: "Pico H용 GP25 예제를 사용함",
        fix: 'Pico 2 W에서는 Pin("LED")를 사용한다.',
      },
      {
        symptom: "재부팅하면 실행되지 않음",
        cause: "코드를 PC에만 저장함",
        fix: "Thonny의 다른 이름으로 저장에서 Raspberry Pi Pico 루트 main.py를 선택한다.",
      },
    ],
    teacherPrompts: [
      {
        question: "코드의 16은 물리 핀 16일까요?",
        expected: "GP16은 GPIO 번호이며 물리 핀은 21입니다.",
      },
      {
        question: "Pico가 껐다 켜져도 실행하려면 어디에 저장해야 할까요?",
        expected: "Pico 루트의 main.py로 저장합니다.",
      },
    ],
    assessments: [
      {
        id: "L1-Q1",
        question: "GP16의 물리 핀은?",
        answer: "21.",
        criteria: ["21."],
      },
      {
        id: "L1-Q2",
        question: "5V Arduino 센서 신호를 그대로 연결해도 되는가?",
        answer: "아니며 Pico GPIO 전압 규격을 맞춰야 함.",
        criteria: ["아니며 Pico GPIO 전압 규격을 맞춰야 함."],
      },
      {
        id: "L1-Q3",
        question: "내장 LED가 안 켜질 때 핀 설정은?",
        answer: 'Pin("LED").',
        criteria: ['Pin("LED").'],
      },
    ],
    successCriteria: [
      "각 학생이 3.3V/GND/GP26을 지목하고 LED 재부팅 실행을 확인한다.",
    ],
    deliverables: ["main.py, 준비 체크 4개. 심화는 깜빡임 주기 변경."],
  },
  {
    id: 2,
    title: "센서가 현실을 숫자로 바꾸는 과정",
    objectives: [
      "밝음/가림의 값 변화 3쌍, DHT 유효값 3회, raw/℃/%RH 단위를 구별한다.",
    ],
    timeline: [
      {
        start: 0,
        end: 5,
        title: "도입",
        actions: ["“어두움이라는 말을 Pico는 어떻게 알까요?”"],
      },
      {
        start: 5,
        end: 15,
        title: "개념",
        actions: [
          "CDS 저항 변화, 접점 전압, ADC 수치, DHT11 디지털 통신. 디지털 센서 출력이 단지 HIGH/LOW 한 값이라는 오개념을 교정한다.",
        ],
      },
      {
        start: 15,
        end: 35,
        title: "실습",
        actions: [
          "USB 분리 → CDS+10kΩ 회로 → GP26 값 확인 → 사전 준비 DHT11 배선 확인 → 3초 간격 측정. 손으로 CDS를 가렸다가 밝힌다. DHT11은 값이 즉시 크게 변하지 않아도 정상일 수 있음을 설명한다.",
        ],
      },
      {
        start: 35,
        end: 45,
        title: "실패·회복",
        actions: [
          "CDS 접점 없이 전원만 읽기, 브레드보드 전원레일 분리, DHT DATA/GND 혼동, 과도한 읽기. 물/뜨거운 물체/직접 입김으로 결로를 만들지 않는다.",
        ],
      },
      {
        start: 45,
        end: 50,
        title: "평가",
        actions: [
          "Q1 ADC가 직접 읽는 것은? 정답 전압. Q2 밝아질 때 값이 증가하는 이유? 정답 이번 배선에서 CDS 저항 감소로 접점 전압 증가. Q3 센서 오류를 0으로 저장해도 되는가? 정답 실제 0과 혼동하므로 안 됨.",
        ],
      },
    ],
    opening: "“어두움이라는 말을 Pico는 어떻게 알까요?”",
    concepts: [
      {
        term: "핵심 개념",
        body: "CDS 저항 변화, 접점 전압, ADC 수치, DHT11 디지털 통신. 디지털 센서 출력이 단지 HIGH/LOW 한 값이라는 오개념을 교정한다.",
      },
    ],
    practice: [
      "USB 분리",
      "CDS+10kΩ 회로",
      "GP26 값 확인",
      "사전 준비 DHT11 배선 확인",
      "3초 간격 측정. 손으로 CDS를 가렸다가 밝힌다. DHT11은 값이 즉시 크게 변하지 않아도 정상일 수 있음을 설명한다.",
    ],
    wiringIds: ["cds", "dht", "led", "buzzer"],
    codeFiles: ["diagnostics/sensor_read.py", "firmware/sensors.py"],
    failures: [
      {
        symptom: "CDS 값이 항상 최대/최소",
        cause: "접점 대신 전원 또는 GND를 읽음",
        fix: "USB를 분리하고 3.3V→CDS→GP26 접점→10kΩ→GND를 확인한다.",
      },
      {
        symptom: "DHT_READ 반복",
        cause: "핀 순서·풀업·전원 규격 또는 측정 간격 문제",
        fix: "구매 SKU의 3.3V 지원과 DATA/GND, 풀업을 확인하고 3초 간격으로 읽는다.",
      },
      {
        symptom: "밝아질 때 raw가 감소",
        cause: "CDS와 고정저항 위치가 명세와 반대",
        fix: "전원 분리 후 배선을 통일한다. 이미 학습한 자료는 재수집·재학습한다.",
      },
    ],
    teacherPrompts: [
      {
        question: "지금 30000이라는 값은 lux일까요?",
        expected: "lux가 아니라 ADC raw입니다.",
      },
      {
        question: "DHT11도 마지막에 숫자를 주는데 CDS와 무엇이 다를까요?",
        expected:
          "CDS는 접점 전압을 ADC로, DHT11은 디지털 프로토콜로 전달합니다.",
      },
    ],
    assessments: [
      {
        id: "L2-Q1",
        question: "ADC가 직접 읽는 것은?",
        answer: "전압.",
        criteria: ["전압."],
      },
      {
        id: "L2-Q2",
        question: "밝아질 때 값이 증가하는 이유?",
        answer: "이번 배선에서 CDS 저항 감소로 접점 전압 증가.",
        criteria: ["이번 배선에서 CDS 저항 감소로 접점 전압 증가."],
      },
      {
        id: "L2-Q3",
        question: "센서 오류를 0으로 저장해도 되는가?",
        answer: "실제 0과 혼동하므로 안 됨.",
        criteria: ["실제 0과 혼동하므로 안 됨."],
      },
    ],
    successCriteria: [
      "밝음/가림의 값 변화 3쌍, DHT 유효값 3회, raw/℃/%RH 단위를 구별한다.",
    ],
    deliverables: [
      "센서 코드와 관찰 기록. 이 단계 기록을 BLE 실측 CSV로 꾸미지 않는다.",
    ],
  },
  {
    id: 3,
    title: "Bluetooth LE의 역할과 연결",
    objectives: ["올바른 키트 카운터 수신, 1회 재연결, 역할 설명."],
    timeline: [
      {
        start: 0,
        end: 5,
        title: "도입",
        actions: [
          "“선이 없는데 휴대폰은 어느 보드의 데이터를 받는지 어떻게 알까요?”",
        ],
      },
      {
        start: 5,
        end: 15,
        title: "개념",
        actions: [
          "Peripheral=자신을 알리는 Pico, Central=찾고 연결하는 폰, advertising=존재 알림, service=기능 묶음, characteristic=데이터 통로, notify=갱신 알림.",
        ],
      },
      {
        start: 15,
        end: 35,
        title: "실습",
        actions: [
          "교사 제공 BLE 진단 코드 실행 → 키트명 확인 → Galaxy Chrome 링크 열기 → 연결 버튼 → 해당 키트 선택 → 테스트 카운터 수신 → 끊기/다시 연결.",
        ],
      },
      {
        start: 35,
        end: 45,
        title: "실패·회복",
        actions: [
          "다른 스마트폰이 이미 연결, 인앱 브라우저, OS 권한/어댑터 문제. 앱에 카운터는 진단용이라는 배지를 붙이고 실측 수집을 비활성화한다.",
        ],
      },
      {
        start: 45,
        end: 50,
        title: "평가",
        actions: [
          "Q1 Pico와 Galaxy의 역할? 정답 Peripheral/Central. Q2 notify의 뜻? 정답 특성값 갱신을 연결 기기에 알림. Q3 같은 보드에 두 폰이 안 붙는 이유? 정답 본 수업은 단일 연결 설계.",
        ],
      },
    ],
    opening:
      "“선이 없는데 휴대폰은 어느 보드의 데이터를 받는지 어떻게 알까요?”",
    concepts: [
      {
        term: "핵심 개념",
        body: "Peripheral=자신을 알리는 Pico, Central=찾고 연결하는 폰, advertising=존재 알림, service=기능 묶음, characteristic=데이터 통로, notify=갱신 알림.",
      },
    ],
    practice: [
      "교사 제공 BLE 진단 코드 실행",
      "키트명 확인",
      "Galaxy Chrome 링크 열기",
      "연결 버튼",
      "해당 키트 선택",
      "테스트 카운터 수신",
      "끊기/다시 연결.",
    ],
    wiringIds: ["cds", "dht", "led", "buzzer"],
    codeFiles: ["diagnostics/ble_counter.py", "firmware/ble_peripheral.py"],
    failures: [
      {
        symptom: "기기가 검색되지 않음",
        cause: "다른 Central 연결 또는 권한 문제",
        fix: "다른 폰 연결을 해제하고 Galaxy Chrome·OS Bluetooth·권한을 확인한다.",
      },
      {
        symptom: "연결되지만 센서 카드가 비어 있음",
        cause: "3차시 진단 카운터 코드 실행 중",
        fix: "DIAGNOSTIC 카운터 증가만 확인한다. 실측이 아니므로 수집하지 않는다.",
      },
      {
        symptom: "서비스 연결 실패",
        cause: "UUID 또는 aioble 패키지 불일치",
        fix: "교사 검증 이미지와 config.py의 UUID를 대조하고 전체 aioble 의존성을 확인한다.",
      },
    ],
    teacherPrompts: [
      {
        question: "왜 페이지를 열자마자 연결창을 띄우지 않을까요?",
        expected: "사용자 클릭과 권한 동의가 필요합니다.",
      },
      {
        question: "광고를 보는 것과 데이터 알림을 받는 것은 같은 단계일까요?",
        expected: "광고 후 연결·서비스 탐색·notify 구독이 필요합니다.",
      },
    ],
    assessments: [
      {
        id: "L3-Q1",
        question: "Pico와 Galaxy의 역할?",
        answer: "Peripheral/Central.",
        criteria: ["Peripheral/Central."],
      },
      {
        id: "L3-Q2",
        question: "notify의 뜻?",
        answer: "특성값 갱신을 연결 기기에 알림.",
        criteria: ["특성값 갱신을 연결 기기에 알림."],
      },
      {
        id: "L3-Q3",
        question: "같은 보드에 두 폰이 안 붙는 이유?",
        answer: "본 수업은 단일 연결 설계.",
        criteria: ["본 수업은 단일 연결 설계."],
      },
    ],
    successCriteria: ["올바른 키트 카운터 수신, 1회 재연결, 역할 설명."],
    deliverables: [
      "BLE 연결 체크. BLE 내부 코드를 전부 외우도록 평가하지 않는다.",
    ],
  },
  {
    id: 4,
    title: "BLE 센서 대시보드",
    objectives: [
      "실측 10회 이상, 세 카드 단위 표시, stale/센서 오류 상태 구별, CSV 파일 저장.",
    ],
    timeline: [
      {
        start: 0,
        end: 5,
        title: "도입",
        actions: ["카운터 대신 실제 교실 값을 받는 차이를 질문한다."],
      },
      {
        start: 5,
        end: 13,
        title: "개념",
        actions: [
          "JSON key/value, 단위, 한 메시지와 여러 BLE 조각의 차이. 조각 헤더 암기는 요구하지 않는다.",
        ],
      },
      {
        start: 13,
        end: 35,
        title: "실습",
        actions: [
          "통합 센서 송신 코드 실행 → light/temperature/humidity 카드 확인 → CDS 가림 반응 → 마지막 수신 시각·측정주기 확인 → 짧은 회차 수집 → CSV 1회 다운로드.",
        ],
      },
      {
        start: 35,
        end: 45,
        title: "실패·회복",
        actions: [
          "DHT를 분리했을 때 error/null을 관찰하고 다시 연결한다. 파싱 오류가 전체 화면을 멈추면 안 된다. 폰 배경 전환 후 stale 안내를 확인한다.",
        ],
      },
      {
        start: 45,
        end: 50,
        title: "평가",
        actions: [
          "Q1 light의 단위? 정답 raw. Q2 마지막 수신이 오래되면? 정답 오래된 값 표시와 수집 중단. Q3 알림 10개가 측정 10회인가? 정답 조각일 수 있어 아님.",
        ],
      },
    ],
    opening: "카운터 대신 실제 교실 값을 받는 차이를 질문한다.",
    concepts: [
      {
        term: "핵심 개념",
        body: "JSON key/value, 단위, 한 메시지와 여러 BLE 조각의 차이. 조각 헤더 암기는 요구하지 않는다.",
      },
    ],
    practice: [
      "통합 센서 송신 코드 실행",
      "light/temperature/humidity 카드 확인",
      "CDS 가림 반응",
      "마지막 수신 시각·측정주기 확인",
      "짧은 회차 수집",
      "CSV 1회 다운로드.",
    ],
    wiringIds: ["cds", "dht", "led", "buzzer"],
    codeFiles: [
      "firmware/config.py",
      "firmware/sensors.py",
      "firmware/main.py",
    ],
    failures: [
      {
        symptom: "숫자가 남아 있지만 갱신되지 않음",
        cause: "폰 배경 전환 또는 BLE 수신 중단",
        fix: "STALE와 마지막 수신 경과를 확인하고 재연결 후 새 회차를 시작한다.",
      },
      {
        symptom: "센서값이 null",
        cause: "DHT 분리 또는 읽기 오류",
        fix: "전원 분리 후 회로를 확인한다. 0/이전값으로 채우지 않는다.",
      },
      {
        symptom: "파싱 오류 개수가 증가",
        cause: "조각 손실·순서 오류·스키마 불일치",
        fix: "같은 UUID/프레임 v1 코드를 확인하고 다음 완성 메시지의 회복을 관찰한다.",
      },
    ],
    teacherPrompts: [
      {
        question:
          "화면 숫자가 남아 있으면 지금도 측정 중이라고 할 수 있을까요?",
        expected: "9초 이상 수신이 없으면 stale이며 수집을 멈춥니다.",
      },
      {
        question: "JSON이 반만 왔을 때는 언제 화면을 바꿔야 할까요?",
        expected: "조각 전체를 재조립하고 스키마 검사를 통과한 뒤입니다.",
      },
    ],
    assessments: [
      {
        id: "L4-Q1",
        question: "light의 단위?",
        answer: "raw.",
        criteria: ["raw."],
      },
      {
        id: "L4-Q2",
        question: "마지막 수신이 오래되면?",
        answer: "오래된 값 표시와 수집 중단.",
        criteria: ["오래된 값 표시와 수집 중단."],
      },
      {
        id: "L4-Q3",
        question: "알림 10개가 측정 10회인가?",
        answer: "조각일 수 있어 아님.",
        criteria: ["조각일 수 있어 아님."],
      },
    ],
    successCriteria: [
      "실측 10회 이상, 세 카드 단위 표시, stale/센서 오류 상태 구별, CSV 파일 저장.",
    ],
    deliverables: ["첫 센서 CSV(라벨이 없으면 학습용에서 제외)와 연결 코드."],
  },
  {
    id: 5,
    title: "AI 학습 데이터 만들기",
    objectives: [
      "CSV 검사 통과, 네 상태 각각 독립 회차 4개 이상 확보 또는 구체적 부족 상태 기록. 부족하면 6차시 정식 학습 진입 전에 보충한다.",
    ],
    timeline: [
      {
        start: 0,
        end: 5,
        title: "도입",
        actions: [
          "“같은 환경에 서로 다른 정답을 붙이면 모델은 무엇을 배울까요?”",
        ],
      },
      {
        start: 5,
        end: 15,
        title: "개념",
        actions: [
          "feature/label, 수집 회차, 편향, class balance, 잘못된 값, 정답 유출. state와 label을 분리한다.",
        ],
      },
      {
        start: 15,
        end: 35,
        title: "실습",
        actions: [
          "센서 수치를 가린 상태에서 행동 라벨 합의 → 회차별 5개 측정 → 회차/라벨 분포 확인 → 사전 수집 실제 데이터와 비교 → 필요한 실제 자료 보충 → CSV 내보내기 → PC로 이동.",
        ],
      },
      {
        start: 35,
        end: 45,
        title: "실패·회복",
        actions: [
          "한 라벨만 많음, 같은 순간 반복측정, 예측을 정답으로 복사, 회차 label 혼재, DHT 오류행. 부족한 클래스는 교사가 준비한 출처 있는 실제 자료를 사용하고 사용 사실을 기록한다.",
        ],
      },
      {
        start: 45,
        end: 50,
        title: "평가",
        actions: [
          "Q1 feature 세 개와 label 하나를 구분하라. 정답 light/temp/humidity와 행동 상태. Q2 seq를 feature로 넣으면? 정답 상황 대신 측정순서를 학습할 수 있음. Q3 환기 label이 CO₂ 측정을 뜻하는가? 정답 아님.",
        ],
      },
    ],
    opening: "“같은 환경에 서로 다른 정답을 붙이면 모델은 무엇을 배울까요?”",
    concepts: [
      {
        term: "핵심 개념",
        body: "feature/label, 수집 회차, 편향, class balance, 잘못된 값, 정답 유출. state와 label을 분리한다.",
      },
    ],
    practice: [
      "센서 수치를 가린 상태에서 행동 라벨 합의",
      "회차별 5개 측정",
      "회차/라벨 분포 확인",
      "사전 수집 실제 데이터와 비교",
      "필요한 실제 자료 보충",
      "CSV 내보내기",
      "PC로 이동.",
    ],
    wiringIds: ["cds", "dht", "led", "buzzer"],
    codeFiles: ["firmware/main.py"],
    failures: [
      {
        symptom: "라벨/회차가 부족함",
        cause: "한 조건에서 연속 측정한 자료만 있음",
        fix: "다른 시간·조건의 실제 회차를 보충하고 교사 자료 출처를 기록한다.",
      },
      {
        symptom: "CSV 회차 충돌",
        cause: "동일 UUID/번호에 값 또는 label이 다름",
        fix: "회차 전체를 검토하고 사유와 함께 제외·재수집한다.",
      },
      {
        symptom: "라벨이 예측을 따라감",
        cause: "state를 정답으로 사용함",
        fix: "수치를 가린 상태에서 사람이 권고할 행동을 먼저 합의한다. 합의 불가는 unlabeled로 둔다.",
      },
    ],
    teacherPrompts: [
      {
        question: "정답은 사람이 정하는데 왜 학습된 규칙이라고 할까요?",
        expected:
          "사람은 label을 정하고 모델은 데이터에서 분기 기준을 찾습니다.",
      },
      {
        question: "연속 100행과 다른 날의 100행이 같을까요?",
        expected: "같은 순간의 연속값은 상관이 높아 독립 사례가 아닙니다.",
      },
    ],
    assessments: [
      {
        id: "L5-Q1",
        question: "feature 세 개와 label 하나를 구분하라",
        answer: "light/temp/humidity와 행동 상태.",
        criteria: ["light/temp/humidity와 행동 상태."],
      },
      {
        id: "L5-Q2",
        question: "seq를 feature로 넣으면?",
        answer: "상황 대신 측정순서를 학습할 수 있음.",
        criteria: ["상황 대신 측정순서를 학습할 수 있음."],
      },
      {
        id: "L5-Q3",
        question: "환기 label이 CO₂ 측정을 뜻하는가?",
        answer: "아님.",
        criteria: ["아님."],
      },
    ],
    successCriteria: [
      "CSV 검사 통과, 네 상태 각각 독립 회차 4개 이상 확보 또는 구체적 부족 상태 기록. 부족하면 6차시 정식 학습 진입 전에 보충한다.",
    ],
    deliverables: [
      "classroom_real.csv, 자료 출처·회차·클래스 분포 기록. synthetic로 부족을 메우지 않는다.",
    ],
  },
  {
    id: 6,
    title: "Google Colab에서 실제 학습",
    objectives: [
      "학습·평가 session 교집합 0, 실제 accuracy 출력, 한 오류 사례 해석, 모델 변환 검사 통과.",
    ],
    timeline: [
      {
        start: 0,
        end: 5,
        title: "도입",
        actions: ["“처음 보는 문제에도 맞히는지 어떻게 확인할까요?”"],
      },
      {
        start: 5,
        end: 13,
        title: "개념",
        actions: ["학습/평가 분리, Decision Tree, accuracy, baseline, 과적합."],
      },
      {
        start: 13,
        end: 35,
        title: "실습",
        actions: [
          "CSV 업로드·검사 → 회차별 분리 → fit → predict → accuracy와 혼동행렬 → export_text에서 한 경로 읽기 → 자동 변환 셀 실행 → model.py 다운로드.",
        ],
      },
      {
        start: 35,
        end: 45,
        title: "실패·회복",
        actions: [
          "Colab 계정/네트워크, label 오타, 부족한 회차, 학습 정확도만 보고하기, 정수화 단위 혼동. 계정 문제는 교사 실행 화면으로 과정을 학습하되 해당 모둠 독립 실행을 추후 보충 표시한다.",
        ],
      },
      {
        start: 45,
        end: 50,
        title: "평가",
        actions: [
          "Q1 test로 학습하면 안 되는 이유? 정답 새 자료 성능 평가가 무너짐. Q2 temperature_x10<=275 해석? 정답 27.5℃ 이하. Q3 모델과 다수 클래스 기준을 비교하는 이유? 정답 단순 찍기보다 나은지 확인.",
        ],
      },
    ],
    opening: "“처음 보는 문제에도 맞히는지 어떻게 확인할까요?”",
    concepts: [
      {
        term: "핵심 개념",
        body: "학습/평가 분리, Decision Tree, accuracy, baseline, 과적합.",
      },
    ],
    practice: [
      "CSV 업로드·검사",
      "회차별 분리",
      "fit",
      "predict",
      "accuracy와 혼동행렬",
      "export_text에서 한 경로 읽기",
      "자동 변환 셀 실행",
      "model.py 다운로드.",
    ],
    wiringIds: ["cds", "dht", "led", "buzzer"],
    codeFiles: [],
    failures: [
      {
        symptom: "학습 셀이 품질 검사에서 멈춤",
        cause: "source, 범위, 소수 자릿수, 클래스 또는 회차 부족",
        fix: "오류 원본을 수정하고 실제 자료를 보충한다. 검증 assert를 지우지 않는다.",
      },
      {
        symptom: "학습 정확도만 높음",
        cause: "과적합 또는 편중",
        fix: "회차별 test와 baseline·혼동행렬을 비교한다. test를 fit하거나 seed를 골라 성능을 꾸미지 않는다.",
      },
      {
        symptom: "Colab 실행 불가",
        cause: "계정/네트워크 준비 미완료",
        fix: "교사 화면으로 원리를 학습하고 해당 모둠 독립 실행을 추가 시간에 보충한다.",
      },
    ],
    teacherPrompts: [
      {
        question: "이 분기의 숫자는 누가 정했나요?",
        expected: "model.tree_에 저장된 학습 결과입니다.",
      },
      {
        question: "90% 정확도인데 한 상태를 전혀 못 맞힐 수도 있나요?",
        expected: "다수 클래스 편중이면 가능합니다. 혼동행렬을 봅니다.",
      },
    ],
    assessments: [
      {
        id: "L6-Q1",
        question: "test로 학습하면 안 되는 이유?",
        answer: "새 자료 성능 평가가 무너짐.",
        criteria: ["새 자료 성능 평가가 무너짐."],
      },
      {
        id: "L6-Q2",
        question: "temperature_x10<=275 해석?",
        answer: "27.5℃ 이하.",
        criteria: ["27.5℃ 이하."],
      },
      {
        id: "L6-Q3",
        question: "모델과 다수 클래스 기준을 비교하는 이유?",
        answer: "단순 찍기보다 나은지 확인.",
        criteria: ["단순 찍기보다 나은지 확인."],
      },
    ],
    successCriteria: [
      "학습·평가 session 교집합 0, 실제 accuracy 출력, 한 오류 사례 해석, 모델 변환 검사 통과.",
    ],
    deliverables: [
      "실행한 ipynb, model.py, model-meta.json, model-tests.json. 정확도 일정 수치 달성을 완료 조건으로 삼지 않는다.",
    ],
  },
  {
    id: 7,
    title: "Pico Edge AI",
    objectives: [
      "실기 model-tests 전부 일치, 실측 예측 출력, 모델 없는 경우 오류 표시, 임계값 출처 설명.",
    ],
    timeline: [
      {
        start: 0,
        end: 5,
        title: "도입",
        actions: ["“인터넷을 끊으면 판단도 멈출까요?”"],
      },
      {
        start: 5,
        end: 13,
        title: "개념",
        actions: [
          "Colab의 학습과 Pico의 추론, 학습된 if와 사람이 임의 작성한 if의 차이.",
        ],
      },
      {
        start: 13,
        end: 35,
        title: "실습",
        actions: [
          "model.py를 Thonny로 Pico 루트에 저장 → MODEL_ID 확인 → 고정 테스트 입력으로 원본과 일치 확인 → 실제 센서로 predict → LED와 부저 상태 표시 확인.",
        ],
      },
      {
        start: 35,
        end: 45,
        title: "실패·회복",
        actions: [
          "PC에만 model.py 저장, import 캐시/재시작, feature 순서 바뀜, 센서 배선 반대, models 누락 시 GOOD fallback. 교사 예비 키트에서도 학습 출처를 확인한 모델만 사용한다.",
        ],
      },
      {
        start: 45,
        end: 50,
        title: "평가",
        actions: [
          "Q1 학습 장소/추론 장소? 정답 Colab/Pico. Q2 임계값을 손으로 바꾸면 같은 학습 모델인가? 정답 아님. Q3 LED 출력 정책도 AI가 배웠나? 정답 사람이 정한 상태 표현.",
        ],
      },
    ],
    opening: "“인터넷을 끊으면 판단도 멈출까요?”",
    concepts: [
      {
        term: "핵심 개념",
        body: "Colab의 학습과 Pico의 추론, 학습된 if와 사람이 임의 작성한 if의 차이.",
      },
    ],
    practice: [
      "model.py를 Thonny로 Pico 루트에 저장",
      "MODEL_ID 확인",
      "고정 테스트 입력으로 원본과 일치 확인",
      "실제 센서로 predict",
      "LED와 부저 상태 표시 확인.",
    ],
    wiringIds: ["cds", "dht", "led", "buzzer"],
    codeFiles: [
      "firmware/model.py",
      "diagnostics/model_selftest.py",
      "firmware/outputs.py",
    ],
    failures: [
      {
        symptom: "MODEL_MISSING",
        cause: "미학습 stub 또는 Pico 루트에 model.py 없음",
        fix: "실제 Colab 생성물을 Thonny로 Pico에 저장하고 재시작한다.",
      },
      {
        symptom: "MODEL_ERROR 또는 selftest 불일치",
        cause: "feature 순서·전처리·파일 출처가 다름",
        fix: "모델 세 파일의 ID를 확인하고 원본 노트북에서 다시 변환한다. 임계값 수동 수정 금지.",
      },
      {
        symptom: "LED가 바로 바뀌지 않음",
        cause: "3회 연속 안정화 정책 적용",
        fix: "BLE state는 원시 예측임을 설명하고 3회 일치 후 출력을 확인한다. 소리는 기본 OFF다.",
      },
    ],
    teacherPrompts: [
      {
        question: "if문이 보이면 무조건 AI가 아닌가요?",
        expected:
          "학습 데이터로 얻은 분기라면 학습 모델입니다. 출처가 중요합니다.",
      },
      {
        question: "Pico는 지금 규칙을 새로 배우고 있나요?",
        expected: "학습은 Colab에서 끝났고 Pico는 추론만 합니다.",
      },
    ],
    assessments: [
      {
        id: "L7-Q1",
        question: "학습 장소/추론 장소?",
        answer: "Colab/Pico.",
        criteria: ["Colab/Pico."],
      },
      {
        id: "L7-Q2",
        question: "임계값을 손으로 바꾸면 같은 학습 모델인가?",
        answer: "아님.",
        criteria: ["아님."],
      },
      {
        id: "L7-Q3",
        question: "LED 출력 정책도 AI가 배웠나?",
        answer: "사람이 정한 상태 표현.",
        criteria: ["사람이 정한 상태 표현."],
      },
    ],
    successCriteria: [
      "실기 model-tests 전부 일치, 실측 예측 출력, 모델 없는 경우 오류 표시, 임계값 출처 설명.",
    ],
    deliverables: [
      "모델 ID와 실기 테스트 결과. 소리는 교사 허용 모둠만 짧게 확인.",
    ],
  },
  {
    id: 8,
    title: "AI SMART CLASSROOM 통합",
    objectives: [
      "센서→Pico predict→출력→BLE→폰의 한 흐름 실제 시연, 새 실측 10회 이상 결과/오류 기록, 미지원 환경 안내, CSV/모델/해석 제출.",
    ],
    timeline: [
      {
        start: 0,
        end: 5,
        title: "도입",
        actions: ["센서→학습→Pico 추론→스마트폰 경로를 학생이 설명한다."],
      },
      {
        start: 5,
        end: 10,
        title: "개념·계획",
        actions: [
          "최종 검증은 학습·기존 test와 분리한 새 관찰이다. 인터넷 없는 Pico 추론과 웹 페이지 로딩을 구분한다.",
        ],
      },
      {
        start: 10,
        end: 30,
        title: "실습",
        actions: [
          "새 조건/시간에서 라벨을 먼저 기록 → 센서 10회 이상 추론 → Pico state/LED/폰 결과 비교 → 예상과 다른 사례 분석 → 연결 끊김·복구.",
        ],
      },
      {
        start: 30,
        end: 40,
        title: "발표·상호검증",
        actions: [
          "2분 설명+1분 질문을 모둠끼리 병렬 진행. 모든 모둠을 교사가 순차 평가하는 시간으로 계산하지 않는다. 교사는 5~7차시 관찰 기록과 8차시 핵심 시연을 합쳐 채점한다.",
        ],
      },
      {
        start: 40,
        end: 45,
        title: "실패·회복",
        actions: [
          "새 데이터 성능 저하, 영역 밖, 상태 흔들림, 재연결 실패를 한 가지 선택해 개선 계획 작성.",
        ],
      },
      {
        start: 45,
        end: 50,
        title: "평가·정리",
        actions: [
          "Q1 ‘이 모델은 어떤 라벨을 누구의 자료에서 배웠는가?’ Q2 ‘틀린 판단 하나와 가능한 원인은?’ Q3 ‘정확도를 올리려면 어떤 새 데이터를 모을까?’ 모범 방향: 출처·라벨 기준·부족 조건을 구체적으로 설명.",
        ],
      },
    ],
    opening: "센서→학습→Pico 추론→스마트폰 경로를 학생이 설명한다.",
    concepts: [
      {
        term: "핵심 개념",
        body: "최종 검증은 학습·기존 test와 분리한 새 관찰이다. 인터넷 없는 Pico 추론과 웹 페이지 로딩을 구분한다.",
      },
    ],
    practice: [
      "새 조건/시간에서 라벨을 먼저 기록",
      "센서 10회 이상 추론",
      "Pico state/LED/폰 결과 비교",
      "예상과 다른 사례 분석",
      "연결 끊김·복구.",
    ],
    wiringIds: ["cds", "dht", "led", "buzzer"],
    codeFiles: ["firmware/main.py", "firmware/outputs.py"],
    failures: [
      {
        symptom: "OUT_OF_DOMAIN",
        cause: "새 입력이 학습 min/max 밖",
        fix: "출력이 꺼지는지 확인하고 해당 조건의 실제 학습 자료를 보충한다.",
      },
      {
        symptom: "새 자료에서 오분류 증가",
        cause: "학습 조건 편중·보드/배선 차이·사람 라벨 불일치",
        fix: "구체적 오류 조건을 기록하고 같은 키트의 다른 시간 회차를 수집한다.",
      },
      {
        symptom: "최종 발표 중 재연결 실패",
        cause: "다른 Central 연결 또는 권한/배경 전환",
        fix: "기존 연결을 종료하고 수동 재연결·새 회차로 복구한다. 실패 진단도 증거로 남긴다.",
      },
    ],
    teacherPrompts: [
      {
        question: "어떤 출처와 라벨로 학습했나요?",
        expected: "사람이 관찰한 행동 label과 실제 자료 출처를 설명합니다.",
      },
      {
        question: "틀린 판단의 원인과 보충할 자료는 무엇인가요?",
        expected: "오분류 조건·센서 한계·보충할 새 회차를 연결합니다.",
      },
    ],
    assessments: [
      {
        id: "L8-Q1",
        question: "이 모델은 어떤 라벨을 누구의 자료에서 배웠는가?",
        answer:
          "실제 자료 출처·같은 키트 여부·사람이 합의한 행동 라벨을 구체적으로 설명한다.",
        criteria: [
          "실제 자료 출처·같은 키트 여부·사람이 합의한 행동 라벨을 구체적으로 설명한다.",
        ],
      },
      {
        id: "L8-Q2",
        question: "틀린 판단 하나와 가능한 원인은?",
        answer:
          "새 실측 사례를 제시하고 조건 편중·센서 한계·라벨 합의 중 관련 원인을 설명한다.",
        criteria: [
          "새 실측 사례를 제시하고 조건 편중·센서 한계·라벨 합의 중 관련 원인을 설명한다.",
        ],
      },
      {
        id: "L8-Q3",
        question: "정확도를 올리려면 어떤 새 데이터를 모을까?",
        answer:
          "부족한 라벨·시간·조건을 지목해 독립 회차 보충 계획을 제시한다.",
        criteria: [
          "부족한 라벨·시간·조건을 지목해 독립 회차 보충 계획을 제시한다.",
        ],
      },
    ],
    successCriteria: [
      "센서→Pico predict→출력→BLE→폰의 한 흐름 실제 시연, 새 실측 10회 이상 결과/오류 기록, 미지원 환경 안내, CSV/모델/해석 제출.",
    ],
    deliverables: [
      "최종 실측 검증 CSV(학습 CSV와 구분), 간단 결과표, 한계와 개선 3문장.",
    ],
  },
];
