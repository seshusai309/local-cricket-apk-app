export interface Player {
  id: string;
  name: string;
  type: 'player';          // all players are equal — role is decided during play
  teamId: 'team1' | 'team2';
  isDismissed: boolean;    // true once the player is out
  runs: number;
  balls: number;
  wickets: number;
  runsConceded: number;
  oversBowled: number;
  isStriker?: boolean;
  isNonStriker?: boolean;
  isBowling?: boolean;
}

export interface Ball {
  id: string;
  overNumber: number;
  ballNumber: number;
  runs: number;
  isWicket: boolean;
  isWide: boolean;
  isNoBall: boolean;
  is1stBounce: boolean;
  isDot: boolean;
  batsmanId: string;
  bowlerId: string;
}

export interface Over {
  id: string;
  overNumber: number;
  inningsNumber: 1 | 2;
  balls: Ball[];
  totalRuns: number;
  wickets: number;
  extras: number;
}

export interface Highlight {
  id: string;
  type: 'six' | 'four' | 'wicket' | 'hattrick';
  overNumber: number;
  ballNumber: number;
  batsmanName: string;
  bowlerName: string;
  label: string;
  emoji: string;
}

export interface SavedTeam {
  id: string;
  name: string;
  players: string[];  // 11 player names
}

export interface Match {
  id: string;
  teamName: string;        // team1 name (batting first)
  team2Name: string;       // team2 name (batting second)
  maxOvers: number;
  targetScore: number;
  totalRuns: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: number;
  players: Player[];
  oversList: Over[];       // current innings overs
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
  // Two-innings support
  currentInnings: 1 | 2;
  innings1Score: number;
  innings1Wickets: number;
  innings1Balls: number;
  innings1Extras: number;
  innings1OversList: Over[];
}

export interface MatchState {
  currentMatch: Match | null;
  matches: Match[];
  isLoading: boolean;
}
