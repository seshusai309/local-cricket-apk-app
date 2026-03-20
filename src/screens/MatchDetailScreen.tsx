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
  bg: '#1B3A2F',
  bgCard: '#1E4034',
  bgCardAlt: '#122B22',
  text: '#F5F5DC',
  textMuted: '#8FAF99',
  accent: '#D4A017',
  teal: '#00897B',
  border: '#2E5040',
  red: '#C62828',
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
          <Text style={styles.overRuns}>{over.totalRuns} runs</Text>
          {over.wickets > 0 && <Text style={styles.overWkts}>· {over.wickets}W</Text>}
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
            <Text style={styles.extrasLabel}>Extras: </Text>
            {extraBalls.map((ball: any, idx: number) => (
              <BallBox key={`extra-${over.overNumber}-${idx}`} ball={ball} compact />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Score Header ── */}
      <View style={styles.headerCard}>
        <View style={styles.topRow}>
          <Text style={styles.teamName} numberOfLines={1}>{match.teamName}</Text>
          <View style={[styles.doneBadge, isWon && styles.wonBadge]}>
            <Text style={[styles.doneText, isWon && { color: R.teal }]}>
              {isWon ? 'WON 🏆' : 'DONE'}
            </Text>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.digitBox}>
            <Text style={styles.runs}>{match.totalRuns}</Text>
          </View>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.wickets}>{match.wickets}</Text>
          <View style={styles.oversBox}>
            <Text style={styles.oversMain}>{oversDisplay}</Text>
            <Text style={styles.oversOf}>/ {match.maxOvers} ov</Text>
          </View>
        </View>

        {(match.targetScore ?? 0) > 0 && (
          <View style={[styles.targetRow, isWon && styles.targetRowWon]}>
            {isWon
              ? <Text style={styles.wonText}>🏆 Target {match.targetScore} achieved!</Text>
              : <Text style={styles.targetText}>Target: {match.targetScore}  ·  Fell short by {match.targetScore - match.totalRuns}</Text>
            }
          </View>
        )}

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

      {/* ── Over by Over ── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>📋 OVER BY OVER</Text>
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
        <Text style={styles.deleteBtnText}>🗑  Delete Match</Text>
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: R.border,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '800',
    color: R.textMuted,
    flex: 1,
    marginRight: 8,
    fontFamily: R.mono,
    letterSpacing: 1,
  },
  doneBadge: {
    backgroundColor: 'rgba(212,160,23,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.3)',
  },
  wonBadge: {
    backgroundColor: 'rgba(0,137,123,0.15)',
    borderColor: 'rgba(0,137,123,0.35)',
  },
  doneText: {
    fontSize: 11,
    fontWeight: '900',
    color: R.accent,
    letterSpacing: 1,
    fontFamily: R.mono,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  digitBox: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: R.border,
  },
  runs: {
    fontSize: 50,
    fontWeight: '900',
    color: R.accent,
    fontFamily: R.mono,
    letterSpacing: -1,
    lineHeight: 56,
  },
  separator: {
    fontSize: 28,
    fontWeight: '300',
    color: R.border,
    marginHorizontal: 6,
    lineHeight: 56,
  },
  wickets: {
    fontSize: 30,
    fontWeight: '900',
    color: R.red,
    lineHeight: 56,
    fontFamily: R.mono,
  },
  oversBox: {
    alignItems: 'flex-end',
    marginLeft: 'auto',
    paddingBottom: 4,
  },
  oversMain: {
    fontSize: 20,
    fontWeight: '900',
    color: R.teal,
    fontFamily: R.mono,
  },
  oversOf: { fontSize: 11, color: R.textMuted, marginTop: 1, fontFamily: R.mono },

  targetRow: {
    backgroundColor: 'rgba(212,160,23,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.2)',
  },
  targetRowWon: {
    backgroundColor: 'rgba(0,137,123,0.12)',
    borderColor: 'rgba(0,137,123,0.3)',
  },
  targetText: { fontSize: 13, color: R.text, fontFamily: R.mono },
  wonText: { fontSize: 14, color: R.teal, fontWeight: '900', fontFamily: R.mono },

  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: R.border,
  },
  pill: { flex: 1, alignItems: 'center' },
  pillVal: { fontSize: 14, fontWeight: '900', color: R.text, fontFamily: R.mono },
  pillLbl: { fontSize: 8, color: R.textMuted, letterSpacing: 0.8, marginTop: 2, fontFamily: R.mono },
  pillDiv: { width: 1, height: 22, backgroundColor: R.border },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 14,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: R.border },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: R.accent,
    marginHorizontal: 12,
    letterSpacing: 1.5,
    fontFamily: R.mono,
  },

  oversList: { paddingHorizontal: 12 },
  overCard: {
    backgroundColor: R.bgCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
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
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: R.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overNumText: { fontSize: 13, fontWeight: '900', color: '#fff', fontFamily: R.mono },
  overRuns: { fontSize: 13, fontWeight: '700', color: R.text, fontFamily: R.mono },
  overWkts: { fontSize: 13, fontWeight: '700', color: R.red, fontFamily: R.mono },
  ballsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 4 },
  emptyBall: {
    width: 26, height: 26, borderRadius: 4,
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
    fontSize: 10,
    color: R.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: R.mono,
  },

  deleteBtn: {
    margin: 12,
    marginTop: 20,
    backgroundColor: 'rgba(198,40,40,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(198,40,40,0.2)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 15, fontWeight: '800', color: R.red, fontFamily: R.mono },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: R.textMuted },
});

export default MatchDetailScreen;
