/* global React, Icon, Phone */

// ─────────────────────────────────────────────────────────────────────────────
// HOME — three redesigns
// All copy lifted from the spec verbatim. All functionality preserved.
// ─────────────────────────────────────────────────────────────────────────────

// Sample numbers, matching the spec
const DEMO = {
  date: "יום שלישי, 3 ביוני",
  greeting: "בוקר טוב",
  name: "רוית כהן",
  mistakes: 7,
  total: 248,
  correct: 198,
  wrong: 50,
  time: "12:24 שע׳",
  practices: 9,
  exams: 3,
  simulations: 1,
  bookmarks: 4,
  partB: { rate: 78, answered: 132 },
  partC: { rate: 64, answered: 116 },
};

const Route = ({ idx, icon, title, hint, end }) => (
  <button type="button" className="route-row">
    <span className="idx">{idx}</span>
    <span className="icon-wrap"><Icon name={icon} size={20} /></span>
    <span className="body">
      <span className="title">{title}</span>
      <span className="hint">{hint}</span>
    </span>
    {end !== undefined && <span className="end-count">{end}</span>}
    <Icon name="arrow-left" size={18} color="var(--text-secondary)" />
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// HOME V1 — "Quiet Index"
//
//  ▪ Drops the hero panel chrome entirely; greeting sits on cream paper.
//  ▪ Stats become a single horizontal "ledger" strip with hairline rules,
//    quoting the three numbers that actually matter day-to-day.
//  ▪ The amber mistakes ribbon gets its own slot above the stats — it now
//    reads as the most urgent affordance on the screen, not a footnote.
//  ▪ Routes flow directly under stats so progress informs action.
// ─────────────────────────────────────────────────────────────────────────────

const HomeV1 = () => (
  <Phone active="home" cream>
    {/* Top strip — date + overflow */}
    <div style={{ padding: "10px 20px 0", display: "flex",
      alignItems: "center", justifyContent: "space-between" }}>
      <span className="eyebrow">{DEMO.date}</span>
      <button style={{ background: "transparent", border: 0, padding: 4, color: "var(--text-secondary)" }}>
        <Icon name="more-horizontal" size={20} />
      </button>
    </div>

    {/* Greeting (no card chrome — that's the point of V1) */}
    <header style={{ padding: "18px 20px 0" }}>
      <h1 style={{
        font: "900 40px/1 var(--font-display)", color: "var(--ink)",
        margin: 0, letterSpacing: 0,
      }}>{DEMO.greeting}</h1>
      <p style={{ font: "700 22px/1.2 var(--font-display)", color: "var(--ink)",
        margin: "8px 0 0" }}>{DEMO.name}</p>
      <p style={{ font: "500 14px/1.5 var(--font-body)", color: "var(--text-secondary)",
        margin: "10px 0 0" }}>
        יש לך {DEMO.mistakes} טעויות פתוחות לחזרה.
      </p>
    </header>

    {/* Primary CTA */}
    <div style={{ padding: "20px 20px 0" }}>
      <button className="btn-primary">התחל תרגול</button>
    </div>

    {/* Amber mistakes ribbon — gets full visual weight here */}
    <div style={{ padding: "12px 20px 0" }}>
      <button className="amber-band">
        <Icon name="circle-alert" size={18} sw={2.2} color="var(--amber-800)" />
        <span>חזרה על {DEMO.mistakes} טעויות פתוחות</span>
        <span className="count">{DEMO.mistakes}</span>
      </button>
    </div>

    {/* Ledger stats strip — three headline numbers, hairline-divided */}
    <section style={{ padding: "26px 20px 0" }} aria-label="סיכום פעילות">
      <div style={{ display: "flex", alignItems: "baseline",
        justifyContent: "space-between", marginBottom: 12 }}>
        <span className="eyebrow eyebrow-tight">סיכום פעילות</span>
        <span className="eyebrow eyebrow-tight tabular" style={{ color: "var(--text-tertiary)" }}>
          {DEMO.correct}/{DEMO.total}
        </span>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
        borderTop: "1px solid var(--border-default)",
        borderBottom: "1px solid var(--border-default)",
        padding: "14px 0",
      }}>
        <LedgerStat value={DEMO.total} label="שאלות נענו" sub={`${DEMO.correct} נכונות`} />
        <Divider />
        <LedgerStat value={DEMO.time} label="זמן לימוד" mono />
        <Divider />
        <LedgerStat value={DEMO.mistakes} label="טעויות" sub="פתוחות" />
      </div>

      {/* Secondary stats — small mono counters in a row */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <SmallCounter label="תרגולים"    value={DEMO.practices} />
        <SmallCounter label="מבחנים"      value={DEMO.exams} />
        <SmallCounter label="סימולציות"  value={DEMO.simulations} />
      </div>
    </section>

    {/* Study routes */}
    <section style={{ padding: "28px 20px 0" }}>
      <div className="section-divider">
        <h2>מסלולי לימוד</h2>
        <span className="eyebrow eyebrow-tight">בחר כיוון</span>
      </div>
      <Route idx="01" icon="pencil-line"    title="תרגול חדש"    hint="בחר חלק, מועד וכמות שאלות" />
      <Route idx="02" icon="calendar-days"   title="בחינת מועד"   hint="בחר מועד בחינה רשמי" />
      <Route idx="03" icon="clipboard-list"  title="סימולציה מלאה" hint="80 שאלות אקראיות מכל המאגר" />
      <Route idx="04" icon="circle-alert"    title="חזרה על טעויות" hint={`${DEMO.mistakes} שאלות פתוחות לתרגול`} end={DEMO.mistakes} />
      <Route idx="05" icon="bookmark"        title="שאלות שסומנו"  hint={`${DEMO.bookmarks} סימניות שמורות`} end={DEMO.bookmarks} />
    </section>

    {/* Part breakdown — kept inline with the system look */}
    <section style={{ margin: "24px 20px 0", border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-2xl)", overflow: "hidden", background: "rgba(0,0,0,0.10)",
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
      aria-label="פירוט לפי חלקי הבחינה">
      <PartCell label="דין דיוני · חלק ב׳" rate={DEMO.partB.rate} answered={DEMO.partB.answered} />
      <PartCell label="דין מהותי · חלק ג׳" rate={DEMO.partC.rate} answered={DEMO.partC.answered} />
    </section>

    {/* Sim history teaser */}
    <SimHistoryV1 />

    <div style={{ height: 32 }} />
  </Phone>
);

const LedgerStat = ({ value, label, sub, mono }) => (
  <div style={{ textAlign: "center", padding: "0 8px" }}>
    <div className={`tabular ${mono ? "" : ""}`} style={{
      font: "900 28px/1 var(--font-display)", color: "var(--ink)",
    }}>{value}</div>
    <div className="eyebrow eyebrow-tight" style={{ marginTop: 8 }}>{label}</div>
    {sub && <div style={{ font: "500 11px var(--font-body)",
      color: "var(--text-tertiary)", marginTop: 6 }}>{sub}</div>}
  </div>
);
const Divider = () => <div style={{ background: "var(--border-default)", width: 1 }} />;
const SmallCounter = ({ label, value }) => (
  <div style={{
    flex: 1, minWidth: 0,
    background: "var(--surface)",
    border: "1px solid var(--border-default)",
    borderRadius: 18,
    padding: "10px 12px",
    display: "flex", flexDirection: "column", gap: 4,
  }}>
    <span className="eyebrow eyebrow-tight">{label}</span>
    <span className="tabular" style={{
      font: "900 22px var(--font-display)", color: "var(--ink)", lineHeight: 1,
    }}>{value}</span>
  </div>
);
const PartCell = ({ label, rate, answered }) => (
  <div style={{ background: "var(--surface)", padding: "16px 14px" }}>
    <div className="eyebrow eyebrow-tight">{label}</div>
    <div style={{ display: "flex", alignItems: "baseline",
      justifyContent: "space-between", marginTop: 10 }}>
      <span className="tabular" style={{
        font: "900 28px var(--font-display)", color: "var(--ink)", lineHeight: 1,
      }}>{rate}%</span>
      <span className="tabular" style={{ font: "500 12px var(--font-body)",
        color: "var(--text-secondary)" }}>{answered} שאלות</span>
    </div>
  </div>
);
const SimHistoryV1 = () => (
  <section style={{ margin: "24px 20px 0", border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-2xl)", background: "var(--surface)", overflow: "hidden" }}>
    <header style={{ padding: "12px 16px",
      background: "var(--surface-muted)",
      borderBottom: "1px solid var(--border-default)" }}>
      <span className="eyebrow eyebrow-tight">היסטוריית מבחנים</span>
    </header>
    {[
      ["28 מאי 2026", "80 שאלות · 2:14 שע׳", 58],
      ["14 מאי 2026", "80 שאלות · 2:32 שע׳", 49],
      ["02 מאי 2026", "80 שאלות · 2:48 שע׳", 41],
    ].map(([d, sub, score], i, a) => (
      <div key={i} style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 16px",
        borderBottom: i < a.length - 1 ? "1px solid var(--border-default)" : 0,
      }}>
        <div>
          <div style={{ font: "700 14px var(--font-body)" }}>{d}</div>
          <div style={{ font: "500 12px var(--font-body)",
            color: "var(--text-secondary)", marginTop: 2 }}>{sub}</div>
        </div>
        <div style={{ textAlign: "left" }}>
          <span className="eyebrow eyebrow-tight">ציון</span>
          <div className="tabular" style={{
            font: "900 24px var(--font-display)", color: "var(--ink)", lineHeight: 1, marginTop: 4,
          }}>{score}</div>
        </div>
      </div>
    ))}
  </section>
);

