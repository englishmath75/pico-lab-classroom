import pandas as pd
df = pd.DataFrame({'item':['juice','bread','milk'],'sales':[12,30,18]})
print(df.sort_values('sales',ascending=False))
print(df['sales'].mean())
print(df['sales'].max())
