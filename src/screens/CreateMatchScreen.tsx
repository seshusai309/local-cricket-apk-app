import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Alert,
} from "react-native";
import { useMatchStore } from "../store/matchStore";
import { databaseService } from "../services/database";
import { SavedTeam } from "../types";

const R = {
  bg: "#F5F5F5",
  bgCard: "#FFFFFF",
  bgSection: "#F0F0F0",
  text: "#111111",
  textMuted: "#666666",
  accent: "#16A34A",
  accentDim: "rgba(22,163,74,0.1)",
  red: "#DC2626",
  redDim: "rgba(220,38,38,0.08)",
  border: "#E0E0E0",
  borderBright: "#CCCCCC",
  blue: "#2563EB",
  mono: Platform.OS === "ios" ? "Courier New" : "monospace",
};

const OVERS_OPTIONS = [5, 10, 20, 50];
const DEFAULT_PLAYERS = Array.from({ length: 11 }, (_, i) => `Player ${i + 1}`);

interface CreateMatchScreenProps {
  navigation: any;
}

const CreateMatchScreen: React.FC<CreateMatchScreenProps> = ({ navigation }) => {
  const { createNewMatch } = useMatchStore();
  const [isCreating, setIsCreating] = useState(false);

  const [team1Name, setTeam1Name] = useState("Team 1");
  const [team2Name, setTeam2Name] = useState("Team 2");
  const [maxOvers, setMaxOvers] = useState(20);
  const [isCustomOvers, setIsCustomOvers] = useState(false);
  const [customOvers, setCustomOvers] = useState("20");

  const [team1Players, setTeam1Players] = useState<string[]>([...DEFAULT_PLAYERS]);
  const [team2Players, setTeam2Players] = useState<string[]>([...DEFAULT_PLAYERS]);

  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
  const [loadModalFor, setLoadModalFor] = useState<1 | 2 | null>(null);

  useEffect(() => {
    databaseService.getSavedTeams().then(setSavedTeams).catch(() => {});
  }, []);

  const updatePlayer = useCallback(
    (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, idx: number, val: string) => {
      const updated = [...list];
      updated[idx] = val;
      setList(updated);
    },
    [],
  );

  const handleSaveTeam = async (teamNum: 1 | 2) => {
    const name = teamNum === 1 ? team1Name : team2Name;
    const players = teamNum === 1 ? team1Players : team2Players;
    try {
      await databaseService.saveTeam(name, players);
      const teams = await databaseService.getSavedTeams();
      setSavedTeams(teams);
      Alert.alert("Saved!", `"${name}" saved. You can load it in future matches.`);
    } catch {
      Alert.alert("Error", "Could not save team.");
    }
  };

  const handleLoadTeam = (saved: SavedTeam, teamNum: 1 | 2) => {
    const padded = [...saved.players];
    while (padded.length < 11) padded.push(`Player ${padded.length + 1}`);
    if (teamNum === 1) {
      setTeam1Name(saved.name);
      setTeam1Players(padded.slice(0, 11));
    } else {
      setTeam2Name(saved.name);
      setTeam2Players(padded.slice(0, 11));
    }
    setLoadModalFor(null);
  };

  const handleDeleteSavedTeam = async (id: string) => {
    await databaseService.deleteSavedTeam(id);
    const teams = await databaseService.getSavedTeams();
    setSavedTeams(teams);
  };

  const handleStart = async () => {
    setIsCreating(true);
    try {
      const overs = isCustomOvers ? (parseInt(customOvers, 10) || 20) : maxOvers;
      await createNewMatch({
        team1Name: team1Name || "Team 1",
        team2Name: team2Name || "Team 2",
        maxOvers: overs,
        team1Players,
        team2Players,
      });
      navigation.navigate("LiveMatch");
    } catch (error) {
      console.error("Error creating match:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: R.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ── Load Team Modal ── */}
      <Modal transparent visible={loadModalFor !== null} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>LOAD SAVED TEAM</Text>
            <Text style={styles.modalSub}>Tap a team to load into {loadModalFor === 1 ? team1Name : team2Name}</Text>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {savedTeams.length === 0 && (
                <Text style={styles.modalEmpty}>No saved teams yet.{"\n"}Save a team to reuse it here.</Text>
              )}
              {savedTeams.map(t => (
                <View key={t.id} style={styles.savedTeamRow}>
                  <TouchableOpacity
                    style={styles.savedTeamBtn}
                    onPress={() => loadModalFor && handleLoadTeam(t, loadModalFor)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.savedTeamName}>{t.name}</Text>
                    <Text style={styles.savedTeamPlayers}>
                      {t.players.slice(0, 3).join(", ")}{t.players.length > 3 ? `… +${t.players.length - 3}` : ""}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.savedTeamDel}
                    onPress={() => Alert.alert("Delete", `Delete "${t.name}"?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => handleDeleteSavedTeam(t.id) },
                    ])}
                  >
                    <Text style={styles.savedTeamDelText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setLoadModalFor(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>NEW<Text style={styles.titleAccent}> MATCH</Text></Text>
          <Text style={styles.subtitle}>· SET UP YOUR GAME ·</Text>
        </View>

        {/* ── Match Setup ── */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, { borderLeftColor: R.accent }]}>
            <Text style={[styles.cardHeaderText, { color: R.accent }]}>MATCH SETUP</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>TEAM 1 (Batting First)</Text>
            <TextInput
              style={styles.input}
              value={team1Name}
              onChangeText={setTeam1Name}
              placeholder="Team 1 name"
              placeholderTextColor={R.textMuted}
              selectionColor={R.accent}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>TEAM 2 (Chasing)</Text>
            <TextInput
              style={styles.input}
              value={team2Name}
              onChangeText={setTeam2Name}
              placeholder="Team 2 name"
              placeholderTextColor={R.textMuted}
              selectionColor={R.accent}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>MATCH OVERS</Text>
            <View style={styles.oversRow}>
              {OVERS_OPTIONS.map(o => (
                <TouchableOpacity
                  key={o}
                  style={[styles.oversChip, !isCustomOvers && maxOvers === o && styles.oversChipActive]}
                  onPress={() => { setMaxOvers(o); setIsCustomOvers(false); }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.oversChipText, !isCustomOvers && maxOvers === o && styles.oversChipTextActive]}>
                    {o}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.oversChip, isCustomOvers && styles.oversChipActive]}
                onPress={() => setIsCustomOvers(true)}
                activeOpacity={0.75}
              >
                <Text style={[styles.oversChipText, isCustomOvers && styles.oversChipTextActive]}>
                  {isCustomOvers ? customOvers : "??"}
                </Text>
              </TouchableOpacity>
            </View>
            {isCustomOvers && (
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                value={customOvers}
                onChangeText={setCustomOvers}
                placeholder="Enter overs"
                placeholderTextColor={R.textMuted}
                keyboardType="number-pad"
                selectionColor={R.accent}
              />
            )}
          </View>
        </View>

        {/* ── Team 1 Players ── */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, { borderLeftColor: R.accent }]}>
            <Text style={[styles.cardHeaderText, { color: R.accent }]}>
              {team1Name.toUpperCase() || "TEAM 1"}  ·  11 PLAYERS
            </Text>
          </View>
          <View style={styles.teamActions}>
            <TouchableOpacity style={styles.teamActionBtn} onPress={() => setLoadModalFor(1)} activeOpacity={0.8}>
              <Text style={styles.teamActionText}>↓ LOAD TEAM</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.teamActionBtn, styles.teamActionSave]} onPress={() => handleSaveTeam(1)} activeOpacity={0.8}>
              <Text style={[styles.teamActionText, { color: R.accent }]}>↑ SAVE TEAM</Text>
            </TouchableOpacity>
          </View>
          {team1Players.map((name, i) => (
            <View key={`t1p${i}`} style={styles.playerRow}>
              <View style={styles.playerNumBadge}>
                <Text style={styles.playerNumText}>{i + 1}</Text>
              </View>
              <TextInput
                style={styles.playerInput}
                value={name}
                onChangeText={v => updatePlayer(team1Players, setTeam1Players, i, v)}
                placeholder={`Player ${i + 1}`}
                placeholderTextColor={R.textMuted}
                selectionColor={R.accent}
              />
            </View>
          ))}
        </View>

        {/* ── Team 2 Players ── */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, { borderLeftColor: R.blue }]}>
            <Text style={[styles.cardHeaderText, { color: R.blue }]}>
              {team2Name.toUpperCase() || "TEAM 2"}  ·  11 PLAYERS
            </Text>
          </View>
          <View style={styles.teamActions}>
            <TouchableOpacity style={styles.teamActionBtn} onPress={() => setLoadModalFor(2)} activeOpacity={0.8}>
              <Text style={styles.teamActionText}>↓ LOAD TEAM</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.teamActionBtn, styles.teamActionSave]} onPress={() => handleSaveTeam(2)} activeOpacity={0.8}>
              <Text style={[styles.teamActionText, { color: R.blue }]}>↑ SAVE TEAM</Text>
            </TouchableOpacity>
          </View>
          {team2Players.map((name, i) => (
            <View key={`t2p${i}`} style={styles.playerRow}>
              <View style={[styles.playerNumBadge, { backgroundColor: "rgba(37,99,235,0.1)" }]}>
                <Text style={[styles.playerNumText, { color: R.blue }]}>{i + 1}</Text>
              </View>
              <TextInput
                style={styles.playerInput}
                value={name}
                onChangeText={v => updatePlayer(team2Players, setTeam2Players, i, v)}
                placeholder={`Player ${i + 1}`}
                placeholderTextColor={R.textMuted}
                selectionColor={R.blue}
              />
            </View>
          ))}
        </View>

        {/* ── CTA ── */}
        <TouchableOpacity
          style={[styles.startBtn, isCreating && { opacity: 0.5 }]}
          onPress={handleStart}
          disabled={isCreating}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>{isCreating ? "STARTING..." : "▶  START MATCH"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 20 },

  header: { paddingTop: 24, paddingBottom: 20 },
  title: { fontSize: 34, fontWeight: "900", color: R.text, fontFamily: R.mono, letterSpacing: -1 },
  titleAccent: { color: R.accent },
  subtitle: { fontSize: 10, color: R.textMuted, letterSpacing: 3, marginTop: 6, fontFamily: R.mono },

  card: {
    backgroundColor: R.bgCard,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: R.border,
    overflow: "hidden",
  },
  cardHeader: {
    borderLeftWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: R.bgSection,
  },
  cardHeaderText: { fontSize: 10, fontWeight: "900", letterSpacing: 2, fontFamily: R.mono },

  divider: { height: 1, backgroundColor: R.border, marginHorizontal: 14 },

  fieldRow: { paddingHorizontal: 14, paddingVertical: 12 },
  fieldLabel: {
    fontSize: 9, fontWeight: "800", color: R.textMuted,
    letterSpacing: 2, marginBottom: 8, fontFamily: R.mono,
  },
  input: {
    fontSize: 18, fontWeight: "700", color: R.text, fontFamily: R.mono,
    borderBottomWidth: 1, borderBottomColor: R.border, paddingVertical: 6,
  },

  oversRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  oversChip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8,
    backgroundColor: R.bgSection, borderWidth: 1, borderColor: R.border,
    minWidth: 52, alignItems: "center",
  },
  oversChipActive: { backgroundColor: R.accent, borderColor: R.accent },
  oversChipText: { fontSize: 15, fontWeight: "800", color: R.textMuted, fontFamily: R.mono },
  oversChipTextActive: { color: "#FFFFFF" },

  // Team action buttons (save / load)
  teamActions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: R.border,
  },
  teamActionBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: R.bgSection, borderWidth: 1, borderColor: R.border,
    alignItems: "center",
  },
  teamActionSave: { backgroundColor: R.accentDim, borderColor: "rgba(22,163,74,0.3)" },
  teamActionText: {
    fontSize: 10, fontWeight: "900", color: R.textMuted,
    letterSpacing: 1.5, fontFamily: R.mono,
  },

  // Player rows
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: R.border,
    gap: 12,
  },
  playerNumBadge: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "rgba(22,163,74,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  playerNumText: { fontSize: 12, fontWeight: "900", color: R.accent, fontFamily: R.mono },
  playerInput: {
    flex: 1, fontSize: 15, fontWeight: "600", color: R.text,
    fontFamily: R.mono, paddingVertical: 4,
  },

  // CTA
  startBtn: {
    backgroundColor: R.accent, borderRadius: 14,
    paddingVertical: 18, alignItems: "center", marginTop: 8,
  },
  startBtnText: {
    fontSize: 16, fontWeight: "900", color: "#FFFFFF",
    letterSpacing: 2, fontFamily: R.mono,
  },
  cancelBtn: { paddingVertical: 14, alignItems: "center" },
  cancelBtnText: { fontSize: 14, color: R.textMuted, fontWeight: "600" },

  // Load team modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center", alignItems: "center", padding: 20,
  },
  modalBox: {
    backgroundColor: R.bgCard, borderRadius: 20, padding: 20,
    width: "100%", maxWidth: 360,
    borderWidth: 1, borderColor: R.border,
  },
  modalTitle: {
    fontSize: 16, fontWeight: "900", color: R.text,
    fontFamily: R.mono, letterSpacing: 2, marginBottom: 4,
  },
  modalSub: { fontSize: 11, color: R.textMuted, fontFamily: R.mono, marginBottom: 16 },
  modalEmpty: {
    textAlign: "center", fontSize: 13, color: R.textMuted,
    fontFamily: R.mono, paddingVertical: 20, lineHeight: 22,
  },
  savedTeamRow: {
    flexDirection: "row", alignItems: "center",
    marginBottom: 8, gap: 8,
  },
  savedTeamBtn: {
    flex: 1, backgroundColor: R.bg, borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: R.border,
  },
  savedTeamName: { fontSize: 14, fontWeight: "800", color: R.text, fontFamily: R.mono, marginBottom: 2 },
  savedTeamPlayers: { fontSize: 11, color: R.textMuted, fontFamily: R.mono },
  savedTeamDel: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: R.redDim, justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(220,38,38,0.25)",
  },
  savedTeamDelText: { fontSize: 12, color: R.red, fontWeight: "900" },
  modalCancel: { paddingVertical: 12, alignItems: "center", marginTop: 4 },
  modalCancelText: { fontSize: 13, color: R.textMuted, fontWeight: "600" },
});

export default CreateMatchScreen;
