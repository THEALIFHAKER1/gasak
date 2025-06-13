"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  IconDashboard,
  IconUsers,
  // IconTournament,
  // IconChartBar,
  // IconSettings,
  IconShield,
  IconUser,
  // IconCalendar,
  // IconTrophy,
  // IconTarget,
  IconLogout,
  IconHome,
  IconColumns,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);

  if (!session) {
    return null;
  }

  const userRole = session.user.role as string;

  // Define navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: `/dashboard/${userRole}`,
        icon: IconDashboard,
      },
    ];

    if (userRole === "admin") {
      return [
        ...baseItems,
        {
          title: "Kanban Board",
          url: "/dashboard/admin/kanban",
          icon: IconColumns,
        },
        {
          title: "User Management",
          url: "/dashboard/admin/users",
          icon: IconUsers,
        },
        // {
        //   title: "Tournament Control",
        //   url: "/dashboard/admin/tournaments",
        //   icon: IconTournament,
        // },
        // {
        //   title: "Analytics",
        //   url: "/dashboard/admin/analytics",
        //   icon: IconChartBar,
        // },
        // {
        //   title: "System Settings",
        //   url: "/dashboard/admin/settings",
        //   icon: IconSettings,
        // },
      ];
    }

    if (userRole === "leader") {
      return [
        ...baseItems,
        {
          title: "Kanban Board",
          url: "/dashboard/leader/kanban",
          icon: IconColumns,
        },
        // {
        //   title: "Team Members",
        //   url: "/dashboard/leader/members",
        //   icon: IconUsers,
        // },
        // {
        //   title: "Training Schedule",
        //   url: "/dashboard/leader/training",
        //   icon: IconCalendar,
        // },
        // {
        //   title: "Team Performance",
        //   url: "/dashboard/leader/performance",
        //   icon: IconChartBar,
        // },
        // {
        //   title: "Tournaments",
        //   url: "/dashboard/leader/tournaments",
        //   icon: IconTrophy,
        // },
      ];
    }

    if (userRole === "member") {
      return [
        ...baseItems,
        {
          title: "Kanban Board",
          url: "/dashboard/member/kanban",
          icon: IconColumns,
        },
        // {
        //   title: "Training Schedule",
        //   url: "/dashboard/member/training",
        //   icon: IconCalendar,
        // },
        // {
        //   title: "My Performance",
        //   url: "/dashboard/member/performance",
        //   icon: IconChartBar,
        // },
        // {
        //   title: "Tournaments",
        //   url: "/dashboard/member/tournaments",
        //   icon: IconTrophy,
        // },
        // {
        //   title: "Personal Goals",
        //   url: "/dashboard/member/goals",
        //   icon: IconTarget,
        // },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const getRoleIcon = () => {
    switch (userRole) {
      case "admin":
        return <IconShield className="h-4 w-4" />;
      case "leader":
        return <IconUsers className="h-4 w-4" />;
      case "member":
        return <IconUser className="h-4 w-4" />;
      default:
        return <IconUser className="h-4 w-4" />;
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-300";
      case "leader":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "member":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
            {!logoError ? (
              <Image
                src="/logo.jpg"
                alt="GASAK Squad Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
                <IconShield className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">GASAK Esports</span>
            <span className="text-muted-foreground text-xs">Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Home">
                  <Link href="/">
                    <IconHome className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t">
        <div className="space-y-2 p-2">
          <div className="bg-sidebar-accent/50 flex items-center gap-2 rounded-md px-2 py-1">
            {getRoleIcon()}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {session.user.name ?? session.user.email}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`h-4 px-1 py-0 text-[10px] capitalize ${getRoleColor()}`}
                >
                  {userRole}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <IconLogout className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
