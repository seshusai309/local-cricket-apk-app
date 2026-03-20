import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  FlatList,
  Platform,
} from 'react-native';
import { useMatchStore } from '../store/matchStore';
import { ScoringEngine, ScoringAction } from '../utils/scoringEngine';
import ScoreButtons from '../components/ScoreButtons/ScoreButtons';
import OverRow from '../components/OverRow/OverRow';
import { Over } from '../types';

const R = {
  bg: '#1B3A2F',
  bgCard: '#122B22',
  text: '#F5F5DC',
  textMuted: '#8FAF99',
  accent: '#D4A017',
  teal: '#00897B',
  border: '#2E5040',
  red: '#C62828',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

interface LiveMatchScreenProps {
  navigation: any;
}

const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({ navigation }) => {
  const { currentMatch, updateMatch, completeMatch, saveMatch } = useMatchStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<FlatList<Over>>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
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

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.endMatchButton}
          onPress={() =>
            Alert.alert('End Match', 'Are you sure you want to end this match?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'End Match', style: 'destructive', onPress: handleEndMatch },
            ])
          }
        >
          <View style={styles.endMatchGradient}>
            <Text style={styles.endMatchText}>END</Text>
          </View>
        </TouchableOpacity>
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
      const updatedMatch = ScoringEngine.addBall(currentMatch, action);
      updateMatch(updatedMatch);

      if (
        updatedMatch.wickets >= 10 ||
        (updatedMatch.overs >= updatedMatch.maxOvers && updatedMatch.balls % 6 === 0)
      ) {
        setTimeout(() => {
          Alert.alert('Match Complete', 'The innings is over. End match?', [
            { text: 'Continue', style: 'cancel' },
            { text: 'End Match', onPress: handleEndMatch },
          ]);
        }, 500);
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleEndMatch = () => {
    completeMatch();
    navigation.navigate('Home');
  };

  if (!currentMatch) return null;

  const currentOverNumber = currentMatch.overs + 1;
  const ballsInOver = currentMatch.balls % 6;
  const ballsLeft = Math.max(0, currentMatch.maxOvers * 6 - currentMatch.balls);

  const hasTarget = (currentMatch.targetScore ?? 0) > 0;
  const runsNeeded = hasTarget ? Math.max(0, currentMatch.targetScore - currentMatch.totalRuns) : 0;
  const isWon = hasTarget && currentMatch.totalRuns >= currentMatch.targetScore;

  return (
    <View style={styles.container}>

      {/* ── Score Header ── */}
      <View style={styles.scoreCard}>

        {/* Row 1: Team + LIVE */}
        <View style={styles.topRow}>
          <Text style={styles.teamName} numberOfLines={1}>{currentMatch.teamName}</Text>
          <View style={styles.liveBadge}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.liveDot} />
            </Animated.View>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Row 2: Runs/Wickets LEFT — Target remaining or Overs RIGHT */}
        <View style={styles.scoreRow}>
          {/* Left: score */}
          <View style={styles.scoreLeft}>
            <View style={styles.digitBox}>
              <Text style={styles.runsDigit}>{currentMatch.totalRuns}</Text>
            </View>
            <Text style={styles.separator}>/</Text>
            <Text style={styles.wicketsDigit}>{currentMatch.wickets}</Text>
          </View>

          {/* Right: target remaining (if set) OR overs */}
          <View style={styles.scoreRight}>
            {hasTarget ? (
              isWon ? (
                <View style={styles.wonBox}>
                  <Text style={styles.wonText}>WON</Text>
                  <Text style={styles.wonEmoji}>🏆</Text>
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

        {/* Row 3: If target set, show overs + balls left inline */}
        {hasTarget && !isWon && (
          <View style={styles.targetInfoRow}>
            <Text style={styles.targetInfoText}>
              {currentMatch.overs}.{ballsInOver} ov  ·  {ballsLeft} balls left
            </Text>
          </View>
        )}

        {/* Row 4: Extras pill only */}
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

      {/* ── Overs List ── */}
      <FlatList
        ref={flatListRef}
        data={currentMatch.oversList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OverRow
            over={item}
            isCurrentOver={item.overNumber === currentOverNumber}
          />
        )}
        style={styles.oversList}
        contentContainerStyle={styles.oversListContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <ScoreButtons onScore={handleScore} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: R.bg,
  },

  scoreCard: {
    backgroundColor: R.bgCard,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: R.border,
    elevation: 6,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '800',
    color: R.textMuted,
    flex: 1,
    marginRight: 8,
    fontFamily: R.mono,
    letterSpacing: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(198,40,40,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(198,40,40,0.35)',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: R.red,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '900',
    color: R.red,
    letterSpacing: 1.5,
    fontFamily: R.mono,
  },

  // Score row
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  digitBox: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: R.border,
  },
  runsDigit: {
    fontSize: 50,
    fontWeight: '900',
    color: R.accent,
    fontFamily: R.mono,
    letterSpacing: -1,
    lineHeight: 56,
  },
  separator: {
    fontSize: 30,
    fontWeight: '300',
    color: R.border,
    marginHorizontal: 6,
    lineHeight: 56,
  },
  wicketsDigit: {
    fontSize: 32,
    fontWeight: '900',
    color: R.red,
    lineHeight: 56,
    fontFamily: R.mono,
  },

  // Right side: target remaining
  scoreRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  targetBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(212,160,23,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.3)',
  },
  targetNeedNum: {
    fontSize: 34,
    fontWeight: '900',
    color: R.accent,
    fontFamily: R.mono,
    lineHeight: 38,
  },
  targetNeedLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: R.textMuted,
    letterSpacing: 1.5,
    fontFamily: R.mono,
  },
  wonBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,137,123,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,137,123,0.4)',
  },
  wonText: {
    fontSize: 18,
    fontWeight: '900',
    color: R.teal,
    fontFamily: R.mono,
    letterSpacing: 2,
  },
  wonEmoji: { fontSize: 20 },

  // Overs (when no target)
  oversBox: {
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  oversDigit: {
    fontSize: 22,
    fontWeight: '900',
    color: R.teal,
    fontFamily: R.mono,
  },
  oversOf: {
    fontSize: 11,
    color: R.textMuted,
    marginTop: 1,
    fontFamily: R.mono,
  },

  // Overs + balls left info row (shown when chasing target)
  targetInfoRow: {
    marginBottom: 8,
  },
  targetInfoText: {
    fontSize: 12,
    color: R.textMuted,
    fontFamily: R.mono,
    letterSpacing: 0.5,
  },

  // Pills (Extras + Wickets + Max Overs)
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: R.border,
  },
  pill: { alignItems: 'center', flex: 1 },
  pillVal: {
    fontSize: 15,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
  },
  pillLbl: {
    fontSize: 8,
    color: R.textMuted,
    letterSpacing: 0.8,
    marginTop: 2,
    fontFamily: R.mono,
    textTransform: 'uppercase',
  },
  pillDivider: {
    width: 1,
    height: 22,
    backgroundColor: R.border,
  },

  oversList: { flex: 1, marginTop: 8 },
  oversListContent: { paddingBottom: 6, paddingHorizontal: 4 },

  endMatchButton: { marginRight: 8 },
  endMatchGradient: {
    backgroundColor: R.red,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  endMatchText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: R.mono,
  },
});

export default LiveMatchScreen;
