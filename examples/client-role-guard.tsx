"use client";

import { RoleGuard } from "@/components/role-guard";

export default function ClientPage() {
  return (
    <div>
      <h1>Public Content</h1>
      <p>Everyone can see this content.</p>

      {/* Admin only content */}
      <RoleGuard
        allowedRoles={["admin"]}
        fallback={<p>You need admin access to see this section.</p>}
      >
        <div className="rounded bg-red-100 p-4">
          <h2>Admin Only Section</h2>
          <p>This content is only visible to admins.</p>
        </div>
      </RoleGuard>

      {/* Leader and Admin content */}
      <RoleGuard
        allowedRoles={["admin", "leader"]}
        fallback={<p>You need leader or admin access.</p>}
      >
        <div className="rounded bg-blue-100 p-4">
          <h2>Leadership Section</h2>
          <p>This content is visible to leaders and admins.</p>
        </div>
      </RoleGuard>

      {/* All authenticated users */}
      <RoleGuard
        allowedRoles={["admin", "leader", "member"]}
        fallback={<p>Please log in to see this content.</p>}
      >
        <div className="rounded bg-green-100 p-4">
          <h2>Member Section</h2>
          <p>This content is visible to all authenticated users.</p>
        </div>
      </RoleGuard>
    </div>
  );
}
