import type { ReactElement } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import {
  ActiveSessionsPage,
  BookmarksPage,
  ExamSessionPage,
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  MistakesPage,
  MorePage,
  PracticeNewPage,
  QuestionDetailPage,
  QuestionsPage,
  RegisterPage,
  ResetPasswordPage,
  ResultsPage,
  SessionPage,
  StatsPage,
  TermsPage,
} from "./lazyPages";
import RoutePageBoundary from "./RoutePageBoundary";
import Shell from "./Shell";

const withPageBoundary = (page: ReactElement) => (
  <RoutePageBoundary>{page}</RoutePageBoundary>
);

export const router = createBrowserRouter([
  { path: "/login", element: withPageBoundary(<LoginPage />) },
  { path: "/register", element: withPageBoundary(<RegisterPage />) },
  {
    path: "/forgot-password",
    element: withPageBoundary(<ForgotPasswordPage />),
  },
  {
    path: "/reset-password",
    element: withPageBoundary(<ResetPasswordPage />),
  },
  { path: "/terms", element: withPageBoundary(<TermsPage />) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Shell />,
        children: [
          { path: "/", element: withPageBoundary(<HomePage />) },
          {
            path: "/practice/new",
            element: withPageBoundary(<PracticeNewPage />),
          },
          { path: "/session/:id", element: withPageBoundary(<SessionPage />) },
          {
            path: "/session/:id/exam",
            element: withPageBoundary(<ExamSessionPage />),
          },
          {
            path: "/session/:id/results",
            element: withPageBoundary(<ResultsPage />),
          },
          {
            path: "/sessions/active",
            element: withPageBoundary(<ActiveSessionsPage />),
          },
          { path: "/mistakes", element: withPageBoundary(<MistakesPage />) },
          { path: "/bookmarks", element: withPageBoundary(<BookmarksPage />) },
          { path: "/stats", element: withPageBoundary(<StatsPage />) },
          { path: "/review", element: <Navigate to="/questions" replace /> },
          { path: "/questions", element: withPageBoundary(<QuestionsPage />) },
          {
            path: "/questions/:stableId",
            element: withPageBoundary(<QuestionDetailPage />),
          },
          {
            path: "/questions/:stableId/review",
            element: withPageBoundary(<QuestionDetailPage mode="review" />),
          },
          { path: "/more", element: withPageBoundary(<MorePage />) },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
