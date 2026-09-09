export type ConceptCard = {
  term: string;
  plain: string;
  analogy: string;
  remember: string;
};

export type TeacherGuide = {
  objective: string[];
  opening: string;
  board: string[];
  questions: { q: string; a: string }[];
  observe: string[];
  exitTicket: string[];
};

export type GlossaryEntry = {
  term: string;
  korean: string;
  meaning: string;
  analogy: string;
  example: string;
  lesson: number;
};

export const textbookMeta = {
  title: "처음 만나는 Arduino Uno",
  edition: "2026 교실판",
  principle: "개념을 알고 → 회로를 만들고 → 코드를 설명하고 → 스스로 고친다",
};

export const lessonConcepts: Record<number, ConceptCard[]> = {
  1: [
    { term: "입력·처리·출력", plain: "보드는 값을 받아 판단한 뒤 부품을 움직입니다.", analogy: "버튼은 초인종 버튼, 코드는 판단하는 사람, LED는 울리는 벨과 같습니다.", remember: "센서·버튼은 입력, if와 계산은 처리, LED는 출력" },
    { term: "디지털", plain: "두 상태만 구별하는 방식입니다. Arduino에서는 주로 HIGH와 LOW를 씁니다.", analogy: "교실 전등 스위치의 켜짐·꺼짐과 같습니다.", remember: "두 상태: HIGH / LOW" },
    { term: "아날로그 입력", plain: "가변저항처럼 중간값이 많은 신호를 Uno가 0~1023의 숫자로 바꾸어 읽습니다.", analogy: "수도꼭지를 조금씩 돌리면 물의 양이 연속해서 변하는 것과 같습니다.", remember: "analogRead: 0~1023" },
    { term: "PWM", plain: "전기를 매우 빠르게 켰다 껐다 하여 평균 밝기가 달라 보이게 하는 출력입니다.", analogy: "손전등을 아주 빠르게 깜빡이면 눈에는 밝기가 줄어든 것처럼 보입니다.", remember: "Uno analogWrite: 0~255, 물결표(~) 핀 사용" },
    { term: "시리얼 통신", plain: "USB 선을 통해 컴퓨터와 Arduino가 문자를 차례로 주고받는 방법입니다.", analogy: "한 줄로 선 사람들이 한 명씩 문을 통과하는 것과 같습니다.", remember: "속도 9600을 양쪽에서 같게" },
  ],
  2: [
    { term: "초음파 거리", plain: "소리를 보내고 되돌아오는 시간을 재어 거리를 구합니다.", analogy: "산에서 메아리가 돌아오는 시간을 재는 것과 같습니다.", remember: "왕복 거리이므로 2로 나누기" },
    { term: "전압 분배", plain: "CDS와 저항이 전압을 나누고, 두 부품의 가운데 값을 A1이 읽습니다.", analogy: "두 사람이 줄을 당길 때 가운데 매듭의 위치가 힘에 따라 달라지는 것과 같습니다.", remember: "A1은 CDS와 10kΩ의 만나는 점" },
    { term: "기준값", plain: "센서 숫자를 어느 지점에서 두 행동으로 나눌지 정한 값입니다.", analogy: "기온이 18도보다 낮으면 난방을 켜는 규칙과 같습니다.", remember: "먼저 실제값을 측정한 뒤 기준을 정하기" },
  ],
  3: [
    { term: "우선순위", plain: "여러 입력이 동시에 들어올 때 어떤 명령을 마지막에 적용할지 정하는 규칙입니다.", analogy: "일반 안내보다 비상 안내를 먼저 따르는 것과 같습니다.", remember: "최종 출력 직전에 적용된 값이 실제 LED를 결정" },
    { term: "상태", plain: "이번 loop가 끝난 뒤에도 기억해야 하는 값을 변수에 보관한 것입니다.", analogy: "전등 스위치의 현재 위치를 기억하는 것과 같습니다.", remember: "명령을 계속 유지하려면 상태 변수가 필요" },
    { term: "이식", plain: "문법은 달라도 같은 입력→처리→출력 원리를 다른 보드에서 다시 구현하는 것입니다.", analogy: "같은 뜻을 한국어와 영어로 각각 말하는 것과 같습니다.", remember: "Arduino C/C++ → Pico MicroPython" },
  ],
};

