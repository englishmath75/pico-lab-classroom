/* Only verified, completed media may be listed in lesson-videos.json. */
(()=>{'use strict';
const host=document.getElementById('lessonVideo'),practice=document.getElementById('pilotPractice');
let catalog=[],revision=0,activeFrame=null;
window.addEventListener('message',event=>{if(!activeFrame||event.origin!==location.origin||event.source!==activeFrame.contentWindow||event.data?.type!=='pandas-video-height')return;const height=Number(event.data.height);if(Number.isFinite(height))activeFrame.style.height=Math.min(3000,Math.max(240,height))+'px';});
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const allowedPath=value=>typeof value==='string'&&/^\.\/[\w./-]+$/.test(value)&&!value.split('/').includes('..');
function supplement(lesson){
 practice.replaceChildren();practice.hidden=lesson!==2;if(lesson!==2)return;
 practice.append(node('h3','보충 실습 · 처음 배우는 표와 평균'),node('p','기존 매점 실습과 별도로 독서량과 점수의 평균을 확인합니다. 아래 코드는 내려받아 실행하거나 기존 코드 입력창에 직접 입력하세요.'));
 const table=node('table');table.style.cssText='border-collapse:collapse;width:100%;max-width:460px;text-align:left';table.setAttribute('aria-label','3행 2열 독서량 데이터프레임');
 const head=node('thead'),hr=node('tr');for(const t of ['인덱스','name','books']){const th=node('th',t);th.scope='col';hr.append(th);}head.append(hr);table.append(head);
 const body=node('tbody');[['0','A','3'],['1','B','5'],['2','C','2']].forEach(row=>{const tr=node('tr');row.forEach((v,i)=>{const cell=node(i===0?'th':'td',v);if(i===0)cell.scope='row';cell.style.padding='8px';tr.append(cell);});body.append(tr);});table.append(body);practice.append(table);
 practice.append(node('p','데이터는 3행·2열입니다. 0·1·2는 행의 이름표인 인덱스이고 데이터 열에 포함되지 않습니다. name·books는 열 이름이며 데이터 행에 포함되지 않습니다.'));
 const examples=[['독서량','video_lesson02_books','3.3333333333333335'],['점수','video_lesson02_scores','80.0']];
 for(const [title,file,result] of examples){
 const d=node('details'),summary=node('summary',title+' 예제 코드와 예상 결과');d.append(summary);
 const pre=node('pre','코드를 불러오는 중입니다.');pre.className='snippet';d.append(pre);
 fetch('./downloads/'+file+'.py').then(r=>{if(!r.ok)throw Error();return r.text();}).then(code=>{pre.textContent=code;}).catch(()=>{pre.textContent='코드 파일을 불러오지 못했습니다. 아래 Python 파일 링크를 이용하세요.';});
 d.append(node('p','평균 예상 출력: '+result));const a=node('a','Python 코드 내려받기');a.href='./downloads/'+file+'.py';a.download='';d.append(a,node('span',' · '));
 const csv=node('a','연습용 가상 CSV 내려받기');csv.href='./datasets/'+file+'.csv';csv.download='';d.append(csv);practice.append(d);
 }
 practice.append(node('p','직접 바꾸기: books의 2를 4로 바꾸면 평균은 4.0입니다. score의 90을 100으로 바꾸면 평균은 83.33333333333333입니다. 먼저 예측한 뒤 실행하세요. CSV는 두 예제와 같은 값의 확장 자료이며, 위 코드는 CSV를 읽지 않고 표를 직접 만듭니다.'));
 const q=node('details');q.append(node('summary','보충 확인 문제: df.shape와 평균은 어떻게 구하나요?'),node('p',"독서량 표의 df.shape는 (3, 2)입니다. 평균은 df['books'].mean()으로 구합니다. df['books']는 1차원 Series입니다. mean 뒤의 괄호를 빠뜨리지 마세요."));practice.append(q);
}
async function render(lesson){
 const current=++revision;host.replaceChildren();activeFrame=null;host.hidden=true;supplement(lesson);
 const candidates=catalog.filter(v=>v.lesson===lesson&&v.status==='verified'&&allowedPath(v.src)&&allowedPath(v.captions));
 if(!candidates.length)return;
 const valid=await Promise.all(candidates.map(async item=>{try{const r=await Promise.all([fetch(item.src,{method:'HEAD'}),fetch(item.captions,{method:'HEAD'})]);return r.every(x=>x.ok)?item:null;}catch(_){return null;}}));
 if(current!==revision)return;const items=valid.filter(Boolean);if(!items.length)return;
 host.append(node('h3','강의 영상'));
 const buttons=node('div');buttons.className='video-tabs';buttons.setAttribute('aria-label','강의 편 선택');host.append(buttons);
 const frame=node('iframe');frame.title=lesson+'차시 한국어 강의 영상';frame.allow='fullscreen';frame.allowFullscreen=true;frame.className='lesson-video-frame';frame.style.height='760px';host.append(frame);activeFrame=frame;
 const link=node('a','큰 화면으로 보기 ↗');link.className='video-open';link.target='_blank';link.rel='noopener';host.append(link);
 const controls=[];const select=index=>{const ep=items[index].episode||'lesson02';if(!/^[a-z0-9-]+$/.test(ep))return;frame.src='./video-player.html?episode='+ep+'&embed=1';link.href='./video-player.html?episode='+ep;controls.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));};
 items.forEach((item,i)=>{const button=node('button',item.title||((i+1)+'편'));button.type='button';button.className='btn secondary';button.onclick=()=>select(i);controls.push(button);buttons.append(button);});
 select(0);host.hidden=false;
}

const selected=()=>Number(new URLSearchParams(location.search).get('lesson'))||1;
window.addEventListener('classroom:lesson',e=>render(e.detail.lesson));
fetch('./lesson-videos.json?v=20261028-simple',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(c=>{catalog=Array.isArray(c.lessons)?c.lessons:[];render(selected());}).catch(()=>render(selected()));
})();
