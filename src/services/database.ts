import * as SQLite from "expo-sqlite";
import { Match, Over, Ball, Player } from "../types";
import { convertFromDB } from "../utils/typeConversion";

const DB_NAME = "cricket.db";

export class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
    } catch (error) {
      console.error("Database initialization error:", error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error("Database not initialized");

    // Create matches table (removed DROP TABLE to preserve data)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        teamName TEXT NOT NULL,
        maxOvers INTEGER DEFAULT 20,
        totalRuns INTEGER DEFAULT 0,
        wickets INTEGER DEFAULT 0,
        overs INTEGER DEFAULT 0,
        balls INTEGER DEFAULT 0,
        extras INTEGER DEFAULT 0,
        currentStrikerId TEXT,
        currentNonStrikerId TEXT,
        currentBowlerId TEXT,
        isCompleted INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        completedAt TEXT
      );
    `);

    // Create players table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        matchId TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        runs INTEGER DEFAULT 0,
        balls INTEGER DEFAULT 0,
        wickets INTEGER DEFAULT 0,
        runsConceded INTEGER DEFAULT 0,
        oversBowled REAL DEFAULT 0,
        isStriker INTEGER DEFAULT 0,
        isNonStriker INTEGER DEFAULT 0,
        isBowling INTEGER DEFAULT 0,
        FOREIGN KEY (matchId) REFERENCES matches (id)
      );
    `);

    // Create overs table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS overs (
        id TEXT PRIMARY KEY,
        matchId TEXT NOT NULL,
        overNumber INTEGER NOT NULL,
        totalRuns INTEGER DEFAULT 0,
        wickets INTEGER DEFAULT 0,
        extras INTEGER DEFAULT 0,
        FOREIGN KEY (matchId) REFERENCES matches (id)
      );
    `);

    // Create balls table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS balls (
        id TEXT PRIMARY KEY,
        overId TEXT NOT NULL,
        overNumber INTEGER NOT NULL,
        ballNumber INTEGER NOT NULL,
        runs INTEGER DEFAULT 0,
        isWicket INTEGER DEFAULT 0,
        isWide INTEGER DEFAULT 0,
        isNoBall INTEGER DEFAULT 0,
        isDot INTEGER DEFAULT 0,
        batsmanId TEXT NOT NULL,
        bowlerId TEXT NOT NULL,
        FOREIGN KEY (overId) REFERENCES overs (id)
      );
    `);
  }

  async saveMatch(match: Match): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      // Save match
      await this.db.runAsync(
        `INSERT OR REPLACE INTO matches (
          id, teamName, maxOvers, totalRuns, wickets, overs, balls, extras,
          currentStrikerId, currentNonStrikerId, currentBowlerId,
          isCompleted, createdAt, completedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          match.id,
          match.teamName,
          match.maxOvers,
          match.totalRuns,
          match.wickets,
          match.overs,
          match.balls,
          match.extras,
          match.currentStrikerId,
          match.currentNonStrikerId,
          match.currentBowlerId,
          match.isCompleted ? 1 : 0,
          match.createdAt,
          match.completedAt || null,
        ],
      );

      // Save players
      for (const player of match.players) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO players (
            id, matchId, name, type, runs, balls, wickets,
            runsConceded, oversBowled, isStriker, isNonStriker, isBowling
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            player.id,
            match.id,
            player.name,
            player.type,
            player.runs,
            player.balls,
            player.wickets,
            player.runsConceded,
            player.oversBowled,
            player.isStriker ? 1 : 0,
            player.isNonStriker ? 1 : 0,
            player.isBowling ? 1 : 0,
          ],
        );
      }

      // Save overs and balls
      for (const over of match.oversList) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO overs (
            id, matchId, overNumber, totalRuns, wickets, extras
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            over.id,
            match.id,
            over.overNumber,
            over.totalRuns,
            over.wickets,
            over.extras,
          ],
        );

        for (const ball of over.balls) {
          await this.db.runAsync(
            `INSERT OR REPLACE INTO balls (
              id, overId, overNumber, ballNumber, runs, isWicket,
              isWide, isNoBall, isDot, batsmanId, bowlerId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              ball.id,
              over.id,
              ball.overNumber,
              ball.ballNumber,
              ball.runs,
              ball.isWicket ? 1 : 0,
              ball.isWide ? 1 : 0,
              ball.isNoBall ? 1 : 0,
              ball.isDot ? 1 : 0,
              ball.batsmanId,
              ball.bowlerId,
            ],
          );
        }
      }
    } catch (error) {
      console.error("Error saving match:", error);
      throw error;
    }
  }

  async getMatches(): Promise<Match[]> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const matches = (await this.db.getAllAsync(`
        SELECT * FROM matches ORDER BY createdAt DESC
      `)) as any[];

      const result: Match[] = [];

      for (const matchRow of matches) {
        const players = (await this.db.getAllAsync(
          `
          SELECT * FROM players WHERE matchId = ? ORDER BY id
        `,
          [matchRow.id],
        )) as any[];

        const overs = (await this.db.getAllAsync(
          `
          SELECT * FROM overs WHERE matchId = ? ORDER BY overNumber
        `,
          [matchRow.id],
        )) as any[];

        const oversList: Over[] = [];

        for (const overRow of overs) {
          const balls = (await this.db.getAllAsync(
            `
            SELECT * FROM balls WHERE overId = ? ORDER BY ballNumber
          `,
            [overRow.id],
          )) as any[];

          oversList.push({
            id: overRow.id,
            overNumber: overRow.overNumber,
            balls: balls.map((ball) => ({
              id: ball.id,
              overNumber: ball.overNumber,
              ballNumber: ball.ballNumber,
              runs: ball.runs,
              isWicket: Boolean(ball.isWicket),
              isWide: Boolean(ball.isWide),
              isNoBall: Boolean(ball.isNoBall),
              isDot: Boolean(ball.isDot),
              batsmanId: ball.batsmanId,
              bowlerId: ball.bowlerId,
            })),
            totalRuns: overRow.totalRuns,
            wickets: overRow.wickets,
            extras: overRow.extras,
          });
        }

        result.push(
          convertFromDB({
            id: matchRow.id,
            teamName: matchRow.teamName,
            maxOvers: matchRow.maxOvers,
            totalRuns: matchRow.totalRuns,
            wickets: matchRow.wickets,
            overs: matchRow.overs,
            balls: matchRow.balls,
            extras: matchRow.extras,
            players: players.map((player) => ({
              id: player.id,
              name: player.name,
              type: player.type,
              runs: player.runs,
              balls: player.balls,
              wickets: player.wickets,
              runsConceded: player.runsConceded,
              oversBowled: player.oversBowled,
              isStriker: Boolean(player.isStriker),
              isNonStriker: Boolean(player.isNonStriker),
              isBowling: Boolean(player.isBowling),
            })),
            oversList,
            currentStrikerId: matchRow.currentStrikerId,
            currentNonStrikerId: matchRow.currentNonStrikerId,
            currentBowlerId: matchRow.currentBowlerId,
            isCompleted: Boolean(matchRow.isCompleted),
            createdAt: matchRow.createdAt,
            completedAt: matchRow.completedAt,
          }),
        );
      }

      return result;
    } catch (error) {
      console.error("Error getting matches:", error);
      throw error;
    }
  }

  async getMatch(id: string): Promise<Match | null> {
    const matches = await this.getMatches();
    return matches.find((match) => match.id === id) || null;
  }

  async deleteMatch(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      // Delete balls first (foreign key constraint)
      await this.db.runAsync(
        `
        DELETE FROM balls WHERE overId IN (
          SELECT id FROM overs WHERE matchId = ?
        )
      `,
        [id],
      );

      // Delete overs
      await this.db.runAsync("DELETE FROM overs WHERE matchId = ?", [id]);

      // Delete players
      await this.db.runAsync("DELETE FROM players WHERE matchId = ?", [id]);

      // Delete match
      await this.db.runAsync("DELETE FROM matches WHERE id = ?", [id]);
    } catch (error) {
      console.error("Error deleting match:", error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
