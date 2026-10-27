import pandas as pd
df = pd.DataFrame({'item':['A','A','B','C'],'sales':[10,10,None,30]})
print(df.isna().sum())
print(df.drop_duplicates())
print(df['sales'].fillna(0).mean())
