"use client";

import { useState, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { JpgUploadButton } from "@/components/ui/jpg-upload-button";
import {
  UserPlus,
  User,
  Shield,
  Camera,
  Lock,
  Crown,
  Users,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUser: (userData: {
    id?: string;
    name: string;
    email: string;
    password: string;
    role: "admin" | "leader" | "member";
    ign?: string;
    image?: string | null;
  }) => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onCreateUser,
}: CreateUserDialogProps) {
  // Generate a stable user ID that will be used for both upload and user creation
  const tempUserId = useMemo(() => crypto.randomUUID(), []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "member" as "admin" | "leader" | "member",
    ign: "",
    image: null as string | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    onCreateUser({
      id: tempUserId,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      ign: formData.ign,
      image: formData.image,
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "member",
      ign: "",
      image: null,
    });
    setErrors({});
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
        <div className="to-background border-b bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4 text-xl">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                  <UserCheck className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold">Create New User</div>
                <div className="text-muted-foreground text-sm font-normal">
                  Add a new member to your organization
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="mt-2">
              Set up a new user account with profile information and access
              permissions
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
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl text-white">
                      {formData.name.slice(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>

                  {formData.image ? (
                    <div className="w-full space-y-3">
                      <p className="text-muted-foreground text-sm">
                        Image uploaded
                      </p>
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          <JpgUploadButton
                            endpoint="userAvatar"
                            input={{ targetUserId: tempUserId }}
                            enableCrop={true}
                            onClientUploadComplete={(res) => {
                              const imageUrl = res[0]?.url;
                              if (imageUrl) {
                                handleChange("image", imageUrl);
                                toast.success("Profile picture uploaded");
                              }
                            }}
                            onUploadError={(error) => {
                              console.error("Upload error:", error);
                              toast.error("Failed to upload image");
                            }}
                            appearance={{
                              button:
                                "w-full h-9 px-4 text-sm font-medium opacity-0 absolute inset-0 cursor-pointer z-10",
                              allowedContent: "hidden",
                            }}
                            quality={0.8}
                            maxWidth={400}
                            maxHeight={400}
                          />
                          <div className="pointer-events-none flex h-9 w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-black transition-colors duration-200 hover:bg-gray-50">
                            <Camera className="h-4 w-4" />
                            Change Picture
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleChange("image", null)}
                          className="h-9 w-full"
                        >
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
                        input={{ targetUserId: tempUserId }}
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
                        <div className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-black transition-colors duration-200 hover:bg-gray-50">
                          <Camera className="h-4 w-4" />
                          Upload Picture
                        </div>
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
                    <User className="h-4 w-4" />
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
                      placeholder="Enter user's in-game name (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Role & Permissions
                    </label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleChange("role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                              <div className="font-medium">Member</div>
                              <div className="text-muted-foreground text-xs">
                                Basic access to assigned tasks
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="leader">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-orange-500" />
                            <div>
                              <div className="font-medium">Leader</div>
                              <div className="text-muted-foreground text-xs">
                                Manage squad and assign tasks
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-red-500" />
                            <div>
                              <div className="font-medium">Admin</div>
                              <div className="text-muted-foreground text-xs">
                                Full system administration access
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Enter password"
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
                      placeholder="Confirm password"
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                      <span className="text-sm text-red-500">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
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
            <Button
              type="submit"
              className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
