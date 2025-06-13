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
import type { Squad, SquadMember } from "@/types";

export function MemberSquadView() {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSquadData = async () => {
    try {
      setLoading(true);
      // Fetch all squads (members can view all squads in read-only mode)
      const squadResponse = await fetch("/api/squads");
      if (!squadResponse.ok) {
        throw new Error("Failed to fetch squads");
      }
      const squadData = (await squadResponse.json()) as Squad[];

      if (squadData.length === 0) {
        setSquad(null);
        setMembers([]);
        return;
      }

      // For now, show the first squad. In a real app, you might want to show
      // the user's own squad or let them select which squad to view
      const firstSquad = squadData[0];
      if (firstSquad) {
        setSquad(firstSquad);

        // Fetch squad members
        const membersResponse = await fetch(
          `/api/squads/${firstSquad.id}/members`,
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
          <h3 className="mb-2 text-lg font-semibold">No Squads Available</h3>
          <p className="text-muted-foreground">
            There are no squads created yet. Contact an admin to create squads.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{squad.name}</h2>
        <p className="text-muted-foreground">
          Squad information and member details
        </p>
      </div>

      {/* Squad Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{members.length}</div>
          <div className="text-muted-foreground text-sm">Total Members</div>
        </Card>
        <Card className="p-4">
          <div className="text-lg font-bold">
            {squad.leaderName ?? "No Leader"}
          </div>
          <div className="text-muted-foreground text-sm">Squad Leader</div>
          {squad.leaderIgn && (
            <div className="text-muted-foreground text-xs">
              IGN: {squad.leaderIgn}
            </div>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-lg font-bold">
            {new Date(squad.createdAt).toLocaleDateString()}
          </div>
          <div className="text-muted-foreground text-sm">Created Date</div>
        </Card>
        <Card className="p-4">
          <div className="text-lg font-bold">Active</div>
          <div className="text-muted-foreground text-sm">Squad Status</div>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Squad Members</h3>
          {members.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No members in this squad yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>IGN</TableHead>
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
