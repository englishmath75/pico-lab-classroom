export const assessmentData = {
  "schemaVersion": 4,
  "assessmentId": "A29-UNO-80-v1.1",
  "releaseStatus": "approval-required",
  "title": "스마트 야간 접근 경보 장치 만들기",
  "durationMinutes": 50,
  "studentCount": 29,
  "distanceLimitCm": 20,
  "lightLimitRaw": 400,
  "lightLimitVerified": false,
  "pwmMin": 50,
  "pwmMax": 255,
  "serialBaud": 9600,
  "pins": {
    "trig": 7,
    "echo": 8,
    "ledPwm": 9,
    "buzzer": 2,
    "cds": "A0",
    "pot": "A1"
  },
  "hardware": "Arduino Uno R3 / existing passive piezo",
  "requirements": [
    [
      "R1",
      "센서 입력",
      "HC-SR04로 거리값을 실제로 측정하고, CDS(A0)와 가변저항(A1)의 실제 아날로그 입력값을 읽어 사용한다. 센서 연결 대신 코드에 distance=15, light=100처럼 숫자를 직접 넣어 측정값을 대신하면 안 된다."
    ],
    [
      "R2",
      "거리 경보",
      "유효한 거리값이 20cm 미만이면 부저를 울린다. 20cm 이상이면 부저를 끈다. 밝기는 부저 동작에 영향을 주지 않는다."
    ],
    [
      "R3",
      "복합 LED 조건",
      "물체가 20cm 미만으로 가까이 있고, 동시에 주변이 어두운 경우에만 LED를 켠다. 둘 중 하나라도 만족하지 않으면 LED를 끈다."
    ],
    [
      "R4",
      "PWM 밝기 조절",
      "LED가 켜지는 조건에서는 가변저항 입력값 0~1023을 PWM 50~255로 변환한다. 여기서 50은 Arduino의 특별한 기준값이 아니라, 꺼짐(0)과 켜진 상태(50~255)를 명확히 구분하기 위한 이번 평가의 최소 밝기이다. 입력값이 증가하면 LED가 더 밝아져야 하며, LED가 꺼지는 조건의 출력값은 0이다."
    ],
    [
      "R5",
      "시리얼 표시",
      "9600 baud로 거리(cm), 조도 원시값, 가변저항 원시값, LED PWM 명령값, 부저 명령값을 이름과 함께 반복 출력한다."
    ],
    [
      "R6",
      "제출",
      "50분 안에 조립, 빈칸 완성, 컴파일, 업로드, 최종 .ino 파일 제출을 마친다. 미완성인 경우에도 종료 시점의 파일과 회로를 제출한다."
    ]
  ],
  "truthTable": [
    [
      "밝음",
      "20cm 이상",
      "0 · 꺼짐",
      "0 · 꺼짐"
    ],
    [
      "어두움",
      "20cm 이상",
      "0 · 꺼짐",
      "0 · 꺼짐"
    ],
    [
      "밝음",
      "20cm 미만",
      "0 · 꺼짐",
      "1 · 울림"
    ],
    [
      "어두움",
      "20cm 미만",
      "50~255 · 가변저항에 따름",
      "1 · 울림"
    ]
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
          "title": "LED와 직렬 저항",
          "mode": "배선",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "A5.1",
              "units": 2,
              "criterion": "D9에서 LED를 거쳐 GND로 이어지는 경로와 LED 극성이 맞다."
            },
            {
              "id": "A5.2",
              "units": 2,
              "criterion": "220Ω 저항이 LED와 직렬이며 저항을 우회하는 배선이 없다."
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
      "name": "거리·밝기 복합 판단",
      "maxUnits": 40,
      "items": [
        {
          "id": "D1",
          "title": "밝음·원거리 판단",
          "mode": "코드",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "D1.1",
              "units": 2,
              "criterion": "실제 거리값에 따른 원거리 처리 경로가 있다."
            },
            {
              "id": "D1.2",
              "units": 4,
              "criterion": "밝음·20cm 이상 상태에서 최종 LED 명령값이 0이다."
            }
          ]
        },
        {
          "id": "D2",
          "title": "어두움·원거리 판단",
          "mode": "코드",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "D2.1",
              "units": 2,
              "criterion": "어둡더라도 원거리이면 LED 점등을 배제하는 경로가 있다."
            },
            {
              "id": "D2.2",
              "units": 4,
              "criterion": "어두움·20cm 이상 상태에서 최종 LED 명령값이 0이다."
            }
          ]
        },
        {
          "id": "D3",
          "title": "밝음·근거리 판단",
          "mode": "코드",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "D3.1",
              "units": 2,
              "criterion": "조도값이 기준값 이상이면 밝음으로 처리하며 경계값을 포함한다."
            },
            {
              "id": "D3.2",
              "units": 4,
              "criterion": "밝음·20cm 미만 상태에서 최종 LED 명령값이 0이다."
            }
          ]
        },
        {
          "id": "D4",
          "title": "어두움·근거리 판단",
          "mode": "코드",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "D4.1",
              "units": 2,
              "criterion": "가까움과 어두움이 동시에 만족할 때의 점등 경로를 구현한다."
            },
            {
              "id": "D4.2",
              "units": 4,
              "criterion": "그 경로에서 최종 LED 명령값을 양수로 결정한다."
            }
          ]
        },
        {
          "id": "D5",
          "title": "복합 조건 실제 점등",
          "mode": "실물",
          "maxUnits": 8,
          "subcriteria": [
            {
              "id": "D5.1",
              "units": 4,
              "criterion": "어둡고 약 10cm인 상태에서 LED가 실제로 켜진다."
            },
            {
              "id": "D5.2",
              "units": 4,
              "criterion": "가까운 거리를 유지하고 밝음에서 어두움으로 바꾸면 다시 켜진다."
            }
          ]
        },
        {
          "id": "D6",
          "title": "밝게 하면 LED 꺼짐",
          "mode": "실물",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "D6.1",
              "units": 4,
              "criterion": "같은 프로그램에서 점등을 확인한 뒤 거리는 가까이 유지하고 밝게 하면 LED가 꺼진다."
            }
          ]
        },
        {
          "id": "D7",
          "title": "멀어지면 LED 꺼짐",
          "mode": "실물",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "D7.1",
              "units": 4,
              "criterion": "같은 프로그램에서 점등을 확인한 뒤 어둠은 유지하고 약 30cm로 옮기면 LED가 꺼진다."
            }
          ]
        }
      ]
    },
    {
      "id": "E",
      "name": "가변저항·PWM 제어",
      "maxUnits": 30,
      "items": [
        {
          "id": "E1",
          "title": "밝기 변환의 입력",
          "mode": "코드",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "E1.1",
              "units": 2,
              "criterion": "실제로 읽은 가변저항값을 밝기 변환의 입력으로 사용한다."
            },
            {
              "id": "E1.2",
              "units": 2,
              "criterion": "변환 입력 범위가 0~1023이다."
            }
          ]
        },
        {
          "id": "E2",
          "title": "최소 밝기 50",
          "mode": "코드",
          "maxUnits": 4,
          "subcriteria": [
            {
              "id": "E2.1",
              "units": 2,
              "criterion": "밝기 변환의 출력 하한을 50으로 설정한다."
            },
            {
              "id": "E2.2",
              "units": 2,
              "criterion": "제출한 변환식에 입력 0을 대입하면 결과가 50이다."
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
              "criterion": "밝기 변환의 출력 상한을 255로 설정한다."
            },
            {
              "id": "E3.2",
              "units": 2,
              "criterion": "제출한 변환식에 입력 1023을 대입하면 결과가 255이다."
            }
          ]
        },
        {
          "id": "E4",
          "title": "PWM 출력 적용",
          "mode": "코드",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "E4.1",
              "units": 2,
              "criterion": "LED PWM 출력 핀으로 D9를 사용한다."
            },
            {
              "id": "E4.2",
              "units": 2,
              "criterion": "analogWrite 또는 동등한 PWM 출력 방법을 사용한다."
            },
            {
              "id": "E4.3",
              "units": 2,
              "criterion": "조건 판단까지 거친 최종 LED 명령값을 출력에 사용한다."
            }
          ]
        },
        {
          "id": "E5",
          "title": "실제 LED 밝기 변화",
          "mode": "실물",
          "maxUnits": 12,
          "subcriteria": [
            {
              "id": "E5.1",
              "units": 4,
              "criterion": "어두움·근거리에서 가변저항의 낮은 값일 때 LED가 약하게 켜진다."
            },
            {
              "id": "E5.2",
              "units": 2,
              "criterion": "같은 조건에서 높은 값일 때 LED가 켜진다."
            },
            {
              "id": "E5.3",
              "units": 6,
              "criterion": "낮은 값과 높은 값을 연속 비교하면 입력 증가에 따라 실제 LED가 더 밝아진다."
            }
          ]
        }
      ]
    },
    {
      "id": "F",
      "name": "시리얼 출력",
      "maxUnits": 30,
      "items": [
        {
          "id": "F1",
          "title": "거리 표시",
          "mode": "코드·실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "F1.1",
              "units": 2,
              "criterion": "출력에 거리라는 의미와 cm 단위를 구분할 수 있는 이름이 있다."
            },
            {
              "id": "F1.2",
              "units": 2,
              "criterion": "거리 출력문이 distance 또는 같은 역할의 측정 변수를 사용한다."
            },
            {
              "id": "F1.3",
              "units": 2,
              "criterion": "실제 시리얼 모니터에 거리값이 반복 출력된다."
            }
          ]
        },
        {
          "id": "F2",
          "title": "조도 표시",
          "mode": "코드·실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "F2.1",
              "units": 2,
              "criterion": "출력 이름이 조도 원시값임을 구분하게 하며 lux로 잘못 표시하지 않는다."
            },
            {
              "id": "F2.2",
              "units": 2,
              "criterion": "조도 출력문이 light 또는 같은 역할의 측정 변수를 사용한다."
            },
            {
              "id": "F2.3",
              "units": 2,
              "criterion": "실제 시리얼 모니터에 조도값이 반복 출력된다."
            }
          ]
        },
        {
          "id": "F3",
          "title": "가변저항 표시",
          "mode": "코드·실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "F3.1",
              "units": 2,
              "criterion": "출력 이름으로 가변저항의 원시값임을 구분할 수 있다."
            },
            {
              "id": "F3.2",
              "units": 2,
              "criterion": "가변저항 출력문이 pot 또는 같은 역할의 측정 변수를 사용한다."
            },
            {
              "id": "F3.3",
              "units": 2,
              "criterion": "실제 시리얼 모니터에 가변저항값이 반복 출력된다."
            }
          ]
        },
        {
          "id": "F4",
          "title": "LED 명령값 표시",
          "mode": "코드·실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "F4.1",
              "units": 2,
              "criterion": "출력 이름이 LED PWM 명령값임을 구분하게 한다."
            },
            {
              "id": "F4.2",
              "units": 2,
              "criterion": "출력문이 ledPwm 또는 실제 출력에 사용한 같은 역할의 변수를 사용한다."
            },
            {
              "id": "F4.3",
              "units": 2,
              "criterion": "실제 시리얼 모니터에 LED PWM 명령값이 반복 출력된다."
            }
          ]
        },
        {
          "id": "F5",
          "title": "부저 명령값 표시",
          "mode": "코드·실물",
          "maxUnits": 6,
          "subcriteria": [
            {
              "id": "F5.1",
              "units": 2,
              "criterion": "출력 이름이 부저 명령임을 구분하게 하며 0/1 또는 OFF/ON 의미가 명확하다."
            },
            {
              "id": "F5.2",
              "units": 2,
              "criterion": "출력문이 alarm 또는 실제 제어에 사용한 같은 역할의 변수를 사용한다."
            },
            {
              "id": "F5.3",
              "units": 2,
              "criterion": "실제 시리얼 모니터에 부저 명령값이 반복 출력된다."
            }
          ]
        }
      ]
    }
  ],
  "rules": [
    "평가 시간은 학생 1인당 50분이다. 공통 안내와 장비 지급·점검은 시작 전에 실시한다. 45분은 저장·제출 권고 안내일 뿐, 조기 마감 시간이 아니다.",
    "완료 속도에 따른 가산점·감점은 없다. 교사의 채점 대기 시간도 감점하지 않는다. 종료 후에는 학생이 회로와 코드를 수정할 수 없다.",
    "허용 자료는 공통 문제지, 핀 연결표, 함수 도움말, 제공된 빈칸 코드이다. 생성형 AI, 타인 코드, 메신저 협업, 개인 완성 코드 반입은 허용하지 않는 안이며 시행 전에 전원에게 동일하게 안내한다.",
    "코드 항목과 실물 동작 항목은 따로 채점한다. 실행에 실패했더라도 제출 코드에서 확인할 수 있는 올바른 요소는 인정한다. 교사가 코드를 수정하여 실행시킨 결과는 제출 당시의 실물 성공 점수로 인정하지 않는다.",
    "세부 항목은 충족 시 표시된 점수, 미충족 시 0점이다. 배선은 색·구멍 위치가 아니라 전기적 연결을 본다. 코드의 변수 이름·들여쓰기·동등한 표현은 의미가 같으면 인정한다.",
    "항상 꺼진 LED나 미연결 부저는 정상 복귀 성공으로 인정하지 않는다. 동일한 원본 프로그램에서 먼저 켜짐·울림을 확인한 뒤 꺼짐을 검사한다.",
    "장비 불량·외부 간섭·교사 점검 지연은 미충족이 아니라 판정 보류로 기록한다. 교사가 확인한 비학생 귀책의 손실 시간은 기록하고 동일 기준으로 보전한다.",
    "기본점수 적용 대상에게 기본 80.0점과 실습 성취점수 20.0점을 합산하여 총 100.0점으로 기록하는 검토안이다. 학교 승인·기본점수 적용 여부·소수점 처리는 별도 확인한다. 성취점수에 다시 20%를 곱하지 않으며 학기 반영비율은 학교의 확정 계획에 따른다."
  ],
  "checklist": [
    "초음파센서, CDS, 가변저항 세 장치를 모두 연결했다.",
    "LED의 직렬 저항과 전원·GND 연결을 확인했다.",
    "12개 빈칸을 모두 완성하고 컴파일·업로드했다.",
    "밝음·원거리 / 어두움·원거리 / 밝음·근거리 / 어두움·근거리를 확인했다.",
    "어둡고 가까운 상태에서 가변저항으로 LED 밝기를 바꾸어 보았다.",
    "점등·울림 상태에서 다시 밝게 하거나 멀리하여 정상 복귀를 확인했다.",
    "시리얼 모니터에 다섯 값이 이름과 함께 반복 출력된다.",
    "실제 업로드한 것과 같은 최종 .ino 파일을 지정된 제출처에 제출했다.",
    "미완성이라도 현재 파일을 제출하고, 50분 이후에는 배선과 코드를 수정하지 않는다."
  ],
  "officialPolicy": {
    "approved": false,
    "minimumScore": null,
    "weight": null,
    "conversion": null
  },
  "sources": [
    [
      "Arduino 공식 analogWrite 문서",
      "https://github.com/arduino/reference-en/blob/master/Language/Functions/Analog%20IO/analogWrite.adoc"
    ],
    [
      "Arduino 공식 tone 문서",
      "https://github.com/arduino/reference-en/blob/master/Language/Functions/Advanced%20IO/tone.adoc"
    ],
    [
      "Arduino 공식 map 문서",
      "https://github.com/arduino/reference-en/blob/master/Language/Functions/Math/map.adoc"
    ],
    [
      "Adafruit Using a Photocell",
      "https://learn.adafruit.com/photocells/using-a-photocell"
    ],
    [
      "GitHub Pages 공식 소개",
      "https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages"
    ],
    [
      "MaxBotix 다중 초음파센서 안내(일반 간섭 원리 참고; HC-SR04 전용 검증 아님)",
      "https://maxbotix.com/blogs/blog/using-multiple-ultrasonic-sensors"
    ]
  ],
  "baseScoreUnits": 800,
  "achievementMaxUnits": 200,
  "totalMaxUnits": 1000,
  "unitsPerPoint": 10,
  "schoolApprovalVerified": false,
  "decimalHandlingVerified": false,
  "approvalDate": null,
  "studentNoticeDate": null,
  "commonRules": [
    {
      "title": "기본점수와 적용 대상",
      "text": "학교가 승인한 동일한 참여 기준을 충족한 응시 학생에게 기본점수 80.0점을 적용하는 안이다. 미완성 작품도 평가 대상으로 인정한다. 결시·전혀 미참여·부정행위 등의 처리는 학교 규정을 따르며, 이 표만으로 자동 80점을 부여하지 않는다."
    },
    {
      "title": "세부 점수는 충족분만 합산",
      "text": "번호가 붙은 하위 기준별로 충족 시 0.2·0.4·0.6점, 미충족 시 0.0점을 기록한다. 상위 항목은 하위 점수의 합이다. 0.4점 하위 기준을 임의로 0.2점만 인정하거나, 0.2점을 다시 0.1점으로 나누는 등 표에 없는 부분점수는 부여하지 않는다."
    },
    {
      "title": "미검사와 보류는 0점이 아님",
      "text": "미검사·장비 문제 보류는 아직 결정되지 않은 상태다. 미판정이 있으면 점수를 확정하지 않는다. 관찰을 하지 못했다는 사정만으로 미충족을 결정하지 않는다."
    },
    {
      "title": "제출 코드와 실물 동작의 분리",
      "text": "컴파일·업로드 실패가 있어도 원본에서 의미를 확인할 수 있는 코드·배선 항목은 인정한다. 실물 항목은 수정하지 않은 제출 프로그램과 회로에서 확인한다. 교사가 고친 프로그램의 성공은 원래 제출물의 실물 성공으로 인정하지 않는다."
    },
    {
      "title": "꺼져 있다는 사실만으로 정상 복귀를 인정하지 않음",
      "text": "C3.1은 C2.1의 울림, C3.2는 C2.2의 울림을 먼저 확인한다. D6·D7은 같은 프로그램의 LED 점등을 먼저 확인한다. 항상 꺼진 LED, 미연결 부저 등은 정상 복귀 점수를 받지 않는다."
    },
    {
      "title": "조건 판단의 평가",
      "text": "D1~D4는 실제 입력값으로 LED의 켜짐·꺼짐 경로를 구분하는 프로그램을 평가한다. 무조건 0만 출력하거나 LED 제어를 생략한 코드는 일부 상태에서 값이 0이라는 이유만으로 해당 조건 판단을 충족한 것으로 보지 않는다. 경로의 일부가 맞으면 그 하위 기준만 인정한다."
    },
    {
      "title": "동일 원인과 별도 오류 벌점",
      "text": "한 원인 때문에 배선과 여러 동작이 함께 미충족될 수는 있다. 이때 공개된 각 항목의 증거로만 판정하고, 별도의 “오류 1건당 감점”을 추가하지 않는다. 관련 없는 코드 항목까지 일괄 0점 처리하지 않는다."
    },
    {
      "title": "동등한 답과 물리적 배치",
      "text": "변수명·들여쓰기·문자열 언어·전선 색·구멍 위치는 평가하지 않는다. 같은 전기적 연결, 중첩 if와 논리곱 등 같은 의미의 코드, 같은 결과의 변환식을 인정한다. 평가용 핀 D7/D8/D9/D2/A0/A1은 공개한 연결표에 따른다."
    },
    {
      "title": "검사 조건과 기기 편차",
      "text": "가변저항의 좌우 회전 방향, 센서값의 작은 흔들림, LED·부저의 개체별 밝기·음량 차이는 점수 차이의 근거가 아니다. 입력 0·1023과 PWM 50·255는 코드로 확인한다. 실물에서 정확히 끝값에 도달하도록 요구하지 않는다."
    },
    {
      "title": "제출 시간과 검사 대기",
      "text": "제작·제출은 공통 50분이다. 45분 안내는 제출 준비 권고이며 작업을 중단시키지 않는다. 조기 완성 가산점, 마감 안의 늦은 완성 감점, 교사 검사 대기 감점은 없다. 마감 후 학생의 코드·배선 수정은 금지한다."
    },
    {
      "title": "재확인과 외부 원인",
      "text": "판정이 불명확하면 같은 원본·같은 검사 조건으로 1회 재확인한다. 유효한 검사에서 해당 동작이 확인되면 인정한다. 장비 불량·외부 간섭·교사에 의한 훼손이 확인되면 보류하고, 원본과 교체 내역을 남겨 불이익 없이 재검사한다. 학생에게 추가로 정답을 고칠 기회를 주는 것과 구별한다."
    },
    {
      "title": "결과 공개와 이의신청",
      "text": "학생에게 하위 항목 ID, 인정 점수, 미충족 근거, 보류 여부를 함께 안내한다. 이의신청 기간과 절차는 학교가 공지한 기준을 따른다. 동일 기준을 모두 충족하면 모두 만점을 부여하며, 서열을 만들기 위한 추가 감점은 하지 않는다."
    }
  ],
  "testSequence": [
    [
      "T1",
      "밝음·약 30cm",
      "LED 꺼짐 / 부저 꺼짐",
      "초음파 원거리값·밝은 조도값 확인"
    ],
    [
      "T2",
      "밝음·약 10cm",
      "LED 꺼짐 / 부저 울림",
      "C2.1·B6 근거리값 확인"
    ],
    [
      "T3",
      "T2 후 밝음·약 30cm",
      "부저 멈춤",
      "C3.1 정상 복귀 확인"
    ],
    [
      "T4",
      "어두움·약 10cm",
      "LED 켜짐 / 부저 울림",
      "C2.2·D5.1, 낮음→높음으로 가변저항 조작(E5)"
    ],
    [
      "T5",
      "T4 후 근거리 유지·밝게",
      "LED 꺼짐 / 부저 울림",
      "D6 확인"
    ],
    [
      "T6",
      "T5 후 근거리 유지·다시 가림",
      "LED 다시 켜짐 / 부저 울림",
      "D5.2 확인"
    ],
    [
      "T7",
      "T6 후 어둠 유지·약 30cm",
      "LED 꺼짐 / 부저 멈춤",
      "D7·C3.2 확인"
    ]
  ],
  "gradingPolicy": "최소 채점 간격 0.2점, 표시는 소수 첫째 자리. 각 하위 기준은 충족/미충족/미검사/보류. 임의 0.1점 분할 금지. 미판정은 0점 아님. 기본점수 적용 대상 확인 전 최종점수 확정 금지.",
  "prerequisitesAnyOf": {
    "C3.1": [
      "C2.1"
    ],
    "C3.2": [
      "C2.2"
    ],
    "D6.1": [
      "D5.1",
      "D5.2"
    ],
    "D7.1": [
      "D5.1",
      "D5.2"
    ]
  },
  "minimumAwardUnits": 2
} as const;

