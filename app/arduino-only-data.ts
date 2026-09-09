export type Activity = {
  title: string;
  goal: string;
  parts: string[];
  circuit: string[];
  mission: string[];
  functions: { name: string; meaning: string }[];
  hint: string[];
  skeleton: string;
  answer: string;
  checks: string[];
  pass: string;
  note?: string;
};

export type ArduinoLesson = {
  id: number;
  title: string;
  subtitle: string;
  required: string;
  timeline: { time: string; task: string }[];
  activities: Activity[];
  exam: string[];
  pico: { title: string; body: string }[];
};

export const pinMap = [
  ["LED", "D3", "디지털 출력·PWM 출력"],
  ["버튼", "D2", "INPUT_PULLUP 디지털 입력"],
  ["가변저항", "A0", "아날로그 입력"],
  ["CDS", "A1", "아날로그 입력"],
  ["HC-SR04 TRIG", "D8", "초음파 출력"],
  ["HC-SR04 ECHO", "D7", "왕복 시간 입력"],
];

export const lessons: ArduinoLesson[] = [
  {
    id: 1,
    title: "LED 하나로 디지털·아날로그 맛보기",
    subtitle: "빈 Tinkercad 회로에서 시작해 LED → 버튼 → 시리얼 → 가변저항 순서로 하나씩 추가합니다.",
    required: "LED·버튼·시리얼 A/B 통과, 가변저항은 수업 종료 전 확장 완성",
    timeline: [["0~5분","공통 핀·안전"],["5~13분","Tinkercad LED"],["13~20분","실물 LED"],["20~28분","버튼"],["28~36분","시리얼 A·B"],["36~45분","가변저항·PWM"],["45~50분","실물 확인·제출"]],
    activities: [
      {
        title: "1-1. LED 1초 켜고 끄기", goal: "디지털 출력과 반복 구조 이해",
        parts: ["Arduino Uno R3","작은 브레드보드","5mm LED","220Ω 또는 330Ω 저항","점퍼선"],
        circuit: ["Tinkercad에서 새 회로를 만들고 Arduino Uno R3와 작은 브레드보드를 놓는다.", "D3 → 220Ω(또는 330Ω) 저항 → LED 긴 다리 순서로 연결한다.", "LED 짧은 다리를 GND에 연결한다.", "시뮬레이션 성공 후 USB를 분리하고 실제 Arduino에 같은 위치로 옮긴다."],
        mission: ["변수 led에 3을 저장한다.", "3번 핀을 출력으로 준비한다.", "LED를 1초 켜고 1초 끄는 동작을 반복한다.", "성공하면 시간을 0.2초로 바꾸어 비교한다."],
        functions: [{name:"pinMode(led, OUTPUT)",meaning:"3번 핀을 출력으로 준비"},{name:"digitalWrite(led, HIGH/LOW)",meaning:"LED 켜기/끄기"},{name:"delay(1000)",meaning:"1초 기다리기"}],
        hint: ["setup()에는 한 번만 필요한 준비를 씁니다.", "loop()에는 켜기 → 기다리기 → 끄기 → 기다리기 순서로 씁니다."],
        skeleton: `int led=3;\n\nvoid setup(){\n  // 3번 핀을 출력으로 준비\n}\n\nvoid loop(){\n  // 켜기 → 1초 → 끄기 → 1초\n}`,
        answer: `int led=3;\n\nvoid setup(){\n  pinMode(led,OUTPUT);\n}\n\nvoid loop(){\n  digitalWrite(led,HIGH);\n  delay(1000);\n  digitalWrite(led,LOW);\n  delay(1000);\n}`,
        checks: ["LED 긴 다리 방향","저항 직렬 연결","D3와 GND 확인","시뮬레이션 시작"], pass: "LED가 1초 간격으로 계속 켜지고 꺼진다.",
        note: "220Ω은 빨강-빨강-갈색, 330Ω은 주황-주황-갈색입니다."
      },
      {
        title: "1-2. 버튼으로 LED 제어", goal: "디지털 입력 → 조건 판단 → 디지털 출력",
        parts: ["기존 LED 회로","누름 버튼","점퍼선"],
        circuit: ["기존 LED 회로를 해체하지 않는다.", "버튼을 브레드보드 중앙 홈을 가로질러 놓는다.", "버튼 한쪽을 D2, 반대쪽을 GND에 연결한다.", "INPUT_PULLUP을 사용하므로 버튼용 10kΩ 저항은 연결하지 않는다."],
        mission: ["변수 bt에 2를 저장한다.", "버튼값을 변수 a에 저장한다.", "버튼을 누르면 LED를 켜고 놓으면 끈다.", "누른 상태가 왜 LOW인지 설명한다."],
        functions: [{name:"pinMode(bt, INPUT_PULLUP)",meaning:"내부 풀업 입력 준비"},{name:"digitalRead(bt)",meaning:"버튼의 HIGH/LOW 읽기"},{name:"if / else",meaning:"읽은 값에 따라 LED 결정"}],
        hint: ["INPUT_PULLUP은 평상시 HIGH, 누르면 LOW입니다.", "loop()에서 a=digitalRead(bt);를 먼저 실행합니다."],
        skeleton: `int led=3;\nint bt=2;\nint a;\n\nvoid setup(){\n  // LED 출력, 버튼 풀업 입력\n}\n\nvoid loop(){\n  // 버튼 읽기\n  // LOW이면 켜기, 아니면 끄기\n}`,
        answer: `int led=3;\nint bt=2;\nint a;\n\nvoid setup(){\n  pinMode(led,OUTPUT);\n  pinMode(bt,INPUT_PULLUP);\n}\n\nvoid loop(){\n  a=digitalRead(bt);\n  if(a==LOW) digitalWrite(led,HIGH);\n  else digitalWrite(led,LOW);\n}`,
        checks: ["버튼 중앙 홈 배치","D2와 GND 연결","INPUT_PULLUP 사용","LOW 조건 확인"], pass: "누를 때만 LED가 켜지고 놓으면 바로 꺼진다."
      },
      {
        title: "1-3. 시리얼 A·B로 LED 제어", goal: "도착 확인 → 읽기 → 저장 → 비교",
        parts: ["기존 LED 회로","USB 데이터 케이블","시리얼 모니터"],
        circuit: ["회로는 변경하지 않는다.", "USB 데이터 케이블을 연결한다.", "코드와 시리얼 모니터 속도를 모두 9600으로 설정한다.", "줄바꿈 옵션은 ‘줄바꿈 없음’으로 통일한다."],
        mission: ["데이터가 도착했는지 먼저 확인한다.", "문자 한 개를 읽어 char 변수 c에 저장한다.", "대문자 A를 보내면 LED를 켠다.", "대문자 B를 보내면 LED를 끈다."],
        functions: [{name:"Serial.begin(9600)",meaning:"통신 속도 설정"},{name:"Serial.available()",meaning:"도착 데이터 확인"},{name:"Serial.read()",meaning:"문자 한 개 읽기"}],
        hint: ["Serial.available()>0 안에서 읽고 비교합니다.", "문자는 작은따옴표를 사용해 c=='A'처럼 비교합니다."],
        skeleton: `int led=3;\nchar c;\n\nvoid setup(){\n  // LED 출력, 시리얼 9600\n}\n\nvoid loop(){\n  if( /* 데이터가 있으면 */ ){\n    // 문자 한 개 읽기\n    // A이면 켜기, B이면 끄기\n  }\n}`,
        answer: `int led=3;\nchar c;\n\nvoid setup(){\n  pinMode(led,OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop(){\n  if(Serial.available()>0){\n    c=Serial.read();\n    if(c=='A') digitalWrite(led,HIGH);\n    if(c=='B') digitalWrite(led,LOW);\n  }\n}`,
        checks: ["9600 baud 일치","줄바꿈 없음","available 후 read","대문자 A·B"], pass: "A를 보내면 LED가 켜지고 B를 보내면 꺼진다.", note: "ASCII에서 대문자 A는 65, B는 66입니다."
      },
      {
        title: "1-4. 가변저항으로 LED 밝기 조절", goal: "아날로그 입력과 PWM 출력을 동시에 경험",
        parts: ["기존 LED 회로","가변저항 또는 가변저항 모듈","점퍼선"],
        circuit: ["기존 LED를 PWM D3에 그대로 둔다.", "가변저항 양쪽 다리를 5V와 GND에 연결한다.", "가운데 다리를 A0에 연결한다.", "실제 모듈은 VCC→5V, GND→GND, S·SIG·OUT→A0로 연결한다."],
        mission: ["A0 값을 변수 v에 저장한다.", "0~1023 값을 0~255로 바꾸어 변수 b에 저장한다.", "b를 D3 LED의 PWM 밝기로 출력한다.", "v와 b를 시리얼 모니터에서 확인한다."],
        functions: [{name:"analogRead(A0)",meaning:"0~1023 아날로그값 읽기"},{name:"map(v,0,1023,0,255)",meaning:"입력 범위를 PWM 범위로 변환"},{name:"analogWrite(led,b)",meaning:"0~255 밝기 출력"}],
        hint: ["먼저 v=analogRead(A0);를 실행합니다.", "그다음 b=map(...);, 마지막에 analogWrite(...); 순서입니다."],
        skeleton: `int led=3;\nint v;\nint b;\n\nvoid setup(){\n  // LED 출력, 시리얼 시작\n}\n\nvoid loop(){\n  // A0 읽기\n  // 0~1023을 0~255로 변환\n  // LED 밝기 출력\n}`,
        answer: `int led=3;\nint v;\nint b;\n\nvoid setup(){\n  pinMode(led,OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop(){\n  v=analogRead(A0);\n  b=map(v,0,1023,0,255);\n  analogWrite(led,b);\n  Serial.println(v);\n  delay(20);\n}`,
        checks: ["VCC·GND 방향","신호핀 A0","LED D3","PWM값 0~255"], pass: "다이얼을 돌리면 LED 밝기가 부드럽게 변한다."
      }
    ],
    exam: ["digitalWrite와 analogWrite의 차이", "INPUT_PULLUP에서 누른 상태가 LOW인 이유", "Serial.available과 Serial.read의 실행 순서", "analogRead 0~1023과 PWM 0~255 범위"],
    pico: [{title:"LED",body:"Pin과 value(), sleep으로 같은 깜빡임 구현"},{title:"버튼",body:"Pin.PULL_UP과 value()로 같은 조건 구현"},{title:"가변저항",body:"ADC.read_u16()과 PWM.duty_u16()으로 밝기 조절"}]
  },
  {
    id: 2, title: "초음파·CDS 자동 제어", subtitle: "거리와 빛을 숫자로 읽고 기준값에 따라 LED를 자동 제어합니다.", required: "초음파 20cm 경보와 CDS 자동 조명 모두 통과",
    timeline: [["0~5분","1차시 점검"],["5~25분","초음파 거리"],["25~42분","CDS 자동 조명"],["42~47분","실물 재현"],["47~50분","결과 제출"]],
    activities: [
      {title:"2-1. 초음파 20cm 경보",goal:"왕복 시간을 거리로 변환",parts:["HC-SR04","기존 LED 회로","점퍼선"],circuit:["VCC→5V, GND→GND", "TRIG→D8, ECHO→D7", "LED는 D3과 GND 사이에 저항과 함께 유지"],mission:["TRIG에서 10μs 신호를 보낸다.","ECHO의 HIGH 시간을 t에 저장한다.","d=t*0.034/2로 거리를 계산한다.","20cm보다 가까우면 LED를 켠다."],functions:[{name:"pulseIn(7,HIGH)",meaning:"왕복 시간 측정"},{name:"d=t*0.034/2",meaning:"cm 거리 계산"},{name:"if(d<20)",meaning:"기준 거리 판단"}],hint:["TRIG를 LOW→HIGH→LOW로 보냅니다.","소리가 왕복하므로 거리 계산에서 2로 나눕니다."],skeleton:`int led=3,tr=8,ec=7;\nlong t;\nint d;\n// setup: 핀·시리얼 준비\n// loop: TRIG 신호 → pulseIn → 거리 계산 → 조건`,answer:`int led=3,tr=8,ec=7;\nlong t; int d;\nvoid setup(){\n pinMode(led,OUTPUT); pinMode(tr,OUTPUT); pinMode(ec,INPUT); Serial.begin(9600);\n}\nvoid loop(){\n digitalWrite(tr,LOW); delayMicroseconds(2);\n digitalWrite(tr,HIGH); delayMicroseconds(10); digitalWrite(tr,LOW);\n t=pulseIn(ec,HIGH); d=t*0.034/2; Serial.println(d);\n if(d<20) digitalWrite(led,HIGH); else digitalWrite(led,LOW);\n delay(100);\n}`,checks:["4개 핀 순서","TRIG 10μs","거리 ÷2","D3 LED"],pass:"20cm 안쪽에서 LED가 켜지고 바깥에서 꺼진다."},
      {title:"2-2. CDS 자동 조명",goal:"ADC 값과 임계값 이해",parts:["5mm 5528 CDS","10kΩ 저항","기존 LED 회로"],circuit:["CDS와 10kΩ을 5V와 GND 사이에 직렬 연결", "두 부품이 만나는 지점→A1", "LED는 PWM D3에 유지"],mission:["A1 값을 a에 저장하고 출력한다.","밝을 때와 가렸을 때 값을 기록한다.","교실에 맞는 기준값을 정한다.","어두울수록 LED가 밝아지게 한다."],functions:[{name:"analogRead(A1)",meaning:"조도 전압 읽기"},{name:"map()",meaning:"센서값을 밝기로 변환"},{name:"constrain()",meaning:"출력 범위를 0~255로 제한"}],hint:["밝고 어두울 때 실제 값을 먼저 측정합니다.","CDS와 10kΩ 위치에 따라 증가 방향이 반대일 수 있습니다."],skeleton:`int led=3,a,b;\n// setup: LED·시리얼\n// loop: A1 읽기 → 밝기 변환 → PWM 출력`,answer:`int led=3,a,b;\nvoid setup(){ pinMode(led,OUTPUT); Serial.begin(9600); }\nvoid loop(){\n a=analogRead(A1);\n b=map(a,0,1023,255,0);\n b=constrain(b,0,255);\n analogWrite(led,b);\n Serial.println(a); delay(50);\n}`,checks:["전압분배","중간점 A1","실제값 측정","0~255 제한"],pass:"CDS를 가리면 LED 밝기가 분명하게 변한다.",note:"값의 방향이 반대라면 map의 출력 255와 0을 서로 바꿉니다."}
    ],
    exam:["초음파 거리를 계산할 때 2로 나누는 이유","전압분배 회로에서 A1이 연결되는 위치","임계값과 센서값의 관계"],
    pico:[{title:"HC-SR04",body:"time_pulse_us() 사용. ECHO의 5V 신호는 저항분압 후 Pico에 입력"},{title:"CDS",body:"전원은 3.3V, ADC.read_u16()으로 0~65535 값을 읽음"}]
  },
  {
    id: 3, title: "통합 제어 후 Pico로 이동", subtitle: "여러 입력의 우선순위를 정하고 Arduino에서 익힌 원리를 MicroPython으로 옮깁니다.", required: "통합 동작 설명·오류 점검·Pico 함수 대응표 완성",
    timeline:[["0~8분","회로 자가 점검"],["8~28분","입력 통합"],["28~38분","우선순위 수정"],["38~46분","Arduino↔Pico 비교"],["46~50분","마스터 확인"]],
    activities:[
      {title:"3-1. 스마트 LED 통합",goal:"여러 입력을 우선순위에 따라 처리",parts:["1·2차시 누적 회로"],circuit:["D3 LED, D2 버튼, A0 가변저항, A1 CDS를 유지한다.","필요한 입력부터 하나씩 검사하고 각 단계 성공 후 다음 입력을 결합한다.","배선을 바꿀 때 USB를 분리한다."],mission:["평상시에는 가변저항으로 밝기를 조절한다.","어두우면 CDS에 따라 자동 조명을 동작시킨다.","버튼을 누르면 LED를 강제로 켠다.","시리얼 A는 켜기, B는 끄기로 최우선 처리한다."],functions:[{name:"if / else if / else",meaning:"제어 우선순위 구성"},{name:"digitalRead·analogRead",meaning:"디지털·아날로그 입력 결합"},{name:"analogWrite",meaning:"최종 LED 출력"}],hint:["한 번에 합치지 말고 가변저항→CDS→버튼→시리얼 순서로 검사합니다.","시리얼 상태 m을 마지막에 적용하면 A/B 명령이 다음 반복에서도 유지됩니다."],skeleton:`int led=3,bt=2,a,v,b,cd,m=-1;\nchar c;\n// setup: 핀·시리얼\n// loop: 센서 읽기 → 우선순위로 b 결정 → PWM 출력`,answer:`int led=3,bt=2,a,v,b,cd,m=-1;\nchar c;\nvoid setup(){ pinMode(led,OUTPUT); pinMode(bt,INPUT_PULLUP); Serial.begin(9600); }\nvoid loop(){\n a=digitalRead(bt); v=analogRead(A0); cd=analogRead(A1);\n b=map(v,0,1023,0,255);\n if(cd<400) b=220;\n if(a==LOW) b=255;\n if(Serial.available()>0){\n  c=Serial.read();\n  if(c=='A') m=255;\n  if(c=='B') m=0;\n }\n if(m>=0) b=m;\n analogWrite(led,b); delay(20);\n}`,checks:["센서별 단독 성공","짧은 변수","우선순위 설명","최종 출력 한곳"],pass:"각 입력이 동작하고 학생이 어떤 입력이 우선하는지 설명한다.",note:"CDS 기준값 400은 예시입니다. 2차시에서 측정한 자기 회로의 값을 사용합니다."}
    ],
    exam:["입력→처리→출력 구분","여러 if문의 실행 순서와 최종 출력","Arduino의 5V와 Pico의 3.3V 차이","analogRead와 read_u16 범위 비교"],
    pico:[{title:"디지털",body:"pinMode·digitalWrite·digitalRead → Pin·value"},{title:"시간",body:"delay(1000) → sleep(1)"},{title:"아날로그·PWM",body:"0~1023·0~255 → read_u16·duty_u16의 0~65535"},{title:"초음파",body:"pulseIn → time_pulse_us"}]
  }
];
