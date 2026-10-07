import { test, expect, type Page } from "@playwright/test";
const rawNotebook =
  "https://raw.githubusercontent.com/englishmath75/pico-lab-classroom/main/public/downloads/ai-ble/PICO2W_AI_Classroom.ipynb";
test.beforeEach(async ({ page }) => {
  await page.route(rawNotebook, (route) =>
    route.fulfill({ status: 404, body: "Not published" }),
  );
});
async function mockBle(page: Page, mode = "ok") {
  await page.addInitScript(
    ({ mode }) => {
      const w = window as any;
      w.testBle = { requests: 0, stops: 0, disconnects: 0, listeners: 0 };
      class Characteristic extends EventTarget {
        value?: DataView;
        override addEventListener(name: string, fn: any) {
          super.addEventListener(name, fn);
          if (name === "characteristicvaluechanged") w.testBle.listeners++;
        }
        override removeEventListener(name: string, fn: any) {
          super.removeEventListener(name, fn);
          if (name === "characteristicvaluechanged") w.testBle.listeners--;
        }
        async startNotifications() {
          return this;
        }
        async stopNotifications() {
          w.testBle.stops++;
          return this;
        }
      }
      const tx = new Characteristic();
      const d = new EventTarget() as any;
      d.name = "P2W-TEST";
      d.gatt = {
        connected: false,
        async connect() {
          if (mode === "delay") await new Promise((r) => setTimeout(r, 300));
          this.connected = true;
          return {
            async getPrimaryService() {
              if (mode === "service-error")
                throw new DOMException("service", "NotFoundError");
              return {
                async getCharacteristic() {
                  return tx;
                },
              };
            },
          };
        },
        disconnect() {
          if (this.connected) {
            this.connected = false;
            w.testBle.disconnects++;
            d.dispatchEvent(new Event("gattserverdisconnected"));
          }
        },
      };
      Object.defineProperty(navigator, "bluetooth", {
        configurable: true,
        value: {
          async requestDevice() {
            w.testBle.requests++;
            if (mode === "cancel")
              throw new DOMException("cancel", "NotFoundError");
            return d;
          },
        },
      });
      w.sendPacket = (p: unknown) => {
        const b = new TextEncoder().encode(JSON.stringify(p));
        for (let i = 0; i < Math.ceil(b.length / 16); i++) {
          const f = new Uint8Array([
            0xa1,
            1,
            i,
            Math.ceil(b.length / 16),
            ...b.slice(i * 16, i * 16 + 16),
          ]);
          tx.value = new DataView(f.buffer);
          tx.dispatchEvent(new Event("characteristicvaluechanged"));
        }
      };
      w.dropBle = () => d.gatt.disconnect();
    },
    { mode },
  );
}
const packet = (seq: number) => ({
  v: 1,
  seq,
  uptime_ms: seq * 3000,
  light: 12345,
  temperature: 25,
  humidity: 52,
  state: null,
  model_id: null,
  error: null,
});
test("home entry, direct/reload, back/forward and existing progress survive", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!sessionStorage.seeded) {
      localStorage.setItem(
        "pico-lab-progress",
        JSON.stringify({
          completed: [2],
          simCompleted: [3],
          setupSteps: [1],
          checkedSteps: { 2: [1] },
        }),
      );
      sessionStorage.seeded = "1";
      localStorage.setItem(
        "arduino-lab-progress",
        JSON.stringify({ completed: [1], checkedSteps: { 1: [0] } }),
      );
      localStorage.setItem("arduino-3class-progress", JSON.stringify(["1-0"]));
      localStorage.setItem(
        "arduino-teacher-password",
        "unchanged-password-hash",
      );
    }
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Pico 2 W AI SMART CLASSROOM · 8차시" })
    .click();
  await expect(page).toHaveURL(/view=ai-ble/);
  await expect(
    page.getByRole("heading", { name: "AI SMART CLASSROOM", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "AI SMART CLASSROOM", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "기존 실습실", exact: true }).click();
  await page.goBack();
  await expect(page).toHaveURL(/ai-ble/);
  await page.goForward();
  await expect(page).not.toHaveURL(/ai-ble/);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("pico-lab-progress")!).completed,
    ),
  ).toEqual([2]);
  for (const view of ["arduino", "pwm", "c-basic"]) {
    await page.goto("/?view=" + view);
    await expect(page.locator("body")).not.toContainText("Application error");
    expect(await page.locator("h1").count()).toBeGreaterThan(0);
  }
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("arduino-lab-progress")!).completed,
    ),
  ).toEqual([1]);
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("arduino-3class-progress")!),
    ),
  ).toEqual(["1-0"]);
  expect(
    await page.evaluate(() => localStorage.getItem("arduino-teacher-password")),
  ).toBe("unchanged-password-hash");
});
test("360/768/1440 layout and unsupported browser", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "bluetooth", { value: undefined }),
  );
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?view=ai-ble");
  await page.getByRole("tab", { name: "교사", exact: true }).click();
    await expect(
      page.getByText("이 브라우저에서는 센서 직접 연결을 지원하지 않습니다.", {
        exact: false,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `work/ai-classroom-${width}.png`,
      fullPage: false,
    });
  }
  await page.screenshot({
    path: "work/ai-classroom-desktop.png",
    fullPage: true,
  });
});

