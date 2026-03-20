import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Over } from '../../types';
import BallBox from '../BallBox/BallBox';
import { ScoringEngine } from '../../utils/scoringEngine';

const R = {
  bg: '#1E3D2F',
  bgCurrent: '#122B22',
  text: '#F5F5DC',
  textMuted: '#8FAF99',
  accent: '#D4A017',
  teal: '#00897B',
  border: '#2E5040',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

interface OverRowProps {
  over: Over;
  isCurrentOver?: boolean;
}

const OverRow: React.FC<OverRowProps> = ({ over, isCurrentOver = false }) => {
  const overNum = over.overNumber.toString().padStart(2, '0');
  const allBalls = over.balls || [];
  const legalBalls = allBalls.filter(b => !b.isWide && !b.isNoBall);
  const ballsRemaining = Math.max(0, 6 - legalBalls.length);

  return (
    <View style={[styles.container, isCurrentOver && styles.currentContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.overBadge, isCurrentOver && styles.overBadgeCurrent]}>
          <Text style={[styles.overNum, isCurrentOver && styles.overNumCurrent]}>
            {overNum}
          </Text>
        </View>
        <Text style={styles.summary}>{ScoringEngine.getOverSummary(over)}</Text>
        {isCurrentOver && ballsRemaining > 0 && (
          <View style={styles.ballsLeftBadge}>
            <Text style={styles.ballsLeftText}>{ballsRemaining} left</Text>
          </View>
        )}
        <Text style={styles.runsLabel}>{over.totalRuns}R</Text>
      </View>

      {/* Balls */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.ballsRow}
      >
        {allBalls.map((ball, idx) => (
          <BallBox key={`${ball.id}_${idx}`} ball={ball} />
        ))}
        {isCurrentOver && ballsRemaining > 0 &&
          Array.from({ length: ballsRemaining }).map((_, idx) => (
            <View key={`empty_${idx}`} style={styles.emptyBall} />
          ))
        }
      </ScrollView>

      {/* Footer stats */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Runs: {over.totalRuns}  ·  Wkts: {over.wickets}  ·  Extras: {over.extras}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: R.bg,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: R.border,
    marginHorizontal: 8,
    marginVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: R.border,
  },
  currentContainer: {
    backgroundColor: R.bgCurrent,
    borderLeftWidth: 3,
    borderLeftColor: R.accent,
    borderColor: R.accent,
    shadowColor: R.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  // Header row
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  overBadge: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: R.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overBadgeCurrent: {
    backgroundColor: R.accent,
  },
  overNum: {
    fontSize: 12,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
  },
  overNumCurrent: {
    color: '#122B22',
  },
  summary: {
    fontSize: 12,
    color: R.textMuted,
    flex: 1,
    fontFamily: R.mono,
    letterSpacing: 0.5,
  },
  ballsLeftBadge: {
    backgroundColor: 'rgba(212,160,23,0.15)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.35)',
  },
  ballsLeftText: {
    fontSize: 10,
    fontWeight: '800',
    color: R.accent,
    fontFamily: R.mono,
  },
  runsLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
  },

  // Balls
  ballsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyBall: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: R.border,
    marginRight: 4,
    borderStyle: 'dashed',
  },

  // Footer
  footer: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: R.border,
  },
  footerText: {
    fontSize: 10,
    color: R.textMuted,
    textAlign: 'center',
    fontFamily: R.mono,
    letterSpacing: 0.3,
  },
});

export default OverRow;
