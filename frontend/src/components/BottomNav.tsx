import { NavLink } from "react-router-dom";
import { cn } from "../lib/cn";

const ITEMS: { to: string; label: string }[] = [
  { to: "/", label: "בית" },
  { to: "/practice/new", label: "תרגול" },
  { to: "/mistakes", label: "טעויות" },
  { to: "/bookmarks", label: "סימניות" },
  { to: "/more", label: "עוד" },
];

const BottomNav = () => (
  <nav
    className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white"
    aria-label="ניווט תחתון"
  >
    <ul className="grid grid-cols-5">
      {ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex h-16 items-center justify-center text-sm",
                isActive ? "text-blue-600 font-semibold" : "text-gray-600",
              )
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default BottomNav;
