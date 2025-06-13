import { Suspense } from "react";
import { requireAuthWithRole } from "@/utils/auth";
import { redirect } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { LeaderSquadManagement } from "@/components/leader/squad-management";
import { Separator } from "@/components/ui/separator";

export default async function LeaderSquadsPage() {
  try {
    await requireAuthWithRole(["leader"]);
  } catch {
    redirect("/login");
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Heading
          title="My Squad"
          description="Manage your squad members and track team performance"
        />
      </div>

      <Separator />

      <Suspense fallback={<div>Loading squad information...</div>}>
        <LeaderSquadManagement />
      </Suspense>
    </PageContainer>
  );
}
