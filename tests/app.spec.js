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
  await page.locator(".doc-upload input").setInputFiles({
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

test("все кадры используют полную геометрию Figma, включая перекрываемые области", async ({
  page,
}) => {
  async function box(selector, expected) {
    const actual = await page.locator(selector).boundingBox();
    for (const k in expected)
      expect(actual[k], selector + " " + k).toBeCloseTo(expected[k], 0);
  }
  await page.goto("/?frame=2.1");
  await box(".form-header .masked-icon", {
    x: 16,
    y: 76,
    width: 32,
    height: 32,
  });
  await box(".doc-card", { x: 12, y: 602, width: 378, height: 112 });
  await expect(page.locator(".doc-upload label")).toHaveCSS("height", "44px");
  for (const frame of ["3", "3.1"]) {
    await page.goto("/?frame=" + frame);
    await box(".schedule-card:nth-child(1)", {
      x: 12,
      y: 138,
      width: 378,
      height: 280,
    });
    await box(".schedule-card:nth-child(2)", {
      x: 12,
      y: 426,
      width: 378,
      height: 280,
    });
    await box(".schedule-card:nth-child(3)", {
      x: 12,
      y: 714,
      width: 378,
      height: 280,
    });
    await expect(page.locator(".formatted-value").first()).toHaveText(
      "26 окт. 2026",
    );
    await expect(page.locator(".formatted-value").nth(1)).toHaveText("12:00");
    await expect(page.locator(".action")).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
  }
  await page.goto("/?frame=4");
  await box(".hero", { x: 0, y: 0, width: 402, height: 480 });
  await box(".hero-info", { x: 12, y: 289, width: 378, height: 175 });
  await box(".health-status button:first-child .figma-icon", {
    width: 20,
    height: 20,
  });
  await box(".highlight-event", { x: 12, y: 510, width: 378, height: 123 });
  await box(".home-events > .upcoming", {
    x: 12,
    y: 641,
    width: 378,
    height: 432,
  });
  await box(".tab-bar", { x: 0, y: 770, width: 402, height: 104 });
  await box(".nav-shape", { x: 24, y: 786, width: 354, height: 64 });
  await page.getByRole("button", { name: "Добавить", exact: true }).click();
  await box(".plus-menu", { x: 16, y: 651, width: 370, height: 127 });
  await expect(page.locator(".plus-menu button").first()).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await page.locator(".home-scroll").evaluate((el) => (el.scrollTop = 400));
  await box(".tab-bar", { y: 770 });
  await page.evaluate(() => {
    localStorage.setItem(
      "pets",
      JSON.stringify([{ id: "long-pet", name: "Рекс", docs: [] }]),
    );
    localStorage.setItem(
      "events",
      JSON.stringify(
        Array.from({ length: 12 }, (_, i) => ({
          id: "long-" + i,
          petId: "long-pet",
          title: "Осмотр " + i,
          date: "2027-09-28",
          time: "12:00",
        })),
      ),
    );
  });
  await page.goto("/");
  await page.locator(".home-scroll").evaluate((el) => (el.scrollTop = 400));
  await expect(page.locator(".app")).toHaveClass(/is-scrolled/);
  await box(".tab-bar", { y: 770 });
});
test("семантические токены управляют компонентами, данные демонстрации изолированы", async ({
  page,
}) => {
  await page.goto("/?frame=2");
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      "--size-text-field-height",
      "64px",
    ),
  );
  await expect(page.getByLabel("Имя питомца", { exact: true })).toHaveCSS(
    "height",
    "64px",
  );
  await page.goto("/?view=design-system");
  await expect(
    page.getByRole("heading", { name: "Дизайн-система", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Календарь", exact: true }).click();
  await expect(page.locator(".nav-buttons button.active")).toHaveText(
    "Календарь",
  );
  await expect(
    page.locator(".nav-buttons button.active .masked-icon"),
  ).toHaveCSS("background-color", "rgb(28, 28, 30)");
  await page.getByRole("button", { name: "Токены", exact: true }).click();
  await expect(
    page.getByText("Size Semantic / ContentField/Radius/Single", {
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/");
  await expect(page.getByText("Нет питомцев", { exact: true })).toBeVisible();
});
