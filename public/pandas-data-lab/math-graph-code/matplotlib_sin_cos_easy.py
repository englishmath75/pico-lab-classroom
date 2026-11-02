import numpy as np
import matplotlib.pyplot as plt

# 1. x 구간 설정 (-2π부터 2π까지 400개 점 생성)
x = np.linspace(-2 * np.pi, 2 * np.pi, 400)

# 2. y값 계산 (사인, 코사인)
y_sin = np.sin(x)
y_cos = np.cos(x)

# 3. 도화지 생성 및 그래프 그리기
plt.plot(x, y_sin, label='sin(x)')
plt.plot(x, y_cos, label='cos(x)')

# 4. 좌표축 및 눈금 설정
plt.axhline(0, color='gray', linewidth=1)  # x축
plt.axvline(0, color='gray', linewidth=1)  # y축
plt.grid(True, linestyle=':', alpha=0.6)

# x축 눈금을 π(파이) 단위 라벨로 보기 쉽게 표시
plt.xticks(
    [-2 * np.pi, -np.pi, 0, np.pi, 2 * np.pi],
    ['-2π', '-π', '0', 'π', '2π']
)
plt.ylim(-1.5, 1.5)  # y축 범위 고정

# 5. 제목 및 범례 표시
plt.title('(Sine & Cosine)')
plt.xlabel('x')
plt.ylabel('y')
plt.legend()

# 6. 화면 출력
plt.show()
