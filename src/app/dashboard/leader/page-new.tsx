"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageContainer from "@/components/layout/page-container";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { StatsCard } from "@/components/ui/stats-card";
import { ActionCard } from "@/components/ui/action-card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  IconUsers,
  IconCalendar,
  IconTrophy,
  IconChartBar,
  IconClipboardList,
  IconTarget,
} from "@tabler/icons-react";

export default function LeaderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!["admin", "leader"].includes(session.user.role as string)) {
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

  if (!session || !["admin", "leader"].includes(session.user.role as string)) {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <DashboardHeader
        title="Leader Dashboard"
        subtitle="GASAK Esport Management"
        session={session}
      />

      <PageContainer>
        <div className="flex flex-1 flex-col space-y-6">
          <div className="flex items-center justify-between">
            <Heading
              title="Welcome back, Leader! 🎯"
              description="Manage your team and coordinate training sessions."
            />
          </div>

          {/* Team Overview Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Team Members"
              value="12"
              icon={<IconUsers className="h-4 w-4" />}
              trend={{
                value: "+2",
                isPositive: true,
                label: "New recruits",
              }}
              description="Active team members"
            />

            <StatsCard
              title="Training Sessions"
              value="8"
              icon={<IconCalendar className="h-4 w-4" />}
              trend={{
                value: "+4",
                isPositive: true,
                label: "This week",
              }}
              description="Scheduled this month"
            />

            <StatsCard
              title="Tournaments Won"
              value="3"
              icon={<IconTrophy className="h-4 w-4" />}
              trend={{
                value: "+1",
                isPositive: true,
                label: "Recent victory",
              }}
              description="This season"
            />

            <StatsCard
              title="Team Performance"
              value="92%"
              icon={<IconChartBar className="h-4 w-4" />}
              trend={{
                value: "+8%",
                isPositive: true,
                label: "Improved",
              }}
              description="Overall score"
            />
          </div>

          <Separator />

          {/* Management Sections */}
          <div className="space-y-6">
            <Heading
              title="Team Management"
              description="Coordinate team activities and track progress"
              variant="h3"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ActionCard
                title="Team Members"
                description="Manage team roster and member activities"
                icon={<IconUsers className="h-5 w-5" />}
                stats={[
                  { label: "Active", value: "12" },
                  { label: "Training", value: "10", variant: "secondary" },
                ]}
                actions={[
                  { label: "View Members", variant: "outline" },
                  { label: "Add Member", variant: "default" },
                ]}
              />

              <ActionCard
                title="Training Schedule"
                description="Plan and organize training sessions"
                icon={<IconCalendar className="h-5 w-5" />}
                stats={[
                  { label: "This Week", value: "8" },
                  { label: "Upcoming", value: "5", variant: "secondary" },
                ]}
                actions={[
                  { label: "View Schedule", variant: "outline" },
                  { label: "Schedule Session", variant: "default" },
                ]}
              />

              <ActionCard
                title="Performance Tracking"
                description="Monitor team and individual performance"
                icon={<IconChartBar className="h-5 w-5" />}
                stats={[
                  { label: "Avg Score", value: "92%" },
                  { label: "Improvement", value: "+8%", variant: "secondary" },
                ]}
                actions={[
                  { label: "View Analytics", variant: "outline" },
                  { label: "Generate Report", variant: "default" },
                ]}
              />

              <ActionCard
                title="Tournament Management"
                description="Register and manage tournament participation"
                icon={<IconTrophy className="h-5 w-5" />}
                stats={[
                  { label: "Active", value: "2" },
                  { label: "Won", value: "3", variant: "secondary" },
                ]}
                actions={[
                  { label: "View Tournaments", variant: "outline" },
                  { label: "Register Team", variant: "default" },
                ]}
              />

              <ActionCard
                title="Team Strategy"
                description="Develop strategies and analyze gameplay"
                icon={<IconTarget className="h-5 w-5" />}
                stats={[
                  { label: "Strategies", value: "15" },
                  { label: "Success Rate", value: "85%", variant: "secondary" },
                ]}
                actions={[
                  { label: "View Strategies", variant: "outline" },
                  { label: "Create Strategy", variant: "default" },
                ]}
              />

              <ActionCard
                title="Team Communication"
                description="Manage team communications and announcements"
                icon={<IconClipboardList className="h-5 w-5" />}
                stats={[
                  { label: "Messages", value: "24" },
                  { label: "Announcements", value: "5", variant: "secondary" },
                ]}
                actions={[
                  { label: "View Messages", variant: "outline" },
                  { label: "Send Message", variant: "default" },
                ]}
              />
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