test("existing and new code copy; original downloads match display", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          (window as any).copied = text;
        },
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: /복사/ }).first().click();
  expect(await page.evaluate(() => (window as any).copied)).toBeTruthy();
  await page.goto("/?view=pwm");
  await page.getByRole("button", { name: /복사/ }).first().click();
  expect(await page.evaluate(() => (window as any).copied)).toBeTruthy();
  await page.goto("/?view=ai-ble");
  await page.getByRole("tab", { name: "교사", exact: true }).click();
  const panel = page
    .locator("details")
    .filter({
      has: page.locator("summary").filter({ hasText: "firmware/model.py" }),
    });
  await panel.locator("summary").click();
  await panel.getByRole("button", { name: "코드 복사" }).click();
  const content = await page.evaluate(() => (window as any).copied);
  const response = await page.request.get(
    "/downloads/ai-ble/firmware/model.py",
  );
  expect(content.replace(/\r\n/g, "\n")).toBe(
    (await response.text()).replace(/\r\n/g, "\n"),
  );
  expect(content).toContain("UNTRAINED STUB");
});

test("broken progress recovers and only whitelisted progress is persisted", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("pico-ai-ble-progress-v1", "{broken"),
  );
  await page.goto("/?view=ai-ble");
  await expect(page.getByText("0/8차시 완료", { exact: false })).toBeVisible();
  await page.locator("#ai-roadmap").getByRole("checkbox").first().click();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("pico-ai-ble-progress-v1")!),
    ),
  ).toEqual({ version: 1, completedLessons: [1], checks: {} });
});

test("Colab GitHub link appears only after validating the published notebook", async ({
  page,
}) => {
  await page.goto("/?view=ai-ble");
  await page.getByRole("tab", { name: "교사", exact: true }).click();
  await expect(
    page.getByText("GitHub 노트북 미공개 또는 네트워크 확인 불가", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHub 노트북을 Colab에서 실행" }),
  ).toHaveCount(0);
  await page.route(rawNotebook, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ nbformat: 4, cells: [] }),
    }),
  );
  await page.reload();
  await page.getByRole("tab", { name: "교사", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "GitHub 노트북을 Colab에서 실행" }),
  ).toHaveAttribute("href", /colab.research.google.com\/github\/englishmath75/);
});

