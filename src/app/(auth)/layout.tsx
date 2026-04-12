import { Logo } from "@/components/shared/logo";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-950 px-4">
      <Link href="/" className="mb-8">
        <Logo size="lg" />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
