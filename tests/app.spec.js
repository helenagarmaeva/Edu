import { test, expect } from "@playwright/test";
test("питомец, документы и событие сохраняются после перезагрузки", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Нет питомцев")).toBeVisible();
  await page
    .getByRole("button", { name: "Добавить питомца", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Далее", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Имя питомца").fill("Рекс");
  await page.getByLabel("Порода").fill("Метис");
  await page.getByLabel("Вес, кг").fill("18");
  await page.getByRole("button", { name: "Далее", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "Вакцинация.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n test"),
  });
  await expect(page.getByText("Вакцинация.pdf")).toBeVisible();
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Рекс", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Добавить событие", exact: true })
    .click();
  await page.getByLabel("Название").fill("Ежегодная вакцинация");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByText("Ежегодная вакцинация")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Ежегодная вакцинация")).toBeVisible();
  await expect(page.getByText("Вакцинация.pdf")).toBeVisible();
  await page.getByRole("button", { name: "Календарь", exact: true }).click();
  await expect(page.getByText("Ежегодная вакцинация")).toBeVisible();
  await page.getByRole("button", { name: "Профиль", exact: true }).click();
  await page.getByLabel("Имя", { exact: true }).fill("Анна");
  await page.getByRole("button", { name: "Главная", exact: true }).click();
  await expect(page.getByText("Привет, Анна!")).toBeVisible();
  await page.screenshot({ path: "/tmp/pet-app.png", fullPage: true });
});
test("на узком экране нет горизонтальной прокрутки", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  await expect(page.getByText("Нет питомцев")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("ошибка хранилища не скрывает несохранённые данные", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Добавить питомца", exact: true })
    .click();
  await page.getByLabel("Имя питомца").fill("Рекс");
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
