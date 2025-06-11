"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@/types/auth";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function isValidRole(role: unknown): role is Role {
  return (
    typeof role === "string" && ["admin", "leader", "member"].includes(role)
  );
}

function hasValidRole(
  session: { user?: { role?: unknown } } | null,
  allowedRoles: Role[],
): boolean {
  if (!session?.user?.role) return false;
  if (!isValidRole(session.user.role)) return false;
  return allowedRoles.includes(session.user.role);
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!hasValidRole(session, allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
