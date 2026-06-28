import { redirect } from "next/navigation";

// Entry point: send everyone to the dashboard. The (dashboard) layout will
// bounce unauthenticated users to /login.
export default function Home() {
  redirect("/dashboard");
}
