import { membershipPatch } from './membership.js';
import { MK_ACTIVITY_IDS } from './activity-ids.js';
// Grade-1 cloud adapter. 2026 cohort paths are isolated from Grade 2 and future academic years.
// Both grades use the same Firebase Auth project; grades never share workspace documents.
const GRADE1_CLASSES=Array.from({length:12},(_,i)=>({id:'class-1-'+(i+1),title:'1학년 '+(i+1)+'반',active:true}));
const GRADE1_STAFF_EMAIL='englishmath@muhak-g-h.gne.go.kr';
const SCHOOL_SPACES = [
  { id: '2026-1', year: 2026, grade: 1, title: '2026학년도 1학년' },
  { id: '2027-1', year: 2027, grade: 1, title: '2027학년도 1학년' },
  { id: '2027-2', year: 2027, grade: 2, title: '2027학년도 2학년' }
];

export function schoolRoot(year, grade) {
  if (![2026, 2027].includes(year) || ![1, 2].includes(grade)) {
    throw Error('지원하는 학년도와 학년을 선택해 주세요.');
  }
  return year === 2026 && grade === 2 ? 'users' : `cohorts/${year}/grade${grade}_users`;
}

function classScope(classKey) {
  const match = /^(2026|2027):(class-([12])-([1-9]|1[0-2]))$/.exec(classKey || '');
  if (!match) throw Error('학년도와 학급을 다시 선택해 주세요.');
  return { year: Number(match[1]), grade: Number(match[3]), classId: match[2] };
}

import { initializeApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, browserPopupRedirectResolver, GoogleAuthProvider, signInWithPopup,
  onAuthStateChanged, signOut, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, connectFirestoreEmulator,
  doc, collection, getDocFromServer, getDocsFromServer, query, where, limit,
  orderBy, startAfter, runTransaction, serverTimestamp, Timestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';

export const MAX_CODE = 20000, SAVE_INTERVAL = 60000, WRITE_GAP = 16000;
export function validWorkspace(id) { return /^(lesson-(0[0-9]|10)|scratch-(0[1-9]|10)|inquiry-[a-d])$/.test(id) || MK_ACTIVITY_IDS.includes(id); }
export function readableError(error) {
  if(error.code==='auth/popup-closed-by-user')return 'Google 로그인을 취소했습니다. 다시 로그인할 수 있습니다.';
  if(error.code==='auth/popup-blocked')return '브라우저에서 로그인 팝업을 허용한 뒤 다시 시도해 주세요.';
  if (error.code === 'conflict') return '다른 기기에서 저장한 새 기록이 있습니다. 현재 학습물을 내려받은 뒤 저장본을 다시 불러오세요.';
  if (error.code === 'cooldown') return '저장 간격을 확인하고 있습니다. 16초 뒤 다시 저장해 주세요.';
  if (error.code === 'daily-limit') return '오늘의 저장 횟수에 도달했습니다. 미저장 학습물을 내려받아 보관하세요.';
  if (/permission-denied/.test(error.code || '')) return '저장 권한이 없습니다. 학급 승인 상태와 계정을 확인해 주세요.';
  if (/unavailable|deadline|network/.test(error.code || '') || globalThis.navigator?.onLine === false) return '연결 문제로 저장하지 못했습니다. 이 화면을 유지하거나 미저장 학습물을 내려받아 주세요.';
  if(error.code==='membership-conflict') return '학생 정보가 다른 화면에서 변경되었습니다. 새로고침 후 다시 확인해 주세요.';
  return error.message || '처리하지 못했습니다. 연결 상태를 확인해 주세요.';
}
export function createCloud(config, emulator = false) {
  const app = initializeApp(config, 'python-student-room');
  const auth = initializeAuth(app, { persistence: inMemoryPersistence, popupRedirectResolver: browserPopupRedirectResolver });
  auth.languageCode = 'ko';
  const db = initializeFirestore(app, { localCache: memoryLocalCache() });
  if (emulator && ['localhost', '127.0.0.1'].includes(location.hostname)) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  let schoolService = new StudentStore(db, schoolRoot(2026, 1));
  const personalService = new StudentStore(db, 'public_users');
  let activeService = schoolService;
  return {
    get service() { return activeService; },
    observe(callback) { return onAuthStateChanged(auth, callback); },
    login: () => signInWithPopup(auth, provider),
    logout: () => signOut(auth),
    async identity(user, requestedSpace = null) {
      const selected = SCHOOL_SPACES.find(space => space.id === requestedSpace) || SCHOOL_SPACES[0];
      if (requestedSpace && requestedSpace !== 'personal' && requestedSpace !== selected.id) {
        throw Error('학습 공간을 다시 선택해 주세요.');
      }
      const [staff, profile, personal, activeClasses, access] = await Promise.all([
        getDocFromServer(doc(db, 'staff', user.uid)),
        getDocFromServer(doc(db, schoolRoot(selected.year, selected.grade), user.uid)),
        getDocFromServer(doc(db, 'public_users', user.uid)),
        getDocsFromServer(query(collection(db, 'classes'), where('active','==',true),limit(50))),
        getDocFromServer(doc(db, 'config', 'access'))
      ]);
      const teacher = staff.exists() && user.email?.toLowerCase() === GRADE1_STAFF_EMAIL;
      const grade2Classes = activeClasses.docs.filter(d => /^class-2-([1-9]|1[0-2])$/.test(d.id))
        .map(d => ({ ...d.data(), id: d.id, title: d.data().title.replace(/^(?:\d{4}학년도\s*)+/, '') }));
      const classes = selected.grade === 1 ? GRADE1_CLASSES : grade2Classes;
      const teacherClasses = teacher ? [
        ...GRADE1_CLASSES.map(c => ({ ...c, id: `2026:${c.id}`, title: `2026학년도 ${c.title}` })),
        ...grade2Classes.filter(c => staff.data().classIds?.includes(c.id))
          .map(c => ({ ...c, id: `2026:${c.id}`, title: `2026학년도 ${c.title}` })),
        ...[...GRADE1_CLASSES, ...grade2Classes]
          .map(c => ({ ...c, id: `2027:${c.id}`, title: `2027학년도 ${c.title}` }))
      ] : [];
      const studentProfile = profile.exists() ? profile.data() : null;
      const personalProfile = personal.exists() ? {...personal.data(), userType:'personal'} : null;
      const usePersonal = requestedSpace === 'personal' || (!requestedSpace && !studentProfile && !!personalProfile);
      schoolService = new StudentStore(db, schoolRoot(selected.year, selected.grade));
      activeService = usePersonal ? personalService : schoolService;
      const grade1Staff = teacher ? { ...staff.data(), classIds: teacherClasses.map(c => c.id) } : null;
      return {
        staff: grade1Staff, profile: usePersonal ? personalProfile : studentProfile,
        classes, teacherClasses, access: access.data(), service: activeService,
        spaceId: usePersonal ? 'personal' : selected.id,
        spaces: [...SCHOOL_SPACES, { id: 'personal', title: '개인 코드 보관함 · 학급 등록 없이 사용' }],
        spaceTitle: usePersonal ? '개인 코드 보관함' : selected.title
      };
    },
    async registerPersonal(user) {
      const profileRef = doc(db, 'public_users', user.uid);
      await runTransaction(db, async tx => {
        if ((await tx.get(profileRef)).exists()) return;
        tx.set(profileRef, {
        email:user.email, displayName:(user.displayName || '개인 학습자').slice(0,80),
        userType:'personal', status:'approved', createdAt:serverTimestamp(), updatedAt:serverTimestamp()
        });
      });
    },
    async register(user, classId, spaceId = '2026-1', displayName = user.displayName) {
      const selected = SCHOOL_SPACES.find(space => space.id === spaceId);
      if (!selected || !classId.startsWith(`class-${selected.grade}-`)) throw Error('학년도와 학급을 확인해 주세요.');
      const name=String(displayName||'').trim();
      if(!name||name.length>80) throw Error('학생 이름을 입력해 주세요.');
      const profileRef = doc(db, schoolRoot(selected.year, selected.grade), user.uid);
      await runTransaction(db, async tx => {
        const existing = await tx.get(profileRef);
        if (existing.exists()) {
          if (existing.data().classId !== classId) throw Error('이미 등록한 학급이 있습니다. 담당 선생님께 확인해 주세요.');
          return;
        }
        tx.set(profileRef, { email: user.email, displayName: name,
          classId, status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      });
    },
    async membership(user, spaceId, action, input, expected) {
      const selected=SCHOOL_SPACES.find(s=>s.id===spaceId);
      if(!selected) throw Error('학교 학습 공간에서만 회원 정보를 변경할 수 있습니다.');
      return mutateMembership(db,schoolRoot(selected.year,selected.grade),user.uid,user.uid,action,input,expected);
    },
    async manageMembership(uid,classKey,action,input,expected) {
      const {year,grade}=classScope(classKey);
      if(year===2026&&grade===2) throw Error('SW 학급은 SW 교사용 관리실에서 처리해 주세요.');
      return mutateMembership(db,schoolRoot(year,grade),uid,auth.currentUser?.uid,action,input,expected);
    },
    async membershipHistory(uid,classKey) {
      const {year,grade}=classScope(classKey);
      if(year===2026&&grade===2) return [];
      const result=await getDocsFromServer(query(collection(db,schoolRoot(year,grade),uid,'membershipHistory'),orderBy('version','desc'),limit(30)));
      return result.docs.map(d=>d.data());
    },
    async students(classKey) {
      const { year, grade, classId } = classScope(classKey);
      const root = schoolRoot(year, grade);
      const result=await getDocsFromServer(query(collection(db,root),where('classId','==',classId),limit(100)));
      return result.docs.map(d=>({uid:d.id,...d.data(),academicYear:year,grade,classKey}));
    },
    approve(uid,status,classKey) {
      const { year, grade } = classScope(classKey);
      const root=schoolRoot(year, grade);
      return updateDoc(doc(db,root,uid),{status,updatedAt:serverTimestamp()});
    },
    async teacherDetails(uid,classKey) {
      const { year, grade, classId } = classScope(classKey);
      const root=schoolRoot(year, grade);
      const [progress,submissions,quota]=await Promise.all([
        paged(collection(db,root,uid,'progress')),
        paged(collection(db,root,uid,'submissions'),[where('classId','==',classId)]),
        getDocFromServer(doc(db,root,uid,'limits','state'))
      ]);
      return {progress:progress.map(d=>d.data()),submissions:submissions.map(d=>d.data()),quota:quota.data()};
    }
  };
}


export async function mutateMembership(db,root,uid,actorUid,action,input={},expected) {
  if(!/^cohorts\/(2026\/grade1_users|2027\/grade[12]_users)$/.test(root)) throw Error('지원하지 않는 회원 공간입니다.');
  const ref=doc(db,root,uid);
  await runTransaction(db,async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists()) throw Error('등록 정보를 찾지 못했습니다. 새로고침해 주세요.');
    const before=snap.data();
    if(!expected || (before.membershipVersion||0)!==(expected.membershipVersion||0) || before.updatedAt?.toMillis()!==expected.updatedAt?.toMillis()) {
      throw Object.assign(Error('학생 정보가 변경되었습니다.'),{code:'membership-conflict'});
    }
    const now=serverTimestamp(),after=membershipPatch(before,action,{...input,actorUid},now);
    tx.set(ref,after);
    tx.set(doc(ref,'membershipHistory',String(after.membershipVersion)),{version:after.membershipVersion,action,actorUid,at:now,before,after});
  });
}

export class StudentStore {
  constructor(db, root = 'cohorts/2026/grade1_users') { this.db=db; this.root=root; }
  ref(uid, group, id) { return doc(this.db, this.root, uid, group, id); }
  async load(uid, id) { const d = await getDocFromServer(this.ref(uid, 'workspaces', id)); return d.exists() ? d.data() : null; }
  async list(uid) {
    const docs=await paged(collection(this.db,this.root,uid,'workspaces'));
    return docs.map(x=>x.data()).sort((a,b)=>(b.savedAt?.toMillis()||0)-(a.savedAt?.toMillis()||0));
  }
  async revisions(uid, id) {
    const d = await getDocsFromServer(query(collection(this.db, this.root, uid, 'revisions'), where('workspaceId','==',id), limit(10)));
    return d.docs.map(x => x.data()).sort((a,b) => b.version - a.version);
  }
  async mutate(uid, id, kind, input, expectedVersion) {
    if (!validWorkspace(id) || (input?.code?.length || 0) > MAX_CODE) throw Error('실습 번호와 코드 길이를 확인하세요. 최대 20,000자입니다.');
    const workRef = this.ref(uid, 'workspaces', id), quotaRef = this.ref(uid, 'limits', 'state');
    return runTransaction(this.db, async tx => {
      const [current, quota] = await Promise.all([tx.get(workRef), tx.get(quotaRef)]);
      const version = current.data()?.version || 0, previousQuota = quota.data(), now = Date.now();
      if (kind !== 'submit' && version !== expectedVersion) throw Object.assign(Error('conflict'), { code: 'conflict' });
      if (previousQuota && now - previousQuota.updatedAt.toMillis() < WRITE_GAP) throw Object.assign(Error('cooldown'), { code: 'cooldown' });
      const day = Timestamp.fromMillis(Math.floor(now / 86400000) * 86400000);
      const count = previousQuota?.day?.isEqual(day) ? previousQuota.count + 1 : 1;
      if (count > 150) throw Object.assign(Error('daily-limit'), { code: 'daily-limit' });
      tx.set(quotaRef, { day, count, workspaceId: id, kind, updatedAt: serverTimestamp() });
      if (kind === 'delete') {
        tx.delete(workRef); tx.delete(this.ref(uid, 'progress', id)); return 0;
      }
      const data = { workspaceId: id, lessonId: id, title: input.title.slice(0,80), code: input.code,
        runState: input.runState, completed: !!input.completed, version: version + 1, savedAt: serverTimestamp() };
      if (kind === 'submit') {
        tx.set(this.ref(uid, 'submissions', id), { ...data, classId: input.classId }); return version;
      }
      tx.set(workRef, data);
      const slot = (version + 1) % 10;
      tx.set(this.ref(uid, 'revisions', `${id}__${slot}`), { ...data, slot });
      tx.set(this.ref(uid, 'progress', id), { workspaceId: id, runState: data.runState,
        completed: data.completed, savedAt: serverTimestamp(), version: data.version });
      return data.version;
    });
  }
}

async function paged(ref,filters=[]) {
  const result=[];let cursor;
  do {
    const page=await getDocsFromServer(query(ref,...filters,...(cursor?[startAfter(cursor)]:[]),limit(50)));
    result.push(...page.docs);
    if(page.size<50)break;
    cursor=page.docs.at(-1);
  }while(result.length<250);
  return result;
}

