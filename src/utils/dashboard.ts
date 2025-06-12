import type { Role } from "@/types/auth";

/**
 * Get the dashboard URL for a specific role
 */
export function getDashboardUrl(role: Role): string {
  return `/dashboard/${role}`;
}

/**
 * Get the default dashboard URL (redirects to role-specific dashboard)
 */
export function getDefaultDashboardUrl(): string {
  return "/dashboard";
}

/**
 * Check if a path is a dashboard route
 */
export function isDashboardRoute(path: string): boolean {
  return path.startsWith("/dashboard");
}

/**
 * Get the role from a dashboard path
 */
export function getRoleFromPath(path: string): Role | null {
  const regex = /^\/dashboard\/(admin|leader|member)/;
  const match = regex.exec(path);
  return match ? (match[1] as Role) : null;
}

/**
 * Check if user has access to a specific dashboard route
 */
export function canAccessDashboardRoute(
  userRole: Role,
  routePath: string,
): boolean {
  const routeRole = getRoleFromPath(routePath);

  if (!routeRole) {
    return true; // Allow access to base dashboard route
  }

  switch (routeRole) {
    case "admin":
      return userRole === "admin";
    case "leader":
      return ["admin", "leader"].includes(userRole);
    case "member":
      return ["admin", "leader", "member"].includes(userRole);
    default:
      return false;
  }
}