test("new-input verification records prediction and error separately from training CSV", async ({
  page,
}) => {
  await mockBle(page);
  await page.goto("/?view=ai-ble");
  await page.getByRole("tab", { name: "교사", exact: true }).click();
  await page.getByRole("button", { name: "Pico 2 W 연결", exact: true }).click();
  await page.evaluate((p) => (window as any).sendPacket(p), packet(1));
  await page.selectOption("#validation-label", "GOOD");
  await page.getByRole("button", { name: "다음 실측 1회 기록" }).click();
  await page.evaluate((p) => (window as any).sendPacket(p), {
    ...packet(2),
    state: "GOOD",
    model_id: "dt-123456789abc",
  });
  await expect(
    page.getByText("최종 검증 1/30행", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "다음 실측 1회 기록" }).click();
  await page.evaluate((p) => (window as any).sendPacket(p), {
    ...packet(3),
    light: null,
    temperature: null,
    humidity: null,
    error: "DHT_READ",
  });
  await expect(
    page.getByText("최종 검증 2/30행", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("수집 정지 · 0/3000행", { exact: false }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "최종 검증 CSV 내려받기" }).click();
  expect((await download).suggestedFilename()).toBe("final_validation.csv");
});

test("browser back warns about unexported rows and teacher tab retains collection", async ({
  page,
}) => {
  await mockBle(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Pico 2 W AI SMART CLASSROOM · 8차시" })
    .click();
  await page.locator("#ai-roadmap").getByRole("button", { name: /5차시 ·/ }).click();
  await page.getByRole("button", { name: "Pico 2 W 연결", exact: true }).click();
  await page.evaluate((p) => (window as any).sendPacket(p), packet(1));
  await page.selectOption("#ai-label", "DARK");
  await page.getByRole("button", { name: "새 측정 회차 시작" }).click();
  await page.getByRole("button", { name: "5개 저장", exact: true }).click();
  await page.evaluate((p) => (window as any).sendPacket(p), packet(2));
  await page.getByRole("tab", { name: "교사", exact: true }).click();
  await page.getByRole("tab", { name: "학생", exact: true }).click();
  await page.locator("#ai-roadmap").getByRole("button", { name: /5차시 ·/ }).click();
  await expect(page.getByText("1/3000행", { exact: false })).toBeVisible();
  await page.locator("#ai-roadmap").getByRole("button", {name:/6차시 ·/}).click();
  await page.locator("#ai-roadmap").getByRole("button", {name:/5차시 ·/}).click();
  await expect(page.getByText("1/3000행", {exact:false})).toBeVisible();
  await page.evaluate(() => history.back());
  await expect(
    page.getByRole("dialog", { name: "미저장 데이터" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/view=ai-ble/);
  await page.getByRole("button", { name: "계속 학습" }).click();
  await expect(page.getByText("1/3000행", { exact: false })).toBeVisible();
});
test("new progress load, reset preserves old keys; broken/blocked storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "pico-ai-ble-progress-v1",
      JSON.stringify({
        version: 1,
        completedLessons: [1, 2],
        checks: { "final-1": true },
      }),
    );
    localStorage.setItem("arduino-3class-progress", "sentinel");
  });
  await page.goto("/?view=ai-ble");
  await expect(page.getByText("2/8차시 완료", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "새 과정 진도 초기화" }).click();
  await expect(page.getByText("0/8차시 완료", { exact: false })).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("arduino-3class-progress")),
  ).toBe("sentinel");
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    }),
  );
  await page.reload();
  await expect(
    page.getByText("이 기기에서는 진도가 저장되지 않습니다.", { exact: false }),
  ).toBeVisible();
});
test("click-only connection, counter separation, live collection, disconnect cleanup", async ({
  page,
}) => {
  await mockBle(page);
  await page.goto("/?view=ai-ble");
  await page.getByRole("tab", { name: "교사", exact: true }).click();
  expect(await page.evaluate(() => (window as any).testBle.requests)).toBe(0);
  await page.getByRole("button", { name: "Pico 2 W 연결", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "WAITING" }),
  ).toBeVisible();
  await page.evaluate(() =>
    (window as any).sendPacket({ diagnostic: "counter", count: 4 }),
  );
  await page.getByText("상세 데이터 보기", {exact:true}).click();
  await expect(
    page.getByText("DIAGNOSTIC 카운터 4", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "새 측정 회차 시작" }),
  ).toBeDisabled();
  await page.evaluate((p) => (window as any).sendPacket(p), packet(1));
  await page.selectOption("#ai-label", "GOOD");
  await page.getByRole("button", { name: "새 측정 회차 시작" }).click();
  await page.getByRole("button", { name: "5개 저장", exact: true }).click();
  for (let i = 2; i <= 6; i++) {
    await page.evaluate((p) => (window as any).sendPacket(p), packet(i));
    await page.waitForTimeout(15);
  }
  await expect(
    page.getByText("수집 정지 · 5/3000행", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "기존 실습실", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "미저장 데이터" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "CSV 내보내기", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("classroom_real.csv");
  await page.getByRole("button", { name: "이동", exact: true }).click();
  expect(await page.evaluate(() => (window as any).testBle.listeners)).toBe(0);
  expect(await page.evaluate(() => (window as any).testBle.disconnects)).toBe(
    1,
  );
});
test("cancel/service error and delayed connect cleanup", async ({ page }) => {
  await mockBle(page, "cancel");
  await page.goto("/?view=ai-ble");
  await page.getByRole("tab", { name: "교사", exact: true }).click();
  await page.getByRole("button", { name: "Pico 2 W 연결", exact: true }).click();
  await expect(
    page.getByRole("status").filter({hasText:"기기 선택을 취소했습니다."}),
  ).toBeVisible();
  await mockBle(page, "service-error");
  await page.reload();
  await page.getByRole("tab", { name: "교사", exact: true }).click();
  await page.getByRole("button", { name: "Pico 2 W 연결", exact: true }).click();
  await expect(
    page.getByRole("status").filter({hasText:"서비스 또는 알림 연결 실패:"}),
  ).toBeVisible();
  await mockBle(page, "delay");
  await page.reload();
  await page.getByRole("tab", { name: "교사", exact: true }).click();
  await page.getByRole("button", { name: "Pico 2 W 연결", exact: true }).click();
  await page.getByRole("button", { name: "기존 실습실", exact: true }).click();
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as any).testBle.listeners)).toBe(0);
  expect(
    await page.evaluate(() => (window as any).testBle.disconnects),
  ).toBeGreaterThanOrEqual(1);
});
test("stale and sensor error stop collecting; reconnect resets seq tracking", async ({
  page,
}) => {
  await mockBle(page);
  await page.goto("/?view=ai-ble");
  await page.getByRole("tab", { name: "교사", exact: true }).click();
  await page.getByRole("button", { name: "Pico 2 W 연결", exact: true }).click();
  await page.evaluate((p) => (window as any).sendPacket(p), packet(10));
  await page.selectOption("#ai-label", "GOOD");
  await page.getByRole("button", { name: "새 측정 회차 시작" }).click();
  await page.getByRole("button", { name: "5개 저장", exact: true }).click();
  await page.evaluate((p) => (window as any).sendPacket(p), {
    ...packet(11),
    light: null,
    temperature: null,
    humidity: null,
    error: "DHT_READ",
  });
  await expect(
    page.getByText("수집 정지 · 0/3000행", { exact: false }),
  ).toBeVisible();
  await page.evaluate(() => (window as any).dropBle());
  await page.getByRole("button", { name: "Pico 2 W 연결", exact: true }).click();
  await page.evaluate((p) => (window as any).sendPacket(p), packet(0));
  await page.getByText("상세 데이터 보기", {exact:true}).click();
  await expect(page.getByText("완성 패킷 1개", { exact: false })).toBeVisible();
  await page.waitForTimeout(9500);
  await expect(
    page.getByRole("status").filter({ hasText: "STALE" }),
  ).toBeVisible();
});
