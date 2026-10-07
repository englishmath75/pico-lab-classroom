"""Synthetic fixtures are software tests only, never classroom measurements or accuracy."""
import ast
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
import uuid
import os
import types
import hashlib
from unittest.mock import patch
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'scripts/ai_ble'))
from export_tree import export_pico_model,validate_conversion,boundary_probes,write_artifacts,features_for_model
from training import inspect_csvs,require_ready,HEADER
from build_notebook import build

class ExportTests(unittest.TestCase):
    def fixture(self,labels=('GOOD','DARK','VENTILATE','HOT_HUMID'),negative=False):
        rng=np.random.default_rng(8)
        X=np.column_stack([rng.integers(0,65536,300),rng.integers(-200 if negative else 0,501,300),rng.integers(0,1001,300)])
        y=np.array(labels)[np.arange(len(X))%len(labels)]
        return DecisionTreeClassifier(max_depth=3,min_samples_leaf=3,random_state=42).fit(X,y),X

    def test_varied_classes_single_leaf_negative_temperature_and_boundaries(self):
        for labels,negative in [(('GOOD','DARK','VENTILATE','HOT_HUMID'),False),(('only',),False),(('z','a','b'),True)]:
            model,X=self.fixture(labels,negative)
            source,_=export_pico_model(model)
            ast.parse(source)
            tests=validate_conversion(model,source,[[x[0],x[1]/10,x[2]/10] for x in X],((0,65535),(-200 if negative else 0,500),(0,1000)))
            self.assertGreaterEqual(len(tests),1300)
            if len(labels)>1:self.assertTrue(boundary_probes(model))

    def test_source_stability_and_reject_wrong_features_or_depth(self):
        model,_=self.fixture()
        self.assertEqual(export_pico_model(model),export_pico_model(model))
        wrong=DecisionTreeClassifier().fit([[0,0],[1,1]],['A','B'])
        with self.assertRaises(ValueError):export_pico_model(wrong)

    def data(self):
        rows=[]
        for label in ('GOOD','DARK','VENTILATE','HOT_HUMID'):
            for session in range(4):
                sid=str(uuid.uuid4())
                for i in range(5):rows.append([1,'real',sid,i+1,1000+session*100+i,20+session,40+i,label])
        return pd.DataFrame(rows,columns=HEADER)

    def test_real_schema_gate_rejects_demo_precision_mixed_conflicts(self):
        data=self.data()
        raw=data.to_csv(index=False).encode()
        df,issues,duplicates,_=inspect_csvs({'fixture':raw,'same':raw})
        self.assertFalse(issues);self.assertEqual(duplicates,80);self.assertEqual(len(require_ready(df)),16)
        for name,value in [('source','demo'),('temperature','25.11'),('light','65536'),('session_id','=formula'),('label','OTHER')]:
            changed=data.astype(str);changed.loc[0,name]=value
            self.assertTrue(inspect_csvs({'fixture':changed.to_csv(index=False).encode()})[1])
        changed=data.copy();changed.loc[0,'label']='DARK'
        self.assertTrue(inspect_csvs({'fixture':changed.to_csv(index=False).encode()})[1])
        with self.assertRaises(ValueError):require_ready(df.iloc[:40])

    def test_artifacts_metadata_and_train_test_disjoint(self):
        from sklearn.model_selection import train_test_split
        df=self.data();sessions=require_ready(df)
        a,b=train_test_split(sessions,test_size=.25,stratify=sessions.label,random_state=42)
        train=df[df.session_id.isin(a.session_id)];test=df[df.session_id.isin(b.session_id)]
        clf=DecisionTreeClassifier(max_depth=3,min_samples_leaf=3,random_state=42).fit(features_for_model(train),train.label)
        (ROOT/'work').mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=ROOT/'work') as tmp:
            meta=write_artifacts(clf,train,test,['test-only-hash'],{'accuracy':0},tmp)
            self.assertFalse(set(meta['train_sessions']) & set(meta['test_sessions']))
            self.assertEqual(meta['train_count']+meta['test_count'],80)
            self.assertTrue((Path(tmp)/'model.py').exists())
            self.assertEqual(hashlib.sha256((Path(tmp)/'model.py').read_bytes()).hexdigest(),meta['source_sha256'])
            self.assertEqual(json.loads((Path(tmp)/'model-tests.json').read_text())['model_id'],meta['model_id'])

    def test_notebook_structure_syntax_and_canonical_source(self):
        import nbformat
        nb=build();nbformat.validate(nbformat.from_dict(nb))
        self.assertEqual(len(nb['cells']),10)
        for c in nb['cells']:
            if c['cell_type']=='code':
                ast.parse(''.join(c['source']));self.assertEqual(c['outputs'],[])
        self.assertIn((ROOT/'scripts/ai_ble/export_tree.py').read_text(encoding='utf-8'),''.join(nb['cells'][5]['source']))
        for path in (ROOT/'public/downloads/ai-ble').rglob('*.py'):ast.parse(path.read_text(encoding='utf-8'))

    def test_notebook_all_code_cells_execute_with_test_only_fixture(self):
        # No test fixture/model is written into public downloads.
        google=types.ModuleType('google');colab=types.ModuleType('google.colab')
        downloaded=[]
        colab.files=types.SimpleNamespace(upload=lambda:{'SOFTWARE_TEST_ONLY.csv':self.data().to_csv(index=False).encode()},download=downloaded.append)
        google.colab=colab
        old=os.getcwd();(ROOT/'work').mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=ROOT/'work') as tmp:
            try:
                os.chdir(tmp)
                namespace={'display':lambda *args:None,'print':lambda *args,**kw:None}
                with patch.dict(sys.modules,{'google':google,'google.colab':colab}),patch.object(pd.Series,'plot',types.SimpleNamespace(bar=lambda *args,**kwargs:None)):
                    for cell in build()['cells']:
                        if cell['cell_type']=='code':exec(''.join(cell['source']),namespace)
                self.assertEqual(downloaded,['model.py','model-meta.json','model-tests.json'])
                self.assertFalse(namespace['issues'])
            finally:os.chdir(old)

if __name__=='__main__':unittest.main(verbosity=2)
