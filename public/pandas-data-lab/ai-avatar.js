import {animals,avatarSVG,extractSignals,smooth,classify,clamp,defaultCode,snapshotCode} from './ai-avatar-core.mjs';
import {runPython} from './ai-avatar-run.js';
const $=id=>document.getElementById(id), zero=()=>({smile:0,blink:0,tilt:0});
let values=zero(),raw=zero(),baseline=zero(),flags={},selected='cat',mode='virtual';
let stream=null,landmarker=null,frame=0,epoch=0,starting=false,lastTime=-1,lastFrame=0,interval=70,averageMs=0;
let runner=null,mission={smile:false,blink:false,tilt:false},heldSince=null,blinkSince=null,left=false,right=false;
const threshold=()=>({smile:+$('smile-threshold').value,blink:+$('blink-threshold').value,tilt:+$('tilt-threshold').value});
function resetMissions(){mission={smile:false,blink:false,tilt:false};heldSince=null;blinkSince=null;left=false;right=false;for(const key of Object.keys(mission)){const card=$('mission-'+key);card.classList.remove('done');card.querySelector('strong').textContent='아직 성공하지 않았어요';}$('mission-feedback').textContent=(mode==='virtual'?'가상 미션':'카메라 미션')+' · 세 가지 동작에 도전하세요.';}
function success(key){if(mission[key])return;mission[key]=true;const card=$('mission-'+key);card.classList.add('done');card.querySelector('strong').textContent='✓ 성공! 다시 도전할 수도 있어요.';$('mission-feedback').textContent=(mode==='virtual'?'가상 실험':'카메라 신호')+'에서 '+({smile:'활짝 웃기',blink:'눈 깜빡이기',tilt:'양쪽 기울이기'}[key])+' 성공!';}
function updateMissions(now){
 if(flags.smile){heldSince??=now;if(now-heldSince>=350)success('smile');}else heldSince=null;
 if(flags.blink){blinkSince??=now;if(now-blinkSince>1000&&!mission.blink)$('mission-blink').querySelector('strong').textContent='눈 감기 유지 중 · 다시 뜬 뒤 짧게 깜빡여요.';}
 else if(blinkSince!==null){const duration=now-blinkSince;if(duration>=40&&duration<=1000)success('blink');else if(!mission.blink)$('mission-blink').querySelector('strong').textContent='다시 도전: 1초 안에 감았다 떠요.';blinkSince=null;}
 if(flags.tilt){if(values.tilt<0)left=true;else right=true;if(left&&right)success('tilt');else if(!mission.tilt)$('mission-tilt').querySelector('strong').textContent='한쪽 성공! 반대쪽으로도 기울여요.';}
}
function render(now=performance.now(),valid=true){
 flags=classify(values,threshold(),flags);
 for(const key of ['smile','blink','tilt']){$(key+'-value').textContent=values[key].toFixed(key==='tilt'?1:2)+(key==='tilt'?'°':'');$(key).value=values[key];}
 const head=$('avatar').querySelector('.animal-head');head.style.transform=`rotate(${values.tilt}deg)`;
 $('avatar').querySelector('.eyes').style.transform=`scaleY(${Math.max(.05,1-values.blink*.95)})`;
 $('avatar').querySelector('.mouth').setAttribute('d',`M133 207Q160 ${214+values.smile*48} 187 207`);
 $('reaction').textContent=!valid?'얼굴을 기다리고 있어요':flags.blink?'눈이 감겼어요':flags.smile?'활짝 웃어요!':values.smile>=.4?'살짝 웃어요':flags.tilt?'고개가 기울었어요':'편안한 표정';
 if(valid)updateMissions(now);
}
for(const [id,name,nick] of animals){const b=document.createElement('button');b.className='animal-option';b.dataset.animal=id;b.setAttribute('aria-label',name+' '+nick);b.setAttribute('aria-pressed',String(id===selected));b.innerHTML=avatarSVG(id,true)+name+'<span>'+nick+'</span>';b.onclick=()=>{selected=id;for(const button of $('animals').children)button.setAttribute('aria-pressed',String(button===b));$('avatar').innerHTML=avatarSVG(id);$('animal-name').textContent=nick+' · '+name;render();};$('animals').append(b);}
$('avatar').innerHTML=avatarSVG(selected);
function setMode(next){mode=next;$('mode').textContent=next==='camera'?'카메라 실측값 · 내 PC 내부 처리':'가상 실험값 · 실제 얼굴 인식 아님';$('signal-hint').textContent=next==='camera'?'슬라이더는 실측값 표시입니다. 값을 직접 바꾸려면 가상 모드로 전환하세요.':'슬라이더를 움직여 가상 실험값을 바꾸세요. 실제 얼굴 인식값이 아닙니다.';for(const id of ['smile','blink','tilt'])$(id).disabled=next==='camera';$('calibrate').disabled=next!=='camera';resetMissions();}
function stopCamera(message='카메라가 꺼졌습니다. 가상 모드로 실습할 수 있습니다.'){
 epoch++;starting=false;cancelAnimationFrame(frame);frame=0;
 if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;
 $('camera').pause();$('camera').srcObject=null;$('camera').hidden=true;$('preview').checked=false;$('camera-placeholder').hidden=false;
 landmarker?.close();landmarker=null;values=zero();raw=zero();baseline=zero();flags={};lastTime=-1;averageMs=0;interval=70;
 $('start-camera').disabled=false;$('stop-camera').disabled=true;$('camera-status').textContent=message;
 $('camera-placeholder').innerHTML='<span class="camera-symbol">◉</span><strong>카메라는 꺼져 있어요</strong><p>가상 모드로 계속 실습할 수 있습니다.</p>';
 $('calibration').textContent='보정값을 지웠습니다.';
 if(mode==='camera'){$('code').value=snapshotCode(zero())+defaultCode(threshold());$('output').textContent='카메라 종료로 이전 수치와 실행 결과를 지웠습니다.';runner?.stop();}
 setMode('virtual');render();
}
async function startCamera(){
 if(starting||stream)return;starting=true;const own=++epoch;const began=performance.now();const deadline=setTimeout(()=>{if(own===epoch)stopCamera('카메라/모델 준비가 지연되었습니다. 가상 모드를 사용하거나 다시 시도해 주세요.');},60000);$('start-camera').disabled=true;$('stop-camera').disabled=false;$('camera-status').textContent='카메라 권한을 확인하고 있습니다…';
 try{
 if(!navigator.mediaDevices?.getUserMedia)throw Object.assign(Error(),{name:'Unsupported'});
 const acquired=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
 if(own!==epoch){acquired.getTracks().forEach(t=>t.stop());return;}stream=acquired;
 $('camera').srcObject=stream;await $('camera').play();if(own!==epoch)return;
 $('camera-status').textContent='표정 모델 준비 중… 첫 실행은 다운로드 시간이 필요합니다.';
 const {FaceLandmarker,FilesetResolver}=await import('./avatar-vendor/vision_bundle.mjs');
 if(own!==epoch)return;
 const vision=await FilesetResolver.forVisionTasks(new URL('./avatar-vendor/wasm/',import.meta.url).href.replace(/\/$/,''));
 const options={baseOptions:{modelAssetPath:new URL('./avatar-vendor/face_landmarker.task',import.meta.url).href,delegate:'GPU'},runningMode:'VIDEO',numFaces:1,outputFaceBlendshapes:true};
 let model;
 try{model=await FaceLandmarker.createFromOptions(vision,options);}catch(error){if(own!==epoch)return;options.baseOptions.delegate='CPU';model=await FaceLandmarker.createFromOptions(vision,options);}
 if(own!==epoch){model.close();return;}landmarker=model;starting=false;setMode('camera');
 $('camera-status').textContent='카메라 연결 완료 · 얼굴을 화면 가운데로 향해 주세요.';
 $('performance').textContent=`모델 준비 ${((performance.now()-began)/1000).toFixed(1)}초 · ${options.baseOptions.delegate} · 영상은 전송하지 않습니다.`;
 $('camera-placeholder').innerHTML='<span class="camera-symbol">◉</span><strong>내 PC에서 표정을 인식하고 있어요</strong><p>영상은 숨겨져 있습니다.<br>아래에서 미리보기만 선택할 수 있어요.</p>';
 for(const track of stream.getTracks())track.onended=()=>stopCamera('카메라 연결이 끝났습니다. 가상 모드로 전환했습니다.');
 frame=requestAnimationFrame(tick);
 }catch(error){if(own!==epoch)return;const messages={NotAllowedError:'카메라 권한이 거절되었거나 관리자가 차단했습니다.',NotFoundError:'연결된 카메라가 없습니다.',NotReadableError:'카메라를 다른 앱에서 사용 중이거나 장치를 열 수 없습니다.',Unsupported:'이 브라우저는 카메라를 지원하지 않습니다.'};stopCamera((messages[error.name]||'표정 모델을 준비하지 못했습니다. 네트워크나 기기 지원 상태를 확인해 주세요.')+' 가상 모드로 같은 수업을 할 수 있습니다.');}finally{clearTimeout(deadline);}
}
function tick(now){
 if(!landmarker||!stream||mode!=='camera')return;
 if(now-lastFrame>=interval&&$('camera').readyState>=2&&$('camera').currentTime!==lastTime){
 lastFrame=now;lastTime=$('camera').currentTime;
 try{const before=performance.now();const result=landmarker.detectForVideo($('camera'),now);const elapsed=performance.now()-before;averageMs=averageMs?averageMs*.85+elapsed*.15:elapsed;
 interval=averageMs>65?140:averageMs>35?100:70;
 const next=extractSignals(result,$('camera').videoWidth,$('camera').videoHeight);
 if(next){raw=next;const adjusted={smile:clamp(next.smile-baseline.smile),blink:clamp(next.blink-baseline.blink),tilt:clamp(next.tilt-baseline.tilt,-30,30)};values=smooth(values,adjusted,+$('smoothing').value);$('camera-status').textContent=`얼굴 추적 중 · 추론 평균 ${averageMs.toFixed(0)}ms · 최대 ${Math.round(1000/interval)}FPS`;render(now);}
 else{values=zero();raw=zero();flags={};heldSince=null;blinkSince=null;left=false;right=false;$('camera-status').textContent='얼굴을 찾지 못했습니다. 조명·거리·가림을 확인하세요. 추정값을 초기화했습니다.';render(now,false);}
 }catch{stopCamera('인식이 중단되었습니다. 가상 모드로 전환했습니다.');return;}
 }frame=requestAnimationFrame(tick);
}
$('start-camera').onclick=startCamera;$('stop-camera').onclick=()=>stopCamera();$('virtual').onclick=()=>stopCamera('가상 모드 · 실제 얼굴 인식이 아닙니다.');
$('preview').onchange=()=>{$('camera').hidden=!(stream&&$('preview').checked);$('camera-placeholder').hidden=!!(stream&&$('preview').checked);};
for(const key of ['smile','blink','tilt'])$(key).oninput=()=>{if(mode!=='virtual')return;values[key]=+$(key).value;render();};
for(const key of ['smile','blink','tilt'])$(key+'-threshold').oninput=()=>{$(key+'-threshold-value').textContent=(+$(key+'-threshold').value).toFixed(key==='tilt'?0:2)+(key==='tilt'?'°':'');flags={};render();};
$('calibrate').onclick=()=>{if(mode!=='camera'||!landmarker)return;baseline={...raw};values=zero();flags={};$('calibration').textContent='현재 표정을 중립으로 설정했습니다. 크게 웃거나 눈을 감지 않은 상태에서 보정하세요.';render();};
$('reset-signal').onclick=()=>{if(mode==='camera'){baseline=zero();$('calibration').textContent='보정을 해제했습니다.';}else{values=zero();flags={};render();}};
$('retry').onclick=resetMissions;
// Only an explicit click transfers a numeric snapshot into the local Python frame.
function sendSnapshot(){const body=$('code').value.replace(/^smile_score = .*\nblink_score = .*\nhead_tilt_deg = .*\n/,'');$('code').value=snapshotCode(values)+body;$('snapshot-status').textContent=(mode==='camera'?'카메라에서 얻은 순간값':'가상 실험값')+` 복사 완료: ${values.smile.toFixed(3)}, ${values.blink.toFixed(3)}, ${values.tilt.toFixed(1)}°. 숫자 세 개만 내 PC의 Python에 전달됩니다.`;}
$('code').value=snapshotCode(values)+defaultCode();$('snapshot').onclick=sendSnapshot;
$('example').onclick=()=>{$('code').value=snapshotCode(values)+defaultCode(threshold());$('snapshot-status').textContent='현재 점수와 기준으로 예제를 다시 만들었습니다.';};
$('run-python').onclick=async()=>{
 if(runner)return;$('run-python').disabled=true;$('stop-python').disabled=false;$('output').textContent='';
 const job=runPython($('code').value,{},text=>$('python-status').textContent=text);runner=job;
 try{const result=await job.promise;$('output').textContent=result.output||'(출력 없음 — print()를 사용해 보세요.)';$('python-status').textContent='실제 Python 실행 완료 · 버튼을 눌렀을 때의 코드 결과입니다.';}
 catch(error){$('output').textContent=String(error.message);$('python-status').textContent='실행을 완료하지 못했습니다. 코드와 준비 상태를 확인한 뒤 다시 실행하세요.';}
 finally{if(runner===job)runner=null;$('run-python').disabled=false;$('stop-python').disabled=true;}
};
$('stop-python').onclick=()=>runner?.stop();
$('download').onclick=()=>{const blob=new Blob([snapshotCode({smile:.82,blink:.12,tilt:15})+defaultCode(threshold())],{type:'text/x-python;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='avatar-virtual-conditions.py';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function end(){stopCamera('학습 종료 · 카메라와 임시값을 지웠습니다.');runner?.stop();$('code').value=snapshotCode(zero())+defaultCode();$('output').textContent='학습을 종료했습니다.';$('snapshot-status').textContent='이전 점수를 지웠습니다.';resetMissions();}
$('end').onclick=end;
addEventListener('pagehide',end);document.addEventListener('visibilitychange',()=>{if(document.hidden)end();});
// Virtual hold detection without collecting or persisting scores.
setInterval(()=>{if(mode==='virtual'&&!document.hidden)updateMissions(performance.now());},100);
setMode('virtual');render();
