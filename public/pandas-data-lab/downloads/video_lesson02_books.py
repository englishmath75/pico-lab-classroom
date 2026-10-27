import pandas as pd

data = {
    'name': ['A', 'B', 'C'],
    'books': [3, 5, 2]
}

df = pd.DataFrame(data)

print(df)
print(df['books'].mean())
