export type ArduinoCourseLesson = {
  id: number;
  title: string;
  subtitle: string;
  tinkercad?: { title: string; description: string; url: string };
  input: string;
  process: string;
  output: string;
  objectives: string[];
  concepts: { title: string; body: string; exam: string }[];
  parts: string[];
  wiring: { from: string; to: string; note: string }[];
  steps: string[];
  safety: string[];
  code: string;
  extension?: { title: string; description: string; code: string };
  lineNotes: { code: string; meaning: string; role: "입력" | "처리" | "출력" | "준비" }[];
  expected: string;
  challenge: string;
  quiz: { question: string; options: string[]; answer: number; explanation: string };
  examPrompts: { type: string; prompt: string; answer: string }[];
};

export const arduinoCourseLessons: ArduinoCourseLesson[] = [
  {
    id: 1,
    title: "LED로 배우는 디지털 출력과 PWM",
    subtitle: "LED를 켜고 끄는 디지털 출력에서 시작해 밝기를 단계적으로 바꾸는 PWM 출력까지 비교합니다.",
    tinkercad: {
      title: "LED 깜빡이기",
      description: "학교 Tinkercad 수업의 활동 회로를 열어 LED 출력 코드를 실행하고 값을 바꿉니다.",
      url: "https://www.tinkercad.com/classrooms/dky0pTDB1Aj/activities/bSv6W8qlaJ4",
    },
    input: "시간과 반복 횟수",
    process: "HIGH/LOW 판단·0~255 밝기 계산",
    output: "일반 LED·RGB LED의 빛",
    objectives: [
      "출력 핀을 OUTPUT으로 설정하는 이유를 설명한다.",
      "digitalWrite()와 analogWrite()의 결과 차이를 비교한다.",
      "LED에 전류 제한 저항을 연결해야 하는 이유를 말한다.",
    ],
    concepts: [
      {
        title: "디지털 출력",
        body: "digitalWrite()는 출력 핀을 HIGH 또는 LOW 두 상태로 제어합니다. HIGH는 약 5V, LOW는 약 0V에 해당합니다.",
        exam: "HIGH/LOW는 밝기값이 아니라 두 가지 논리 상태이다.",
      },
      {
        title: "PWM 출력",
        body: "analogWrite()는 PWM 핀을 매우 빠르게 켜고 끄며 평균 출력의 크기를 조절합니다. Uno에서는 0~255 값을 사용합니다.",
        exam: "analogWrite()는 실제 연속 전압을 만드는 DAC가 아니라 펄스의 켜짐 비율을 바꾸는 PWM이다.",
      },
      {
        title: "전류 제한 저항",
        body: "LED는 전류가 너무 많이 흐르면 손상될 수 있으므로 보통 220Ω~330Ω 저항을 직렬로 연결합니다.",
        exam: "저항은 LED와 직렬로 연결해 흐르는 전류를 제한한다.",
      },
      {
        title: "RGB LED",
        body: "빨강·초록·파랑 LED가 한 부품 안에 들어 있습니다. 세 채널의 PWM 값을 조합하면 여러 색을 표현할 수 있습니다.",
        exam: "RGB 각 채널은 0~255로 제어하며 공통 단자의 종류를 확인해야 한다.",
      },
    ],
    parts: ["Arduino Uno", "브레드보드", "LED", "220Ω~330Ω 저항", "점퍼선", "USB 데이터 케이블"],
    wiring: [
      { from: "Arduino D10(PWM)", to: "저항의 한쪽", note: "D10은 ~ 표시가 있는 PWM 출력 핀" },
      { from: "저항의 다른 쪽", to: "LED 긴 다리(애노드)", note: "저항은 LED 앞뒤 어느 쪽에 두어도 직렬이면 됨" },
      { from: "LED 짧은 다리(캐소드)", to: "Arduino GND", note: "LED 방향을 반대로 꽂으면 켜지지 않음" },
    ],
    steps: [
      "USB 케이블을 분리한 상태에서 D10-저항-LED-GND 순서로 연결한다.",
      "Arduino IDE에서 보드와 포트를 선택하고 코드를 입력한다.",
      "컴파일로 문법 오류를 먼저 확인한 뒤 업로드한다.",
      "LED가 0.5초 간격으로 켜지고 꺼지는지 확인한다.",
      "PWM 밝기값이 0에서 255로 커질 때 실제 밝기 변화를 관찰한다.",
      "delay()와 brightness 증가값을 한 가지씩 바꾸고 결과를 기록한다.",
    ],
    safety: [
      "배선을 바꿀 때는 USB를 먼저 분리한다.",
      "LED에 전류 제한 저항 없이 5V를 직접 연결하지 않는다.",
      "일반 디지털 핀에는 모터처럼 큰 전류가 필요한 부품을 직접 연결하지 않는다.",
    ],
    code: `const int LED_PIN = 10;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // 디지털 출력: 켜기와 끄기
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);

  // PWM 출력: 서서히 밝아지기
  for (int brightness = 0; brightness <= 255; brightness += 5) {
    analogWrite(LED_PIN, brightness);
    delay(20);
  }

  // PWM 출력: 서서히 어두워지기
  for (int brightness = 255; brightness >= 0; brightness -= 5) {
    analogWrite(LED_PIN, brightness);
    delay(20);
  }
}`,
    extension: {
      title: "확장 실습 · RGB LED 세 가지 색",
      description: "공통 캐소드 RGB LED의 R·G·B 다리를 D9·D10·D11에 각각 연결하고 세 채널을 순서대로 켭니다.",
      code: `const int RED = 9;
const int GREEN = 10;
const int BLUE = 11;

void setup() {
  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(BLUE, OUTPUT);
}

void loop() {
  analogWrite(RED, 255);
  analogWrite(GREEN, 0);
  analogWrite(BLUE, 0);
  delay(1000);

  analogWrite(RED, 0);
  analogWrite(GREEN, 255);
  delay(1000);

  analogWrite(GREEN, 0);
  analogWrite(BLUE, 255);
  delay(1000);
}`,
    },
    lineNotes: [
      { code: "pinMode(LED_PIN, OUTPUT);", meaning: "D10 핀을 전압을 내보내는 출력 핀으로 준비한다.", role: "준비" },
      { code: "digitalWrite(..., HIGH);", meaning: "핀을 HIGH 상태로 만들어 LED를 켠다.", role: "출력" },
      { code: "delay(500);", meaning: "다음 명령으로 넘어가기 전에 500ms 동안 기다린다.", role: "처리" },
      { code: "for (... brightness += 5)", meaning: "밝기값을 0부터 255까지 5씩 증가시킨다.", role: "처리" },
      { code: "analogWrite(LED_PIN, brightness);", meaning: "계산한 밝기값을 PWM 출력으로 전달한다.", role: "출력" },
    ],
    expected: "LED가 한 번 깜빡인 뒤 서서히 밝아지고 다시 어두워지는 동작을 반복합니다.",
    challenge: "깜빡임을 0.2초로 바꾸고, 밝기 변화가 더 부드럽도록 증가값과 지연시간을 조절하세요.",
    quiz: {
      question: "Arduino Uno에서 analogWrite(10, 128)의 의미로 가장 알맞은 것은?",
      options: ["D10에 정확히 2.5V를 계속 출력한다.", "D10을 약 50%의 켜짐 비율로 빠르게 스위칭한다.", "D10에서 128V를 출력한다.", "D10을 아날로그 입력으로 바꾼다."],
      answer: 1,
      explanation: "Uno의 analogWrite()는 DAC 전압 출력이 아니라 PWM 듀티비를 조절합니다. 128은 255의 약 절반입니다.",
    },
    examPrompts: [
      { type: "개념형", prompt: "digitalWrite()와 analogWrite()의 차이를 서술하시오.", answer: "digitalWrite()는 HIGH/LOW 두 상태를 출력하고, analogWrite()는 PWM의 켜짐 비율을 0~255로 조절한다." },
      { type: "코드형", prompt: "delay(500)을 delay(1000)으로 바꾸면 LED 동작은 어떻게 변하는가?", answer: "각 상태를 유지하는 시간이 0.5초에서 1초로 늘어나 깜빡임 속도가 느려진다." },
      { type: "회로형", prompt: "LED와 직렬로 저항을 연결하는 이유를 쓰시오.", answer: "LED에 과도한 전류가 흐르는 것을 막아 LED와 보드를 보호하기 위해서이다." },
    ],
  },
  {
    id: 2,
    title: "버튼과 시리얼로 배우는 디지털 입력",
    subtitle: "버튼과 컴퓨터의 문자를 입력으로 받아 조건을 판단하고 LED 출력으로 연결합니다.",
    input: "버튼의 HIGH/LOW·시리얼 문자",
    process: "digitalRead()·조건 판단",
    output: "LED 켜기·끄기",
    objectives: [
      "입력 장치와 출력 장치의 역할을 구분한다.",
      "digitalRead()가 반환하는 HIGH와 LOW를 조건문에 사용한다.",
      "풀다운 저항이 입력 핀의 불안정한 상태를 막는 원리를 설명한다.",
    ],
    concepts: [
      {
        title: "디지털 입력",
        body: "digitalRead()는 입력 핀의 상태를 HIGH 또는 LOW로 읽습니다. 버튼을 누른 상태와 떼어 놓은 상태를 두 값으로 구분할 수 있습니다.",
        exam: "digitalRead()의 반환값은 HIGH 또는 LOW이다.",
      },
      {
        title: "풀다운 저항",
        body: "버튼을 누르지 않았을 때 입력 핀이 공중에 떠서 값이 흔들리지 않도록 10kΩ 정도의 저항으로 GND에 연결합니다.",
        exam: "풀다운 저항은 기본 상태를 LOW로 확정한다.",
      },
      {
        title: "시리얼 입력",
        body: "Serial.available()로 도착한 데이터가 있는지 확인하고 Serial.read()로 문자 한 개를 읽습니다.",
        exam: "문자 '1'과 숫자 1은 서로 다른 데이터이다.",
      },
      {
        title: "입력→처리→출력",
        body: "버튼 상태를 읽고 조건문으로 판단한 뒤 LED를 제어합니다. 이것이 피지컬 컴퓨팅의 가장 기본적인 제어 흐름입니다.",
        exam: "digitalRead는 입력, if는 처리, digitalWrite는 출력에 해당한다.",
      },
    ],
    parts: ["Arduino Uno", "푸시버튼", "LED", "220Ω 저항", "10kΩ 풀다운 저항", "브레드보드", "점퍼선"],
    wiring: [
      { from: "Arduino 5V", to: "버튼 한쪽", note: "버튼을 누르면 D2에 HIGH가 전달됨" },
      { from: "버튼 반대쪽", to: "Arduino D2", note: "버튼 상태를 읽는 입력선" },
      { from: "Arduino D2", to: "10kΩ 저항 → GND", note: "버튼을 떼었을 때 기본값을 LOW로 고정" },
      { from: "Arduino D13", to: "LED 또는 내장 LED", note: "외부 LED는 반드시 전류 제한 저항 사용" },
    ],
    steps: [
      "USB를 분리하고 버튼이 브레드보드 중앙 홈을 가로지르도록 꽂는다.",
      "5V-버튼-D2와 D2-10kΩ-GND의 풀다운 회로를 만든다.",
      "D13 내장 LED를 사용하거나 외부 LED와 저항을 연결한다.",
      "코드를 업로드하고 버튼을 누를 때만 LED가 켜지는지 확인한다.",
      "시리얼 모니터에서 0과 1의 변화를 관찰한다.",
      "확장 코드에서 o와 f를 입력해 컴퓨터 입력으로 LED를 제어한다.",
    ],
    safety: [
      "버튼의 내부 연결 방향을 확인하고, 5V와 GND가 버튼을 통해 직접 연결되지 않게 한다.",
      "입력 핀을 5V보다 높은 전압에 연결하지 않는다.",
      "배선 오류가 의심되면 즉시 USB를 분리한 뒤 전원→GND→핀 번호 순으로 점검한다.",
    ],
    code: `const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(BUTTON_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);
  Serial.println(buttonState);

  if (buttonState == HIGH) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }

  delay(20);
}`,
    extension: {
      title: "확장 실습 · 키보드 문자로 LED 제어",
      description: "시리얼 모니터에서 o를 보내면 LED가 켜지고 f를 보내면 꺼집니다. 전송 속도는 코드와 시리얼 모니터 모두 9600으로 맞춥니다.",
      code: `const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    char command = Serial.read();

    if (command == 'o') {
      digitalWrite(LED_PIN, HIGH);
    } else if (command == 'f') {
      digitalWrite(LED_PIN, LOW);
    }
  }
}`,
    },
    lineNotes: [
      { code: "pinMode(BUTTON_PIN, INPUT);", meaning: "D2를 외부 상태를 읽는 입력 핀으로 준비한다.", role: "준비" },
      { code: "digitalRead(BUTTON_PIN)", meaning: "버튼 회로의 전압 상태를 HIGH 또는 LOW로 읽는다.", role: "입력" },
      { code: "if (buttonState == HIGH)", meaning: "읽은 값이 HIGH인지 조건을 판단한다.", role: "처리" },
      { code: "digitalWrite(LED_PIN, HIGH);", meaning: "조건이 참일 때 LED를 켠다.", role: "출력" },
      { code: "Serial.println(buttonState);", meaning: "읽은 값을 시리얼 모니터로 보내 관찰한다.", role: "출력" },
    ],
    expected: "버튼을 누르면 LED가 켜지고 시리얼 모니터에는 1, 떼면 LED가 꺼지고 0이 표시됩니다.",
    challenge: "버튼을 눌렀을 때 LED가 켜지는 대신 한 번씩 상태가 반전되는 토글 동작을 설계하세요.",
    quiz: {
      question: "버튼을 누르지 않았을 때 입력 핀의 값을 LOW로 안정시키는 부품은?",
      options: ["전류 제한 저항", "풀다운 저항", "RGB LED", "PWM 핀"],
      answer: 1,
      explanation: "풀다운 저항은 입력 핀을 GND 쪽으로 연결해 버튼을 누르지 않은 기본 상태를 LOW로 확정합니다.",
    },
    examPrompts: [
      { type: "흐름형", prompt: "버튼으로 LED를 켜는 과정에서 입력·처리·출력에 해당하는 코드를 각각 쓰시오.", answer: "입력은 digitalRead(), 처리는 if 조건문, 출력은 digitalWrite()이다." },
      { type: "회로형", prompt: "풀다운 저항이 없을 때 발생할 수 있는 문제를 서술하시오.", answer: "버튼을 누르지 않았을 때 입력 핀이 플로팅되어 HIGH와 LOW가 불규칙하게 읽힐 수 있다." },
      { type: "자료형", prompt: "Serial.read()로 읽은 '1'과 정수 1이 다른 이유를 쓰시오.", answer: "'1'은 문자 데이터이고 1은 정수 데이터이므로 저장 방식과 비교 방법이 다르다." },
    ],
  },
  {
    id: 3,
    title: "가변저항으로 배우는 아날로그 입력과 출력 변환",
    subtitle: "연속적으로 변하는 전압을 0~1023 숫자로 읽고 0~255 PWM 밝기로 변환합니다.",
    input: "가변저항의 0~5V 전압",
    process: "ADC 변환·map() 범위 변환",
    output: "LED의 0~255 PWM 밝기",
    objectives: [
      "아날로그 신호와 디지털 신호의 차이를 설명한다.",
      "Uno의 10비트 ADC 값 범위가 0~1023인 이유를 계산한다.",
      "0~1023 입력값을 0~255 출력값으로 변환해 LED 밝기를 제어한다.",
    ],
    concepts: [
      {
        title: "아날로그 입력",
        body: "가변저항의 가운데 단자에서는 손잡이 위치에 따라 0~5V 사이의 전압이 연속적으로 변합니다.",
        exam: "가변저항의 양 끝은 5V와 GND, 가운데 단자는 A0에 연결한다.",
      },
      {
        title: "10비트 ADC",
        body: "Uno는 입력 전압을 2¹⁰=1024단계로 나누므로 analogRead() 결과는 0부터 1023까지입니다.",
        exam: "단계 수는 1024개이고 최댓값은 1023이다.",
      },
      {
        title: "범위 변환",
        body: "입력은 0~1023, PWM 출력은 0~255이므로 map()을 사용해 두 범위를 대응시킵니다.",
        exam: "map(sensorValue, 0, 1023, 0, 255)의 입력·출력 범위를 구분한다.",
      },
      {
        title: "센서 기반 제어",
        body: "센서값을 읽고 필요한 범위로 변환한 다음 출력 장치를 제어하는 구조는 조도·온도·거리 센서에도 그대로 확장됩니다.",
        exam: "센서 종류가 달라도 입력→처리→출력 구조는 같다.",
      },
    ],
    parts: ["Arduino Uno", "10kΩ 가변저항", "LED", "220Ω 저항", "브레드보드", "점퍼선"],
    wiring: [
      { from: "가변저항 바깥 단자 1", to: "Arduino 5V", note: "전압 분배기의 위쪽" },
      { from: "가변저항 가운데 단자", to: "Arduino A0", note: "손잡이 위치에 따른 전압을 읽음" },
      { from: "가변저항 바깥 단자 2", to: "Arduino GND", note: "전압 분배기의 아래쪽" },
      { from: "Arduino D9(PWM)", to: "220Ω 저항 → LED → GND", note: "변환된 0~255 값으로 밝기 출력" },
    ],
    steps: [
      "USB를 분리하고 가변저항의 세 단자를 5V-A0-GND에 연결한다.",
      "D9-저항-LED-GND 순서로 출력 회로를 연결한다.",
      "코드를 업로드하고 시리얼 모니터의 속도를 9600으로 맞춘다.",
      "가변저항을 돌리며 sensorValue가 0~1023 사이에서 변하는지 확인한다.",
      "pwmValue가 0~255로 변하고 LED 밝기도 함께 바뀌는지 비교한다.",
      "입력값·변환값·실제 밝기의 관계를 표로 기록한다.",
    ],
    safety: [
      "가변저항의 5V와 GND 단자를 직접 이어 단락시키지 않는다.",
      "A0에는 0~5V 범위를 벗어나는 전압을 입력하지 않는다.",
      "Pico로 옮길 때는 3.3V 기준이므로 5V 신호를 GPIO에 직접 넣지 않는다.",
    ],
    code: `const int SENSOR_PIN = A0;
const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(SENSOR_PIN);
  int pwmValue = map(sensorValue, 0, 1023, 0, 255);

  analogWrite(LED_PIN, pwmValue);

  Serial.print("ADC: ");
  Serial.print(sensorValue);
  Serial.print("  PWM: ");
  Serial.println(pwmValue);

  delay(20);
}`,
    extension: {
      title: "확장 실습 · 입력 구간에 따라 LED 세 개 켜기",
      description: "0~1023을 세 구간으로 나누고 256·512·768 임계값을 넘을 때마다 LED를 추가로 켭니다.",
      code: `const int SENSOR_PIN = A0;
const int LEDS[] = {9, 10, 11};

void setup() {
  for (int i = 0; i < 3; i++) {
    pinMode(LEDS[i], OUTPUT);
  }
}

void loop() {
  int value = analogRead(SENSOR_PIN);
  digitalWrite(LEDS[0], value >= 256 ? HIGH : LOW);
  digitalWrite(LEDS[1], value >= 512 ? HIGH : LOW);
  digitalWrite(LEDS[2], value >= 768 ? HIGH : LOW);
}`,
    },
    lineNotes: [
      { code: "analogRead(SENSOR_PIN)", meaning: "A0의 전압을 0~1023 범위의 정수로 변환해 읽는다.", role: "입력" },
      { code: "map(sensorValue, 0, 1023, 0, 255)", meaning: "ADC 입력 범위를 PWM 출력 범위로 비례 변환한다.", role: "처리" },
      { code: "analogWrite(LED_PIN, pwmValue)", meaning: "변환된 값으로 D9의 PWM 켜짐 비율을 조절한다.", role: "출력" },
      { code: "Serial.print(sensorValue)", meaning: "실제 입력값을 시리얼 모니터로 보내 비교한다.", role: "출력" },
      { code: "delay(20)", meaning: "너무 빠른 출력과 불필요한 측정을 줄이기 위해 잠시 기다린다.", role: "처리" },
    ],
    expected: "가변저항을 돌리면 ADC 값이 0~1023, PWM 값이 0~255 사이에서 함께 변하며 LED 밝기가 조절됩니다.",
    challenge: "ADC 값이 500 이상일 때만 LED가 켜지도록 조건문을 추가하고, 500을 다른 임계값으로 바꾸어 비교하세요.",
    quiz: {
      question: "10비트 ADC의 단계 수와 analogRead()의 최댓값을 올바르게 짝지은 것은?",
      options: ["10단계·9", "256단계·255", "1024단계·1023", "1023단계·1024"],
      answer: 2,
      explanation: "2¹⁰은 1024단계이며 0부터 세기 때문에 최댓값은 1023입니다.",
    },
    examPrompts: [
      { type: "계산형", prompt: "10비트 ADC의 단계 수와 값의 범위를 쓰시오.", answer: "2¹⁰=1024단계이며 값의 범위는 0~1023이다." },
      { type: "코드형", prompt: "map(value, 0, 1023, 0, 255)가 필요한 이유를 쓰시오.", answer: "ADC 입력 범위 0~1023을 PWM 출력 범위 0~255에 맞추기 위해서이다." },
      { type: "전이형", prompt: "같은 실습을 Pico로 옮길 때 주의할 전압과 ADC 코드 차이를 쓰시오.", answer: "Pico GPIO는 3.3V 기준이며 5V를 직접 입력하면 안 된다. MicroPython에서는 ADC.read_u16()으로 0~65535 범위의 값을 읽는다." },
    ],
  },
];
