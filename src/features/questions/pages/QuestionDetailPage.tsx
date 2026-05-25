import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Eye } from "lucide-react";
import AppHeader from "../../../components/AppHeader";
import AppLoader from "../../../components/loader";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ErrorState from "../../../components/ErrorState";
import OptionCard from "../../../components/OptionCard";
import PageShell from "../../../components/PageShell";
import QuestionMeta from "../../../components/QuestionMeta";
import ReferenceBox from "../../../components/ReferenceBox";
import type { AnswerOption } from "../../sessions/types";
import { useQuestionDetail } from "../hooks/useQuestionDetail";
import type { PracticeQuestion, ReviewQuestionDetail } from "../types";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const InvalidationNote = ({ note }: { note: string | null | undefined }) =>
  note ? (
    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
      {note}
    </p>
  ) : null;

const hasReviewAnswer = (
  question: PracticeQuestion | ReviewQuestionDetail,
): question is ReviewQuestionDetail => "correct_answer" in question;

type QuestionDetailPageProps = {
  mode?: "practice" | "review";
};

const BrowseBody = ({ question }: { question: PracticeQuestion }) => (
  <Card className="space-y-4">
    <QuestionMeta
      number={question.number}
      examDate={question.exam_date}
      part={question.part}
    />

    <InvalidationNote note={question.invalidation_note} />

    <p className="whitespace-pre-wrap text-[17px] leading-[1.85] text-primary">
      {question.body}
    </p>

    <div className="grid gap-2">
      {OPTIONS.map((option) => (
        <OptionCard
          key={option}
          mode="review"
          label={option}
          text={question.options[option]}
        />
      ))}
    </div>
  </Card>
);

const ReviewBody = ({ question }: { question: ReviewQuestionDetail }) => {
  const [revealed, setRevealed] = useState(false);
  const reference = question.reference?.trim();
  const isInvalidated = !!question.invalidation_note;

  return (
    <Card className="space-y-4">
      <QuestionMeta
        number={question.number}
        examDate={question.exam_date}
        part={question.part}
      />

      <InvalidationNote note={question.invalidation_note} />

      <p className="whitespace-pre-wrap text-[17px] leading-[1.85] text-primary">
        {question.body}
      </p>

      <div className="grid gap-2">
        {OPTIONS.map((option) => (
          <OptionCard
            key={option}
            mode="review"
            label={option}
            text={question.options[option]}
            isCorrect={
              !isInvalidated && revealed && question.correct_answer === option
            }
            showCorrectBadge={!isInvalidated && revealed}
          />
        ))}
      </div>

      {!isInvalidated && !revealed && (
        <Button onClick={() => setRevealed(true)} className="w-full">
          <Eye className="h-4 w-4" strokeWidth={2} />
          הצג תשובה נכונה
        </Button>
      )}

      {!isInvalidated && revealed && reference && (
        <ReferenceBox reference={reference} />
      )}

      {!isInvalidated && revealed && (
        <button
          type="button"
          onClick={() => setRevealed(false)}
          className="inline-flex items-center gap-1 px-1 py-1 text-xs font-medium text-secondary transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/30"
        >
          הסתר תשובה
        </button>
      )}
    </Card>
  );
};

const QuestionDetailPage = ({ mode = "practice" }: QuestionDetailPageProps) => {
  const { stableId } = useParams();
  const { status, question, retry } = useQuestionDetail(stableId, mode);
  const title =
    status === "ready" && question
      ? `שאלה ${question.number}`
      : mode === "review"
        ? "עיון בשאלה"
        : "שאלה";

  return (
    <PageShell className="pb-8">
      <div className="space-y-4">
        <AppHeader
          title={title}
          back={{}}
          actions={
            status === "ready" && question ? (
              mode === "review" ? (
                <Link
                  to={`/questions/${question.stable_id}`}
                  className="focus-ring inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium text-secondary transition hover:text-primary"
                >
                  ללא תשובה
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.3} />
                </Link>
              ) : (
                <Link
                  to={`/questions/${question.stable_id}/review`}
                  className="focus-ring inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium text-secondary transition hover:text-primary"
                >
                  עיון ותשובה
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.3} />
                </Link>
              )
            ) : undefined
          }
        />

        {status === "loading" && <AppLoader variant="list" rows={3} />}

        {status === "error" && (
          <ErrorState
            message="לא ניתן לטעון את השאלה"
            action={<Button onClick={retry}>נסה שוב</Button>}
          />
        )}

        {status === "ready" && question && mode === "practice" && (
          <BrowseBody question={question as PracticeQuestion} />
        )}

        {status === "ready" &&
          question &&
          mode === "review" &&
          hasReviewAnswer(question) && <ReviewBody question={question} />}
      </div>
    </PageShell>
  );
};

export default QuestionDetailPage;
