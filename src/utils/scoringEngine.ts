import { Match, Ball, Over, Player, Highlight } from "../types";

export interface ScoringAction {
  type: "run" | "wicket" | "wide" | "noball" | "1stbounce" | "dot" | "undo";
  value?: number;
}

/**
 * Cricket Scoring Engine
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
        return this.handleWide(updatedMatch, action.value ?? 0);
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
    match.totalRuns += runs;

    const striker = match.players.find((p) => p.id === match.currentStrikerId);
    if (striker) {
      striker.runs += runs;
      striker.balls += 1;
    }

    const bowler = match.players.find((p) => p.id === match.currentBowlerId);
    if (bowler) {
      bowler.runsConceded += runs;
    }

    match.balls += 1;
    match.overs = Math.floor(match.balls / 6);

    if (runs % 2 === 1 || match.balls % 6 === 0) {
      this.rotateStrike(match);
    }

    this.addBallToOver(match, {
      id: `ball_${Date.now()}_${Math.random()}`,
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
      id: `ball_${Date.now()}_${Math.random()}`,
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

  // Wide now accepts 0 or 1 extra runs (from WideModal)
  // Total runs = 1 (wide penalty) + extraRuns
  private static handleWide(match: Match, extraRuns: number = 0): Match {
    const totalRuns = 1 + extraRuns;
    match.totalRuns += totalRuns;
    match.extras += 1; // Only 1 extra counted (the wide penalty)

    const bowler = match.players.find((p) => p.id === match.currentBowlerId);
    if (bowler) {
      bowler.runsConceded += totalRuns;
    }

    const currentOverNum = this.getCurrentOverNumber(match.balls + 1);
    const displayBallNum = this.getBallNumberInOver(match.balls + 1);

    this.addBallToOver(match, {
      id: `ball_${Date.now()}_${Math.random()}`,
      overNumber: currentOverNum,
      ballNumber: displayBallNum,
      runs: totalRuns,
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
    match.totalRuns += runs;
    match.extras += 1;

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

    const currentOverNum = this.getCurrentOverNumber(match.balls + 1);
    const displayBallNum = this.getBallNumberInOver(match.balls + 1);

    this.addBallToOver(match, {
      id: `ball_${Date.now()}_${Math.random()}`,
      overNumber: currentOverNum,
      ballNumber: displayBallNum,
      runs: 1 + runs,
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
    match.totalRuns += runs;

    const striker = match.players.find((p) => p.id === match.currentStrikerId);
    if (striker) {
      striker.runs += runs;
      striker.balls += 1;
    }

    const bowler = match.players.find((p) => p.id === match.currentBowlerId);
    if (bowler) {
      bowler.runsConceded += runs;
    }

    match.balls += 1;
    match.overs = Math.floor(match.balls / 6);

    if (runs % 2 === 1 || match.balls % 6 === 0) {
      this.rotateStrike(match);
    }

    this.addBallToOver(match, {
      id: `ball_${Date.now()}_${Math.random()}`,
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
      id: `ball_${Date.now()}_${Math.random()}`,
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
      match.totalRuns = Math.max(0, match.totalRuns - lastBall.runs);
      match.extras = Math.max(0, match.extras - 1);

      const bowler = match.players.find((p) => p.id === lastBall.bowlerId);
      if (bowler) {
        bowler.runsConceded = Math.max(0, bowler.runsConceded - lastBall.runs);
      }
    } else if (lastBall.is1stBounce) {
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
    if (ball.is1stBounce) return "#6A1B9A";
    if (ball.runs === 6 && !ball.isWide && !ball.isNoBall) return "#2E7D32";
    if (ball.runs === 4 && !ball.isWide && !ball.isNoBall) return "#1565C0";
    if (ball.isWicket) return "#C62828";
    if (ball.isWide || ball.isNoBall) return "#E65100";
    if (ball.isDot) return "#37474F";
    return "#00695C";
  }

  // Compute highlights from oversList for a match
  static computeHighlights(match: Match): Highlight[] {
    const highlights: Highlight[] = [];
    const playerMap: Record<string, string> = {};
    match.players.forEach((p) => { playerMap[p.id] = p.name; });

    // Track consecutive wickets per bowler for hat-trick detection
    const recentWickets: { bowlerId: string; overNum: number; ballNum: number }[] = [];

    for (const over of match.oversList) {
      for (const ball of over.balls) {
        const batsmanName = playerMap[ball.batsmanId] || 'BT';
        const bowlerName = playerMap[ball.bowlerId] || 'B';

        if (ball.runs === 6 && !ball.isWide && !ball.isNoBall) {
          highlights.push({
            id: ball.id + '_6',
            type: 'six',
            overNumber: ball.overNumber,
            ballNumber: ball.ballNumber,
            batsmanName,
            bowlerName,
            label: `${batsmanName} hits a SIX!`,
            emoji: '6️⃣',
          });
        } else if (ball.runs === 4 && !ball.isWide && !ball.isNoBall) {
          highlights.push({
            id: ball.id + '_4',
            type: 'four',
            overNumber: ball.overNumber,
            ballNumber: ball.ballNumber,
            batsmanName,
            bowlerName,
            label: `${batsmanName} hits a FOUR!`,
            emoji: '4️⃣',
          });
        }

        if (ball.isWicket) {
          recentWickets.push({ bowlerId: ball.bowlerId, overNum: ball.overNumber, ballNum: ball.ballNumber });

          // Check hat-trick: last 3 wickets by same bowler
          if (recentWickets.length >= 3) {
            const last3 = recentWickets.slice(-3);
            if (last3.every(w => w.bowlerId === ball.bowlerId)) {
              highlights.push({
                id: ball.id + '_ht',
                type: 'hattrick',
                overNumber: ball.overNumber,
                ballNumber: ball.ballNumber,
                batsmanName,
                bowlerName,
                label: `HAT-TRICK! ${bowlerName} takes 3 in a row!`,
                emoji: '💥',
              });
            }
          }

          highlights.push({
            id: ball.id + '_W',
            type: 'wicket',
            overNumber: ball.overNumber,
            ballNumber: ball.ballNumber,
            batsmanName,
            bowlerName,
            label: `WICKET! ${batsmanName} out`,
            emoji: '🔥',
          });
        } else {
          // Non-wicket ball: only clear streak if it's a legal ball
          if (!ball.isWide && !ball.isNoBall) {
            recentWickets.length = 0;
          }
        }
      }
    }

    return highlights;
  }
}
