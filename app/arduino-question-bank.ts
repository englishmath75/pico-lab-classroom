export type ArduinoQuestionBankTopic = {
  unit: string;
  keyword: string;
  mastery: string;
  futureTypes: string[];
};

export const arduinoQuestionBankTopics: ArduinoQuestionBankTopic[] = [
  {
    unit: "Uno 구조",
    keyword: "핀 · 전원 · 겸용 기능",
    mastery: "디지털 핀, 아날로그 핀, 전원 핀과 통신 겸용 핀을 구분한다.",
    futureTypes: ["핀 찾기", "회로 해석", "안전"],
  },
  {
    unit: "아날로그 입력",
    keyword: "A0~A5 · 10비트 ADC",
    mastery: "1024단계와 결과값 0~1023의 관계를 설명하고 전압을 계산한다.",
    futureTypes: ["계산", "개념 비교", "코드 해석"],
  },
  {
    unit: "PWM 출력",
    keyword: "D3·5·6·9·10·11 · 0~255",
    mastery: "PWM 듀티비와 진짜 아날로그 전압 출력의 차이를 설명한다.",
    futureTypes: ["출력 예측", "서술", "코드 수정"],
  },
  {
    unit: "시작 전 기초",
    keyword: "bit · ASCII",
    mastery: "0과 1의 의미와 문자 코드 변환을 설명한다.",
    futureTypes: ["개념 선택", "변환", "코드 해석"],
  },
  {
    unit: "시작 전 기초",
    keyword: "Serial.begin",
    mastery: "시리얼 통신 속도와 setup()에서의 역할을 설명한다.",
    futureTypes: ["빈칸", "오류 진단", "서술"],
  },
  {
    unit: "시작 전 기초",
    keyword: "bps · 8N1",
    mastery: "115200 bps의 이론적 바이트 전송량을 계산한다.",
    futureTypes: ["계산", "개념 비교"],
  },
  {
    unit: "시작 전 기초",
    keyword: "print · println",
    mastery: "줄바꿈 여부에 따른 출력 결과를 예측한다.",
    futureTypes: ["출력 예측", "코드 수정"],
  },
  {
    unit: "시작 전 기초",
    keyword: "DEC · HEX · BIN",
    mastery: "정수와 문자를 지정한 진법으로 출력한다.",
    futureTypes: ["변환", "실행 결과"],
  },
];
