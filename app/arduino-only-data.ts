export type BridgeLesson = {
  id: number; title: string; concept: string; input: string; output: string;
  parts: string[]; circuit: string[]; mission: string[];
  functions: { arduino: string; meaning: string; pico: string }[];
  checks: string[]; teacherPoint: string; picoTitle: string; picoMission: string;
};

export const arduinoBridgeLessons: BridgeLesson[] = [
  {
    id: 1, title: "외부 LED 깜빡이기", input: "시간", output: "LED",
    concept: "가장 단순한 디지털 출력으로 회로·핀·시간의 관계를 익힙니다.",
    parts: ["Arduino Uno", "5mm LED", "220Ω 또는 330Ω 저항", "브레드보드", "점퍼선"],
    circuit: ["LED의 긴 다리를 저항을 거쳐 Arduino 3번 핀에 연결한다.", "LED의 짧은 다리를 GND에 연결한다.", "전원을 넣기 전에 LED 방향과 저항의 직렬 연결을 확인한다."],
    mission: ["3번 핀을 출력으로 준비한다.", "LED를 1초 동안 켜고 1초 동안 끈다.", "이 동작이 계속 반복되도록 직접 작성한다.", "성공 후 0.2초로 바꾸어 차이를 관찰한다."],
    functions: [{arduino:"pinMode(핀, OUTPUT)",meaning:"핀을 출력으로 준비",pico:"Pin(핀, Pin.OUT)"},{arduino:"digitalWrite(핀, HIGH/LOW)",meaning:"LED 켜기/끄기",pico:"led.value(1/0)"},{arduino:"delay(밀리초)",meaning:"정한 시간만큼 기다리기",pico:"sleep(초)"}],
    checks: ["3번 핀 사용", "LED 저항 직렬 연결", "1초 ON/OFF 반복"],
    teacherPoint: "220Ω은 빨강-빨강-갈색, 330Ω은 주황-주황-갈색입니다. 세 번째 띠는 뒤에 붙는 0의 개수입니다.",
    picoTitle: "GP15 LED 깜빡이기", picoMission: "같은 LED와 저항을 GP15에 옮기고 MicroPython의 Pin과 sleep으로 같은 결과를 만든다."
  },
  {
    id: 2, title: "RGB LED와 PWM 밝기", input: "밝기값", output: "RGB LED",
    concept: "디지털 ON/OFF와 PWM의 0~255 밝기 제어를 비교합니다.",
    parts: ["Arduino Uno", "RGB LED", "220Ω 저항 3개", "브레드보드", "점퍼선"],
    circuit: ["RGB LED의 공통 단자 종류를 확인하고 GND에 연결한다.", "R·G·B 다리를 각각 220Ω 저항을 거쳐 PWM 핀 9·10·11에 연결한다.", "각 색의 다리 순서는 부품 사양과 Tinkercad 표시를 확인한다."],
    mission: ["빨강·초록·파랑을 1초씩 차례로 켠다.", "analogWrite 값을 바꾸어 한 색의 밝기를 세 단계로 표현한다.", "두 색을 동시에 출력해 새로운 색을 만든다."],
    functions: [{arduino:"analogWrite(핀, 0~255)",meaning:"PWM 켜짐 비율로 밝기 조절",pico:"PWM.duty_u16(0~65535)"},{arduino:"delay(밀리초)",meaning:"색을 보여 줄 시간",pico:"sleep(초)"}],
    checks: ["PWM 핀 9·10·11", "색마다 저항 1개", "값 증가와 밝기 비교"],
    teacherPoint: "Uno의 analogWrite는 실제 연속 전압이 아니라 빠른 ON/OFF의 비율인 PWM입니다.",
    picoTitle: "Pico PWM으로 RGB 밝기", picoMission: "같은 RGB LED를 PWM 가능한 GPIO에 연결하고 duty_u16 값으로 같은 색과 밝기를 만든다."
  },
  {
    id: 3, title: "버튼으로 LED 제어", input: "누름 버튼", output: "LED",
    concept: "디지털 입력을 읽고 조건에 따라 출력을 결정하는 입력→처리→출력 구조를 만듭니다.",
    parts: ["Arduino Uno", "누름 버튼", "5mm LED", "220Ω 저항", "브레드보드", "점퍼선"],
    circuit: ["버튼이 브레드보드 중앙 홈을 가로지르도록 꽂는다.", "버튼 한쪽은 GND, 반대쪽은 2번 핀에 연결한다.", "LED는 220Ω 저항과 직렬로 3번 핀과 GND 사이에 연결한다."],
    mission: ["2번 핀을 INPUT_PULLUP으로 준비한다.", "버튼 값을 읽어 변수에 저장한다.", "누르면 LED가 켜지고 놓으면 꺼지게 작성한다.", "왜 누른 상태가 LOW인지 설명한다."],
    functions: [{arduino:"pinMode(핀, INPUT_PULLUP)",meaning:"내부 풀업 입력 준비",pico:"Pin(핀, Pin.IN, Pin.PULL_UP)"},{arduino:"digitalRead(핀)",meaning:"HIGH/LOW 읽기",pico:"button.value()"},{arduino:"if / else",meaning:"입력값에 따라 출력 선택",pico:"if / else"}],
    checks: ["버튼 중앙 홈 배치", "INPUT_PULLUP 사용", "누를 때만 LED 켜짐"],
    teacherPoint: "INPUT_PULLUP에서는 평상시 HIGH이고, 버튼을 눌러 GND와 연결되면 LOW가 됩니다.",
    picoTitle: "Pico 버튼 입력", picoMission: "버튼과 LED를 Pico에 옮기고 Pin.PULL_UP과 value()로 같은 동작을 만든다."
  },
  {
    id: 4, title: "CDS 조도센서와 LED", input: "CDS 조도센서", output: "LED",
    concept: "연속적으로 변하는 전압을 ADC로 읽고 임계값으로 밝음과 어두움을 나눕니다.",
    parts: ["Arduino Uno", "5mm 5528 CDS", "10kΩ 저항", "LED", "220Ω 저항", "브레드보드"],
    circuit: ["CDS와 10kΩ 저항을 5V와 GND 사이에 직렬로 연결한다.", "두 부품이 만나는 지점을 A0에 연결한다.", "LED는 220Ω 저항과 직렬로 3번 핀에 연결한다."],
    mission: ["A0 값을 읽어 시리얼 모니터에 출력한다.", "손으로 CDS를 가렸을 때 값의 변화를 기록한다.", "교실에 맞는 기준값을 정하고 어두울 때 LED가 켜지게 한다."],
    functions: [{arduino:"analogRead(A0)",meaning:"0~1023 ADC 값 읽기",pico:"ADC(핀).read_u16()"},{arduino:"Serial.println(값)",meaning:"센서값 확인",pico:"print(값)"},{arduino:"if(값 < 기준)",meaning:"임계값으로 상태 구분",pico:"if 값 < 기준:"}],
    checks: ["전압분배 회로", "빛에 따른 A0 변화", "측정한 기준값 사용"],
    teacherPoint: "CDS 값의 증가·감소 방향은 CDS와 10kΩ의 위치에 따라 반대가 될 수 있으므로 실제 측정값으로 조건을 정합니다.",
    picoTitle: "Pico ADC로 밝기 판단", picoMission: "전원을 3.3V로 바꾸고 read_u16으로 밝기를 읽어 같은 자동 조명을 만든다."
  },
  {
    id: 5, title: "시리얼 A·B로 LED 제어", input: "문자 A·B", output: "LED",
    concept: "도착한 문자 한 개를 확인하고 읽은 뒤 조건에 따라 LED를 제어합니다.",
    parts: ["Arduino Uno", "5mm LED", "220Ω 저항", "브레드보드", "USB 데이터 케이블"],
    circuit: ["LED의 긴 다리를 220Ω 저항을 거쳐 3번 핀에 연결한다.", "LED의 짧은 다리를 GND에 연결한다.", "USB를 연결하고 시리얼 모니터를 9600 baud로 연다."],
    mission: ["도착한 데이터가 있는지 먼저 확인한다.", "문자 한 개를 읽어 변수에 저장한다.", "대문자 A를 보내면 LED를 켜고 B를 보내면 끈다.", "A는 ASCII 65, B는 ASCII 66임을 확인한다."],
    functions: [{arduino:"Serial.begin(9600)",meaning:"통신 속도 설정",pico:"USB 연결 후 input()/sys.stdin"},{arduino:"Serial.available()",meaning:"도착 데이터 확인",pico:"select.poll()로 입력 확인"},{arduino:"Serial.read()",meaning:"문자 한 개 읽기",pico:"input() 또는 sys.stdin.read(1)"}],
    checks: ["양쪽 9600 baud", "available 후 read", "대문자 A·B 동작"],
    teacherPoint: "생각 순서는 ‘도착 확인 → 한 글자 읽기 → 변수 저장 → A/B 비교’ 네 단계입니다.",
    picoTitle: "Pico USB 시리얼 명령", picoMission: "Thonny Shell에서 A와 B를 입력해 Pico LED를 제어하고 Arduino의 available/read 방식과 비교한다."
  },
  {
    id: 6, title: "초음파 거리센서와 LED", input: "HC-SR04 거리", output: "LED",
    concept: "초음파 왕복 시간을 거리로 바꾸고 기준 거리 안팎을 LED로 표시합니다.",
    parts: ["Arduino Uno", "HC-SR04", "LED", "220Ω 저항", "브레드보드", "점퍼선"],
    circuit: ["HC-SR04의 VCC는 5V, GND는 GND에 연결한다.", "TRIG는 8번, ECHO는 7번 핀에 연결한다.", "LED는 220Ω 저항과 직렬로 3번 핀에 연결한다."],
    mission: ["TRIG에서 짧은 신호를 보낸다.", "ECHO의 HIGH 시간을 읽어 cm 거리로 계산한다.", "20cm보다 가까우면 LED가 켜지게 한다.", "시리얼 모니터에서 거리와 조건 결과를 확인한다."],
    functions: [{arduino:"pulseIn(ECHO, HIGH)",meaning:"초음파 왕복 시간 측정",pico:"time_pulse_us(echo, 1)"},{arduino:"시간 × 0.034 / 2",meaning:"왕복 시간을 cm로 변환",pico:"시간 * 0.0343 / 2"},{arduino:"if(거리 < 20)",meaning:"기준 거리 판단",pico:"if 거리 < 20:"}],
    checks: ["VCC·GND·TRIG·ECHO", "거리 계산 ÷2", "20cm 전후 LED 변화"],
    teacherPoint: "Pico는 3.3V 입력 장치이므로 HC-SR04 ECHO의 5V 신호를 저항 분압해 낮춰야 합니다.",
    picoTitle: "Pico 초음파 거리 경보", picoMission: "ECHO에 안전한 전압분배를 적용하고 time_pulse_us로 같은 20cm 경보를 만든다."
  }
];
