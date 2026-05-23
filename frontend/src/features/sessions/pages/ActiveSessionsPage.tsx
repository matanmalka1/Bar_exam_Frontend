import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../../components/AppHeader";
import AppLoader from "../../../components/loader";
import ErrorState from "../../../components/ErrorState";
import Button from "../../../components/Button";
import PageShell from "../../../components/PageShell";
import ActiveSessionCard from "../../dashboard/components/ActiveSessionCard";
import { listUserSessions, abandonSession } from "../api";
import type { SessionSummary } from "../types";
import { isExamLike } from "../types";
import { notifyError } from "../../../lib/toast";
import { extractApiError } from "../../../lib/api-errors";

const resumePath = (s: SessionSummary): string =>
  isExamLike(s.mode)
    ? `/session/${s.id}/exam`
    : `/session/${s.id}`;

const ActiveSessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => {
    setStatus("loading");
    listUserSessions("active")
      .then((data) => {
        setSessions(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    listUserSessions("active")
      .then((data) => {
        setSessions(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const handleAbandon = async (s: SessionSummary) => {
    if (!confirm("למחוק את התרגול? פעולה זו אינה הפיכה.")) return;
    setDeleting(s.id);
    try {
      await abandonSession(s.id);
      setSessions((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      notifyError(extractApiError(err, "לא ניתן למחוק את התרגול"));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <PageShell>
      <AppHeader
        back={{ label: "חזרה", onClick: () => navigate(-1) }}
        title="תרגולים פתוחים"
      />

      <p className="mt-2 text-sm leading-6 text-secondary">
        כל התרגולים שהתחלת ולא סיימת. המשך מאיפה שעצרת, או מחק תרגולים שאינך
        צריך.
      </p>

      {status === "loading" && <AppLoader variant="page" label="טוען..." />}

      {status === "error" && (
        <ErrorState
          message="לא ניתן לטעון תרגולים פתוחים"
          action={<Button onClick={load}>נסה שוב</Button>}
        />
      )}

      {status === "ready" && sessions.length === 0 && (
        <p className="mt-8 text-center text-sm text-secondary">
          אין תרגולים פתוחים
        </p>
      )}

      {status === "ready" && sessions.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {sessions.map((s) => (
            <div key={s.id}>
              <ActiveSessionCard
                session={s}
                onResume={() => navigate(resumePath(s))}
              />
              <button
                type="button"
                disabled={deleting === s.id}
                onClick={() => handleAbandon(s)}
                className="mt-1 w-full text-center text-xs text-secondary underline underline-offset-2 disabled:opacity-40"
              >
                {deleting === s.id ? "מוחק..." : "מחק תרגול"}
              </button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default ActiveSessionsPage;
