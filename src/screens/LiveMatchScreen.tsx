// LiveMatchScreen.tsx
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Animated,
  Dimensions 
} from 'react-native';
import { useMatchStore } from '../store/matchStore';
import { ScoringEngine, ScoringAction } from '../utils/scoringEngine';
import ScoreHeader from '../components/ScoreHeader/ScoreHeader';
import OversList from '../components/OversList/OversList';
import ScoreButtons from '../components/ScoreButtons/ScoreButtons';

const { width } = Dimensions.get('window');

interface LiveMatchScreenProps {
  navigation: any;
}

const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({ navigation }) => {
  const { currentMatch, updateMatch, completeMatch, saveMatch } = useMatchStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
      if (match) {
        saveMatch(match);
      }
    };
  }, [saveMatch]);

  useEffect(() => {
    if (!currentMatch) {
      navigation.navigate('Home');
    }
  }, [currentMatch, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.endMatchButton}
          onPress={() => {
            Alert.alert(
              'End Match',
              'Are you sure you want to end this match?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'End Match', style: 'destructive', onPress: () => handleEndMatch() }
              ]
            );
          }}
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

  const handleScore = async (action: ScoringAction) => {
    if (!currentMatch) return;

    try {
      const updatedMatch = ScoringEngine.addBall(currentMatch, action);
      updateMatch(updatedMatch);

      if (updatedMatch.wickets >= 10 || (updatedMatch.overs >= updatedMatch.maxOvers && updatedMatch.balls % 6 === 0)) {
        setTimeout(() => {
          Alert.alert(
            'Match Complete',
            'The match has been completed. View summary?',
            [
              { text: 'Continue', style: 'cancel' },
              { text: 'End Match', onPress: () => handleEndMatch() }
            ]
          );
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

  if (!currentMatch) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.scoreCard}>
        <View style={styles.teamRow}>
          <Text style={styles.teamName}>{currentMatch.teamName}</Text>
          <View style={styles.liveIndicator}>
            <Animated.View style={[styles.livePulse, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.liveDot} />
            </Animated.View>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        
        <View style={styles.mainScore}>
          <Text style={styles.runs}>{currentMatch.totalRuns}</Text>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.wickets}>{currentMatch.wickets}</Text>
        </View>
        
        <View style={styles.oversRow}>
          <Text style={styles.oversText}>
            {currentMatch.overs}.{currentMatch.balls % 6}
          </Text>
          <Text style={styles.oversLabel}>overs</Text>
          <View style={styles.divider} />
          <Text style={styles.targetText}>
            of {currentMatch.maxOvers}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {currentMatch.overs > 0 
                ? (currentMatch.totalRuns / (currentMatch.overs + (currentMatch.balls % 6) / 6)).toFixed(2) 
                : '0.00'}
            </Text>
            <Text style={styles.statLabel}>RR</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{currentMatch.balls}</Text>
            <Text style={styles.statLabel}>Balls</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {Math.max(0, (currentMatch.maxOvers * 6) - currentMatch.balls)}
            </Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>
      </View>

      <View style={styles.oversContainer}>
        <OversList 
          overs={currentMatch.oversList} 
          currentOverNumber={currentMatch.overs + 1}
        />
      </View>

      <ScoreButtons onScore={handleScore} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scoreCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  livePulse: {
    marginRight: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: 1,
  },
  mainScore: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 8,
  },
  runs: {
    fontSize: 72,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -2,
  },
  separator: {
    fontSize: 48,
    fontWeight: '300',
    color: '#475569',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  wickets: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 8,
  },
  oversRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  oversText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
  },
  oversLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
    marginRight: 12,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#334155',
    marginHorizontal: 12,
  },
  targetText: {
    fontSize: 14,
    color: '#64748b',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  oversContainer: {
    flex: 1,
    marginTop: 16,
  },
  endMatchButton: {
    marginRight: 8,
  },
  endMatchGradient: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  endMatchText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LiveMatchScreen;