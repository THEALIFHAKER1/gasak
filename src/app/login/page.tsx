import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthSlideshow, SignInForm } from "@/components/auth";
import { getServerAuthSession } from "@/utils/auth";
import { getDashboardUrl } from "@/utils/dashboard";

export default async function LoginPage() {
  // Check if user is already logged in
  const session = await getServerAuthSession();

  if (session?.user) {
    // Redirect to appropriate dashboard based on user role
    redirect(getDashboardUrl(session.user.role));
  }

  return (
    <div className="relative min-h-dvh flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute top-4 right-4 z-50 md:top-8 md:right-8",
        )}
      >
        Home
      </Link>

      <AuthSlideshow />
      <SignInForm />
    </div>
  );
}
