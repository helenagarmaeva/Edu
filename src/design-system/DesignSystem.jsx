import React, { useState } from "react";
import {
  Button,
  Surface,
  TextField,
  SelectRow,
  Icon,
  TabBar,
} from "./components.jsx";
import source from "./figma.tokens.json";
import "./gallery.css";
export function DesignSystem() {
  const [navActive, setNavActive] = useState("Главная"),
    [navOpen, setNavOpen] = useState(false);
  const [tab, setTab] = useState("Компоненты"),
    [value, setValue] = useState(""),
    [sex, setSex] = useState("Мужской");
  const colors = source.tokens.filter(
    (t) => t.collection === "Colors Semantic" && t.type === "COLOR",
  );
  return (
    <div className="ds-gallery">
      <header>
        <p>Figma · 585:240</p>
        <h1>Дизайн-система</h1>
        <p>Токены и компоненты приложения для отслеживания здоровья питомцев</p>
        <a href="./">Открыть приложение</a>
      </header>
      <nav aria-label="Раздел дизайн-системы">
        {["Компоненты", "Цвета", "Токены", "Экраны"].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {tab === "Компоненты" ? (
        <div className="ds-examples">
          <Surface className="ds-example">
            <h2>Кнопки</h2>
            <Button>Добавить питомца</Button>
            <Button variant="secondary">Добавить документы</Button>
            <Button disabled>Недоступно</Button>
            <code>Button/Radius → Size Primitives/1000</code>
          </Surface>
          <Surface className="ds-example">
            <h2>Поля и строки</h2>
            <TextField
              label="Имя питомца"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <SelectRow
              label="Пол"
              value={sex}
              onChange={setSex}
              options={["Мужской", "Женский"]}
            />
            <code>TextField/Height → 56 · ContentField/Radius/Single → 32</code>
          </Surface>
          <Surface className="ds-example">
            <h2>Типографика Manrope</h2>
            {[
              ["display", "Name"],
              ["heading", "Основная информация"],
              ["title", "Нет питомцев"],
              ["input", "Чтобы начать добавь питомца"],
              ["body", "Привет, Елена!"],
              ["caption", "Вакцинация"],
            ].map(([style, text]) => (
              <p className={"ds-type-" + style} key={style}>
                {text}
              </p>
            ))}
          </Surface>
          <Surface className="ds-example">
            <h2>Исходные иконки и навигация</h2>
            <div className="ds-icons">
              {[
                "home",
                "calendar",
                "pets",
                "profile",
                "camera",
                "chat",
                "vaccination",
                "parasites",
                "worms",
                "pdf",
              ].map((name) => (
                <span key={name}>
                  <Icon name={name} />
                  <code>{name}</code>
                </span>
              ))}
            </div>
            <div className="ds-nav-preview">
              <TabBar
                active={navActive}
                onNavigate={setNavActive}
                menuOpen={navOpen}
                onToggle={() => setNavOpen(!navOpen)}
                actions={[
                  { label: "Питомец", onClick: () => setNavOpen(false) },
                  { label: "Событие", onClick: () => setNavOpen(false) },
                  { label: "Документ", onClick: () => setNavOpen(false) },
                ]}
              />
            </div>
          </Surface>
        </div>
      ) : tab === "Цвета" ? (
        <div className="ds-swatches">
          {colors.map((t) => (
            <Surface key={t.id}>
              <div
                className="ds-swatch"
                style={{ background: `var(${t.css})` }}
              />
              <h2>{t.name}</h2>
              <code>{t.css}</code>
            </Surface>
          ))}
        </div>
      ) : tab === "Токены" ? (
        <Surface className="ds-token-table">
          <p>
            {source.tokens.length} переменных из Figma. Семантические значения
            ссылаются на примитивы через CSS var().
          </p>
          <table>
            <thead>
              <tr>
                <th>Коллекция / имя</th>
                <th>CSS</th>
                <th>Исходное значение или связь</th>
              </tr>
            </thead>
            <tbody>
              {source.tokens.map((t) => (
                <tr key={t.id}>
                  <td>
                    {t.collection} / {t.name}
                  </td>
                  <td>
                    <code>{t.css}</code>
                  </td>
                  <td>
                    <code>{JSON.stringify(t.modes[0]?.value)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      ) : (
        <div className="ds-frames">
          {["1", "2", "2.1", "3", "3.1", "4", "4.1"].map((id) => (
            <Surface key={id}>
              <h2>Кадр {id}</h2>
              <a href={`?frame=${id}`} target="_blank" rel="noreferrer">
                Открыть 402 × 874
              </a>
              <iframe title={"Кадр " + id} src={`?frame=${id}`} />
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
