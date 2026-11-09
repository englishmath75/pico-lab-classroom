// Build MK first, then run against isolated local emulators:
// firebase emulators:exec --project demo-englishmath-python --only auth,firestore \
//   'node tests/mk-unified-browser.mjs'
// Authentication uses the emulator's real Google popup. Only deployment config
// and vendor asset transport are routed; Firestore responses are never mocked.
import assert from 'node:assert/strict';
import { chromium, expect as playwrightExpect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocFromServer, getDocs, setDoc, Timestamp } from 'firebase/firestore';

const projectId = 'demo-englishmath-python';
const expect = playwrightExpect.configure({ timeout: 20000 });
const SAVE_TIMEOUT = 95000; // Includes the real 60-second autosave policy.
const execFileAsync = promisify(execFile);
const vendorCache = new Map();
const artifacts = resolve(process.env.MK_TEST_ARTIFACTS||'.artifacts/mk-unified');
const dist = resolve('mk-dist');
const evidence = [];
const devices = [];
const people = {
  navigation: { uid: 'mk-unified-navigation', name: '탐색 검증 학생', email: 'mk-navigation@muhak-g-h.gne.go.kr' },
  notebook: { uid: 'mk-unified-notebook', name: '오답 검증 학생', email: 'mk-notebook@muhak-g-h.gne.go.kr' },
  other: { uid: 'mk-unified-other', name: '다른 검증 학생', email: 'mk-other@muhak-g-h.gne.go.kr' },
  race: { uid: 'mk-unified-race', name: '저장 보호 검증 학생', email: 'mk-race@muhak-g-h.gne.go.kr' },
};
for(const key of ['complete','conflict','camera','idle','multiple','membership'])people[key]={uid:'mk-v2-'+key,name:'V2 검증 '+key,email:'mk-v2-'+key+'@muhak-g-h.gne.go.kr'};
people.teacher={uid:'mk-membership-teacher',name:'회원 관리 검증 교사',email:'englishmath@muhak-g-h.gne.go.kr'};
const fixtures = {
  school: '학교에서 작성한 자동 저장 답안',
  future: '2027학년도에만 있는 답안',
  personal: '개인 공간에만 있는 답안',
  other: '다른 학생에게만 있는 답안',
};
const roots = {
  '2026-1': 'cohorts/2026/grade1_users',
  '2027-1': 'cohorts/2027/grade1_users',
  personal: 'public_users',
};

// Refuse nonlocal emulator endpoints, even if the caller's environment is wrong.
for (const name of ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST']) {
  const value = process.env[name];
  if (value && !/^(127\.0\.0\.1|localhost):\d+$/.test(value)) {
    throw Error(`${name} must point to a local emulator`);
  }
}
await mkdir(artifacts, { recursive: true });
const env = await initializeTestEnvironment({
  projectId,
  firestore: { host: '127.0.0.1', port: 8080, rules: await readFile(process.env.MK_RULES_FILE||'firestore.rules', 'utf8') },
});
let server;
let browser;
let origin;
let lastPage;

