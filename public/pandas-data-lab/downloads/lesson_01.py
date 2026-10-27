import pandas as pd
df = pd.DataFrame({'item':['juice','bread','milk'],'sales':[12,20,16]})
print(df)
print(df.shape)
df.index = range(1, len(df) + 1)
print(df)
print(df.shape)
