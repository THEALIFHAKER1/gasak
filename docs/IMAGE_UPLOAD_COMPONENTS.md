# Image Upload Components Documentation

This document describes the type-safe image upload components implemented for the GASAK Esports Management App.

## Components Overview

### JpgUploadButton
The main upload button component that handles client-side image conversion to JPG format before uploading to UploadThing.

**Location**: `src/components/ui/jpg-upload-button.tsx`

**Features**:
- Converts all uploaded images to JPG format
- Configurable quality, maxWidth, and maxHeight
- Loading state during conversion
- Role-based access control (enforced by UploadThing middleware)
- Custom file naming (handled by UploadThing middleware)

**Props**:
```typescript
interface JpgUploadButtonProps {
  endpoint: keyof OurFileRouter; // 'userAvatar' | 'squadImage'
  input: 
    | { targetUserId: string }                    // For userAvatar endpoint
    | { squadId: string; fieldType: "image" | "banner" }; // For squadImage endpoint
  onClientUploadComplete?: (res: Array<{ url: string; key?: string; name?: string; size?: number }>) => void;
  onUploadError?: (error: Error) => void;
  appearance?: {
    button?: string;
    allowedContent?: string;
    container?: string;
  };
  quality?: number;    // JPG quality 0.0 to 1.0, default: 0.9
  maxWidth?: number;   // Optional max width for resizing
  maxHeight?: number;  // Optional max height for resizing
}
```

**Usage Example**:
```typescript
<JpgUploadButton
  endpoint="userAvatar"
  input={{ targetUserId: user.id }}
  onClientUploadComplete={(res) => {
    const imageUrl = res[0]?.url;
    if (imageUrl) {
      handleImageUpdate(imageUrl);
    }
  }}
  quality={0.8}
  maxWidth={800}
  maxHeight={800}
/>
```

### TypedJpgUploadButton (Alternative)
A more type-safe version with discriminated union types for better type inference.

**Location**: `src/components/ui/jpg-upload-button-typed.tsx`

**Features**:
- Stricter type safety with discriminated unions
- Helper functions for creating props
- Better IDE intellisense and error detection

**Usage Example**:
```typescript
import { TypedJpgUploadButton, createUserAvatarUploadProps } from '@/components/ui/jpg-upload-button-typed';

const uploadProps = createUserAvatarUploadProps(
  { targetUserId: user.id },
  {
    onClientUploadComplete: (res) => handleImageUpdate(res[0]?.url),
    quality: 0.8,
    maxWidth: 800,
  }
);

<TypedJpgUploadButton {...uploadProps} />
```

## Application Components

### UserAvatarUpload
Handles user avatar uploads with optimistic UI updates.

**Location**: `src/components/admin/user-avatar-upload.tsx`

**Features**:
- Admin-only access control
- Optimistic UI updates
- Image deletion functionality
- Integration with user management API

**Usage**:
```typescript
<UserAvatarUpload
  user={user}
  onImageUpdate={(newImageUrl) => {
    // Handle successful image update
  }}
/>
```

### SquadImageUpload
Handles squad image/banner uploads with optimistic UI updates.

**Location**: `src/components/admin/squad-image-upload.tsx`

**Features**:
- Admin/Leader access control based on squad ownership
- Supports both squad image and banner uploads
- Optimistic UI updates
- Image deletion functionality

**Usage**:
```typescript
<SquadImageUpload
  squad={squad}
  fieldType="image" // or "banner"
  onImageUpdate={(newImageUrl) => {
    // Handle successful image update
  }}
/>
```

## Image Conversion Process

The upload components implement client-side image conversion using the HTML5 Canvas API:

1. **File Selection**: User selects image files
2. **Conversion**: Files are converted to JPG format with specified quality
3. **Optimization**: Images can be resized to max dimensions
4. **Upload**: Converted JPG files are uploaded to UploadThing
5. **Naming**: Server assigns custom names based on entity type and ID

**Conversion Utility**: `src/lib/image-converter.ts`

```typescript
interface ConversionOptions {
  quality?: number;    // 0.0 to 1.0, default: 0.9
  maxWidth?: number;   // Optional max width
  maxHeight?: number;  // Optional max height
}

const convertedFiles = await convertFilesToJpg(files, options);
```

## API Integration

### UploadThing Configuration
**Location**: `src/app/api/uploadthing/core.ts`

- **userAvatar endpoint**: Admin-only, max 2MB, custom naming
- **squadImage endpoint**: Admin/Leader access, max 4MB, custom naming

### Database Update APIs

#### User Avatar APIs
- `POST /api/admin/users/update-image`: Update user avatar
- `POST|DELETE /api/admin/users/delete-image`: Delete user avatar

#### Squad Image APIs  
- `POST /api/squads/update-image`: Update squad image/banner
- `POST|DELETE /api/squads/delete-image`: Delete squad image/banner

## File Naming Convention

Images are automatically renamed during upload:
- **User avatars**: `user_avatar_{userId}_{timestamp}.jpg`
- **Squad images**: `squad_image_{squadId}_{timestamp}.jpg`

## Role-Based Access Control

### User Avatars
- **Upload**: Admin only
- **Update**: Admin only  
- **Delete**: Admin only

### Squad Images
- **Upload**: Admin or Squad Leader
- **Update**: Admin or Squad Leader
- **Delete**: Admin or Squad Leader

## Error Handling

The components include comprehensive error handling:
- Image conversion failures
- Upload failures
- Network errors
- Permission errors
- File size/format validation

## Optimistic Updates

Both upload components implement optimistic UI updates:
1. Immediately show loading state
2. Display uploaded image before API confirmation
3. Revert on error with toast notification
4. Confirm success with API response

## Environment Variables

Required in `.env`:
```
UPLOADTHING_SECRET=your_secret_key
UPLOADTHING_APP_ID=your_app_id
```

## Demo Pages

- **Upload Demo**: `/dashboard/upload-demo` - Test upload functionality
- **Optimistic Demo**: `/dashboard/optimistic-demo` - Test optimistic updates
