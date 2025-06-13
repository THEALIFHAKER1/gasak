"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconPlus, IconSearch, IconEdit, IconTrash } from "@tabler/icons-react";

// Simple toast implementation to avoid TypeScript issues
const toast = {
  success: (message: string) => {
    // For now, use console.log. In production, integrate with a proper toast library
    console.log("SUCCESS:", message);
    // You can replace this with any toast notification you prefer
  },
  error: (message: string) => {
    // For now, use console.log. In production, integrate with a proper toast library
    console.log("ERROR:", message);
    // You can replace this with any toast notification you prefer
  },
};

// Utility function to censor email addresses
const censorEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  const localLength = localPart.length;
  if (localLength <= 2) {
    // For very short emails, show first character + ***
    return `${localPart[0]}***@${domain}`;
  } else if (localLength <= 4) {
    // For short emails, show first and last character + ***
    return `${localPart[0]}***${localPart[localLength - 1]}@${domain}`;
  } else {
    // For longer emails, show first 2 and last 1 character + ***
    return `${localPart.slice(0, 2)}***${localPart[localLength - 1]}@${domain}`;
  }
};

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "leader" | "member";
  ign?: string | null;
  image?: string | null;
  squadName?: string | null;
  squadId?: string | null;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    void fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = (await response.json()) as User[];
        setUsers(data);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "leader" | "member";
    ign?: string;
    image?: string | null;
  }) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        await response.json();
        toast.success("User created successfully");
        void fetchUsers();
        setShowCreateDialog(false);
      } else {
        const error = (await response.json()) as { error?: string };
        toast.error(error.error ?? "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Error creating user");
    }
  };
  const handleUpdateUser = async (
    userId: string,
    userData: {
      name: string;
      email: string;
      role: "admin" | "leader" | "member";
      password?: string;
      ign?: string;
      image?: string | null;
    },
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast.success("User updated successfully");
        void fetchUsers();
        setEditingUser(null);
      } else {
        const error = (await response.json()) as { error?: string };
        toast.error(error.error ?? "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updating user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("User deleted successfully");
        void fetchUsers();
        setDeletingUser(null);
      } else {
        const error = (await response.json()) as { error?: string };
        toast.error(error.error ?? "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-300";
      case "leader":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "member":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const canDeleteUser = (user: User) => {
    return user.id !== session?.user?.id;
  };

  const canEditUser = (user: User) => {
    // Admin can edit all users, but prevent self-demotion
    if (user.id === session?.user?.id) {
      return true; // Can edit own info but role change will be restricted in dialog
    }
    return true;
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Heading
          title="User Management"
          description="Manage users, roles, and permissions in your organization."
        />
        <Button onClick={() => setShowCreateDialog(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative max-w-sm flex-1">
              <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">User</th>
                  <th className="p-4 text-left font-medium">Email</th>
                  <th className="p-4 text-left font-medium">IGN</th>
                  <th className="p-4 text-left font-medium">Role</th>
                  <th className="p-4 text-left font-medium">Squad</th>
                  <th className="p-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.image ?? undefined}
                            alt={user.name ?? "User"}
                          />
                          <AvatarFallback>
                            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name ?? "N/A"}</p>
                          <p className="text-muted-foreground text-sm">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4" title={user.email}>
                      {censorEmail(user.email)}
                    </td>
                    <td className="p-4">{user.ign ?? "Not set"}</td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${getRoleColor(user.role)}`}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {user.squadName ? (
                        <Badge variant="secondary" className="text-xs">
                          {user.squadName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No squad
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {canEditUser(user) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDeleteUser(user) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingUser(user)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-muted-foreground py-8 text-center">
                No users found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateUser={handleCreateUser}
      />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUpdateUser={handleUpdateUser}
          isCurrentUser={editingUser.id === session?.user?.id}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onOpenChange={(open) => !open && setDeletingUser(null)}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </PageContainer>
  );
}
