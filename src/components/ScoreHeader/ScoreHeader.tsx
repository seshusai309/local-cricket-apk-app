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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#d1fae5',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#d1fae5',
    marginHorizontal: 16,
  },
  totalScore: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default ScoreHeader;
