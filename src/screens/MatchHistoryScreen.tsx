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
  bg: '#F5F5F5',
  bgCard: '#FFFFFF',
  bgCardAlt: '#F0F0F0',
  text: '#111111',
  textMuted: '#666666',
  accent: '#16A34A',
  accentDim: 'rgba(22,163,74,0.1)',
  red: '#DC2626',
  redDim: 'rgba(220,38,38,0.08)',
  blue: '#2563EB',
  border: '#E0E0E0',
  borderBright: '#CCCCCC',
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
    const rr = item.balls > 0 ? (item.totalRuns / (item.balls / 6)).toFixed(1) : '0.0';
    const isWon = (item.targetScore ?? 0) > 0 && item.totalRuns >= item.targetScore;
    const isEven = index % 2 === 0;

    return (
      <TouchableOpacity
        style={[styles.card, isEven ? styles.cardA : styles.cardB]}
        onPress={() => navigation.navigate('MatchDetail', { match: item })}
        activeOpacity={0.85}
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          {/* Avatar letter */}
          <View style={[styles.avatar, isWon && styles.avatarWon]}>
            <Text style={[styles.avatarText, isWon && styles.avatarTextWon]}>
              {item.teamName.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Team info */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTeam} numberOfLines={1}>
              {item.teamName}{item.team2Name ? ` vs ${item.team2Name}` : ''}
            </Text>
            <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          </View>

          {/* Score */}
          <View style={styles.scoreBadge}>
            {item.innings1Score > 0 && item.team2Name ? (
              // Two-innings match: show both
              <>
                <View style={styles.innLine}>
                  <Text style={styles.innTag}>{item.teamName.substring(0, 3).toUpperCase()}</Text>
                  <Text style={styles.innScore}>
                    {item.innings1Score}/{item.innings1Wickets}
                  </Text>
                </View>
                <View style={styles.innLine}>
                  <Text style={[styles.innTag, { color: R.blue }]}>
                    {item.team2Name.substring(0, 3).toUpperCase()}
                  </Text>
                  <Text style={[styles.innScore, isWon && { color: R.accent }]}>
                    {item.totalRuns}/{item.wickets}
                  </Text>
                </View>
                <Text style={styles.scoreOvers}>{oversDisplay} ov</Text>
              </>
            ) : (
              // Single innings
              <>
                <Text style={[styles.scoreMain, isWon && { color: R.accent }]}>
                  {item.totalRuns}<Text style={styles.scoreSlash}>/</Text>{item.wickets}
                </Text>
                <Text style={styles.scoreOvers}>{oversDisplay} ov</Text>
              </>
            )}
          </View>
        </View>

        {/* Stats strip */}
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
          {(item.targetScore ?? 0) > 0 && (
            <>
              <View style={styles.statDiv} />
              <View style={styles.stat}>
                <Text style={[styles.statVal, { color: isWon ? R.accent : R.red }]}>
                  {item.targetScore}
                </Text>
                <Text style={styles.statLbl}>TARGET</Text>
              </View>
            </>
          )}
        </View>

        {/* Won/result badge + actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={(e) => { e.stopPropagation(); handleDelete(item.id, item.teamName); }}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
          {isWon && (
            <View style={styles.wonBadge}>
              <Text style={styles.wonBadgeText}>WON 🏆</Text>
            </View>
          )}
          <Text style={styles.viewHint}>Details  ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (completedMatches.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyNum}>00</Text>
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
    padding: 12,
    gap: 8,
  },

  // Card
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: R.borderBright,
  },
  cardA: { backgroundColor: R.bgCard },
  cardB: { backgroundColor: '#E8E8E8' },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: R.bgCardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: R.borderBright,
  },
  avatarWon: {
    backgroundColor: R.accentDim,
    borderColor: 'rgba(22,163,74,0.4)',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: R.textMuted,
    fontFamily: R.mono,
  },
  avatarTextWon: { color: R.accent },
  cardInfo: { flex: 1 },
  cardTeam: {
    fontSize: 17,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  cardDate: {
    fontSize: 12,
    color: R.textMuted,
    fontFamily: R.mono,
    fontWeight: '600',
  },
  scoreBadge: { alignItems: 'flex-end' },
  scoreMain: {
    fontSize: 28,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
    letterSpacing: -1,
  },
  scoreSlash: {
    fontSize: 20,
    fontWeight: '300',
    color: R.borderBright,
  },
  scoreOvers: {
    fontSize: 10,
    color: R.textMuted,
    marginTop: 2,
    fontFamily: R.mono,
  },
  // Two-innings score display
  innLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    justifyContent: 'flex-end',
  },
  innTag: {
    fontSize: 9,
    fontWeight: '900',
    color: R.accent,
    fontFamily: R.mono,
    letterSpacing: 1,
    minWidth: 28,
    textAlign: 'right',
  },
  innScore: {
    fontSize: 22,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
    letterSpacing: -0.5,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: R.bg,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: R.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDiv: { width: 1, backgroundColor: R.border },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
  },
  statLbl: {
    fontSize: 8,
    fontWeight: '700',
    color: R.textMuted,
    letterSpacing: 1,
    marginTop: 2,
    fontFamily: R.mono,
  },

  // Actions
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: R.redDim,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.25)',
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: R.red,
    fontFamily: R.mono,
  },
  wonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: R.accentDim,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.35)',
  },
  wonBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: R.accent,
    fontFamily: R.mono,
    letterSpacing: 0.5,
  },
  viewHint: {
    fontSize: 12,
    color: R.textMuted,
    fontWeight: '700',
    fontFamily: R.mono,
    marginLeft: 'auto',
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyNum: {
    fontSize: 80,
    fontWeight: '900',
    color: R.borderBright,
    fontFamily: R.mono,
    letterSpacing: -4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: R.text,
    letterSpacing: 2,
    fontFamily: R.mono,
  },
  emptySub: {
    fontSize: 13,
    color: R.textMuted,
    textAlign: 'center',
    fontFamily: R.mono,
  },
});

export default MatchHistoryScreen;
