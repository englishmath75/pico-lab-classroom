import { chromium, expect as playwrightExpect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

const projectId = 'demo-englishmath-python';
const expect = playwrightExpect.configure({ timeout: 20000 });
const execFileAsync = promisify(execFile);
const vendorCache = new Map();
const students = [
  { uid: 'alice', name: '진급 검증 학생', email: 'alice@muhak-g-h.gne.go.kr' },
  { uid: 'teacher', name: '검증 교사', email: 'englishmath@muhak-g-h.gne.go.kr' },
  { uid: 'visitor', name: '개인 학습 검증', email: 'visitor@gmail.com' }
];
const env = await initializeTestEnvironment({
  projectId,
  firestore: { host: '127.0.0.1', port: 8080, rules: await readFile('firestore.rules', 'utf8') }
});
await env.clearFirestore();
await env.withSecurityRulesDisabled(async context => {
  const db = context.firestore();
  await Promise.all([
    setDoc(doc(db, 'config/access'), { allowedDomains: ['muhak-g-h.gne.go.kr'], allowedEmails: [] }),
    setDoc(doc(db, 'classes/class-2-1'), { title: '2026학년도 2학년 1반', active: true }),
    setDoc(doc(db, 'staff/teacher'), { classIds: ['class-2-1'] }),
    setDoc(doc(db, 'cohorts/2026/grade1_users/alice'), {
      email: students[0].email, displayName: students[0].name, classId: 'class-1-1', status: 'approved',
      createdAt: Timestamp.now(), updatedAt: Timestamp.now()
    })
  ]);
});
await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${projectId}/accounts`, { method: 'DELETE' });
const imported = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:batchCreate`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
  body: JSON.stringify({ users: students.map(student => ({
    localId: student.uid, email: student.email, emailVerified: true, displayName: student.name,
    providerUserInfo: [{ providerId: 'google.com', rawId: student.email, email: student.email, displayName: student.name }]
  })) })
});
if (!imported.ok) throw Error('Auth emulator fixture import failed');

const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.html': 'text/html' };
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname.includes('..')) throw Error('Invalid path');
    const data = await readFile('mk-dist' + pathname);
    response.writeHead(200, { 'Content-Type': types[pathname.slice(pathname.lastIndexOf('.'))] || 'application/octet-stream' });
    response.end(data);
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(4168, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const config = { enabled: true, emulator: true, firebase: {
  apiKey: 'fake-api-key', authDomain: `${projectId}.firebaseapp.com`, projectId, appId: 'mk-test-app'
} };

async function device() {
  const context = await browser.newContext({ locale: 'ko-KR' });
  await context.route('**/student-config.json', route => route.fulfill({ json: config }));
  // Use the same TLS-verifying vendor route as the established student browser test.
  await context.route('https://**/*', async route => {
    const url = new URL(route.request().url());
    if (!['apis.google.com', 'www.gstatic.com'].includes(url.hostname)) return route.abort();
    let body = vendorCache.get(url.href);
    if (!body) {
      body = execFileAsync('curl', ['--fail', '--silent', '--show-error', '--location', '--retry', '1', '--max-time', '30', '--url', url.href], {
        encoding: 'buffer', maxBuffer: 64000000
      }).then(result => result.stdout);
      vendorCache.set(url.href, body);
    }
    await route.fulfill({ body: await body, contentType: 'text/javascript' });
  });
  const page = await context.newPage();
  page.on('pageerror', error => console.error('MK page error:', error.message));
  page.on('requestfailed', request => console.error('MK request failed:', request.url().split('?')[0], request.failure()?.errorText));
  page.on('console', message => { if (message.type() === 'error') console.error('MK console:', message.text()); });
  await page.goto('http://127.0.0.1:4168/student-room.html');
  return page;
}

async function login(page, student) {
  await expect(page.locator('#notice')).not.toContainText('확인하고 있습니다');
  const popupPromise = page.waitForEvent('popup');
  await page.locator('#login').click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  await popup.getByText(student.email, { exact: true }).click();
  try { await expect(page.locator('#identity')).toContainText(student.email); }
  catch (error) {
    console.error('MK login notice:', await page.locator('#notice').textContent());
    throw error;
  }
}

async function save(page, code) {
  await page.locator('#editor').fill(code);
  await page.locator('#save').click();
  await expect(page.locator('#save-state')).toContainText('클라우드 저장 완료');
}

try {
  const student = await device();
  await login(student, students[0]);
  await expect(student.locator('#student-area')).toBeVisible();
  await expect(student.locator('#save-state')).toContainText('새 활동');
  await save(student, 'print("2026 original")');
  await student.locator('#learning-space').selectOption('2027-2');
  await expect(student.locator('#enrollment-heading')).toContainText('2027학년도 2학년');
  await student.locator('#class-select').selectOption('class-2-1');
  await student.locator('#register').click();
  await expect(student.locator('#notice')).toContainText('승인 대기');
  await expect(student.locator('#save')).toBeDisabled();

  const teacher = await device();
  await login(teacher, students[1]);
  await expect(teacher.locator('#teacher-area')).toBeVisible();
  await expect(teacher.locator('#teacher-class')).not.toContainText('2026학년도 2026학년도');
  await teacher.locator('#teacher-class').selectOption('2027:class-2-1');
  await expect(teacher.locator('#roster-summary')).toContainText('승인 대기 1명');
  const row = teacher.locator('#student-list tr').filter({ hasText: students[0].email });
  await row.getByRole('button', { name: '승인', exact: true }).click();
  await teacher.locator('#dialog-yes').click();
  await expect(row.locator('td').nth(1)).toHaveText('승인됨');
  await student.locator('#refresh-approval').click();
  await expect(student.locator('#save-state')).toContainText('새 활동');
  await expect(student.locator('#editor')).toHaveValue('');
  await save(student, 'print("2027 new enrollment")');

  await student.locator('#learning-space').selectOption('2026-1');
  await expect(student.locator('#editor')).toHaveValue('print("2026 original")');
  await student.locator('#learning-space').selectOption('2027-2');
  await expect(student.locator('#editor')).toHaveValue('print("2027 new enrollment")');
  await student.locator('#logout').click();
  await expect(student.locator('#editor')).toHaveValue('');
  await login(student, students[0]);
  await expect(student.locator('#editor')).toHaveValue('print("2026 original")');
  await student.locator('#learning-space').selectOption('2027-2');
  await expect(student.locator('#editor')).toHaveValue('print("2027 new enrollment")');
  console.log('PASS school enrollment, year-specific approval, year switching, logout and restore');

  const visitor = await device();
  await login(visitor, students[2]);
  await expect(visitor.locator('#enrollment')).toBeVisible();
  await visitor.locator('#register-personal').click();
  await expect(visitor.locator('#student-area')).toBeVisible();
  await expect(visitor.locator('#submit')).toBeHidden();
  await save(visitor, 'print("private personal code")');
  await visitor.locator('#learning-space').selectOption('2027-1');
  await expect(visitor.locator('#save')).toBeDisabled();
  await visitor.locator('#learning-space').selectOption('personal');
  await expect(visitor.locator('#editor')).toHaveValue('print("private personal code")');
  await visitor.locator('#logout').click();
  await login(visitor, students[2]);
  await expect(visitor.locator('#editor')).toHaveValue('print("private personal code")');
  console.log('PASS classless personal enrollment, personal/school separation and relogin restore');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  await env.cleanup();
}
