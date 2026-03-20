import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from "react-native";
import { useMatchStore } from "../store/matchStore";

const { width } = Dimensions.get("window");

// ── Retro Palette ────────────────────────────────────────────────────────────
const R = {
  bg: "#1B3A2F",
  bgDark: "#122B22",
  bgCard: "#1E4034",
  text: "#F5F5DC",
  textMuted: "#8FAF99",
  accent: "#D4A017",
  teal: "#00897B",
  border: "#2E5040",
  red: "#C62828",
  mono: Platform.OS === "ios" ? "Courier New" : "monospace",
};

interface CreateMatchScreenProps {
  navigation: any;
}

const CreateMatchScreen: React.FC<CreateMatchScreenProps> = ({
  navigation,
}) => {
  const [teamName, setTeamName] = useState("Local Team");
  const [maxOvers, setMaxOvers] = useState("20");
  const [targetScore, setTargetScore] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOvers, setSelectedOvers] = useState(20);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const { createNewMatch } = useMatchStore();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const animatePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const handleOversSelect = useCallback(
    (overs: number) => {
      setSelectedOvers(overs);
      setMaxOvers(overs.toString());
      setIsCustomMode(false);
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => glowAnim.setValue(0));
    },
    [glowAnim],
  );

  const handleCustomSelect = useCallback(() => {
    setIsCustomMode(true);
    setSelectedOvers(0);
  }, []);

  const handleCreateMatch = async () => {
    animatePress();
    setIsCreating(true);
    try {
      const overs = parseInt(maxOvers, 10) || 20;
      const target = parseInt(targetScore, 10) || 0;
      await createNewMatch(teamName || "Local Team", overs, target);
      navigation.navigate("LiveMatch");
    } catch (error) {
      console.error("Error creating match:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const oversOptions = [5, 10, 20, 50];

  return (
    <View style={styles.container}>
      {/* Decorative grain overlay */}
      <View style={styles.grain} pointerEvents="none" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🏏</Text>
          <Text style={styles.title}>NEW MATCH</Text>
          <Text style={styles.subtitle}>Set up your game</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Team Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>TEAM NAME</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={teamName}
                onChangeText={setTeamName}
                placeholder="Enter team name"
                placeholderTextColor={R.textMuted}
                selectionColor={R.accent}
              />
              <View style={styles.inputUnderline} />
            </View>
          </View>

          {/* Target Score */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              TARGET SCORE <Text style={styles.labelOptional}>(OPTIONAL)</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={targetScore}
                onChangeText={setTargetScore}
                placeholder="Enter target score and Leave None if not needed"
                placeholderTextColor={R.textMuted}
                selectionColor={R.accent}
                keyboardType="number-pad"
              />
              <View
                style={[styles.inputUnderline, { backgroundColor: R.accent }]}
              />
            </View>
            {targetScore !== "" && !isNaN(parseInt(targetScore)) && (
              <View style={styles.targetPreview}>
                <Text style={styles.targetPreviewText}>
                  🎯 Need {targetScore} to win
                </Text>
              </View>
            )}
          </View>

          {/* Overs Section */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>MATCH OVERS</Text>

            <View style={styles.oversGrid}>
              {oversOptions.map((overs) => (
                <TouchableOpacity
                  key={overs}
                  style={[
                    styles.oversChip,
                    selectedOvers === overs &&
                      !isCustomMode &&
                      styles.oversChipActive,
                  ]}
                  onPress={() => handleOversSelect(overs)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.oversChipNum,
                      selectedOvers === overs &&
                        !isCustomMode &&
                        styles.oversChipNumActive,
                    ]}
                  >
                    {overs}
                  </Text>
                  <Text
                    style={[
                      styles.oversChipLabel,
                      selectedOvers === overs &&
                        !isCustomMode &&
                        styles.oversChipLabelActive,
                    ]}
                  >
                    OV
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom row */}
            <View style={styles.customRow}>
              <TouchableOpacity
                style={[
                  styles.customToggle,
                  isCustomMode && styles.customToggleActive,
                ]}
                onPress={handleCustomSelect}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.customToggleText,
                    isCustomMode && styles.customToggleTextActive,
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>

              {isCustomMode && (
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() =>
                      setMaxOvers((v) =>
                        Math.max(1, (parseInt(v, 10) || 1) - 1).toString(),
                      )
                    }
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <View style={styles.stepperDisplay}>
                    <Text style={styles.stepperDisplayText}>{maxOvers}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() =>
                      setMaxOvers((v) =>
                        Math.min(100, (parseInt(v, 10) || 1) + 1).toString(),
                      )
                    }
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonGroup}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.startBtn, isCreating && styles.startBtnDisabled]}
              onPress={handleCreateMatch}
              disabled={isCreating}
              activeOpacity={0.85}
            >
              <Text style={styles.startBtnText}>
                {isCreating ? "STARTING..." : "▶  START MATCH"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: R.bg,
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    opacity: 0.03,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  // Header
  header: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 28,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: R.accent,
    letterSpacing: 4,
    fontFamily: R.mono,
  },
  subtitle: {
    fontSize: 13,
    color: R.textMuted,
    letterSpacing: 2,
    marginTop: 6,
    textTransform: "uppercase",
  },

  // Card
  card: {
    backgroundColor: R.bgCard,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: R.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  fieldGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: R.teal,
    letterSpacing: 2,
    marginBottom: 10,
    fontFamily: R.mono,
  },
  labelOptional: {
    fontSize: 10,
    color: R.textMuted,
    letterSpacing: 1,
    fontWeight: "400",
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    fontSize: 22,
    fontWeight: "700",
    color: R.text,
    paddingVertical: 8,
    fontFamily: R.mono,
  },
  inputUnderline: {
    height: 2,
    backgroundColor: R.border,
    borderRadius: 1,
  },
  targetPreview: {
    marginTop: 8,
    backgroundColor: "rgba(212,160,23,0.12)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.3)",
  },
  targetPreviewText: {
    fontSize: 13,
    color: R.accent,
    fontWeight: "700",
    fontFamily: R.mono,
  },

  // Overs grid
  oversGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 8,
  },
  oversChip: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: R.border,
  },
  oversChipActive: {
    backgroundColor: R.accent,
    borderColor: R.accent,
    shadowColor: R.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  oversChipNum: {
    fontSize: 20,
    fontWeight: "900",
    color: R.textMuted,
    fontFamily: R.mono,
  },
  oversChipNumActive: { color: R.bgDark },
  oversChipLabel: {
    fontSize: 9,
    color: R.border,
    letterSpacing: 1,
    fontWeight: "700",
    marginTop: 2,
  },
  oversChipLabelActive: { color: R.bgDark },

  // Custom overs
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: R.border,
    minHeight: 56,
  },
  customToggle: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: R.border,
    minWidth: 76,
    alignItems: "center",
  },
  customToggleActive: {
    backgroundColor: R.teal,
    borderColor: R.teal,
  },
  customToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: R.textMuted,
    fontFamily: R.mono,
  },
  customToggleTextActive: { color: "#fff" },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    flex: 1,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(212,160,23,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: R.accent,
  },
  stepperBtnText: {
    fontSize: 22,
    fontWeight: "700",
    color: R.accent,
    fontFamily: R.mono,
  },
  stepperDisplay: {
    minWidth: 56,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: R.border,
  },
  stepperDisplayText: {
    fontSize: 22,
    fontWeight: "900",
    color: R.text,
    fontFamily: R.mono,
  },

  // Buttons
  buttonGroup: {
    marginTop: 28,
    gap: 14,
  },
  startBtn: {
    backgroundColor: R.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: R.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#F0C030",
  },
  startBtnDisabled: { opacity: 0.55 },
  startBtnText: {
    fontSize: 17,
    fontWeight: "900",
    color: R.bgDark,
    letterSpacing: 2,
    fontFamily: R.mono,
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    color: R.textMuted,
    fontWeight: "600",
  },
});

export default CreateMatchScreen;
