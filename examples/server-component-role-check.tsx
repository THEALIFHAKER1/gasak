import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminOnlyPage() {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user has admin role
  if (session.user.role !== "admin") {
    redirect("/"); // or show unauthorized message
  }

  return (
    <div>
      <h1>Admin Only Content</h1>
      <p>Welcome, {session.user.name}!</p>
      <p>Your role: {session.user.role}</p>
    </div>
  );
}
