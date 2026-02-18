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
  
  // Get all balls including extras
  const allBalls = over.balls || [];
  
  // Filter to only legal deliveries for empty slot calculation
  const legalBalls = allBalls.filter(ball => !ball.isWide && !ball.isNoBall);
  const totalSlots = 6;
  
  return (
    <View style={[styles.container, isCurrentOver && styles.currentOver]}>
      <View style={styles.overInfo}>
        <Text style={[styles.overNumber, isCurrentOver && styles.currentOverNumber]}>
          Over {overNumber}:
        </Text>
        <Text style={styles.overSummary}>
          {ScoringEngine.getOverSummary(over)}
        </Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.ballsContainer}
      >
        {/* Show ALL balls including extras (wide/no-ball) */}
        {allBalls.map((ball, index) => (
          <BallBox key={`${ball.id}_${index}`} ball={ball} />
        ))}
        
        {/* Fill remaining legal slots with empty placeholders */}
        {legalBalls.length < totalSlots && (
          <>
            {Array.from({ length: totalSlots - legalBalls.length }).map((_, index) => (
              <View 
                key={`empty_${index}`} 
                style={[
                  styles.emptyBall, 
                  isCurrentOver && styles.emptyBallCurrent
                ]} 
              />
            ))}
          </>
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
  ballsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'nowrap',
  },
  emptyBall: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
    marginRight: 6,
    backgroundColor: '#1e293b',
  },
  emptyBallCurrent: {
    borderColor: '#64748b',
    backgroundColor: '#0f172a',
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
