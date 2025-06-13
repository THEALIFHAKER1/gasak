import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If not authenticated, redirect to sign in
  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
