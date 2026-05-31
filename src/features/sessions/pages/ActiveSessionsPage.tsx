import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import AppHeader from "../../../components/AppHeader";
import AppLoader from "../../../components/loader";
import ErrorState from "../../../components/ErrorState";
import Button from "../../../components/Button";
import PageShell from "../../../components/PageShell";
import ActiveSessionCard from "../../dashboard/components/ActiveSessionCard";
import { abandonSession } from "../api";
import { isResumableSession } from "../sessionFilters";
import type { SessionSummary } from "../types";
import { isExamLike } from "../types";
import { notifyError } from "../../../lib/toast";
import { extractApiError } from "../../../lib/api-errors";
import { useUserSessions, sessionsQueryKey } from "../useUserSessions";
import { useState } from "react";

type PageStatus = "loading" | "ready" | "error";

const resumePath = (session: SessionSummary): string =>
  isExamLike(session.mode)
    ? `/session/${session.id}/exam`
    : `/session/${session.id}`;

const ActiveSessionsPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useUserSessions("active");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const sessions = (data ?? []).filter(isResumableSession);

  const status: PageStatus = isLoading ? "loading" : isError ? "error" : "ready";

  const handleAbandon = async (session: SessionSummary) => {
    if (!confirm("למחוק את התרגול? פעולה זו אינה הפיכה.")) return;

    setDeletingId(session.id);

    try {
      await abandonSession(session.id);
      void qc.invalidateQueries({ queryKey: sessionsQueryKey("active") });
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
          action={<Button onClick={() => qc.invalidateQueries({ queryKey: sessionsQueryKey("active") })}>נסה שוב</Button>}
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
