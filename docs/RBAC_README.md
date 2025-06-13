# GASAK Esport Management App

A modern esports team management application built with Next.js 15, Auth.js, and PostgreSQL.

## Features

- **Role-Based Access Control (RBAC)**: Three user roles with different access levels
  - `admin`: Full system access
  - `leader`: Team management access
  - `member`: Basic user access
- **Secure Authentication**: JWT-based sessions with bcrypt password hashing
- **Protected Routes**: Middleware-enforced route protection
- **Modern UI**: Clean, responsive design with TailwindCSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Auth.js (NextAuth) with Credentials Provider
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: TailwindCSS
- **Password Hashing**: bcrypt-ts
- **TypeScript**: Full type safety

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Database Setup

```bash
# Generate database migrations
npm run db:generate

# Push migrations to database
npm run db:push

# Seed admin user
npm run db:seed-admin
```

### 3. Install Dependencies & Start Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Default Test Credentials

After running the seed scripts, use these credentials to test different roles:

#### Admin Account

- **Email**: `admin@gasak.com`
- **Password**: `admin123`
- **Role**: `admin`

#### Leader Account

- **Email**: `leader@gasak.com`
- **Password**: `leader123`
- **Role**: `leader`

#### Member Account

- **Email**: `member@gasak.com`
- **Password**: `member123`
- **Role**: `member`

⚠️ **Important**: Change all passwords after first login!

## User Roles & Access

### Route Protection

| Route Prefix | Access Roles          |
| ------------ | --------------------- |
| `/admin/*`   | admin only            |
| `/leader/*`  | admin, leader         |
| `/member/*`  | admin, leader, member |
| `/`          | Public                |
| `/login`     | All users             |

### Role Capabilities

#### Admin (`admin`)

- Full system access
- User management (create leaders and members)
- Team management
- Tournament management
- System settings

#### Leader (`leader`)

- Team management
- Training schedule management
- Member performance tracking
- Tournament registration

#### Member (`member`)

- View personal profile
- View training schedule
- View performance statistics
- Access team calendar

## Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate   # Generate migrations
npm run db:migrate    # Run migrations
npm run db:push       # Push schema to database
npm run db:studio     # Open Drizzle Studio

# Database Seeding
npm run db:seed-admin   # Seed admin user only
npm run db:seed-leader  # Seed leader user only
npm run db:seed-member  # Seed member user only
npm run db:seed-all     # Seed all users (admin, leader, member)

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run typecheck    # Run TypeScript checks
npm run format:check # Check Prettier formatting
npm run format:write # Apply Prettier formatting
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin dashboard
│   ├── leader/         # Leader dashboard
│   ├── member/         # Member dashboard
│   ├── login/          # Login page
│   └── api/auth/       # NextAuth API routes
├── auth/               # Authentication configuration
├── components/         # React components
├── db/                 # Database schema and config
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Security Features

- **Password Hashing**: bcrypt-ts with salt rounds of 12
- **JWT Sessions**: Secure, stateless authentication
- **Route Protection**: Middleware-based access control
- **Role Validation**: Server and client-side role checks
- **CSRF Protection**: Built-in NextAuth CSRF protection

## Adding New Users

### Via Admin Dashboard (Recommended)

1. Log in as admin
2. Navigate to Admin Dashboard
3. Use "Add New User" functionality

### Programmatically

```typescript
import { hash } from "bcrypt-ts";
import { db } from "@/db";
import { users } from "@/db/schema";

const hashedPassword = await hash("password", 12);
await db.insert(users).values({
  name: "User Name",
  email: "user@example.com",
  password: hashedPassword,
  role: "member", // or "leader"
});
```

## Deployment

1. Set up PostgreSQL database (recommended: NeonDB)
2. Configure environment variables
3. Run database migrations
4. Seed admin user
5. Deploy to your preferred platform (Vercel recommended)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
