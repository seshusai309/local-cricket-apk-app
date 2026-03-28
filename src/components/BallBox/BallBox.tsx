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

  const isSix = ball.runs === 6 && !ball.isWide && !ball.isNoBall;
  const isFour = ball.runs === 4 && !ball.isWide && !ball.isNoBall;
  const isDot = ball.isDot || (ball.runs === 0 && !ball.isWicket && !ball.isWide && !ball.isNoBall);
  const isNormalRun = !ball.isWicket && !ball.isWide && !ball.isNoBall && !isSix && !isFour && !ball.is1stBounce && !isDot;

  // Text color: white on colored backgrounds, dark on light backgrounds
  const textColor = (isSix || isFour || ball.isWicket || ball.isWide || ball.isNoBall || ball.is1stBounce)
    ? '#FFFFFF'
    : '#333333';

  // Border: always show a visible border
  const borderColor = isSix ? '#16A34A'
    : isFour ? '#2563EB'
    : ball.is1stBounce ? '#7C3AED'
    : isNormalRun ? '#A0A0A0'
    : isDot ? '#D0D0D0'
    : 'transparent';

  return (
    <View style={[
      styles.container,
      { backgroundColor: color, borderColor, borderWidth: 1 },
      compact && styles.compact,
    ]}>
      <Text style={[styles.text, compact && styles.compactText, { color: textColor }]}>
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
    color: "#111111",
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
