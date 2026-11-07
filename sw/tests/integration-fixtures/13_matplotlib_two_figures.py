import matplotlib.pyplot as plt

plt.figure()
plt.plot([1, 2, 3], [1, 4, 9])
plt.title("제곱수 그래프")
plt.xlabel("입력값")
plt.ylabel("결과")
plt.show()
print("첫 그래프 표시")

plt.figure()
plt.bar(["A", "B"], [3, 5])
plt.title("판매량 비교")
plt.show()
