import { Match, Ball, Over, Player } from "../types";

export interface ScoringAction {
  type: "run" | "wicket" | "wide" | "noball" | "1stbounce" | "dot" | "undo";
  value?: number;
}

/**
 * Cricket Scoring Engine - Fixed Version
 *
 * Key Rules:
 * - An over consists of 6 legal deliveries
 * - Wide and no-ball are extras that don't count toward the 6-ball tally
 * - Ball counting: 1-6 = Over 1, 7-12 = Over 2, etc.
 */
export class ScoringEngine {
  static addBall(match: Match, action: ScoringAction): Match {
    const updatedMatch: Match = JSON.parse(JSON.stringify(match));

    switch (action.type) {
      case "run":
        return this.handleRun(updatedMatch, action.value || 0);
      case "wicket":
        return this.handleWicket(updatedMatch);
      case "wide":
        return this.handleWide(updatedMatch);
      case "noball":
        return this.handleNoBall(updatedMatch, action.value);
      case "1stbounce":
        return this.handle1stBounce(updatedMatch, action.value);
      case "dot":
        return this.handleDot(updatedMatch);
      case "undo":
        return this.handleUndo(updatedMatch);
      default:
        return updatedMatch;
    }
  }

  /**
   * Calculate current over number (1-indexed)
   * Balls 1-6 = Over 1, Balls 7-12 = Over 2, etc.
   */
  private static getCurrentOverNumber(totalLegalBalls: number): number {
    if (totalLegalBalls === 0) return 1;
    return Math.floor((totalLegalBalls - 1) / 6) + 1;
  }

  /**
   * Calculate ball number within current over (1-6)
   */
  private static getBallNumberInOver(totalLegalBalls: number): number {
    if (totalLegalBalls === 0) return 1;
    return ((totalLegalBalls - 1) % 6) + 1;
  }

  private static handleRun(match: Match, runs: number): Match {
    // Update team total
    match.totalRuns += runs;

    // Update batsman stats
    const striker = match.players.find((p) => p.id === match.currentStrikerId);
    if (striker) {
      striker.runs += runs;
      striker.balls += 1;
    }

    // Update bowler stats
    const bowler = match.players.find((p) => p.id === match.currentBowlerId);
    if (bowler) {
      bowler.runsConceded += runs;
    }

    // Increment legal ball count
    match.balls += 1;

    // Update completed overs count
    match.overs = Math.floor(match.balls / 6);

    // Handle strike rotation
    if (runs % 2 === 1 || match.balls % 6 === 0) {
      this.rotateStrike(match);
    }

    // Add ball to current over
    this.addBallToOver(match, {
      id: `ball_${Date.now()}`,
      overNumber: this.getCurrentOverNumber(match.balls),
      ballNumber: this.getBallNumberInOver(match.balls),
      runs,
      isWicket: false,
      isWide: false,
      isNoBall: false,
      is1stBounce: false,
      isDot: false,
      batsmanId: match.currentStrikerId,
      bowlerId: match.currentBowlerId,
    });

    return match;
  }

  private static handleWicket(match: Match): Match {
    match.wickets += 1;

    const striker = match.players.find((p) => p.id === match.currentStrikerId);
    if (striker) {
      striker.balls += 1;
    }

    const bowler = match.players.find((p) => p.id === match.currentBowlerId);
    if (bowler) {
      bowler.wickets += 1;
    }

    match.balls += 1;
    match.overs = Math.floor(match.balls / 6);

    if (match.balls % 6 === 0) {
      this.rotateStrike(match);
    }

    this.nextBatsman(match);

    this.addBallToOver(match, {
      id: `ball_${Date.now()}`,
      overNumber: this.getCurrentOverNumber(match.balls),
      ballNumber: this.getBallNumberInOver(match.balls),
      runs: 0,
      isWicket: true,
      isWide: false,
      isNoBall: false,
      is1stBounce: false,
      isDot: false,
      batsmanId: match.currentStrikerId,
      bowlerId: match.currentBowlerId,
    });

    return match;
  }

  private static handleWide(match: Match): Match {
    match.totalRuns += 1;
    match.extras += 1;

    const bowler = match.players.find((p) => p.id === match.currentBowlerId);
    if (bowler) {
      bowler.runsConceded += 1;
    }

    // Extras belong to the CURRENT over (same over as the next legal ball)
    // Don't add +1 or clamp — just use match.balls directly to get the current over
    const currentOverNum = this.getCurrentOverNumber(match.balls + 1); // +1 because balls is 0-indexed pre-increment
    const displayBallNum = this.getBallNumberInOver(match.balls + 1);

    this.addBallToOver(match, {
      id: `ball_${Date.now()}`,
      overNumber: currentOverNum,
      ballNumber: displayBallNum,
      runs: 1,
      isWicket: false,
      isWide: true,
      isNoBall: false,
      is1stBounce: false,
      isDot: false,
      batsmanId: match.currentStrikerId,
      bowlerId: match.currentBowlerId,
    });

    return match;
  }

