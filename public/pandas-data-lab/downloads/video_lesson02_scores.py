import pandas as pd

df = pd.DataFrame({
    'score': [70, 80, 90]
})

print(df['score'].mean())
