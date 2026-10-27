import pandas as pd
df = pd.DataFrame({'team':['A','A','B','B'],'points':[10,20,15,25]})
print(df.groupby('team')['points'].mean())
print(df.groupby('team')['points'].sum())
print(df.groupby('team')['points'].count())
