import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/features/auth/register-form";
import { getCurrentUser } from "@/server/auth";
import { domainConfig } from "@/server/domain/config/domain.config";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{domainConfig.ui.appName}</CardTitle>
        <CardDescription>Załóż nowe konto (rola USER)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          Masz już konto?{" "}
          <Link href="/login" className="font-medium underline">
            Zaloguj się
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
