import { Suspense } from "react";
import { requireAuthWithRole } from "@/utils/auth";
import { redirect } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { MemberSquadView } from "@/components/member/squad-view";
import { Separator } from "@/components/ui/separator";

export default async function MemberSquadsPage() {
  try {
    await requireAuthWithRole(["member"]);
  } catch {
    redirect("/login");
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Heading
          title="Squad Information"
          description="View your squad details and team members"
        />
      </div>

      <Separator />

      <Suspense fallback={<div>Loading squad information...</div>}>
        <MemberSquadView />
      </Suspense>
    </PageContainer>
  );
}