  private static handleNoBall(match: Match, runs: number = 1): Match {
    // Add the no-ball extra (1 run) + any runs scored off the bat
    match.totalRuns += runs;
    match.extras += 1;

    // Add runs to batsman if they scored off the bat
    if (runs > 0) {
      const striker = match.players.find(
        (p) => p.id === match.currentStrikerId,
      );
      if (striker) {
        striker.runs += runs;
        striker.balls += 1;
      }
    }

    const bowler = match.players.find((p) => p.id === match.currentBowlerId);
    if (bowler) {
      bowler.runsConceded += 1 + runs;
    }

    // Same logic as wide
    const currentOverNum = this.getCurrentOverNumber(match.balls + 1);
    const displayBallNum = this.getBallNumberInOver(match.balls + 1);

    this.addBallToOver(match, {
      id: `ball_${Date.now()}`,
      overNumber: currentOverNum,
      ballNumber: displayBallNum,
      runs: 1 + runs, // Total runs for this ball (1 for no-ball + runs off bat)
      isWicket: false,
      isWide: false,
      isNoBall: true,
      is1stBounce: false,
      isDot: false,
      batsmanId: match.currentStrikerId,
      bowlerId: match.currentBowlerId,
    });

    return match;
  }

  private static handle1stBounce(match: Match, runs: number = 0): Match {
    // 1st Bounce is a legal ball - counts toward the 6-ball over
    // Add the runs scored off the bat (no automatic extra)
    match.totalRuns += runs;

    // Add runs to batsman
    const striker = match.players.find((p) => p.id === match.currentStrikerId);
    if (striker) {
      striker.runs += runs;
      striker.balls += 1;
    }

    // Update bowler stats
    const bowler = match.players.find((p) => p.id === match.currentBowlerId);
    if (bowler) {
      bowler.runsConceded += runs;
    }

    // Increment legal ball count (counts toward the 6-ball over)
    match.balls += 1;
    match.overs = Math.floor(match.balls / 6);

    // Handle strike rotation
    if (runs % 2 === 1 || match.balls % 6 === 0) {
      this.rotateStrike(match);
    }

    // Add ball to current over
    this.addBallToOver(match, {
      id: `ball_${Date.now()}`,
      overNumber: this.getCurrentOverNumber(match.balls),
      ballNumber: this.getBallNumberInOver(match.balls),
      runs,
      isWicket: false,
      isWide: false,
      isNoBall: false,
      is1stBounce: true,
      isDot: false,
      batsmanId: match.currentStrikerId,
      bowlerId: match.currentBowlerId,
    });

    return match;
  }

  private static handleDot(match: Match): Match {
    const striker = match.players.find((p) => p.id === match.currentStrikerId);
    if (striker) {
      striker.balls += 1;
    }

    match.balls += 1;
    match.overs = Math.floor(match.balls / 6);

    if (match.balls % 6 === 0) {
      this.rotateStrike(match);
    }

    this.addBallToOver(match, {
      id: `ball_${Date.now()}`,
      overNumber: this.getCurrentOverNumber(match.balls),
      ballNumber: this.getBallNumberInOver(match.balls),
      runs: 0,
      isWicket: false,
      isWide: false,
      isNoBall: false,
      is1stBounce: false,
      isDot: true,
      batsmanId: match.currentStrikerId,
      bowlerId: match.currentBowlerId,
    });

    return match;
  }

