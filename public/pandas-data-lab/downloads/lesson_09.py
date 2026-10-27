import pandas as pd
df = pd.DataFrame({'year':[2023,2024],'population':[1000,950]})
print(df['population'].diff())
print(df['population'].pct_change()*100)
print(round(df['population'].pct_change().iloc[-1] * 100, 2))
