# 1. 도구를 준비하고 원본 CSV를 DataFrame으로 읽습니다.
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

folder = Path(__file__).resolve().parent
raw = pd.read_csv(folder / 'festival_orders.csv', encoding='utf-8-sig')
print('원본 행·열:', raw.shape)
print(raw.head())

# 2. 중복 주문과 글자 양쪽의 공백을 정리합니다.
df = raw.drop_duplicates(subset='order_id').copy()
print('중복 제거:', len(raw) - len(df), '행')
df['menu'] = df['menu'].str.strip()

# 3. 숫자로 바꾸고, 분석할 수 없는 수량을 별도로 보관합니다.
df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce')
df['unit_price'] = pd.to_numeric(
    df['unit_price'].str.replace(',', '', regex=False), errors='coerce'
)
print('수량 결측:', df['quantity'].isna().sum(), '행')
valid = (df['quantity'] > 0) & (df['unit_price'] > 0)
excluded = df.loc[~valid].copy()
excluded.to_csv(folder / 'excluded_orders.csv', index=False, encoding='utf-8-sig')
df = df.loc[valid].copy()
print('분석 제외:', len(excluded), '행')
print('분석에 사용:', len(df), '행')

# 4. 주문별 매출을 계산하고 메뉴별로 판매량·매출을 합칩니다.
df['revenue'] = df['quantity'] * df['unit_price']
summary = df.groupby('menu')[['quantity', 'revenue']].sum()
summary = summary.sort_values('revenue', ascending=False)
print(summary.to_string(float_format=lambda x: f'{x:.0f}'))
print('총판매량:', int(df['quantity'].sum()), '개')
print('총매출:', int(df['revenue'].sum()), '원')

# 5. 정제한 표와 요약표를 새 CSV 파일로 저장합니다.
df.to_csv(folder / 'festival_clean.csv', index=False, encoding='utf-8-sig')
summary.to_csv(folder / 'menu_summary.csv', encoding='utf-8-sig')

# 6. 판매량과 매출을 서로 다른 축에 그린 뒤 이미지로 저장합니다.
fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].bar(summary.index, summary['quantity'], color='#137d80')
axes[0].set(title='Items sold by menu', ylabel='Quantity (items)')
axes[1].bar(summary.index, summary['revenue'], color='#b59b58')
axes[1].set(title='Revenue by menu', ylabel='Revenue (KRW)')
for ax in axes:
    ax.set_ylim(bottom=0)
    ax.tick_params(axis='x', labelrotation=15)
fig.suptitle('School festival — fictional practice data')
fig.tight_layout()
fig.savefig(folder / 'festival_chart.png', dpi=160)
print('저장 완료: festival_clean.csv, menu_summary.csv, excluded_orders.csv, festival_chart.png')
plt.show()
