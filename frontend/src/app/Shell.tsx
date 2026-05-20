import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";

const HIDE_NAV_PATTERNS: RegExp[] = [
  /^\/session\/[^/]+$/,
  /^\/session\/[^/]+\/exam$/,
  /^\/session\/[^/]+\/results$/,
];

const Shell = () => {
  const { pathname } = useLocation();
  const hideNav = HIDE_NAV_PATTERNS.some((re) => re.test(pathname));
  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <main className={hideNav ? "min-h-screen" : "min-h-screen pb-20"}>
        <Outlet />
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
};

export default Shell;
