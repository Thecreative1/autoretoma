import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logótipo tipográfico provisório. Sem símbolo — a identidade final
 * ainda não está definida.
 */
export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <Link
      href="/"
      className={cn(
        "font-heading text-xl font-extrabold tracking-tight sm:text-2xl",
        variant === "light" ? "text-white" : "text-brand-900",
        className
      )}
      aria-label="AutoRetoma — página inicial"
    >
      Auto<span className="text-accent-500">Retoma</span>
    </Link>
  );
}
