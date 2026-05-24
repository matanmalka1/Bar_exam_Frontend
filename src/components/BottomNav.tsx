import {
  ChartBar,
  CircleAlert,
  Home,
  MoreHorizontal,
  PencilLine,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/cn";
import { tap } from "../lib/haptics";

const ITEMS = [
  { to: "/", label: "בית", icon: Home },
  { to: "/practice/new", label: "תרגול", icon: PencilLine },
  { to: "/mistakes", label: "טעויות", icon: CircleAlert },
  { to: "/stats", label: "סטטיסטיקות", icon: ChartBar },
  { to: "/more", label: "פרופיל", icon: MoreHorizontal },
] as const;

const BottomNav = () => (
  <nav
    className="fixed inset-x-0 bottom-0 z-40 border-t border-default bg-white/85 shadow-[0_-10px_30px_rgba(0,0,0,0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-white/70"
    aria-label="ניווט תחתון"
  >
    <ul className="grid grid-cols-5 px-1 pb-[calc(env(safe-area-inset-bottom)_+_0.25rem)] pt-1.5">
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={to === "/"}
            onClick={() => tap()}
            className={({ isActive }) =>
              cn(
                "focus-ring group relative flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] transition-colors duration-200",
                "active:scale-95",
                isActive ? "text-primary" : "text-secondary hover:text-primary",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "inline-flex h-9 w-12 items-center justify-center rounded-full transition-all duration-300 ease-out",
                    isActive
                      ? "bg-[var(--accent-ink)] shadow-sm"
                      : "bg-transparent group-hover:bg-[var(--surface-muted)]",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 transition-colors duration-200",
                      isActive ? "text-white" : "text-current",
                    )}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    aria-hidden="true"
                  />
                </span>

                <span
                  className={cn(
                    "leading-none transition-[font-weight,color] duration-200",
                    isActive ? "font-semibold" : "font-medium",
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default BottomNav;
