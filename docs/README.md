# 📚 GASAK Esport Management Documentation

Welcome to the GASAK Esport Management App documentation! This folder contains comprehensive guides for developers and users.

## 📋 Documentation Index

### 🔐 Authentication & RBAC

- **[RBAC_README.md](./RBAC_README.md)** - Complete setup guide for authentication and role-based access control
- **[ROLE_CHECKING_GUIDE.md](./ROLE_CHECKING_GUIDE.md)** - Developer guide for implementing role checks in your code

### 🚀 Quick Start

1. **Setup**: Follow the [RBAC_README.md](./RBAC_README.md) for initial project setup
2. **Development**: Use [ROLE_CHECKING_GUIDE.md](./ROLE_CHECKING_GUIDE.md) for implementing features
3. **Testing**: Use the provided test accounts to verify role-based functionality

### 🔧 Key Features Covered

- ✅ Next.js 15 App Router setup
- ✅ Auth.js (NextAuth) configuration
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Role-based access control (Admin, Leader, Member)
- ✅ Protected routes and middleware
- ✅ User seeding scripts
- ✅ TypeScript types and utilities

### 🧪 Test Accounts

| Role   | Email            | Password  |
| ------ | ---------------- | --------- |
| Admin  | admin@gasak.com  | admin123  |
| Leader | leader@gasak.com | leader123 |
| Member | member@gasak.com | member123 |

### 📖 Additional Resources

- **Project Structure**: See main README.md in project root
- **Database Schema**: Check `/src/db/schema.ts`
- **Auth Configuration**: Check `/src/auth/config.ts`
- **Example Components**: Check `/examples/` folder

---

**Need Help?**

- Check the individual documentation files for detailed explanations
- Review the example components in the `/examples/` folder
- Test with the provided user accounts
