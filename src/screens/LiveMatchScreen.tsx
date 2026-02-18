import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  FlatList,
} from 'react-native';
import { useMatchStore } from '../store/matchStore';
import { ScoringEngine, ScoringAction } from '../utils/scoringEngine';
import ScoreButtons from '../components/ScoreButtons/ScoreButtons';
import OverRow from '../components/OverRow/OverRow';
import { Over } from '../types';

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
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
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
            <Text style={styles.endMatchText}>End</Text>
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

  // Auto-scroll to current (last) over whenever oversList changes
  useEffect(() => {
    if (!currentMatch?.oversList?.length) return;
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentMatch?.oversList?.length, currentMatch?.balls]);

  const handleScore = async (action: ScoringAction) => {
    if (!currentMatch) return;
    try {
      const updatedMatch = ScoringEngine.addBall(currentMatch, action);
      updateMatch(updatedMatch);

      if (
        updatedMatch.wickets >= 10 ||
        (updatedMatch.overs >= updatedMatch.maxOvers && updatedMatch.balls % 6 === 0)
      ) {
        setTimeout(() => {
          Alert.alert('Match Complete', 'The match has been completed. View summary?', [
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
  const runRate =
    currentMatch.overs > 0
      ? (currentMatch.totalRuns / (currentMatch.overs + ballsInOver / 6)).toFixed(1)
      : '0.0';

  return (
    <View style={styles.container}>

      {/* ── Minimal Score Header ── */}
      <View style={styles.scoreCard}>

        {/* Row 1: Team + LIVE badge */}
        <View style={styles.topRow}>
          <Text style={styles.teamName} numberOfLines={1}>{currentMatch.teamName}</Text>
          <View style={styles.liveIndicator}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.liveDot} />
            </Animated.View>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Row 2: Score + Overs inline */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreLeft}>
            <Text style={styles.runs}>{currentMatch.totalRuns}</Text>
            <Text style={styles.separator}>/</Text>
            <Text style={styles.wickets}>{currentMatch.wickets}</Text>
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.oversMain}>
              {currentMatch.overs}.{ballsInOver}
            </Text>
            <Text style={styles.oversOf}>/ {currentMatch.maxOvers} ov</Text>
          </View>
        </View>

        {/* Row 3: Compact stats pill row */}
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{runRate}</Text>
            <Text style={styles.pillLabel}>RR</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{currentMatch.extras}</Text>
            <Text style={styles.pillLabel}>Extras</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pill}>
            <Text style={styles.pillValue}>
              {Math.max(0, currentMatch.maxOvers * 6 - currentMatch.balls)}
            </Text>
            <Text style={styles.pillLabel}>Balls left</Text>
          </View>
        </View>
      </View>

      {/* ── Overs List (auto-scrolls to current) ── */}
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
    backgroundColor: '#0f172a',
  },

  // ── Score card ──
  scoreCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#cbd5e1',
    flex: 1,
    marginRight: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: 1,
  },

  // Score + overs on same row
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  runs: {
    fontSize: 52,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    lineHeight: 56,
  },
  separator: {
    fontSize: 32,
    fontWeight: '300',
    color: '#475569',
    marginHorizontal: 3,
    lineHeight: 56,
  },
  wickets: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ef4444',
    lineHeight: 56,
  },
  scoreRight: {
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  oversMain: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10b981',
  },
  oversOf: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },

  // Compact pill stats
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  pill: {
    alignItems: 'center',
    flex: 1,
  },
  pillValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  pillLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  pillDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  // Overs list
  oversList: {
    flex: 1,
    marginTop: 10,
  },
  oversListContent: {
    paddingBottom: 8,
    paddingHorizontal: 4,
  },

  // Nav header button
  endMatchButton: {
    marginRight: 8,
  },
  endMatchGradient: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  endMatchText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default LiveMatchScreen;