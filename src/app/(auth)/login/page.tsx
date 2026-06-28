import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";
import { getCurrentUser } from "@/server/auth";
import { domainConfig } from "@/server/domain/config/domain.config";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{domainConfig.ui.appName}</CardTitle>
        <CardDescription>Zaloguj się do panelu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Nie masz konta?{" "}
          <Link href="/register" className="font-medium underline">
            Zarejestruj się
          </Link>
        </p>
        <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Konta testowe:</p>
          <p>admin@zpo.dev / admin123 — ADMIN</p>
          <p>anna@zpo.dev / user1234 — USER</p>
        </div>
      </CardContent>
    </Card>
  );
}
