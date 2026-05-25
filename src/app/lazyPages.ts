import { lazy } from "react";

export const ActiveSessionsPage = lazy(
  () => import("../features/sessions/pages/ActiveSessionsPage"),
);
export const BookmarksPage = lazy(
  () => import("../features/bookmarks/pages/BookmarksPage"),
);
export const ExamSessionPage = lazy(
  () => import("../features/sessions/pages/ExamSessionPage"),
);
export const ForgotPasswordPage = lazy(
  () => import("../features/auth/ForgotPasswordPage"),
);
export const HomePage = lazy(
  () => import("../features/dashboard/pages/HomePage"),
);
export const LoginPage = lazy(() => import("../features/auth/LoginPage"));
export const MistakesPage = lazy(
  () => import("../features/mistakes/pages/MistakesPage"),
);
export const MorePage = lazy(() => import("../features/auth/pages/MorePage"));
export const PracticeNewPage = lazy(
  () => import("../features/sessions/pages/PracticeNewPage"),
);
export const QuestionDetailPage = lazy(
  () => import("../features/questions/pages/QuestionDetailPage"),
);
export const QuestionsPage = lazy(
  () => import("../features/questions/pages/QuestionsPage"),
);
export const RegisterPage = lazy(() => import("../features/auth/RegisterPage"));
export const ResetPasswordPage = lazy(
  () => import("../features/auth/ResetPasswordPage"),
);
export const ResultsPage = lazy(
  () => import("../features/sessions/pages/ResultsPage"),
);
export const SessionPage = lazy(
  () => import("../features/sessions/pages/SessionPage"),
);
export const StatsPage = lazy(
  () => import("../features/stats/pages/StatsPage"),
);
export const TermsPage = lazy(() => import("../features/auth/TermsPage"));
