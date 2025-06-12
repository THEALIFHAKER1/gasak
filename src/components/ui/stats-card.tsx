import React from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={`group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="group-hover:text-primary text-2xl font-semibold tabular-nums transition-colors">
          {value}
        </CardTitle>
        {trend && (
          <CardAction>
            <Badge
              variant="outline"
              className={`transition-all duration-200 ${
                trend.isPositive
                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              } `}
            >
              {trend.isPositive ? (
                <IconTrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <IconTrendingDown className="mr-1 h-3 w-3" />
              )}
              {trend.value}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {(trend?.label ?? description) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {trend?.label && (
            <div className="text-muted-foreground flex gap-2 font-medium">
              {trend.label}
              {trend.isPositive ? (
                <IconTrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <IconTrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
          {description && (
            <div className="text-muted-foreground">{description}</div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
