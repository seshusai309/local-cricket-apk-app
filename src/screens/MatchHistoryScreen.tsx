import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useMatchStore } from '../store/matchStore';

interface MatchHistoryScreenProps {
  navigation: any;
}

const MatchHistoryScreen: React.FC<MatchHistoryScreenProps> = ({ navigation }) => {
  const { matches, deleteMatch } = useMatchStore();

  const completedMatches = matches.filter(match => match.isCompleted);

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

  const handleDeleteMatch = (matchId: string, teamName: string) => {
    Alert.alert(
      'Delete Match',
      `Are you sure you want to delete the match "${teamName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMatch(matchId)
        }
      ]
    );
  };

  const navigateToMatchDetail = (match: any) => {
    navigation.navigate('MatchDetail', { match });
  };

  const renderMatch = ({ item }: { item: any }) => {
    const oversDisplay = `${item.overs}.${item.balls % 6}`;
    
    return (
      <TouchableOpacity 
        style={styles.matchCard}
        onPress={() => navigateToMatchDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.matchHeader}>
          <Text style={styles.teamName}>{item.teamName}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        
        <View style={styles.matchScore}>
          <Text style={styles.score}>{item.totalRuns}/{item.wickets}</Text>
          <Text style={styles.overs}>{oversDisplay} overs</Text>
        </View>
        
        <View style={styles.matchStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Overs</Text>
            <Text style={styles.statValue}>{oversDisplay}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Balls</Text>
            <Text style={styles.statValue}>{item.balls}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Run Rate</Text>
            <Text style={styles.statValue}>
              {item.overs > 0 ? (item.totalRuns / (item.overs + (item.balls % 6) / 10)).toFixed(2) : '0.00'}
            </Text>
          </View>
        </View>
        
        <View style={styles.matchActions}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteMatch(item.id, item.teamName);
            }}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (completedMatches.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Completed Matches</Text>
          <Text style={styles.emptySubtitle}>
            Completed matches will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Match History</Text>
        <Text style={styles.subtitle}>
          {completedMatches.length} completed {completedMatches.length === 1 ? 'match' : 'matches'}
        </Text>
      </View>

      <FlatList
        data={completedMatches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  matchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  date: {
    fontSize: 12,
    color: '#64748b',
  },
  matchScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  overs: {
    fontSize: 14,
    color: '#64748b',
  },
  matchStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default MatchHistoryScreen;
