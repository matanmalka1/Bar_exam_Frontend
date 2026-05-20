import type { ReactNode } from "react";

interface FixedFooterProps {
  children: ReactNode;
}

const FixedFooter = ({ children }: FixedFooterProps) => (
  <div
    className="fixed inset-x-0 z-30 border-t border-[#e2d5c2] bg-white/90 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-10px_30px_rgba(79,31,64,0.08)] backdrop-blur"
    style={{ bottom: "var(--bottom-nav-h, 0px)" }}
  >
    <div className="mx-auto w-full max-w-[720px] space-y-1">{children}</div>
  </div>
);

export default FixedFooter;
