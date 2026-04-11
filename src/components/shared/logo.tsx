import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span className={cn("font-bold tracking-tight", sizes[size], className)}>
      <span className="text-primary-500">Ahiru</span>
      <span className="text-accent-500">Drop</span>
    </span>
  );
}
