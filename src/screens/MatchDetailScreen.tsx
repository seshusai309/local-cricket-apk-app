import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useMatchStore } from '../store/matchStore';
import BallBox from '../components/BallBox/BallBox';
import { Match } from '../types';

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

interface MatchDetailScreenProps {
  navigation: any;
  route: { params: { match: Match } };
}

const MatchDetailScreen: React.FC<MatchDetailScreenProps> = ({ navigation, route }) => {
  const { match } = route.params;
  const { deleteMatch } = useMatchStore();

  const handleDelete = () => {
    Alert.alert('Delete Match', `Delete "${match.teamName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => { deleteMatch(match.id); navigation.goBack(); },
      },
    ]);
  };

  const oversDisplay = `${match.overs}.${match.balls % 6}`;
  const rr = match.balls > 0 ? (match.totalRuns / (match.balls / 6)).toFixed(1) : '0.0';

  const totalSixes = match.oversList?.reduce(
    (acc, over) => acc + over.balls.filter((b: any) => b.runs === 6 && !b.isWide && !b.isNoBall).length, 0
  ) || 0;
  const totalFours = match.oversList?.reduce(
    (acc, over) => acc + over.balls.filter((b: any) => b.runs === 4 && !b.isWide && !b.isNoBall).length, 0
  ) || 0;

  const isWon = (match.targetScore ?? 0) > 0 && match.totalRuns >= match.targetScore;

  const renderOver = (over: any, index: number) => {
    const legalBalls = over.balls.filter((b: any) => !b.isWide && !b.isNoBall);
    const extraBalls = over.balls.filter((b: any) => b.isWide || b.isNoBall);
    const emptySlots = Math.max(0, 6 - legalBalls.length);
    const isEven = index % 2 === 0;

    return (
      <View key={`over-${over.overNumber}-${over.id}`} style={[styles.overCard, isEven && styles.overCardAlt]}>
        <View style={styles.overHeader}>
          <View style={styles.overNumBadge}>
            <Text style={styles.overNumText}>{over.overNumber}</Text>
          </View>
          <Text style={styles.overRuns}>{over.totalRuns}R</Text>
          {over.wickets > 0 && <Text style={styles.overWkts}>· {over.wickets}W</Text>}
          {over.extras > 0 && <Text style={styles.overExtras}>· {over.extras}ex</Text>}
        </View>

        <View style={styles.ballsRow}>
          {legalBalls.slice(0, 6).map((ball: any, idx: number) => (
            <BallBox key={`legal-${over.overNumber}-${idx}`} ball={ball} compact />
          ))}
          {Array.from({ length: emptySlots }).map((_, idx) => (
            <View key={`empty-${over.overNumber}-${idx}`} style={styles.emptyBall} />
          ))}
        </View>

        {extraBalls.length > 0 && (
          <View style={styles.extrasRow}>
            <Text style={styles.extrasLabel}>extras  </Text>
            {extraBalls.map((ball: any, idx: number) => (
              <BallBox key={`extra-${over.overNumber}-${idx}`} ball={ball} compact />
            ))}
          </View>
        )}
      </View>
    );
  };

  const hasInnings2 = (match.currentInnings ?? 1) === 2 || (match.innings1OversList?.length ?? 0) > 0;
  const inn2Display = `${match.overs}.${match.balls % 6}`;
  const inn1OversDisplay = match.innings1Balls > 0
    ? `${Math.floor(match.innings1Balls / 6)}.${match.innings1Balls % 6}`
    : '0.0';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Score Header ── */}
      <View style={styles.headerCard}>
        <View style={styles.topRow}>
          <Text style={styles.teamName} numberOfLines={1}>
            {match.teamName}{match.team2Name ? ` vs ${match.team2Name}` : ''}
          </Text>
          <View style={[styles.doneBadge, isWon && styles.wonBadge]}>
            <Text style={[styles.doneText, isWon && { color: R.accent }]}>
              {isWon ? 'WON 🏆' : 'DONE'}
            </Text>
          </View>
        </View>

        {/* Innings 1 score (if 2-innings match) */}
        {hasInnings2 ? (
          <View>
            <View style={styles.inn1Block}>
              <Text style={styles.inn1Label}>{match.teamName} (1st Innings)</Text>
              <Text style={styles.inn1Score}>
                {match.innings1Score}/{match.innings1Wickets}
                <Text style={styles.inn1Overs}> ({inn1OversDisplay} ov)</Text>
              </Text>
            </View>
            <View style={styles.inn2Block}>
              <Text style={styles.inn2Label}>{match.team2Name || 'Team 2'} (2nd Innings)</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.runs}>{match.totalRuns}</Text>
                <Text style={styles.separator}>/</Text>
                <Text style={styles.wickets}>{match.wickets}</Text>
                <View style={styles.oversBox}>
                  <Text style={styles.oversMain}>{inn2Display}</Text>
                  <Text style={styles.oversOf}>/ {match.maxOvers} ov</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.scoreRow}>
            <Text style={styles.runs}>{match.totalRuns}</Text>
            <Text style={styles.separator}>/</Text>
            <Text style={styles.wickets}>{match.wickets}</Text>
            <View style={styles.oversBox}>
              <Text style={styles.oversMain}>{oversDisplay}</Text>
              <Text style={styles.oversOf}>/ {match.maxOvers} ov</Text>
            </View>
          </View>
        )}

        {/* Target row */}
        {(match.targetScore ?? 0) > 0 && (
          <View style={[styles.targetRow, isWon && styles.targetRowWon]}>
            {isWon
              ? <Text style={styles.wonText}>🏆 Target {match.targetScore} achieved!</Text>
              : <Text style={styles.targetText}>Target: {match.targetScore}  ·  Fell short by {match.targetScore - match.totalRuns}</Text>
            }
          </View>
        )}

        {/* Stats pills */}
        <View style={styles.pillRow}>
          {[
            { val: rr, lbl: 'RUN RATE' },
            { val: match.extras ?? 0, lbl: 'EXTRAS' },
            { val: totalSixes, lbl: 'SIXES' },
            { val: totalFours, lbl: 'FOURS' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.lbl}>
              <View style={styles.pill}>
                <Text style={styles.pillVal}>{s.val}</Text>
                <Text style={styles.pillLbl}>{s.lbl}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.pillDiv} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* ── Innings 1 overs (if 2-innings match) ── */}
      {hasInnings2 && (match.innings1OversList?.length ?? 0) > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>{match.teamName} · 1ST INNINGS</Text>
            <View style={styles.sectionLine} />
          </View>
          <View style={styles.oversList}>
            {(match.innings1OversList ?? []).map((over, index) => renderOver(over, index))}
          </View>
        </>
      )}

      {/* ── Current innings over by over ── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>
          {hasInnings2 ? `${match.team2Name || 'TEAM 2'} · 2ND INNINGS` : 'OVER BY OVER'}
        </Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.oversList}>
        {match.oversList && match.oversList.length > 0
          ? match.oversList.map((over, index) => renderOver(over, index))
          : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No over data available</Text>
            </View>
          )
        }
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
        <Text style={styles.deleteBtnText}>Delete Match</Text>
      </TouchableOpacity>

      <View style={{ height: 36 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: R.bg },

  headerCard: {
    backgroundColor: R.bgCard,
    margin: 12,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: R.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '800',
    color: R.textMuted,
    flex: 1,
    marginRight: 8,
    fontFamily: R.mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  doneBadge: {
    backgroundColor: R.bgCardAlt,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: R.borderBright,
  },
  wonBadge: {
    backgroundColor: R.accentDim,
    borderColor: 'rgba(22,163,74,0.4)',
  },
  doneText: {
    fontSize: 10,
    fontWeight: '900',
    color: R.textMuted,
    letterSpacing: 1,
    fontFamily: R.mono,
  },

  // Big score
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  runs: {
    fontSize: 64,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
    letterSpacing: -3,
    lineHeight: 70,
  },
  separator: {
    fontSize: 28,
    fontWeight: '300',
    color: R.borderBright,
    marginHorizontal: 6,
    lineHeight: 70,
  },
  wickets: {
    fontSize: 34,
    fontWeight: '900',
    color: R.red,
    lineHeight: 70,
    fontFamily: R.mono,
  },
  oversBox: {
    alignItems: 'flex-end',
    marginLeft: 'auto',
    paddingBottom: 6,
  },
  oversMain: {
    fontSize: 18,
    fontWeight: '900',
    color: R.textMuted,
    fontFamily: R.mono,
  },
  oversOf: { fontSize: 10, color: R.textMuted, marginTop: 2, fontFamily: R.mono, opacity: 0.6 },

  targetRow: {
    backgroundColor: R.accentDim,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.3)',
  },
  targetRowWon: {
    backgroundColor: R.accentDim,
    borderColor: 'rgba(22,163,74,0.4)',
  },
  targetText: { fontSize: 12, color: R.textMuted, fontFamily: R.mono },
  wonText: { fontSize: 13, color: R.accent, fontWeight: '900', fontFamily: R.mono },

  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: R.border,
  },
  pill: { flex: 1, alignItems: 'center' },
  pillVal: { fontSize: 14, fontWeight: '900', color: R.text, fontFamily: R.mono },
  pillLbl: { fontSize: 7, color: R.textMuted, letterSpacing: 1, marginTop: 2, fontFamily: R.mono },
  pillDiv: { width: 1, height: 22, backgroundColor: R.border },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: R.border },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: R.textMuted,
    marginHorizontal: 14,
    letterSpacing: 2,
    fontFamily: R.mono,
  },

  oversList: { paddingHorizontal: 12 },
  overCard: {
    backgroundColor: R.bgCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: R.border,
  },
  overCardAlt: { backgroundColor: R.bgCardAlt },
  overHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  overNumBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: R.borderBright,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overNumText: { fontSize: 11, fontWeight: '900', color: R.text, fontFamily: R.mono },
  overRuns: { fontSize: 13, fontWeight: '800', color: R.text, fontFamily: R.mono },
  overWkts: { fontSize: 12, fontWeight: '700', color: R.red, fontFamily: R.mono },
  overExtras: { fontSize: 11, color: R.textMuted, fontFamily: R.mono },
  ballsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  emptyBall: {
    width: 26, height: 26, borderRadius: 5,
    borderWidth: 1, borderColor: R.border,
  },
  extrasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: R.border,
    flexWrap: 'wrap',
    gap: 4,
  },
  extrasLabel: {
    fontSize: 9,
    color: R.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: R.mono,
  },

  deleteBtn: {
    margin: 12,
    marginTop: 20,
    backgroundColor: R.redDim,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.25)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 14, fontWeight: '800', color: R.red, fontFamily: R.mono, letterSpacing: 1 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: R.textMuted },

  inn1Block: {
    backgroundColor: 'rgba(22,163,74,0.07)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.25)',
  },
  inn1Label: {
    fontSize: 9,
    fontWeight: '800',
    color: R.accent,
    letterSpacing: 2,
    fontFamily: R.mono,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  inn1Score: {
    fontSize: 32,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
  },
  inn1Overs: {
    fontSize: 14,
    fontWeight: '400',
    color: R.textMuted,
  },
  inn2Block: {
    marginBottom: 6,
  },
  inn2Label: {
    fontSize: 9,
    fontWeight: '800',
    color: R.blue,
    letterSpacing: 2,
    fontFamily: R.mono,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
});

export default MatchDetailScreen;
