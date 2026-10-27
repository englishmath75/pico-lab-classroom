import pandas as pd
df = pd.DataFrame({'item':['A','B','C'],'price':[1000,1500,2000]})
print(df.head(2))
print(df.shape)
print(df.columns.tolist())
print(df['price'])
print(df['price'].mean())
