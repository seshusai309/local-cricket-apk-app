import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const R = {
  bg: '#1B3A2F',
  bgCard: '#122B22',
  text: '#F5F5DC',
  textMuted: '#8FAF99',
  accent: '#D4A017',
  teal: '#00897B',
  orange: '#E65100',
  border: '#2E5040',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

interface NoBallModalProps {
  visible: boolean;
  onSelect: (runs: number) => void;
  onClose: () => void;
}

const NoBallModal: React.FC<NoBallModalProps> = ({ visible, onSelect, onClose }) => {
  const scores = [0, 1, 2, 3, 4, 6];
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.headerBar}>
            <Text style={styles.headerLabel}>NO BALL</Text>
          </View>
          <Text style={styles.title}>NB — Runs Off Bat?</Text>
          <Text style={styles.subtitle}>+1 no-ball penalty always added</Text>

          <View style={styles.grid}>
            {scores.map((score) => (
              <TouchableOpacity
                key={score}
                style={styles.scoreBtn}
                onPress={() => onSelect(score)}
                activeOpacity={0.75}
              >
                <Text style={styles.scoreNum}>{score}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: R.bg,
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 320,
    borderWidth: 2,
    borderColor: R.orange,
    shadowColor: R.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    alignItems: 'center',
  },
  headerBar: {
    backgroundColor: R.orange,
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
    fontFamily: R.mono,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: R.text,
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: R.mono,
  },
  subtitle: {
    fontSize: 13,
    color: R.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  scoreBtn: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: 'rgba(0,137,123,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: R.teal,
    shadowColor: R.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreNum: {
    fontSize: 26,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: R.border,
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: R.textMuted,
    fontWeight: '700',
    fontFamily: R.mono,
  },
});

export default NoBallModal;
