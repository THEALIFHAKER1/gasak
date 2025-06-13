export * from "./auth";

// Squad types
export interface Squad {
  id: string;
  name: string;
  leaderId: string | null;
  leaderName?: string | null;
  leaderIgn?: string | null;
  memberCount?: number;
  members?: SquadMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SquadMember {
  id: string;
  userId: string;
  squadId: string;
  userName?: string | null;
  userIgn?: string | null;
  userEmail?: string | null;
  joinedAt: Date;
}

export interface CreateSquadData {
  name: string;
  leaderId?: string;
}

export interface UpdateSquadData {
  name?: string;
  leaderId?: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon: string;
  isActive?: boolean;
  shortcut?: string[];
  items?: NavItem[];
}
