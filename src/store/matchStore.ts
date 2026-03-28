import { create } from "zustand";
import { Match, MatchState, Player } from "../types";
import { databaseService } from "../services/database";
import { convertFromDB } from "../utils/typeConversion";

export interface CreateMatchConfig {
  team1Name: string;
  team2Name: string;
  maxOvers: number;
  team1Players: string[];  // 11 names
  team2Players: string[];  // 11 names
}

interface MatchStore extends MatchState {
  setCurrentMatch: (match: Match | null) => void;
  loadMatches: () => Promise<void>;
  saveMatch: (match: Match) => Promise<void>;
  createNewMatch: (config: CreateMatchConfig) => Promise<Match>;
  updateMatch: (updates: Partial<Match>) => void;
  updateMatchInStore: (updates: Partial<Match>) => void;
  completeMatch: () => void;
  deleteMatch: (id: string) => Promise<void>;
  reset: () => void;
}

const initialState: MatchState = {
  currentMatch: null,
  matches: [],
  isLoading: false,
};

export const useMatchStore = create<MatchStore>((set, get) => ({
  ...initialState,

  setCurrentMatch: (match) => {
    set({ currentMatch: match });
  },

  updateMatchInStore: (updates: Partial<Match>) => {
    const currentMatch = get().currentMatch;
    if (!currentMatch) return;
    set({ currentMatch: { ...currentMatch, ...updates } });
  },

  loadMatches: async () => {
    set({ isLoading: true });
    try {
      const matches = await databaseService.getMatches();
      const convertedMatches = matches.map((match) => convertFromDB(match));
      set({ matches: convertedMatches, isLoading: false });

      const incompleteMatch = convertedMatches.find((match) => !match.isCompleted);
      if (incompleteMatch) {
        set({ currentMatch: incompleteMatch });
      } else {
        set({ currentMatch: null });
      }
    } catch (error) {
      console.error("Error loading matches:", error);
      set({ isLoading: false, currentMatch: null });
    }
  },

  saveMatch: async (match) => {
    try {
      await databaseService.saveMatch(match);
      const matches = await databaseService.getMatches();
      const convertedMatches = matches.map((m) => convertFromDB(m));
      set({ matches: convertedMatches });
      if (get().currentMatch?.id === match.id) {
        set({ currentMatch: convertFromDB(match) });
      }
    } catch (error) {
      console.error("Error saving match:", error);
      throw error;
    }
  },

  createNewMatch: async (config: CreateMatchConfig) => {
    const matchId = `match_${Date.now()}`;

    const team1Players: Player[] = config.team1Players.map((name, i) => ({
      id: `${matchId}_t1_p${i + 1}`,
      name: name || `Player ${i + 1}`,
      type: 'player' as const,
      teamId: 'team1' as const,
      isDismissed: false,
      runs: 0, balls: 0, wickets: 0, runsConceded: 0, oversBowled: 0,
      isStriker: false, isNonStriker: false, isBowling: false,
    }));

    const team2Players: Player[] = config.team2Players.map((name, i) => ({
      id: `${matchId}_t2_p${i + 1}`,
      name: name || `Player ${i + 1}`,
      type: 'player' as const,
      teamId: 'team2' as const,
      isDismissed: false,
      runs: 0, balls: 0, wickets: 0, runsConceded: 0, oversBowled: 0,
      isStriker: false, isNonStriker: false, isBowling: false,
    }));

    const newMatch: Match = {
      id: matchId,
      teamName: config.team1Name,
      team2Name: config.team2Name,
      maxOvers: config.maxOvers,
      targetScore: 0,
      totalRuns: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: 0,
      players: [...team1Players, ...team2Players],
      oversList: [],
      currentStrikerId: '',
      currentNonStrikerId: '',
      currentBowlerId: '',
      isCompleted: false,
      createdAt: new Date().toISOString(),
      currentInnings: 1,
      innings1Score: 0,
      innings1Wickets: 0,
      innings1Balls: 0,
      innings1Extras: 0,
      innings1OversList: [],
    };

    try {
      await databaseService.saveMatch(newMatch);
      const matches = await databaseService.getMatches();
      set({ currentMatch: newMatch, matches });
      return newMatch;
    } catch (error) {
      console.error("Error creating new match:", error);
      throw error;
    }
  },

  updateMatch: (updates) => {
    const currentMatch = get().currentMatch;
    if (!currentMatch) return;
    const updatedMatch = { ...currentMatch, ...updates };
    set({ currentMatch: updatedMatch });
    // Persist every update to prevent data loss on crash
    databaseService.saveMatch(updatedMatch).catch((err) =>
      console.error("Background save error:", err)
    );
  },

  completeMatch: () => {
    const currentMatch = get().currentMatch;
    if (!currentMatch) return;
    const completedMatch = {
      ...currentMatch,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };
    set({ currentMatch: null });
    get().saveMatch(completedMatch);
  },

  deleteMatch: async (id) => {
    try {
      await databaseService.deleteMatch(id);
      const matches = await databaseService.getMatches();
      const convertedMatches = matches.map((match) => convertFromDB(match));
      set({ matches: convertedMatches });
      if (get().currentMatch?.id === id) {
        set({ currentMatch: null });
      }
    } catch (error) {
      console.error("Error deleting match:", error);
      throw error;
    }
  },

  reset: () => {
    set(initialState);
  },
}));
