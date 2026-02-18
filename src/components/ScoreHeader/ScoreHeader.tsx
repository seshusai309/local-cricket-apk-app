import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Match } from '../../types';

interface ScoreHeaderProps {
  match: Match;
}

const ScoreHeader: React.FC<ScoreHeaderProps> = ({ match }) => {
  const overs = match.overs + (match.balls % 6) / 10;
  const displayOvers = `${overs.toFixed(1)}/${match.maxOvers}`;

  return (
    <View style={styles.container}>
      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Text style={styles.label}>Overs:</Text>
          <Text style={styles.value}>{displayOvers}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.label}>Extras:</Text>
          <Text style={styles.value}>{match.extras}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalScore}>
          <Text style={styles.totalValue}>{match.totalRuns}/{match.wickets}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    fontSize: 11,
    color: '#d1fae5',
    marginBottom: 2,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(209, 250, 229, 0.3)',
    marginHorizontal: 16,
  },
  totalScore: {
    flex: 1,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default ScoreHeader;
