import { Link, useLocation } from "react-router-dom";
import type { RegisterRouteState } from "./RegisterPage";

type TermsSection = {
  title: string;
  body: string;
};

const sections: TermsSection[] = [
  {
    title: "קבלת התנאים",
    body: "השימוש במערכת מהווה הסכמה לתנאי שימוש אלה. אם אינך מסכים לתנאים, אין להשתמש במערכת.",
  },
  {
    title: "מטרת המערכת",
    body: "המערכת מיועדת לתרגול שאלות, סימולציות ומעקב לימודי לקראת בחינת לשכת עורכי הדין בישראל.",
  },
  {
    title: "חשבון משתמש",
    body: "עליך למסור פרטים נכונים בעת ההרשמה ולשמור על סודיות פרטי ההתחברות שלך. כל שימוש בחשבון שלך הוא באחריותך.",
  },
  {
    title: "שימוש מותר",
    body: "אין להעתיק, להפיץ, לשבש, לבצע שימוש מסחרי לא מורשה או לנסות לעקוף מנגנוני אבטחה והרשאות במערכת.",
  },
  {
    title: "תוכן לימודי",
    body: "התוכן במערכת נועד לסיוע בלמידה ובתרגול בלבד. אין לראות בו התחייבות לתוצאה בבחינה או תחליף לבדיקה עצמאית של הדין והנהלים העדכניים.",
  },
  {
    title: "זמינות ושינויים",
    body: "ייתכנו הפסקות שירות, עדכונים, שינויי תוכן או שינויי תכונות. נשתדל לשמור על שירות יציב, אך איננו מתחייבים לזמינות רציפה.",
  },
  {
    title: "פרטיות",
    body: "המידע שתמסור משמש להפעלת החשבון, שמירת התקדמות, אבטחה ושיפור חוויית השימוש במערכת.",
  },
  {
    title: "הגבלת אחריות",
    body: "השימוש במערכת הוא באחריות המשתמש. ככל שהדין מאפשר, לא נישא באחריות לנזק עקיף, אובדן מידע או הסתמכות על תוכן המערכת בלבד.",
  },
  {
    title: "עדכון התנאים",
    body: "אנו רשאים לעדכן את תנאי השימוש מעת לעת. המשך שימוש במערכת לאחר עדכון התנאים מהווה הסכמה לנוסח המעודכן.",
  },
];

const TermsPage = () => {
  const location = useLocation();
  const registerState = location.state as RegisterRouteState | null;

  return (
    <div dir="rtl" className="min-h-svh bg-[var(--paper)] text-[var(--ink)]">
      <main className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col px-5 py-6">
        <header className="mb-8 flex flex-col text-right">
          <span className="mb-1 text-[11px] font-medium uppercase leading-none tracking-[0.18em] text-secondary">
            מסמך שימוש
          </span>
          <h1 className="font-display text-3xl font-black leading-tight text-[var(--ink)]">
            תנאי שימוש
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            עודכן לאחרונה: 23.05.2026
          </p>
        </header>

        <div className="flex flex-col gap-3">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-[var(--border-default)] bg-white/75 p-4"
            >
              <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-secondary">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-auto pt-8 pb-4">
          <Link
            to="/register"
            state={registerState ?? undefined}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-black text-base font-bold text-white shadow-sm transition active:scale-95"
          >
            חזרה להרשמה
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default TermsPage;
