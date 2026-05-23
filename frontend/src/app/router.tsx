import { createBrowserRouter } from "react-router-dom";
import HomePage from "../features/dashboard/pages/HomePage";
import PracticeNewPage from "../features/sessions/pages/PracticeNewPage";
import ActiveSessionsPage from "../features/sessions/pages/ActiveSessionsPage";
import SessionPage from "../features/sessions/pages/SessionPage";
import ExamSessionPage from "../features/sessions/pages/ExamSessionPage";
import ResultsPage from "../features/sessions/pages/ResultsPage";
import MistakesPage from "../features/mistakes/pages/MistakesPage";
import BookmarksPage from "../features/bookmarks/pages/BookmarksPage";
import MorePage from "../features/auth/pages/MorePage";
import NotFoundPage from "./NotFoundPage";
import ForgotPasswordPage from "../features/auth/ForgotPasswordPage";
import LoginPage from "../features/auth/LoginPage";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import RegisterPage from "../features/auth/RegisterPage";
import ResetPasswordPage from "../features/auth/ResetPasswordPage";
import TermsPage from "../features/auth/TermsPage";
import Shell from "./Shell";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/terms", element: <TermsPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Shell />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/practice/new", element: <PracticeNewPage /> },
          { path: "/session/:id", element: <SessionPage /> },
          { path: "/session/:id/exam", element: <ExamSessionPage /> },
          { path: "/session/:id/results", element: <ResultsPage /> },
          { path: "/sessions/active", element: <ActiveSessionsPage /> },
          { path: "/mistakes", element: <MistakesPage /> },
          { path: "/bookmarks", element: <BookmarksPage /> },
          { path: "/more", element: <MorePage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
