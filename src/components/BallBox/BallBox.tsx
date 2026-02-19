import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ball } from "../../types";
import { ScoringEngine } from "../../utils/scoringEngine";

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
    if (ball.isDot) return "0";
    return ball.runs.toString();
  };

  const getBoxColor = () => {
    const color = ScoringEngine.getBallColor(ball);
    return color;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getBoxColor() },
        compact && styles.compact,
      ]}
    >
      <Text style={[styles.text, compact && styles.compactText]}>
        {getDisplayText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compact: {
    width: 24,
    height: 24,
    marginRight: 3,
  },
  text: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  compactText: {
    fontSize: 10,
  },
});

export default BallBox;
