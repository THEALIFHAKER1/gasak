import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actions?: {
    label: string;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    onClick?: () => void;
  }[];
  stats?: {
    label: string;
    value: string | number;
    variant?: "default" | "secondary" | "destructive" | "outline";
  }[];
  className?: string;
}

export function ActionCard({
  title,
  description,
  icon,
  actions,
  stats,
  className,
}: ActionCardProps) {
  return (
    <Card
      className={`group border-l-primary/20 hover:border-l-primary border-l-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className} `}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          {icon && (
            <div className="text-primary transition-transform group-hover:scale-110">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="group-hover:text-primary text-lg font-semibold transition-colors">
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      {stats && stats.length > 0 && (
        <CardContent className="pb-3">
          <div className="flex flex-wrap gap-2">
            {stats.map((stat, index) => (
              <Badge
                key={index}
                variant={stat.variant ?? "outline"}
                className="text-xs"
              >
                <span className="font-semibold">{stat.value}</span>
                <span className="ml-1">{stat.label}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      )}

      {actions && actions.length > 0 && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant ?? "outline"}
                size="sm"
                onClick={action.onClick}
                className="transition-all duration-200 hover:scale-105"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