window.HomeV1 = HomeV1;

// ─────────────────────────────────────────────────────────────────────────────
// HOME V2 — "Masthead"
//
//  ▪ Strong newspaper-style top: hairline rule + date + ⋯
//  ▪ Greeting set as a serif masthead (44px) on cream paper.
//  ▪ Amber callout becomes a **prominent ribbon** under the masthead.
//    It's the most visually loud element by design.
//  ▪ The two-section "stats vs routes" split is collapsed: stats are
//    folded into a single full-width tile, then the 2-col matrix sits
//    directly above the routes so the user reads "where I am → what to do".
//  ▪ Active session: same treatment but the masthead row swaps the CTA
//    for the black resume card.
// ─────────────────────────────────────────────────────────────────────────────

const HomeV2 = () => (
  <Phone active="home" cream>
    {/* Masthead rule */}
    <div style={{
      margin: "8px 20px 0",
      borderBottom: "1px solid var(--ink)",
      paddingBottom: 8,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <span className="eyebrow eyebrow-tight" style={{ color: "var(--ink)" }}>{DEMO.date}</span>
      <button style={{ background: "transparent", border: 0, padding: 0, color: "var(--ink)" }}>
        <Icon name="more-horizontal" size={20} />
      </button>
    </div>

    {/* Masthead greeting */}
    <header style={{ padding: "18px 20px 0" }}>
      <h1 style={{
        font: "900 48px/0.95 var(--font-display)", color: "var(--ink)",
        margin: 0, letterSpacing: 0,
      }}>{DEMO.greeting}<span style={{ opacity: 0.3 }}>,</span></h1>
      <p style={{ font: "500 22px/1.3 var(--font-display)",
        color: "var(--text-secondary)", margin: "10px 0 0" }}>
        {DEMO.name}
      </p>
      <p style={{ font: "500 14px/1.6 var(--font-body)", color: "var(--text-secondary)",
        margin: "14px 0 0", maxWidth: 340 }}>
        יש לך {DEMO.mistakes} טעויות פתוחות לחזרה.
      </p>
    </header>

    {/* Twin-action row: primary CTA + amber ribbon as siblings, but ribbon
        gets equal width so it actually competes for attention. */}
    <div style={{ padding: "22px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
      <button className="btn-primary">התחל תרגול</button>
      <button className="amber-band" style={{
        borderWidth: 1, borderColor: "var(--amber-300)",
        boxShadow: "0 6px 18px rgba(146,64,14,0.06)",
      }}>
        <Icon name="circle-alert" size={20} sw={2.2} color="var(--amber-800)" />
        <span>חזרה על {DEMO.mistakes} טעויות פתוחות</span>
        <Icon name="arrow-left" size={18} color="var(--amber-800)"
          style={{ marginInlineStart: "auto" }} />
      </button>
    </div>

    {/* Section rule + routes */}
    <section style={{ padding: "30px 20px 0" }}>
      <div className="section-divider">
        <h2>מסלולי לימוד</h2>
        <span className="eyebrow eyebrow-tight">בחר כיוון</span>
      </div>
      <Route idx="01" icon="pencil-line"    title="תרגול חדש"     hint="בחר חלק, מועד וכמות שאלות" />
      <Route idx="02" icon="calendar-days"   title="בחינת מועד"    hint="בחר מועד בחינה רשמי" />
      <Route idx="03" icon="clipboard-list"  title="סימולציה מלאה" hint="80 שאלות אקראיות מכל המאגר" />
      <Route idx="04" icon="circle-alert"    title="חזרה על טעויות" hint={`${DEMO.mistakes} שאלות פתוחות לתרגול`} end={DEMO.mistakes} />
      <Route idx="05" icon="bookmark"        title="שאלות שסומנו"  hint={`${DEMO.bookmarks} סימניות שמורות`} end={DEMO.bookmarks} />
    </section>

    {/* Activity summary — full-width headline tile, then a 2-col grid */}
    <section style={{ padding: "28px 20px 0" }} aria-label="סיכום פעילות">
      <div className="section-divider" style={{ marginBottom: 14 }}>
        <h2>סיכום פעילות</h2>
        <span className="eyebrow eyebrow-tight tabular">{DEMO.correct}·{DEMO.wrong}</span>
      </div>

      <div style={{
        border: "1px solid var(--border-default)", borderRadius: "var(--radius-2xl)",
        background: "var(--surface)", padding: "18px 20px",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        <div>
          <span className="eyebrow eyebrow-tight">שאלות נענו</span>
          <div className="tabular" style={{
            font: "900 44px/1 var(--font-display)", color: "var(--ink)", marginTop: 10,
          }}>{DEMO.total}</div>
        </div>
        <div className="tabular" style={{ textAlign: "left",
          font: "500 13px var(--font-body)", color: "var(--text-secondary)" }}>
          <div>{DEMO.correct} נכונות</div>
          <div style={{ marginTop: 4 }}>{DEMO.wrong} שגויות</div>
        </div>
      </div>

      {/* The five other stats live inline as a horizontal scroll-like wrap */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: 10, marginTop: 10 }}>
        <V2Stat label="זמן לימוד"      value={DEMO.time}  mono />
        <V2Stat label="טעויות לחזרה"   value={`${DEMO.mistakes} פתוחות`} />
        <V2Stat label="תרגולים"         value={DEMO.practices} />
        <V2Stat label="מבחנים"           value={DEMO.exams} />
        <V2Stat label="סימולציות"       value={DEMO.simulations}
          style={{ gridColumn: "span 2" }} />
      </div>
    </section>

    {/* Part breakdown */}
    <section style={{ margin: "24px 20px 0", border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-2xl)", overflow: "hidden",
      background: "rgba(0,0,0,0.10)",
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
      <PartCell label="דין דיוני · חלק ב׳" rate={DEMO.partB.rate} answered={DEMO.partB.answered} />
      <PartCell label="דין מהותי · חלק ג׳" rate={DEMO.partC.rate} answered={DEMO.partC.answered} />
    </section>

    <SimHistoryV1 />
    <div style={{ height: 32 }} />
  </Phone>
);

const V2Stat = ({ label, value, mono, style }) => (
  <div style={{
    border: "1px solid var(--border-default)", borderRadius: 24,
    background: "var(--surface)", padding: "14px 16px",
    ...style,
  }}>
    <div className="eyebrow eyebrow-tight">{label}</div>
    <div className="tabular" style={{
      font: "900 26px var(--font-display)", color: "var(--ink)",
      lineHeight: 1, marginTop: 8,
    }}>{value}</div>
  </div>
);

window.HomeV2 = HomeV2;

// ─────────────────────────────────────────────────────────────────────────────
// HOME V3 — "Progress-first"
//
//  ▪ The hero shrinks: greeting is 28px, sits as a tight introduction line.
//  ▪ Right below the CTA, a single "Progress" composite card combines
//    the headline answered total + Part B/Part C success bars. This is
//    the answer to "stats grid disconnected from routes" — the user sees
//    *exactly where they stand* before being asked to pick a route.
//  ▪ Amber mistakes ribbon docks at the bottom of the progress card so it
//    inherits the elevation.
//  ▪ Stats grid shrinks to a single horizontal chip row at the bottom.
// ─────────────────────────────────────────────────────────────────────────────

const HomeV3 = () => (
  <Phone active="home" cream>
    <div style={{ padding: "10px 20px 0", display: "flex",
      alignItems: "center", justifyContent: "space-between" }}>
      <span className="eyebrow">{DEMO.date}</span>
      <button style={{ background: "transparent", border: 0, padding: 4, color: "var(--text-secondary)" }}>
        <Icon name="more-horizontal" size={20} />
      </button>
    </div>

    {/* Compact greeting */}
    <header style={{ padding: "12px 20px 0" }}>
      <h1 style={{
        font: "900 30px/1.1 var(--font-display)", color: "var(--ink)",
        margin: 0, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap",
      }}>
        <span>{DEMO.greeting}</span>
        <span style={{ font: "500 18px var(--font-display)", color: "var(--text-secondary)" }}>
          {DEMO.name}
        </span>
      </h1>
      <p style={{ font: "500 14px/1.5 var(--font-body)", color: "var(--text-secondary)",
        margin: "8px 0 0" }}>
        יש לך {DEMO.mistakes} טעויות פתוחות לחזרה.
      </p>
    </header>

    {/* Primary CTA */}
    <div style={{ padding: "18px 20px 0" }}>
      <button className="btn-primary">התחל תרגול</button>
    </div>

    {/* Progress composite — the centerpiece */}
    <section style={{
      margin: "20px 20px 0",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-2xl)",
      background: "var(--surface)",
      overflow: "hidden",
      boxShadow: "var(--shadow-default)",
    }}>
      {/* Top row — overall numbers */}
      <div style={{ padding: "18px 20px 14px",
        borderBottom: "1px solid var(--border-default)",
        display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <div className="eyebrow eyebrow-tight">סיכום פעילות</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <span className="tabular" style={{
              font: "900 40px/1 var(--font-display)", color: "var(--ink)",
            }}>{DEMO.total}</span>
            <span style={{ font: "500 13px var(--font-body)", color: "var(--text-secondary)" }}>
              שאלות נענו
            </span>
          </div>
          <div className="tabular" style={{ font: "500 12px var(--font-body)",
            color: "var(--text-secondary)", marginTop: 6 }}>
            {DEMO.correct} נכונות · {DEMO.wrong} שגויות
          </div>
        </div>
        <div style={{ textAlign: "left" }}>
          <div className="eyebrow eyebrow-tight">זמן לימוד</div>
          <div className="tabular" style={{
            font: "900 24px var(--font-display)", color: "var(--ink)", marginTop: 8,
          }}>{DEMO.time}</div>
        </div>
      </div>

      {/* Part breakdown as inline mini-bars */}
      <div style={{ padding: "16px 20px" }}>
        <PartBar label="דין דיוני · חלק ב׳" rate={DEMO.partB.rate} answered={DEMO.partB.answered} />
        <div style={{ height: 12 }} />
        <PartBar label="דין מהותי · חלק ג׳" rate={DEMO.partC.rate} answered={DEMO.partC.answered} />
      </div>

      {/* Amber ribbon docked at the bottom of the progress card */}
      <button className="amber-band" style={{
        borderRadius: 0, borderLeft: 0, borderRight: 0, borderBottom: 0,
        borderTop: "1px solid var(--amber-300)",
        width: "100%",
      }}>
        <Icon name="circle-alert" size={18} sw={2.2} color="var(--amber-800)" />
        <span>חזרה על {DEMO.mistakes} טעויות פתוחות</span>
        <Icon name="arrow-left" size={16} color="var(--amber-800)"
          style={{ marginInlineStart: "auto" }} />
      </button>
    </section>

    {/* Routes */}
    <section style={{ padding: "26px 20px 0" }}>
      <div className="section-divider">
        <h2>מסלולי לימוד</h2>
        <span className="eyebrow eyebrow-tight">בחר כיוון</span>
      </div>
      <Route idx="01" icon="pencil-line"    title="תרגול חדש"     hint="בחר חלק, מועד וכמות שאלות" />
      <Route idx="02" icon="calendar-days"   title="בחינת מועד"    hint="בחר מועד בחינה רשמי" />
      <Route idx="03" icon="clipboard-list"  title="סימולציה מלאה" hint="80 שאלות אקראיות מכל המאגר" />
      <Route idx="04" icon="circle-alert"    title="חזרה על טעויות" hint={`${DEMO.mistakes} שאלות פתוחות לתרגול`} end={DEMO.mistakes} />
      <Route idx="05" icon="bookmark"        title="שאלות שסומנו"  hint={`${DEMO.bookmarks} סימניות שמורות`} end={DEMO.bookmarks} />
    </section>

    {/* Compact secondary stats */}
    <section style={{ padding: "24px 20px 0" }}>
      <div className="eyebrow eyebrow-tight" style={{ marginBottom: 10 }}>סשנים שהושלמו</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8 }}>
        <V3Mini label="תרגולים"   value={DEMO.practices} />
        <V3Mini label="מבחנים"     value={DEMO.exams} />
        <V3Mini label="סימולציות" value={DEMO.simulations} />
      </div>
    </section>

    <SimHistoryV1 />
    <div style={{ height: 32 }} />
  </Phone>
);

const PartBar = ({ label, rate, answered }) => (
  <div>
    <div style={{ display: "flex", alignItems: "baseline",
      justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ font: "600 13px var(--font-body)", color: "var(--ink)" }}>{label}</span>
      <span className="tabular" style={{
        font: "900 18px var(--font-display)", color: "var(--ink)",
      }}>{rate}%</span>
    </div>
    <div style={{ height: 6, background: "rgba(0,0,0,0.08)",
      borderRadius: 9999, overflow: "hidden" }}>
      <div style={{ width: `${rate}%`, height: "100%",
        background: "var(--ink)", borderRadius: 9999 }} />
    </div>
    <div className="tabular" style={{ font: "500 11px var(--font-body)",
      color: "var(--text-tertiary)", marginTop: 4 }}>{answered} שאלות נענו</div>
  </div>
);
const V3Mini = ({ label, value }) => (
  <div style={{
    background: "var(--surface-muted)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 20, padding: "12px 14px", textAlign: "center",
  }}>
    <div className="tabular" style={{
      font: "900 24px var(--font-display)", color: "var(--ink)", lineHeight: 1,
    }}>{value}</div>
    <div className="eyebrow eyebrow-tight" style={{ marginTop: 6 }}>{label}</div>
  </div>
);

window.HomeV3 = HomeV3;
