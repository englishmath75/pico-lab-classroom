import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Called by the existing MK browser suite; Firebase is disabled by that suite.
// Real built pages, controls and styles are exercised in both viewport sizes.
export async function verifyListAndAnswers(page,{open,shot}) {
  const questions=JSON.parse(await readFile('mk/content/questions.json','utf8'));
  const routes=['/?page=review&section=basics','/?page=activity&id=mk3-list-edit','/?page=activity&id=mk3-list-slices','/?page=inquiry&id=a','/?page=activity&id=mk3-inquiry-a','/list-tuple-dictionary.html'];
  const click=op=>page.getByRole('button',{name:op,exact:true}).click();
  const equal=async(selector,expected)=>assert.deepEqual(await page.locator(selector+' .list-cell strong').allTextContents(),expected.map(String));
  for(const width of [1366,390]) {
    await page.setViewportSize({width,height:844});
    for(const route of routes) {
      await open(page,route);
      await equal('#list-after',[10,20,30,40,50]);
      await click('a[3]="테스트"');await equal('#list-after',[10,20,30,'테스트',50]);
      await click('append(60)');await equal('#list-before',[10,20,30,'테스트',50]);await equal('#list-after',[10,20,30,'테스트',50,60]);
      assert.equal(await page.locator('#list-after .list-cell--added strong').textContent(),'60');
      assert.match(await page.locator('#list-after .list-cell--added').getAttribute('aria-label'),/인덱스 5/);
      if(route.includes('mk3-list-edit'))await shot(page,'cumulative-append-'+width);
      await click('insert(1,15)');await equal('#list-after',[10,15,20,30,'테스트',50,60]);
      assert.equal(await page.locator('#list-after .list-cell--moved').count(),5);
      await click('remove(20)');await equal('#list-after',[10,15,30,'테스트',50,60]);
      assert.equal(await page.locator('#list-before .list-cell--removed strong').textContent(),'20');
      assert.equal(await page.locator('#list-after .list-cell--moved').count(),4);
      await click('del a[0]');await equal('#list-after',[15,30,'테스트',50,60]);
      for(const [op,expected] of [['a[1:3]',[30,'테스트']],['a[:3]',[15,30,'테스트']],['a[2:]',['테스트',50,60]],['a[::2]',[15,'테스트',60]],['a[::-1]',[60,50,'테스트',30,15]]]) {
        await click(op);await equal('#list-before',[15,30,'테스트',50,60]);await equal('#list-after',expected);
        assert.equal(await page.locator('#list-current').textContent(),'현재 a = [15, 30, "테스트", 50, 60]');
        assert.equal(await page.locator('#list-after .list-cell--selected').count(),expected.length);
      }
      await click('append(60)');await equal('#list-after',[15,30,'테스트',50,60,60]);
      await click('remove(20)');assert.match(await page.locator('#list-operation').textContent(),/ValueError/);await equal('#list-after',[15,30,'테스트',50,60,60]);
      for(let i=0;i<6;i++)await click('del a[0]');
      assert.match(await page.locator('#list-after').textContent(),/빈 리스트/);
      await click('del a[0]');assert.match(await page.locator('#list-operation').textContent(),/IndexError/);
      await click('a[3]="테스트"');assert.match(await page.locator('#list-operation').textContent(),/IndexError/);
      await click('insert(1,15)');await equal('#list-after',[15]);
      await click('처음');await equal('#list-after',[10,20,30,40,50]);
      assert.equal(await page.locator('[data-list-op][aria-pressed=true]').count(),1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    }
    await open(page,'/?page=questions');
    for(const q of questions) {
      const card=page.locator(`[data-question=${q.id}]`);
      await card.locator('input').fill(q.expected);await card.locator('[data-check]').click();
      assert.equal(await card.locator('.answer-detail').getAttribute('open'),'');
      assert.match(await card.locator('.feedback').textContent(),q.mode==='exact'?/맞았습니다/:/직접 확인/);
      if(q.mode==='self') {
        await card.locator('[data-self][data-value=correct]').click();
        assert.match(await page.locator(`[data-question=${q.id}] .feedback`).textContent(),/확인 완료/);
      } else {
        await card.locator('input').fill('incorrect answer');await card.locator('[data-check]').click();
        assert.match(await card.locator('.feedback').textContent(),/다시 생각/);
      }
    }
    for(const [id,answer] of [['q04','dela[0]'],['q06','a[3]="테 스트"'],['q16','b l u e'],['q27','n+ =1'],['q30','score >8 0'],['q31','3 4/7'],['q32','print(f"{3} {4}")']]) {
      await page.getByLabel(id+' 답',{exact:true}).fill(answer);await page.locator(`[data-check=${id}]`).click();
      assert.match(await page.locator(`[data-question=${id}] .feedback`).textContent(),/다시 생각/);
    }
  }
  await page.locator('#retry-questions').click();
  console.log('PASS 12 desktop/mobile list routes and 40 answer controls in both viewports');
}
