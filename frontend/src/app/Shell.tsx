import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const HIDE_NAV_PATTERNS: RegExp[] = [
  /^\/session\/[^/]+$/,
  /^\/session\/[^/]+\/exam$/,
  /^\/session\/[^/]+\/results$/,
]

const Shell = () => {
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

export default Shell
