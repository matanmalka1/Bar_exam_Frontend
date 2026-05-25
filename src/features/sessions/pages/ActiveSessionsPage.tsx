import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../../components/AppHeader";
import AppLoader from "../../../components/loader";
import ErrorState from "../../../components/ErrorState";
import Button from "../../../components/Button";
import PageShell from "../../../components/PageShell";
import ActiveSessionCard from "../../dashboard/components/ActiveSessionCard";
import { listUserSessions, abandonSession } from "../api";
import { isResumableSession } from "../sessionFilters";
import type { SessionSummary } from "../types";
import { isExamLike } from "../types";
import { notifyError } from "../../../lib/toast";
import { extractApiError } from "../../../lib/api-errors";

type PageStatus = "loading" | "ready" | "error";

const resumePath = (session: SessionSummary): string =>
  isExamLike(session.mode)
    ? `/session/${session.id}/exam`
    : `/session/${session.id}`;

const ActiveSessionsPage = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadSessions = useCallback(async () => {
    setStatus("loading");

    try {
      const data = await listUserSessions("active");
      setSessions(data.filter(isResumableSession));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleAbandon = async (session: SessionSummary) => {
    if (!confirm("למחוק את התרגול? פעולה זו אינה הפיכה.")) return;

    setDeletingId(session.id);

    try {
      await abandonSession(session.id);
      setSessions((prev) => prev.filter((item) => item.id !== session.id));
    } catch (err) {
      notifyError(extractApiError(err, "לא ניתן למחוק את התרגול"));
    } finally {
      setDeletingId(null);
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
          action={<Button onClick={loadSessions}>נסה שוב</Button>}
        />
      )}

      {status === "ready" && sessions.length === 0 && (
        <p className="mt-8 text-center text-sm text-secondary">
          אין תרגולים פתוחים
        </p>
      )}

      {status === "ready" && sessions.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {sessions.map((session) => {
            const isDeleting = deletingId === session.id;

            return (
              <div key={session.id}>
                <ActiveSessionCard
                  session={session}
                  onResume={() => navigate(resumePath(session))}
                />

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleAbandon(session)}
                  className="mt-1 w-full text-center text-xs text-secondary underline underline-offset-2 disabled:opacity-40"
                >
                  {isDeleting ? "מוחק..." : "מחק תרגול"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default ActiveSessionsPage;