  private static handleUndo(match: Match): Match {
    if (match.oversList.length === 0) return match;

    const lastOver = match.oversList[match.oversList.length - 1];
    if (lastOver.balls.length === 0) return match;

    const lastBall = lastOver.balls[lastOver.balls.length - 1];

    if (lastBall.isWide || lastBall.isNoBall) {
      // Extra ball
      match.totalRuns = Math.max(0, match.totalRuns - lastBall.runs);
      match.extras = Math.max(0, match.extras - lastBall.runs);

      const bowler = match.players.find((p) => p.id === lastBall.bowlerId);
      if (bowler) {
        bowler.runsConceded = Math.max(0, bowler.runsConceded - lastBall.runs);
      }
    } else if (lastBall.is1stBounce) {
      // 1st Bounce is a legal ball
      match.totalRuns = Math.max(0, match.totalRuns - lastBall.runs);
      match.balls = Math.max(0, match.balls - 1);
      match.overs = Math.floor(match.balls / 6);

      const batsman = match.players.find((p) => p.id === lastBall.batsmanId);
      if (batsman) {
        batsman.runs = Math.max(0, batsman.runs - lastBall.runs);
        batsman.balls = Math.max(0, batsman.balls - 1);
      }

      const bowler = match.players.find((p) => p.id === lastBall.bowlerId);
      if (bowler) {
        bowler.runsConceded = Math.max(0, bowler.runsConceded - lastBall.runs);
      }

      if (lastBall.runs % 2 === 1 || lastBall.ballNumber === 6) {
        this.rotateStrike(match);
      }
    } else {
      // Legal ball
      match.totalRuns = Math.max(0, match.totalRuns - lastBall.runs);
      match.balls = Math.max(0, match.balls - 1);
      match.overs = Math.floor(match.balls / 6);

      if (lastBall.isWicket) {
        match.wickets = Math.max(0, match.wickets - 1);
        const bowler = match.players.find((p) => p.id === lastBall.bowlerId);
        if (bowler) {
          bowler.wickets = Math.max(0, bowler.wickets - 1);
        }
      }

      const batsman = match.players.find((p) => p.id === lastBall.batsmanId);
      if (batsman) {
        batsman.runs = Math.max(0, batsman.runs - lastBall.runs);
        batsman.balls = Math.max(0, batsman.balls - 1);
      }

      const bowler = match.players.find((p) => p.id === lastBall.bowlerId);
      if (bowler) {
        bowler.runsConceded = Math.max(0, bowler.runsConceded - lastBall.runs);
      }

      if (lastBall.runs % 2 === 1 || lastBall.ballNumber === 6) {
        this.rotateStrike(match);
      }
    }

    lastOver.balls.pop();

    lastOver.totalRuns = Math.max(
      0,
      lastOver.balls.reduce((sum, ball) => sum + ball.runs, 0),
    );
    lastOver.wickets = lastOver.balls.filter((ball) => ball.isWicket).length;
    lastOver.extras = lastOver.balls.filter(
      (ball) => ball.isWide || ball.isNoBall,
    ).length;

    if (lastOver.balls.length === 0) {
      match.oversList.pop();
    }

    return match;
  }

  private static addBallToOver(match: Match, ball: Ball): void {
    const currentOverNumber = ball.overNumber;

    let currentOver = match.oversList.find(
      (over) => over.overNumber === currentOverNumber,
    );

    if (!currentOver) {
      currentOver = {
        id: `over_${currentOverNumber}`,
        overNumber: currentOverNumber,
        balls: [],
        totalRuns: 0,
        wickets: 0,
        extras: 0,
      };
      match.oversList.push(currentOver);
    }

    currentOver.balls.push(ball);

    currentOver.totalRuns = Math.max(
      0,
      currentOver.balls.reduce((sum, b) => sum + b.runs, 0),
    );
    currentOver.wickets = currentOver.balls.filter((b) => b.isWicket).length;
    currentOver.extras = currentOver.balls.filter(
      (b) => b.isWide || b.isNoBall,
    ).length;
  }

  private static rotateStrike(match: Match): void {
    const strikerId = match.currentStrikerId;
    match.currentStrikerId = match.currentNonStrikerId;
    match.currentNonStrikerId = strikerId;

    match.players.forEach((player) => {
      player.isStriker = player.id === match.currentStrikerId;
      player.isNonStriker = player.id === match.currentNonStrikerId;
    });
  }

  private static nextBatsman(match: Match): void {
    const availableBatsmen = match.players.filter(
      (p) => p.type === "batsman" && !p.isStriker && !p.isNonStriker,
    );

    if (availableBatsmen.length > 0) {
      const nextBatsman = availableBatsmen[0];
      const outBatsman = match.players.find(
        (p) => p.id === match.currentStrikerId,
      );

      if (outBatsman) {
        outBatsman.isStriker = false;
      }

      nextBatsman.isStriker = true;
      match.currentStrikerId = nextBatsman.id;
    }
  }

  static getOverSummary(over: Over): string {
    return over.balls
      .filter((ball) => !ball.isWide && !ball.isNoBall)
      .map((ball) => {
        if (ball.isWicket) return "W";
        if (ball.isDot) return "0";
        if (ball.is1stBounce) return "b" + ball.runs;
        return ball.runs.toString();
      })
      .join(" ");
  }

  static getBallColor(ball: Ball): string {
    if (ball.is1stBounce) return "#7c3aed"; // Purple for 1st Bounce
    if (ball.runs === 6) return "#10b981"; // Green
    if (ball.runs === 4) return "#3b82f6"; // Blue
    if (ball.isWicket) return "#ef4444"; // Red
    if (ball.isWide || ball.isNoBall) return "#f59e0b"; // Amber
    return "#14b8a6"; // Teal
  }
}
