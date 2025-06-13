"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LeaderManageMembersDialog } from "./leader-manage-members-dialog";
import { LeaderSquadImageManager } from "./squad-image-manager";
import type { Squad, SquadMember } from "@/types";
import { IconUsers } from "@tabler/icons-react";

export function LeaderSquadManagement() {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSquadData = async () => {
    try {
      setLoading(true);
      // Fetch squad information
      const squadResponse = await fetch("/api/squads");
      if (!squadResponse.ok) {
        throw new Error("Failed to fetch squad");
      }
      const squadData = (await squadResponse.json()) as Squad[];

      if (squadData.length === 0) {
        setSquad(null);
        setMembers([]);
        return;
      }

      const userSquad = squadData[0];
      if (userSquad) {
        setSquad(userSquad);

        // Fetch squad members
        const membersResponse = await fetch(
          `/api/squads/${userSquad.id}/members`,
        );
        if (membersResponse.ok) {
          const membersData = (await membersResponse.json()) as SquadMember[];
          setMembers(membersData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void fetchSquadData();
  }, []);

  const handleMembersUpdated = () => {
    void fetchSquadData();
  };

  const handleSquadImageUpdate = (
    squadId: string,
    field: "image" | "banner",
    imageUrl: string,
  ) => {
    // Optimistic update - update squad image immediately
    setSquad((prev) => (prev ? { ...prev, [field]: imageUrl } : prev));
  };

  const handleSquadImageDelete = (
    squadId: string,
    field: "image" | "banner",
  ) => {
    // Optimistic update - remove squad image immediately
    setSquad((prev) => (prev ? { ...prev, [field]: null } : prev));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading squad information...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">Error: {error}</div>
        <Button onClick={fetchSquadData} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  if (!squad) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold">No Squad Assigned</h3>
          <p className="text-muted-foreground">
            You haven&apos;t been assigned to a squad yet. Contact an admin to
            get assigned to a squad.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{squad.name}</h2>
          <p className="text-muted-foreground">
            Manage your squad members and track team performance
          </p>
        </div>
        <LeaderManageMembersDialog
          squad={squad}
          onMembersUpdated={handleMembersUpdated}
        >
          <Button>
            <IconUsers className="mr-2 h-4 w-4" />
            Manage Members
          </Button>
        </LeaderManageMembersDialog>
      </div>

      {/* Squad Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-2xl font-bold">{members.length}</div>
          <div className="text-muted-foreground text-sm">Total Members</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {new Date(squad.createdAt).toLocaleDateString()}
          </div>
          <div className="text-muted-foreground text-sm">Squad Created</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">Active</div>
          <div className="text-muted-foreground text-sm">Squad Status</div>
        </Card>
      </div>

      {/* Squad Image Management */}
      <LeaderSquadImageManager
        squad={squad}
        onSquadUpdate={handleSquadImageUpdate}
        onSquadImageDelete={handleSquadImageDelete}
      />

      {/* Members List */}
      <Card>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Squad Members</h3>
          {members.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No members in your squad yet. Use the &quot;Manage Members&quot;
              button to add members.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>IGN</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.userName ?? "Unnamed User"}
                    </TableCell>
                    <TableCell>
                      {member.userIgn ? (
                        <Badge variant="outline">{member.userIgn}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {member.userEmail}
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
