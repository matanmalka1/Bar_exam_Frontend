import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import PracticeNewPage from "../pages/PracticeNewPage";
import SessionPage from "../pages/SessionPage";
import ExamSessionPage from "../pages/ExamSessionPage";
import ResultsPage from "../pages/ResultsPage";
import MistakesPage from "../pages/MistakesPage";
import BookmarksPage from "../pages/BookmarksPage";
import MorePage from "../pages/MorePage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../features/auth/LoginPage";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import RegisterPage from "../features/auth/RegisterPage"
import Shell from "./Shell";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
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
          { path: "/mistakes", element: <MistakesPage /> },
          { path: "/bookmarks", element: <BookmarksPage /> },
          { path: "/more", element: <MorePage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
