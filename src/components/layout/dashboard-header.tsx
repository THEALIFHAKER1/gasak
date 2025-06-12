import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  session: Session;
}

export function DashboardHeader({
  title,
  subtitle,
  session,
}: DashboardHeaderProps) {
  const getRoleColorClasses = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 hover:bg-red-200 border-red-300";
      case "leader":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300";
      case "member":
        return "bg-green-100 text-green-800 hover:bg-green-200 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300";
    }
  };

  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex sm:flex-col sm:items-end sm:text-sm">
            <span className="font-medium">
              {session.user.name ?? session.user.email}
            </span>
            <span className="text-muted-foreground text-xs">Logged in</span>
          </div>

          <Badge
            variant="outline"
            className={`capitalize transition-colors ${getRoleColorClasses(session.user.role as string)}`}
          >
            {session.user.role}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="transition-all duration-200 hover:scale-105"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
