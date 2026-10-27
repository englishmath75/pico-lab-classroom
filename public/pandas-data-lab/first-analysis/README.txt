영수쌤의 Python 교실 · 전체 과정 따라 하기
1차시를 마친 다음 수업에 진행한 뒤 기존 2차시로 돌아갑니다.
출처: 이 수업용으로 직접 제작한 가상 축제 간식 주문 16행. 실제 매출·학생 정보가 아닙니다.
Tteokbokki=떡볶이(3500원), Waffle=와플(4500원), Lemonade=레몬에이드(2500원).
order_id는 주문 1건의 고유 번호입니다. 한 행은 한 메뉴의 주문 1건입니다.
중복 O001 1행, O013 수량 누락, O014 수량 미입력, O015 음수 수량을 의도적으로 넣었습니다.
이 예제는 반품 없는 판매 기록이므로 수량·단가는 양수여야 합니다.

ZIP을 모두 풀어 festival_first_analysis 폴더를 VS Code의 파일 > 폴더 열기로 여세요.
Python과 Microsoft Python 확장을 준비하고 Python: Select Interpreter로 환경을 선택하세요.
VS Code의 새 터미널에서 python -m pip install pandas matplotlib 를 한 번 실행하세요.
CSV와 Python 파일은 같은 폴더에 둡니다. 터미널에 python analyze_festival.py 를 입력하세요.
정제 CSV 2개, 제외 기록 CSV 1개와 그래프 PNG가 같은 폴더에 생성됩니다.
analysis_note.txt를 직접 작성하세요. 원본 CSV는 덮어쓰지 마세요.
집에서 반복할 때는 폴더 전체를 복사해 attempt_02, attempt_03으로 이름을 바꾸세요.
학교 PC에서는 수업 종료 전 폴더를 ZIP으로 백업하고 학교에서 허용한 저장소 또는 USB로 옮기세요.
웹앱에는 로그인·자동 서버 제출 기능이 없습니다. 교사가 지정한 제출처로 ZIP을 제출하세요.

설명 페이지:
https://englishmath75.github.io/pico-lab-classroom/pandas-data-lab/first-analysis.html
