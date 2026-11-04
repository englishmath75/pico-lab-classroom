(() => {
  const bar=document.createElement('nav');bar.className='student-entry';bar.setAttribute('aria-label','개인 학습실');
  for(const [label,path] of [['Google 로그인','./student-room.html'],['내 Python 실습실','./student-room.html'],['내 코드 보관함','./student-room.html?panel=library'],['시험 대비 실습','./?page=exam']]){
    const a=document.createElement('a');a.href=path;a.textContent=label;bar.append(a);
  }
  const end=document.createElement('button');end.textContent='이 PC 학습 마치기';
  end.onclick=()=>{if(confirm('이 화면의 임시 기록을 지우고 학습을 마칠까요? 개인 학습실에 저장한 클라우드 코드는 유지됩니다.'))window.ClassroomTemporaryStorage?.finish();};bar.append(end);
  const note=document.createElement('small');note.textContent='개인 코드 저장은 내 Python 실습실에서 이용하세요.';bar.append(note);
  document.body.prepend(bar);
})();
