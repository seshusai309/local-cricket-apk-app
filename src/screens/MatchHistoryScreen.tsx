import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useMatchStore } from '../store/matchStore';

const R = {
  bg: '#1B3A2F',
  bgCard: '#1E4034',
  bgCardAlt: '#1A3830',
  text: '#F5F5DC',
  textMuted: '#8FAF99',
  accent: '#D4A017',
  teal: '#00897B',
  border: '#2E5040',
  red: '#C62828',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

interface MatchHistoryScreenProps {
  navigation: any;
}

const MatchHistoryScreen: React.FC<MatchHistoryScreenProps> = ({ navigation }) => {
  const { matches, deleteMatch } = useMatchStore();
  const completedMatches = matches.filter(m => m.isCompleted);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const handleDelete = (matchId: string, teamName: string) => {
    Alert.alert('Delete Match', `Delete "${teamName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMatch(matchId) },
    ]);
  };

  const renderMatch = ({ item, index }: { item: any; index: number }) => {
    const oversDisplay = `${item.overs}.${item.balls % 6}`;
    const rr = item.overs > 0 || item.balls % 6 > 0
      ? (item.totalRuns / (item.balls / 6)).toFixed(1)
      : '0.0';
    const isEven = index % 2 === 0;

    return (
      <TouchableOpacity
        style={[styles.card, isEven ? styles.cardA : styles.cardB]}
        onPress={() => navigation.navigate('MatchDetail', { match: item })}
        activeOpacity={0.85}
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.teamName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTeam} numberOfLines={1}>{item.teamName}</Text>
            <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreMain}>{item.totalRuns}/{item.wickets}</Text>
            <Text style={styles.scoreOvers}>{oversDisplay} ov</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{rr}</Text>
            <Text style={styles.statLbl}>RUN RATE</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{item.extras ?? 0}</Text>
            <Text style={styles.statLbl}>EXTRAS</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{item.maxOvers}</Text>
            <Text style={styles.statLbl}>OVERS</Text>
          </View>
          {item.targetScore > 0 && (
            <>
              <View style={styles.statDiv} />
              <View style={styles.stat}>
                <Text style={[styles.statVal, { color: item.totalRuns >= item.targetScore ? R.teal : R.accent }]}>
                  {item.targetScore}
                </Text>
                <Text style={styles.statLbl}>TARGET</Text>
              </View>
            </>
          )}
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={(e) => { e.stopPropagation(); handleDelete(item.id, item.teamName); }}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
          <Text style={styles.viewHint}>View Details  ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (completedMatches.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>NO HISTORY YET</Text>
          <Text style={styles.emptySub}>Complete a match to see it here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={completedMatches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: R.bg,
  },
  list: {
    padding: 14,
    gap: 10,
  },

  // Card
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: R.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardA: { backgroundColor: R.bgCard },
  cardB: { backgroundColor: R.bgCardAlt },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(212,160,23,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.35)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: R.accent,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  cardInfo: { flex: 1 },
  cardTeam: {
    fontSize: 16,
    fontWeight: '800',
    color: R.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginBottom: 3,
  },
  cardDate: {
    fontSize: 12,
    color: R.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  scoreBadge: { alignItems: 'flex-end' },
  scoreMain: {
    fontSize: 22,
    fontWeight: '900',
    color: R.accent,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  scoreOvers: {
    fontSize: 11,
    color: R.textMuted,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: R.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDiv: { width: 1, backgroundColor: R.border },
  statVal: {
    fontSize: 15,
    fontWeight: '900',
    color: R.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  statLbl: {
    fontSize: 8,
    color: R.textMuted,
    letterSpacing: 0.8,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // Actions
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(198,40,40,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(198,40,40,0.25)',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: R.red,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  viewHint: {
    fontSize: 13,
    color: R.textMuted,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // Empty
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: R.accent,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  emptySub: {
    fontSize: 14,
    color: R.textMuted,
    textAlign: 'center',
  },
});

export default MatchHistoryScreen;