export const studentStarterCode = "// A29-UNO-80-v1.1 | Arduino Uno R3 | Student starter\n// Replace __01__ ... __12__. This file will not compile before completion.\n// Pins: TRIG D7, ECHO D8, LED D9, passive piezo D2, CDS A0, POT A1.\nconst int LIGHT_LIMIT = 400;\n\nvoid setup() {\n  pinMode(7, OUTPUT);\n  pinMode(8, INPUT);\n  pinMode(9, OUTPUT);\n  pinMode(2, OUTPUT);\n  digitalWrite(7, LOW);\n  analogWrite(9, 0);\n  noTone(2);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int light = __01__(A0);\n  int pot = __02__(A1);\n  int brightness = map(pot, 0, 1023, __03__, __04__);\n\n  digitalWrite(7, LOW);\n  delayMicroseconds(2);\n  digitalWrite(7, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(7, LOW);\n  long duration = pulseIn(8, HIGH);\n  float distance = duration * 0.034 / 2;\n\n  int ledPwm = 0;\n  int alarm = 0;\n\n  if (duration > 0) {\n    if (__05__) {\n      alarm = 1;\n      if (__06__) {\n        ledPwm = __07__;\n      }\n    }\n  }\n\n  analogWrite(9, __08__);\n  if (alarm == 1) {\n    __09__(2, 1000);\n  } else {\n    __10__(2);\n  }\n\n  Serial.print(\"DIST_CM=\");\n  if (duration > 0) {\n    Serial.print(__11__);\n  } else {\n    Serial.print(\"N/A\");\n  }\n  Serial.print(\" LIGHT_RAW=\"); Serial.print(__12__);\n  Serial.print(\" POT_RAW=\"); Serial.print(pot);\n  Serial.print(\" LED_PWM_CMD=\"); Serial.print(ledPwm);\n  Serial.print(\" BUZZER_CMD=\"); Serial.println(alarm);\n  delay(200);\n}\n";
