export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  isAdmin: boolean;
}

export interface Invitation {
  toUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Tournament {
  id: string;
  name: string;
  creatorId: string;
  participants: string[]; // User UIDs
  invitations: Invitation[];
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  tournamentId: string;
}

export interface MatchResult {
  matchId: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'finished';
  isLocked?: boolean;
}

export interface Match {
  id: string;
  group: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  date: string;
}

export interface AppNotification {
  id: string;
  toUserId: string;
  fromUsername: string;
  tournamentId: string;
  tournamentName: string;
  type: 'invitation';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}
