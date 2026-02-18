import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Over } from '../../types';
import BallBox from '../BallBox/BallBox';
import { ScoringEngine } from '../../utils/scoringEngine';

interface OverRowProps {
  over: Over;
  isCurrentOver?: boolean;
}

const OverRow: React.FC<OverRowProps> = ({ over, isCurrentOver = false }) => {
  const overNumber = over.overNumber.toString().padStart(2, '0');
  
  const allBalls = over.balls || [];
  const legalBalls = allBalls.filter(ball => !ball.isWide && !ball.isNoBall);
  const totalSlots = 6;
  const ballsRemaining = totalSlots - legalBalls.length;

  return (
    <View style={[styles.container, isCurrentOver && styles.currentOver]}>
      
      {/* Over header row */}
      <View style={styles.overInfo}>
        <Text style={[styles.overNumber, isCurrentOver && styles.currentOverNumber]}>
          Over {overNumber}:
        </Text>
        <Text style={styles.overSummary}>
          {ScoringEngine.getOverSummary(over)}
        </Text>

        {/* Balls remaining badge — only for current over */}
        {isCurrentOver && ballsRemaining > 0 && (
          <View style={styles.ballsRemainingBadge}>
            <Text style={styles.ballsRemainingText}>{ballsRemaining}</Text>
            <Text style={styles.ballsRemainingLabel}> left</Text>
          </View>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.ballsContainer}
      >
        {/* All bowled balls including wides/no-balls */}
        {allBalls.map((ball, index) => (
          <BallBox key={`${ball.id}_${index}`} ball={ball} />
        ))}
        
        {/* Empty slots ONLY for current over */}
        {isCurrentOver && ballsRemaining > 0 && (
          Array.from({ length: ballsRemaining }).map((_, index) => (
            <View 
              key={`empty_${index}`} 
              style={styles.emptyBall}
            />
          ))
        )}
      </ScrollView>
      
      <View style={styles.overStats}>
        <Text style={styles.statText}>
          Runs: {over.totalRuns} | Wkts: {over.wickets} | Extras: {over.extras}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#334155',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  currentOver: {
    backgroundColor: '#1e293b',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  overInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  overNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
    marginRight: 8,
  },
  currentOverNumber: {
    color: '#10b981',
  },
  overSummary: {
    fontSize: 13,
    color: '#94a3b8',
    flex: 1,
  },

  // Balls remaining badge
  ballsRemainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  ballsRemainingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10b981',
  },
  ballsRemainingLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#10b981',
    opacity: 0.8,
  },

  ballsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyBall: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#64748b',
    marginRight: 4,
    backgroundColor: '#0f172a',
    borderStyle: 'dashed',
  },
  overStats: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#475569',
  },
  statText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default OverRow;