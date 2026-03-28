import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const R = {
  bg: '#FFFFFF',
  bgCard: '#F5F5F5',
  text: '#111111',
  textMuted: '#666666',
  accent: '#16A34A',
  orange: '#EA580C',
  border: '#E0E0E0',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

interface WideModalProps {
  visible: boolean;
  onSelect: (runs: number) => void;
  onClose: () => void;
}

const WideModal: React.FC<WideModalProps> = ({ visible, onSelect, onClose }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>WD</Text>
          </View>

          <Text style={styles.title}>WIDE BALL</Text>
          <Text style={styles.subtitle}>How many runs scored?</Text>

          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.optionBtn} onPress={() => onSelect(0)} activeOpacity={0.75}>
              <Text style={styles.optionNum}>0</Text>
              <Text style={styles.optionLabel}>No run</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionBtn, styles.optionBtnAccent]} onPress={() => onSelect(1)} activeOpacity={0.75}>
              <Text style={[styles.optionNum, styles.optionNumAccent]}>1</Text>
              <Text style={[styles.optionLabel, { color: R.orange }]}>1 run</Text>
            </TouchableOpacity>
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
    width: width * 0.82,
    maxWidth: 320,
    borderWidth: 1,
    borderColor: R.border,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(234,88,12,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234,88,12,0.45)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
    marginBottom: 18,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: R.orange,
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
  optionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  optionBtn: {
    width: 110,
    height: 110,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: R.bgCard,
    borderWidth: 1,
    borderColor: R.border,
  },
  optionBtnAccent: {
    backgroundColor: 'rgba(234,88,12,0.1)',
    borderColor: 'rgba(234,88,12,0.45)',
  },
  optionNum: {
    fontSize: 48,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
    lineHeight: 54,
  },
  optionNumAccent: {
    color: R.orange,
  },
  optionLabel: {
    fontSize: 11,
    color: R.textMuted,
    fontWeight: '700',
    fontFamily: R.mono,
    marginTop: 2,
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

export default WideModal;
