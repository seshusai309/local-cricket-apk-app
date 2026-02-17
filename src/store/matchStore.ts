import { create } from "zustand";
import { Match, MatchState } from "../types";
import { databaseService } from "../services/database";
import { convertFromDB } from "../utils/typeConversion";

interface MatchStore extends MatchState {
  // Actions
  setCurrentMatch: (match: Match | null) => void;
  loadMatches: () => Promise<void>;
  saveMatch: (match: Match) => Promise<void>;
  createNewMatch: (teamName: string, maxOvers?: number) => Promise<Match>;
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

      // Set current match if there's an incomplete one
      const incompleteMatch = convertedMatches.find((match) => {
        return !match.isCompleted;
      });
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

      // Update matches list
      const matches = await databaseService.getMatches();
      const convertedMatches = matches.map((m) => convertFromDB(m));
      set({ matches: convertedMatches });

      // Update current match if it's the same one
      if (get().currentMatch?.id === match.id) {
        set({ currentMatch: convertFromDB(match) });
      }
    } catch (error) {
      console.error("Error saving match:", error);
      throw error;
    }
  },

  createNewMatch: async (teamName: string, maxOvers: number = 20) => {
    const newMatch: Match = {
      id: `match_${Date.now()}`,
      teamName,
      maxOvers,
      totalRuns: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: 0,
      players: [],
      oversList: [],
      currentStrikerId: "",
      currentNonStrikerId: "",
      currentBowlerId: "",
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    // Generate auto players with unique IDs based on match ID
    const batsmen = Array.from({ length: 11 }, (_, i) => ({
      id: `${newMatch.id}_bt${i + 1}`,
      name: `BT${i + 1}`,
      type: "batsman" as const,
      runs: 0,
      balls: 0,
      wickets: 0,
      runsConceded: 0,
      oversBowled: 0,
      isStriker: i === 0,
      isNonStriker: i === 1,
      isBowling: false,
    }));

    const bowlers = Array.from({ length: 5 }, (_, i) => ({
      id: `${newMatch.id}_b${i + 1}`,
      name: `B${i + 1}`,
      type: "bowler" as const,
      runs: 0,
      balls: 0,
      wickets: 0,
      runsConceded: 0,
      oversBowled: 0,
      isStriker: false,
      isNonStriker: false,
      isBowling: i === 0,
    }));

    newMatch.players = [...batsmen, ...bowlers];
    newMatch.currentStrikerId = batsmen[0].id;
    newMatch.currentNonStrikerId = batsmen[1].id;
    newMatch.currentBowlerId = bowlers[0].id;

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
    // Note: Match is saved when navigating away or completing match, not on every ball
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

      // Clear current match if it was deleted
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
