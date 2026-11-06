import React, { useState, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "./design-system/figma.tokens.css";
import "./design-system/typography.tokens.css";
import "./design-system/components.css";
import "./design-system/measured.tokens.css";
import "./style.css";
import {
  Icon,
  Button,
  Surface,
  TextField,
  SelectRow,
  ScreenFrame,
  DateTimeRow,
  TabBar,
} from "./design-system/components.jsx";
import layout from "./design-system/layout.json";

import { DesignSystem } from "./design-system/DesignSystem.jsx";
const frame = new URLSearchParams(location.search).get("frame");
const preview = ["1", "2", "2.1", "3", "3.1", "4", "4.1"].includes(frame);
const previewPets = ["p1", "p2", "p3"].map((id) => ({
  id,
  name: "Name",
  photo: "",
  weight: "",
  age: "",
  type: "Собака",
  sex: "Мужской",
  docs: [],
}));
const previewEvents = Array.from({ length: 4 }, (_, i) => ({
  id: "e" + i,
  petId: "p1",
  title: "Title",
  date: "2027-09-28",
  time: "12:00",
}));
const previewDraft = {
  name: frame?.startsWith("3") ? "Name" : "",
  type: "Собака",
  sex: "Мужской",
  breed: "",
  weight: "",
  age: "",
  chip: "",
  photo: "",
  docs:
    frame === "2.1"
      ? [
          { name: "УЗИ", size: 24500000, url: "#" },
          { name: "МРТ", size: 32600000, url: "#" },
        ]
      : [],
  schedules: Array.from({ length: frame === "3.1" ? 4 : 3 }, () => ({
    title: "",
    date: "2026-10-26",
    time: "12:00",
    repeat: "Раз в месяц",
    reminder: "За 15 минут",
  })),
};
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const Plus = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 4v16M4 12h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
function App() {
  const [pets, setPets] = useState(() =>
      preview ? (frame.startsWith("4") ? previewPets : []) : read("pets", []),
    ),
    [events, setEvents] = useState(() =>
      preview ? previewEvents : read("events", []),
    ),
    [owner, setOwner] = useState(() =>
      preview ? "Елена" : read("owner", "Елена"),
    );
  const [screen, setScreen] = useState(
      preview && !["1", "4", "4.1"].includes(frame) ? "pet" : "home",
    ),
    [tab, setTab] = useState("Главная"),
    [selected, setSelected] = useState(0),
    [draft, setDraft] = useState(preview ? previewDraft : {}),
    [step, setStep] = useState(frame?.startsWith("3") ? 2 : 1),
    [menu, setMenu] = useState(frame === "4.1"),
    [message, setMessage] = useState(""),
    [scale, setScale] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const [month, setMonth] = useState(new Date()),
    [day, setDay] = useState(new Date().getDate());
  useLayoutEffect(() => {
    const update = () =>
      setScale(Math.min(1, window.innerWidth / layout.screen.width));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const pet = pets.find((p) => p.id === selected) || pets[0];
  function notify(t) {
    setMessage(t);
    setTimeout(() => setMessage(""), 3200);
  }
  function store(key, value, set) {
    try {
      if (!preview) localStorage.setItem(key, JSON.stringify(value));
      set(value);
      return true;
    } catch {
      notify("Недостаточно места для сохранения");
      return false;
    }
  }
  function editPet(p) {
    setDraft(
      p
        ? { ...p }
        : {
            name: "",
            type: "Собака",
            sex: "Мужской",
            breed: "",
            weight: "",
            age: "",
            chip: "",
            photo: "",
            docs: [],
          },
    );
    setStep(1);
    setScreen("pet");
    setMenu(false);
  }
  function proceed(e) {
    e.preventDefault();
    setStep(2);
    setDraft((d) => ({
      ...d,
      schedules:
        d.schedules ||
        [0, 1, 2].map(() => ({
          title: "",
          date: "2026-10-26",
          time: "12:00",
          repeat: "Раз в месяц",
          reminder: "За 15 минут",
        })),
    }));
    document.querySelector(".form-scroll")?.scrollTo(0, 0);
  }
  function savePet(e) {
    e.preventDefault();
    const item = {
      ...draft,
      id: draft.id || crypto.randomUUID(),
      schedules: (draft.schedules || []).map((s) => ({
        ...s,
        id: s.id || crypto.randomUUID(),
      })),
    };
    if (
      !store(
        "pets",
        draft.id
          ? pets.map((p) => (p.id === draft.id ? item : p))
          : [...pets, item],
        setPets,
      )
    )
      return;
    const newEvents = item.schedules
      .filter((s) => s.title.trim())
      .map((s) => ({ ...s, petId: item.id }));
    const scheduleIds = new Set(item.schedules.map((s) => s.id));
    if (item.schedules.length)
      store(
        "events",
        [...events.filter((ev) => !scheduleIds.has(ev.id)), ...newEvents],
        setEvents,
      );
    setSelected(item.id);
    setScreen("home");
    setTab("Главная");
  }
  function addEvent() {
    setDraft({
      title: "",
      petId: pet?.id || "",
      date: "2026-10-26",
      time: "12:00",
      repeat: "Раз в месяц",
      reminder: "За 15 минут",
    });
    setScreen("event");
    setMenu(false);
  }
  function saveEvent(e) {
    e.preventDefault();
    if (
      store(
        "events",
        [...events, { ...draft, id: crypto.randomUUID() }],
        setEvents,
      )
    )
      setScreen("home");
  }
  function uploadPhoto(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5e6) return notify("Максимальный размер фото — 5 МБ");
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, photo: r.result }));
    r.readAsDataURL(f);
  }
  async function uploadDocs(e) {
    const files = Array.from(e.target.files || []);
    if (files.some((f) => f.size > 2e6))
      return notify("Максимальный размер документа — 2 МБ");
    const docs = await Promise.all(
      files.map(
        (f) =>
          new Promise((resolve) => {
            const r = new FileReader();
            r.onload = () =>
              resolve({ name: f.name, size: f.size, url: r.result });
            r.readAsDataURL(f);
          }),
      ),
    );
    setDraft((d) => ({ ...d, docs: [...(d.docs || []), ...docs] }));
  }
  function input(label, key, type = "text") {
    return (
      <TextField
        label={label}
        type={type}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "0.1" : undefined}
        required={key === "name"}
        value={draft[key] || ""}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
      />
    );
  }
  const docs = (
    <>
      {!!draft.docs?.length && (
        <Surface className="doc-card">
          {draft.docs.map((d, i) => (
            <div className="doc-row" key={i}>
              <Icon name="pdf" className="pdf-original" />
              <a download={d.name} href={d.url}>
                <span>{d.name}</span>
                <small>
                  {(d.size / 1e6).toLocaleString("ru-RU", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  МБ
                </small>
              </a>
              <button
                type="button"
                className="delete"
                aria-label="Удалить документ"
                onClick={() =>
                  setDraft({
                    ...draft,
                    docs: draft.docs.filter((_, j) => i !== j),
                  })
                }
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 6h14M9 6V3h6v3M7 6l1 15h8l1-15M10 10v7m4-7v7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </Surface>
      )}
      <div className="doc-upload">
        <label>
          <Plus />
          Добавить документы
          <input
            type="file"
            accept=".pdf,image/*"
            multiple
            onChange={uploadDocs}
          />
        </label>
      </div>
    </>
  );
  function selectRow(label, value, onChange, options) {
    return (
      <SelectRow
        label={label}
        value={value}
        onChange={onChange}
        options={options}
      />
    );
  }
  function scheduleCard(value, onChange, index = 0) {
    return (
      <Surface className="schedule-card" key={index}>
        <input
          aria-label={`Название${index ? " " + (index + 1) : ""}`}
          placeholder="Название"
          required={screen !== "pet"}
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
        <DateTimeRow
          label="Дата"
          ariaLabel={`Дата${index ? " " + (index + 1) : ""}`}
          type="date"
          value={value.date}
          onChange={(date) => onChange({ ...value, date })}
        />
        <DateTimeRow
          label="Время"
          ariaLabel={`Время${index ? " " + (index + 1) : ""}`}
          type="time"
          value={value.time}
          onChange={(time) => onChange({ ...value, time })}
        />
        {selectRow(
          "Повтор",
          value.repeat,
          (v) => onChange({ ...value, repeat: v }),
          ["Раз в месяц", "Раз в год", "Не повторять"],
        )}
        {selectRow(
          "Напоминание",
          value.reminder,
          (v) => onChange({ ...value, reminder: v }),
          ["За 15 минут", "За 1 час", "За 1 день", "Без напоминания"],
        )}
      </Surface>
    );
  }
  const heading = (
    <div className="greeting">
      <div>
        <h1>Привет, {owner}!</h1>
        <p>
          {pets.length
            ? `${pets.length} ${pets.length === 1 ? "питомец" : pets.length < 5 ? "питомца" : "питомцев"}`
            : "3 питомца"}
        </p>
      </div>
      <button
        aria-label="Профиль"
        onClick={() => {
          setTab("Профиль");
          setMenu(false);
        }}
      >
        <Icon name="chat" />
      </button>
    </div>
  );
  const eventItems = (items, empty = true) =>
    items.length ? (
      items.map((ev, index) => (
        <article
          className={
            "event-item " +
            ((
              preview
                ? items.length > 1 && index === 2
                : index > 0 && items[index - 1].date === ev.date
            )
              ? "continuation"
              : "")
          }
          key={ev.id}
        >
          <div className="event-date">
            {new Date(ev.date + "T12:00")
              .toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              .replace(/\s?г\.$/, "")}
          </div>
          <button
            onClick={() => {
              setDraft({ ...ev });
              setScreen("event-view");
            }}
          >
            <span>
              <strong>{ev.title}</strong>
              <small>
                {pets.find((p) => p.id === ev.petId)?.name ||
                  pet?.name ||
                  "Name"}
              </small>
            </span>
            <div className="event-time">
              <b>{ev.time}</b>
              <Icon name="event-chevron" className="chevron" />
            </div>
          </button>
        </article>
      ))
    ) : empty ? (
      <p className="no-events">Нет событий</p>
    ) : null;
  const dashboard = (
    <>
      <div className="hero">
        {pet?.photo ? (
          <img
            className="hero-photo custom-photo"
            src={pet.photo}
            alt={pet.name}
          />
        ) : (
          <>
            <img
              className="hero-photo-background"
              src="./images/dog-1.jpg"
              alt=""
            />
            <img
              className="hero-photo figma-photo"
              src="./images/dog-2.jpg"
              alt={pet?.name || "Питомец"}
            />
          </>
        )}
        <div className="hero-info">
          <div className="hero-title">
            <h2>{pet?.name || "Name"}</h2>
            <button
              aria-label="Редактировать питомца"
              onClick={() => editPet(pet)}
            >
              <Icon name="badges" />
            </button>
          </div>
          <div className="hero-meta">
            <span>{pet?.weight ? `${pet.weight} кг` : "Weight"}</span>
            <span>{pet?.age || "Age"}</span>
          </div>
          <div className="health-status">
            {[
              ["vaccination", "Вакцинация"],
              ["parasites", "Эктопаразиты"],
              ["worms", "Гельминты"],
            ].map(([icon, label]) => (
              <button key={label} onClick={addEvent}>
                <Icon name={icon} />
                <span>{label}</span>
                <strong>28 сент. 2027</strong>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="page-dots">
        {(pets.length > 1 ? pets : [pet, null, null]).map((p, i) => (
          <button
            aria-label={`Питомец ${i + 1}`}
            key={p?.id || i}
            className={p?.id === pet?.id ? "selected" : ""}
            onClick={() => p && setSelected(p.id)}
          />
        ))}
      </div>
      <div className="home-events">
        <Surface className="highlight-event">
          {eventItems(events.filter((e) => e.petId === pet?.id).slice(0, 1))}
        </Surface>
        <Surface as="section" className="upcoming">
          <h2>Ближайшие события</h2>
          {eventItems(events.filter((e) => e.petId === pet?.id))}
        </Surface>
      </div>
    </>
  );
  const nav = (
    <TabBar
      active={tab}
      menuOpen={menu}
      onToggle={() => setMenu(!menu)}
      onNavigate={(label) => {
        setTab(label);
        setMenu(false);
      }}
      actions={[
        { label: "Питомец", onClick: () => editPet() },
        { label: "Событие", onClick: addEvent },
        {
          label: "Документ",
          onClick: () => {
            editPet(pet);
            setTimeout(
              () => document.querySelector(".doc-upload input")?.click(),
              0,
            );
          },
        },
      ]}
    />
  );
  const calendar = (
    <>
      <div className="secondary-heading">
        <h1>Календарь</h1>
      </div>
      <div className="calendar-card">
        <div className="month">
          <button
            aria-label="Предыдущий месяц"
            onClick={() => {
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
              setDay(1);
            }}
          >
            ‹
          </button>
          <h2>
            {month
              .toLocaleDateString("ru-RU", {
                month: "long",
                year: "numeric",
              })
              .replace(/\s?г\.$/, "")}
          </h2>
          <button
            aria-label="Следующий месяц"
            onClick={() => {
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
              setDay(1);
            }}
          >
            ›
          </button>
        </div>
        <div className="days">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
            <span key={d}>{d}</span>
          ))}
          {Array.from(
            {
              length:
                (new Date(month.getFullYear(), month.getMonth(), 1).getDay() +
                  6) %
                7,
            },
            (_, i) => (
              <span key={"b" + i} />
            ),
          )}
          {Array.from(
            {
              length: new Date(
                month.getFullYear(),
                month.getMonth() + 1,
                0,
              ).getDate(),
            },
            (_, i) => (
              <button
                key={i}
                className={day === i + 1 ? "selected" : ""}
                onClick={() => setDay(i + 1)}
              >
                {i + 1}
              </button>
            ),
          )}
        </div>
      </div>
      <section className="upcoming calendar-events">
        {eventItems(
          events.filter(
            (e) =>
              e.date ===
              `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          ),
        )}
      </section>
    </>
  );
  return (
    <ScreenFrame
      scale={scale}
      className={
        (screen === "home" && tab === "Главная" && pets.length
          ? "with-pet"
          : "") + (scrolled ? " is-scrolled" : "")
      }
    >
      <Icon className="status-bar" name="status" />
      {screen === "home" ? (
        <>
          {tab === "Главная" ? (
            <>
              <div
                className="home-scroll"
                onScroll={(e) =>
                  setScrolled(
                    e.currentTarget.scrollTop >
                      layout.hero.height - layout.form.top,
                  )
                }
              >
                {pets.length ? (
                  dashboard
                ) : (
                  <div className="empty">
                    <h2>Нет питомцев</h2>
                    <p>Чтобы начать добавь питомца</p>
                  </div>
                )}
              </div>
              {heading}
              {!pets.length && (
                <div className="action">
                  <Button onClick={() => editPet()}>Добавить питомца</Button>
                </div>
              )}
            </>
          ) : (
            <div className="secondary-scroll">
              {tab === "Календарь" ? (
                calendar
              ) : (
                <>
                  <div className="secondary-heading">
                    <h1>{tab}</h1>
                  </div>
                  {tab === "Профиль" && (
                    <div className="profile-card">
                      <Icon name="profile" />
                      <label>
                        Имя
                        <input
                          aria-label="Имя"
                          value={owner}
                          onChange={(e) =>
                            store("owner", e.target.value, setOwner)
                          }
                        />
                      </label>
                    </div>
                  )}
                  <div className="pet-list">
                    {pets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelected(p.id);
                          setTab("Главная");
                        }}
                      >
                        <img src={p.photo || "./images/dog-2.jpg"} alt="" />
                        <span>{p.name}</span>
                        <span>›</span>
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    className="add-pet"
                    onClick={() => editPet()}
                  >
                    <Plus />
                    Добавить питомца
                  </Button>
                </>
              )}
            </div>
          )}
          {(pets.length > 0 || tab !== "Главная") && nav}
        </>
      ) : (
        <>
          <header className="form-header">
            <button
              aria-label="Назад"
              onClick={() =>
                screen === "pet" && step === 2 ? setStep(1) : setScreen("home")
              }
            >
              <Icon name="back" />
            </button>
            <h1>Основная информация</h1>
          </header>
          <form
            id="details"
            onSubmit={
              screen === "pet" ? (step === 1 ? proceed : savePet) : saveEvent
            }
          >
            <div className="form-scroll">
              {screen === "pet" && step === 1 ? (
                <>
                  <label className="photo-picker">
                    {draft.photo ? (
                      <img src={draft.photo} alt="Фото питомца" />
                    ) : (
                      <Icon name="camera" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadPhoto}
                    />
                    <span className="sr-only">Добавить фото</span>
                  </label>
                  <div className="pet-fields">
                    {input("Имя питомца", "name")}
                    <Surface className="select-card">
                      {selectRow(
                        "Тип",
                        draft.type,
                        (v) => setDraft({ ...draft, type: v }),
                        ["Собака", "Кошка", "Другое"],
                      )}
                      {selectRow(
                        "Пол",
                        draft.sex,
                        (v) => setDraft({ ...draft, sex: v }),
                        ["Мужской", "Женский"],
                      )}
                    </Surface>
                    {input("Порода", "breed")}
                    <div className="split">
                      {input("Возраст", "age")}
                      {input("Вес", "weight", "number")}
                    </div>
                    {input("Номер чипа", "chip")}
                    {docs}
                  </div>
                  {draft.id && (
                    <button
                      className="delete-pet"
                      type="button"
                      onClick={() => {
                        if (confirm("Удалить питомца и его события?")) {
                          if (
                            !store(
                              "pets",
                              pets.filter((p) => p.id !== draft.id),
                              setPets,
                            )
                          )
                            return;
                          store(
                            "events",
                            events.filter((e) => e.petId !== draft.id),
                            setEvents,
                          );
                          setScreen("home");
                        }
                      }}
                    >
                      Удалить питомца
                    </button>
                  )}
                </>
              ) : screen === "pet" ? (
                <div className="schedule-list">
                  {draft.schedules?.map((s, i) =>
                    scheduleCard(
                      s,
                      (v) =>
                        setDraft({
                          ...draft,
                          schedules: draft.schedules.map((a, j) =>
                            j === i ? v : a,
                          ),
                        }),
                      i,
                    ),
                  )}
                  {docs}
                </div>
              ) : (
                <div className="schedule-list">
                  {scheduleCard(draft, setDraft)}
                  {screen === "event-view" && (
                    <button
                      className="delete-pet"
                      type="button"
                      onClick={() => {
                        store(
                          "events",
                          events.filter((e) => e.id !== draft.id),
                          setEvents,
                        );
                        setScreen("home");
                      }}
                    >
                      Удалить событие
                    </button>
                  )}
                </div>
              )}
            </div>
          </form>
          <div className="action">
            <Button
              form="details"

              onClick={
                screen === "event-view"
                  ? (e) => {
                      e.preventDefault();
                      if (
                        store(
                          "events",
                          events.map((ev) => (ev.id === draft.id ? draft : ev)),
                          setEvents,
                        )
                      )
                        setScreen("home");
                    }
                  : undefined
              }
            >
              {screen === "pet" && step === 1 ? "Далее" : "Сохранить"}
            </Button>
          </div>
        </>
      )}
      {message && (
        <div role="status" className="toast">
          {message}
        </div>
      )}
    </ScreenFrame>
  );
}
createRoot(document.getElementById("root")).render(
  new URLSearchParams(location.search).get("view") === "design-system" ? (
    <DesignSystem />
  ) : (
    <App />
  ),
);
