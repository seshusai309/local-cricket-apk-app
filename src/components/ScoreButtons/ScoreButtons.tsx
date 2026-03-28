import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { ScoringAction } from "../../utils/scoringEngine";
import NoBallModal from "../NoBallModal/NoBallModal";
import FirstBounceModal from "../FirstBounceModal/FirstBounceModal";
import WideModal from "../WideModal/WideModal";

const R = {
  bg: '#F5F5F5',
  bgCard: '#FFFFFF',
  text: '#111111',
  textMuted: '#666666',
  accent: '#16A34A',
  red: '#DC2626',
  blue: '#2563EB',
  orange: '#EA580C',
  purple: '#7C3AED',
  border: '#E0E0E0',
  borderBright: '#CCCCCC',
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

      {/* ── Run buttons + DOT ── */}
      <View style={styles.row}>
        {[1, 2, 3].map((run) => (
          <TouchableOpacity
            key={run}
            style={[styles.runBtn, disabled && styles.btnDisabled]}
            onPress={() => handleRun(run)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={[styles.runBtnText, disabled && styles.textDisabled]}>{run}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.runBtn, styles.dotBtn, disabled && styles.btnDisabled]}
          onPress={handleDot}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.specialNum, { color: R.textMuted }, disabled && styles.textDisabled]}>●</Text>
          <Text style={[styles.specialSub, { color: R.textMuted }]}>DOT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.runBtn, styles.fourBtn, disabled && styles.btnDisabled]}
          onPress={() => handleRun(4)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.specialNum, { color: R.blue }, disabled && styles.textDisabled]}>4</Text>
          <Text style={[styles.specialSub, { color: R.blue }]}>FOUR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.runBtn, styles.sixBtn, disabled && styles.btnDisabled]}
          onPress={() => handleRun(6)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.specialNum, { color: R.accent }, disabled && styles.textDisabled]}>6</Text>
          <Text style={[styles.specialSub, { color: R.accent }]}>SIX</Text>
        </TouchableOpacity>
      </View>

      {/* ── Special buttons ── */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.specBtn, styles.wicketBtn, disabled && styles.btnDisabled]}
          onPress={handleWicket}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.specNum, { color: '#FFFFFF' }, disabled && styles.textDisabled]}>W</Text>
          <Text style={[styles.specSub, { color: 'rgba(255,255,255,0.5)' }]}>WKT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.specBtn, styles.noBallBtn, disabled && styles.btnDisabled]}
          onPress={handleNoBall}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.specNum, { color: R.orange }, disabled && styles.textDisabled]}>NB</Text>
          <Text style={[styles.specSub, { color: R.orange }]}>NO BALL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.specBtn, styles.firstBounceBtn, disabled && styles.btnDisabled]}
          onPress={handle1stBounce}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.specNum, { color: R.purple }, disabled && styles.textDisabled]}>1B</Text>
          <Text style={[styles.specSub, { color: R.purple }]}>BOUNCE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.specBtn, styles.wideBtn, disabled && styles.btnDisabled]}
          onPress={handleWide}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.specNum, { color: R.orange }, disabled && styles.textDisabled]}>WD</Text>
          <Text style={[styles.specSub, { color: R.orange }]}>WIDE</Text>
        </TouchableOpacity>
      </View>

      {/* ── Undo ── */}
      <View style={styles.undoRow}>
        <TouchableOpacity
          style={[styles.undoBtn, disabled && styles.btnDisabled]}
          onPress={handleUndo}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.undoBtnText, disabled && styles.textDisabled]}>↶  UNDO</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <WideModal visible={showWideModal} onSelect={handleWideSelect} onClose={() => setShowWideModal(false)} />
      <NoBallModal visible={showNoBallModal} onSelect={handleNoBallSelect} onClose={() => setShowNoBallModal(false)} />
      <FirstBounceModal visible={showFirstBounceModal} onSelect={handle1stBounceSelect} onClose={() => setShowFirstBounceModal(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: R.bg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: R.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 5,
  },

  // Run buttons
  runBtn: {
    flex: 1,
    height: 56,
    backgroundColor: R.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: R.borderBright,
  },
  fourBtn: {
    borderColor: R.blue,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  sixBtn: {
    borderColor: R.accent,
    backgroundColor: 'rgba(22,163,74,0.08)',
  },
  runBtnText: {
    fontSize: 24,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
  },
  specialNum: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: R.mono,
    lineHeight: 26,
  },
  specialSub: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 1,
  },

  // Special buttons
  specBtn: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 1,
    backgroundColor: R.bgCard,
  },
  wicketBtn: {
    backgroundColor: R.red,
    borderColor: R.red,
  },
  dotBtn: {
    borderColor: R.borderBright,
    backgroundColor: R.bgCard,
  },
  noBallBtn: {
    borderColor: 'rgba(234,88,12,0.55)',
    backgroundColor: 'rgba(234,88,12,0.08)',
  },
  firstBounceBtn: {
    borderColor: 'rgba(124,58,237,0.55)',
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  wideBtn: {
    borderColor: 'rgba(234,88,12,0.55)',
    backgroundColor: 'rgba(234,88,12,0.08)',
  },
  specNum: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: R.mono,
    lineHeight: 18,
  },
  specSub: {
    fontSize: 6,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 1,
  },

  // Disabled
  btnDisabled: { opacity: 0.3 },
  textDisabled: { color: R.textMuted },

  // Undo
  undoRow: { alignItems: 'center', marginTop: 2 },
  undoBtn: {
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: R.border,
    backgroundColor: R.bgCard,
  },
  undoBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: R.textMuted,
    letterSpacing: 1.5,
    fontFamily: R.mono,
  },
});

export default ScoreButtons;
