import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

const Card = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-[#e6dcc9] bg-white/85 p-4 shadow-[0_10px_30px_rgba(79,31,64,0.07)]",
      className,
    )}
    {...rest}
  />
);

export default Card;
