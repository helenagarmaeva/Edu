import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  PawPrint,
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserRound,
  House,
  Signal,
  Wifi,
  BatteryFull,
  FileText,
  Upload,
  Check,
  X,
  Trash2,
  Pencil,
  Bell,
  Heart,
  ArrowRight,
} from "lucide-react";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "./style.css";
function read(k, fallback) {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? fallback;
  } catch {
    return fallback;
  }
}
function App() {
  const [pets, setPets] = useState(() => read("pets", [])),
    [events, setEvents] = useState(() => read("events", [])),
    [name, setName] = useState(() => read("owner", "Елена"));
  const [tab, setTab] = useState("Главная"),
    [page, setPage] = useState("home"),
    [selected, setSelected] = useState(0),
    [draft, setDraft] = useState({}),
    [step, setStep] = useState(1),
    [toast, setToast] = useState(""),
    [month, setMonth] = useState(new Date()),
    [day, setDay] = useState(new Date().getDate());
  const pet = pets.find((p) => p.id === selected) || pets[0];
  function persist(k, v, set) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      set(v);
      return true;
    } catch {
      notify("Недостаточно места для сохранения");
      return false;
    }
  }
  function notify(t) {
    setToast(t);
    setTimeout(() => setToast(""), 3200);
  }
  function openPet(p) {
    setDraft(
      p
        ? { ...p }
        : {
            name: "",
            type: "Собака",
            breed: "",
            sex: "Мужской",
            weight: "",
            age: "",
            chip: "",
            photo: "./images/dog-1.jpg",
            docs: [],
          },
    );
    setStep(1);
    setPage("pet");
  }
  function savePet() {
    if (!draft.name?.trim()) return;
    const p = {
      ...draft,
      name: draft.name.trim(),
      id: draft.id || crypto.randomUUID(),
    };
    if (
      !persist(
        "pets",
        draft.id ? pets.map((a) => (a.id === draft.id ? p : a)) : [...pets, p],
        setPets,
      )
    )
      return;
    setSelected(p.id);
    setPage("home");
    setTab("Главная");
    notify("Питомец сохранён");
  }
  function openEvent() {
    setDraft({
      title: "",
      petId: pet?.id || "",
      type: "Вакцинация",
      date: new Date().toISOString().slice(0, 10),
      time: "12:00",
      reminder: "За 15 минут",
      repeat: "Не повторять",
    });
    setPage("event");
  }
  function saveEvent(e) {
    e.preventDefault();
    if (
      !persist(
        "events",
        [...events, { ...draft, id: crypto.randomUUID() }],
        setEvents,
      )
    )
      return;
    setPage("home");
    notify("Событие сохранено");
  }
  const field = (label, key, type = "text", options) => (
    <label className="field">
      <span>{label}</span>
      {options ? (
        <select
          value={draft[key] || ""}
          onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
        >
          {options.map((o) => (
            <option
              key={typeof o === "string" ? o : o.value}
              value={typeof o === "string" ? o : o.value}
            >
              {typeof o === "string" ? o : o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          required={["name", "title", "date", "time"].includes(key)}
          type={type}
          min={type === "number" ? "0" : undefined}
          step={type === "number" ? "0.1" : undefined}
          value={draft[key] || ""}
          placeholder={label}
          onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
        />
      )}
    </label>
  );
  function uploadPhoto(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return notify("Выберите изображение");
    if (f.size > 5000000) return notify("Максимальный размер — 5 МБ");
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, photo: r.result }));
    r.readAsDataURL(f);
  }
  function uploadDocs(e) {
    const files = Array.from(e.target.files);
    if (files.some((f) => f.size > 2000000))
      return notify("Максимальный размер документа — 2 МБ");
    Promise.all(
      files.map(
        (f) =>
          new Promise((resolve) => {
            const r = new FileReader();
            r.onload = () =>
              resolve({ name: f.name, size: f.size, url: r.result });
            r.readAsDataURL(f);
          }),
      ),
    ).then((docs) =>
      setDraft((d) => ({ ...d, docs: [...(d.docs || []), ...docs] })),
    );
  }
  const eventList = (list) =>
    list.length ? (
      <div className="events">
        {[...list]
          .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
          .map((ev) => (
            <article className="event" key={ev.id}>
              <div
                className={
                  "event-icon " + (ev.type === "Вакцинация" ? "green" : "blue")
                }
              >
                <Heart size={21} />
              </div>
              <div className="event-info">
                <strong>{ev.title}</strong>
                <span>
                  {pets.find((p) => p.id === ev.petId)?.name} · {ev.type}
                </span>
                <small>
                  {new Date(ev.date + "T12:00").toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {ev.time}
                </small>
              </div>
              <button
                className="icon muted"
                aria-label="Удалить событие"
                onClick={() => {
                  persist(
                    "events",
                    events.filter((a) => a.id !== ev.id),
                    setEvents,
                  );
                  notify("Событие удалено");
                }}
              >
                <X size={17} />
              </button>
            </article>
          ))}
      </div>
    ) : (
      <div className="quiet">
        <CalendarDays size={28} />
        <p>Нет событий</p>
        <span>Добавьте событие, чтобы ничего не забыть</span>
      </div>
    );
  const home = (
    <>
      <header className="greeting">
        <div>
          <h1>Привет, {name}!</h1>
          <p>
            {pets.length
              ? `${pets.length} ${pets.length === 1 ? "питомец" : pets.length < 5 ? "питомца" : "питомцев"}`
              : "Питомцы"}
          </p>
        </div>
        <button
          className="icon"
          aria-label="Профиль"
          onClick={() => setTab("Профиль")}
        >
          <UserRound />
        </button>
      </header>
      {!pets.length ? (
        <>
          <div className="empty">
            <div className="empty-art">
              <PawPrint size={58} strokeWidth={1.3} />
              <i>+</i>
            </div>
            <h2>Нет питомцев</h2>
            <p>Чтобы начать добавь питомца</p>
          </div>
          <div className="bottom-action">
            <button className="primary" onClick={() => openPet()}>
              <Plus size={20} />
              Добавить питомца
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="pet-switch">
            {pets.map((p) => (
              <button
                className={pet?.id === p.id ? "chosen" : ""}
                key={p.id}
                onClick={() => setSelected(p.id)}
              >
                {p.name}
              </button>
            ))}
            <button aria-label="Добавить питомца" onClick={() => openPet()}>
              <Plus size={18} />
            </button>
          </div>
          <section className="pet-card">
            <img src={pet.photo} alt={pet.name} />
            <button
              className="photo-edit icon"
              onClick={() => openPet(pet)}
              aria-label="Редактировать питомца"
            >
              <Pencil size={18} />
            </button>
            <div className="pet-overlay">
              <h2>{pet.name}</h2>
              <p>{pet.breed || pet.type}</p>
              <div>
                <span>
                  Вес<strong>{pet.weight ? `${pet.weight} кг` : "—"}</strong>
                </span>
                <span>
                  Возраст<strong>{pet.age || "—"}</strong>
                </span>
                <span>
                  Пол<strong>{pet.sex}</strong>
                </span>
              </div>
            </div>
          </section>
          <div className="dots">
            {pets.map((p) => (
              <i key={p.id} className={p.id === pet.id ? "active" : ""} />
            ))}
          </div>
          <section className="section">
            <div className="section-head">
              <h2>Ближайшие события</h2>
              <button
                className="icon accent"
                aria-label="Добавить событие"
                onClick={openEvent}
              >
                <Plus />
              </button>
            </div>
            {eventList(events.filter((e) => e.petId === pet.id))}
          </section>
          <section className="section">
            <div className="section-head">
              <h2>Документы</h2>
              <button
                className="icon accent"
                aria-label="Добавить документы"
                onClick={() => {
                  openPet(pet);
                  setStep(2);
                }}
              >
                <Plus />
              </button>
            </div>
            {pet.docs?.length ? (
              pet.docs.map((d, i) => (
                <a className="doc" key={i} href={d.url} download={d.name}>
                  <FileText />
                  <span>
                    {d.name}
                    <small>{(d.size / 1024).toFixed(0)} КБ</small>
                  </span>
                  <ArrowRight size={18} />
                </a>
              ))
            ) : (
              <p className="muted">Документы ещё не добавлены</p>
            )}
          </section>
        </>
      )}
    </>
  );
  const calendar = (
    <>
      <header className="greeting">
        <h1>Календарь</h1>
        <button
          className="icon accent"
          aria-label="Добавить событие"
          onClick={openEvent}
        >
          <Plus />
        </button>
      </header>
      <section className="section calendar">
        <div className="section-head">
          <button
            className="icon"
            aria-label="Предыдущий месяц"
            onClick={() => {
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
              setDay(1);
            }}
          >
            <ChevronLeft />
          </button>
          <h2>
            {month.toLocaleDateString("ru-RU", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            className="icon"
            aria-label="Следующий месяц"
            onClick={() => {
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
              setDay(1);
            }}
          >
            <ChevronRight />
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
              <span key={"blank" + i} />
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
            (_, i) => {
              const d = i + 1,
                date = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              return (
                <button
                  className={day === d ? "selected" : ""}
                  key={d}
                  onClick={() => setDay(d)}
                >
                  {d}
                  {events.some((e) => e.date === date) && <i />}
                </button>
              );
            },
          )}
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <h2>
            {day}{" "}
            {month
              .toLocaleDateString("ru-RU", { month: "long" })
              .replace(/ь$/, "я")}
          </h2>
          <Plus className="accent" size={20} />
        </div>
        {eventList(
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
    <div className="app">
      <div className="status">
        <span>9:41</span>
        <div className="status-icons">
          <Signal size={17} fill="currentColor" />
          <Wifi size={16} />
          <BatteryFull size={22} />
        </div>
      </div>
      {page === "home" ? (
        <>
          <main>
            {tab === "Главная" ? (
              home
            ) : tab === "Календарь" ? (
              calendar
            ) : (
              <>
                <header className="greeting">
                  <h1>Профиль</h1>
                  <UserRound />
                </header>
                <section className="section profile">
                  <div className="avatar">
                    <UserRound size={34} />
                  </div>
                  <h2>{name}</h2>
                  <label className="field">
                    <span>Имя</span>
                    <input
                      aria-label="Имя"
                      value={name}
                      onChange={(e) =>
                        persist("owner", e.target.value, setName)
                      }
                    />
                  </label>
                </section>
                <section className="section">
                  <div className="section-head">
                    <h2>Питомцы</h2>
                    <button
                      className="icon accent"
                      aria-label="Добавить питомца"
                      onClick={() => openPet()}
                    >
                      <Plus />
                    </button>
                  </div>
                  {pets.map((p) => (
                    <button
                      className="pet-row"
                      key={p.id}
                      onClick={() => openPet(p)}
                    >
                      <img src={p.photo} alt="" />
                      <span>
                        {p.name}
                        <small>{p.breed || p.type}</small>
                      </span>
                      <ChevronRight size={20} />
                    </button>
                  ))}
                  {!pets.length && <p className="muted">Нет питомцев</p>}
                </section>
              </>
            )}
          </main>
          <nav>
            {[
              ["Главная", House],
              ["Календарь", CalendarDays],
              ["Профиль", UserRound],
            ].map(([t, Icon]) => (
              <button
                className={tab === t ? "active" : ""}
                key={t}
                onClick={() => setTab(t)}
              >
                <Icon size={25} />
                <span>{t}</span>
              </button>
            ))}
          </nav>
        </>
      ) : (
        <>
          <header className="form-header">
            <button
              className="icon accent"
              aria-label="Назад"
              onClick={() =>
                page === "pet" && step === 2 ? setStep(1) : setPage("home")
              }
            >
              <ChevronLeft />
            </button>
            <h1>
              {page === "event"
                ? "Событие"
                : draft.id
                  ? "Питомец"
                  : "Добавить питомца"}
            </h1>
            <span className="header-space" />
          </header>
          <main className="form-main">
            {page === "pet" ? (
              <form
                id="pet-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  step === 1 ? setStep(2) : savePet();
                }}
              >
                {step === 1 ? (
                  <>
                    <label className="photo-picker">
                      <img src={draft.photo} alt="Фото питомца" />
                      <span>
                        <Upload size={18} /> Добавить фото
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={uploadPhoto}
                      />
                    </label>
                    <div className="photo-choices">
                      {[1, 2].map((i) => (
                        <button
                          type="button"
                          className={
                            draft.photo === `./images/dog-${i}.jpg`
                              ? "chosen"
                              : ""
                          }
                          key={i}
                          aria-label={`Фото ${i}`}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              photo: `./images/dog-${i}.jpg`,
                            })
                          }
                        >
                          <img src={`./images/dog-${i}.jpg`} alt="" />
                        </button>
                      ))}
                    </div>
                    <h2 className="form-label">Основная информация</h2>
                    <div className="fields">
                      {field("Имя питомца", "name")}
                      {field("Тип", "type", "text", [
                        "Собака",
                        "Кошка",
                        "Другое",
                      ])}
                      {field("Порода", "breed")}
                      {field("Пол", "sex", "text", ["Мужской", "Женский"])}
                      {field("Вес, кг", "weight", "number")}
                      {field("Возраст", "age")}
                      {field("Номер чипа", "chip")}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="form-label">Документы</h2>
                    <div className="upload-box">
                      <FileText size={36} />
                      <h2>Добавить документы</h2>
                      <p>Вакцинация, УЗИ, МРТ и другие документы</p>
                      <label className="secondary">
                        <Plus size={19} />
                        Добавить документы
                        <input
                          type="file"
                          multiple
                          accept=".pdf,image/*"
                          onChange={uploadDocs}
                        />
                      </label>
                    </div>
                    {draft.docs?.map((d, i) => (
                      <div className="doc" key={i}>
                        <FileText />
                        <span>
                          {d.name}
                          <small>{(d.size / 1024).toFixed(0)} КБ</small>
                        </span>
                        <button
                          type="button"
                          className="icon"
                          aria-label="Удалить документ"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              docs: draft.docs.filter((_, j) => j !== i),
                            })
                          }
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
                {draft.id && step === 1 && (
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      if (!confirm("Удалить питомца и его события?")) return;
                      persist(
                        "pets",
                        pets.filter((p) => p.id !== draft.id),
                        setPets,
                      );
                      persist(
                        "events",
                        events.filter((e) => e.petId !== draft.id),
                        setEvents,
                      );
                      setPage("home");
                    }}
                  >
                    <Trash2 size={17} />
                    Удалить питомца
                  </button>
                )}
              </form>
            ) : (
              <form id="event-form" onSubmit={saveEvent}>
                <h2 className="form-label">Основная информация</h2>
                <div className="fields">
                  {field("Название", "title")}
                  {field("Питомец", "petId", "text", [
                    { value: "", label: "Выберите питомца" },
                    ...pets.map((p) => ({ value: p.id, label: p.name })),
                  ])}
                  {field("Тип", "type", "text", [
                    "Вакцинация",
                    "Гельминты",
                    "Эктопаразиты",
                    "УЗИ",
                    "МРТ",
                    "Другое",
                  ])}
                </div>
                <h2 className="form-label">Дата и время</h2>
                <div className="fields">
                  {field("Дата", "date", "date")}
                  {field("Время", "time", "time")}
                  {field("Напоминание", "reminder", "text", [
                    "За 15 минут",
                    "За 1 час",
                    "За 1 день",
                    "Без напоминания",
                  ])}
                  {field("Повтор", "repeat", "text", [
                    "Не повторять",
                    "Раз в месяц",
                    "Раз в год",
                  ])}
                </div>
                <p className="form-hint">
                  <Bell size={16} /> Напоминания сохраняются в приложении.
                </p>
              </form>
            )}
          </main>
          <div className="bottom-action form-action">
            <button
              form={page === "pet" ? "pet-form" : "event-form"}
              disabled={
                page === "pet"
                  ? !draft.name?.trim()
                  : !draft.title?.trim() || !draft.petId
              }
              className="primary"
            >
              {page === "pet" && step === 1 ? "Далее" : "Сохранить"}
            </button>
          </div>
        </>
      )}
      {toast && (
        <div role="status" className="toast">
          <Check size={18} />
          {toast}
        </div>
      )}
      <div className="home-indicator" />
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
