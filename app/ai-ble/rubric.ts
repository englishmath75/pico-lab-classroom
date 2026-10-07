export const rubric = [
  {
    id: "A",
    title: "배선·센서 검증",
    max: 15,
    group: "모둠",
    levels: [
      {
        score: 15,
        description: "핀·전압·단위 정확, CDS 변화와 DHT 오류 구분, 실측 증거.",
      },
      {
        score: 11,
        description: "동작하나 설명/오류 처리 한 항목 부족.",
      },
      {
        score: 7,
        description: "일부 센서만 검증, 교사 도움 후 원인 설명.",
      },
      {
        score: 3,
        description: "동작·단위·배선 근거 대부분 미제시.",
      },
    ],
  },
  {
    id: "B",
    title: "데이터·라벨의 타당성",
    max: 20,
    group: "모둠",
    levels: [
      {
        score: 20,
        description:
          "실제 출처, feature/label 분리, 네 class와 독립 회차, 오류/중복 검사.",
      },
      {
        score: 15,
        description: "실제 자료와 라벨 일관성 확인, 분포/회차 한 항목 미흡.",
      },
      {
        score: 10,
        description: "편중/부족이 있으나 이를 확인하고 실제 보충 계획 제시.",
      },
      {
        score: 5,
        description: "라벨 출처나 데이터 검증이 불명확.",
      },
    ],
  },
  {
    id: "C",
    title: "학습·평가·모델 변환",
    max: 20,
    group: "모둠",
    levels: [
      {
        score: 20,
        description:
          "fit/test 분리, accuracy·baseline·혼동행렬 해석, tree 출처와 변환 동등성 확인.",
      },
      {
        score: 15,
        description: "학습/평가·변환 완료, 해석 또는 검증 한 항목 부족.",
      },
      {
        score: 10,
        description: "실행 결과는 있으나 누수/변환 검증 문제가 남음.",
      },
      {
        score: 5,
        description: "모델 생성 과정·평가 근거가 대부분 없음.",
      },
    ],
  },
  {
    id: "D",
    title: "실기 통합·복구",
    max: 15,
    group: "모둠",
    levels: [
      {
        score: 15,
        description:
          "Pico 추론→LED/부저→BLE→폰, 새로운 데이터·재연결·오류 처리를 시연.",
      },
      {
        score: 11,
        description: "기본 통합 성공, 새 자료/복구 중 한 항목 미흡.",
      },
      {
        score: 7,
        description: "부분 통합 성공과 구체적 고장 진단.",
      },
      {
        score: 3,
        description: "통합 근거가 거의 없음.",
      },
    ],
  },
  {
    id: "E",
    title: "원리 설명",
    max: 20,
    group: "개인",
    levels: [
      {
        score: 20,
        description:
          "사람이 정한 label과 데이터가 만든 분기, 학습/추론, state/label 차이를 스스로 설명.",
      },
      {
        score: 15,
        description: "세 영역 중 두 영역 정확, 질문 후 나머지 보완.",
      },
      {
        score: 10,
        description: "한 영역 정확하거나 도움을 받아 설명.",
      },
      {
        score: 5,
        description: "코드 복사 수준으로 설명 근거 부족.",
      },
    ],
  },
  {
    id: "F",
    title: "한계·개선",
    max: 10,
    group: "개인",
    levels: [
      {
        score: 10,
        description:
          "실제 오분류 사례, 센서 한계, 다음 수집 조건을 연결해 제안.",
      },
      {
        score: 7,
        description: "한계와 개선은 있으나 근거 연결 일부 부족.",
      },
      {
        score: 4,
        description: "일반적인 개선 한 가지만 제시.",
      },
      {
        score: 1,
        description: "한계·개선 근거 거의 없음.",
      },
    ],
  },
];
