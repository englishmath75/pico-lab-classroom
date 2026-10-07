import { test, expect } from '@playwright/test';

test('student lesson isolation, navigation, progress and teacher tools at mobile width', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.route('https://raw.githubusercontent.com/**', r => r.fulfill({status:404,body:'Not published'}));
  await page.goto('/?view=ai-ble');
  const errors:string[]=[]; page.on('pageerror', e=>errors.push(e.message));
  await expect(page.getByText('하드웨어 검증 NOT_RUN', {exact:false})).not.toBeVisible();
  const roadmap=page.locator('#ai-roadmap');
  await roadmap.getByRole('checkbox').first().click();
  await page.reload();
  await expect(roadmap.getByRole('checkbox').first()).toBeChecked();
  for(let n=1;n<=8;n++) {
    await roadmap.getByRole('button',{name:new RegExp(`${n}차시 ·`)}).click();
    await expect(page.locator('#ai-current-lesson')).toContainText(`선택 차시 · ${n}/8`);
    for(const [heading,visible] of [['BLE LIVE LAB',[3,4,5,8].includes(n)],['Sensor Dashboard',[4,5,8].includes(n)],['Colab Code',n===6],['Final Project',n===8]] as const) {
      const element=page.getByRole('heading',{name:new RegExp(heading)});
      if(visible) await expect(element).toBeVisible(); else await expect(element).toBeHidden();
    }
    const expectedFiles:Record<number,string[]>={1:['diagnostics/led.py'],2:['diagnostics/sensor_read.py','firmware/sensors.py'],3:['diagnostics/ble_counter.py','firmware/ble_peripheral.py'],4:['firmware/config.py','firmware/sensors.py','firmware/main.py'],5:['firmware/main.py'],6:[],7:['firmware/model.py','diagnostics/model_selftest.py','firmware/outputs.py'],8:['firmware/main.py','firmware/outputs.py']};
    const code=page.locator('section').filter({has:page.getByRole('heading',{name:'Pico Code',exact:true})});
    if(n!==6) {expect(await code.locator('summary').allTextContents()).toHaveLength(expectedFiles[n].length); for(const file of expectedFiles[n]) await expect(code.locator('summary').filter({hasText:file})).toBeVisible();}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('#ai-current-lesson').screenshot({path:`work/ux-lesson-${n}-390.png`});
  }
  await expect(page.getByRole('button',{name:'다음 차시 →'})).toBeDisabled();
  await page.getByRole('button',{name:'← 이전 차시'}).click();
  await expect(page.locator('#ai-current-lesson')).toContainText('선택 차시 · 7/8');
  await page.getByRole('button',{name:'다음 차시 →'}).click();
  await roadmap.getByRole('button',{name:/4차시 ·/}).click();
  await expect(page.getByRole('button',{name:'Pico 2 W 연결',exact:true})).toBeVisible();
  await expect(page.getByText('-- raw',{exact:false})).toBeVisible();
  await expect(page.getByRole('log')).toBeHidden();
  await page.getByText('상세 데이터 보기',{exact:true}).click();
  await expect(page.getByRole('log')).toBeVisible();
  await page.getByRole('tab',{name:'교사',exact:true}).click();
  await expect(page.getByText('하드웨어 검증 NOT_RUN',{exact:false})).toBeVisible();
  await expect(page.locator('summary').filter({hasText:'diagnostics/model_selftest.py'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Final Project',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});
