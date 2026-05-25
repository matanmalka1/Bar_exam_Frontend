/* global React, Icon */

// ─────────────────────────────────────────────────────────────────────────────
// Common phone shell + decorative chrome shared across all artboards.
// ─────────────────────────────────────────────────────────────────────────────

const StatusBar = () => (
  <div className="status-bar">
    <span>9:41</span>
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      <span style={{ font: "700 11px var(--font-body)" }}>•••</span>
      <span style={{
        width: 16, height: 10, border: "1.5px solid currentColor",
        borderRadius: 3, position: "relative",
      }}>
        <span style={{
          position: "absolute", inset: 1.5,
          background: "currentColor", width: "70%", borderRadius: 1,
        }} />
      </span>
    </span>
  </div>
);

const BottomNav = ({ active = "home" }) => {
  const items = [
    ["home",     "בית",        "home"],
    ["review",   "עיון",        "book-open"],
    ["mistakes", "טעויות",      "circle-alert"],
    ["stats",    "סטטיסטיקות",  "chart-bar"],
    ["more",     "פרופיל",      "more-horizontal"],
  ];
  return (
    <nav className="bottom-nav" aria-label="ניווט תחתון" dir="rtl">
      <ul>
        {items.map(([k, label, icon]) => {
          const on = k === active;
          return (
            <li key={k}>
              <button type="button" className={on ? "active" : ""}>
                <span className="pill">
                  <Icon name={icon} size={20} sw={on ? 2.2 : 1.8}
                    color={on ? "#fff" : "rgba(0,0,0,0.68)"} />
                </span>
                <span className="label">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const Phone = ({ active, cream, children }) => (
  <div className={`phone ${cream ? "cream" : ""}`} dir="rtl">
    <StatusBar />
    <div className="scroll">{children}</div>
    <BottomNav active={active} />
  </div>
);

window.Phone = Phone;
window.BottomNav = BottomNav;
