# GASAK Esport Management App

A modern esports team management application built with Next.js 15, featuring role-based access control and comprehensive user management.

## 🚀 Quick Start

1. **Setup Environment**: Copy `.env.example` to `.env` and configure your database
2. **Install Dependencies**: `npm install`
3. **Setup Database**: `npm run db:push`
4. **Seed Users**: `npm run db:seed-all`
5. **Start Development**: `npm run dev`

## 📚 Documentation

Complete documentation is available in the [`/docs`](./docs/) folder:

- **[Setup Guide](./docs/RBAC_README.md)** - Authentication and RBAC setup
- **[Developer Guide](./docs/ROLE_CHECKING_GUIDE.md)** - Role checking implementation
- **[Documentation Index](./docs/README.md)** - Complete documentation overview

## 🔐 Test Accounts

| Role   | Email            | Password  |
| ------ | ---------------- | --------- |
| Admin  | admin@gasak.com  | admin123  |
| Leader | leader@gasak.com | leader123 |
| Member | member@gasak.com | member123 |

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