function profile(person, personal = false) {
  return {
    email: person.email, displayName: person.name, status: 'approved',
    ...(personal ? { userType: 'personal' } : { classId: 'class-1-1' }),
    createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  };
}
function savedNotebook(answer) {
  return {
    workspaceId: 'mk3-notebook', lessonId: 'mk3-notebook', title: '복습 오답 기록',
    code: JSON.stringify({ q01: { answer, status: 'draft' } }),
    runState: 'idle', completed: false, version: 1, savedAt: Timestamp.now(),
  };
}
async function seed() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db,'staff',people.teacher.uid),{classIds:['class-2-1']}),
      setDoc(doc(db, 'config/access'), { allowedDomains: ['muhak-g-h.gne.go.kr'], allowedEmails: [] }),
      ...Object.values(people).map(person => setDoc(doc(db, roots['2026-1'], person.uid), profile(person))),
      setDoc(doc(db, roots['2027-1'], people.notebook.uid), profile(people.notebook)),
      setDoc(doc(db, roots.personal, people.notebook.uid), profile(people.notebook, true)),
      setDoc(doc(db, roots['2027-1'], people.notebook.uid, 'workspaces', 'mk3-notebook'), savedNotebook(fixtures.future)),
      setDoc(doc(db, roots.personal, people.notebook.uid, 'workspaces', 'mk3-notebook'), savedNotebook(fixtures.personal)),
      setDoc(doc(db, roots['2026-1'], people.other.uid, 'workspaces', 'mk3-notebook'), savedNotebook(fixtures.other)),
    ]);
  });
  const cleared = await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${projectId}/accounts`, { method: 'DELETE' });
  if (!cleared.ok) throw Error('Auth emulator fixture reset failed');
  const imported = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:batchCreate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({ users: Object.values(people).map(person => ({
      localId: person.uid, email: person.email, emailVerified: true, displayName: person.name,
      providerUserInfo: [{ providerId: 'google.com', rawId: person.email, email: person.email, displayName: person.name }],
    })) }),
  });
  if (!imported.ok) throw Error('Auth emulator fixture import failed');
}
async function record(uid, space = '2026-1', id = 'mk3-notebook') {
  let result;
  await env.withSecurityRulesDisabled(async context => {
    const snapshot = await getDocFromServer(doc(context.firestore(), roots[space], uid, 'workspaces', id));
    result = snapshot.exists() ? snapshot.data() : null;
  });
  return result;
}
async function answer(uid, question, space = '2026-1') {
  const saved = await record(uid, space);
  return saved ? JSON.parse(saved.code)[question]?.answer ?? null : null;
}
async function scopeData(uid) {
  const result = {};
  await env.withSecurityRulesDisabled(async context => {
    for (const group of ['workspaces', 'revisions', 'progress', 'limits', 'submissions']) {
      const snapshot = await getDocs(collection(context.firestore(), roots['2026-1'], uid, group));
      result[group] = snapshot.docs.map(item => [item.id, item.data()]).sort(([a], [b]) => a.localeCompare(b));
    }
  });
  return JSON.stringify(result);
}
function isCommit(request) {
  const path = new URL(request.url()).pathname;
  return /\/documents:commit$|\/(?:google\.firestore\.v1\.)?Firestore\/Commit(?:\/|$)/.test(path)
    || (/\/(?:google\.firestore\.v1\.)?Firestore\/Write\/channel$/.test(path) && /writes/.test(request.postData() || ''));
}
async function device(path = '/?page=questions', clock = false) {
  const context = await browser.newContext({ locale: 'ko-KR', viewport: { width: 1366, height: 950 } });
  const config = { enabled: true, emulator: true, firebase: {
    apiKey: 'fake-api-key', authDomain: `${projectId}.firebaseapp.com`, projectId, appId: 'mk-unified-test-app',
  } };
  await context.route('**/student-config.json', route => route.fulfill({ json: config }));
  // Same certificate-verifying transport as tests/mk-year-browser.mjs.
  await context.route('https://**/*', async route => {
    const url = new URL(route.request().url());
    if (!['apis.google.com', 'www.gstatic.com'].includes(url.hostname)) return route.abort();
    let body = vendorCache.get(url.href);
    if (!body) {
      body = execFileAsync('curl', [
        '--fail', '--silent', '--show-error', '--location', '--retry', '1', '--max-time', '30', '--url', url.href,
      ], { encoding: 'buffer', maxBuffer: 64000000 }).then(result => result.stdout);
      vendorCache.set(url.href, body);
    }
    await route.fulfill({ body: await body, contentType: 'text/javascript' });
  });
  const page = await context.newPage();
  if(clock)await page.clock.install();
  const writes = [];
  page.on('request', request => { if (isCommit(request)) writes.push(request.url()); });
  page.on('pageerror', error => evidence.push({ pageError: error.message, url: page.url() }));
  devices.push({ context, page, writes });
  lastPage = page;
  await page.goto(origin + path);
  await expect(page.locator('#page-content h1')).toBeVisible();
  return { context, page, writes };
}
async function uid(page) {
  return page.evaluate(async () => (await import('./student-room.js')).room.scope()?.uid ?? null);
}
async function hasUnsaved(page) {
  return page.evaluate(async () => (await import('./student-room.js')).room.hasUnsaved());
}
async function login(page, person) {
  lastPage = page;
  await expect(page.locator('#login')).toBeEnabled();
  const pending = page.waitForEvent('popup');
  await page.locator('#login').click();
  const popup = await pending;
  await popup.waitForLoadState();
  await popup.getByText(person.email, { exact: true }).click();
  await expect(page.locator('#identity')).toContainText(person.email);
  await expect.poll(() => uid(page)).toBe(person.uid);
  await expect.poll(() => page.evaluate(async () => Boolean((await import('./student-room.js')).room.canWrite()))).toBe(true);
}
async function commonIdentity(page, person, documentOrigin) {
  await expect(page.locator('#identity')).toContainText(person.email);
  await expect(page.locator('#logout')).toBeVisible();
  await expect(page.locator('#finish')).toBeVisible();
  await expect(page.locator('#library-tab')).toBeVisible();
  assert.equal(await uid(page), person.uid);
  if (documentOrigin !== undefined) assert.equal(await page.evaluate(() => performance.timeOrigin), documentOrigin, 'Internal navigation restarted the document');
}
async function openAvatar(page) {
  await page.locator('.top-avatar-link').click();
  await expect(page.locator('#page-content h1')).toHaveText('AI 표정 아바타 실험실');
  await expect(page.locator('#avatar-view-status')).toContainText('체험 준비 완료');
  await expect(page.locator('#avatar-experience-frame')).toHaveCount(1);
  return page.frameLocator('#avatar-experience-frame');
}
async function switchSpace(page, space) {
  if (!await page.locator('#learning-space').isVisible()) await page.locator('#space-details > summary').click();
  await page.locator('#learning-space').selectOption(space);
  await expect(page.locator('#learning-space')).toHaveValue(space);
}
async function notebookReady(page) {
  await expect(page.getByLabel('q01 답', { exact: true })).toBeVisible();
  await expect(page.locator('#notebook-status')).toContainText(/불러왔|저장된.*없|자동 저장|클라우드 저장 완료/);
}
async function scenario(name, work) {
  if (process.env.MK_TEST_SCENARIO && !name.includes(process.env.MK_TEST_SCENARIO)) return;
  const began = Date.now();
  try {
    await work();
    evidence.push({ scenario: name, status: 'pass', durationMs: Date.now() - began });
    console.log('PASS', name);
  } catch (error) {
    evidence.push({ scenario: name, status: 'fail', durationMs: Date.now() - began, error: error.message });
    throw error;
  }
}
function deferred() {
  let resolvePromise;
  const promise = new Promise(resolveValue => { resolvePromise = resolveValue; });
  return { promise, resolve: resolvePromise };
}
async function bounded(promise, ms, message) {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error(message)), ms); })]); }
  finally { clearTimeout(timer); }
}

try {
  await seed();
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.wasm': 'application/wasm', '.py': 'text/plain' };
  server = createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/') pathname = '/index.html';
      const file = resolve(dist, '.' + pathname);
      if (!file.startsWith(dist + sep)) throw Error('Invalid path');
      const data = await readFile(file);
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
      response.end(data);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolveReady => server.listen(0, '127.0.0.1', resolveReady));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  await scenario('multiple: independent named codes, restoration, offline and capacity protection',async()=>{
    const {page,context}=await device('/?page=practice');await login(page,people.multiple);
    await expect(page.locator('#new-code')).toBeEnabled();
    await page.locator('#title').fill('첫 번째 코드');await page.locator('#editor').fill('print("first")');await page.locator('#save').click();
    await expect(page.locator('#save-state')).toContainText('클라우드 저장 완료');
    const create=async(button,title)=>{
      await page.locator(button).click();await page.locator('#new-code-title').fill(title);
      await page.locator('#code-name-form button[type=submit]').click();
      await expect(page.locator('#notice')).toContainText('별도 코드로 저장했습니다',{timeout:45000});
      await expect(page.locator('#title')).toHaveValue(title);await expect(page.locator('#new-code')).toBeEnabled();
    };
    await create('#save-as','두 번째 코드');await expect(page.locator('#workspace')).toHaveValue('scratch-02');
    await page.locator('#editor').fill('print("second")');await page.locator('#save').click();
    await expect(page.locator('#save-state')).toContainText('클라우드 저장 완료',{timeout:45000});
    await create('#save-as','두 번째 코드');await expect(page.locator('#workspace')).toHaveValue('scratch-03');
    await page.locator('#editor').fill('print("third")');await page.locator('#save').click();
    await expect(page.locator('#save-state')).toContainText('클라우드 저장 완료',{timeout:45000});
    for(const [id,code] of [['01','first'],['02','second'],['03','third']])assert.equal((await record(people.multiple.uid,'2026-1','scratch-'+id)).code,`print("${code}")`);
    await page.locator('#library-tab').click();await expect(page.locator('#library-list .entry')).toHaveCount(3);
    await page.screenshot({path:resolve(artifacts,'multiple-codes-library.png')});
    await page.locator('#finish').click();await expect(page.locator('#identity')).toHaveText('로그인하지 않음');
    await expect(page.locator('#workspace')).not.toContainText('첫 번째 코드');
    const restored=await device('/?page=practice');await login(restored.page,people.multiple);
    await expect(restored.page.locator('#editor')).toHaveValue('print("first")');
    await restored.page.locator('#workspace').selectOption('scratch-03');await expect(restored.page.locator('#editor')).toHaveValue('print("third")');
    await restored.page.locator('#workspace').selectOption('scratch-02');await expect(restored.page.locator('#editor')).toHaveValue('print("second")');
    await restored.page.setViewportSize({width:390,height:844});
    await restored.page.locator('#new-code').click();await expect(restored.page.locator('#code-name-dialog')).toBeVisible();
    assert.equal(await restored.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await restored.page.screenshot({path:resolve(artifacts,'multiple-codes-mobile.png')});
    await restored.page.locator('#code-name-cancel').click();
    await restored.context.setOffline(true);await restored.page.locator('#save-as').click();
    await restored.page.locator('#code-name-form button[type=submit]').click();
    await expect(restored.page.locator('#notice')).toHaveClass(/error/);await expect(restored.page.locator('#editor')).toHaveValue('print("second")');
    await restored.context.setOffline(false);
    await env.withSecurityRulesDisabled(async ctx=>{
      for(let n=4;n<=10;n++){const id=`scratch-${String(n).padStart(2,'0')}`;await setDoc(doc(ctx.firestore(),roots['2026-1'],people.multiple.uid,'workspaces',id),{workspaceId:id,lessonId:id,title:'보존 '+n,code:'print('+n+')',completed:false,runState:'idle',version:1,savedAt:Timestamp.now()});}
    });
    const before=await scopeData(people.multiple.uid);
    await restored.page.locator('#new-code').click();await restored.page.locator('#code-name-form button[type=submit]').click();
    await expect(restored.page.locator('#notice')).toContainText('10개 모두 사용 중');
    await expect(restored.page.locator('#editor')).toHaveValue('print("second")');
    assert.equal(await scopeData(people.multiple.uid),before);
    await restored.page.screenshot({path:resolve(artifacts,'multiple-codes-full.png')});
    await context.close();await restored.context.close();
  });

  await scenario('common login across main navigation, avatar lifecycle, and legacy avatar address', async () => {
    const { page, writes } = await device('/?page=home');
    await login(page, people.navigation);
    const timeOrigin = await page.evaluate(() => performance.timeOrigin);
    await expect(page.locator('#sidebar nav > a[data-route]')).toHaveCount(6);
    for (const href of [
      './?page=review&section=basics', './?page=home', './?page=lessons',
      './?page=resources', './?page=questions', './?page=report',
    ]) {
      await page.locator(`#sidebar nav > a[href="${href}"]`).click();
      await expect(page).toHaveURL(new URL(href, origin + '/').href);
      await expect(page.locator('#page-content h1')).toBeVisible();
      await expect.poll(() => page.evaluate(async () => (await import('./student-room.js')).room.isLoading())).toBe(false);
      await commonIdentity(page, people.navigation, timeOrigin);
    }
    await page.locator('.top-python-link').click();
    await expect(page.locator('#practice-panel')).toBeVisible();
    await page.locator('#library-tab').click();
    await expect(page.locator('#library-panel')).toBeVisible();
    await page.locator('[data-close="library-panel"]').click();
    const before = await scopeData(people.navigation.uid);
    const writeCount = writes.length;
    const frame = await openAvatar(page);
    await commonIdentity(page, people.navigation, timeOrigin);
    await expect(page.locator('#save')).toBeHidden();
    await expect(frame.getByRole('button', { name: /클라우드|저장|불러오기/ })).toHaveCount(0);
    await expect(frame.locator('#start-camera')).toBeEnabled();
    await expect(frame.locator('#stop-camera')).toBeDisabled();
    assert.equal(await frame.locator('#camera').evaluate(video => video.srcObject === null), true);
    await frame.locator('#code').fill('print("temporary avatar only")');
    await frame.locator('#smile').focus();
    await frame.locator('#smile').press('End');
    await page.locator('#sidebar nav > a[href="./?page=home"]').click();
    await expect(page.locator('#avatar-experience-frame')).toHaveCount(0);
    await commonIdentity(page, people.navigation, timeOrigin);
    const freshFrame = await openAvatar(page);
    await expect(freshFrame.locator('#code')).not.toHaveValue('print("temporary avatar only")');
    assert.equal(await freshFrame.locator('#camera').evaluate(video => video.srcObject === null), true);
    assert.equal(await scopeData(people.navigation.uid), before, 'Avatar changed Firestore records');
    assert.equal(writes.length, writeCount, 'Avatar attempted a Firestore write');
    await page.locator('#logout').click();
    await expect(page.locator('#identity')).toHaveText('로그인하지 않음');
    await expect(page.locator('#avatar-experience-frame')).toHaveCount(0);
    assert.equal(await scopeData(people.navigation.uid), before);

    const legacy = await device('/ai-avatar.html');
    await expect(legacy.page.locator('#page-content h1')).toHaveText('AI 표정 아바타 실험실');
    // The first anonymous auth observation must not tear down a freshly
    // mounted public avatar experience before the student chooses to log in.
    await expect(legacy.page.locator('#notice')).toContainText('로그인 없이 실행할 수 있습니다.');
    await expect(legacy.page.locator('#avatar-view-status')).toContainText('체험 준비 완료');
    await expect(legacy.page.locator('#avatar-experience-frame')).toHaveCount(1);
    await login(legacy.page, people.navigation);
    await commonIdentity(legacy.page, people.navigation);
    await expect(legacy.page.locator('#page-content h1')).toHaveText('AI 표정 아바타 실험실');
  });

  let school;
  let home;
  await scenario('notebook autosaves without buttons and restores in an independent home browser', async () => {
    school = await device();
    await login(school.page, people.notebook);
    await notebookReady(school.page);
    await school.page.getByLabel('q01 답', { exact: true }).fill(fixtures.school);
    await school.page.locator('[data-check="q01"]').click();
    await expect.poll(() => answer(people.notebook.uid, 'q01'), { timeout: SAVE_TIMEOUT }).toBe(fixtures.school);
    await expect(school.page.locator('#notebook-status')).toContainText('클라우드 저장 완료');
    const saved = await record(people.notebook.uid);
    assert.equal(JSON.parse(saved.code).q01.status, 'wrong');
    assert.equal(saved.version, 1);
    home = await device();
    assert.notEqual(home.context, school.context);
    await login(home.page, people.notebook);
    await expect(home.page.getByLabel('q01 답', { exact: true })).toHaveValue(fixtures.school);
    await expect(home.page.locator('[data-question="q01"] .feedback')).toContainText('다시');
    assert.equal(await hasUnsaved(home.page), false);
    // Neither #notebook-save nor #notebook-load is clicked in this suite.
  });

  await scenario('notebook separates academic years, personal space, and the next shared-PC student', async () => {
    const page = home.page;
    lastPage = page;
    const schoolRecord = JSON.stringify(await record(people.notebook.uid));
    await switchSpace(page, '2027-1');
    await expect(page.getByLabel('q01 답', { exact: true })).toHaveValue(fixtures.future);
    await switchSpace(page, 'personal');
    await expect(page.getByLabel('q01 답', { exact: true })).toHaveValue(fixtures.personal);
    await switchSpace(page, '2026-1');
    await expect(page.getByLabel('q01 답', { exact: true })).toHaveValue(fixtures.school);
    await page.locator('#finish').click();
    await expect(page.locator('#identity')).toHaveText('로그인하지 않음');
    await expect(page.getByLabel('q01 답', { exact: true })).toHaveValue('');
    await login(page, people.other);
    await expect(page.getByLabel('q01 답', { exact: true })).toHaveValue(fixtures.other);
    assert.equal(JSON.stringify(await record(people.notebook.uid)), schoolRecord);
    assert.equal(await answer(people.notebook.uid, 'q01', '2027-1'), fixtures.future);
    assert.equal(await answer(people.notebook.uid, 'q01', 'personal'), fixtures.personal);
    assert.equal(await answer(people.other.uid, 'q01'), fixtures.other);
  });

  await scenario('edits during a real save survive, and offline finish protects unsaved work', async () => {
    const { page, context } = await device();
    await login(page, people.race);
    await notebookReady(page);
    const seen = deferred();
    const release = deferred();
    let held = false;
    const routePattern = 'http://127.0.0.1:8080/**';
    const holdFirstCommit = async route => {
      const request = route.request();
      if (!held && isCommit(request) && (request.postData() || '').includes('mk3-notebook')) {
        held = true;
        seen.resolve();
        // Pause only transport, then send the original request to the real
        // emulator. The transaction, rules, payload and response stay intact.
        await release.promise;
      }
      await route.continue();
    };
    await context.route(routePattern, holdFirstCommit);
    try {
      await page.getByLabel('q01 답', { exact: true }).fill('먼저 저장하는 답안');
      await bounded(seen.promise, SAVE_TIMEOUT, 'No real notebook commit reached the emulator');
      await page.getByLabel('q01 답', { exact: true }).fill('저장 도중 추가로 고친 답안');
      release.resolve();
      await expect.poll(() => answer(people.race.uid, 'q01')).toBe('먼저 저장하는 답안');
      await expect(page.getByLabel('q01 답', { exact: true })).toHaveValue('저장 도중 추가로 고친 답안');
      await expect.poll(() => hasUnsaved(page)).toBe(true);
      await expect.poll(() => answer(people.race.uid, 'q01'), { timeout: SAVE_TIMEOUT }).toBe('저장 도중 추가로 고친 답안');
      await expect.poll(() => hasUnsaved(page)).toBe(false);
      assert.equal((await record(people.race.uid)).version, 2);
    } finally {
      release.resolve();
      await context.unroute(routePattern, holdFirstCommit);
    }

    await context.setOffline(true);
    await page.getByLabel('q02 답', { exact: true }).fill('연결이 끊겨도 지키는 답안');
    await page.locator('#finish').click();
    await expect(page.locator('#confirm-dialog')).toBeVisible();
    await expect(page.locator('#identity')).toContainText(people.race.email);
    await expect(page.getByLabel('q02 답', { exact: true })).toHaveValue('연결이 끊겨도 지키는 답안');
    assert.equal(await answer(people.race.uid, 'q02'), null);
    await page.locator('#dialog-no').click();
    await expect(page.locator('#confirm-dialog')).not.toBeVisible();
    assert.equal(await uid(page), people.race.uid);
    assert.equal(await hasUnsaved(page), true);
    await expect(page.locator('#notebook-status')).not.toContainText('클라우드 저장 완료');

    await context.setOffline(false);
    await expect.poll(() => answer(people.race.uid, 'q02'), { timeout: SAVE_TIMEOUT }).toBe('연결이 끊겨도 지키는 답안');
    await expect.poll(() => hasUnsaved(page)).toBe(false);
    await page.locator('#finish').click();
    await expect(page.locator('#identity')).toHaveText('로그인하지 않음');
    await expect(page.getByLabel('q01 답', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('q02 답', { exact: true })).toHaveValue('');
    const recovered = await device();
    await login(recovered.page, people.race);
    await expect(recovered.page.getByLabel('q01 답', { exact: true })).toHaveValue('저장 도중 추가로 고친 답안');
    await expect(recovered.page.getByLabel('q02 답', { exact: true })).toHaveValue('연결이 끊겨도 지키는 답안');
  });

  await scenario('extended: code/report/notebook drafts survive rapid navigation and restore in another context', async()=>{
    const {page}=await device('/?page=home');await login(page,people.complete);
    await page.locator('.top-python-link').click();
    await page.locator('#workspace').selectOption('mk3-list-edit');
    await expect(page.locator('#editor')).toBeEditable();
    const codeA='print("MK V2 code A")',codeB='print("MK V2 code B")';
    await page.locator('#editor').fill(codeA);await page.locator('#title').fill('V2 코드 A');
    await page.locator('#workspace').selectOption('mk3-list-slices');
    await expect(page.locator('#editor')).toBeEditable();await page.locator('#editor').fill(codeB);
    await page.locator('#sidebar nav > a[href="./?page=report"]').click();
    const reportValues={};
    for(const key of ['topic','prediction','conditions','before','after','result','reason','next']){reportValues[key]='V2 보고서 '+key;await page.locator(`[data-report="${key}"]`).fill(reportValues[key]);}
    await page.locator('#sidebar nav > a[href="./?page=questions"]').click();await notebookReady(page);
    await page.getByLabel('q01 답',{exact:true}).fill('채점 전 초안');
    await page.getByLabel('q02 답',{exact:true}).fill('오답 표식');await page.locator('[data-check="q02"]').click();
    await openAvatar(page);await page.locator('.top-python-link').click();
    await page.locator('#workspace').selectOption('mk3-list-edit');await expect(page.locator('#editor')).toHaveValue(codeA);
    // No save button: the real timer and shared sixteen-second queue do the work.
    await expect.poll(async()=> (await record(people.complete.uid,'2026-1','mk3-list-edit'))?.code,{timeout:180000}).toBe(codeA);
    await expect.poll(async()=> (await record(people.complete.uid,'2026-1','mk3-list-slices'))?.code,{timeout:90000}).toBe(codeB);
    await expect.poll(async()=> (await record(people.complete.uid,'2026-1','mk3-report'))?.code,{timeout:90000}).toBe(JSON.stringify(reportValues,null,2));
    await expect.poll(()=>answer(people.complete.uid,'q01'),{timeout:90000}).toBe('채점 전 초안');
    const book=JSON.parse((await record(people.complete.uid)).code);assert.equal(book.q01.status,'draft');assert.equal(book.q02.status,'wrong');
    const beforeSubmit=JSON.parse(await scopeData(people.complete.uid));assert.deepEqual(beforeSubmit.submissions,[]);
    const times=beforeSubmit.workspaces.map(([,r])=>r.savedAt.seconds*1000+r.savedAt.nanoseconds/1000000).sort((a,b)=>a-b);for(let i=1;i<times.length;i++)assert.ok(times[i]-times[i-1]>=16000);
    await page.screenshot({path:resolve(artifacts,'saved-code.png')});
    await page.locator('#finish').click();await expect(page.locator('#identity')).toHaveText('로그인하지 않음');
    const other=await device('/?page=home');await login(other.page,people.complete);
    await other.page.locator('.top-python-link').click();await other.page.locator('#workspace').selectOption('mk3-list-edit');await expect(other.page.locator('#editor')).toHaveValue(codeA);
    await other.page.locator('#library-tab').click();
    const reportRow=other.page.locator('#library-list .entry').filter({hasText:'탐구 보고서'});await reportRow.getByRole('button',{name:'열기',exact:true}).click();
    for(const [key,value] of Object.entries(reportValues))await expect(other.page.locator(`[data-report="${key}"]`)).toHaveValue(value);
    await expect(other.page.locator('#code-workbench')).toBeHidden();
    await other.page.screenshot({path:resolve(artifacts,'restored-report.png')});
    await other.page.locator('#sidebar nav > a[href="./?page=questions"]').click();await expect(other.page.getByLabel('q01 답',{exact:true})).toHaveValue('채점 전 초안');
    await other.page.locator('#notebook-history').click();await expect(other.page.locator('#notebook-history-list')).toContainText('1번째 저장');
    await other.page.locator('#notebook-history-list button').click();const downloaded=other.page.waitForEvent('download');await other.page.locator('#dialog-yes').click();await downloaded;
    await other.page.screenshot({path:resolve(artifacts,'restored-notebook.png')});
    await other.page.locator('#finish').click();await login(other.page,people.other);await expect(other.page.getByLabel('q01 답',{exact:true})).toHaveValue(fixtures.other);
    await other.page.goBack();await expect(other.page.locator('#identity')).toContainText(people.other.email);
  });

  await scenario('extended: conflicts preserve local code and same-question answers',async()=>{
    const first=await device('/?page=practice&workspace=mk3-list-search');await login(first.page,people.conflict);
    const second=await device('/?page=practice&workspace=mk3-list-search');await login(second.page,people.conflict);
    await first.page.locator('#editor').fill('print("device A")');await second.page.locator('#editor').fill('print("device B")');
    await first.page.locator('#save').click();await expect(first.page.locator('#save-state')).toContainText('클라우드 저장 완료');
    await second.page.locator('#save').click();await expect(second.page.locator('#save-state')).toContainText('다른 기기');await expect(second.page.locator('#editor')).toHaveValue('print("device B")');
    assert.equal((await record(people.conflict.uid,'2026-1','mk3-list-search')).code,'print("device A")');
    await second.page.locator('#cloud-reload').click();const download=second.page.waitForEvent('download');await second.page.locator('#dialog-yes').click();await download;await expect(second.page.locator('#editor')).toHaveValue('print("device A")');
    for(const {page} of [first,second]){await page.locator('#sidebar nav > a[href="./?page=questions"]').click();await notebookReady(page);}
    await first.page.getByLabel('q01 답',{exact:true}).fill('A의 답');await second.page.getByLabel('q01 답',{exact:true}).fill('B의 답');
    await first.page.locator('#notebook-save').click();await expect(first.page.locator('#notebook-status')).toContainText('클라우드 저장 완료',{timeout:30000});
    await second.page.locator('#notebook-save').click();await expect(second.page.locator('#notebook-status')).toContainText('다른 기기');await expect(second.page.getByLabel('q01 답',{exact:true})).toHaveValue('B의 답');
    assert.equal(await answer(people.conflict.uid,'q01'),'A의 답');
    await second.page.screenshot({path:resolve(artifacts,'conflict.png')});
  });

  await scenario('extended: manual camera start and disposal use a mock MediaStream without writes',async()=>{
    const {page,context,writes}=await device('/?page=home');await login(page,people.camera);
    await context.addInitScript(()=>{if(!location.pathname.endsWith('ai-avatar-experience.html'))return;
      navigator.mediaDevices.getUserMedia=async()=>{parent.__cameraStarts=(parent.__cameraStarts||0)+1;const c=document.createElement('canvas');c.width=640;c.height=480;c.getContext('2d').fillRect(0,0,640,480);const stream=c.captureStream(25);for(const track of stream.getTracks()){const stop=track.stop.bind(track);track.stop=()=>{parent.__cameraStops=(parent.__cameraStops||0)+1;stop();};}return stream;};
    });
    await context.route('**/avatar-vendor/vision_bundle.mjs',route=>route.fulfill({contentType:'text/javascript',body:'export const FilesetResolver={forVisionTasks:async()=>({})}; export const FaceLandmarker={createFromOptions:async()=>({detectForVideo:()=>({faceBlendshapes:[],faceLandmarks:[]}),close:()=>{parent.__modelClosed=(parent.__modelClosed||0)+1;}})};'}));
    const before=await scopeData(people.camera.uid),writeCount=writes.length;
    const frame=await openAvatar(page);assert.equal(await page.evaluate(()=>window.__cameraStarts||0),0);
    await frame.locator('#start-camera').click();await expect(frame.locator('#camera-status')).toContainText('카메라 연결 완료');
    assert.equal(await page.evaluate(()=>window.__cameraStarts),1);
    await page.locator('#sidebar nav > a[href="./?page=home"]').click();await expect(page.locator('#avatar-experience-frame')).toHaveCount(0);
    assert.equal(await page.evaluate(()=>window.__cameraStops),1);assert.equal(await page.evaluate(()=>window.__modelClosed),1);
    await openAvatar(page);assert.equal(await page.evaluate(()=>window.__cameraStarts),1);
    assert.equal(await scopeData(people.camera.uid),before);assert.equal(writes.length,writeCount);
  });

  await scenario('extended: guest draft export and hard idle logout protect a shared PC',async()=>{
    const {page,context}=await device('/?page=practice&workspace=mk3-list-search',true);await page.locator('#editor').fill('guest draft');
    await page.locator('#login').click();await expect(page.locator('#confirm-dialog')).toBeVisible();await page.locator('#dialog-no').click();await expect(page.locator('#editor')).toHaveValue('guest draft');
    const download=page.waitForEvent('download');const popupPromise=page.waitForEvent('popup');await page.locator('#login').click();await page.locator('#dialog-yes').click();await download;const popup=await popupPromise;await popup.getByText(people.idle.email,{exact:true}).click();await expect.poll(()=>uid(page)).toBe(people.idle.uid);
    await expect.poll(()=>page.locator('#editor').isEditable()).toBe(true);
    await page.locator('#editor').fill('never saved offline');await context.setOffline(true);
    await page.clock.fastForward(14*60000+11000);await expect(page.locator('body')).toHaveClass(/idle-private/);
    await page.clock.fastForward(61000);await page.clock.fastForward(6000);await expect(page.locator('#identity')).toHaveText('로그인하지 않음');
    await expect(page.locator('#notice')).toContainText('저장되지 않았습니다');await expect(page.locator('#editor')).not.toHaveValue('never saved offline');
    assert.equal(await record(people.idle.uid,'2026-1','mk3-list-search'),null);
    await page.screenshot({path:resolve(artifacts,'idle-logout.png')});await context.setOffline(false);
  });

  await scenario('membership: request review cancellation reapply and independent restoration',async()=>{
    const student=await device('/?page=practice'),teacher=await device('/?page=home');
    const p=student.page,t=teacher.page,person=people.membership;
    await login(p,person);await p.locator('#editor').fill('print("회원 변경 후에도 보존")');await p.locator('#save').click();await expect(p.locator('#save-state')).toContainText('클라우드 저장 완료');
    const savedBefore=await scopeData(person.uid);
    await p.locator('#member-info').click();await p.locator('#membership-name').fill('수정된 검증 학생');await p.locator('#membership-class').selectOption('class-1-2');await p.locator('#membership-request').click();
    await expect(p.locator('#membership-result')).toContainText('정보 변경 요청: 수정된 검증 학생');
    await expect(p.locator('#membership-current')).toContainText('1학년 1반');
    await login(t,people.teacher);await t.locator('#teacher-tab').click();
    let row=t.locator('#student-list tr').filter({hasText:person.email});
    await expect(row).toContainText('정보 변경 요청:');await row.getByRole('button',{name:'정보 변경 반려',exact:true}).click();await t.locator('#membership-note').fill('이름을 다시 확인해 주세요.');await t.locator('#membership-note-form button[type=submit]').click();
    await expect(row).not.toContainText('정보 변경 요청:');await p.locator('#membership-refresh').click();await expect(p.locator('#membership-result')).toContainText('이름을 다시 확인해 주세요.');
    await p.locator('#membership-name').fill('수정된 검증 학생');await p.locator('#membership-class').selectOption('class-1-2');await p.locator('#membership-request').click();await expect(p.locator('#membership-result')).toContainText('정보 변경 요청:');
    await t.locator('#refresh-students').click();await expect(row).toContainText('정보 변경 요청:');await row.getByRole('button',{name:'정보 변경 승인',exact:true}).click();await t.locator('#dialog-yes').click();await expect(row).toHaveCount(0);
    await t.locator('#teacher-class').selectOption('2026:class-1-2');row=t.locator('#student-list tr').filter({hasText:person.email});await expect(row).toContainText('수정된 검증 학생');
    await p.locator('#membership-refresh').click();await expect(p.locator('#membership-current')).toContainText('1학년 2반');assert.equal(await scopeData(person.uid),savedBefore);
    await row.getByRole('button',{name:'이용 중지',exact:true}).click();await t.locator('#dialog-yes').click();await expect(row.getByRole('button',{name:'이용 중지 해제',exact:true})).toBeVisible();await row.getByRole('button',{name:'이용 중지 해제',exact:true}).click();await t.locator('#dialog-yes').click();await expect(row).toContainText('승인됨');
    await row.getByRole('button',{name:'등록 취소',exact:true}).click();await t.locator('#dialog-yes').click();await expect(row).toHaveCount(0);await t.locator('#show-cancelled').check();await expect(row).toContainText('등록 취소');
    await p.locator('#membership-refresh').click();await expect(p.locator('#notice')).toContainText('등록이 취소');await p.locator('#registration-name').fill('재신청 검증 학생');await p.locator('#class-select').selectOption('class-1-2');await p.locator('#register').click();await expect(p.locator('#notice')).toContainText('승인 대기');
    await t.locator('#refresh-students').click();await expect(row).toContainText('재신청 검증 학생');await row.getByRole('button',{name:'승인',exact:true}).click();await t.locator('#dialog-yes').click();await expect(row).toContainText('승인됨');
    await row.getByRole('button',{name:'회원 처리 이력',exact:true}).click();await expect(t.locator('#student-details')).toContainText('학급 재신청');await expect(t.locator('#student-details')).toContainText('정보 변경 반려');
    await t.screenshot({path:resolve(artifacts,'membership-teacher-history.png')});
    const independent=await device('/?page=practice');await login(independent.page,person);await expect(independent.page.locator('#editor')).toHaveValue('print("회원 변경 후에도 보존")');
    await independent.page.setViewportSize({width:390,height:844});await independent.page.locator('#member-info').click();await expect(independent.page.locator('#membership-current')).toContainText('재신청 검증 학생');
    assert.equal(await independent.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    await independent.page.screenshot({path:resolve(artifacts,'membership-student-mobile.png')});
    assert.equal(await scopeData(person.uid),savedBefore);
  });

  const pageErrors = evidence.filter(item => item.pageError);
  assert.deepEqual(pageErrors, [], 'Browser reported unhandled application errors');
  console.log('PASS',evidence.filter(x=>x.status==='pass').length,'MK scenarios (local Firebase emulators only)');
} catch (error) {
  await lastPage?.screenshot({ path: resolve(artifacts, 'failure.png'), fullPage: false }).catch(() => {});
  throw error;
} finally {
  await writeFile(resolve(artifacts, 'results.json'), JSON.stringify({ projectId, environment: 'localhost Firebase auth/firestore emulators', evidence }, null, 2));
  await browser?.close();
  if (server?.listening) await new Promise(resolveClosed => server.close(resolveClosed));
  await env.cleanup();
}

