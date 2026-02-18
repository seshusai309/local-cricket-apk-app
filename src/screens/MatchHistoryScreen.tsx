// MatchHistoryScreen.tsx
import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  Animated,
  Dimensions 
} from 'react-native';
import { useMatchStore } from '../store/matchStore';

const { width } = Dimensions.get('window');

interface MatchHistoryScreenProps {
  navigation: any;
}

const MatchHistoryScreen: React.FC<MatchHistoryScreenProps> = ({ navigation }) => {
  const { matches, deleteMatch } = useMatchStore();
  const scrollY = useRef(new Animated.Value(0)).current;

  const completedMatches = matches.filter(match => match.isCompleted);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleDeleteMatch = (matchId: string, teamName: string) => {
    Alert.alert(
      'Delete Match',
      `Delete "${teamName}"?`,
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

  const renderMatch = ({ item, index }: { item: any; index: number }) => {
    const oversDisplay = `${item.overs}.${item.balls % 6}`;
    const inputRange = [
      -1, 
      0, 
      120 * index, 
      120 * (index + 2)
    ];
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.95],
    });
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.5],
    });

    return (
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <TouchableOpacity 
          style={styles.matchCard}
          onPress={() => navigateToMatchDetail(item)}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.teamSection}>
              <View style={styles.teamAvatar}>
                <Text style={styles.teamAvatarText}>
                  {item.teamName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.teamName} numberOfLines={1}>
                  {item.teamName}
                </Text>
                <Text style={styles.matchDate}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{item.totalRuns}/{item.wickets}</Text>
              <Text style={styles.oversText}>{oversDisplay}</Text>
            </View>
          </View>

          <View style={styles.cardStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{oversDisplay}</Text>
              <Text style={styles.statLabel}>Overs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.balls}</Text>
              <Text style={styles.statLabel}>Balls</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {item.overs > 0 
                  ? (item.totalRuns / (item.overs + (item.balls % 6) / 6)).toFixed(1) 
                  : '0.0'}
              </Text>
              <Text style={styles.statLabel}>RR</Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.deleteAction}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteMatch(item.id, item.teamName);
              }}
            >
              <Text style={styles.deleteActionText}>Delete</Text>
            </TouchableOpacity>
            <View style={styles.viewHint}>
              <Text style={styles.viewHintText}>View Details</Text>
              <View style={styles.arrow}>
                <View style={styles.arrowHead} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (completedMatches.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>📋</Text>
          </View>
          <Text style={styles.emptyTitle}>No History Yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete a match to see it here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={completedMatches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  matchCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  teamAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10b981',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    maxWidth: 150,
  },
  matchDate: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  scoreBadge: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  oversText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  cardStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 16,
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteAction: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  viewHint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewHintText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginRight: 8,
  },
  arrow: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowHead: {
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#64748b',
    transform: [{ rotate: '45deg' }],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default MatchHistoryScreen;