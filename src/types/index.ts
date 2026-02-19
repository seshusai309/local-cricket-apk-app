export interface Player {
  id: string;
  name: string;
  type: "batsman" | "bowler";
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
  balls: Ball[];
  totalRuns: number;
  wickets: number;
  extras: number;
}

export interface Match {
  id: string;
  teamName: string;
  maxOvers: number;
  totalRuns: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: number;
  players: Player[];
  oversList: Over[];
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface MatchState {
  currentMatch: Match | null;
  matches: Match[];
  isLoading: boolean;
}
