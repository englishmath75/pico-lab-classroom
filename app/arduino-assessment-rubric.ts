// NEW 회로 기준으로 기존 83개 세부기준의 ID와 배점은 유지하고 판정 문구만 갱신했습니다.
export const assessmentRubric = {
  "version": "NEW-2026-10-15",
  "isSchoolApproved": false,
  "scoreGroups": [
    {
      "name": "기본점수",
      "score": 40
    },
    {
      "name": "수업참여",
      "score": 20
    },
    {
      "name": "태도",
      "score": 20
    },
    {
      "name": "실습활동",
      "score": 20
    }
  ],
  "rubric": [
    {
      "id": "A",
      "name": "회로 구성",
      "maxUnits": 40,
      "items": [
        {
          "id": "A1",
          "title": "전원·공통 접지",
          "mode": "배선",
          "maxUnits": 8,
          "subcriteria": [
            {
              "id": "A1.1",
              "units": 2,
              "criterion": "Uno 5V가 브레드보드 + 전원선에 연결되어 있다."
            },
            {
              "id": "A1.2",
              "units": 2,
              "criterion": "Uno GND가 브레드보드 - 전원선에 연결되어 있다."
            },
            {
              "id": "A1.3",
              "units": 2,
              "criterion": "사용하는 전원선 구간의 끊김을 연결하고 공통 접지를 확보하였다."
            },
            {
              "id": "A1.4",
              "units": 2,
              "criterion": "5V와 GND를 직접 잇는 단락이 없다."
            }
          ]
        },
        {
          "id": "A2",
          "title": "초음파센서 배선",
          "mode": "배선",
          "maxUnits": 8,
          "subcriteria": [
            {
              "id": "A2.1",
              "units": 2,
              "criterion": "VCC가 +5V 전원선에 연결되어 있다."
            },
            {
              "id": "A2.2",
              "units": 2,
              "criterion": "GND가 공통 접지에 연결되어 있다."
            },
            {
              "id": "A2.3",
              "units": 2,
              "criterion": "TRIG가 D7에 연결되어 있다."
            },
            {
              "id": "A2.4",
              "units": 2,
              "criterion": "ECHO가 D8에 연결되어 있다."
            }
          ]
        },
        {
          "id": "A3",
          "title": "조도센서 배선",
          "mode": "배선",
          "maxUnits": 8,
          "subcriteria": [
            {
              "id": "A3.1",
              "units": 2,
              "criterion": "CDS 한쪽이 +5V에 연결되어 있다."
            },
            {
              "id": "A3.2",
              "units": 2,
              "criterion": "10kΩ 저항 한쪽이 GND에 연결되어 있다."
            },
            {
              "id": "A3.3",
              "units": 2,
              "criterion": "CDS와 저항의 나머지 단자가 같은 접점을 이룬다."
            },
            {
              "id": "A3.4",
              "units": 2,
              "criterion": "그 접점이 A0에 연결되어 있다."
            }
          ]
        },
        {
          "id": "A4",
          "title": "가변저항 배선",
          "mode": "배선",
          "maxUnits": 8,
          "subcriteria": [
            {
              "id": "A4.1",
              "units": 2,
              "criterion": "한쪽 끝 단자가 +5V에 연결되어 있다."
            },
            {
              "id": "A4.2",
              "units": 2,
              "criterion": "반대쪽 끝 단자가 GND에 연결되어 있다."
            },
            {
              "id": "A4.3",
              "units": 2,
              "criterion": "중앙 단자(와이퍼)가 A1에 연결되어 있다."
            },
            {
              "id": "A4.4",
              "units": 2,
              "criterion": "세 단자가 브레드보드의 같은 연결줄 등으로 서로 단락되지 않는다."
            }
          ]
        },
        {
          "id": "A5",
          "title": "빨간 LED·초록 LED와 직렬 저항",
          "mode": "배선",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "A5.1",
              "units": 2,
              "criterion": "빨간 LED는 D9에 연결하며 LED 극성 및 220~330Ω 직렬 저항을 갖추고 GND로 이어진다."
            },
            {
              "id": "A5.2",
              "units": 2,
              "criterion": "초록 LED는 PWM D10에 연결하며 LED 극성 및 220~330Ω 직렬 저항을 갖추고 GND로 이어진다."
            }
          ]
        },
        {
          "id": "A6",
          "title": "수동 피에조 부저",
          "mode": "배선",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "A6.1",
              "units": 2,
              "criterion": "지급된 수동 피에조의 신호 단자가 D2에 연결되어 있다."
            },
            {
              "id": "A6.2",
              "units": 2,
              "criterion": "반대 단자가 GND에 연결되어 있다."
            }
          ]
        }
      ]
    },
    {
      "id": "B",
      "name": "센서값 수집",
      "maxUnits": 30,
      "items": [
        {
          "id": "B1",
          "title": "조도 입력 코드",
          "mode": "코드",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "B1.1",
              "units": 2,
              "criterion": "A0의 실제 아날로그 입력을 읽는다."
            },
            {
              "id": "B1.2",
              "units": 2,
              "criterion": "읽은 값을 light 또는 같은 역할의 변수에 저장한다."
            }
          ]
        },
        {
          "id": "B2",
          "title": "조도 실물 반응",
          "mode": "실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "B2.1",
              "units": 2,
              "criterion": "밝게 했을 때 실제 읽힌 조도값을 확인할 수 있다."
            },
            {
              "id": "B2.2",
              "units": 2,
              "criterion": "가렸을 때 실제 읽힌 조도값을 확인할 수 있다."
            },
            {
              "id": "B2.3",
              "units": 2,
              "criterion": "같은 회로에서 밝게 한 값이 가렸을 때보다 크다."
            }
          ]
        },
        {
          "id": "B3",
          "title": "가변저항 입력 코드",
          "mode": "코드",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "B3.1",
              "units": 2,
              "criterion": "A1의 실제 아날로그 입력을 읽는다."
            },
            {
              "id": "B3.2",
              "units": 2,
              "criterion": "읽은 값을 pot 또는 같은 역할의 변수에 저장한다."
            }
          ]
        },
        {
          "id": "B4",
          "title": "가변저항 실물 반응",
          "mode": "실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "B4.1",
              "units": 2,
              "criterion": "낮은 위치에서 실제 읽힌 가변저항값을 확인할 수 있다."
            },
            {
              "id": "B4.2",
              "units": 2,
              "criterion": "높은 위치에서 실제 읽힌 가변저항값을 확인할 수 있다."
            },
            {
              "id": "B4.3",
              "units": 2,
              "criterion": "손잡이를 조작하면 실제 입력값이 낮은 값에서 높은 값으로 변한다."
            }
          ]
        },
        {
          "id": "B5",
          "title": "실측 거리 사용",
          "mode": "코드",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "B5.1",
              "units": 2,
              "criterion": "제공된 초음파 계산 결과를 거리 판단에 사용한다."
            },
            {
              "id": "B5.2",
              "units": 2,
              "criterion": "거리값을 실제 초음파 측정 결과로 사용하며 distance=15처럼 임의의 상수로 덮어쓰거나 가짜 값으로 대체하지 않는다."
            }
          ]
        },
        {
          "id": "B6",
          "title": "초음파 실물 반응",
          "mode": "실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "B6.1",
              "units": 2,
              "criterion": "평평한 표적을 약 10cm에 두면 유효한 실측 거리값이 나온다."
            },
            {
              "id": "B6.2",
              "units": 2,
              "criterion": "같은 표적을 약 30cm에 두면 유효한 실측 거리값이 나온다."
            },
            {
              "id": "B6.3",
              "units": 2,
              "criterion": "30cm 위치의 값이 10cm 위치의 값보다 크다."
            }
          ]
        }
      ]
    },
    {
      "id": "C",
      "name": "거리별 부저 제어",
      "maxUnits": 30,
      "items": [
        {
          "id": "C1",
          "title": "거리 판단과 해제",
          "mode": "코드",
          "maxUnits": 10,
          "subcriteria": [
            {
              "id": "C1.1",
              "units": 2,
              "criterion": "거리 판단 기준이 20cm이다."
            },
            {
              "id": "C1.2",
              "units": 2,
              "criterion": "20cm 미만을 가까움으로 판단하며, 정확히 20cm는 제외한다."
            },
            {
              "id": "C1.3",
              "units": 2,
              "criterion": "가까운 경우 부저 켜짐 명령을 결정한다."
            },
            {
              "id": "C1.4",
              "units": 2,
              "criterion": "20cm 이상에서는 부저 꺼짐 명령을 결정한다."
            },
            {
              "id": "C1.5",
              "units": 2,
              "criterion": "밝고 어두운 상태가 부저의 거리 판단을 바꾸지 않는다."
            }
          ]
        },
        {
          "id": "C2",
          "title": "근거리 부저 울림",
          "mode": "실물",
          "maxUnits": 10,
          "subcriteria": [
            {
              "id": "C2.1",
              "units": 6,
              "criterion": "밝고 약 10cm인 상태에서 부저가 실제로 울린다."
            },
            {
              "id": "C2.2",
              "units": 4,
              "criterion": "어둡고 약 10cm인 상태에서도 부저가 실제로 울린다."
            }
          ]
        },
        {
          "id": "C3",
          "title": "원거리 부저 멈춤",
          "mode": "실물",
          "maxUnits": 10,
          "subcriteria": [
            {
              "id": "C3.1",
              "units": 6,
              "criterion": "밝음·근거리에서 울림을 확인한 뒤 약 30cm로 옮기면 멈춘다."
            },
            {
              "id": "C3.2",
              "units": 4,
              "criterion": "어두움·근거리에서 울림을 확인한 뒤 약 30cm로 옮기면 멈춘다."
            }
          ]
        }
      ]
    },
    {
      "id": "D",
      "name": "빨간 LED의 독립적인 조도 제어",
      "maxUnits": 40,
      "items": [
        {
          "id": "D1",
          "title": "밝음·원거리: 빨간 LED 꺼짐",
          "mode": "코드",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "D1.1",
              "units": 2,
              "criterion": "CDS 값이 400 이상이면 초음파 거리와 관계없이 빨간 LED를 끄는 판단 경로가 있다."
            },
            {
              "id": "D1.2",
              "units": 4,
              "criterion": "밝음·20cm 이상에서 빨간 LED(D9) 명령이 LOW이다."
            }
          ]
        },
        {
          "id": "D2",
          "title": "어두움·원거리: 빨간 LED 켜짐",
          "mode": "코드",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "D2.1",
              "units": 2,
              "criterion": "원거리여도 CDS 값이 400 미만이면 빨간 LED를 켜는 판단 경로가 있다."
            },
            {
              "id": "D2.2",
              "units": 4,
              "criterion": "어두움·20cm 이상 상태에서 빨간 LED(D9) 명령이 HIGH이다."
            }
          ]
        },
        {
          "id": "D3",
          "title": "밝음·근거리: 빨간 LED 꺼짐",
          "mode": "코드",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "D3.1",
              "units": 2,
              "criterion": "CDS 값이 400 이상이면 밝음으로 처리하며 경계값 400을 포함한다."
            },
            {
              "id": "D3.2",
              "units": 4,
              "criterion": "밝음·20cm 미만 상태에서도 빨간 LED(D9) 명령이 LOW이다."
            }
          ]
        },
        {
          "id": "D4",
          "title": "어두움·근거리: 빨간 LED 켜짐",
          "mode": "코드",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "D4.1",
              "units": 2,
              "criterion": "CDS 값이 400 미만일 때 거리 조건과 묶지 않고 빨간 LED를 켠다."
            },
            {
              "id": "D4.2",
              "units": 4,
              "criterion": "어두움·20cm 미만 상태에서 빨간 LED(D9) 명령이 HIGH이다."
            }
          ]
        },
        {
          "id": "D5",
          "title": "조도 변화에 따른 빨간 LED 실제 점등",
          "mode": "실물",
          "maxUnits": 8,
          "subcriteria": [
            {
              "id": "D5.1",
              "units": 4,
              "criterion": "어두움·약 10cm 상태에서 빨간 LED가 실제로 켜진다."
            },
            {
              "id": "D5.2",
              "units": 4,
              "criterion": "가까운 거리를 유지하고 밝음에서 어두움으로 바꾸면 빨간 LED가 다시 켜진다."
            }
          ]
        },
        {
          "id": "D6",
          "title": "밝아지면 빨간 LED 꺼짐",
          "mode": "실물",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "D6.1",
              "units": 4,
              "criterion": "같은 프로그램에서 빨간 LED의 점등을 확인한 뒤 거리를 유지하고 CDS를 밝게 하면 빨간 LED가 꺼진다."
            }
          ]
        },
        {
          "id": "D7",
          "title": "멀어져도 빨간 LED 켜짐 유지",
          "mode": "실물",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "D7.1",
              "units": 4,
              "criterion": "빨간 LED가 켜진 어두운 상태를 유지하고 약 10cm에서 30cm로 멀어져도 빨간 LED가 계속 켜진다."
            }
          ]
        }
      ]
    },
    {
      "id": "E",
      "name": "초록 LED의 독립적인 PWM 제어",
      "maxUnits": 30,
      "items": [
        {
          "id": "E1",
          "title": "가변저항 입력으로 초록 LED 밝기 결정",
          "mode": "코드",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "E1.1",
              "units": 2,
              "criterion": "실제로 읽은 가변저항값을 초록 LED(D10)의 밝기 변환 입력으로 사용한다."
            },
            {
              "id": "E1.2",
              "units": 2,
              "criterion": "가변저항 입력 범위가 0~1023이다."
            }
          ]
        },
        {
          "id": "E2",
          "title": "최소 밝기 0",
          "mode": "코드",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "E2.1",
              "units": 2,
              "criterion": "초록 LED PWM 출력의 최소값을 0으로 설정한다."
            },
            {
              "id": "E2.2",
              "units": 2,
              "criterion": "변환식에 입력 0을 대입하면 결과가 PWM 0이다."
            }
          ]
        },
        {
          "id": "E3",
          "title": "최대 밝기 255",
          "mode": "코드",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "E3.1",
              "units": 2,
              "criterion": "초록 LED PWM 출력의 최대값을 255로 설정한다."
            },
            {
              "id": "E3.2",
              "units": 2,
              "criterion": "변환식에 입력 1023을 대입하면 결과가 PWM 255이다."
            }
          ]
        },
        {
          "id": "E4",
          "title": "초록 LED D10 PWM 출력 적용",
          "mode": "코드",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "E4.1",
              "units": 2,
              "criterion": "초록 LED PWM 출력 핀으로 D10을 사용한다."
            },
            {
              "id": "E4.2",
              "units": 2,
              "criterion": "analogWrite() 또는 동등한 PWM 출력 방법을 사용한다."
            },
            {
              "id": "E4.3",
              "units": 2,
              "criterion": "거리·조도 조건과 관계없이 실제 가변저항 변환값을 초록 LED D10에 출력한다."
            }
          ]
        },
        {
          "id": "E5",
          "title": "실제 초록 LED 밝기 변화·독립성",
          "mode": "실물",
          "maxUnits": 12,
          "subcriteria": [
            {
              "id": "E5.1",
              "units": 4,
              "criterion": "가변저항값이 낮을 때 초록 LED가 꺼지거나 약하게 켜진다(PWM 0 부근)."
            },
            {
              "id": "E5.2",
              "units": 2,
              "criterion": "가변저항값이 높으면 초록 LED가 밝게 켜진다."
            },
            {
              "id": "E5.3",
              "units": 6,
              "criterion": "거리·조도가 달라져도 가변저항값이 같으면 초록 LED 밝기가 같고, 가변저항 입력 증가에 따라 더 밝아진다."
            }
          ]
        }
      ]
    },
    {
      "id": "F",
      "name": "시리얼 출력과 부저 상태 확인",
      "maxUnits": 30,
      "items": [
        {
          "id": "F1",
          "title": "거리값 표시",
          "mode": "코드·실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "F1.1",
              "units": 2,
              "criterion": "출력 문자열로 측정 거리인 dist 값임을 구분할 수 있다."
            },
            {
              "id": "F1.2",
              "units": 2,
              "criterion": "시리얼 출력문이 실제 측정한 dist 변수를 사용한다."
            },
            {
              "id": "F1.3",
              "units": 2,
              "criterion": "실제 시리얼 모니터에 dist 값이 반복 출력된다."
            }
          ]
        },
        {
          "id": "F2",
          "title": "조도값 표시",
          "mode": "코드·실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "F2.1",
              "units": 2,
              "criterion": "출력 문자열에 cds 값을 구분하는 이름이 있으며 lux로 잘못 표시하지 않는다."
            },
            {
              "id": "F2.2",
              "units": 2,
              "criterion": "조도 출력문이 실제 A0에서 읽은 cds 변수를 사용한다."
            },
            {
              "id": "F2.3",
              "units": 2,
              "criterion": "실제 시리얼 모니터에 cds 값이 반복 출력된다."
            }
          ]
        },
        {
          "id": "F3",
          "title": "가변저항값 표시",
          "mode": "코드·실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "F3.1",
              "units": 2,
              "criterion": "출력 문자열에서 pot 값임을 구분할 수 있다."
            },
            {
              "id": "F3.2",
              "units": 2,
              "criterion": "가변저항 출력문이 A1에서 실제 읽은 pot 변수를 사용한다."
            },
            {
              "id": "F3.3",
              "units": 2,
              "criterion": "실제 시리얼 모니터에 pot 값이 반복 출력된다."
            }
          ]
        },
        {
          "id": "F4",
          "title": "초록 LED PWM 명령값 표시",
          "mode": "코드·실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "F4.1",
              "units": 2,
              "criterion": "출력 문자열에서 led 값이 초록 LED PWM 명령임을 구분할 수 있다."
            },
            {
              "id": "F4.2",
              "units": 2,
              "criterion": "출력문이 실제 D10에 analogWrite()한 led 변수를 사용한다."
            },
            {
              "id": "F4.3",
              "units": 2,
              "criterion": "실제 시리얼 모니터에 led 값이 반복 출력된다."
            }
          ]
        },
        {
          "id": "F5",
          "title": "거리 출력과 부저 동작 대응",
          "mode": "코드·실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "F5.1",
              "units": 2,
              "criterion": "시리얼 모니터의 dist 값으로 20cm 미만 또는 이상 상태를 구분할 수 있다."
            },
            {
              "id": "F5.2",
              "units": 2,
              "criterion": "모니터의 실제 dist 값이 20cm 미만이면 부저가 울리고 이상이면 멈추는 것을 확인한다."
            },
            {
              "id": "F5.3",
              "units": 2,
              "criterion": "동일 프로그램에서 거리 변화에 따라 시리얼 표시와 부저 상태가 함께 바뀌는 것을 확인한다."
            }
          ]
        }
      ]
    }
  ]
} as const;
