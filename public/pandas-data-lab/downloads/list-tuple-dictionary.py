# 리스트 · 튜플 · 딕셔너리 한 번에 비교하기
A = [10, 20, 70, 40]
B = (22, 55, 11, 99, 33)
C = {"name": "민지", "gender": "여", "age": 17}

print("=== 1. 리스트: 변경 가능 ===")
print("처음:", A)
A.append(100)       # 맨 뒤에 추가
A.insert(1, 15)      # 인덱스 1에 삽입
A.remove(70)         # 값 70 삭제
A[0] = 99            # 첫 번째 값 수정
print("변경 후:", A)

print("\n=== 2. 튜플: 변경 불가 ===")
print("처음:", B)
print("첫 번째 값:", B[0])
print("55의 개수:", B.count(55))
print("11의 인덱스:", B.index(11))
# B.append(100)     # 튜플에는 append()가 없어 오류!
# B[0] = 99         # 튜플은 원소 수정 불가!

print("\n=== 3. 딕셔너리: 키와 값 ===")
print("처음:", C)
print("이름:", C["name"])
print("나이:", C.get("age"))
C["age"] = 18         # 기존 키의 값 수정
C["job"] = "학생"      # 새 키 추가
print("키:", list(C.keys()))
print("값:", list(C.values()))
print("키·값 쌍:", list(C.items()))
C.pop("gender")       # 키와 값 삭제
print("변경 후:", C)
