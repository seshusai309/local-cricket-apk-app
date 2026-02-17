import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useMatchStore } from '../store/matchStore';
import { ScoringEngine } from '../utils/scoringEngine';
import BallBox from '../components/BallBox/BallBox';
import { Match } from '../types';

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
      hour: '2-digit',
      minute: '2-digit'
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

  const renderOverRow = (over: any) => {
    const legalBalls = over.balls.filter((ball: any) => !ball.isWide && !ball.isNoBall);
    
    return (
      <View key={over.id} style={styles.overRow}>
        <View style={styles.overHeader}>
          <Text style={styles.overNumber}>Over {over.overNumber}</Text>
          <Text style={styles.overSummary}>{ScoringEngine.getOverSummary(over)}</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.ballsContainer}>
            {over.balls.map((ball: any, ballIndex: number) => (
              <BallBox key={`${ball.id}_${ballIndex}`} ball={ball} />
            ))}
            {legalBalls.length < 6 && (
              Array.from({ length: 6 - legalBalls.length }).map((_, idx) => (
                <View key={`empty_${idx}`} style={styles.emptyBall} />
              ))
            )}
          </View>
        </ScrollView>
        
        <View style={styles.overStats}>
          <Text style={styles.overStatsText}>
            Runs: {over.totalRuns} | Wkts: {over.wickets}
            {over.extras > 0 && ` | Extras: ${over.extras}`}
          </Text>
        </View>
      </View>
    );
  };

  const oversDisplay = `${match.overs}.${match.balls % 6}`;

  return (
    <ScrollView style={styles.container}>
      {/* Match Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.teamName}>{match.teamName}</Text>
        <Text style={styles.date}>{formatDate(match.createdAt)}</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{match.totalRuns}/{match.wickets}</Text>
          <Text style={styles.overs}>{oversDisplay} overs</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Overs</Text>
            <Text style={styles.statValue}>{oversDisplay}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Balls</Text>
            <Text style={styles.statValue}>{match.balls}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Run Rate</Text>
            <Text style={styles.statValue}>
              {match.overs > 0 ? (match.totalRuns / (match.overs + (match.balls % 6) / 10)).toFixed(2) : '0.00'}
            </Text>
          </View>
        </View>
      </View>

      {/* Over-by-Over Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Over-by-Over Details</Text>
        {match.oversList && match.oversList.length > 0 ? (
          match.oversList.map((over) => renderOverRow(over))
        ) : (
          <Text style={styles.noDataText}>No over data available</Text>
        )}
      </View>

      {/* Delete Button */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDeleteMatch}
      >
        <Text style={styles.deleteButtonText}>Delete Match</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059669',
  },
  overs: {
    fontSize: 16,
    color: '#64748b',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  detailsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  overRow: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  overHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  overNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  overSummary: {
    fontSize: 14,
    color: '#64748b',
  },
  ballsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyBall: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 4,
    backgroundColor: '#ffffff',
  },
  overStats: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  overStatsText: {
    fontSize: 13,
    color: '#64748b',
  },
  noDataText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 20,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MatchDetailScreen;
