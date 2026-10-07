"""Strict CSV quality gate. No silent error-row dropping; no synthetic training data."""
import io
import hashlib
import re
import pandas as pd

CLASSES = ['GOOD','DARK','VENTILATE','HOT_HUMID']
HEADER = ['schema_version','source','session_id','sample_index','light','temperature','humidity','label']
UUID = re.compile(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')

def inspect_csvs(uploaded):
    frames, issues, hashes = [], [], []
    for number, raw in enumerate(uploaded.values(),1):
        hashes.append(hashlib.sha256(raw).hexdigest())
        try:
            frame = pd.read_csv(io.BytesIO(raw),dtype=str,keep_default_na=False)
        except Exception as exc:
            issues.append(f'파일 {number}: CSV 읽기 실패 ({type(exc).__name__})'); continue
        if list(frame.columns) != HEADER:
            issues.append(f'파일 {number}: v1 헤더 불일치'); continue
        for index,row in frame.iterrows():
            reasons=[]
            if row.schema_version != '1': reasons.append('버전')
            if row.source != 'real': reasons.append('실측 source 아님')
            if not UUID.fullmatch(row.session_id): reasons.append('회차 UUID')
            if row.label not in CLASSES: reasons.append('label')
            for name,lo,hi,integer in [('sample_index',1,3000,True),('light',0,65535,True),('temperature',0,50,False),('humidity',0,100,False)]:
                value=row[name]
                if not re.fullmatch(r'\d+' if integer else r'\d+(\.\d)?',value): reasons.append(name+' 형식');continue
                if not lo<=float(value)<=hi: reasons.append(name+' 범위')
            if reasons: issues.append(f'파일 {number}, {index+2}행: '+', '.join(reasons))
        frames.append(frame)
    if not frames: return pd.DataFrame(columns=HEADER),issues or ['자료 없음'],0,hashes
    data=pd.concat(frames,ignore_index=True)
    for session,group in data.groupby('session_id'):
        if group.label.nunique()!=1: issues.append('회차 label 혼재: '+session)
    keys=['session_id','sample_index']
    for _,group in data.groupby(keys):
        if len(group.drop_duplicates())>1: issues.append('같은 회차/번호의 서로 다른 값')
    duplicate_count=int(data.duplicated(keys).sum())
    data=data.drop_duplicates(keys)
    if not issues:
        for name in ['sample_index','light','temperature','humidity']:
            data[name]=pd.to_numeric(data[name])
    return data,issues,duplicate_count,hashes

def require_ready(df):
    if len(df)<80: raise ValueError('총 80행 이상 실제 자료 필요')
    sessions=df.groupby('session_id').agg(label=('label','first'),labels=('label','nunique'),rows=('label','size'))
    if not (sessions.labels==1).all(): raise ValueError('회차 label 혼재')
    if not (sessions.rows>=5).all(): raise ValueError('모든 회차에 유효 실측 5행 이상 필요')
    counts=sessions.label.value_counts().reindex(CLASSES,fill_value=0)
    if (counts<4).any(): raise ValueError('네 라벨마다 독립 회차 4개 이상 필요: '+str(counts.to_dict()))
    return sessions.reset_index()[['session_id','label']]
