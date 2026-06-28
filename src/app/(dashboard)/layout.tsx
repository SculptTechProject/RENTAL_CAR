import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/features/auth/logout-button";
import { getCurrentUser } from "@/server/auth";
import { domainConfig } from "@/server/domain/config/domain.config";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // SERVER-SIDE auth guard. Hiding nav links is cosmetic; this redirect (and
  // the per-endpoint requireUser/requireRole checks) is the real protection.
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold">
              {domainConfig.ui.appName}
            </Link>
            <nav className="hidden gap-4 text-sm sm:flex">
              <Link
                href="/cars"
                className="text-muted-foreground hover:text-foreground"
              >
                {domainConfig.resource.namePlural}
              </Link>
              <Link
                href="/reservations"
                className="text-muted-foreground hover:text-foreground"
              >
                {domainConfig.ui.myRequestsTitle}
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin/reservations"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Admin: {domainConfig.request.namePlural}
                  </Link>
                  <Link
                    href="/admin/cars"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Admin: flota
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm sm:inline">{user.name}</span>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {user.role}
            </Badge>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
