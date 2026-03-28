import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  FlatList,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { useMatchStore } from '../store/matchStore';
import { ScoringEngine, ScoringAction } from '../utils/scoringEngine';
import ScoreButtons from '../components/ScoreButtons/ScoreButtons';
import OverRow from '../components/OverRow/OverRow';
import { Over, Ball, Match } from '../types';

const R = {
  bg: '#F5F5F5',
  bgCard: '#FFFFFF',
  text: '#111111',
  textMuted: '#666666',
  accent: '#16A34A',
  red: '#DC2626',
  blue: '#2563EB',
  orange: '#EA580C',
  purple: '#7C3AED',
  border: '#E0E0E0',
  borderBright: '#CCCCCC',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

const getBallDotColor = (ball: Ball) => {
  if (ball.isWicket) return R.red;
  if (ball.isWide || ball.isNoBall) return R.orange;
  if (ball.runs === 6) return R.accent;
  if (ball.runs === 4) return R.blue;
  if (ball.runs === 0 || ball.isDot) return R.borderBright;
  return '#888888';
};

interface LiveMatchScreenProps {
  navigation: any;
}

const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({ navigation }) => {
  const { currentMatch, updateMatch, completeMatch, saveMatch } = useMatchStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<FlatList<Over>>(null);

  const [showInningsBreak, setShowInningsBreak] = useState(false);
  const [showNextBowler, setShowNextBowler] = useState(false);
  const [showNextBatsman, setShowNextBatsman] = useState(false);
  const [overEndedWithWicket, setOverEndedWithWicket] = useState(false);
  const [viewingInnings, setViewingInnings] = useState<1 | 2>(1);
  const [showScorecard, setShowScorecard] = useState(false);
  // Setup phase: shown at start of every innings before first ball
  const [setupPhase, setSetupPhase] = useState<'striker' | 'nonStriker' | 'bowler' | null>(null);
  const [setupStriker, setSetupStriker] = useState<string>('');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    return () => {
      const match = useMatchStore.getState().currentMatch;
      if (match) saveMatch(match);
    };
  }, [saveMatch]);

  useEffect(() => {
    if (!currentMatch) navigation.navigate('Home');
  }, [currentMatch, navigation]);

  // Sync viewingInnings tab when innings changes
  useEffect(() => {
    if (currentMatch?.currentInnings === 2) setViewingInnings(2);
  }, [currentMatch?.currentInnings]);

  // Trigger opener/bowler setup when no striker assigned (new match or innings 2 start)
  useEffect(() => {
    if (currentMatch && !currentMatch.currentStrikerId && setupPhase === null) {
      setSetupStriker('');
      setSetupPhase('striker');
    }
  }, [currentMatch?.id, currentMatch?.currentInnings]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 8, marginRight: 8 }}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setShowScorecard(true)}
          >
            <Text style={styles.headerBtnText}>CARD</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: R.red }]}
            onPress={() =>
              Alert.alert('End Match', 'Are you sure you want to end this match?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'End Match', style: 'destructive', onPress: handleEndMatch },
              ])
            }
          >
            <Text style={styles.headerBtnText}>END</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      e.preventDefault();
      navigation.navigate('Home');
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!currentMatch?.oversList?.length) return;
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentMatch?.oversList?.length, currentMatch?.balls]);

  const handleScore = (action: ScoringAction) => {
    if (!currentMatch) return;
    try {
      const prevBalls = currentMatch.balls;
      const updatedMatch = ScoringEngine.addBall(currentMatch, action);
      updateMatch(updatedMatch);

      const innings = updatedMatch.currentInnings ?? 1;
      const oversComplete = updatedMatch.overs >= updatedMatch.maxOvers && updatedMatch.balls % 6 === 0;
      const allOut = updatedMatch.wickets >= 10;

      if (innings === 1 && (oversComplete || allOut)) {
        setTimeout(() => setShowInningsBreak(true), 300);
        return;
      }

      if (innings === 2) {
        const won = updatedMatch.targetScore > 0 && updatedMatch.totalRuns >= updatedMatch.targetScore;
        if (won || oversComplete || allOut) {
          setTimeout(() => {
            Alert.alert('Match Over', won ? '🏆 Target reached! Match won!' : 'Innings complete. End match?', [
              { text: 'Continue', style: 'cancel' },
              { text: 'End Match', onPress: handleEndMatch },
            ]);
          }, 400);
          return;
        }
      }

      const legalBallAdded = updatedMatch.balls > prevBalls;
      const overJustEnded = legalBallAdded && updatedMatch.balls % 6 === 0;

      if (action.type === 'wicket' && updatedMatch.wickets < 10) {
        setOverEndedWithWicket(overJustEnded);
        setTimeout(() => setShowNextBatsman(true), 200);
      } else if (overJustEnded) {
        setTimeout(() => setShowNextBowler(true), 200);
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const selectBatsman = (playerId: string) => {
    if (!currentMatch) return;
    const updated: Match = JSON.parse(JSON.stringify(currentMatch));
    // Clear previous auto-picked striker
    const prevStriker = updated.players.find((p: any) => p.id === updated.currentStrikerId);
    if (prevStriker) prevStriker.isStriker = false;
    // Set chosen player
    const chosen = updated.players.find((p: any) => p.id === playerId);
    if (chosen) {
      chosen.isStriker = true;
      updated.currentStrikerId = playerId;
    }
    updateMatch(updated);
    setShowNextBatsman(false);
    if (overEndedWithWicket) {
      setOverEndedWithWicket(false);
      setTimeout(() => setShowNextBowler(true), 200);
    }
  };

  const selectBowler = (playerId: string) => {
    if (!currentMatch) return;
    const updated: Match = JSON.parse(JSON.stringify(currentMatch));
    updated.players.forEach((p: any) => { p.isBowling = false; });
    const chosen = updated.players.find((p: any) => p.id === playerId);
    if (chosen) {
      chosen.isBowling = true;
      updated.currentBowlerId = playerId;
    }
    updateMatch(updated);
    setShowNextBowler(false);
  };

  const handleStartInnings2 = () => {
    if (!currentMatch) return;
    setShowInningsBreak(false);
    const inn2Match = ScoringEngine.startInnings2(currentMatch);
    updateMatch(inn2Match);
    // Show opener selection for innings 2
    setSetupStriker('');
    setSetupPhase('striker');
  };

  // ── Setup phase selection ──────────────────────────
  const selectSetupStriker = (playerId: string) => {
    setSetupStriker(playerId);
    setSetupPhase('nonStriker');
  };

  const selectSetupNonStriker = (playerId: string) => {
    if (!currentMatch) return;
    const updated: Match = JSON.parse(JSON.stringify(currentMatch));
    const striker = updated.players.find((p: any) => p.id === setupStriker);
    if (striker) { striker.isStriker = true; updated.currentStrikerId = setupStriker; }
    const ns = updated.players.find((p: any) => p.id === playerId);
    if (ns) { ns.isNonStriker = true; updated.currentNonStrikerId = playerId; }
    updateMatch(updated);
    setSetupPhase('bowler');
  };

  const selectSetupBowler = (playerId: string) => {
    if (!currentMatch) return;
    const updated: Match = JSON.parse(JSON.stringify(currentMatch));
    const bowler = updated.players.find((p: any) => p.id === playerId);
    if (bowler) { bowler.isBowling = true; updated.currentBowlerId = playerId; }
    updateMatch(updated);
    setSetupPhase(null);
  };

  const handleEndMatch = () => {
    completeMatch();
    navigation.navigate('Home');
  };

  // Computed stats from ball-by-ball data
  const playerStats = useMemo(() => {
    if (!currentMatch) return { bat: {}, bowl: {} };
    const bat: Record<string, { runs: number; balls: number }> = {};
    const bowl: Record<string, { runs: number; wickets: number; balls: number }> = {};

    const allOvers = [
      ...(currentMatch.innings1OversList ?? []),
      ...currentMatch.oversList,
    ];

    for (const over of allOvers) {
      for (const ball of over.balls) {
        if (!ball.isWide) {
          if (!bat[ball.batsmanId]) bat[ball.batsmanId] = { runs: 0, balls: 0 };
          if (!ball.isNoBall) bat[ball.batsmanId].balls += 1;
          bat[ball.batsmanId].runs += ball.runs;
        }
        if (!bowl[ball.bowlerId]) bowl[ball.bowlerId] = { runs: 0, wickets: 0, balls: 0 };
        if (!ball.isWide && !ball.isNoBall) bowl[ball.bowlerId].balls += 1;
        bowl[ball.bowlerId].runs += ball.runs;
        if (ball.isWicket) bowl[ball.bowlerId].wickets += 1;
      }
    }
    return { bat, bowl };
  }, [currentMatch?.oversList, currentMatch?.innings1OversList]);

  if (!currentMatch) return null;

  const innings = currentMatch.currentInnings ?? 1;
  const currentOverNumber = currentMatch.overs + 1;
  const ballsInOver = currentMatch.balls % 6;

  const hasTarget = (currentMatch.targetScore ?? 0) > 0;
  const runsNeeded = hasTarget ? Math.max(0, currentMatch.targetScore - currentMatch.totalRuns) : 0;
  const isWon = hasTarget && currentMatch.totalRuns >= currentMatch.targetScore;

  const currentOver = currentMatch.oversList?.find(o => o.overNumber === currentOverNumber);
  const currentOverBalls = currentOver?.balls || [];
  const legalBallsCount = currentOverBalls.filter(b => !b.isWide && !b.isNoBall).length;
  const emptySlots = Math.max(0, 6 - legalBallsCount);

  const battingTeamName = innings === 1 ? currentMatch.teamName : (currentMatch.team2Name || 'Team 2');
  const bowlingTeamName = innings === 1 ? (currentMatch.team2Name || 'Team 2') : currentMatch.teamName;
  const battingTeamId = innings === 1 ? 'team1' : 'team2';
  const bowlingTeamId = innings === 1 ? 'team2' : 'team1';

  // Available batsmen: batting team, not dismissed, not non-striker
  const availableBatsmen = currentMatch.players.filter(
    p => p.teamId === battingTeamId && !p.isDismissed && !p.isNonStriker
  );

  // Available bowlers: bowling team, not the previous bowler
  const availableBowlers = currentMatch.players.filter(
    p => p.teamId === bowlingTeamId && p.id !== currentMatch.currentBowlerId
  );

  // Innings tab data
  const oversListData = innings === 2 && viewingInnings === 1
    ? (currentMatch.innings1OversList ?? [])
    : currentMatch.oversList;

  const currentStriker = currentMatch.players.find(p => p.id === currentMatch.currentStrikerId);
  const currentNonStriker = currentMatch.players.find(p => p.id === currentMatch.currentNonStrikerId);
  const currentBowler = currentMatch.players.find(p => p.id === currentMatch.currentBowlerId);

  return (
    <View style={styles.container}>

      {/* ── Setup Phase Modal (openers + bowler before first ball) ── */}
      <Modal transparent visible={setupPhase !== null} animationType="fade">
        <View style={styles.breakOverlay}>
          <View style={styles.selModal}>
            {setupPhase === 'striker' && (
              <>
                <Text style={styles.selTitle}>
                  {innings === 1 ? currentMatch.teamName.toUpperCase() : (currentMatch.team2Name || 'TEAM 2').toUpperCase()}
                </Text>
                <Text style={styles.selSubtitle}>SELECT OPENING STRIKER</Text>
                <ScrollView style={styles.selList} showsVerticalScrollIndicator={false}>
                  {currentMatch.players
                    .filter(p => p.teamId === battingTeamId && !p.isDismissed)
                    .map(p => (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.selItem}
                        onPress={() => selectSetupStriker(p.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.selItemLeft}>
                          <View style={styles.selAvatar}>
                            <Text style={styles.selAvatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                          </View>
                          <Text style={styles.selName}>{p.name}</Text>
                        </View>
                        <Text style={styles.selStatsText}>Will face first ball</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </>
            )}

            {setupPhase === 'nonStriker' && (
              <>
                <Text style={styles.selTitle}>
                  {innings === 1 ? currentMatch.teamName.toUpperCase() : (currentMatch.team2Name || 'TEAM 2').toUpperCase()}
                </Text>
                <Text style={styles.selSubtitle}>SELECT NON-STRIKER</Text>
                <ScrollView style={styles.selList} showsVerticalScrollIndicator={false}>
                  {currentMatch.players
                    .filter(p => p.teamId === battingTeamId && !p.isDismissed && p.id !== setupStriker)
                    .map(p => (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.selItem}
                        onPress={() => selectSetupNonStriker(p.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.selItemLeft}>
                          <View style={styles.selAvatar}>
                            <Text style={styles.selAvatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                          </View>
                          <Text style={styles.selName}>{p.name}</Text>
                        </View>
                        <Text style={styles.selStatsText}>Non-striker end</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </>
            )}

            {setupPhase === 'bowler' && (
              <>
                <Text style={styles.selTitle}>
                  {innings === 1 ? (currentMatch.team2Name || 'TEAM 2').toUpperCase() : currentMatch.teamName.toUpperCase()}
                </Text>
                <Text style={styles.selSubtitle}>SELECT OPENING BOWLER</Text>
                <ScrollView style={styles.selList} showsVerticalScrollIndicator={false}>
                  {currentMatch.players
                    .filter(p => p.teamId === bowlingTeamId)
                    .map(p => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.selItem, { borderColor: 'rgba(234,88,12,0.3)' }]}
                        onPress={() => selectSetupBowler(p.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.selItemLeft}>
                          <View style={[styles.selAvatar, { backgroundColor: 'rgba(234,88,12,0.12)' }]}>
                            <Text style={[styles.selAvatarText, { color: R.orange }]}>{p.name.charAt(0).toUpperCase()}</Text>
                          </View>
                          <Text style={styles.selName}>{p.name}</Text>
                        </View>
                        <Text style={styles.selStatsText}>Opens bowling</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </>
            )}

            {/* Step indicator */}
            <View style={styles.setupSteps}>
              {(['striker', 'nonStriker', 'bowler'] as const).map((step, i) => (
                <View
                  key={step}
                  style={[styles.setupDot, setupPhase === step && styles.setupDotActive,
                    (setupPhase === 'nonStriker' && i === 0) || (setupPhase === 'bowler' && i < 2)
                      ? styles.setupDotDone : {}]}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Innings Break Modal ── */}
      <Modal transparent visible={showInningsBreak} animationType="fade">
        <View style={styles.breakOverlay}>
          <View style={styles.breakModal}>
            <Text style={styles.breakTitle}>INNINGS BREAK</Text>
            <Text style={styles.breakSubtitle}>1ST INNINGS COMPLETE</Text>
            <View style={styles.breakScoreRow}>
              <Text style={styles.breakTeam}>{currentMatch.teamName}</Text>
              <Text style={styles.breakScore}>
                {currentMatch.innings1Score > 0 ? currentMatch.innings1Score : currentMatch.totalRuns}
                /{currentMatch.innings1Wickets > 0 ? currentMatch.innings1Wickets : currentMatch.wickets}
              </Text>
            </View>
            <View style={styles.breakDivider} />
            <Text style={styles.breakTarget}>
              {currentMatch.team2Name || 'Team 2'} needs{' '}
              <Text style={styles.breakTargetNum}>
                {(currentMatch.innings1Score > 0 ? currentMatch.innings1Score : currentMatch.totalRuns) + 1}
              </Text>{' '}
              to win
            </Text>
            <TouchableOpacity style={styles.breakBtn} onPress={handleStartInnings2} activeOpacity={0.85}>
              <Text style={styles.breakBtnText}>▶  START 2ND INNINGS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.breakEndBtn} onPress={handleEndMatch} activeOpacity={0.7}>
              <Text style={styles.breakEndBtnText}>End Match Without 2nd Innings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Next Batsman Modal ── */}
      <Modal transparent visible={showNextBatsman} animationType="fade">
        <View style={styles.breakOverlay}>
          <View style={styles.selModal}>
            <Text style={styles.selTitle}>WICKET!</Text>
            <Text style={styles.selSubtitle}>SELECT NEXT BATSMAN</Text>
            <ScrollView style={styles.selList} showsVerticalScrollIndicator={false}>
              {availableBatsmen.map(p => {
                const stats = playerStats.bat[p.id];
                const isCurrentlyPicked = p.id === currentMatch.currentStrikerId;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.selItem, isCurrentlyPicked && styles.selItemActive]}
                    onPress={() => selectBatsman(p.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.selItemLeft}>
                      <View style={[styles.selAvatar, isCurrentlyPicked && { backgroundColor: R.accent }]}>
                        <Text style={[styles.selAvatarText, isCurrentlyPicked && { color: '#fff' }]}>
                          {p.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.selName, isCurrentlyPicked && { color: R.accent }]}>{p.name}</Text>
                    </View>
                    <View style={styles.selStats}>
                      {stats ? (
                        <Text style={styles.selStatsText}>{stats.runs}({stats.balls})</Text>
                      ) : (
                        <Text style={styles.selStatsText}>Yet to bat</Text>
                      )}
                      {isCurrentlyPicked && <Text style={styles.selCheck}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Next Bowler Modal ── */}
      <Modal transparent visible={showNextBowler} animationType="fade">
        <View style={styles.breakOverlay}>
          <View style={styles.selModal}>
            <Text style={styles.selTitle}>OV {currentMatch.overs} COMPLETE</Text>
            <Text style={styles.selSubtitle}>SELECT NEXT BOWLER</Text>
            <ScrollView style={styles.selList} showsVerticalScrollIndicator={false}>
              {availableBowlers.map(p => {
                const stats = playerStats.bowl[p.id];
                const ballsBowled = stats?.balls ?? 0;
                const oversBowled = `${Math.floor(ballsBowled / 6)}.${ballsBowled % 6}`;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.selItem}
                    onPress={() => selectBowler(p.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.selItemLeft}>
                      <View style={[styles.selAvatar, { backgroundColor: 'rgba(234,88,12,0.15)' }]}>
                        <Text style={[styles.selAvatarText, { color: R.orange }]}>
                          {p.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.selName}>{p.name}</Text>
                    </View>
                    <View style={styles.selStats}>
                      {stats ? (
                        <Text style={styles.selStatsText}>
                          {oversBowled} ov  {stats.wickets}W  {stats.runs}R
                        </Text>
                      ) : (
                        <Text style={styles.selStatsText}>0 overs</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
              {availableBowlers.length === 0 && (
                <View style={styles.selEmpty}>
                  <Text style={styles.selEmptyText}>No other bowlers available.</Text>
                  <TouchableOpacity
                    style={[styles.breakBtn, { marginTop: 12 }]}
                    onPress={() => {
                      // Allow same bowler to continue (rare case)
                      setShowNextBowler(false);
                    }}
                  >
                    <Text style={styles.breakBtnText}>CONTINUE</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Scorecard Modal ── */}
      <Modal transparent visible={showScorecard} animationType="slide">
        <View style={styles.breakOverlay}>
          <View style={[styles.selModal, { maxHeight: '85%' }]}>
            <View style={styles.scorecardHeader}>
              <Text style={styles.selTitle}>SCORECARD</Text>
              <TouchableOpacity onPress={() => setShowScorecard(false)} style={styles.closeBtnX}>
                <Text style={styles.closeBtnXText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Batting section */}
              <ScorecardSection
                title={`${innings === 1 ? currentMatch.teamName : (currentMatch.team2Name || 'Team 2')} · BATTING`}
                color={R.accent}
              >
                <View style={styles.scRow}>
                  <Text style={[styles.scCell, { flex: 3 }]}>NAME</Text>
                  <Text style={styles.scCell}>R</Text>
                  <Text style={styles.scCell}>B</Text>
                  <Text style={styles.scCell}>S/R</Text>
                </View>
                {currentMatch.players
                  .filter(p => p.teamId === battingTeamId)
                  .map(p => {
                    const stats = playerStats.bat[p.id];
                    const r = stats?.runs ?? 0;
                    const b = stats?.balls ?? 0;
                    const sr = b > 0 ? ((r / b) * 100).toFixed(0) : '—';
                    const isAtCrease = p.isStriker || p.isNonStriker;
                    return (
                      <View key={p.id} style={[styles.scRow, isAtCrease && styles.scRowHighlight]}>
                        <Text style={[styles.scCell, styles.scName, { flex: 3 }]} numberOfLines={1}>
                          {p.name}{p.isStriker ? ' *' : p.isNonStriker ? ' †' : ''}
                        </Text>
                        <Text style={[styles.scCell, r >= 50 ? { color: R.accent, fontWeight: '900' } : {}]}>{r}</Text>
                        <Text style={styles.scCell}>{b}</Text>
                        <Text style={styles.scCell}>{sr}</Text>
                      </View>
                    );
                  })}
              </ScorecardSection>

              {/* Bowling section */}
              <ScorecardSection
                title={`${innings === 1 ? (currentMatch.team2Name || 'Team 2') : currentMatch.teamName} · BOWLING`}
                color={R.orange}
              >
                <View style={styles.scRow}>
                  <Text style={[styles.scCell, { flex: 3 }]}>NAME</Text>
                  <Text style={styles.scCell}>Ov</Text>
                  <Text style={styles.scCell}>R</Text>
                  <Text style={styles.scCell}>W</Text>
                </View>
                {currentMatch.players
                  .filter(p => p.teamId === bowlingTeamId)
                  .map(p => {
                    const stats = playerStats.bowl[p.id];
                    const balls = stats?.balls ?? 0;
                    const r = stats?.runs ?? 0;
                    const w = stats?.wickets ?? 0;
                    const ovStr = `${Math.floor(balls / 6)}.${balls % 6}`;
                    const isBowling = p.id === currentMatch.currentBowlerId;
                    return (
                      <View key={p.id} style={[styles.scRow, isBowling && styles.scRowHighlight]}>
                        <Text style={[styles.scCell, styles.scName, { flex: 3 }]} numberOfLines={1}>
                          {p.name}{isBowling ? ' ●' : ''}
                        </Text>
                        <Text style={styles.scCell}>{balls > 0 ? ovStr : '—'}</Text>
                        <Text style={styles.scCell}>{balls > 0 ? r : '—'}</Text>
                        <Text style={[styles.scCell, w >= 3 ? { color: R.red, fontWeight: '900' } : {}]}>
                          {balls > 0 ? w : '—'}
                        </Text>
                      </View>
                    );
                  })}
              </ScorecardSection>

              {/* Innings 1 summary if in innings 2 */}
              {innings === 2 && (
                <ScorecardSection
                  title={`${currentMatch.teamName} · 1ST INNINGS`}
                  color={R.blue}
                >
                  <View style={styles.inn1Summary}>
                    <Text style={styles.inn1SumScore}>
                      {currentMatch.innings1Score}/{currentMatch.innings1Wickets}
                    </Text>
                    <Text style={styles.inn1SumOvers}>
                      ({(currentMatch.innings1Balls / 6).toFixed(1)} ov)
                    </Text>
                  </View>
                  {/* Innings 1 batting */}
                  <View style={styles.scRow}>
                    <Text style={[styles.scCell, { flex: 3 }]}>NAME</Text>
                    <Text style={styles.scCell}>R</Text>
                    <Text style={styles.scCell}>B</Text>
                    <Text style={styles.scCell}>S/R</Text>
                  </View>
                  {currentMatch.players
                    .filter(p => p.teamId === 'team1')
                    .filter(p => {
                      // Show only players who batted in innings 1
                      const stats = playerStats.bat[p.id];
                      return stats && stats.balls > 0;
                    })
                    .map(p => {
                      const stats = playerStats.bat[p.id] ?? { runs: 0, balls: 0 };
                      const sr = stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(0) : '—';
                      return (
                        <View key={p.id} style={styles.scRow}>
                          <Text style={[styles.scCell, styles.scName, { flex: 3 }]} numberOfLines={1}>
                            {p.name}
                          </Text>
                          <Text style={styles.scCell}>{stats.runs}</Text>
                          <Text style={styles.scCell}>{stats.balls}</Text>
                          <Text style={styles.scCell}>{sr}</Text>
                        </View>
                      );
                    })}
                </ScorecardSection>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Score Card ── */}
      <View style={styles.scoreCard}>

        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <Text style={styles.teamName} numberOfLines={1}>{battingTeamName}</Text>
            <Text style={styles.vsText}>vs {bowlingTeamName}</Text>
          </View>
          <View style={styles.badges}>
            <View style={[styles.inningsBadge, innings === 2 && styles.inningsBadge2]}>
              <Text style={[styles.inningsText, innings === 2 && styles.inningsText2]}>
                {innings === 1 ? '1ST INN' : '2ND INN'}
              </Text>
            </View>
            <View style={styles.liveBadge}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.liveDot} />
              </Animated.View>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </View>

        {/* Big score */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreLeft}>
            <Text style={styles.runsDigit}>{currentMatch.totalRuns}</Text>
            <Text style={styles.separator}>/</Text>
            <Text style={styles.wicketsDigit}>{currentMatch.wickets}</Text>
          </View>

          <View style={styles.scoreRight}>
            {hasTarget ? (
              isWon ? (
                <View style={styles.wonBox}>
                  <Text style={styles.wonText}>WON 🏆</Text>
                </View>
              ) : (
                <View style={styles.targetBox}>
                  <Text style={styles.targetNeedNum}>{runsNeeded}</Text>
                  <Text style={styles.targetNeedLabel}>TO WIN</Text>
                </View>
              )
            ) : (
              <View style={styles.oversBox}>
                <Text style={styles.oversDigit}>{currentMatch.overs}.{ballsInOver}</Text>
                <Text style={styles.oversOf}>/ {currentMatch.maxOvers} ov</Text>
              </View>
            )}
          </View>
        </View>

        {/* Innings 2 target info */}
        {innings === 2 && hasTarget && !isWon && (
          <View style={styles.targetInfoRow}>
            <Text style={styles.targetInfoText}>
              Target {currentMatch.targetScore}  ·  {currentMatch.overs}.{ballsInOver} ov  ·  {Math.max(0, currentMatch.maxOvers * 6 - currentMatch.balls)} balls left
            </Text>
          </View>
        )}

        {/* Innings 1 score bar (shown in innings 2) */}
        {innings === 2 && (
          <View style={styles.inn1Row}>
            <Text style={styles.inn1Text}>
              {currentMatch.teamName}: {currentMatch.innings1Score}/{currentMatch.innings1Wickets}
              {'  '}({(currentMatch.innings1Balls / 6).toFixed(1)} ov)
            </Text>
          </View>
        )}

        {/* ── Batting / Bowling Panel ── */}
        <View style={styles.playerPanel}>
          {/* Striker row */}
          <View style={styles.batterRow}>
            <Text style={styles.strikerStar}>★</Text>
            <Text style={styles.strikerName} numberOfLines={1}>
              {currentStriker?.name ?? '—'}
            </Text>
            <View style={styles.batterScoreBox}>
              <Text style={styles.strikerRuns}>
                {playerStats.bat[currentStriker?.id ?? '']?.runs ?? 0}
              </Text>
              <Text style={styles.strikerBalls}>
                ({playerStats.bat[currentStriker?.id ?? '']?.balls ?? 0})
              </Text>
            </View>
          </View>

          {/* Non-striker row */}
          <View style={[styles.batterRow, styles.nsBatterRow]}>
            <Text style={styles.nsStar}>◆</Text>
            <Text style={styles.nsName} numberOfLines={1}>
              {currentNonStriker?.name ?? '—'}
            </Text>
            <View style={styles.batterScoreBox}>
              <Text style={styles.nsRuns}>
                {playerStats.bat[currentNonStriker?.id ?? '']?.runs ?? 0}
              </Text>
              <Text style={styles.nsBalls}>
                ({playerStats.bat[currentNonStriker?.id ?? '']?.balls ?? 0})
              </Text>
            </View>
          </View>

          {/* Bowler row */}
          <View style={styles.bowlerRow}>
            <Text style={styles.bowlerBullet}>⬤</Text>
            <Text style={styles.bowlerName} numberOfLines={1}>
              {currentBowler?.name ?? '—'}
            </Text>
            <Text style={styles.bowlerStats}>
              {(() => {
                const bs = playerStats.bowl[currentBowler?.id ?? ''];
                if (!bs) return '0.0 ov  0R  0W';
                return `${Math.floor(bs.balls / 6)}.${bs.balls % 6} ov  ${bs.runs}R  ${bs.wickets}W`;
              })()}
            </Text>
          </View>
        </View>

        {/* Ball dots */}
        <View style={styles.ballDotsRow}>
          <Text style={styles.ballDotsLabel}>OV {currentOverNumber}</Text>
          <View style={styles.ballDots}>
            {currentOverBalls.map((ball, i) => (
              <View
                key={i}
                style={[
                  styles.ballDot,
                  { backgroundColor: getBallDotColor(ball) },
                  (ball.isWide || ball.isNoBall) && styles.ballDotExtra,
                ]}
              />
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <View key={`e${i}`} style={styles.ballDotEmpty} />
            ))}
          </View>
        </View>

        {/* Pills */}
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillVal}>{currentMatch.extras}</Text>
            <Text style={styles.pillLbl}>EXTRAS</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pill}>
            <Text style={styles.pillVal}>{currentMatch.wickets}</Text>
            <Text style={styles.pillLbl}>WICKETS</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pill}>
            <Text style={styles.pillVal}>{currentMatch.maxOvers}</Text>
            <Text style={styles.pillLbl}>MAX OV</Text>
          </View>
        </View>
      </View>

      {/* ── Innings Tabs (only in innings 2) ── */}
      {innings === 2 && (
        <View style={styles.innTabs}>
          <TouchableOpacity
            style={[styles.innTab, viewingInnings === 1 && styles.innTabActive]}
            onPress={() => setViewingInnings(1)}
          >
            <Text style={[styles.innTabText, viewingInnings === 1 && styles.innTabTextActive]}>
              1ST INN  {currentMatch.innings1Score}/{currentMatch.innings1Wickets}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.innTab, viewingInnings === 2 && styles.innTabActive]}
            onPress={() => setViewingInnings(2)}
          >
            <Text style={[styles.innTabText, viewingInnings === 2 && styles.innTabTextActive]}>
              2ND INN  {currentMatch.totalRuns}/{currentMatch.wickets}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Over List ── */}
      <FlatList
        ref={flatListRef}
        data={oversListData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OverRow
            over={item}
            isCurrentOver={viewingInnings === innings && item.overNumber === currentOverNumber}
          />
        )}
        style={styles.oversList}
        contentContainerStyle={styles.oversListContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (viewingInnings === innings) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
      />

      <ScoreButtons onScore={handleScore} />
    </View>
  );
};

/* ─── Scorecard section sub-component ─────────── */
const ScorecardSection: React.FC<{
  title: string;
  color?: string;
  children: React.ReactNode;
}> = ({ title, color = R.accent, children }) => (
  <View style={styles.scSection}>
    <View style={[styles.scSectionHeader, { borderLeftColor: color }]}>
      <Text style={[styles.scSectionTitle, { color }]}>{title}</Text>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: R.bg },

  // Header buttons
  headerBtn: {
    backgroundColor: R.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  headerBtnText: {
    color: '#fff', fontSize: 11, fontWeight: '900',
    letterSpacing: 2, fontFamily: R.mono,
  },

  // Innings break modal
  breakOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  breakModal: {
    backgroundColor: R.bgCard,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: R.border,
    alignItems: 'center',
  },
  breakTitle: {
    fontSize: 22, fontWeight: '900', color: R.text,
    fontFamily: R.mono, letterSpacing: 2, marginBottom: 4,
  },
  breakSubtitle: {
    fontSize: 10, color: R.textMuted, letterSpacing: 2,
    fontFamily: R.mono, marginBottom: 20,
  },
  breakScoreRow: { alignItems: 'center', marginBottom: 16 },
  breakTeam: {
    fontSize: 13, fontWeight: '700', color: R.textMuted,
    fontFamily: R.mono, letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase',
  },
  breakScore: {
    fontSize: 52, fontWeight: '900', color: R.text,
    fontFamily: R.mono, letterSpacing: -2,
  },
  breakDivider: { width: '100%', height: 1, backgroundColor: R.border, marginBottom: 16 },
  breakTarget: {
    fontSize: 14, color: R.textMuted, fontFamily: R.mono,
    marginBottom: 24, textAlign: 'center',
  },
  breakTargetNum: { fontSize: 18, fontWeight: '900', color: R.accent },
  breakBtn: {
    backgroundColor: R.accent, borderRadius: 12,
    paddingVertical: 16, paddingHorizontal: 28,
    width: '100%', alignItems: 'center', marginBottom: 10,
  },
  breakBtnText: {
    fontSize: 15, fontWeight: '900', color: '#FFFFFF',
    letterSpacing: 1.5, fontFamily: R.mono,
  },
  breakEndBtn: { paddingVertical: 10 },
  breakEndBtnText: { fontSize: 13, color: R.textMuted, fontWeight: '600' },

  // Selection modals (batsman / bowler / scorecard)
  selModal: {
    backgroundColor: R.bgCard,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: R.border,
  },
  selTitle: {
    fontSize: 18, fontWeight: '900', color: R.text,
    fontFamily: R.mono, letterSpacing: 2, marginBottom: 2,
  },
  selSubtitle: {
    fontSize: 9, color: R.textMuted, letterSpacing: 2.5,
    fontFamily: R.mono, marginBottom: 16,
  },
  selList: { maxHeight: 320 },
  selItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: R.border,
    marginBottom: 6,
    backgroundColor: R.bg,
  },
  selItemActive: {
    borderColor: R.accent,
    backgroundColor: 'rgba(22,163,74,0.06)',
  },
  selItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  selAvatar: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: 'rgba(22,163,74,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  selAvatarText: {
    fontSize: 14, fontWeight: '900', color: R.accent, fontFamily: R.mono,
  },
  selName: {
    fontSize: 14, fontWeight: '700', color: R.text, fontFamily: R.mono, flex: 1,
  },
  selStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selStatsText: { fontSize: 11, color: R.textMuted, fontFamily: R.mono },
  selCheck: { fontSize: 14, color: R.accent, fontWeight: '900' },
  selEmpty: { alignItems: 'center', paddingVertical: 20 },
  selEmptyText: { fontSize: 13, color: R.textMuted, fontFamily: R.mono },

  // Scorecard
  scorecardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2,
  },
  closeBtnX: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: R.bg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: R.border,
  },
  closeBtnXText: { fontSize: 13, color: R.textMuted, fontWeight: '900' },
  scSection: { marginBottom: 16 },
  scSectionHeader: {
    borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 4, marginBottom: 8,
  },
  scSectionTitle: { fontSize: 9, fontWeight: '900', letterSpacing: 2, fontFamily: R.mono },
  scRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: R.border,
  },
  scRowHighlight: { backgroundColor: 'rgba(22,163,74,0.05)' },
  scCell: {
    flex: 1, fontSize: 11, color: R.text, fontFamily: R.mono,
    textAlign: 'center',
  },
  scName: { textAlign: 'left', fontWeight: '700' },
  inn1Summary: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  inn1SumScore: { fontSize: 28, fontWeight: '900', color: R.blue, fontFamily: R.mono },
  inn1SumOvers: { fontSize: 12, color: R.textMuted, fontFamily: R.mono },

  // Score card
  scoreCard: {
    backgroundColor: R.bgCard,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: R.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  topLeft: { flex: 1, marginRight: 8 },
  teamName: {
    fontSize: 13, fontWeight: '800', color: R.textMuted,
    fontFamily: R.mono, letterSpacing: 1.5, textTransform: 'uppercase',
  },
  vsText: { fontSize: 10, color: R.textMuted, fontFamily: R.mono, marginTop: 2, opacity: 0.7 },
  badges: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  inningsBadge: {
    backgroundColor: 'rgba(22,163,74,0.1)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.35)',
  },
  inningsBadge2: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderColor: 'rgba(37,99,235,0.35)',
  },
  inningsText: { fontSize: 9, fontWeight: '900', color: R.accent, fontFamily: R.mono, letterSpacing: 1 },
  inningsText2: { color: R.blue },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(220,38,38,0.08)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.35)', gap: 5,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: R.red },
  liveText: { fontSize: 9, fontWeight: '900', color: R.red, letterSpacing: 2, fontFamily: R.mono },

  scoreRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', marginBottom: 4,
  },
  scoreLeft: { flexDirection: 'row', alignItems: 'flex-end' },
  runsDigit: {
    fontSize: 68, fontWeight: '900', color: R.text,
    fontFamily: R.mono, letterSpacing: -3, lineHeight: 74,
  },
  separator: {
    fontSize: 30, fontWeight: '300', color: R.borderBright,
    marginHorizontal: 4, lineHeight: 74,
  },
  wicketsDigit: {
    fontSize: 34, fontWeight: '900', color: R.red, lineHeight: 74, fontFamily: R.mono,
  },
  scoreRight: { alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4 },
  targetBox: {
    alignItems: 'center', backgroundColor: 'rgba(22,163,74,0.08)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(22,163,74,0.35)',
  },
  targetNeedNum: {
    fontSize: 34, fontWeight: '900', color: R.accent, fontFamily: R.mono, lineHeight: 38,
  },
  targetNeedLabel: {
    fontSize: 7, fontWeight: '900', color: R.accent,
    letterSpacing: 2, fontFamily: R.mono, opacity: 0.7,
  },
  wonBox: {
    alignItems: 'center', backgroundColor: 'rgba(22,163,74,0.1)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(22,163,74,0.4)',
  },
  wonText: { fontSize: 18, fontWeight: '900', color: R.accent, fontFamily: R.mono, letterSpacing: 2 },
  oversBox: { alignItems: 'flex-end', paddingBottom: 4 },
  oversDigit: { fontSize: 24, fontWeight: '900', color: R.textMuted, fontFamily: R.mono },
  oversOf: { fontSize: 10, color: R.textMuted, marginTop: 1, fontFamily: R.mono, opacity: 0.6 },

  targetInfoRow: { marginBottom: 2 },
  targetInfoText: { fontSize: 11, color: R.textMuted, fontFamily: R.mono, letterSpacing: 0.5 },

  inn1Row: {
    backgroundColor: 'rgba(37,99,235,0.07)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 4, borderWidth: 1, borderColor: 'rgba(37,99,235,0.2)',
  },
  inn1Text: { fontSize: 10, color: R.blue, fontFamily: R.mono, fontWeight: '700' },

  // ── Batting / Bowling Panel ──
  playerPanel: {
    marginTop: 6, marginBottom: 2,
    backgroundColor: R.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: R.border,
    overflow: 'hidden',
  },
  batterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: 'rgba(22,163,74,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: R.border,
    gap: 8,
  },
  nsBatterRow: {
    backgroundColor: R.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: R.border,
  },
  strikerStar: {
    fontSize: 14, color: R.accent, fontWeight: '900', width: 18, textAlign: 'center',
  },
  nsStar: {
    fontSize: 10, color: R.textMuted, width: 18, textAlign: 'center',
  },
  strikerName: {
    flex: 1, fontSize: 16, fontWeight: '800', color: R.text, fontFamily: R.mono,
  },
  nsName: {
    flex: 1, fontSize: 14, fontWeight: '600', color: R.textMuted, fontFamily: R.mono,
  },
  batterScoreBox: {
    flexDirection: 'row', alignItems: 'baseline', gap: 3,
  },
  strikerRuns: {
    fontSize: 26, fontWeight: '900', color: R.accent, fontFamily: R.mono, lineHeight: 30,
  },
  strikerBalls: {
    fontSize: 13, fontWeight: '600', color: R.textMuted, fontFamily: R.mono,
  },
  nsRuns: {
    fontSize: 20, fontWeight: '800', color: R.text, fontFamily: R.mono, lineHeight: 24,
  },
  nsBalls: {
    fontSize: 12, fontWeight: '500', color: R.textMuted, fontFamily: R.mono,
  },
  bowlerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(234,88,12,0.05)',
    gap: 8,
  },
  bowlerBullet: {
    fontSize: 10, color: R.orange, width: 18, textAlign: 'center',
  },
  bowlerName: {
    flex: 1, fontSize: 14, fontWeight: '700', color: R.text, fontFamily: R.mono,
  },
  bowlerStats: {
    fontSize: 12, fontWeight: '700', color: R.orange, fontFamily: R.mono,
  },

  ballDotsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: R.border, marginTop: 4,
  },
  ballDotsLabel: {
    fontSize: 9, fontWeight: '900', color: R.textMuted,
    fontFamily: R.mono, letterSpacing: 1, minWidth: 28,
  },
  ballDots: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  ballDot: { width: 14, height: 14, borderRadius: 7 },
  ballDotExtra: { borderWidth: 1.5, borderColor: R.orange, backgroundColor: 'transparent' },
  ballDotEmpty: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: R.border },

  pillRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', paddingTop: 8,
    borderTopWidth: 1, borderTopColor: R.border,
  },
  pill: { alignItems: 'center', flex: 1 },
  pillVal: { fontSize: 14, fontWeight: '900', color: R.text, fontFamily: R.mono },
  pillLbl: {
    fontSize: 7, color: R.textMuted, letterSpacing: 1,
    marginTop: 2, fontFamily: R.mono, textTransform: 'uppercase',
  },
  pillDivider: { width: 1, height: 20, backgroundColor: R.border },

  // Innings tabs
  innTabs: {
    flexDirection: 'row', marginHorizontal: 10, marginTop: 6,
    backgroundColor: R.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: R.border, overflow: 'hidden',
  },
  innTab: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  innTabActive: { backgroundColor: R.blue },
  innTabText: {
    fontSize: 10, fontWeight: '900', color: R.textMuted,
    fontFamily: R.mono, letterSpacing: 1,
  },
  innTabTextActive: { color: '#FFFFFF' },

  oversList: { flex: 1, marginTop: 4 },
  oversListContent: { paddingBottom: 4, paddingHorizontal: 4 },

  // Setup phase step indicator
  setupSteps: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 8, marginTop: 16,
  },
  setupDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: R.border,
  },
  setupDotActive: { backgroundColor: R.accent, width: 20 },
  setupDotDone: { backgroundColor: 'rgba(22,163,74,0.4)' },
});

export default LiveMatchScreen;
