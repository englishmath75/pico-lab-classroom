import numpy as np
import matplotlib.pyplot as plt

# 1. x 구간 설정 (-10부터 10까지 200개 점)
x = np.linspace(-10, 10, 200)

# 2. y = 2*x + 4 그리기
y = 2 * x + 4
plt.plot(x, y, color='cyan', label='y = 2x + 4')
plt.axhline(0, color='gray', linewidth=1)  # x축
plt.axvline(0, color='gray', linewidth=1)  # y축
plt.grid(True, linestyle='--', alpha=0.6)
plt.title('y = 2x + 4 Graph')
plt.xlabel('x')
plt.ylabel('y')
plt.legend()
plt.show()

# 3. y = x^2 그리기
# 첫 번째 창을 닫으면 두 번째 그래프가 나옵니다.
y = x**2
plt.plot(x, y, color='cyan', label='y = x^2')
plt.axhline(0, color='gray', linewidth=1)  # x축
plt.axvline(0, color='gray', linewidth=1)  # y축
plt.grid(True, linestyle='--', alpha=0.6)
plt.title('y = x^2 Graph')
plt.xlabel('x')
plt.ylabel('y')
plt.legend()
plt.show()
