import pandas as pd
df = pd.DataFrame({'name':['Minji','Yuna','Sora'],'position':['G','F','G'],'points':[17,21,13]})
print(df[df['points'] >= 15])
print(df.sort_values('points',ascending=False))
print(df[(df['position']=='G') & (df['points']>=15)])
