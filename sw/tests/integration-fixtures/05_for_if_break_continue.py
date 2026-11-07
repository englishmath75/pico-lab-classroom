total = 0
for i in range(5):
    if i == 1:
        continue
    if i == 4:
        break
    total += i
if total > 4:
    verdict = "통과"
elif total == 4:
    verdict = "경계"
else:
    verdict = "다시 확인"
print(total)
print(verdict)
