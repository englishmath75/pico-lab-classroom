import pandas as pd
import matplotlib.pyplot as plt
df = pd.DataFrame({'year':[2021,2022,2023,2024],'temp':[13.1,13.4,13.0,13.8]})
plt.plot(df['year'],df['temp'],marker='o')
plt.xlabel('Year')
plt.ylabel('Temperature (C)')
plt.title('Fictional climate')
plt.show()
