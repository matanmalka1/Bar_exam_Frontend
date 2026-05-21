import type { CSSProperties } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";

const HIDE_NAV_PATTERNS: RegExp[] = [
  /^\/session\/[^/]+$/,
  /^\/session\/[^/]+\/exam$/,
  /^\/session\/[^/]+\/results$/,
];

interface ShellVars extends CSSProperties {
  "--bottom-nav-h": string;
}

const Shell = () => {
  const { pathname } = useLocation();
  const hideNav = HIDE_NAV_PATTERNS.some((re) => re.test(pathname));
  const style: ShellVars = {
    "--bottom-nav-h": hideNav
      ? "0px"
      : "calc(4rem + env(safe-area-inset-bottom))",
  };
  return (
    <div
      className="min-h-screen bg-[var(--paper)] text-[var(--ink)]"
      dir="rtl"
      style={style}
    >
      <main
        className={
          hideNav ? "min-h-screen" : "min-h-screen pb-[var(--bottom-nav-h)]"
        }
      >
        <Outlet />
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
};

export default Shell;
