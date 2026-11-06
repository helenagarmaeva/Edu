import { test, expect } from "@playwright/test";
async function addPet(page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Добавить питомца", exact: true })
    .click();
  await page.getByLabel("Имя питомца", { exact: true }).fill("Рекс");
}
test("экраны 1 и 2 сохраняют координаты исходного макета 402×874", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".empty")).toHaveCSS("top", "334px");
  await expect(page.locator(".empty")).toHaveCSS("left", "77px");
  await expect(page.locator(".primary")).toHaveCSS("width", "338px");
  await expect(page.locator(".action")).toHaveCSS("top", "786px");
  await expect(page.locator("nav")).toHaveCount(0);
  await expect(page.getByText("Чтобы начать добавь питомца")).toBeVisible();
  await page
    .getByRole("button", { name: "Добавить питомца", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Основная информация" }),
  ).toBeVisible();
  const expected = [
    [".photo-picker", 161, 138, 80, 80],
    ['input[aria-label="Имя питомца"]', 12, 226, 378, 56],
    [".select-card", 12, 290, 378, 112],
    ['input[aria-label="Порода"]', 12, 410, 378, 56],
    ['input[aria-label="Возраст"]', 12, 474, 185, 56],
    ['input[aria-label="Вес"]', 205, 474, 185, 56],
    ['input[aria-label="Номер чипа"]', 12, 538, 378, 56],
  ];
  for (const [selector, x, y, width, height] of expected) {
    const b = await page.locator(selector).boundingBox();
    for (const [key, value] of Object.entries({ x, y, width, height }))
      expect(b[key], selector + " " + key).toBeCloseTo(value, 0);
  }
});
test("питомец, документ и событие сохраняются; документы находятся в основной форме", async ({
  page,
}) => {
  await addPet(page);
  await page.getByLabel("Порода", { exact: true }).fill("Метис");
  await page.getByLabel("Вес", { exact: true }).fill("18");
  await page
    .locator(".doc-upload input")
    .setInputFiles({
      name: "Вакцинация.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
  await expect(page.getByText("Вакцинация.pdf")).toBeVisible();
  await page.getByRole("button", { name: "Далее", exact: true }).click();
  await expect(page.locator(".schedule-card")).toHaveCount(3);
  await page.getByLabel("Название", { exact: true }).fill("Вакцинация");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Рекс", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Рекс", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Редактировать питомца", exact: true })
    .click();
  await expect(page.getByText("Вакцинация.pdf")).toBeVisible();
  await page.getByRole("button", { name: "Назад", exact: true }).click();
  await page.getByRole("button", { name: "Добавить", exact: true }).click();
  await page.getByRole("button", { name: "Событие", exact: true }).click();
  await page.getByLabel("Название", { exact: true }).fill("Осмотр");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByText("Осмотр", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Календарь", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Календарь", exact: true }),
  ).toBeVisible();
});
test("масштаб макета сохраняется на экране 360px без горизонтальной прокрутки", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  const b = await page.locator(".app").boundingBox();
  expect(b.width).toBeCloseTo(360, 0);
});
test("при переполнении хранилища несохранённая форма остаётся открытой", async ({
  page,
}) => {
  await addPet(page);
  await page.getByRole("button", { name: "Далее", exact: true }).click();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Недостаточно места для сохранения",
  );
  await expect(
    page.getByRole("button", { name: "Сохранить", exact: true }),
  ).toBeVisible();
});
