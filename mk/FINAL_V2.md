# MK final integration V2

This continues production `4b478cc0a8a50032e511cfc66c7ef399a2746431` on `work/mk-unified-login-20261106`. No merge into common `main`: that would trigger the separate SW publisher. The existing `englishmath-python-mk` Vercel project builds only this branch, using Node 24.x, `npm ci`, `npm run build:mk`, and output `mk-dist`. Pin both `gitSource.ref` to this branch and `gitSource.sha` to the reviewed commit. Preview first; production is an explicit deployment of the same commit. Never modify `englishmath75/sw` for this release.

## Reproduce

```sh
npm ci
npm run build:mk
python3 tests/mk-v3-content.py
python3 tests/mk-question-audit.py
node --test tests/mk-learning-draft.test.mjs tests/mk-persistence.test.mjs tests/mk-list-answer.test.mjs tests/mk-reverse-compare.test.mjs
npx firebase emulators:exec --project demo-englishmath-python --only firestore 'node --test --test-concurrency=1 tests/student-security.test.mjs tests/grade1-isolation.test.mjs'
npx firebase emulators:exec --project demo-englishmath-python --only auth,firestore 'node tests/mk-unified-browser.mjs'
node tests/mk-v3-browser.mjs
```

Use Java 21 and Playwright Chromium (`npx playwright install --with-deps chromium`) for repeatable CI. Emulator project `demo-englishmath-python` is deliberately different from production. Optional `MK_TEST_SCENARIO` selects a scenario substring and `MK_TEST_ARTIFACTS` changes its evidence directory. A full run does not need these variables. Test fixture resets must never target production. Live Google login, real hardware camera use and real deployment verification are separate from these tests.

## Structure and compatibility

- `src/routes.js`: main/auxiliary routes, legacy HTML bookmarks, record kinds. Internal navigation never reloads the document.
- `src/learning-draft.js`: per-record memory draft with owner generation, load precondition, optimistic version and edit revision. `student-room.js` coordinates UID/space, code/report drafts, exports and hard idle logout.
- `src/notebook-draft.js`: JSON-in-`code` format is unchanged. Draft/checked/self-assessed answers save automatically. Same-question conflicts require an explicit choice; disjoint question edits can merge. History restoration is explicit and versioned.
- `src/write-queue.js`: one serialized queue per UID/store root. Preserve 60-second autosave, 16-second mutation interval, 150/day, 20,000 characters, 10 revision slots. Server confirmation is required for saved status. A timed-out request cannot be overtaken by a later request.
- `src/avatar-view.js`: common session/menu wrapper only. Avatar has no record/save adapter. `ai-avatar.js` disposes tracks, animation, inference model and Python work on exit. Trusted human activity can refresh idle time; model frames cannot.
- Existing `mk/content` and activity IDs are unchanged. CodeUp identifiers, `mk3-notebook`, `mk3-report`, legacy lesson/inquiry/scratch IDs and Firebase paths are preserved. `cohorts/{year}/grade{grade}_users/{uid}` and `public_users/{uid}` remain their original roots. Legacy personal scratch IDs shared with the prior system are intentionally not silently migrated.
- Auth and Firestore caches remain in memory. Navigation preserves drafts in the active tab, not persistent PC storage. Reload/close requires login again; only server-saved work is restored. The app's finish button does not sign Google out of the browser.
- Teacher progress and explicit submissions retain existing permissions. Autosave does not submit. Firestore rules are unchanged; production comparison and rule tests must be recorded before release.

## New pages

Register the route and storage classification in `routes.js`. A new authored code activity needs an explicitly approved stable ID, content entry and matching rule validation; never invent IDs on the client. Connect writing pages to the common record/draft owner and shared queue. Read-only pages use `storage: none`. Avatar-like experiences must not attach generic input listeners to the persistence adapters. Keep camera/runtime disposal in the route lifecycle.

## Recovery

The previous production deployment is `dpl_3MJ4aLdBwKsjBvqFxJPYgDmsqNJc` (4b478cc). If needed, promote that existing READY deployment in the same MK project only. No database rollback/migration is needed. Keep the branch guard and inspect `mk-build-info.json` plus the `mk.englishmath.kr` alias after promotion. Rebuilding the old SHA requires its old build command (`npm run build:student && node scripts/build-mk-site.mjs`); promoting the already-built deployment avoids that difference. Never use a common-main merge for recovery.
