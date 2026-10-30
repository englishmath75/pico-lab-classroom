# 리스트, 튜플, 딕셔너리 비교 - 한 파일로 실습
A = [10, 20, 70, 40]
B = (22, 55, 11, 99, 33)
C = {"name": "민지", "gender": "여", "age": 17}

print("=== 1. 리스트: 추가·수정·삭제 가능 ===")
print("처음:", A)
A.append(100)
print("append:", A)
A.insert(1, 85)
print("insert:", A)
A.remove(70)
print("remove:", A)
del A[0]
print("del:", A)
A.sort()
print("sort:", A)
A.reverse()
print("reverse:", A)

print("\n=== 2. 튜플: 읽기는 가능, 수정은 불가 ===")
print("처음:", B)
print("B[0]:", B[0])
print("count(55):", B.count(55))
print("index(11):", B.index(11))
# B.append(100)   # 주석을 풀면 AttributeError
# B[0] = 99       # 주석을 풀면 TypeError

print("\n=== 3. 딕셔너리: 키(Key)와 값(Value) ===")
print("처음:", C)
print("이름:", C["name"])
print("나이:", C.get("age"))
C["age"] = 18
C["job"] = "학생"
print("수정·추가:", C)
print("keys:", list(C.keys()))
print("values:", list(C.values()))
print("items:", list(C.items()))
del C["gender"]
print("del:", C)
