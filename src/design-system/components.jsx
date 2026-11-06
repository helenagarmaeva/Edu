import React from "react";
import layout from "./layout.json";
import geometry from "./geometry.json";
const iconColors = {
  home: "var(--muted)",
  calendar: "var(--muted)",
  pets: "var(--muted)",
  profile: "var(--muted)",
  back: "var(--color-content-secondary)",
  "chevron-down": "var(--muted)",
  "event-chevron": "currentColor",
  vaccination: "var(--color-content-status-positive)",
  parasites: "var(--color-content-status-danger)",
  worms: "var(--color-content-status-warning)",
};
export function Icon({ name, className = "" }) {
  const src = `./figma/${name}.svg`;
  if (iconColors[name])
    return (
      <span
        aria-hidden="true"
        data-icon={name}
        className={`figma-icon masked-icon ${className}`}
        style={{
          maskImage: `url("${src}")`,
          WebkitMaskImage: `url("${src}")`,
          backgroundColor: `var(--icon-active-color, ${iconColors[name]})`,
          "--icon-size": [
            "home",
            "calendar",
            "pets",
            "profile",
            "back",
          ].includes(name)
            ? "var(--size-icon-large)"
            : "var(--size-icon-medium)",
        }}
      />
    );
  return <img className={`figma-icon ${className}`} src={src} alt="" />;
}
export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button
      className={`ds-button ds-button--${variant} ${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Surface({
  as: Tag = "div",
  children,
  kind = "group",
  className = "",
  ...props
}) {
  return (
    <Tag className={`ds-surface ds-surface--${kind} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
export function TextField({ label, className = "", ...props }) {
  return (
    <input
      className={`ds-text-field pill-input ${className}`}
      aria-label={label}
      placeholder={label}
      {...props}
    />
  );
}
export function SelectRow({ label, value, onChange, options, children }) {
  return (
    <label className="select-row ds-select-row">
      <span>{label}</span>
      {children || (
        <select
          value={value}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )}
      <Icon name="chevron-down" />
    </label>
  );
}
export function ScreenFrame({ scale, children, className = "" }) {
  return (
    <div
      className="viewport"
      style={{
        width: layout.screen.width * scale,
        height: layout.screen.height * scale,
      }}
    >
      <div
        className={`app ${className}`}
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

export function DateTimeRow({
  label,
  ariaLabel = label,
  type,
  value,
  onChange,
}) {
  const shown =
    type === "date"
      ? value
        ? new Date(value + "T12:00")
            .toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            .replace(/\s?г\.$/, "")
        : "Дата"
      : value;
  return (
    <SelectRow label={label}>
      <div className="formatted-control">
        <span className="formatted-value" aria-hidden="true">
          {shown}
        </span>
        <input
          aria-label={ariaLabel}
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </SelectRow>
  );
}

export function TabBar({
  active = "Главная",
  onNavigate,
  menuOpen = false,
  onToggle,
  actions = [],
}) {
  return (
    <>
      <nav className="tab-bar">
        <Icon name="nav-surface" className="nav-shape" />
        <button
          className="nav-plus"
          aria-label="Добавить"
          aria-expanded={menuOpen}
          onClick={onToggle}
        >
          <Icon name={menuOpen ? "nav-close" : "nav-add"} />
        </button>
        <div className="nav-buttons">
          {[
            ["Главная", "home"],
            ["Календарь", "calendar"],
            ["Питомцы", "pets"],
            ["Профиль", "profile"],
          ].map(([label, icon]) => (
            <button
              key={label}
              className={active === label ? "active" : ""}
              onClick={() => onNavigate?.(label)}
            >
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
      {menuOpen && (
        <div className="plus-menu">
          {actions.map((action, i) => {
            const t = geometry.menu[i].transform;
            return (
              <button
                key={action.label}
                aria-label={action.label}
                onClick={action.onClick}
                style={{
                  transform: `matrix(${t.m00},${t.m10},${t.m01},${t.m11},${t.m02},${t.m12})`,
                }}
              >
                <Icon name={"action-" + ["pet", "event", "document"][i]} />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
