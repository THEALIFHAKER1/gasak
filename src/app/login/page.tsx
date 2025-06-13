"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AuthSlideshow, SignInForm } from "@/components/auth";

export default function LoginPage() {
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
