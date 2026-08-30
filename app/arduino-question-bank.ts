export type ArduinoQuestionBankTopic = {
  unit: string;
  keyword: string;
  mastery: string;
  futureTypes: string[];
};

export const arduinoQuestionBankTopics: ArduinoQuestionBankTopic[] = [
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
