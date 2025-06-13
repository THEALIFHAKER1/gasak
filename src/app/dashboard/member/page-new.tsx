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
  IconUser,
  IconCalendar,
  IconTrophy,
  IconChartBar,
  IconClock,
  IconTarget,
  IconBookmark,
} from "@tabler/icons-react";

export default function MemberPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (!["admin", "leader", "member"].includes(session.user.role as string)) {
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

  if (
    !session ||
    !["admin", "leader", "member"].includes(session.user.role as string)
  ) {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <DashboardHeader
        title="Member Dashboard"
        subtitle="GASAK Esport Management"
        session={session}
      />

      <PageContainer>
        <div className="flex flex-1 flex-col space-y-6">
          <div className="flex items-center justify-between">
            <Heading
              title="Welcome back, Member! 🎮"
              description="Track your progress and stay updated with team activities."
            />
          </div>

          {/* Personal Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Training Hours"
              value="48"
              icon={<IconClock className="h-4 w-4" />}
              trend={{
                value: "+12h",
                isPositive: true,
                label: "This week",
              }}
              description="Total this month"
            />

            <StatsCard
              title="Skill Rating"
              value="2,450"
              icon={<IconChartBar className="h-4 w-4" />}
              trend={{
                value: "+150",
                isPositive: true,
                label: "Improved",
              }}
              description="Current ranking"
            />

            <StatsCard
              title="Tournaments"
              value="5"
              icon={<IconTrophy className="h-4 w-4" />}
              trend={{
                value: "+2",
                isPositive: true,
                label: "New entries",
              }}
              description="Participated this season"
            />

            <StatsCard
              title="Team Rank"
              value="3rd"
              icon={<IconTarget className="h-4 w-4" />}
              trend={{
                value: "+1",
                isPositive: true,
                label: "Moved up",
              }}
              description="In league standings"
            />
          </div>

          <Separator />

          {/* Member Activities */}
          <div className="space-y-6">
            <Heading
              title="Your Activities"
              description="Manage your training, schedule, and performance"
              variant="h3"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ActionCard
                title="Training Schedule"
                description="View upcoming training sessions and practice times"
                icon={<IconCalendar className="h-5 w-5" />}
                stats={[
                  { label: "This Week", value: "4" },
                  { label: "Completed", value: "8", variant: "secondary" },
                ]}
                actions={[
                  { label: "View Schedule", variant: "outline" },
                  { label: "Join Session", variant: "default" },
                ]}
              />

              <ActionCard
                title="Performance Analytics"
                description="Track your gameplay statistics and improvement"
                icon={<IconChartBar className="h-5 w-5" />}
                stats={[
                  { label: "Win Rate", value: "78%" },
                  { label: "Improvement", value: "+12%", variant: "secondary" },
                ]}
                actions={[
                  { label: "View Stats", variant: "outline" },
                  { label: "Analyze Games", variant: "default" },
                ]}
              />

              <ActionCard
                title="Tournament History"
                description="Review your tournament participation and results"
                icon={<IconTrophy className="h-5 w-5" />}
                stats={[
                  { label: "Participated", value: "5" },
                  { label: "Wins", value: "2", variant: "secondary" },
                ]}
                actions={[
                  { label: "View History", variant: "outline" },
                  { label: "Register New", variant: "default" },
                ]}
              />

              <ActionCard
                title="Team Communication"
                description="Stay connected with your team members and leaders"
                icon={<IconUser className="h-5 w-5" />}
                stats={[
                  { label: "Messages", value: "12" },
                  { label: "Unread", value: "3", variant: "secondary" },
                ]}
                actions={[
                  { label: "View Messages", variant: "outline" },
                  { label: "Send Message", variant: "default" },
                ]}
              />

              <ActionCard
                title="Personal Goals"
                description="Set and track your personal improvement goals"
                icon={<IconTarget className="h-5 w-5" />}
                stats={[
                  { label: "Active Goals", value: "4" },
                  { label: "Completed", value: "7", variant: "secondary" },
                ]}
                actions={[
                  { label: "View Goals", variant: "outline" },
                  { label: "Set New Goal", variant: "default" },
                ]}
              />

              <ActionCard
                title="Learning Resources"
                description="Access training materials and educational content"
                icon={<IconBookmark className="h-5 w-5" />}
                stats={[
                  { label: "Resources", value: "23" },
                  { label: "Bookmarked", value: "8", variant: "secondary" },
                ]}
                actions={[
                  { label: "Browse Resources", variant: "outline" },
                  { label: "My Bookmarks", variant: "default" },
                ]}
              />
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
