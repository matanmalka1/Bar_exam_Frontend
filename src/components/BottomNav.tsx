import { ChartBar, CircleAlert, Home, MoreHorizontal } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/cn";
import { tap } from "../lib/haptics";

const ITEMS = [
  { to: "/", label: "בית", icon: Home },
  { to: "/mistakes", label: "טעויות", icon: CircleAlert },
  { to: "/stats", label: "סטטיסטיקות", icon: ChartBar },
  { to: "/more", label: "פרופיל", icon: MoreHorizontal },
] as const;

const matchIndex = (pathname: string) => {
  const idx = ITEMS.findIndex(({ to }) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to),
  );
  return idx === -1 ? 0 : idx;
};

const BottomNav = () => {
  const { pathname } = useLocation();
  const activeIndex = matchIndex(pathname);

  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const mobilePuckRef = useRef<HTMLDivElement>(null);
  const desktopPuckRef = useRef<HTMLDivElement>(null);
  const [puck, setPuck] = useState({ left: 0, width: 0 });

  // Measure in UNSCALED layout pixels so puck lands correctly under ancestor transforms.
  // RTL: offsetLeft is measured from the left edge even in RTL layout, so we
  // convert to a right-to-left translateX by computing the offset from the right.
  useLayoutEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (!el) return;
    const parent = el.offsetParent as HTMLElement | null;
    const parentWidth = parent?.offsetWidth ?? 0;
    const w = el.offsetWidth;
    // Distance from the right edge of the parent to the right edge of the item.
    const right = parentWidth - el.offsetLeft - w;
    setPuck({ left: right, width: w });
  }, [activeIndex]);

  // Enable slide transition only after first paint to avoid stuck initial transition.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mobilePuckRef.current?.classList.add("is-ready");
        desktopPuckRef.current?.classList.add("is-ready");
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[env(safe-area-inset-bottom)] sm:pb-0"
      aria-label="ניווט תחתון"
    >
      <div
        className={cn(
          "pointer-events-auto relative h-16 px-1.5 overflow-hidden",
          // Mobile: floating pill
          "w-[calc(100%-1.75rem)] max-w-[380px] rounded-full mb-3.5",
          // Desktop: full-width flat bar
          "sm:w-full sm:max-w-none sm:rounded-none sm:mb-0 sm:px-0",
          // Frosted-glass material
          "bg-gradient-to-b from-white/55 to-white/30",
          "backdrop-blur-2xl backdrop-saturate-[180%]",
          // Mobile: floating shadows; Desktop: top hairline only
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(255,255,255,0.35),inset_0_0_0_1px_rgba(255,255,255,0.18),0_12px_30px_-10px_rgba(20,16,8,0.18),0_30px_60px_-20px_rgba(20,16,8,0.22)]",
          "sm:shadow-[0_-1px_0_rgba(20,16,8,0.10),inset_0_1px_0_rgba(255,255,255,0.60)]",
        )}
      >
        {/* Mobile puck: full dark pill that slides under active item */}
        <div
          ref={mobilePuckRef}
          aria-hidden="true"
          className={cn(
            "sm:hidden",
            "absolute right-0 top-1/2 h-[52px] rounded-full mx-1",
            "bg-gradient-to-b from-[var(--accent-ink)] to-[#2c2413]",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.35),0_6px_14px_-4px_rgba(20,16,8,0.45)]",
            "[&.is-ready]:transition-transform [&.is-ready]:duration-[420ms] [&.is-ready]:ease-[cubic-bezier(0.34,1.3,0.45,1)]",
          )}
          style={{
            width: puck.width,
            transform: `translateY(-50%) translateX(${-puck.left}px)`,
          }}
        />

        <ul className="relative z-10 mx-auto flex h-full w-full max-w-3xl">
          {/* Desktop indicator sits inside ul so offsetLeft is relative to the same parent */}
          <div
            ref={desktopPuckRef}
            aria-hidden="true"
            className={cn(
              "hidden sm:block",
              "absolute top-0 right-0 h-[3px] rounded-b-sm",
              "bg-[var(--accent-ink)]",
              "[&.is-ready]:transition-transform [&.is-ready]:duration-[420ms] [&.is-ready]:ease-[cubic-bezier(0.34,1.3,0.45,1)]",
            )}
            style={{
              width: puck.width,
              transform: `translateX(${-puck.left}px)`,
            }}
          />
          {ITEMS.map(({ to, label, icon: Icon }, i) => (
            <li key={to} className="flex flex-1">
              <NavLink
                to={to}
                end={to === "/"}
                onClick={() => tap()}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={({ isActive }) =>
                  cn(
                    "focus-ring relative flex w-full flex-col items-center justify-center gap-[3px] rounded-full text-[10.5px] transition-colors duration-200",
                    "active:scale-95",
                    "sm:rounded-none sm:text-[11px]",
                    isActive
                      ? [
                          "font-semibold",
                          "max-sm:text-white", // mobile: white on dark puck
                          "sm:text-[var(--accent-ink)]", // desktop: accent color
                        ]
                      : "font-medium text-[rgba(20,16,8,0.55)] hover:text-[rgba(20,16,8,0.85)]",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className="size-5"
                      strokeWidth={isActive ? 2.2 : 1.8}
                      aria-hidden="true"
                    />
                    <span className="leading-none">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default BottomNav;
