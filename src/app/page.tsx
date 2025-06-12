"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              GASAK Esport Management
            </h1>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <span className="text-sm text-gray-700">
                    Welcome, {session.user.name ?? session.user.email}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    {session.user.role}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="mb-8 text-4xl font-bold text-gray-900">
              Welcome to GASAK Esport Management
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              Professional esports team management platform
            </p>

            {session ? (
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
                {session.user.role === "admin" && (
                  <Link
                    href="/dashboard/admin"
                    className="rounded-lg border border-red-300 bg-red-100 p-6 text-center transition-colors hover:bg-red-200"
                  >
                    <h3 className="mb-2 text-lg font-semibold text-red-800">
                      Admin Dashboard
                    </h3>
                    <p className="text-red-600">
                      Manage users, teams, and tournaments
                    </p>
                  </Link>
                )}

                {["admin", "leader"].includes(session.user.role as string) && (
                  <Link
                    href="/dashboard/leader"
                    className="rounded-lg border border-blue-300 bg-blue-100 p-6 text-center transition-colors hover:bg-blue-200"
                  >
                    <h3 className="mb-2 text-lg font-semibold text-blue-800">
                      Leader Dashboard
                    </h3>
                    <p className="text-blue-600">
                      Manage your team and training
                    </p>
                  </Link>
                )}

                {["admin", "leader", "member"].includes(
                  session.user.role as string,
                ) && (
                  <Link
                    href="/dashboard/member"
                    className="rounded-lg border border-green-300 bg-green-100 p-6 text-center transition-colors hover:bg-green-200"
                  >
                    <h3 className="mb-2 text-lg font-semibold text-green-800">
                      Member Dashboard
                    </h3>
                    <p className="text-green-600">
                      View schedule and performance
                    </p>
                  </Link>
                )}
              </div>
            ) : (
              <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Get Started
                </h3>
                <p className="mb-6 text-gray-600">
                  Sign in to access your dashboard and manage your esports
                  activities.
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Sign In to Continue
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
