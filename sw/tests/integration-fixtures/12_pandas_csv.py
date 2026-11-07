import pandas as pd

df = pd.read_csv("sales.csv")
before = df.copy()
result = df.copy()
result["sales"] = result["sales"] + 2
print(result.shape)
print(result["sales"].mean())