export const teacherGuides: Record<number, TeacherGuide> = {
  1: {
    objective: ["디지털 입력과 출력을 구분한다.", "setup과 loop의 역할을 설명한다.", "가변저항값을 PWM 밝기로 변환한다.", "시리얼 문자 A·B로 LED를 제어한다."],
    opening: "전등 스위치, 현관 센서등, 스피커 음량 다이얼을 보여 주고 무엇이 입력이고 무엇이 출력인지 먼저 묻습니다. 정답을 설명하기 전에 학생의 말을 입력→처리→출력 세 칸에 배치합니다.",
    board: ["입력 → 처리 → 출력", "버튼: 평상시 HIGH / 누르면 LOW (INPUT_PULLUP)", "analogRead: 0~1023 → map → analogWrite: 0~255", "문자 비교: c=='A' / 값 저장: c=Serial.read()"],
    questions: [
      { q: "왜 LED에 저항을 연결하나요?", a: "LED에 너무 큰 전류가 흐르지 않도록 제한하기 위해서입니다." },
      { q: "버튼을 눌렀는데 왜 LOW인가요?", a: "INPUT_PULLUP이 평상시 핀을 HIGH로 잡고, 누르면 핀이 GND에 연결되기 때문입니다." },
      { q: "analogWrite인데 진짜 아날로그 전압인가요?", a: "Uno에서는 PWM입니다. 매우 빠른 켜짐·꺼짐의 비율을 바꾸는 방식입니다." },
      { q: "A를 보냈는데 반응하지 않아요.", a: "9600 baud, 대문자 A, 줄바꿈 없음, Serial.available() 뒤 Serial.read() 순서를 확인합니다." },
    ],
    observe: ["전원 연결 전에 LED 방향과 GND를 확인하는가", "코드를 복사만 하지 않고 setup·loop를 가리켜 설명하는가", "오류가 생기면 전원→배선→핀 번호→코드 순으로 점검하는가"],
    exitTicket: ["digitalWrite와 analogWrite의 차이를 한 문장으로 쓰기", "INPUT_PULLUP 버튼의 누른 값을 쓰기", "1023을 255로 바꾸는 함수 이름 쓰기"],
  },
  2: {
    objective: ["초음파 왕복 시간을 거리로 계산한다.", "CDS 전압분배를 설명한다.", "측정값을 보고 기준값을 정한다."],
    opening: "센서는 정답을 말하지 않고 숫자를 보낸다는 점부터 강조합니다. 교실 환경마다 CDS 값이 다르므로 측정이 먼저입니다.",
    board: ["거리 = 시간 × 0.034 ÷ 2", "TRIG: 보냄 / ECHO: 받음", "5V—CDS—(A1)—10kΩ—GND", "측정 → 기준 설정 → if 판단 → 출력"],
    questions: [{ q: "왜 거리를 2로 나누나요?", a: "측정 시간에는 물체까지 간 시간과 돌아온 시간이 모두 포함되기 때문입니다." }, { q: "친구와 CDS 값이 달라요.", a: "부품 오차와 주변 빛이 다르므로 정상입니다. 각자 밝음·어두움 값을 측정해 기준을 정합니다." }],
    observe: ["HC-SR04 네 핀을 이름으로 확인하는가", "CDS 중간점을 A1에 연결하는가", "고정 숫자를 외우지 않고 측정값으로 기준을 정하는가"],
    exitTicket: ["초음파 계산에서 ÷2의 뜻 쓰기", "A1을 연결할 위치 표시하기", "자기 회로의 밝음·어두움 값 기록하기"],
  },
  3: {
    objective: ["여러 입력의 우선순위를 설계한다.", "한 번에 하나씩 검사하는 디버깅을 실천한다.", "Arduino 함수를 Pico MicroPython 함수와 대응한다."],
    opening: "버튼·빛·다이얼·시리얼이 동시에 명령하면 누가 이겨야 하는지 토론한 뒤 우선순위표를 만듭니다.",
    board: ["단독 성공 → 두 개 결합 → 전체 결합", "센서 읽기 → b 결정 → analogWrite 한 번", "Arduino 5V / Pico GPIO 3.3V", "원리는 같고 문법과 값의 범위가 다름"],
    questions: [{ q: "if가 여러 개면 모두 실행되나요?", a: "조건이 참인 if는 모두 실행될 수 있습니다. 같은 변수를 바꾸면 뒤에서 바꾼 값이 남습니다." }, { q: "Arduino 회로를 Pico에 그대로 꽂아도 되나요?", a: "안 됩니다. Pico GPIO는 3.3V 기준이므로 전압과 핀 번호를 다시 확인해야 합니다." }],
    observe: ["우선순위를 말로 먼저 정하는가", "각 센서를 단독으로 확인하는가", "5V 신호를 Pico GPIO에 직접 넣지 않는 이유를 설명하는가"],
    exitTicket: ["자기 통합 코드의 우선순위 쓰기", "analogRead에 대응하는 Pico 메서드 쓰기", "Arduino와 Pico 전압 차이 쓰기"],
  },
};

