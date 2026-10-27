/* Canonical ten-lesson course; existing lesson numbers retained. */
window.COURSE_LESSONS = [
  {
    "title": "Pandas 시작 · 행·열·인덱스",
    "goal": "작은 DataFrame을 만들고, 데이터 3행·2열과 행의 이름표인 인덱스를 구별합니다.",
    "dataset": "school_store_fictional.csv",
    "steps": [
      {
        "title": "Pandas 불러오기",
        "guide": "첫 줄에 Pandas를 pd라는 이름으로 불러오세요.",
        "append": "import pandas as pd",
        "question": "아직 출력 문장이 없는데 오류 없이 실행되면 무엇을 의미할까요?",
        "hint": "import는 데이터 분석 도구를 준비합니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "매점 데이터를 표로 만들기",
        "guide": "다음 줄에 매점의 상품과 판매량을 사용해 DataFrame을 만드세요.",
        "append": "df = pd.DataFrame({'item':['juice','bread','milk'],'sales':[12,20,16]})",
        "question": "표에 몇 개의 행과 열이 있을까요?",
        "hint": "DataFrame은 행과 열이 있는 2차원 자료구조입니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "표 전체 출력",
        "guide": "지금까지 코드를 유지한 채 print 함수로 df를 출력하세요.",
        "append": "print(df)",
        "question": "인덱스 번호가 0부터 시작하나요?",
        "hint": "print는 실제 프로그램 출력창에 데이터를 보여 줍니다.",
        "expected": "item  sales\n0  juice     12\n1  bread     20\n2   milk     16",
        "plot": false
      },
      {
        "title": "행과 열의 개수 확인",
        "guide": "표 아래에서 shape를 출력하고 (행 개수, 열 개수)를 확인하세요.",
        "append": "print(df.shape)",
        "question": "왜 (3, 3)이 아니라 (3, 2)일까요?",
        "hint": "왼쪽 인덱스는 데이터 열이 아니고, 맨 위 열 이름은 데이터 행이 아닙니다. shape는 함수가 아니므로 ()를 붙이지 않습니다.",
        "expected": "item  sales\n0  juice     12\n1  bread     20\n2   milk     16\n(3, 2)",
        "plot": false
      },
      {
        "title": "인덱스를 1부터 시작하기",
        "guide": "행의 이름표를 1, 2, 3으로 바꾸고 표와 크기를 다시 출력하세요.",
        "append": "df.index = range(1, len(df) + 1)\nprint(df)\nprint(df.shape)",
        "question": "이름표를 바꾸면 행·열의 개수도 달라질까요?",
        "hint": "range의 끝값은 포함하지 않습니다. len(df)는 3이므로 range(1, 4)는 1, 2, 3입니다. 크기는 여전히 (3, 2)입니다.",
        "expected": "item  sales\n0  juice     12\n1  bread     20\n2   milk     16\n(3, 2)\n    item  sales\n1  juice     12\n2  bread     20\n3   milk     16\n(3, 2)",
        "plot": false
      }
    ],
    "concepts": [
      "pandas는 표 데이터를 다루는 파이썬 라이브러리입니다. import pandas as pd에서 pd는 별칭입니다.",
      "DataFrame은 행과 열이 있는 2차원 표입니다. 딕셔너리의 키는 열 이름, 같은 길이의 리스트는 각 열의 값이 됩니다.",
      "인덱스는 행의 이름표입니다. 인덱스와 열 이름은 데이터의 행·열 개수에 포함되지 않습니다."
    ],
    "quiz": [
      [
        "표가 상품 3개와 item·sales 두 열로 구성됩니다. shape는?",
        [
          "(3, 2)",
          "(4, 3)",
          "(3, 3)"
        ],
        0,
        "인덱스는 열 수에, 열 이름은 행 수에 포함하지 않습니다."
      ],
      [
        "인덱스를 1, 2, 3으로 바꾸면?",
        [
          "데이터가 한 행 늘어남",
          "열이 하나 늘어남",
          "표 크기는 그대로"
        ],
        2,
        "행의 이름표만 바뀌므로 (3, 2) 그대로입니다."
      ]
    ],
    "reading": "lesson01-guide.html#basics",
    "fullCode": "import pandas as pd\ndf = pd.DataFrame({'item':['juice','bread','milk'],'sales':[12,20,16]})\nprint(df)\nprint(df.shape)\ndf.index = range(1, len(df) + 1)\nprint(df)\nprint(df.shape)\n"
  },
  {
    "title": "표 살펴보기 · Series와 평균",
    "goal": "열 선택, 행·열 개수, 평균을 확인하며 표 형태의 데이터를 다룹니다.",
    "dataset": "school_store_fictional.csv",
    "steps": [
      {
        "title": "Pandas 시작",
        "guide": "분석에 사용할 pandas를 불러오세요.",
        "append": "import pandas as pd",
        "question": "왜 모듈에 짧은 별칭을 붙일까요?",
        "hint": "pd는 pandas라는 긴 이름을 줄인 별칭입니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "DataFrame 만들기",
        "guide": "매점 상품 세 가지의 가격을 표로 만드세요.",
        "append": "df = pd.DataFrame({'item':['A','B','C'],'price':[1000,1500,2000]})",
        "question": "행 개수와 열 개수를 예측하세요.",
        "hint": "딕셔너리의 키가 DataFrame의 열 이름이 됩니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "앞의 두 행과 크기",
        "guide": "처음 두 행과 전체 표의 크기를 출력하세요.",
        "append": "print(df.head(2))\nprint(df.shape)",
        "question": "head(2)가 원본 df의 행을 삭제할까요?",
        "hint": "head(2)는 앞 두 행을 반환합니다. df에 다시 대입하지 않았으므로 원본 크기는 (3, 2)입니다.",
        "expected": "item  price\n0    A   1000\n1    B   1500\n(3, 2)",
        "plot": false
      },
      {
        "title": "열 이름과 한 열 선택",
        "guide": "열 이름을 확인하고 price 열을 선택해 출력하세요.",
        "append": "print(df.columns.tolist())\nprint(df['price'])",
        "question": "한 열을 선택한 결과에도 인덱스가 있나요?",
        "hint": "df['price']는 1차원 Series입니다. df[['price']]는 열 하나를 가진 2차원 DataFrame입니다.",
        "expected": "item  price\n0    A   1000\n1    B   1500\n(3, 2)\n['item', 'price']\n0    1000\n1    1500\n2    2000\nName: price, dtype: int64",
        "plot": false
      },
      {
        "title": "가격 평균 계산",
        "guide": "price 열의 평균을 계산하세요.",
        "append": "print(df['price'].mean())",
        "question": "평균은 얼마일까요?",
        "hint": "한 열을 선택한 뒤 mean()을 적용합니다.",
        "expected": "item  price\n0    A   1000\n1    B   1500\n(3, 2)\n['item', 'price']\n0    1000\n1    1500\n2    2000\nName: price, dtype: int64\n1500.0",
        "plot": false
      }
    ],
    "concepts": [
      "head(2)는 앞 두 행을 반환하고 head()의 기본값은 앞 다섯 행입니다. 원본 표를 자동으로 줄이지 않습니다.",
      "df['price']는 1차원 Series, df[['price']]는 2차원 DataFrame입니다.",
      "mean()은 선택한 수치 열의 평균입니다. 문자열이 든 전체 표보다 계산할 열을 먼저 지정하세요."
    ],
    "quiz": [
      [
        "df['price']의 자료구조는?",
        [
          "Series",
          "DataFrame",
          "CSV 파일"
        ],
        0,
        "한 열을 문자열로 선택하면 Series입니다."
      ],
      [
        "1000, 1500, 2000의 평균은?",
        [
          "4500",
          "1500.0",
          "2000"
        ],
        1,
        "합계 4500을 값 3개로 나눕니다."
      ]
    ],
    "reading": "lesson01-guide.html#dims",
    "fullCode": "import pandas as pd\ndf = pd.DataFrame({'item':['A','B','C'],'price':[1000,1500,2000]})\nprint(df.head(2))\nprint(df.shape)\nprint(df.columns.tolist())\nprint(df['price'])\nprint(df['price'].mean())\n"
  },
  {
    "title": "CSV 읽기·행과 열 선택",
    "goal": "다운로드한 스포츠 CSV와 같은 파일을 웹에서 읽고, 열 이름과 행의 레이블·위치를 구분합니다.",
    "dataset": "sports_fictional.csv",
    "steps": [
      {
        "title": "Pandas 불러오기",
        "guide": "CSV를 읽을 pandas를 불러오세요.",
        "append": "import pandas as pd",
        "question": "CSV 파일과 DataFrame은 같은 것일까요?",
        "hint": "CSV는 저장된 텍스트 파일, DataFrame은 pandas가 메모리에서 다루는 표입니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "CSV 파일 읽기",
        "guide": "웹 실습실에 준비된 sports_fictional.csv를 읽으세요. VS Code에서는 아래 CSV를 .py 파일과 같은 작업 폴더에 두세요.",
        "append": "df = pd.read_csv('sports_fictional.csv')",
        "question": "첫 줄의 player, team은 데이터 행일까요?",
        "hint": "read_csv는 기본적으로 첫 줄을 열 이름으로 사용합니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "앞의 두 행 확인",
        "guide": "처음 두 행과 전체 자료의 크기를 확인하세요.",
        "append": "print(df.head(2))\nprint(df.shape)",
        "question": "첫 두 행만 보였어도 전체 자료는 몇 행일까요?",
        "hint": "제공 파일에는 선수 8명, 변수 6개가 있으므로 (8, 6)입니다.",
        "expected": "player team position  games  points  assists\n0     하늘   파랑        G      8      18        7\n1     윤서   파랑        F      8      16        3\n(8, 6)",
        "plot": false
      },
      {
        "title": "두 열 고르기",
        "guide": "선수 이름과 득점만 선택하세요.",
        "append": "print(df[['player', 'points']])",
        "question": "대괄호가 두 겹인 이유는 무엇일까요?",
        "hint": "안쪽은 열 이름의 리스트이고 바깥쪽은 DataFrame에서 열을 선택하는 연산입니다.",
        "expected": "player team position  games  points  assists\n0     하늘   파랑        G      8      18        7\n1     윤서   파랑        F      8      16        3\n(8, 6)\n  player  points\n0     하늘      18\n1     윤서      16\n2     민지      13\n3     수빈      22\n4     유나      15\n5     서아      11\n6     혜린      19\n7     나연      12",
        "plot": false
      },
      {
        "title": "레이블과 위치 비교",
        "guide": "같은 첫 번째 선수의 이름을 두 방식으로 찾아보세요.",
        "append": "print(df.loc[0, 'player'])\nprint(df.iloc[0, 0])",
        "question": "인덱스가 1부터 시작하면 loc[0]도 첫 번째 행일까요?",
        "hint": "loc는 레이블, iloc는 0부터 시작하는 위치입니다. 기본 인덱스일 때만 숫자가 우연히 같습니다.",
        "expected": "player team position  games  points  assists\n0     하늘   파랑        G      8      18        7\n1     윤서   파랑        F      8      16        3\n(8, 6)\n  player  points\n0     하늘      18\n1     윤서      16\n2     민지      13\n3     수빈      22\n4     유나      15\n5     서아      11\n6     혜린      19\n7     나연      12\n하늘\n하늘",
        "plot": false
      }
    ],
    "concepts": [
      "CSV는 쉼표로 값을 구분한 텍스트 파일입니다. 기본 read_csv는 첫 줄을 열 이름으로 읽습니다.",
      "파일 이름만 쓴 상대 경로는 현재 작업 폴더를 기준으로 합니다. .py와 CSV를 같은 폴더에 두고 그 폴더에서 실행합니다.",
      "loc는 행·열 이름표, iloc는 0부터 시작하는 위치를 사용합니다. iloc의 슬라이스 끝은 포함하지 않습니다."
    ],
    "quiz": [
      [
        "제공한 스포츠 CSV의 shape는?",
        [
          "(2, 6)",
          "(8, 6)",
          "(9, 7)"
        ],
        1,
        "선수 8명의 기록과 6개 데이터 열입니다."
      ],
      [
        "iloc[0, 0]의 기준은?",
        [
          "이름표",
          "평균값",
          "행·열의 정수 위치"
        ],
        2,
        "두 축 모두 0부터 시작하는 위치입니다."
      ]
    ],
    "reading": "textbook-classroom.html#u02",
    "fullCode": "import pandas as pd\ndf = pd.read_csv('sports_fictional.csv')\nprint(df.head(2))\nprint(df.shape)\nprint(df[['player', 'points']])\nprint(df.loc[0, 'player'])\nprint(df.iloc[0, 0])\n"
  },
  {
    "title": "조건 검색·정렬로 선수 찾기",
    "goal": "스포츠 기록을 조건으로 걸러내고 값에 따라 정렬합니다.",
    "dataset": "sports_fictional.csv",
    "steps": [
      {
        "title": "Pandas 시작",
        "guide": "pandas를 불러오세요.",
        "append": "import pandas as pd",
        "question": "분석 라이브러리의 별칭을 써 보세요.",
        "hint": "관례적으로 as pd를 사용합니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "스포츠 표 작성",
        "guide": "세 선수의 점수와 포지션을 만드세요.",
        "append": "df = pd.DataFrame({'name':['Minji','Yuna','Sora'],'position':['G','F','G'],'points':[17,21,13]})",
        "question": "가드(G)는 몇 명인가요?",
        "hint": "같은 길이의 리스트를 열별로 작성합니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "점수 조건 검색",
        "guide": "득점이 15 이상인 선수를 찾으세요.",
        "append": "print(df[df['points'] >= 15])",
        "question": "누가 결과에 남을까요?",
        "hint": "조건식은 참·거짓의 Series가 됩니다.",
        "expected": "name position  points\n0  Minji        G      17\n1   Yuna        F      21",
        "plot": false
      },
      {
        "title": "내림차순 정렬",
        "guide": "득점이 높은 순서로 정렬해 출력하세요.",
        "append": "print(df.sort_values('points',ascending=False))",
        "question": "첫 번째 선수는 누구일까요?",
        "hint": "ascending=False는 큰 값에서 작은 값 순입니다.",
        "expected": "name position  points\n0  Minji        G      17\n1   Yuna        F      21\n    name position  points\n1   Yuna        F      21\n0  Minji        G      17\n2   Sora        G      13",
        "plot": false
      },
      {
        "title": "두 조건 결합",
        "guide": "가드이면서 15점 이상인 선수를 찾으세요.",
        "append": "print(df[(df['position']=='G') & (df['points']>=15)])",
        "question": "괄호와 &가 왜 필요할까요?",
        "hint": "조건을 각각 소괄호로 감싸고 &로 동시에 만족하는 행을 선택합니다.",
        "expected": "name position  points\n0  Minji        G      17\n1   Yuna        F      21\n    name position  points\n1   Yuna        F      21\n0  Minji        G      17\n2   Sora        G      13\n    name position  points\n0  Minji        G      17",
        "plot": false
      }
    ],
    "concepts": [
      "조건 검색은 조건을 만족하는 행만 선택합니다. 정렬은 행의 순서를 바꿉니다.",
      "여러 조건은 각각 괄호로 묶은 다음 & (동시에 만족), | (하나 이상 만족)로 연결합니다.",
      "ascending=False는 내림차순입니다. 정렬해도 원래 인덱스는 남을 수 있습니다."
    ],
    "quiz": [
      [
        "득점 내림차순 정렬 옵션은?",
        [
          "ascending=False",
          "ascending=True",
          "descending=True"
        ],
        0,
        "sort_values의 ascending을 False로 지정합니다."
      ],
      [
        "여러 Series 조건을 동시에 만족시키는 기호는?",
        [
          "and",
          "&&",
          "&"
        ],
        2,
        "각 조건을 괄호로 감싸고 &로 연결합니다."
      ]
    ],
    "reading": "textbook-classroom.html#u06",
    "fullCode": "import pandas as pd\ndf = pd.DataFrame({'name':['Minji','Yuna','Sora'],'position':['G','F','G'],'points':[17,21,13]})\nprint(df[df['points'] >= 15])\nprint(df.sort_values('points',ascending=False))\nprint(df[(df['position']=='G') & (df['points']>=15)])\n"
  },
  {
    "title": "결측·중복·자료형 정리",
    "goal": "누락 값과 중복 행을 확인하고 처리 전후 통계를 비교합니다.",
    "dataset": "school_store_fictional.csv",
    "steps": [
      {
        "title": "Pandas 시작",
        "guide": "pandas를 불러오세요.",
        "append": "import pandas as pd",
        "question": "비어 있는 데이터도 표에 들어갈까요?",
        "hint": "결측값은 NaN으로 표현될 수 있습니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "결측과 중복이 있는 자료",
        "guide": "의도적으로 값이 빠지거나 반복된 표를 만드세요.",
        "append": "df = pd.DataFrame({'item':['A','A','B','C'],'sales':[10,10,None,30]})",
        "question": "몇 행이 중복이고, 값이 없는 곳은 어디일까요?",
        "hint": "None은 수치 열에서 결측값으로 처리됩니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "결측값 개수 확인",
        "guide": "각 열의 결측값 개수를 출력하세요.",
        "append": "print(df.isna().sum())",
        "question": "sales에 결측값이 몇 개 있을까요?",
        "hint": "isna()로 결측 여부를 확인하고 sum()으로 개수를 셉니다.",
        "expected": "item     0\nsales    1\ndtype: int64",
        "plot": false
      },
      {
        "title": "중복행 제거",
        "guide": "중복된 행을 제거한 결과를 출력하세요.",
        "append": "print(df.drop_duplicates())",
        "question": "첫째·둘째 행이 같으면 몇 행이 남을까요?",
        "hint": "drop_duplicates()는 기본적으로 원본 df 자체를 수정하지 않습니다.",
        "expected": "item     0\nsales    1\ndtype: int64\n  item  sales\n0    A   10.0\n2    B    NaN\n3    C   30.0",
        "plot": false
      },
      {
        "title": "결측을 0으로 처리",
        "guide": "결측을 0으로 채운 값의 평균을 비교하세요.",
        "append": "print(df['sales'].fillna(0).mean())",
        "question": "0으로 채우기 전 평균과 왜 다를까요?",
        "hint": "fillna(0)는 계산상 0을 넣지만, 실제 매출이 0이었다는 뜻은 아닙니다.",
        "expected": "item     0\nsales    1\ndtype: int64\n  item  sales\n0    A   10.0\n2    B    NaN\n3    C   30.0\n12.5",
        "plot": false
      }
    ],
    "concepts": [
      "결측은 기록이 없는 것이며 실제 관측값 0과 다릅니다.",
      "isna().sum()은 열별 결측 개수입니다. mean()은 기본적으로 결측값을 제외합니다.",
      "drop_duplicates(), fillna()는 기본적으로 결과를 반환합니다. 원본을 바꾸려면 반환값을 변수에 대입해야 합니다."
    ],
    "quiz": [
      [
        "10, 10, 결측, 30에서 결측을 0으로 채운 평균은?",
        [
          "12.5",
          "16.67",
          "0"
        ],
        0,
        "(10+10+0+30)/4=12.5입니다."
      ],
      [
        "df.drop_duplicates()만 실행하면 원본 df는?",
        [
          "즉시 변경됨",
          "변하지 않음",
          "전부 삭제됨"
        ],
        1,
        "반환값을 df에 다시 대입하지 않았습니다."
      ]
    ],
    "reading": "textbook-classroom.html#u02",
    "fullCode": "import pandas as pd\ndf = pd.DataFrame({'item':['A','A','B','C'],'sales':[10,10,None,30]})\nprint(df.isna().sum())\nprint(df.drop_duplicates())\nprint(df['sales'].fillna(0).mean())\n"
  },
  {
    "title": "groupby로 팀별 평균 비교",
    "goal": "개별 기록과 집단 평균의 차이를 이해합니다.",
    "dataset": "sports_fictional.csv",
    "steps": [
      {
        "title": "Pandas 시작",
        "guide": "pandas를 불러오세요.",
        "append": "import pandas as pd",
        "question": "팀별로 여러 선수 기록을 묶을 준비를 합니다.",
        "hint": "as pd 별칭을 사용합니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "팀 기록 입력",
        "guide": "A팀 2명, B팀 2명의 득점을 만드세요.",
        "append": "df = pd.DataFrame({'team':['A','A','B','B'],'points':[10,20,15,25]})",
        "question": "각 팀의 총득점은 얼마일까요?",
        "hint": "team은 분류 기준, points는 계산할 숫자입니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "팀별 평균",
        "guide": "팀별 점수 평균을 출력하세요.",
        "append": "print(df.groupby('team')['points'].mean())",
        "question": "A팀과 B팀의 평균을 예상하세요.",
        "hint": "groupby로 팀을 묶고 mean으로 평균을 구합니다.",
        "expected": "team\nA    15.0\nB    20.0\nName: points, dtype: float64",
        "plot": false
      },
      {
        "title": "팀별 합계",
        "guide": "팀별 점수 합계를 출력하세요.",
        "append": "print(df.groupby('team')['points'].sum())",
        "question": "평균과 합계는 어떤 점에서 다를까요?",
        "hint": "sum()은 합계, mean()은 평균입니다.",
        "expected": "team\nA    15.0\nB    20.0\nName: points, dtype: float64\nteam\nA    30\nB    40\nName: points, dtype: int64",
        "plot": false
      },
      {
        "title": "팀별 선수 수",
        "guide": "팀별 데이터 개수를 출력하세요.",
        "append": "print(df.groupby('team')['points'].count())",
        "question": "인원이 다른 팀의 평균만 비교하면 어떤 한계가 있을까요?",
        "hint": "count()는 결측값이 아닌 값의 수를 계산합니다.",
        "expected": "team\nA    15.0\nB    20.0\nName: points, dtype: float64\nteam\nA    30\nB    40\nName: points, dtype: int64\nteam\nA    2\nB    2\nName: points, dtype: int64",
        "plot": false
      }
    ],
    "concepts": [
      "groupby는 같은 범주의 기록을 묶습니다. 묶을 열과 계산할 열을 구분하세요.",
      "mean은 평균, sum은 합계, count는 결측이 아닌 값의 개수입니다.",
      "집단 평균만으로 원인이나 우열을 단정할 수 없습니다. 표본 수와 관측 조건도 확인합니다."
    ],
    "quiz": [
      [
        "A팀 득점이 10, 20이면 평균은?",
        [
          "30",
          "10",
          "15.0"
        ],
        2,
        "합계 30을 2명으로 나눕니다."
      ],
      [
        "count()가 세는 것은?",
        [
          "결측을 제외한 값의 개수",
          "최댓값",
          "모든 결측값"
        ],
        0,
        "결측값은 count에서 제외됩니다."
      ]
    ],
    "reading": "textbook-classroom.html#u06",
    "fullCode": "import pandas as pd\ndf = pd.DataFrame({'team':['A','A','B','B'],'points':[10,20,15,25]})\nprint(df.groupby('team')['points'].mean())\nprint(df.groupby('team')['points'].sum())\nprint(df.groupby('team')['points'].count())\n"
  },
  {
    "title": "단어 빈도 · 표 결합 맛보기",
    "goal": "문장을 단어로 나누어 빈도를 셉니다. 뒤의 표 결합 2단계는 선택 심화입니다.",
    "dataset": "sports_fictional.csv",
    "steps": [
      {
        "title": "Pandas 시작",
        "guide": "pandas를 불러오세요.",
        "append": "import pandas as pd",
        "question": "비정형 문장을 어떻게 숫자로 분석할까요?",
        "hint": "단어로 분리해 출현 횟수를 계산합니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "문장 준비",
        "guide": "가상의 기후 관련 문장을 리스트에 담으세요.",
        "append": "texts = ['climate change','climate risk','climate change']",
        "question": "climate라는 단어가 몇 번 등장할까요?",
        "hint": "문장은 학습용 가상 예시입니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "단어별 빈도 세기",
        "guide": "문장을 합치고 단어로 나눈 뒤 빈도표를 출력하세요.",
        "append": "print(pd.Series(' '.join(texts).split()).value_counts())",
        "question": "가장 자주 등장하는 단어는 무엇일까요?",
        "hint": "value_counts()는 각 단어의 출현 횟수를 셉니다.",
        "expected": "climate    3\nchange     2\nrisk       1\nName: count, dtype: int64",
        "plot": false
      },
      {
        "title": "정보표 두 개 만들기",
        "guide": "공통 열 key를 가진 두 표를 만드세요.",
        "append": "left = pd.DataFrame({'key':['A','B'],'score':[80,90]})\nright = pd.DataFrame({'key':['A','B'],'grade':['B','A']})",
        "question": "두 표를 합치려면 어떤 공통 열이 필요할까요?",
        "hint": "key가 두 표를 연결하는 기준입니다. 이 단계와 다음 단계는 선택 심화입니다.",
        "expected": "climate    3\nchange     2\nrisk       1\nName: count, dtype: int64",
        "plot": false
      },
      {
        "title": "merge로 연결",
        "guide": "두 표를 공통 key로 결합하세요.",
        "append": "print(pd.merge(left,right,on='key'))",
        "question": "결합 결과에 어떤 열이 생길까요?",
        "hint": "merge는 기준 키 값이 일치하는 행을 연결합니다.",
        "expected": "climate    3\nchange     2\nrisk       1\nName: count, dtype: int64\n  key  score grade\n0   A     80     B\n1   B     90     A",
        "plot": false
      }
    ],
    "concepts": [
      "문장은 비정형 데이터입니다. 공백으로 나눈 단어의 빈도를 표로 만들 수 있습니다.",
      "value_counts()는 각 값의 등장 횟수입니다. 공백 분리는 정교한 한국어 형태소 분석과 다릅니다.",
      "4~5단계 merge는 선택 심화입니다. 단어 빈도까지 학습한 뒤 8차시로 이동해도 됩니다."
    ],
    "quiz": [
      [
        "예제 문장 세 개에서 climate의 빈도는?",
        [
          "1",
          "2",
          "3"
        ],
        2,
        "각 문장에 한 번씩 등장합니다."
      ],
      [
        "단어 빈도만으로 글의 의도를 확정할 수 있나요?",
        [
          "예",
          "아니요",
          "빈도가 3 이상이면 가능"
        ],
        1,
        "문맥과 사용 방식도 살펴야 합니다."
      ]
    ],
    "reading": "textbook-classroom.html#u04",
    "fullCode": "import pandas as pd\ntexts = ['climate change','climate risk','climate change']\nprint(pd.Series(' '.join(texts).split()).value_counts())\nleft = pd.DataFrame({'key':['A','B'],'score':[80,90]})\nright = pd.DataFrame({'key':['A','B'],'grade':['B','A']})\nprint(pd.merge(left,right,on='key'))\n"
  },
  {
    "title": "Matplotlib 기후 시각화",
    "goal": "표의 수치를 꺾은선그래프로 나타내고 축 단위와 출처를 생각합니다.",
    "dataset": "climate_fictional.csv",
    "steps": [
      {
        "title": "Pandas 시작",
        "guide": "pandas를 불러오세요.",
        "append": "import pandas as pd",
        "question": "연도별 기온을 표로 만들 준비를 합니다.",
        "hint": "기초 데이터 구조는 DataFrame입니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "그래프 도구 불러오기",
        "guide": "Matplotlib의 pyplot을 plt라는 이름으로 불러오세요.",
        "append": "import matplotlib.pyplot as plt",
        "question": "Pandas와 pyplot의 역할은 어떻게 다를까요?",
        "hint": "Pandas는 표 분석, pyplot은 시각화에 주로 사용됩니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "기온 데이터 표 만들기",
        "guide": "가상의 연도별 온도 기록을 만드세요.",
        "append": "df = pd.DataFrame({'year':[2021,2022,2023,2024],'temp':[13.1,13.4,13.0,13.8]})",
        "question": "어느 해의 온도가 가장 높을까요?",
        "hint": "이 수치는 실제 기후 통계가 아닌 가상 예시입니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "꺾은선그래프 작성",
        "guide": "연도를 가로축으로 기온 추이를 그리세요.",
        "append": "plt.plot(df['year'],df['temp'],marker='o')",
        "question": "2023년의 점은 전년보다 높을까요?",
        "hint": "plot(x,y,marker='o')를 사용합니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.\n[꺾은선그래프가 표시됩니다.]",
        "plot": true
      },
      {
        "title": "축과 제목 달기",
        "guide": "그래프에 축 이름과 제목을 추가하고 화면에 출력하세요.",
        "append": "plt.xlabel('Year')\nplt.ylabel('Temperature (C)')\nplt.title('Fictional climate')\nplt.show()",
        "question": "그래프의 제목과 단위가 없다면 어떤 오해가 생길까요?",
        "hint": "xlabel은 가로축, ylabel은 세로축, title은 제목입니다. 단위와 가상 자료라는 표시를 확인하세요.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.\n[꺾은선그래프가 표시됩니다.]",
        "plot": true
      }
    ],
    "concepts": [
      "Pandas는 표 분석, Matplotlib의 pyplot은 그래프 작성에 사용합니다.",
      "시간에 따른 변화는 꺾은선그래프, 범주별 비교는 막대그래프로 표현할 수 있습니다.",
      "가로·세로축, 단위, 기간, 자료 출처를 확인합니다. 예제 기온은 실제 관측값이 아닌 가상 수치입니다."
    ],
    "quiz": [
      [
        "연도별 기온 변화에 적합한 그래프는?",
        [
          "꺾은선그래프",
          "사진",
          "표 제목"
        ],
        0,
        "시간에 따른 값을 순서대로 연결합니다."
      ],
      [
        "plt.ylabel()의 역할은?",
        [
          "가로축 이름",
          "세로축 이름",
          "파일 이름"
        ],
        1,
        "예제에서는 Temperature (C)를 표시합니다."
      ]
    ],
    "reading": "textbook-classroom.html#u03",
    "fullCode": "import pandas as pd\nimport matplotlib.pyplot as plt\ndf = pd.DataFrame({'year':[2021,2022,2023,2024],'temp':[13.1,13.4,13.0,13.8]})\nplt.plot(df['year'],df['temp'],marker='o')\nplt.xlabel('Year')\nplt.ylabel('Temperature (C)')\nplt.title('Fictional climate')\nplt.show()\n"
  },
  {
    "title": "인구 변화 데이터 분석",
    "goal": "인구 증감량과 증감률을 구분하고 해석합니다.",
    "dataset": "population_fictional.csv",
    "steps": [
      {
        "title": "Pandas 시작",
        "guide": "pandas를 불러오세요.",
        "append": "import pandas as pd",
        "question": "증감량과 증감률은 같은 값일까요?",
        "hint": "비율은 비교 기준이 되는 원래 값을 고려합니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "두 해의 가상 인구 입력",
        "guide": "연도와 인구를 표로 만드세요.",
        "append": "df = pd.DataFrame({'year':[2023,2024],'population':[1000,950]})",
        "question": "인구는 몇 명 감소했나요?",
        "hint": "단순화를 위해 가상 수치로 학습합니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "인구 증감량 구하기",
        "guide": "diff()로 연도 간 차이를 출력하세요.",
        "append": "print(df['population'].diff())",
        "question": "2024년의 증감량은 얼마일까요?",
        "hint": "diff()는 현재 값에서 앞 행의 값을 뺍니다.",
        "expected": "0     NaN\n1   -50.0\nName: population, dtype: float64",
        "plot": false
      },
      {
        "title": "인구 증감률 구하기",
        "guide": "pct_change()로 증감률을 백분율로 바꾸세요.",
        "append": "print(df['population'].pct_change()*100)",
        "question": "인구가 1000에서 950으로 되면 몇 퍼센트 감소인가요?",
        "hint": "pct_change()에 100을 곱해 백분율로 표현합니다.",
        "expected": "0     NaN\n1   -50.0\nName: population, dtype: float64\n0    NaN\n1   -5.0\nName: population, dtype: float64",
        "plot": false
      },
      {
        "title": "마지막 증감률 선택",
        "guide": "마지막 연도의 증감률만 출력하세요.",
        "append": "print(round(df['population'].pct_change().iloc[-1] * 100, 2))",
        "question": "처음 행은 증감률을 계산할 수 없는데 이유는 무엇일까요?",
        "hint": "비교할 이전 연도가 없으므로 처음 값은 NaN입니다.",
        "expected": "0     NaN\n1   -50.0\nName: population, dtype: float64\n0    NaN\n1   -5.0\nName: population, dtype: float64\n-5.0",
        "plot": false
      }
    ],
    "concepts": [
      "증감량 = 현재 값 - 이전 값, 증감률(%) = (현재 - 이전) / 이전 × 100입니다.",
      "diff()와 pct_change()는 현재 행과 앞 행을 비교합니다. 먼저 연도 순서를 확인하세요.",
      "첫 행은 비교할 이전 값이 없어서 NaN입니다. 인구가 0명이라는 뜻이 아닙니다."
    ],
    "quiz": [
      [
        "인구가 1000에서 950으로 변한 증감률은?",
        [
          "-50%",
          "-5%",
          "5%"
        ],
        1,
        "(950-1000)/1000×100=-5%입니다."
      ],
      [
        "첫 행 증감률이 NaN인 이유는?",
        [
          "인구가 0명",
          "파일 오류",
          "비교할 이전 값이 없음"
        ],
        2,
        "이전 연도 데이터를 제공하지 않았기 때문입니다."
      ]
    ],
    "reading": "textbook-classroom.html#u07",
    "fullCode": "import pandas as pd\ndf = pd.DataFrame({'year':[2023,2024],'population':[1000,950]})\nprint(df['population'].diff())\nprint(df['population'].pct_change()*100)\nprint(round(df['population'].pct_change().iloc[-1] * 100, 2))\n"
  },
  {
    "title": "분석 보고서·기말 종합",
    "goal": "표 만들기부터 요약과 그래프까지 스스로 연결하고 해석합니다.",
    "dataset": "school_store_fictional.csv",
    "steps": [
      {
        "title": "Pandas 시작",
        "guide": "pandas를 불러오세요.",
        "append": "import pandas as pd",
        "question": "오늘의 분석 질문은 무엇일까요?",
        "hint": "예시 질문: 가장 많이 팔린 상품은 무엇인가?",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "매점 데이터 만들기",
        "guide": "가상 매점 판매량을 작성하세요.",
        "append": "df = pd.DataFrame({'item':['juice','bread','milk'],'sales':[12,30,18]})",
        "question": "어떤 항목이 가장 많이 팔렸나요?",
        "hint": "실제 학교 판매 기록이나 개인정보는 사용하지 않습니다.",
        "expected": "오류 없이 실행됩니다. 아직 print 출력은 없습니다.",
        "plot": false
      },
      {
        "title": "판매량 내림차순",
        "guide": "판매량이 높은 순서로 출력하세요.",
        "append": "print(df.sort_values('sales',ascending=False))",
        "question": "가장 판매량이 높은 상품을 확인해 보세요.",
        "hint": "sort_values()의 ascending=False를 사용합니다.",
        "expected": "item  sales\n1  bread     30\n2   milk     18\n0  juice     12",
        "plot": false
      },
      {
        "title": "평균 계산",
        "guide": "세 상품 판매량의 평균을 출력하세요.",
        "append": "print(df['sales'].mean())",
        "question": "계산한 평균과 개별 상품 판매량은 어떻게 다를까요?",
        "hint": "평균만으로 하루 전체의 판매 성향을 확정할 수는 없습니다.",
        "expected": "item  sales\n1  bread     30\n2   milk     18\n0  juice     12\n20.0",
        "plot": false
      },
      {
        "title": "최댓값과 분석 결론",
        "guide": "판매량의 최댓값을 출력한 뒤 아래 해석 칸에 분석의 한계를 적으세요.",
        "append": "print(df['sales'].max())",
        "question": "가상의 하루치 자료만으로 연간 판매 경향을 알 수 있을까요?",
        "hint": "결론에는 출처, 기간, 관측 수, 한계를 함께 기록합니다.",
        "expected": "item  sales\n1  bread     30\n2   milk     18\n0  juice     12\n20.0\n30",
        "plot": false
      }
    ],
    "concepts": [
      "분석은 질문 → 자료 → 처리 → 계산·그래프 → 해석의 순서로 진행합니다.",
      "관찰된 사실과 추정한 원인을 구분하고, 자료의 기간·출처·한계를 함께 기록합니다.",
      "보고서에는 코드와 CSV를 함께 보관해 같은 결과를 다시 확인할 수 있게 합니다."
    ],
    "quiz": [
      [
        "12, 30, 18의 평균은?",
        [
          "18.0",
          "30.0",
          "20.0"
        ],
        2,
        "60을 3으로 나누면 20입니다."
      ],
      [
        "가상의 하루 자료로 확정할 수 없는 것은?",
        [
          "세 상품 중 최대 판매량",
          "세 상품의 평균",
          "실제 연간 판매 경향"
        ],
        2,
        "기간과 출처가 제한되어 있으므로 일반화할 수 없습니다."
      ]
    ],
    "reading": "textbook-classroom.html#u10",
    "fullCode": "import pandas as pd\ndf = pd.DataFrame({'item':['juice','bread','milk'],'sales':[12,30,18]})\nprint(df.sort_values('sales',ascending=False))\nprint(df['sales'].mean())\nprint(df['sales'].max())\n"
  }
];
