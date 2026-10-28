# numpy 계산과 matplotlib 모듈을 사용해 여러 수학 함수를 그리는 코드

import numpy as np
import matplotlib.pyplot as plt

plt.style.use('dark_background')
fig, ax = plt.subplots(figsize=(10, 10))

# 변수 설정
a, b = 2, 3

# 1. 다항함수
x_poly = np.linspace(-5, 5, 400)
y_poly = a * x_poly**2 + b
ax.plot(x_poly, y_poly, color='cyan', label='Polynomial: y = ax^2 + b')

# 2. 지수함수
x_exp = np.linspace(-2, 2, 400)
y_exp = a * np.exp(x_exp) + b
ax.plot(x_exp, y_exp, color='magenta', label='Exponential: y = ae^x + b')

# 3. 로그함수
x_log = np.linspace(0.1, 10, 400)
y_log = a * np.log(x_log) + b
ax.plot(x_log, y_log, color='yellow', label='Logarithmic: y = aln(x) + b')

# 4. 원의 방정식
theta = np.linspace(0, 2*np.pi, 400)
r = a
x_circle = r * np.cos(theta)
y_circle = r * np.sin(theta)
ax.plot(x_circle, y_circle, color='lime', label='Circle: x^2 + y^2 = a^2')

# 5. 삼각함수 (사인, 코사인 추가)
x_trig = np.linspace(-2*np.pi, 2*np.pi, 400)
y_sin = a * np.sin(x_trig) + b
y_cos = a * np.cos(x_trig) + b
ax.plot(x_trig, y_sin, color='orange', label='Sine: y = asin(x) + b')
ax.plot(x_trig, y_cos, color='deeppink', linestyle='--', label='Cosine: y = acos(x) + b')

ax.set_title('High School Math Functions')
ax.grid(True, color='gray', alpha=0.5)
ax.legend()
ax.axis('equal')

plt.tight_layout()
plt.show()
