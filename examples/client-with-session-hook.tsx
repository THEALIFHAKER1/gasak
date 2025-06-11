"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientComponentWithHook() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Check role-specific access
    if (session.user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== "admin") {
    return null; // or redirect component
  }

  return (
    <div>
      <h1>Admin Client Component</h1>
      <p>Welcome, {session.user.name}!</p>
      <p>Your role: {session.user.role}</p>

      {/* Conditional rendering based on role */}
      {session.user.role === "admin" && (
        <button className="rounded bg-red-500 px-4 py-2 text-white">
          Admin Action
        </button>
      )}

      {["admin", "leader"].includes(session.user.role as string) && (
        <button className="rounded bg-blue-500 px-4 py-2 text-white">
          Leadership Action
        </button>
      )}
    </div>
  );
}
