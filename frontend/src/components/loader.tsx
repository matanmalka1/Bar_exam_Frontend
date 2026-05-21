import clsx from "clsx";

type LoaderVariant =
  | "page"
  | "card"
  | "table"
  | "button"
  | "inline"
  | "list"
  | "form";

type AppLoaderProps = {
  variant?: LoaderVariant;
  label?: string;
  rows?: number;
  className?: string;
};

const AppLoader = ({
  variant = "inline",
  label = "טוען...",
  rows = 4,
  className,
}: AppLoaderProps) => {
  if (variant === "button") {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-2 text-sm font-medium",
          className
        )}
        aria-live="polite"
      >
        <span className="relative size-4 rounded-full border border-black/30">
          <span className="absolute inset-0 animate-loader-orbit rounded-full border border-transparent border-t-black" />
        </span>
        {label}
      </span>
    );
  }

  if (variant === "table") {
    return (
      <div className={clsx("space-y-3", className)} aria-live="polite">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-4 gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-[var(--shadow-default)]"
          >
            <SkeletonLine />
            <SkeletonLine className="col-span-2" />
            <SkeletonLine />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={clsx(
          "group relative overflow-hidden rounded-3xl border border-black/15 bg-[var(--paper)] p-5 shadow-[var(--shadow-default)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
          className
        )}
        aria-live="polite"
      >
        <LoaderGlow />

        <div className="relative space-y-4">
          <SkeletonLine className="h-5 w-1/2" />
          <SkeletonLine className="h-3 w-full" />
          <SkeletonLine className="h-3 w-4/5" />

          <div className="flex gap-2 pt-2">
            <SkeletonPill />
            <SkeletonPill className="w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={clsx("space-y-3", className)} aria-live="polite">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3"
          >
            <SkeletonOrb />

            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-3 w-2/3" />
              <SkeletonLine className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className={clsx("space-y-4", className)} aria-live="polite">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonLine className="h-3 w-24" />
            <SkeletonLine className="h-11 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div
        className={clsx(
          "grid min-h-[calc(100svh_-_var(--bottom-nav-h,0px))] place-items-center bg-[var(--surface)]",
          className
        )}
        aria-live="polite"
      >
        <div className="group relative flex flex-col items-center gap-5">
          <div className="relative size-24 rounded-[2rem] border border-black bg-[var(--paper)] shadow-[var(--shadow-elevated)] transition duration-300 group-hover:rotate-3">
            <span className="absolute inset-3 rounded-[1.4rem] border border-black/25" />

            <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black animate-loader-pulse" />

            <span className="absolute -top-2 left-1/2 size-3 -translate-x-1/2 rounded-full bg-black animate-loader-dot-1" />
            <span className="absolute bottom-2 -left-2 size-3 rounded-full bg-black animate-loader-dot-2" />
            <span className="absolute bottom-2 -right-2 size-3 rounded-full bg-black animate-loader-dot-3" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-black">{label}</p>
            <p className="mt-1 text-xs text-black/60">
              מסדרים את הנתונים בצורה נקייה
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <span
      className={clsx("inline-flex items-center gap-2 text-sm", className)}
      aria-live="polite"
    >
      <SkeletonOrb />
      <span className="text-black/70">{label}</span>
    </span>
  );
};

type LoaderPartProps = {
  className?: string;
};

const SkeletonLine = ({ className }: LoaderPartProps) => {
  return (
    <div
      className={clsx(
        "relative h-4 overflow-hidden rounded-full bg-black/10",
        className
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-loader-shimmer" />
    </div>
  );
};

const SkeletonPill = ({ className }: LoaderPartProps) => {
  return (
    <div
      className={clsx(
        "h-8 w-16 rounded-full border border-black/10 bg-black/10",
        className
      )}
    />
  );
};

const SkeletonOrb = () => {
  return (
    <span className="relative inline-flex size-8 rounded-full border border-black/20 bg-[var(--paper)]">
      <span className="absolute inset-1 rounded-full border border-black animate-loader-orbit" />
      <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
    </span>
  );
};

const LoaderGlow = () => {
  return (
    <div className="pointer-events-none absolute -inset-10 opacity-0 transition duration-300 group-hover:opacity-100">
      <div className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-2xl" />
    </div>
  );
};

export default AppLoader;
