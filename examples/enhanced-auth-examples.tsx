import { requireAuthWithRole, isAdmin, getUserRole } from "@/utils/auth";
import { redirect } from "next/navigation";

// Example 1: Using requireAuthWithRole (throws error if not authorized)
export default async function SecurePage() {
  try {
    // This will throw an error if user doesn't have required role
    const session = await requireAuthWithRole(["admin", "leader"]);

    return (
      <div>
        <h1>Secure Page</h1>
        <p>Welcome, {session.user.name}!</p>
      </div>
    );
  } catch (error) {
    redirect("/auth/signin");
  }
}

// Example 2: Using role check functions
export async function AdminOnlyFunction() {
  if (!(await isAdmin())) {
    throw new Error("Admin access required");
  }

  // Admin-only logic here
  return "Admin function executed";
}

// Example 3: Conditional logic based on role
export async function ConditionalContent() {
  const userRole = await getUserRole();

  if (!userRole) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <h1>Content based on role</h1>

      {userRole === "admin" && <div>Admin-specific content</div>}

      {(userRole === "admin" || userRole === "leader") && (
        <div>Leadership content</div>
      )}

      {(userRole === "admin" ||
        userRole === "leader" ||
        userRole === "member") && <div>Member content</div>}
    </div>
  );
}
