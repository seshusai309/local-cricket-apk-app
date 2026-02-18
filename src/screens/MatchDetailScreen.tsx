// MatchDetailScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Dimensions 
} from 'react-native';
import { useMatchStore } from '../store/matchStore';
import { ScoringEngine } from '../utils/scoringEngine';
import BallBox from '../components/BallBox/BallBox';
import { Match } from '../types';

const { width } = Dimensions.get('window');

interface MatchDetailScreenProps {
  navigation: any;
  route: {
    params: {
      match: Match;
    };
  };
}

const MatchDetailScreen: React.FC<MatchDetailScreenProps> = ({ navigation, route }) => {
  const { match } = route.params;
  const { deleteMatch } = useMatchStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteMatch = () => {
    Alert.alert(
      'Delete Match',
      `Are you sure you want to delete the match "${match.teamName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteMatch(match.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const renderOverRow = (over: any, index: number) => {
    // Filter to get only legal balls (not wides or no balls) for the 6-ball grid
    const legalBalls = over.balls.filter((ball: any) => !ball.isWide && !ball.isNoBall);
    const isEven = index % 2 === 0;
    
    return (
      <View key={`over-${over.overNumber}-${over.id}`} style={[styles.overCard, isEven && styles.overCardAlt]}>
        <View style={styles.overHeader}>
          <View style={styles.overNumberBadge}>
            <Text style={styles.overNumberText}>{over.overNumber}</Text>
          </View>
          <Text style={styles.overSummary}>{ScoringEngine.getOverSummary(over)}</Text>
        </View>
        
        {/* Only show first 6 legal balls to prevent duplicates */}
        <View style={styles.ballsRow}>
          {legalBalls.slice(0, 6).map((ball: any, ballIndex: number) => (
            <BallBox 
              key={`${over.overNumber}-ball-${ballIndex}-${ball.id || ballIndex}`} 
              ball={ball} 
              compact 
            />
          ))}
          {/* Fill remaining slots up to 6 with empty balls */}
          {Array.from({ length: Math.max(0, 6 - legalBalls.length) }).map((_, idx) => (
            <View key={`empty-${over.overNumber}-${idx}`} style={styles.emptyBall} />
          ))}
        </View>
        
        <View style={styles.overFooter}>
          <View style={styles.overStat}>
            <Text style={styles.overStatLabel}>Runs</Text>
            <Text style={styles.overStatValue}>{over.totalRuns}</Text>
          </View>
          <View style={styles.overStat}>
            <Text style={styles.overStatLabel}>Wickets</Text>
            <Text style={[styles.overStatValue, over.wickets > 0 && styles.wicketValue]}>
              {over.wickets}
            </Text>
          </View>
          {over.extras > 0 && (
            <View style={styles.overStat}>
              <Text style={styles.overStatLabel}>Extras</Text>
              <Text style={styles.overStatValue}>{over.extras}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const oversDisplay = `${match.overs}.${match.balls % 6}`;
  const runRate = match.overs > 0 
    ? (match.totalRuns / (match.overs + (match.balls % 6) / 6)).toFixed(2) 
    : '0.00';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.teamName}>{match.teamName}</Text>
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{formatDate(match.createdAt)}</Text>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>{formatTime(match.createdAt)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.resultBadge}>
            <Text style={styles.resultText}>COMPLETED</Text>
          </View>
        </View>

        <View style={styles.scoreSection}>
          <View style={styles.mainScore}>
            <Text style={styles.runs}>{match.totalRuns}</Text>
            <Text style={styles.wickets}>{match.wickets}</Text>
          </View>
          <View style={styles.oversDisplay}>
            <Text style={styles.oversMain}>{oversDisplay}</Text>
            <Text style={styles.oversSub}>overs</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={[styles.statIconText, { color: '#10b981' }]}>R</Text>
            </View>
            <Text style={styles.statValue}>{runRate}</Text>
            <Text style={styles.statLabel}>Run Rate</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Text style={[styles.statIconText, { color: '#6366f1' }]}>B</Text>
            </View>
            <Text style={styles.statValue}>{match.balls}</Text>
            <Text style={styles.statLabel}>Balls</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={[styles.statIconText, { color: '#f59e0b' }]}>6s</Text>
            </View>
            <Text style={styles.statValue}>
              {match.oversList?.reduce((acc, over) => 
                acc + over.balls.filter((b: any) => b.runs === 6 && !b.isWide).length, 0
              ) || 0}
            </Text>
            <Text style={styles.statLabel}>Sixes</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Text style={[styles.statIconText, { color: '#ef4444' }]}>4s</Text>
            </View>
            <Text style={styles.statValue}>
              {match.oversList?.reduce((acc, over) => 
                acc + over.balls.filter((b: any) => b.runs === 4 && !b.isWide).length, 0
              ) || 0}
            </Text>
            <Text style={styles.statLabel}>Fours</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>Over by Over</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.oversList}>
        {match.oversList && match.oversList.length > 0 ? (
          match.oversList.map((over, index) => renderOverRow(over, index))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No over data available</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDeleteMatch}
        activeOpacity={0.8}
      >
        <View style={styles.deleteContent}>
          <Text style={styles.deleteIcon}>🗑</Text>
          <Text style={styles.deleteText}>Delete Match</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  headerCard: {
    backgroundColor: '#1e293b',
    margin: 16,
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  teamName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  timeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  resultBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  resultText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  mainScore: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  runs: {
    fontSize: 56,
    fontWeight: '800',
    color: '#ffffff',
  },
  wickets: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ef4444',
    marginLeft: 4,
    marginBottom: 8,
  },
  oversDisplay: {
    alignItems: 'flex-end',
  },
  oversMain: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10b981',
  },
  oversSub: {
    fontSize: 14,
    color: '#64748b',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 16,
    fontWeight: '800',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginHorizontal: 16,
    letterSpacing: 1,
  },
  oversList: {
    paddingHorizontal: 16,
  },
  overCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  overCardAlt: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
  },
  overHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  overNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  overNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  overSummary: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  ballsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 6,
    flexWrap: 'wrap',
  },
  emptyBall: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
  },
  overFooter: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 16,
  },
  overStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 6,
  },
  overStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  wicketValue: {
    color: '#ef4444',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  deleteButton: {
    margin: 16,
    marginTop: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    overflow: 'hidden',
  },
  deleteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  deleteIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  bottomPadding: {
    height: 32,
  },
});

export default MatchDetailScreen;