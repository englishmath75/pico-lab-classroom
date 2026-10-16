'use strict';
(() => {
 const $=id=>document.getElementById(id),video=$('player');let catalog=[],index=0,variant='silent',hls=null,continuous=false,savedAt=0,lastStored=-1,request=0;
 const time=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
 const key=()=>`pico-v5-${catalog[index]?.id}-${variant}`;
 const read=()=>{try{return Number(localStorage.getItem(key()))||0}catch{return 0}};
 function save(){if(!catalog.length||!Number.isFinite(video.currentTime)||video.readyState<1||(!video.ended&&video.currentTime<1))return;try{localStorage.setItem(key(),String(video.ended?0:video.currentTime))}catch{}}
 function status(s){$('status').textContent=s}
 function play(){video.play().catch(()=>status('재생 버튼을 눌러 시작하세요.'))}
 function seek(t){if(!Number.isFinite(video.duration))return;video.currentTime=Math.min(Math.max(t,0),video.duration-.1)}
 function renderList(){const list=$('episodes');list.replaceChildren();catalog.forEach((ep,i)=>{const b=document.createElement('button');b.className='episode';b.type='button';b.setAttribute('aria-current',String(i===index));const n=document.createElement('span');n.className='num';n.textContent=`0${i+1}`;const wrap=document.createElement('span'),title=document.createElement('strong'),info=document.createElement('small');title.textContent=ep.title;info.textContent=`${time(ep.duration)} · 무음 자막판`;wrap.append(title,info);b.append(n,wrap);b.onclick=()=>{continuous=false;load(i,'silent',false)};list.append(b)});}
 function load(i,v='silent',autoplay=false){save();request++;const current=request;index=i;const ep=catalog[index];variant=ep.variants.some(x=>x.id===v)?v:ep.variants[0].id;const source=ep.variants.find(x=>x.id===variant);const duration=source.duration??ep.duration,chapters=source.chapters??ep.chapters;video.pause();if(hls){hls.destroy();hls=null}video.removeAttribute('src');video.load();lastStored=-1;savedAt=read();$('resume').hidden=savedAt<2||savedAt>duration-2;$('resume').textContent=`${time(savedAt)}부터 이어서`;video.poster=ep.poster;$('episode-number').textContent=`STEP ${index+1}`;$('episode-title').textContent=ep.title;$('mode-label').textContent=continuous?'전체 이어보기':source.label;$('previous').disabled=index===0;$('next').disabled=index===catalog.length-1;renderList();
  $('variant').replaceChildren(...ep.variants.map(x=>new Option(x.label,x.id)));$('variant').value=variant;$('variant-control').hidden=ep.variants.length<2;
  $('chapters').replaceChildren(...chapters.map(ch=>{const b=document.createElement('button');b.type='button';const t=document.createElement('time');t.textContent=time(ch.at);b.append(t,document.createTextNode(ch.title));b.onclick=()=>{seek(ch.at);status(`${ch.title} 단계로 이동했습니다.`)};return b}));
  status('영상을 불러오는 중입니다.');video.onloadedmetadata=()=>{if(current!==request)return;video.playbackRate=Number($('speed').value);status('무음 영상입니다. 재생 후 필요한 단계에서 멈추며 따라 하세요.');if(autoplay)play()};
  if(source.src.endsWith('.m3u8')&&window.Hls&&Hls.isSupported()){hls=new Hls({maxBufferLength:30});hls.loadSource(source.src);hls.attachMedia(video);hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)status('영상을 불러오지 못했습니다. 연결을 확인한 뒤 영상 목록에서 다시 선택하세요.')});}
  else if(!source.src.endsWith('.m3u8')||video.canPlayType('application/vnd.apple.mpegurl'))video.src=source.src;
  else status('이 브라우저에서는 재생을 지원하지 않습니다. 최신 Chrome 또는 Safari를 사용하세요.');
 }
 $('play').onclick=()=>video.paused?play():video.pause();video.onplay=()=>{$('play').textContent='Ⅱ 일시정지'};video.onpause=()=>{$('play').textContent='▶ 재생';save()};
 video.ontimeupdate=()=>{const bucket=Math.floor(video.currentTime/5);if(bucket!==lastStored){save();lastStored=bucket}};
 video.onended=()=>{save();if(continuous&&index<catalog.length-1)load(index+1,variant,true);else status('시청을 마쳤습니다. 직접 만든 회로를 저장하고 다시 열어 확인하세요.')};
 video.onerror=()=>status('영상 재생 오류가 발생했습니다. 연결을 확인하고 영상을 다시 선택하세요.');
 $('back-ten').onclick=()=>seek(video.currentTime-10);$('resume').onclick=()=>{seek(savedAt);$('resume').hidden=true;play()};$('speed').onchange=()=>video.playbackRate=Number($('speed').value);
 $('variant').onchange=()=>load(index,$('variant').value,false);$('previous').onclick=()=>load(index-1,variant,false);$('next').onclick=()=>load(index+1,variant,false);$('play-all').onclick=()=>{continuous=true;load(0,'silent',true)};
 $('fullscreen').onclick=()=>{if(video.requestFullscreen)video.requestFullscreen().catch(()=>status('브라우저의 영상 전체 화면 버튼을 사용하세요.'));else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen()};
 window.addEventListener('pagehide',save);
 fetch('./catalog.json?v=step1-v6-20261016',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{catalog=data.episodes;const total=Math.floor(catalog.reduce((sum,ep)=>sum+Number(ep.duration||0),0));const summary=$('catalog-summary');if(summary)summary.textContent=`${catalog.length}편 · 총 ${Math.floor(total/60)}분 ${total%60}초`;const query=new URLSearchParams(location.search);continuous=query.get('playlist')==='all';const requested=catalog.findIndex(ep=>ep.id===query.get('episode'));load(continuous?0:Math.max(0,requested))}).catch(()=>status('영상 목록을 불러오지 못했습니다. 잠시 후 새로고침하세요.'));
})();
