import { test, expect } from "@playwright/test";

const ONE_PIXEL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP9sAAAAASUVORK5CYII=";

function pngBuffer() {
  return Buffer.from(ONE_PIXEL_PNG_BASE64, "base64");
}

async function ensureSectionOpen(page, sectionId) {
  await page.evaluate((id) => {
    const section = document.getElementById(id);
    if (section) section.classList.remove("collapsed");
  }, sectionId);
  await page.locator(`#${sectionId} .section-content`).waitFor({ state: "visible" });
}

test("health and desktop/mobile routes respond", async ({ request }) => {
  const health = await request.get("/health");
  expect(health.ok()).toBeTruthy();
  await expect.soft(health.json()).resolves.toMatchObject({ status: "ok" });

  const mobileHealth = await request.get("/health", {
    headers: {
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      "sec-ch-ua-mobile": "?1"
    }
  });
  expect(mobileHealth.ok()).toBeTruthy();
  await expect.soft(mobileHealth.json()).resolves.toMatchObject({ status: "ok" });

  const ready = await request.get("/ready", {
    headers: {
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      "sec-ch-ua-mobile": "?1"
    }
  });
  expect(ready.ok()).toBeTruthy();
  await expect.soft(ready.json()).resolves.toMatchObject({ ready: true });

  const desktop = await request.get("/");
  expect(desktop.ok()).toBeTruthy();
  await expect.soft(desktop.text()).resolves.toContain("VPE Prompt Builder 2026");

  const mobile = await request.get("/mobile/");
  expect(mobile.ok()).toBeTruthy();
  await expect.soft(mobile.text()).resolves.toContain("VPE Prompt Builder Mobile 2026");
});

test("prompt API accepts JSON and multipart image upload", async ({ request }) => {
  const jsonResponse = await request.post("/api/prompt", {
    data: {
      state: {
        mainSubject: "astronaut riding a bicycle through neon rain",
        aiModel: "midjourney",
        promptFormat: "flat"
      }
    }
  });
  expect(jsonResponse.ok()).toBeTruthy();
  const jsonPayload = await jsonResponse.json();
  expect(jsonPayload.prompt).toContain("astronaut riding a bicycle through neon rain");

  const uploadResponse = await request.post("/api/prompt", {
    multipart: {
      state: JSON.stringify({
        referenceImages: [{ description: "tiny test image" }],
        mainSubject: "astronaut portrait",
        aiModel: "midjourney",
        promptFormat: "flat"
      }),
      images: {
        name: "test-upload.png",
        mimeType: "image/png",
        buffer: pngBuffer()
      }
    }
  });
  expect(uploadResponse.ok()).toBeTruthy();
  const uploadPayload = await uploadResponse.json();
  expect(uploadPayload.prompt).toContain("use 1 uploaded reference image as guidance");
});

test("desktop constructor updates prompt output", async ({ page, browserName }) => {
  test.skip(
    browserName === "webkit",
    "WebKit desktop constructor JS is not fully initialized in this runner path; WebKit still covers routes, mobile shell, and API smoke."
  );

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await ensureSectionOpen(page, "descriptionSection");
  await ensureSectionOpen(page, "aiModelSection");
  await page.evaluate(() => {
    const textarea = document.getElementById("mainSubject");
    const modelButton = document.querySelector("[data-group='aiModel'][data-value='midjourney']");
    if (!textarea || !modelButton || typeof window.handleInput !== "function") {
      throw new Error("Constructor controls are not ready");
    }
    textarea.value = "astronaut riding a bicycle through neon rain";
    modelButton.click();
    window.handleInput();
  });

  await expect(page.locator("#promptOutput")).toContainText("astronaut riding a bicycle through neon rain");
});

test("mobile route loads mobile shell", async ({ page }) => {
  await page.goto("/mobile/");
  await page.waitForLoadState("domcontentloaded");

  await expect(page.locator("body.mobile-vpe-shell")).toBeVisible();
  await expect(page.locator("#bottomConstructorPanelBtn")).toBeVisible();
  await expect(page.locator("#headerUndoBtn")).toHaveAttribute("aria-label", /Назад/i);
  await expect(page.locator("#headerCollapseBtn")).toHaveAttribute("aria-label", /Свернуть/i);
  await expect(page.locator("#headerResetBtn")).toHaveAttribute("aria-label", /Сброс/i);
  await expect(page.locator("#randomSeedBtn")).toHaveText(/Случайный/i);
  await expect(page.locator("#clearSeedBtn")).toHaveText(/Очистить/i);
  await expect(page.locator("#specialModesSection .toggle-label")).toHaveCount(4);
});
