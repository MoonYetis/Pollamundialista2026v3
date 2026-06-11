export interface Team {
  id: string;
  name: string;
  flag: string; // Emoji flag for easy presentation
  groupCode: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string; // Date string
  time: string; // Time string
  groupName: string; // "Grupo A", "Grupo B", etc.
  venue: string; // Venue stadium
  homeScore?: number | null; // Actual official score
  awayScore?: number | null; // Actual official score
  isMatchFinished: boolean; // If game has finished
}

export interface Prediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string; // Emoji representation
  isAdmin?: boolean;
  groupIds: string[]; // Group IDs the user belongs to
}

export interface Group {
  id: string;
  name: string;
  code: string; // Code to share and join
  description: string;
  creatorId: string;
}

export interface ScoreReport {
  points: number;
  type: 'exact' | 'outcome' | 'none'; // exact = 3 pts, outcome = 1 pt, none = 0
}
