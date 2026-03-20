import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { ScoringAction } from "../../utils/scoringEngine";
import NoBallModal from "../NoBallModal/NoBallModal";
import FirstBounceModal from "../FirstBounceModal/FirstBounceModal";
import WideModal from "../WideModal/WideModal";

// ── Retro Palette ─────────────────────────────────────────────────────────────
const R = {
  bg: '#122B22',
  text: '#F5F5DC',
  textMuted: '#8FAF99',
  accent: '#D4A017',
  teal: '#00897B',
  border: '#2E5040',
  red: '#C62828',
  four: '#1565C0',
  six: '#2E7D32',
  purple: '#6A1B9A',
  orange: '#E65100',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

interface ScoreButtonsProps {
  onScore: (action: ScoringAction) => void;
  disabled?: boolean;
}

const ScoreButtons: React.FC<ScoreButtonsProps> = ({ onScore, disabled = false }) => {
  const [showNoBallModal, setShowNoBallModal] = useState(false);
  const [showFirstBounceModal, setShowFirstBounceModal] = useState(false);
  const [showWideModal, setShowWideModal] = useState(false);

  const handleRun = (runs: number) => onScore({ type: "run", value: runs });
  const handleWicket = () => onScore({ type: "wicket" });
  const handleDot = () => onScore({ type: "dot" });
  const handleUndo = () => onScore({ type: "undo" });

  const handleWide = () => setShowWideModal(true);
  const handleWideSelect = (extraRuns: number) => {
    setShowWideModal(false);
    onScore({ type: "wide", value: extraRuns });
  };

  const handleNoBall = () => setShowNoBallModal(true);
  const handleNoBallSelect = (runs: number) => {
    setShowNoBallModal(false);
    onScore({ type: "noball", value: runs });
  };

  const handle1stBounce = () => setShowFirstBounceModal(true);
  const handle1stBounceSelect = (runs: number) => {
    setShowFirstBounceModal(false);
    onScore({ type: "1stbounce", value: runs });
  };

  return (
    <View style={styles.container}>

      {/* ── Run buttons row ── */}
      <View style={styles.row}>
        {[1, 2, 3].map((run) => (
          <TouchableOpacity
            key={run}
            style={[styles.runBtn, disabled && styles.btnDisabled]}
            onPress={() => handleRun(run)}
            disabled={disabled}
            activeOpacity={0.75}
          >
            <Text style={[styles.runBtnText, disabled && styles.textDisabled]}>{run}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.runBtn, styles.fourBtn, disabled && styles.btnDisabled]}
          onPress={() => handleRun(4)}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={[styles.specialBtnText, disabled && styles.textDisabled]}>4</Text>
          <Text style={styles.specialBtnSub}>FOUR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.runBtn, styles.sixBtn, disabled && styles.btnDisabled]}
          onPress={() => handleRun(6)}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={[styles.specialBtnText, disabled && styles.textDisabled]}>6</Text>
          <Text style={styles.specialBtnSub}>SIX</Text>
        </TouchableOpacity>
      </View>

      {/* ── Special buttons row ── */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.specBtn, styles.wicketBtn, disabled && styles.btnDisabled]}
          onPress={handleWicket}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={[styles.specBtnText, disabled && styles.textDisabled]}>W</Text>
          <Text style={styles.specBtnSub}>WKT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.specBtn, styles.dotBtn, disabled && styles.btnDisabled]}
          onPress={handleDot}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={[styles.specBtnText, disabled && styles.textDisabled]}>●</Text>
          <Text style={styles.specBtnSub}>DOT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.specBtn, styles.noBallBtn, disabled && styles.btnDisabled]}
          onPress={handleNoBall}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={[styles.specBtnText, disabled && styles.textDisabled]}>NB</Text>
          <Text style={styles.specBtnSub}>NO BALL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.specBtn, styles.firstBounceBtn, disabled && styles.btnDisabled]}
          onPress={handle1stBounce}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={[styles.specBtnText, disabled && styles.textDisabled]}>1B</Text>
          <Text style={styles.specBtnSub}>BOUNCE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.specBtn, styles.wideBtn, disabled && styles.btnDisabled]}
          onPress={handleWide}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={[styles.specBtnText, disabled && styles.textDisabled]}>WD</Text>
          <Text style={styles.specBtnSub}>WIDE</Text>
        </TouchableOpacity>
      </View>

      {/* ── Undo row ── */}
      <View style={styles.undoRow}>
        <TouchableOpacity
          style={[styles.undoBtn, disabled && styles.btnDisabled]}
          onPress={handleUndo}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={[styles.undoBtnText, disabled && styles.textDisabled]}>↶  UNDO</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <WideModal
        visible={showWideModal}
        onSelect={handleWideSelect}
        onClose={() => setShowWideModal(false)}
      />
      <NoBallModal
        visible={showNoBallModal}
        onSelect={handleNoBallSelect}
        onClose={() => setShowNoBallModal(false)}
      />
      <FirstBounceModal
        visible={showFirstBounceModal}
        onSelect={handle1stBounceSelect}
        onClose={() => setShowFirstBounceModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: R.bg,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderTopWidth: 2,
    borderTopColor: R.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 6,
  },

  // Run buttons (1,2,3,4,6)
  runBtn: {
    flex: 1,
    height: 58,
    backgroundColor: '#1E3D2F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: R.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  fourBtn: {
    backgroundColor: '#0D2447',
    borderColor: R.four,
    shadowColor: R.four,
    shadowOpacity: 0.4,
    elevation: 5,
  },
  sixBtn: {
    backgroundColor: '#1A3D1A',
    borderColor: R.six,
    shadowColor: R.six,
    shadowOpacity: 0.4,
    elevation: 5,
  },
  runBtnText: {
    fontSize: 22,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
  },
  specialBtnText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: R.mono,
    lineHeight: 26,
  },
  specialBtnSub: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginTop: 1,
  },

  // Special buttons (W, 0, NB, 1B, WD)
  specBtn: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  wicketBtn: {
    backgroundColor: '#3B0D0D',
    borderColor: R.red,
    shadowColor: R.red,
  },
  dotBtn: {
    backgroundColor: '#1C2B35',
    borderColor: '#37474F',
    shadowColor: '#000',
  },
  noBallBtn: {
    backgroundColor: '#3D1A00',
    borderColor: R.orange,
    shadowColor: R.orange,
  },
  firstBounceBtn: {
    backgroundColor: '#2D0A4E',
    borderColor: R.purple,
    shadowColor: R.purple,
  },
  wideBtn: {
    backgroundColor: '#3D1A00',
    borderColor: R.orange,
    shadowColor: R.orange,
  },
  specBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
    lineHeight: 20,
  },
  specBtnSub: {
    fontSize: 7,
    fontWeight: '800',
    color: R.textMuted,
    letterSpacing: 0.8,
    marginTop: 1,
  },

  // Disabled
  btnDisabled: { opacity: 0.35, elevation: 0, shadowOpacity: 0 },
  textDisabled: { color: R.textMuted },

  // Undo
  undoRow: { alignItems: 'center', marginTop: 2 },
  undoBtn: {
    backgroundColor: R.bg,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: R.border,
  },
  undoBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: R.textMuted,
    letterSpacing: 1,
    fontFamily: R.mono,
  },
});

export default ScoreButtons;
