import pandas as pd

df = pd.DataFrame({"name": ["A", "B", "C"], "books": [3, 5, 2]})
before = df.copy()
df["books"] = df["books"] + 1
selected = df[df["books"] >= 4]
