# UploadThing Integration for GASAK Esport Management App

This document outlines the complete implementation of UploadThing for handling file uploads with role-based access control in the GASAK Esport Management App.

## Overview

The UploadThing integration provides secure file upload functionality with strict role-based permissions:
- **Admin only**: Can upload user avatars for any user
- **Admin & Leaders**: Can upload squad images and banners (leaders restricted to their own squad)

## Database Schema

### Users Table
```sql
ALTER TABLE gasak_user ADD COLUMN image TEXT;
```

### Squads Table
```sql
ALTER TABLE gasak_squad ADD COLUMN image TEXT;
ALTER TABLE gasak_squad ADD COLUMN banner TEXT;
```

## File Structure

```
src/
├── app/api/uploadthing/
│   ├── core.ts              # UploadThing file router configuration
│   └── route.ts             # Next.js API route handler
├── app/api/admin/users/
│   └── update-image/
│       └── route.ts         # Admin-only user image update API
├── app/api/squads/
│   └── update-image/
│       └── route.ts         # Squad image update API (admin/leaders)
├── components/admin/
│   ├── user-avatar-upload.tsx   # User avatar upload component
│   └── squad-image-upload.tsx   # Squad image upload component
├── lib/
│   └── uploadthing.ts       # UploadThing client configuration
└── app/dashboard/upload-demo/
    └── page.tsx             # Demo page showcasing upload functionality
```

## Environment Variables

Add these to your `.env` file:

```bash
# UploadThing
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"
```

## Role-Based Upload Rules

| Upload Target | Allowed Roles | File Size Limit | Database Column | Restrictions |
|---------------|---------------|-----------------|-----------------|--------------|
| User Avatar | Admin only | 2MB | `users.image` | Admin can update any user |
| Squad Profile Picture | Admin, Leader | 4MB | `squads.image` | Leader can only update their own squad |
| Squad Banner | Admin, Leader | 4MB | `squads.banner` | Leader can only update their own squad |

## Core Components

### 1. UploadThing File Router (`src/app/api/uploadthing/core.ts`)

```typescript
export const uploadRouter = {
  userAvatar: f({ image: { maxFileSize: "2MB" } })
    .middleware(async () => {
      const session = await auth();
      if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized: Only admins can upload user avatars");
      }
      return { userId: session.user.id, role: session.user.role };
    }),

  squadImage: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await auth();
      if (!session || (session.user.role !== "admin" && session.user.role !== "leader")) {
        throw new Error("Unauthorized: Only admins and leaders can upload squad images");
      }
      return { userId: session.user.id, role: session.user.role };
    }),
};
```

### 2. User Avatar Upload Component

```typescript
<UserAvatarUpload
  userId={user.id}
  currentImage={user.image}
  userName={user.name}
  onImageUpdate={(imageUrl) => {
    // Update local state
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, image: imageUrl } : u
    ));
  }}
/>
```

### 3. Squad Image Upload Component

```typescript
<SquadImageUpload
  squadId={squad.id}
  squadName={squad.name}
  currentImage={squad.image}
  currentBanner={squad.banner}
  onImageUpdate={(imageUrl, fieldType) => {
    setSquads(prev => prev.map(s => 
      s.id === squad.id 
        ? { ...s, [fieldType]: imageUrl } 
        : s
    ));
  }}
/>
```

## Security Implementation

### 1. Middleware Validation
- Each upload endpoint validates user authentication and role
- Role-based access control prevents unauthorized uploads
- Session validation ensures only authenticated users can upload

### 2. API Route Protection
- Separate API routes for user and squad image updates
- Double validation: both in UploadThing middleware and API routes
- Squad ownership validation for leaders

### 3. Frontend Restrictions
- Components only render for authorized users
- Upload buttons disabled for unauthorized roles
- Real-time validation feedback

## Usage Examples

### Admin User Management Page
The admin users page (`src/app/dashboard/admin/users/page.tsx`) now includes:
- Avatar preview for each user
- Upload button for admins only
- Real-time UI updates after successful uploads

### Squad Management Page
The admin squads page (`src/app/dashboard/admin/squads/page.tsx`) includes:
- Squad image upload functionality
- Support for both profile pictures and banners
- Role-based access (admin + leaders)

### Demo Page
Visit `/dashboard/upload-demo` to see a comprehensive demonstration of:
- User avatar upload (admin only)
- Squad image upload (admin & leaders)
- Real-time preview updates
- Error handling

## Setup Instructions

1. **Install Dependencies** (already done)
   ```bash
   npm install @uploadthing/react uploadthing
   ```

2. **Environment Setup**
   - Get your UploadThing API keys from [uploadthing.com](https://uploadthing.com)
   - Add them to your `.env` file

3. **Database Migration**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Test the Implementation**
   - Login as an admin user
   - Visit `/dashboard/admin/users` to test user avatar uploads
   - Visit `/dashboard/admin/squads` to test squad image uploads
   - Visit `/dashboard/upload-demo` for a complete demo

## Error Handling

The implementation includes comprehensive error handling:
- Authentication failures
- Authorization violations
- File upload errors
- Database update failures
- Network connectivity issues

All errors are displayed to users via toast notifications with appropriate error messages.

## File Upload Flow

1. **User clicks upload button** → Opens upload dialog
2. **Select file** → UploadThing validates file type and size
3. **Upload to UploadThing** → File is uploaded to UploadThing storage
4. **Update database** → Separate API call updates the database with the file URL
5. **Update UI** → Local state is updated to reflect the new image

This two-step process ensures data consistency and provides better error handling compared to doing everything in the UploadThing callback.

## Integration Points

### With Auth.js
- Uses existing session management
- Leverages role-based authentication
- Integrates with current user system

### With Drizzle ORM
- Uses existing database schema
- Leverages current database connections
- Maintains data consistency

### With ShadCN UI
- Consistent design language
- Accessible components
- Responsive layouts

## Future Enhancements

Potential improvements for the future:
1. Image compression before upload
2. Multiple file upload support
3. Drag and drop functionality
4. Image cropping tools
5. Upload progress indicators
6. File type validation on the frontend
7. Image optimization and resizing
