/* Code prediction and fill-in review exercises. */
window.AASL_CODE_CHALLENGES = [
  {
    "lesson": 1,
    "items": [
      {
        "question": "이 코드에서 점수가 가장 낮은 과목을 고르는 함수는?",
        "code": "weak = ___(scores, key=scores.get)",
        "answers": [
          "min"
        ],
        "hint": "값 중 가장 작은 항목을 찾습니다.",
        "explanation": "min(scores, key=scores.get)는 값이 최소인 딕셔너리 키를 선택합니다."
      },
      {
        "question": "점수 출력에서 딕셔너리 값을 꺼내는 표현은?",
        "code": "print(scores[___])",
        "answers": [
          "weak"
        ],
        "hint": "앞에서 고른 과목 변수 이름입니다.",
        "explanation": "weak에는 과목명이 저장되어 있으므로 scores[weak]로 점수를 가져옵니다."
      }
    ]
  },
  {
    "lesson": 2,
    "items": [
      {
        "question": "현재 점수 중 가장 높은 과목을 찾으려면?",
        "code": "subject = ___(request['input'], key=request['input'].get)",
        "answers": [
          "max"
        ],
        "hint": "최댓값을 구하는 내장 함수입니다.",
        "explanation": "max는 가장 큰 값을 가진 키를 선택합니다."
      },
      {
        "question": "딕셔너리에 목표 문장을 꺼내려면?",
        "code": "print(request['___'])",
        "answers": [
          "goal"
        ],
        "hint": "요청의 목적을 나타내는 영어 단어입니다.",
        "explanation": "request['goal']은 목표 설명을 반환합니다."
      }
    ]
  },
  {
    "lesson": 3,
    "items": [
      {
        "question": "리스트 원소 수를 구하려면?",
        "code": "count = ___(scores)",
        "answers": [
          "len"
        ],
        "hint": "length의 줄임말입니다.",
        "explanation": "len은 리스트의 길이를 반환합니다."
      },
      {
        "question": "평균을 구하기 위한 총합 함수는?",
        "code": "avg = ___(scores) / len(scores)",
        "answers": [
          "sum"
        ],
        "hint": "sum이라는 파이썬 내장 함수입니다.",
        "explanation": "sum(scores)는 리스트 숫자의 합입니다."
      }
    ]
  },
  {
    "lesson": 4,
    "items": [
      {
        "question": "pandas를 pd로 불러오는 문장은?",
        "code": "import pandas as ___",
        "answers": [
          "pd"
        ],
        "hint": "pandas의 관례적 별칭입니다.",
        "explanation": "pandas 라이브러리의 별칭으로 pd를 사용합니다."
      },
      {
        "question": "score 열의 평균을 구하는 메서드는?",
        "code": "df['score'].___()",
        "answers": [
          "mean"
        ],
        "hint": "평균을 의미하는 영어 단어입니다.",
        "explanation": "Series.mean()은 평균을 계산합니다."
      }
    ]
  },
  {
    "lesson": 5,
    "items": [
      {
        "question": "막대그래프 함수는?",
        "code": "plt.___(subjects, scores)",
        "answers": [
          "bar"
        ],
        "hint": "bar chart를 떠올려 보세요.",
        "explanation": "plt.bar(x,y)는 막대그래프를 그립니다."
      },
      {
        "question": "그래프의 y축 범위를 설정하는 함수는?",
        "code": "plt.___(0, 100)",
        "answers": [
          "ylim"
        ],
        "hint": "y와 limit의 결합입니다.",
        "explanation": "plt.ylim(0,100)은 세로축 범위 설정입니다."
      }
    ]
  },
  {
    "lesson": 6,
    "items": [
      {
        "question": "passed처럼 모델이 맞혀야 할 결과를 무엇이라 하나요?",
        "code": "# 정답 값 리스트 이름\n___ = [0, 0, 1, 1]",
        "answers": [
          "y"
        ],
        "hint": "지도학습 코드에서는 보통 y라는 변수를 씁니다.",
        "explanation": "y는 정답 레이블을 담는 관례적인 변수입니다."
      },
      {
        "question": "for 반복문 다음에 들여 쓴 내용을 수행하려면?",
        "code": "___ item in samples:\n    print(item['minutes'])",
        "answers": [
          "for"
        ],
        "hint": "반복을 시작하는 키워드입니다.",
        "explanation": "for ... in ... 문법으로 원소를 차례대로 처리합니다."
      }
    ]
  },
  {
    "lesson": 7,
    "items": [
      {
        "question": "머신러닝 모델을 학습하는 메서드는?",
        "code": "model.___(X, y)",
        "answers": [
          "fit"
        ],
        "hint": "학습시키기·맞추기를 의미합니다.",
        "explanation": "fit은 특징 X와 레이블 y로 모델을 학습합니다."
      },
      {
        "question": "새 데이터를 예측하는 메서드는?",
        "code": "model.___([[70]])",
        "answers": [
          "predict"
        ],
        "hint": "예측하다의 영어 단어입니다.",
        "explanation": "predict는 학습된 모델로 결과를 예측합니다."
      }
    ]
  },
  {
    "lesson": 8,
    "items": [
      {
        "question": "함수의 계산 결과를 호출한 곳으로 돌려주려면?",
        "code": "def simulate(total, rate):\n    ___ round(total * rate)",
        "answers": [
          "return"
        ],
        "hint": "함수의 반환문입니다.",
        "explanation": "return은 계산 결과를 반환합니다."
      },
      {
        "question": "정답률 목록을 순서대로 반복하려면?",
        "code": "___ rate in [0.5, 0.7, 0.9]:\n    print(rate)",
        "answers": [
          "for"
        ],
        "hint": "반복문의 첫 번째 키워드입니다.",
        "explanation": "for 반복문은 원소별 실행을 합니다."
      }
    ]
  },
  {
    "lesson": 9,
    "items": [
      {
        "question": "조건을 확인하는 예약어는?",
        "code": "___ request == '취약 과목':\n    result = weak_subject_tool(scores)",
        "answers": [
          "if"
        ],
        "hint": "만약 ~라면이라는 뜻입니다.",
        "explanation": "if는 조건이 참이면 블록을 실행합니다."
      },
      {
        "question": "딕셔너리 값 중 최솟값의 키를 찾으려면?",
        "code": "return ___(scores, key=scores.get)",
        "answers": [
          "min"
        ],
        "hint": "최솟값 함수입니다.",
        "explanation": "min에 key=를 적용하면 값이 작은 키를 선택합니다."
      }
    ]
  },
  {
    "lesson": 10,
    "items": [
      {
        "question": "DataFrame 열의 평균 메서드는?",
        "code": "df['score'].___()",
        "answers": [
          "mean"
        ],
        "hint": "평균을 뜻합니다.",
        "explanation": "mean()은 점수 열의 산술평균을 계산합니다."
      },
      {
        "question": "가장 낮은 점수가 있는 행의 인덱스를 찾으려면?",
        "code": "df['score'].___()",
        "answers": [
          "idxmin"
        ],
        "hint": "index minimum이라는 뜻입니다.",
        "explanation": "idxmin()은 최솟값 위치의 인덱스를 반환합니다."
      }
    ]
  },
  {
    "lesson": 11,
    "items": [
      {
        "question": "입력 scores가 비어 있으면 참이 되는 조건은?",
        "code": "if ___ scores:\n    return '데이터가 없습니다.'",
        "answers": [
          "not"
        ],
        "hint": "참·거짓을 뒤집는 논리 연산자입니다.",
        "explanation": "not scores는 빈 딕셔너리에서 True입니다."
      },
      {
        "question": "숫자 범위를 포함해 검사할 때 사용하는 연산자는?",
        "code": "if not 0 ___ score <= 100:\n    return '범위를 확인하세요.'",
        "answers": [
          "<="
        ],
        "hint": "작거나 같다는 비교입니다.",
        "explanation": "연쇄 비교 0 <= score <= 100은 0부터 100까지입니다."
      }
    ]
  },
  {
    "lesson": 12,
    "items": [
      {
        "question": "80점 이상 값만 필터링할 비교 연산자는?",
        "code": "selected = [x for x in scores if x ___ 80]",
        "answers": [
          ">="
        ],
        "hint": "같은 값 80도 포함합니다.",
        "explanation": ">=는 이상을 뜻합니다."
      },
      {
        "question": "선택된 값의 원소 개수는 어떤 함수로 구하나요?",
        "code": "print(___(selected))",
        "answers": [
          "len"
        ],
        "hint": "리스트의 길이를 구합니다.",
        "explanation": "len은 리스트 원소 개수입니다."
      }
    ]
  }
];
