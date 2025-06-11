# 🔐 Role-Based Access Control Guide

This guide shows you how to determine user roles and implement role-based access control in your GASAK app.

## 📋 Available Roles

```typescript
type Role = "admin" | "leader" | "member";
```

- **admin**: Full system access
- **leader**: Team management access  
- **member**: Basic user access

## 🔧 Server-Side Role Checking

### Method 1: Direct Auth Usage

```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }
  
  if (session.user.role !== "admin") {
    redirect("/");
  }
  
  return <div>Admin content</div>;
}
```

### Method 2: Using Auth Utilities

```typescript
import { requireAuthWithRole } from "@/utils/auth";

export default async function LeaderPage() {
  try {
    const session = await requireAuthWithRole(["admin", "leader"]);
    return <div>Leadership content for {session.user.name}</div>;
  } catch {
    redirect("/auth/signin");
  }
}
```

### Method 3: Role Check Functions

```typescript
import { isAdmin, getUserRole } from "@/utils/auth";

export default async function ConditionalPage() {
  const userRole = await getUserRole();
  const adminAccess = await isAdmin();
  
  return (
    <div>
      <p>Your role: {userRole}</p>
      {adminAccess && <AdminPanel />}
    </div>
  );
}
```

## 🎨 Client-Side Role Checking

### Method 1: RoleGuard Component

```typescript
"use client";

import { RoleGuard } from "@/components/role-guard";

export default function ClientPage() {
  return (
    <div>
      {/* Admin only */}
      <RoleGuard allowedRoles={["admin"]}>
        <AdminSection />
      </RoleGuard>
      
      {/* Leader and Admin */}
      <RoleGuard allowedRoles={["admin", "leader"]}>
        <LeadershipSection />
      </RoleGuard>
      
      {/* All users */}
      <RoleGuard allowedRoles={["admin", "leader", "member"]}>
        <MemberSection />
      </RoleGuard>
    </div>
  );
}
```

### Method 2: useSession Hook

```typescript
"use client";

import { useSession } from "next-auth/react";

export default function ClientComponent() {
  const { data: session } = useSession();
  
  if (!session) return <LoginPrompt />;
  
  const userRole = session.user.role;
  
  return (
    <div>
      {userRole === "admin" && <AdminTools />}
      {["admin", "leader"].includes(userRole) && <LeaderTools />}
      <UserProfile user={session.user} />
    </div>
  );
}
```

## 🚀 API Route Protection

```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  
  // Check authentication
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Check role
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  return NextResponse.json({ data: "Admin data" });
}
```

## 🛠️ Available Utility Functions

```typescript
// Auth utilities from @/utils/auth
export function hasRole(userRole: Role, requiredRoles: Role[]): boolean
export function canAccessAdminRoutes(userRole: Role): boolean
export function canAccessLeaderRoutes(userRole: Role): boolean
export function canAccessMemberRoutes(userRole: Role): boolean

export async function getServerAuthSession()
export async function requireAuth()
export async function requireAuthWithRole(requiredRoles: Role[])
export async function getUserRole(): Promise<Role | null>
export async function isAdmin(): Promise<boolean>
export async function isLeader(): Promise<boolean>
export async function isMember(): Promise<boolean>
```

## 📝 Best Practices

### 1. Server Components (Recommended for Security)
- Use server components for sensitive content
- Role checks happen on the server
- SEO-friendly and secure

### 2. Client Components (For Interactive UI)
- Use for dynamic UI that depends on user role
- Good for conditional rendering
- Always validate on server-side too

### 3. API Routes
- Always check authentication and authorization
- Return appropriate HTTP status codes
- Use consistent error messages

### 4. Middleware (Route-Level Protection)
- Already implemented in `middleware.ts`
- Automatic route protection based on URL patterns
- Redirects unauthorized users

## 🧪 Testing Different Roles

Use these test accounts:

```bash
# Admin access
Email: admin@gasak.com
Password: admin123

# Leader access  
Email: leader@gasak.com
Password: leader123

# Member access
Email: member@gasak.com
Password: member123
```

## ⚡ Quick Examples

### Simple Role Check
```typescript
const session = await auth();
const isUserAdmin = session?.user?.role === "admin";
```

### Multiple Role Check
```typescript
const allowedRoles = ["admin", "leader"];
const hasAccess = allowedRoles.includes(session?.user?.role);
```

### With Error Handling
```typescript
try {
  await requireAuthWithRole(["admin"]);
  // Admin logic here
} catch (error) {
  redirect("/auth/signin");
}
```
