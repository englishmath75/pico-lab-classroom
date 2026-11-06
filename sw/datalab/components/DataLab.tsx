"use client";
import {useEffect,useRef,useState} from 'react';
import Editor from './Editor';

import {normalizePrediction} from '../lib/prediction';
import CSVFlowVisualizer from './visual/CSVFlowVisualizer';
import DataFrameDiffVisualizer from './visual/DataFrameDiffVisualizer';
import {PythonEngine} from '../lib/engine';
import type {RunResult,TableSnapshot,EngineState,ExecutionMetrics} from '../lib/protocol';

import lessons from '../content/sw-visual-lessons.json';
import {buildDataLabProgram} from '../lib/data-lab-program';
import './visual/visual.css';
function tables(result:RunResult|null,step:number){const event=result?.events[step];const read=(name:string):TableSnapshot|undefined=>{const v=event?.globals[name];return v&&typeof v==='object'&&'ref' in v?event?.objects[v.ref]?.table:undefined;};return {before:read('before'),after:read('result'),original:read('df')};}
export default function DataLab({bridge}: {bridge:any}){
 const lessonId=bridge.unit;const lesson=lessons.find(l=>l.id===lessonId)!;const saved=useRef(bridge.readState()).current;
 const [csv,setCsv]=useState(saved.csv??lesson.csv);const [code,setCode]=useState(bridge.readCode()??buildDataLabProgram(lesson.csv,lesson.examples[0].code,lessonId));
 const [result,setResult]=useState<RunResult|null>(null);const [step,setStep]=useState(0);const [state,setState]=useState<EngineState>('idle');const [message,setMessage]=useState('');const [dirty,setDirty]=useState(false);const [metrics,setMetrics]=useState<ExecutionMetrics|null>(null);
 const [answers,setAnswers]=useState<string[]>(saved.answers??['','']);const [feedback,setFeedback]=useState<string[]>(saved.feedback??['','']);const [concept,setConcept]=useState(saved.concept??'');
 const engine=useRef<PythonEngine|null>(null);const revision=useRef(0);
 const busy=['loading','packages','running','reinitializing'].includes(state);
 useEffect(()=>{const e=new PythonEngine(setState,undefined,undefined,setMetrics);e.setPackages(['pandas']);e.setPreparationAllowed(false);engine.current=e;return()=>e.dispose();},[]);
 function edit(c:string){if(c===code)return;revision.current++;setCode(c);bridge.writeCode(c);setDirty(true);setResult(null);setMessage('코드를 변경했습니다. 다시 실행하세요.');}
 function apply(id:string,index:number){
  if(id!==lessonId){bridge.navigate(id);return;}
  if(!window.confirm('현재 코드를 이 예제로 바꾸시겠습니까? 필요한 코드는 먼저 내려받아 보관하세요.'))return;
  edit(buildDataLabProgram(csv,lesson.examples[index].code,id));setFeedback(['','']);bridge.writeState({feedback:['','']});setMessage('예제를 적용했습니다. 직접 실행해 확인하세요.');
 }
 async function run(){if(busy)return;const rev=revision.current;setResult(null);setMessage('실제 Python 실행 중…');try{const r=await engine.current!.run(code,[],true);if(rev!==revision.current)return;setResult(r);setStep(Math.max(0,r.events.length-1));setMessage(r.error?`${r.error.name}: ${r.error.message}`:r.limited?r.stderr||'실행 예산에 도달했습니다.':'실행 완료 · 실제 Python 결과');}catch(e){setMessage(String(e));}}
 async function save(){bridge.writeCode(code);bridge.writeState({csv,answers,feedback,concept});const ok=await bridge.save();setDirty(!ok);setMessage(ok?'클라우드 저장 완료':'저장하지 못했습니다. 상단 상태를 확인하고 초안을 내려받아 주세요.');}
 function restore(){bridge.openLibrary();}
 function download(){const u=URL.createObjectURL(new Blob([code],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download=lesson.id+'.py';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
 const view=tables(result,step);
 return <div className="visual-lab" data-theme="sw"><header className="visual-hero"><span className="visual-kicker">DATA LAB · 표로 발견하는 Python</span><h1>데이터가 바뀌는 순간을<br/><em>눈으로 확인하세요.</em></h1><p>코드를 바꾸고, 실행하고, 원본과 결과를 비교합니다.</p><nav aria-label="데이터 차시">{lessons.map(l=><button key={l.id} disabled={busy} aria-pressed={l.id===lessonId} onClick={()=>apply(l.id,0)}>{l.number} · {l.title}</button>)}</nav></header>
 <div className="visual-layout"><section className="visual-panel"><span className="visual-kicker">STEP 01 · 예측하고 실험하기</span><h2>{lesson.number}. {lesson.title}</h2><p>{lesson.concept}</p><div className="visual-legend"><span>＋ 초록 · 수정</span><span>− 빨강 · 결과 제외</span><span>↔ 노랑 · 위치 이동</span><span>✓ 보라 · 결과 선택</span></div>
 <div className="visual-actions">{lesson.examples.map((e,i)=><button key={e.title} disabled={busy} onClick={()=>apply(lesson.id,i)}>{e.title}</button>)}</div>
 {lessonId==='SW01'?<p className="visual-beginner-note">첫 수업은 <code>import pandas as pd</code> 하나로 시작합니다. <code>pd.DataFrame()</code>으로 직접 표를 만들고, CSV 파일을 읽는 방법은 다음 학습에서 다룹니다.</p>:<CSVFlowVisualizer value={csv} onChange={value=>{setCsv(value);bridge.writeState({csv:value,dataMode:'fictional-edited'});setDirty(true);}}/>}
 <div className="visual-editor"><Editor code={code} onChange={edit} onRun={run} line={result?.events[step]?.line||0} dark={true}/></div>
 <div className="visual-actions"><button className="visual-run" disabled={busy} onClick={run}>{busy?'Python 준비 / 실행 중…':'▶ 실제 Python 실행'}</button><button disabled={!busy} onClick={()=>engine.current?.stop()}>실행 중지</button></div><p role="status" data-testid="data-status">{message}</p>
 <div className="visual-actions"><button onClick={save}>내 코드 저장</button><button onClick={restore}>보관함에서 확인</button><button onClick={download}>.py 내려받기</button><label>내 파일 가져오기<input type="file" accept=".py,.json" onChange={e=>{const file=e.target.files?.[0];if(file)bridge.importFile(file);e.target.value="";}}/></label></div>
 </section><section className="visual-panel visual-results"><span className="visual-kicker">STEP 02 · 실제 결과 관찰하기</span><h2>원본 → 실행 결과</h2>{!result&&<div className="visual-empty"><span>↗</span><h3>아직 실행 전입니다.</h3><p>왼쪽 코드를 실행하면 Python이 만든 표가 나타납니다.</p></div>}{result&&<><div className="visual-actions"><button disabled={step<=0} onClick={()=>setStep(v=>v-1)}>이전 단계</button><span>{step+1} / {result.events.length} · {result.events[step]?.event}</span><button disabled={step>=result.events.length-1} onClick={()=>setStep(v=>v+1)}>다음 단계</button><button onClick={()=>setStep(result.events.length-1)}>최종 결과</button></div><p>line은 해당 줄 실행 전, final은 실행 후입니다. 코드 강조와 표가 같은 이벤트를 가리킵니다.</p>{view.before&&<DataFrameDiffVisualizer title="실행 전 표" table={view.before}/ >}{view.after&&<DataFrameDiffVisualizer title="실행 결과 표" table={view.after} before={view.before}/ >}{view.original&&<details><summary>현재 원본 df 확인</summary><DataFrameDiffVisualizer title="현재 원본 df" table={view.original}/></details>}<pre data-testid="data-stdout">{result.stdout||'(출력 없음)'}</pre>{result.images?.map((src,i)=><figure key={i}><img src={src} alt="Python으로 생성한 그래프" style={{maxWidth:'100%'}}/><a href={src} download={'SW-graph-'+i+'.png'}>그래프 PNG 내려받기</a></figure>)}{result.error&&<p role="alert">{result.error.name}: {result.error.message}</p>}{metrics&&<small data-testid="data-metrics" data-metrics={JSON.stringify(metrics)}>이번 실행 {Math.round(metrics.clickToResultMs)}ms · 실행마다 새 Python 공간</small>}</>}</section></div>
 <section className="visual-panel"><span className="visual-kicker">STEP 03 · 설명하며 확인하기</span><h2>두 가지 미션</h2><p>기본 가상 문구점 CSV 기준입니다. 변경한 데이터의 결과와 구분하세요.</p><div className="visual-missions">{lesson.missions.map((m,i)=><article key={m.question}><h3>{i+1}. {m.question}</h3><label>예측한 답<input value={answers[i]} onChange={e=>{const next=answers.map((v,j)=>j===i?e.target.value:v);setAnswers(next);bridge.writeState({answers:next});setDirty(true);}}/></label><button onClick={()=>{const next=feedback.map((v,j)=>j===i?(normalizePrediction(answers[i])===normalizePrediction(m.answer)?'맞았습니다. 실제 표에서 근거를 설명해 보세요.':'다시 생각해 보세요. '+m.hint):v);setFeedback(next);bridge.writeState({feedback:next});}}>예측 확인</button><p role="status">{feedback[i]}</p><details><summary>힌트와 해설</summary><p>{m.hint}</p><p>{m.answer} · {m.explanation}</p></details></article>)}</div></section>
 <section className="visual-panel"><h2>나의 학습 설명</h2><p>실제 표를 근거로 설명해 보세요. 교재 원문은 바뀌지 않습니다.</p><label>분석·해석<textarea value={concept} onChange={e=>{setConcept(e.target.value);bridge.writeState({concept:e.target.value});setDirty(true);}}/></label></section>
 <p>교재의 가상 자료만 사용합니다. 코드나 CSV 입력란에 실명·연락처 등 개인정보를 입력하지 마세요. 입력한 코드·가상 자료·예측·설명은 계정 저장 대상입니다.</p></div>;
}
