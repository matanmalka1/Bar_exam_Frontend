import { Bookmark, CircleAlert, Home, MoreHorizontal, PencilLine } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/cn";

const ITEMS = [
  { to: "/", label: "בית", icon: Home },
  { to: "/practice/new", label: "תרגול", icon: PencilLine },
  { to: "/mistakes", label: "טעויות", icon: CircleAlert },
  { to: "/bookmarks", label: "סימניות", icon: Bookmark },
  { to: "/more", label: "עוד", icon: MoreHorizontal },
] as const;

const BottomNav = () => (
  <nav
    className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
    aria-label="ניווט תחתון"
  >
    <ul className="grid grid-cols-5 px-1 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1">
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "group relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                isActive
                  ? "text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "absolute top-1 h-1 w-6 rounded-full transition-opacity",
                    isActive ? "bg-blue-600 opacity-100" : "opacity-0",
                  )}
                />

                <Icon
                  className={cn(
                    "mt-1 size-5 transition-transform",
                    isActive && "scale-110",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />

                <span className={cn(isActive && "font-semibold")}>{label}</span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default BottomNav;
