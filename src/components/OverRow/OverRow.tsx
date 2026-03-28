import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Over } from '../../types';
import BallBox from '../BallBox/BallBox';
import { ScoringEngine } from '../../utils/scoringEngine';

const R = {
  bg: '#FFFFFF',
  bgCurrent: '#F0FFF4',
  text: '#111111',
  textMuted: '#666666',
  accent: '#16A34A',
  border: '#E0E0E0',
  borderBright: '#CCCCCC',
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
            <Text style={styles.ballsLeftText}>{ballsRemaining}</Text>
          </View>
        )}
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {over.totalRuns}R  ·  {over.wickets}W  ·  {over.extras}ex
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: R.bg,
    padding: 10,
    marginHorizontal: 6,
    marginVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: R.border,
  },
  currentContainer: {
    backgroundColor: R.bgCurrent,
    borderLeftWidth: 2,
    borderLeftColor: R.accent,
    borderColor: 'rgba(22,163,74,0.35)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  overBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: R.borderBright,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overBadgeCurrent: {
    backgroundColor: R.accent,
  },
  overNum: {
    fontSize: 11,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
  },
  overNumCurrent: {
    color: '#FFFFFF',
  },
  summary: {
    fontSize: 11,
    color: R.textMuted,
    flex: 1,
    fontFamily: R.mono,
    letterSpacing: 0.5,
  },
  ballsLeftBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballsLeftText: {
    fontSize: 9,
    fontWeight: '900',
    color: R.accent,
    fontFamily: R.mono,
  },
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
  },

  footer: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: R.border,
  },
  footerText: {
    fontSize: 9,
    color: R.textMuted,
    textAlign: 'center',
    fontFamily: R.mono,
    letterSpacing: 0.5,
  },
});

export default OverRow;
