"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageContainer from "@/components/layout/page-container";
import { AdminStats } from "@/components/dashboard/admin-stats";
// import { ActionCard } from "@/components/ui/action-card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import {} from // IconUsers,
// IconTournament,
// IconChartBar,
// IconSettings,
// IconShield,
// IconEye,
"@tabler/icons-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Heading
          title="Welcome back, Admin! 👋"
          description="Manage your esports organization and oversee all operations."
        />
      </div>

      <AdminStats />

      <Separator />

      {/* Management Sections */}
      {/* <div className="space-y-6">
        <Heading
          title="Management Center"
          description="Administer users, teams, and tournaments"
          variant="h3"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            title="User Management"
            description="Manage user accounts, roles, and permissions"
            icon={<IconUsers className="h-5 w-5" />}
            stats={[
              { label: "Total Users", value: "1,234" },
              { label: "Active", value: "987", variant: "secondary" },
            ]}
            actions={[
              { label: "View All Users", variant: "outline" },
              { label: "Add User", variant: "default" },
            ]}
          />

          <ActionCard
            title="Tournament Control"
            description="Create and manage tournaments and competitions"
            icon={<IconTournament className="h-5 w-5" />}
            stats={[
              { label: "Active", value: "8" },
              { label: "Upcoming", value: "3", variant: "secondary" },
            ]}
            actions={[
              { label: "View Tournaments", variant: "outline" },
              { label: "Create Tournament", variant: "default" },
            ]}
          />

          <ActionCard
            title="Analytics & Reports"
            description="View comprehensive analytics and generate reports"
            icon={<IconChartBar className="h-5 w-5" />}
            stats={[
              { label: "Reports", value: "24" },
              { label: "Growth", value: "+15%", variant: "secondary" },
            ]}
            actions={[
              { label: "View Analytics", variant: "outline" },
              { label: "Generate Report", variant: "default" },
            ]}
          />

          <ActionCard
            title="System Settings"
            description="Configure system settings and security"
            icon={<IconSettings className="h-5 w-5" />}
            stats={[
              { label: "Security", value: "High", variant: "secondary" },
              { label: "Uptime", value: "99.9%" },
            ]}
            actions={[
              { label: "View Settings", variant: "outline" },
              { label: "Security Center", variant: "default" },
            ]}
          />

          <ActionCard
            title="Team Management"
            description="Oversee team formations and member assignments"
            icon={<IconShield className="h-5 w-5" />}
            stats={[
              { label: "Teams", value: "45" },
              { label: "Members", value: "234", variant: "secondary" },
            ]}
            actions={[
              { label: "View Teams", variant: "outline" },
              { label: "Create Team", variant: "default" },
            ]}
          />

          <ActionCard
            title="Content Management"
            description="Manage content, announcements, and communications"
            icon={<IconEye className="h-5 w-5" />}
            stats={[
              { label: "Posts", value: "156" },
              { label: "Announcements", value: "12", variant: "secondary" },
            ]}
            actions={[
              { label: "View Content", variant: "outline" },
              { label: "Create Post", variant: "default" },
            ]}
          />
        </div>
      </div> */}
    </PageContainer>
  );
}
