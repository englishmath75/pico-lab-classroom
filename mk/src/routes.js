// Single registry for classroom routes, legacy bookmarks and data ownership.
// Activity IDs are existing Firestore IDs, never derived from a menu label.
export const routes={
 home:{title:'수업 안내',menu:'01',storage:'none'},review:{title:'Python 핵심 복습',menu:'00',storage:'none'},
 lessons:{title:'차시별 실습',menu:'02',storage:'none'},lesson:{title:'학습 단위',menu:'02',storage:'none'},
 activity:{title:'실습',menu:'02',storage:'code',exit:'stop-python'},inquiry:{title:'탐구실',menu:'00',storage:'code',exit:'stop-python'},
 codeup:{title:'CodeUp 연결 실습',menu:'02/04',storage:'code',exit:'stop-python'},practice:{title:'내 Python 실습실',menu:'보조',storage:'code',exit:'stop-python'},
 resources:{title:'실습 자료',menu:'03',storage:'none'},questions:{title:'복습 문제',menu:'04',storage:'notebook',activity:'mk3-notebook'},
 report:{title:'탐구 보고서',menu:'05',storage:'report',activity:'mk3-report'},
 avatar:{title:'AI 표정 아바타 실험실',menu:'체험',storage:'none',enter:'mount-avatar',exit:'dispose-camera-worker'},
 'avatar-notices':{title:'공개 소프트웨어와 모델 안내',menu:'체험 안내',storage:'none'}
};
export const legacyAliases={
 'student-room':'practice','python-review':'review','list-tuple-dictionary':'inquiry&id=a','binary':'inquiry&id=b','binary-color':'inquiry&id=b',
 'radians':'inquiry&id=c','four-turtles':'inquiry&id=d','graphics-gallery':'review&section=gallery','math-function-graphs':'review&section=graphs',
 'physics-explanation':'review&section=coordinates','simulation':'review&section=gravity','mastery':'questions','questions-supplement':'questions',
 'lesson01-guide':'lesson&unit=01','first-analysis':'lesson&unit=01','step-by-step':'lessons','textbook-classroom':'lessons',
 'textbook-guide':'resources','teacher-10':'resources','kosis-project':'report','ai-avatar':'avatar','ai-avatar-notices':'avatar-notices'
};
export function normalizeRoute(url){
 if(!url.searchParams.has('page')) {
  const file=url.pathname.split('/').pop().replace(/\.html$/,'');
  const target=new URLSearchParams('page='+(legacyAliases[file]||'home'));
  if(file==='python-review')target.set('section',({'#turtle':'turtle','#math':'graphs','#physics':'gravity','#coordinates':'coordinates','#gallery':'gallery','#inquiry':'inquiries'})[url.hash]||'basics');
  for(const [key,value] of target)url.searchParams.set(key,value);
 }
 if(url.searchParams.get('page')==='practice'){
  if(url.searchParams.get('workspace')==='mk3-report')url.searchParams.set('page','report');
  if(url.searchParams.get('workspace')==='mk3-notebook')url.searchParams.set('page','questions');
 }
 return url;
}
export function recordKind(id){return id==='mk3-report'?'report':id==='mk3-notebook'?'notebook':'code';}
export function recordRoute(id){
 if(id==='mk3-report')return './?page=report';
 if(id==='mk3-notebook')return './?page=questions';
 if(/^mk3-cu\d+(?:-v)?$/.test(id))return './?page=codeup&id='+id.slice(6).replace('-v','')+(id.endsWith('-v')?'&variant=1':'');
 if(/^mk3-inquiry-[a-d]$/.test(id))return './?page=inquiry&id='+id.at(-1);
 return id.startsWith('mk3-')?'./?page=activity&id='+encodeURIComponent(id):'./?page=practice&workspace='+encodeURIComponent(id);
}
