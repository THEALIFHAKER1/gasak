"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { JpgUploadButton } from "@/components/ui/jpg-upload-button";
import {
  Trash2,
  User,
  Shield,
  Camera,
  Eye,
  EyeOff,
  Crown,
  Users,
  UserCheck,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "leader" | "member";
  ign?: string | null;
  image?: string | null;
}

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateUser: (
    userId: string,
    userData: {
      name: string;
      email: string;
      role: "admin" | "leader" | "member";
      password?: string;
      ign?: string;
      image?: string | null;
    },
  ) => void;
  isCurrentUser: boolean;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onUpdateUser,
  isCurrentUser,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "member" as "admin" | "leader" | "member",
    password: "",
    confirmPassword: "",
    ign: "",
    image: "" as string | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? "",
        email: user.email,
        role: user.role,
        password: "",
        confirmPassword: "",
        ign: user.ign ?? "",
        image: user.image ?? null,
      });
      setChangePassword(false);
      setErrors({});
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (changePassword) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updateData: {
      name: string;
      email: string;
      role: "admin" | "leader" | "member";
      password?: string;
      ign?: string;
      image?: string | null;
    } = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      ign: formData.ign,
      image: formData.image,
    };

    if (changePassword && formData.password) {
      updateData.password = formData.password;
    }

    onUpdateUser(user.id, updateData);
  };

  const handleChange = (field: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[800px]">
        {/* Header with gradient */}
        <div className="from-primary/10 via-primary/5 to-background border-b bg-gradient-to-r p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4 text-xl">
              <div className="relative">
                <Avatar className="border-primary/20 h-12 w-12 border-2">
                  <AvatarImage
                    src={user.image ?? undefined}
                    alt={user.name ?? "User"}
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-primary absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full">
                  <User className="text-primary-foreground h-2 w-2" />
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold">
                  {user.name ?? "Unnamed User"}
                </div>
                <div className="text-muted-foreground text-sm font-normal">
                  {user.email} •
                  <Badge variant="outline" className="ml-2 text-xs">
                    {user.role === "admin" && (
                      <Crown className="mr-1 h-3 w-3" />
                    )}
                    {user.role === "leader" && (
                      <Shield className="mr-1 h-3 w-3" />
                    )}
                    {user.role === "member" && (
                      <Users className="mr-1 h-3 w-3" />
                    )}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="mt-2">
              Update user information, permissions, and profile settings
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Profile Picture Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Camera className="h-4 w-4" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="border-background mb-4 h-24 w-24 border-4 shadow-lg">
                    <AvatarImage
                      src={formData.image ?? undefined}
                      alt="Profile preview"
                    />
                    <AvatarFallback className="text-2xl">
                      {formData.name.slice(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>

                  {formData.image ? (
                    <div className="w-full space-y-3">
                      <p className="text-muted-foreground text-sm">
                        Image uploaded
                      </p>
                      <div className="flex flex-col gap-2">
                        <JpgUploadButton
                          endpoint="userAvatar"
                          input={{ targetUserId: user.id }}
                          enableCrop={true}
                          onClientUploadComplete={(res) => {
                            const imageUrl = res[0]?.url;
                            if (imageUrl) {
                              handleChange("image", imageUrl);
                              toast.success("Profile picture updated");
                            }
                          }}
                          onUploadError={(error) => {
                            console.error("Upload error:", error);
                            toast.error("Failed to upload image");
                          }}
                          quality={0.8}
                          maxWidth={400}
                          maxHeight={400}
                        >
                          <div className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-black transition-colors duration-200 hover:bg-gray-50">
                            <Camera className="h-4 w-4" />
                            Change Picture
                          </div>
                        </JpgUploadButton>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await fetch(
                                "/api/admin/users/delete-image",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ userId: user.id }),
                                },
                              );

                              if (response.ok) {
                                handleChange("image", null);
                                toast.success("Profile picture deleted");
                              } else {
                                toast.error("Failed to delete image");
                              }
                            } catch (error) {
                              console.error("Delete error:", error);
                              toast.error("Failed to delete image");
                            }
                          }}
                          className="h-9 w-full"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <p className="text-muted-foreground mb-4 text-sm">
                        No profile picture
                      </p>
                      <JpgUploadButton
                        endpoint="userAvatar"
                        input={{ targetUserId: user.id }}
                        enableCrop={true}
                        onClientUploadComplete={(res) => {
                          const imageUrl = res[0]?.url;
                          if (imageUrl) {
                            handleChange("image", imageUrl);
                            toast.success("Image uploaded successfully");
                          }
                        }}
                        onUploadError={(error) => {
                          console.error("Upload error:", error);
                          toast.error("Failed to upload image");
                        }}
                        quality={0.8}
                        maxWidth={400}
                        maxHeight={400}
                      >
                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-black transition-colors duration-200 hover:bg-gray-50"
                        >
                          <Camera className="h-4 w-4" />
                          Upload Picture
                        </button>
                      </JpgUploadButton>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Information Cards */}
            <div className="space-y-6 lg:col-span-2">
              {/* Basic Information Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserCheck className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter user's full name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <span className="text-sm text-red-500">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="Enter user's email"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <span className="text-sm text-red-500">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ign" className="text-sm font-medium">
                      In-Game Name (IGN)
                    </label>
                    <Input
                      id="ign"
                      value={formData.ign}
                      onChange={(e) => handleChange("ign", e.target.value)}
                      placeholder="Enter user's in-game name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Role & Permissions
                    </label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: string) =>
                        handleChange("role", value)
                      }
                      disabled={isCurrentUser}
                    >
                      <SelectTrigger
                        className={isCurrentUser ? "opacity-50" : ""}
                      >
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            Member
                          </div>
                        </SelectItem>
                        <SelectItem value="leader">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                            Leader
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {isCurrentUser && (
                      <p className="text-muted-foreground text-xs">
                        Cannot change your own role
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lock className="h-4 w-4" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Change Password</p>
                      <p className="text-muted-foreground text-xs">
                        Update the user&apos;s login credentials
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={changePassword ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChangePassword(!changePassword)}
                    >
                      {changePassword ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Change
                        </>
                      )}
                    </Button>
                  </div>

                  {changePassword && (
                    <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="password"
                          className="text-sm font-medium"
                        >
                          New Password
                        </label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            handleChange("password", e.target.value)
                          }
                          placeholder="Enter new password"
                          className={errors.password ? "border-red-500" : ""}
                        />
                        {errors.password && (
                          <span className="text-sm text-red-500">
                            {errors.password}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="confirmPassword"
                          className="text-sm font-medium"
                        >
                          Confirm Password
                        </label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleChange("confirmPassword", e.target.value)
                          }
                          placeholder="Confirm new password"
                          className={
                            errors.confirmPassword ? "border-red-500" : ""
                          }
                        />
                        {errors.confirmPassword && (
                          <span className="text-sm text-red-500">
                            {errors.confirmPassword}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-6" />

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button type="submit" className="min-w-[120px]">
              <UserCheck className="mr-2 h-4 w-4" />
              Update User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
