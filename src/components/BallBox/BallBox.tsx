import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ball } from '../../types';
import { ScoringEngine } from '../../utils/scoringEngine';

interface BallBoxProps {
  ball: Ball;
}

const BallBox: React.FC<BallBoxProps> = ({ ball }) => {
  const getDisplayText = () => {
    if (ball.isWicket) return 'W';
    if (ball.isWide) return 'WD';
    if (ball.isNoBall) return 'NB';
    if (ball.isDot) return '0';
    return ball.runs.toString();
  };

  const getBoxColor = () => {
    const color = ScoringEngine.getBallColor(ball);
    return color;
  };

  return (
    <View style={[styles.container, { backgroundColor: getBoxColor() }]}>
      <Text style={styles.text}>{getDisplayText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BallBox;
