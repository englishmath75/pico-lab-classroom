import pandas as pd
df = pd.read_csv('sports_fictional.csv')
print(df.head(2))
print(df.shape)
print(df[['player', 'points']])
print(df.loc[0, 'player'])
print(df.iloc[0, 0])
