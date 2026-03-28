import * as SQLite from "expo-sqlite";
import { Match, Over, Ball, Player, SavedTeam } from "../types";
import { convertFromDB } from "../utils/typeConversion";

const DB_NAME = "cricket.db";

export class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      await this.runMigrations();
    } catch (error) {
      console.error("Database initialization error:", error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        teamName TEXT NOT NULL,
        team2Name TEXT DEFAULT '',
        maxOvers INTEGER DEFAULT 20,
        targetScore INTEGER DEFAULT 0,
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
        completedAt TEXT,
        currentInnings INTEGER DEFAULT 1,
        innings1Score INTEGER DEFAULT 0,
        innings1Wickets INTEGER DEFAULT 0,
        innings1Balls INTEGER DEFAULT 0,
        innings1Extras INTEGER DEFAULT 0
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        matchId TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        teamId TEXT DEFAULT 'team1',
        isDismissed INTEGER DEFAULT 0,
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

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS saved_teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        players TEXT NOT NULL
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS overs (
        id TEXT PRIMARY KEY,
        matchId TEXT NOT NULL,
        overNumber INTEGER NOT NULL,
        inningsNumber INTEGER DEFAULT 1,
        totalRuns INTEGER DEFAULT 0,
        wickets INTEGER DEFAULT 0,
        extras INTEGER DEFAULT 0,
        FOREIGN KEY (matchId) REFERENCES matches (id)
      );
    `);

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
        is1stBounce INTEGER DEFAULT 0,
        isDot INTEGER DEFAULT 0,
        batsmanId TEXT NOT NULL,
        bowlerId TEXT NOT NULL,
        FOREIGN KEY (overId) REFERENCES overs (id)
      );
    `);
  }

  private async runMigrations() {
    if (!this.db) return;

    const migrations = [
      // Legacy ball columns
      `ALTER TABLE balls ADD COLUMN is1stBounce INTEGER DEFAULT 0`,
      `ALTER TABLE balls ADD COLUMN isDot INTEGER DEFAULT 0`,
      `ALTER TABLE balls ADD COLUMN overNumber INTEGER DEFAULT 0`,
      `ALTER TABLE balls ADD COLUMN ballNumber INTEGER DEFAULT 0`,
      `ALTER TABLE balls ADD COLUMN batsmanId TEXT DEFAULT ''`,
      `ALTER TABLE balls ADD COLUMN bowlerId TEXT DEFAULT ''`,
      // Legacy match columns
      `ALTER TABLE matches ADD COLUMN targetScore INTEGER DEFAULT 0`,
      // Two-innings support
      `ALTER TABLE matches ADD COLUMN team2Name TEXT DEFAULT ''`,
      `ALTER TABLE matches ADD COLUMN currentInnings INTEGER DEFAULT 1`,
      `ALTER TABLE matches ADD COLUMN innings1Score INTEGER DEFAULT 0`,
      `ALTER TABLE matches ADD COLUMN innings1Wickets INTEGER DEFAULT 0`,
      `ALTER TABLE matches ADD COLUMN innings1Balls INTEGER DEFAULT 0`,
      `ALTER TABLE matches ADD COLUMN innings1Extras INTEGER DEFAULT 0`,
      // Player team tracking
      `ALTER TABLE players ADD COLUMN teamId TEXT DEFAULT 'team1'`,
      // Over innings tracking
      `ALTER TABLE overs ADD COLUMN inningsNumber INTEGER DEFAULT 1`,
      // Player dismissal tracking
      `ALTER TABLE players ADD COLUMN isDismissed INTEGER DEFAULT 0`,
    ];

    for (const sql of migrations) {
      try {
        await this.db.execAsync(sql);
      } catch {
        // Column already exists — safe to ignore
      }
    }
  }

  async saveMatch(match: Match): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO matches (
          id, teamName, team2Name, maxOvers, targetScore,
          totalRuns, wickets, overs, balls, extras,
          currentStrikerId, currentNonStrikerId, currentBowlerId,
          isCompleted, createdAt, completedAt,
          currentInnings, innings1Score, innings1Wickets, innings1Balls, innings1Extras
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          match.id,
          match.teamName,
          match.team2Name ?? '',
          match.maxOvers,
          match.targetScore ?? 0,
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
          match.currentInnings ?? 1,
          match.innings1Score ?? 0,
          match.innings1Wickets ?? 0,
          match.innings1Balls ?? 0,
          match.innings1Extras ?? 0,
        ],
      );

      for (const player of match.players) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO players (
            id, matchId, name, type, teamId, isDismissed, runs, balls, wickets,
            runsConceded, oversBowled, isStriker, isNonStriker, isBowling
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            player.id, match.id, player.name, 'player',
            player.teamId ?? 'team1',
            player.isDismissed ? 1 : 0,
            player.runs, player.balls, player.wickets,
            player.runsConceded, player.oversBowled,
            player.isStriker ? 1 : 0,
            player.isNonStriker ? 1 : 0,
            player.isBowling ? 1 : 0,
          ],
        );
      }

      // Save all overs (both innings)
      const allOvers = [
        ...(match.innings1OversList ?? []).map(o => ({ ...o, inningsNumber: 1 as const })),
        ...match.oversList.map(o => ({ ...o, inningsNumber: (match.currentInnings ?? 1) as (1 | 2) })),
      ];

      // Delete old overs + balls for this match (clean re-save)
      await this.db.runAsync(
        `DELETE FROM balls WHERE overId IN (SELECT id FROM overs WHERE matchId = ?)`,
        [match.id],
      );
      await this.db.runAsync(`DELETE FROM overs WHERE matchId = ?`, [match.id]);

      for (const over of allOvers) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO overs (id, matchId, overNumber, inningsNumber, totalRuns, wickets, extras)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [over.id, match.id, over.overNumber, over.inningsNumber ?? 1,
           over.totalRuns, over.wickets, over.extras],
        );

        for (const ball of over.balls) {
          await this.db.runAsync(
            `INSERT OR REPLACE INTO balls (
              id, overId, overNumber, ballNumber, runs, isWicket,
              isWide, isNoBall, is1stBounce, isDot, batsmanId, bowlerId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              ball.id, over.id,
              ball.overNumber, ball.ballNumber, ball.runs,
              ball.isWicket ? 1 : 0,
              ball.isWide ? 1 : 0,
              ball.isNoBall ? 1 : 0,
              ball.is1stBounce ? 1 : 0,
              ball.isDot ? 1 : 0,
              ball.batsmanId, ball.bowlerId,
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
      const matches = (await this.db.getAllAsync(
        `SELECT * FROM matches ORDER BY createdAt DESC`
      )) as any[];

      const result: Match[] = [];

      for (const matchRow of matches) {
        const players = (await this.db.getAllAsync(
          `SELECT * FROM players WHERE matchId = ? ORDER BY id`,
          [matchRow.id],
        )) as any[];

        const overs = (await this.db.getAllAsync(
          `SELECT * FROM overs WHERE matchId = ? ORDER BY inningsNumber, overNumber`,
          [matchRow.id],
        )) as any[];

        const currentInnings: 1 | 2 = (matchRow.currentInnings ?? 1) === 2 ? 2 : 1;

        const innings1OversList: Over[] = [];
        const oversList: Over[] = [];

        for (const overRow of overs) {
          const balls = (await this.db.getAllAsync(
            `SELECT * FROM balls WHERE overId = ? ORDER BY ballNumber`,
            [overRow.id],
          )) as any[];

          const over: Over = {
            id: overRow.id,
            overNumber: overRow.overNumber,
            inningsNumber: (overRow.inningsNumber ?? 1) === 2 ? 2 : 1,
            balls: balls.map((ball) => ({
              id: ball.id,
              overNumber: ball.overNumber ?? 0,
              ballNumber: ball.ballNumber ?? 0,
              runs: ball.runs ?? 0,
              isWicket: Boolean(ball.isWicket),
              isWide: Boolean(ball.isWide),
              isNoBall: Boolean(ball.isNoBall),
              is1stBounce: Boolean(ball.is1stBounce),
              isDot: Boolean(ball.isDot),
              batsmanId: ball.batsmanId ?? '',
              bowlerId: ball.bowlerId ?? '',
            })),
            totalRuns: overRow.totalRuns,
            wickets: overRow.wickets,
            extras: overRow.extras,
          };

          if (over.inningsNumber === 1 && currentInnings === 2) {
            innings1OversList.push(over);
          } else {
            oversList.push(over);
          }
        }

        result.push(
          convertFromDB({
            id: matchRow.id,
            teamName: matchRow.teamName,
            team2Name: matchRow.team2Name ?? '',
            maxOvers: matchRow.maxOvers,
            targetScore: matchRow.targetScore ?? 0,
            totalRuns: matchRow.totalRuns,
            wickets: matchRow.wickets,
            overs: matchRow.overs,
            balls: matchRow.balls,
            extras: matchRow.extras,
            players: players.map((p) => ({
              id: p.id, name: p.name, type: 'player' as const,
              teamId: (p.teamId ?? 'team1') as 'team1' | 'team2',
              isDismissed: Boolean(p.isDismissed),
              runs: p.runs, balls: p.balls, wickets: p.wickets,
              runsConceded: p.runsConceded, oversBowled: p.oversBowled,
              isStriker: Boolean(p.isStriker),
              isNonStriker: Boolean(p.isNonStriker),
              isBowling: Boolean(p.isBowling),
            })),
            oversList,
            currentStrikerId: matchRow.currentStrikerId,
            currentNonStrikerId: matchRow.currentNonStrikerId,
            currentBowlerId: matchRow.currentBowlerId,
            isCompleted: Boolean(matchRow.isCompleted),
            createdAt: matchRow.createdAt,
            completedAt: matchRow.completedAt,
            currentInnings,
            innings1Score: matchRow.innings1Score ?? 0,
            innings1Wickets: matchRow.innings1Wickets ?? 0,
            innings1Balls: matchRow.innings1Balls ?? 0,
            innings1Extras: matchRow.innings1Extras ?? 0,
            innings1OversList,
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
    return matches.find((m) => m.id === id) || null;
  }

  async deleteMatch(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    try {
      await this.db.runAsync(
        `DELETE FROM balls WHERE overId IN (SELECT id FROM overs WHERE matchId = ?)`, [id]
      );
      await this.db.runAsync(`DELETE FROM overs WHERE matchId = ?`, [id]);
      await this.db.runAsync(`DELETE FROM players WHERE matchId = ?`, [id]);
      await this.db.runAsync(`DELETE FROM matches WHERE id = ?`, [id]);
    } catch (error) {
      console.error("Error deleting match:", error);
      throw error;
    }
  }

  async saveTeam(name: string, players: string[]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const id = `team_${Date.now()}`;
    await this.db.runAsync(
      `INSERT INTO saved_teams (id, name, players) VALUES (?, ?, ?)`,
      [id, name, JSON.stringify(players)],
    );
  }

  async getSavedTeams(): Promise<SavedTeam[]> {
    if (!this.db) throw new Error("Database not initialized");
    const rows = (await this.db.getAllAsync(`SELECT * FROM saved_teams ORDER BY name`)) as any[];
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      players: JSON.parse(r.players) as string[],
    }));
  }

  async deleteSavedTeam(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.runAsync(`DELETE FROM saved_teams WHERE id = ?`, [id]);
  }
}

export const databaseService = new DatabaseService();
