import { initializeApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, browserPopupRedirectResolver, GoogleAuthProvider, signInWithPopup,
  onAuthStateChanged, signOut, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, connectFirestoreEmulator,
  doc, collection, getDocFromServer, getDocsFromServer, query, where, limit,
  orderBy, runTransaction, serverTimestamp, Timestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';

export const MAX_CODE = 20000, SAVE_INTERVAL = 60000, WRITE_GAP = 16000;
import {validActivity as validWorkspace} from './registry.js';
export {validWorkspace};
export function readableError(error) {
  if (error.code === 'conflict') return '다른 기기에서 저장한 새 코드가 있습니다. 현재 코드를 .py로 내려받은 뒤 클라우드 코드를 다시 불러오세요.';
  if (error.code === 'cooldown') return '저장 간격을 확인하고 있습니다. 16초 뒤 다시 저장해 주세요.';
  if (error.code === 'daily-limit') return '오늘의 저장 횟수에 도달했습니다. .py 파일로 내려받아 보관하세요.';
  if (/permission-denied/.test(error.code || '')) return '저장 권한이 없습니다. 학급 승인 상태와 계정을 확인해 주세요.';
  if (/unavailable|deadline|network/.test(error.code || '') || globalThis.navigator?.onLine === false) return '인터넷 연결로 저장하지 못했습니다. 이 화면을 유지하고 .py 파일을 내려받아 주세요.';
  return error.message || '처리하지 못했습니다. 연결 상태를 확인해 주세요.';
}
export function createCloud(config, emulator = false) {
  const app = initializeApp(config, 'sw-classroom');
  const auth = initializeAuth(app, { persistence: inMemoryPersistence, popupRedirectResolver: browserPopupRedirectResolver });
  auth.languageCode = 'ko';
  const db = initializeFirestore(app, { localCache: memoryLocalCache() });
  if (emulator && ['localhost', '127.0.0.1'].includes(location.hostname)) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const service = new StudentStore(db);
  return {
    service,
    observe(callback) { return onAuthStateChanged(auth, callback); },
    login: () => signInWithPopup(auth, provider),
    logout: () => signOut(auth),
    async identity(user) {
      const [staff, profile, classes, access] = await Promise.all([
        getDocFromServer(doc(db, 'staff', user.uid)), getDocFromServer(doc(db, 'users', user.uid)),
        getDocsFromServer(query(collection(db, 'classes'), where('active', '==', true), limit(50))),
        getDocFromServer(doc(db, 'config', 'access'))
      ]);
      return { staff: staff.exists() ? staff.data() : null, profile: profile.exists() ? profile.data() : null,
        classes: classes.docs.map(d => ({ id: d.id, ...d.data() })), access: access.data() };
    },
    async register(user, classId) {
      if(!/^class-2-([1-9]|1[0-2])$/.test(classId))throw Error('기존 고2 학급을 선택해 주세요.');
      const existing=await getDocFromServer(doc(db,'users',user.uid));
      if(existing.exists())return existing.data();
      await setDoc(doc(db, 'users', user.uid), { email: user.email, displayName: (user.displayName || '학생').slice(0, 80),
        classId, status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    },
    async students(classId) {
      const result = await getDocsFromServer(query(collection(db, 'users'), where('classId', '==', classId), limit(100)));
      return result.docs.map(d => ({ uid: d.id, ...d.data() }));
    },
    approve(uid, status) { return updateDoc(doc(db, 'users', uid), { status, updatedAt: serverTimestamp() }); },
    async teacherDetails(uid, classId) {
      const [progress, submissions, quota] = await Promise.all([
        getDocsFromServer(query(collection(db, 'users', uid, 'progress'), limit(50))),
        getDocsFromServer(query(collection(db, 'users', uid, 'submissions'), where('classId','==',classId), limit(50))),
        getDocFromServer(doc(db, 'users', uid, 'limits', 'state'))
      ]);
      return { progress: progress.docs.map(d => d.data()), submissions: submissions.docs.map(d => d.data()), quota: quota.data() };
    }
  };
}

export class StudentStore {
  constructor(db) { this.db = db; }
  ref(uid, group, id) { return doc(this.db, 'users', uid, group, id); }
  async load(uid, id) { const d = await getDocFromServer(this.ref(uid, 'workspaces', id)); return d.exists() ? d.data() : null; }
  async list(uid) {
    const d = await getDocsFromServer(query(collection(this.db, 'users', uid, 'workspaces'), limit(150)));
    return d.docs.map(x => x.data()).sort((a,b) => (b.savedAt?.toMillis() || 0) - (a.savedAt?.toMillis() || 0));
  }
  async revisions(uid, id) {
    const d = await getDocsFromServer(query(collection(this.db, 'users', uid, 'revisions'), where('workspaceId','==',id), limit(10)));
    return d.docs.map(x => x.data()).sort((a,b) => b.version - a.version);
  }
  async mutate(uid, id, kind, input, expectedVersion) {
    if (!validWorkspace(id) || (input?.code?.length || 0) > MAX_CODE) throw Error('실습 번호와 코드 길이를 확인하세요. 최대 20,000자입니다.');
    const workRef = this.ref(uid, 'workspaces', id), quotaRef = this.ref(uid, 'limits', 'state');
    return runTransaction(this.db, async tx => {
      const [current, quota] = await Promise.all([tx.get(workRef), tx.get(quotaRef)]);
      const version = current.data()?.version || 0, previousQuota = quota.data(), now = Date.now();
      if (version !== expectedVersion) throw Object.assign(Error('conflict'), { code: 'conflict' });
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
