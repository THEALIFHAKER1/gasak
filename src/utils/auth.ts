import { auth } from "@/auth";
import type { Role } from "@/types/auth";

export async function getServerAuthSession() {
  return await auth();
}

export function hasRole(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole);
}

export function canAccessAdminRoutes(userRole: Role): boolean {
  return hasRole(userRole, ["admin"]);
}

export function canAccessLeaderRoutes(userRole: Role): boolean {
  return hasRole(userRole, ["admin", "leader"]);
}

export function canAccessMemberRoutes(userRole: Role): boolean {
  return hasRole(userRole, ["admin", "leader", "member"]);
}

// Enhanced role checking functions
export function requireRole(userRole: Role, requiredRoles: Role[]): void {
  if (!hasRole(userRole, requiredRoles)) {
    throw new Error(
      `Access denied. Required roles: ${requiredRoles.join(", ")}`,
    );
  }
}

export async function requireAuth() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  return session;
}

export async function requireAuthWithRole(requiredRoles: Role[]) {
  const session = await requireAuth();
  const userRole = session.user.role;
  requireRole(userRole, requiredRoles);
  return session;
}

// Utility to get user role safely
export async function getUserRole(): Promise<Role | null> {
  const session = await getServerAuthSession();
  return session?.user?.role ?? null;
}

// Check if user is specific role
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}

export async function isLeader(): Promise<boolean> {
  const role = await getUserRole();
  return role === "leader";
}

export async function isMember(): Promise<boolean> {
  const role = await getUserRole();
  return role === "member";
}
