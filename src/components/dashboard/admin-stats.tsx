"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { IconUsers } from "@tabler/icons-react";

interface TrendData {
  value: string;
  isPositive: boolean;
  label: string;
}

interface StatsData {
  totalUsers: number;
  leaderCount: number;
  memberCount: number;
  trends: {
    totalUsers: TrendData;
    leaderCount: TrendData;
    memberCount: TrendData;
  };
}

export function AdminStats() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    leaderCount: 0,
    memberCount: 0,
    trends: {
      totalUsers: { value: "0%", isPositive: true, label: "Loading..." },
      leaderCount: { value: "0%", isPositive: true, label: "Loading..." },
      memberCount: { value: "0%", isPositive: true, label: "Loading..." },
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = (await response.json()) as StatsData;
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchStats();
  }, []);

  const totalUsersExcludingAdmin = stats.leaderCount + stats.memberCount;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Users"
        value={loading ? "..." : totalUsersExcludingAdmin.toLocaleString()}
        icon={<IconUsers className="h-4 w-4" />}
        trend={
          loading
            ? { value: "...", isPositive: true, label: "Loading..." }
            : stats.trends.totalUsers
        }
        description="Leaders and members (excluding admins)"
      />

      <StatsCard
        title="Team Leaders"
        value={loading ? "..." : stats.leaderCount.toLocaleString()}
        icon={<IconUsers className="h-4 w-4" />}
        trend={
          loading
            ? { value: "...", isPositive: true, label: "Loading..." }
            : stats.trends.leaderCount
        }
        description="Active team leaders"
      />

      <StatsCard
        title="Team Members"
        value={loading ? "..." : stats.memberCount.toLocaleString()}
        icon={<IconUsers className="h-4 w-4" />}
        trend={
          loading
            ? { value: "...", isPositive: true, label: "Loading..." }
            : stats.trends.memberCount
        }
        description="Active team members"
      />
    </div>
  );
}
