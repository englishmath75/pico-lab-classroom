# ==========================================
# 1. 리스트 (List)
# ==========================================
a = [30, 40, 50, 60, 70]
print(a)

a.append(9)
print(a)

a.insert(2, 17)
print(a)

a.remove(60)
print(a)

del a[0]
print(a)

print(a[1:4])
print(a[:3])
print(a[2:])
print(a[::2])
print(a[::-1])

a.sort()
print(a)

a.reverse()
print(a)


# ==========================================
# 2. 튜플 (Tuple & 패킹/언패킹)
# ==========================================
t = (10, 20, 30, 20, 40)
print(t)

print(t[0])
print(t[1:3])
print(t.count(20))
print(t.index(30))

# 패킹(Packing) 확인
box = 1, 2, 3
print(box)
print(type(box))

# 언패킹(Unpacking) 확인
x, y, z = box
print(x, y, z)


# ==========================================
# 3. 딕셔너리 (Dictionary)
# ==========================================
d = {"name": "영수", "kor": 90, "eng": 85}
print(d)

print(d["name"])
print(d.get("math", 0))

d["math"] = 95
print(d)

d["kor"] = 100
print(d)

del d["eng"]
print(d)

val = d.pop("math")
print(val)
print(d)

print(list(d.keys()))
print(list(d.values()))
print(list(d.items()))

for k, v in d.items():
    print(k, v)


# ==========================================
# 4. 반복문 실습 1: for item in ... (원소 직접 순회)
# ==========================================

# (1) 리스트 직접 순회
for item in a:
    print(item)

# (2) 튜플 직접 순회
for item in t:
    print(item)

# (3) 딕셔너리 직접 순회 (기본 순회는 Key 기준)
for key in d:
    print(key, d[key])


# ==========================================
# 5. 반복문 실습 2: for i in range(...) (인덱스/순번 순회)
# ==========================================

# (1) 리스트 인덱스 순회
for i in range(len(a)):
    print(i, a[i])

# (2) 튜플 인덱스 순회
for i in range(len(t)):
    print(i, t[i])

# (3) 딕셔너리 순번 순회 (Key 리스트 변환 후 접근)
keys = list(d.keys())
for i in range(len(keys)):
    key = keys[i]
    print(i, key, d[key])
