"use client";

import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {" "}
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              GASAK Esport Management
            </h1>
            <div className="flex items-center space-x-6">
              <Link
                href="#tournaments"
                className="text-gray-700 hover:text-gray-900"
              >
                Tournaments
              </Link>
              <Link href="#teams" className="text-gray-700 hover:text-gray-900">
                Teams
              </Link>
              <Link href="#news" className="text-gray-700 hover:text-gray-900">
                News
              </Link>
              <Link
                href="/auth/signin"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
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
            <h1 className="mb-8 text-4xl font-bold text-gray-900">
              Welcome to GASAK Esport Management
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Professional esports team management platform
            </p>

            {/* Squad Carousel - Continuous Rolling */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-semibold text-gray-800">
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
                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  Live Tournaments
                </h2>
                <p className="text-lg text-gray-600">
                  Compete for glory and prizes
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {tournaments.map((tournament, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow hover:shadow-xl"
                  >
                    <div className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            tournament.status === "Live"
                              ? "bg-red-100 text-red-800"
                              : tournament.status === "Upcoming"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {tournament.status}
                        </span>
                        <span className="text-2xl">🏆</span>
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-gray-900">
                        {tournament.name}
                      </h3>
                      <p className="mb-4 text-gray-600">{tournament.date}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-indigo-600">
                          {tournament.prize}
                        </span>
                        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700">
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
              <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                <h2 className="mb-8 text-center text-3xl font-bold">
                  GASAK by the Numbers
                </h2>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  {teamStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="mb-2 text-4xl">{stat.icon}</div>
                      <div className="mb-1 text-3xl font-bold">
                        {stat.value}
                      </div>
                      <div className="text-indigo-200">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* News Section */}
            <div className="mb-16">
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  Latest News
                </h2>
                <p className="text-lg text-gray-600">
                  Stay updated with GASAK esports
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {latestNews.map((news, index) => (
                  <article
                    key={index}
                    className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow hover:shadow-xl"
                  >
                    <div className="p-6">
                      <div className="mb-4 text-4xl">{news.image}</div>
                      <h3 className="mb-3 text-xl font-bold text-gray-900">
                        {news.title}
                      </h3>
                      <p className="mb-4 text-gray-600">{news.summary}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {news.date}
                        </span>
                        <button className="font-medium text-indigo-600 hover:text-indigo-800">
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
              <div className="rounded-2xl bg-gray-900 p-8 text-center text-white">
                <h2 className="mb-4 text-3xl font-bold">
                  Ready to Join the Elite?
                </h2>
                <p className="mb-6 text-xl text-gray-300">
                  Take your gaming to the next level with GASAK esports
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <button className="rounded-lg bg-indigo-600 px-8 py-3 font-medium transition-colors hover:bg-indigo-700">
                    Join Our Team
                  </button>
                  <button className="rounded-lg border border-gray-600 px-8 py-3 font-medium transition-colors hover:border-gray-400">
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
