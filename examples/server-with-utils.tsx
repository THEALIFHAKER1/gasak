import { getServerAuthSession, canAccessAdminRoutes } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (
    !canAccessAdminRoutes(session.user.role as "admin" | "leader" | "member")
  ) {
    redirect("/");
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>
        User: {session.user.name} ({session.user.role})
      </p>
    </div>
  );
}
