"use client";

import React, { useState, useEffect } from "react";
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
import type { Squad } from "@/types";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUsers,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import PageContainer from "@/components/layout/page-container";
import { CreateSquadDialog } from "@/components/admin/create-squad-dialog";
import { EditSquadDialog } from "@/components/admin/edit-squad-dialog";
import { DeleteSquadDialog } from "@/components/admin/delete-squad-dialog";
import { ManageMembersDialog } from "@/components/admin/manage-members-dialog";
import { SquadImageUpload } from "@/components/admin/squad-image-upload";
import { Heading } from "@/components/ui/heading";

export default function AdminSquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSquads, setExpandedSquads] = useState<Set<string>>(new Set());

  const toggleSquadExpansion = (squadId: string) => {
    setExpandedSquads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(squadId)) {
        newSet.delete(squadId);
      } else {
        newSet.add(squadId);
      }
      return newSet;
    });
  };

  const fetchSquads = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/squads");
      if (!response.ok) {
        throw new Error("Failed to fetch squads");
      }
      const data = (await response.json()) as Squad[];
      setSquads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSquads();
  }, []);

  const handleSquadCreated = () => {
    void fetchSquads();
  };

  const handleSquadUpdated = () => {
    void fetchSquads();
  };

  const handleSquadDeleted = () => {
    void fetchSquads();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading squads...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">Error: {error}</div>
        <Button onClick={fetchSquads} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Heading
          title="Squad Management"
          description="Manage squads, assign leaders, and organize team members"
        />

        <CreateSquadDialog onSquadCreated={handleSquadCreated}>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Create Squad
          </Button>
        </CreateSquadDialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Squad Name</TableHead>
              <TableHead>Leader</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Images</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {squads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <div className="text-muted-foreground">
                    No squads found. Create your first squad to get started.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              squads.map((squad) => (
                <React.Fragment key={squad.id}>
                  <TableRow
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleSquadExpansion(squad.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {expandedSquads.has(squad.id) ? (
                          <IconChevronDown className="text-muted-foreground h-4 w-4" />
                        ) : (
                          <IconChevronRight className="text-muted-foreground h-4 w-4" />
                        )}
                        {squad.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {squad.leaderName ? (
                        <div>
                          <div className="font-medium">{squad.leaderName}</div>
                          {squad.leaderIgn && (
                            <div className="text-muted-foreground text-sm">
                              IGN: {squad.leaderIgn}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary">No Leader</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {squad.memberCount ?? 0} members
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(squad.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <SquadImageUpload
                        squadId={squad.id}
                        squadName={squad.name}
                        currentImage={squad.image}
                        currentBanner={squad.banner}
                        onImageUpdate={(imageUrl, fieldType) => {
                          // Optimistic update - update UI immediately
                          setSquads((prev) =>
                            prev.map((s) =>
                              s.id === squad.id
                                ? {
                                    ...s,
                                    [fieldType]: imageUrl,
                                  }
                                : s,
                            ),
                          );
                        }}
                        onImageDelete={(fieldType) => {
                          // Optimistic update - remove image immediately
                          setSquads((prev) =>
                            prev.map((s) =>
                              s.id === squad.id
                                ? {
                                    ...s,
                                    [fieldType]: null,
                                  }
                                : s,
                            ),
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ManageMembersDialog
                          squad={squad}
                          onMembersUpdated={handleSquadUpdated}
                        >
                          <Button variant="outline" size="sm">
                            <IconUsers className="h-4 w-4" />
                          </Button>
                        </ManageMembersDialog>
                        <EditSquadDialog
                          squad={squad}
                          onSquadUpdated={handleSquadUpdated}
                        >
                          <Button variant="outline" size="sm">
                            <IconEdit className="h-4 w-4" />
                          </Button>
                        </EditSquadDialog>
                        <DeleteSquadDialog
                          squad={squad}
                          onSquadDeleted={handleSquadDeleted}
                        >
                          <Button variant="outline" size="sm">
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </DeleteSquadDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedSquads.has(squad.id) && (
                    <TableRow>
                      <TableCell colSpan={5} className="p-0">
                        <div className="bg-muted/20 border-t p-4">
                          <h4 className="mb-3 text-sm font-semibold">
                            Squad Members
                          </h4>
                          {squad.members && squad.members.length > 0 ? (
                            <div className="grid gap-2">
                              {squad.members.map((member) => (
                                <div
                                  key={member.id}
                                  className="bg-background flex items-center justify-between rounded border p-2 text-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="font-medium">
                                      {member.userName ?? "Unnamed User"}
                                    </div>
                                    {member.userIgn && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        IGN: {member.userIgn}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-muted-foreground text-xs">
                                    Joined{" "}
                                    {new Date(
                                      member.joinedAt,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-muted-foreground text-sm italic">
                              No members in this squad yet.
                            </div>
                          )}
                        </div>{" "}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}