export const glossary: GlossaryEntry[] = [
  { term:"ADC", korean:"아날로그-디지털 변환", meaning:"연속적인 전압을 컴퓨터가 읽을 수 있는 숫자로 바꾸는 기능", analogy:"온도를 숫자로 표시하는 온도계", example:"analogRead(A0): 0~1023", lesson:1 },
  { term:"baud", korean:"보드율", meaning:"시리얼 통신 속도를 나타내는 단위", analogy:"대화할 때 서로 맞추는 말의 속도", example:"Serial.begin(9600)", lesson:1 },
  { term:"breadboard", korean:"브레드보드", meaning:"납땜 없이 부품과 선을 연결하는 실습판", analogy:"구멍끼리 내부에서 이어진 전기 블록판", example:"가운데 홈 양쪽은 서로 연결되지 않음", lesson:1 },
  { term:"digital", korean:"디지털", meaning:"HIGH·LOW처럼 구별된 상태로 신호를 다루는 방식", analogy:"켜짐과 꺼짐만 있는 스위치", example:"digitalRead, digitalWrite", lesson:1 },
  { term:"GND", korean:"그라운드", meaning:"회로 전압의 기준이자 전류가 돌아가는 길", analogy:"출발한 물이 다시 돌아오는 배수관", example:"Arduino GND → 브레드보드 (-)", lesson:1 },
  { term:"INPUT_PULLUP", korean:"내부 풀업 입력", meaning:"보드 안의 저항으로 입력을 평상시 HIGH로 유지하는 설정", analogy:"누르지 않으면 위로 올라오는 용수철 버튼", example:"pinMode(bt, INPUT_PULLUP)", lesson:1 },
  { term:"LED", korean:"발광 다이오드", meaning:"전류가 한 방향으로 흐를 때 빛을 내는 출력 부품", analogy:"방향이 있는 작은 전등", example:"긴 다리 +, 짧은 다리 GND 쪽", lesson:1 },
  { term:"loop", korean:"반복 함수", meaning:"전원이 켜진 동안 계속 반복되는 코드 영역", analogy:"매일 반복되는 시간표", example:"void loop(){ ... }", lesson:1 },
  { term:"PWM", korean:"펄스 폭 변조", meaning:"빠른 켜짐·꺼짐의 비율을 바꾸어 평균 출력을 조절하는 방식", analogy:"아주 빠르게 깜빡이는 손전등", example:"analogWrite(3, 128)", lesson:1 },
  { term:"Serial", korean:"시리얼 통신", meaning:"데이터를 한 줄로 차례차례 주고받는 통신", analogy:"한 줄로 한 명씩 통과하는 문", example:"Serial.read()", lesson:1 },
  { term:"setup", korean:"준비 함수", meaning:"Arduino가 시작할 때 한 번만 실행되는 코드 영역", analogy:"수업 전 책상과 준비물을 세팅하는 시간", example:"void setup(){ pinMode(...); }", lesson:1 },
  { term:"variable", korean:"변수", meaning:"프로그램이 숫자나 문자를 저장하는 이름 붙은 공간", analogy:"이름표가 붙은 작은 상자", example:"int led=3;", lesson:1 },
  { term:"voltage divider", korean:"전압 분배", meaning:"두 저항의 비율에 따라 가운데 전압이 달라지는 회로", analogy:"두 사람이 당기는 줄의 가운데 매듭", example:"CDS—A1—10kΩ", lesson:2 },
  { term:"threshold", korean:"기준값·임계값", meaning:"센서값에 따라 행동을 나누는 경계 숫자", analogy:"키 120cm를 기준으로 탑승 여부를 나누는 선", example:"if(d<20)", lesson:2 },
  { term:"TRIG / ECHO", korean:"송신 / 수신", meaning:"초음파를 시작시키는 핀과 되돌아온 시간을 받는 핀", analogy:"말하기와 듣기", example:"TRIG D8, ECHO D7", lesson:2 },
  { term:"debugging", korean:"디버깅", meaning:"문제의 원인을 순서대로 찾아 고치는 과정", analogy:"전등이 안 켜질 때 차단기부터 하나씩 확인하기", example:"전원→배선→핀→코드→값", lesson:3 },
  { term:"state", korean:"상태", meaning:"다음 반복에서도 유지할 현재 동작값", analogy:"전등 스위치가 마지막 위치를 유지함", example:"int m=-1;", lesson:3 },
];
