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
    backgroundColor: '#f8fafc',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  currentOver: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  overInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  overNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  currentOverNumber: {
    color: '#059669',
  },
  overSummary: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  ballsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'nowrap',
  },
  emptyBall: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 4,
    backgroundColor: '#ffffff',
  },
  emptyBallCurrent: {
    borderColor: '#9ca3af',
    backgroundColor: '#f9fafb',
  },
  overStats: {
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default OverRow;
