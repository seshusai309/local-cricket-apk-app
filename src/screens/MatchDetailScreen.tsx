// MatchDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
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
      `Are you sure you want to delete "${match.teamName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMatch(match.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderOverRow = (over: any, index: number) => {
    // ✅ FIX: Separate legal balls and extras — never mix them
    const legalBalls = over.balls.filter((b: any) => !b.isWide && !b.isNoBall);
    const extraBalls = over.balls.filter((b: any) => b.isWide || b.isNoBall);
    const emptySlots = Math.max(0, 6 - legalBalls.length);
    const isEven = index % 2 === 0;

    return (
      <View
        key={`over-${over.overNumber}-${over.id}`}
        style={[styles.overCard, isEven && styles.overCardAlt]}
      >
        {/* Over header */}
        <View style={styles.overHeader}>
          <View style={styles.overNumberBadge}>
            <Text style={styles.overNumberText}>{over.overNumber}</Text>
          </View>
          <View style={styles.overHeaderStats}>
            <Text style={styles.overHeaderRuns}>{over.totalRuns} runs</Text>
            {over.wickets > 0 && (
              <Text style={styles.overHeaderWickets}> · {over.wickets}W</Text>
            )}
          </View>
        </View>

        {/* 6 legal ball boxes + empty slots */}
        <View style={styles.ballsRow}>
          {legalBalls.slice(0, 6).map((ball: any, ballIndex: number) => (
            <BallBox
              key={`legal-${over.overNumber}-${ballIndex}`}
              ball={ball}
              compact
            />
          ))}
          {Array.from({ length: emptySlots }).map((_, idx) => (
            <View key={`empty-${over.overNumber}-${idx}`} style={styles.emptyBall} />
          ))}
        </View>

        {/* Extras row — shown separately below, only if any */}
        {extraBalls.length > 0 && (
          <View style={styles.extrasRow}>
            <Text style={styles.extrasLabel}>Extras: </Text>
            {extraBalls.map((ball: any, idx: number) => (
              <BallBox
                key={`extra-${over.overNumber}-${idx}`}
                ball={ball}
                compact
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const oversDisplay = `${match.overs}.${match.balls % 6}`;
  const totalSixes = match.oversList?.reduce(
    (acc, over) => acc + over.balls.filter((b: any) => b.runs === 6 && !b.isWide).length,
    0
  ) || 0;
  const totalFours = match.oversList?.reduce(
    (acc, over) => acc + over.balls.filter((b: any) => b.runs === 4 && !b.isWide).length,
    0
  ) || 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Minimal Header Card ── */}
      <View style={styles.headerCard}>

        {/* Row 1: Team name + COMPLETED badge */}
        <View style={styles.topRow}>
          <Text style={styles.teamName} numberOfLines={1}>{match.teamName}</Text>
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>DONE</Text>
          </View>
        </View>

        {/* Row 2: Score + Overs inline */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreLeft}>
            <Text style={styles.runs}>{match.totalRuns}</Text>
            <Text style={styles.separator}>/</Text>
            <Text style={styles.wickets}>{match.wickets}</Text>
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.oversMain}>{oversDisplay}</Text>
            <Text style={styles.oversOf}>/ {match.maxOvers} ov</Text>
          </View>
        </View>

        {/* Row 3: Compact pill stats — no run rate */}
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{match.balls}</Text>
            <Text style={styles.pillLabel}>Balls</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{match.extras ?? 0}</Text>
            <Text style={styles.pillLabel}>Extras</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{totalSixes}</Text>
            <Text style={styles.pillLabel}>Sixes</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{totalFours}</Text>
            <Text style={styles.pillLabel}>Fours</Text>
          </View>
        </View>
      </View>

      {/* ── Section divider ── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>Over by Over</Text>
        <View style={styles.sectionLine} />
      </View>

      {/* ── Overs list ── */}
      <View style={styles.oversList}>
        {match.oversList && match.oversList.length > 0 ? (
          match.oversList.map((over, index) => renderOverRow(over, index))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No over data available</Text>
          </View>
        )}
      </View>

      {/* ── Delete button ── */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteMatch}
        activeOpacity={0.8}
      >
        <Text style={styles.deleteText}>🗑  Delete Match</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  // ── Header ──
  headerCard: {
    backgroundColor: '#1e293b',
    margin: 12,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#cbd5e1',
    flex: 1,
    marginRight: 8,
  },
  completedBadge: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  completedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 1,
  },
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

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginHorizontal: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // ── Over cards ──
  oversList: {
    paddingHorizontal: 12,
  },
  overCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  overCardAlt: {
    backgroundColor: 'rgba(30,41,59,0.5)',
  },
  overHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  overNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  overNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  overSummary: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    flex: 1,
  },
  overHeaderStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overHeaderRuns: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  overHeaderWickets: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
  },

  // ✅ Legal balls only in the 6-box grid
  ballsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 4,
  },
  emptyBall: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'transparent',
  },

  // ✅ Extras shown in a separate clearly labelled row
  extrasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    flexWrap: 'wrap',
    gap: 4,
  },
  extrasLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 2,
  },

  // ── Delete ──
  deleteButton: {
    margin: 12,
    marginTop: 20,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },

  // ── Empty state ──
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default MatchDetailScreen;