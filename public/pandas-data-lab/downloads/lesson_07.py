import pandas as pd
texts = ['climate change','climate risk','climate change']
print(pd.Series(' '.join(texts).split()).value_counts())
left = pd.DataFrame({'key':['A','B'],'score':[80,90]})
right = pd.DataFrame({'key':['A','B'],'grade':['B','A']})
print(pd.merge(left,right,on='key'))
