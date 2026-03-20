import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ball } from "../../types";
import { ScoringEngine } from "../../utils/scoringEngine";

const R = {
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

interface BallBoxProps {
  ball: Ball;
  compact?: boolean;
}

const BallBox: React.FC<BallBoxProps> = ({ ball, compact = false }) => {
  const getDisplayText = () => {
    if (ball.isWicket) return "W";
    if (ball.isWide) return "WD";
    if (ball.isNoBall) return "NB";
    if (ball.is1stBounce) return "1B";
    if (ball.isDot) return "•";
    return ball.runs.toString();
  };

  const color = ScoringEngine.getBallColor(ball);

  return (
    <View style={[
      styles.container,
      { backgroundColor: color, shadowColor: color },
      compact && styles.compact,
    ]}>
      <Text style={[styles.text, compact && styles.compactText]}>
        {getDisplayText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 34,
    height: 34,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  compact: {
    width: 26,
    height: 26,
    borderRadius: 5,
    marginRight: 3,
  },
  text: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    fontFamily: R.mono,
    letterSpacing: 0.3,
  },
  compactText: {
    fontSize: 9,
  },
});

export default BallBox;
