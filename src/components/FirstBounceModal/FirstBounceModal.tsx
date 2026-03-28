import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const R = {
  bg: '#FFFFFF',
  bgCard: '#F5F5F5',
  text: '#111111',
  textMuted: '#666666',
  purple: '#7C3AED',
  border: '#E0E0E0',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

interface FirstBounceModalProps {
  visible: boolean;
  onSelect: (runs: number) => void;
  onClose: () => void;
}

const FirstBounceModal: React.FC<FirstBounceModalProps> = ({ visible, onSelect, onClose }) => {
  const scores = [0, 1, 2, 3, 4, 6];
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>1B</Text>
          </View>

          <Text style={styles.title}>1ST BOUNCE</Text>
          <Text style={styles.subtitle}>Runs scored?</Text>

          <View style={styles.grid}>
            {scores.map((score) => (
              <TouchableOpacity
                key={score}
                style={[styles.scoreBtn, score === 4 && styles.scoreBtnBlue, score === 6 && styles.scoreBtnAccent]}
                onPress={() => onSelect(score)}
                activeOpacity={0.75}
              >
                <Text style={[
                  styles.scoreNum,
                  score === 6 && styles.scoreNumAccent,
                  score === 4 && styles.scoreNumBlue,
                ]}>
                  {score}
                </Text>
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
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: R.bg,
    borderRadius: 20,
    padding: 28,
    width: width * 0.85,
    maxWidth: 320,
    borderWidth: 1,
    borderColor: R.border,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.45)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
    marginBottom: 18,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: R.purple,
    letterSpacing: 3,
    fontFamily: R.mono,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: R.textMuted,
    marginBottom: 28,
    fontFamily: R.mono,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  scoreBtn: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: R.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: R.border,
  },
  scoreBtnAccent: {
    backgroundColor: 'rgba(22,163,74,0.1)',
    borderColor: 'rgba(22,163,74,0.45)',
  },
  scoreBtnBlue: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderColor: 'rgba(37,99,235,0.45)',
  },
  scoreNum: {
    fontSize: 28,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
  },
  scoreNumAccent: {
    color: '#16A34A',
  },
  scoreNumBlue: {
    color: '#2563EB',
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: R.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: R.textMuted,
    fontWeight: '700',
    fontFamily: R.mono,
  },
});

export default FirstBounceModal;
