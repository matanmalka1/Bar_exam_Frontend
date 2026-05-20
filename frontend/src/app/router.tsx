import { createBrowserRouter, Outlet, useLocation } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import PracticeNewPage from '../pages/PracticeNewPage'
import SessionPage from '../pages/SessionPage'
import ExamSessionPage from '../pages/ExamSessionPage'
import ResultsPage from '../pages/ResultsPage'
import MistakesPage from '../pages/MistakesPage'
import BookmarksPage from '../pages/BookmarksPage'
import MorePage from '../pages/MorePage'
import BottomNav from '../components/BottomNav'

const HIDE_NAV_PATTERNS: RegExp[] = [
  /^\/session\/[^/]+$/,
  /^\/session\/[^/]+\/exam$/,
  /^\/session\/[^/]+\/results$/,
]

function Shell() {
  const { pathname } = useLocation()
  const hideNav = HIDE_NAV_PATTERNS.some((re) => re.test(pathname))
  return (
    <div className="min-h-full flex flex-col">
      <main className={hideNav ? 'flex-1' : 'flex-1 pb-16'}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/practice/new', element: <PracticeNewPage /> },
      { path: '/session/:id', element: <SessionPage /> },
      { path: '/session/:id/exam', element: <ExamSessionPage /> },
      { path: '/session/:id/results', element: <ResultsPage /> },
      { path: '/mistakes', element: <MistakesPage /> },
      { path: '/bookmarks', element: <BookmarksPage /> },
      { path: '/more', element: <MorePage /> },
    ],
  },
])
