import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/types/auth";

export default async function DashboardPage() {
  const session = await auth();

  // If not authenticated, redirect to sign in
  if (!session) {
    redirect("/auth/signin");
  }

  // If authenticated, redirect to role-specific dashboard
  const userRole: Role = session.user.role;

  switch (userRole) {
    case "admin":
      redirect("/dashboard/admin");
      break;
    case "leader":
      redirect("/dashboard/leader");
      break;
    case "member":
      redirect("/dashboard/member");
      break;
    default:
      // Fallback to member dashboard for unknown roles
      redirect("/dashboard/member");
      break;
  }
}
