// Legacy lesson exercises are temporary per-tab drafts. Cloud code is kept in
// the authenticated personal room. Never load unidentified old localStorage.
(() => {
  const PREFIX='englishmath-temporary:',TTL=15*60000;
  let active=Date.now();const memory=new Map();
  function clear() {
    memory.clear();
    try {for(const key of Object.keys(sessionStorage))if(key.startsWith(PREFIX))sessionStorage.removeItem(key);}catch{}
  }
  function finish() {
    clear();document.querySelectorAll('textarea').forEach(e=>e.value='');location.reload();
  }
  window.ClassroomTemporaryStorage={
    getItem(key) {
      try {const value=JSON.parse(sessionStorage.getItem(PREFIX+key)||'null');if(value&&value.expires>Date.now())return value.value;sessionStorage.removeItem(PREFIX+key);}catch{}
      return memory.get(key)||null;
    },
    setItem(key,value) {memory.set(key,String(value));try{sessionStorage.setItem(PREFIX+key,JSON.stringify({value:String(value),expires:Date.now()+TTL}));}catch{}},
    removeItem(key) {memory.delete(key);try{sessionStorage.removeItem(PREFIX+key);}catch{}},
    clear,finish
  };
  for(const name of ['pointerdown','keydown','touchstart'])addEventListener(name,()=>active=Date.now(),{passive:true});
  setInterval(()=>{
    if(Date.now()-active>TTL) finish();
    else if(Date.now()-active>TTL-60000) {
      const bar=document.querySelector('.student-entry');
      if(bar&&!bar.querySelector('[data-idle-warning]')) {const text=document.createElement('span');text.dataset.idleWarning='true';text.textContent='1분 뒤 이 화면의 임시 기록을 지웁니다. 계속 학습하려면 화면을 누르세요.';bar.append(text);}
    }else document.querySelector('[data-idle-warning]')?.remove();
  },10000);
  if('BroadcastChannel'in window)new BroadcastChannel('englishmath-shared-pc').addEventListener('message',event=>{if(event.data?.type==='logout')finish();});
})();
