"use client";

import Link from "next/link";
import Image from "next/image";

// Static squad data
const squadData = [
  {
    id: 1,
    name: "Lightning Wolves",
    logo: "⚡",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: 2,
    name: "Shadow Dragons",
    logo: "🐉",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: 3,
    name: "Phoenix Rising",
    logo: "🔥",
    color: "from-red-500 to-pink-500",
  },
  {
    id: 4,
    name: "Ice Guardians",
    logo: "❄️",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: 5,
    name: "Storm Eagles",
    logo: "🦅",
    color: "from-green-400 to-teal-500",
  },
  {
    id: 6,
    name: "Void Hunters",
    logo: "🌌",
    color: "from-gray-700 to-gray-900",
  },
  {
    id: 7,
    name: "Cyber Knights",
    logo: "⚔️",
    color: "from-indigo-500 to-purple-600",
  },
];

// Esports data
const tournaments = [
  {
    name: "GASAK Championship 2025",
    status: "Live",
    prize: "$50,000",
    date: "Jan 15-20",
  },
  {
    name: "Winter Clash",
    status: "Upcoming",
    prize: "$25,000",
    date: "Feb 10-12",
  },
  {
    name: "Spring Showdown",
    status: "Registration",
    prize: "$35,000",
    date: "Mar 5-8",
  },
];

const teamStats = [
  { label: "Tournament Wins", value: "147", icon: "🏆" },
  { label: "Active Players", value: "89", icon: "👥" },
  { label: "Total Matches", value: "1,250", icon: "⚡" },
  { label: "Win Rate", value: "87%", icon: "📈" },
];

const latestNews = [
  {
    title: "GASAK Wins International Championship",
    summary:
      "Our Lightning Wolves team secured first place in the global tournament.",
    date: "Dec 10, 2024",
    image: "🏆",
  },
  {
    title: "New Training Facility Opens",
    summary:
      "State-of-the-art gaming facility now available for all team members.",
    date: "Dec 8, 2024",
    image: "🏢",
  },
  {
    title: "Player Recruitment Drive",
    summary: "Looking for talented players to join our elite squads.",
    date: "Dec 5, 2024",
    image: "🎮",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-gray-900">
      <header className="border-b border-yellow-500/20 bg-gray-800 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {" "}
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-700">
                <Image
                  src="/logo.jpg"
                  alt="GASAK MY Logo"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
              <h1 className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-xl font-bold text-transparent">
                GASAK MY Esports
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="#tournaments"
                className="text-gray-300 transition-colors hover:text-yellow-400"
              >
                Tournaments
              </Link>
              <Link
                href="#teams"
                className="text-gray-300 transition-colors hover:text-yellow-400"
              >
                Teams
              </Link>
              <Link
                href="#news"
                className="text-gray-300 transition-colors hover:text-yellow-400"
              >
                News
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-sm font-medium text-gray-900 transition-all duration-200 hover:from-yellow-400 hover:to-orange-400"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-4xl font-bold text-transparent">
              Welcome to GASAK MY Esports
            </h1>
            <p className="mb-8 text-xl text-gray-300">
              Professional esports team management platform
            </p>

            {/* Squad Carousel - Continuous Rolling */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-semibold text-yellow-400">
                Our Elite Squads
              </h2>
              <div className="relative mx-auto max-w-6xl overflow-hidden py-4">
                <div className="animate-scroll flex space-x-6 px-4">
                  {/* Duplicate the array for seamless loop */}
                  {[...squadData, ...squadData].map((squad, index) => (
                    <div
                      key={`${squad.id}-${index}`}
                      className="min-w-[300px] flex-shrink-0"
                    >
                      <div
                        className={`rounded-lg bg-gradient-to-r ${squad.color} relative transform p-6 text-white shadow-lg transition-transform hover:z-10 hover:scale-110`}
                      >
                        <div className="text-center">
                          <div className="mb-4 text-5xl">{squad.logo}</div>
                          <h3 className="text-xl font-bold">{squad.name}</h3>
                          <p className="mt-2 text-base opacity-90">
                            Elite Gaming Squad
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes scroll {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-${squadData.length * 318}px);
                }
              }

              .animate-scroll {
                animation: scroll 20s linear infinite;
              }

              .animate-scroll:hover {
                animation-play-state: paused;
              }
            `}</style>

            {/* Tournament Section */}
            <div className="mb-16">
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-3xl font-bold text-yellow-400">
                  Live Tournaments
                </h2>
                <p className="text-lg text-gray-300">
                  Compete for glory and prizes
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {tournaments.map((tournament, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-yellow-500/20 bg-gray-800 shadow-lg transition-shadow hover:shadow-xl"
                  >
                    <div className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            tournament.status === "Live"
                              ? "border border-red-500/30 bg-red-500/20 text-red-400"
                              : tournament.status === "Upcoming"
                                ? "border border-blue-500/30 bg-blue-500/20 text-blue-400"
                                : "border border-green-500/30 bg-green-500/20 text-green-400"
                          }`}
                        >
                          {tournament.status}
                        </span>
                        <span className="text-2xl">🏆</span>
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-white">
                        {tournament.name}
                      </h3>
                      <p className="mb-4 text-gray-400">{tournament.date}</p>
                      <div className="flex items-center justify-between">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-2xl font-bold text-transparent">
                          {tournament.prize}
                        </span>
                        <button className="rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 font-medium text-gray-900 transition-all hover:from-yellow-400 hover:to-orange-400">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mb-16">
              <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-gray-800 to-gray-700 p-8 text-white">
                <h2 className="mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-center text-3xl font-bold text-transparent">
                  GASAK MY by the Numbers
                </h2>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  {teamStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="mb-2 text-4xl">{stat.icon}</div>
                      <div className="mb-1 text-3xl font-bold text-yellow-400">
                        {stat.value}
                      </div>
                      <div className="text-gray-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* News Section */}
            <div className="mb-16">
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-3xl font-bold text-yellow-400">
                  Latest News
                </h2>
                <p className="text-lg text-gray-300">
                  Stay updated with GASAK MY esports
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {latestNews.map((news, index) => (
                  <article
                    key={index}
                    className="overflow-hidden rounded-xl border border-yellow-500/20 bg-gray-800 shadow-lg transition-shadow hover:shadow-xl"
                  >
                    <div className="p-6">
                      <div className="mb-4 text-4xl">{news.image}</div>
                      <h3 className="mb-3 text-xl font-bold text-white">
                        {news.title}
                      </h3>
                      <p className="mb-4 text-gray-300">{news.summary}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          {news.date}
                        </span>
                        <button className="font-medium text-yellow-400 transition-colors hover:text-yellow-300">
                          Read More →
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="mb-16">
              <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-gray-800 to-gray-700 p-8 text-center text-white">
                <h2 className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-3xl font-bold text-transparent">
                  Ready to Join the Elite?
                </h2>
                <p className="mb-6 text-xl text-gray-300">
                  Take your gaming to the next level with GASAK MY esports
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <button className="rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-3 font-medium text-gray-900 transition-all hover:from-yellow-400 hover:to-orange-400">
                    Join Our Team
                  </button>
                  <button className="rounded-lg border border-yellow-500/50 px-8 py-3 font-medium text-yellow-400 transition-colors hover:border-yellow-400 hover:text-yellow-300">
                    Watch Matches
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
