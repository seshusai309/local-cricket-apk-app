import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

interface WideModalProps {
  visible: boolean;
  onSelect: (runs: number) => void;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const R = {
  bg: '#1B3A2F',
  bgCard: '#122B22',
  text: '#F5F5DC',
  textMuted: '#8FAF99',
  accent: '#D4A017',
  orange: '#E65100',
  border: '#2E5040',
};

const WideModal: React.FC<WideModalProps> = ({ visible, onSelect, onClose }) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.headerBar}>
            <Text style={styles.headerLabel}>WIDE BALL</Text>
          </View>

          <Text style={styles.title}>WD — Extra Runs?</Text>
          <Text style={styles.subtitle}>Batsman ran off the wide?</Text>

          {/* Two large options */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[styles.optionBtn, styles.optionZero]}
              onPress={() => onSelect(0)}
              activeOpacity={0.75}
            >
              <Text style={styles.optionNum}>0</Text>
              <Text style={styles.optionLabel}>No run</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, styles.optionOne]}
              onPress={() => onSelect(1)}
              activeOpacity={0.75}
            >
              <Text style={styles.optionNum}>1</Text>
              <Text style={styles.optionLabel}>+1 run</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>Wide penalty (+1) always added</Text>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
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
    width: width * 0.82,
    maxWidth: 320,
    borderWidth: 2,
    borderColor: R.orange,
    shadowColor: R.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
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
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: R.accent,
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 14,
    color: R.textMuted,
    textAlign: 'center',
    marginBottom: 28,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 18,
  },
  optionBtn: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  optionZero: {
    backgroundColor: 'rgba(226,81,0,0.15)',
    borderColor: R.orange,
  },
  optionOne: {
    backgroundColor: 'rgba(212,160,23,0.2)',
    borderColor: R.accent,
  },
  optionNum: {
    fontSize: 42,
    fontWeight: '900',
    color: R.text,
    fontFamily: 'monospace',
    lineHeight: 50,
  },
  optionLabel: {
    fontSize: 12,
    color: R.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  note: {
    fontSize: 11,
    color: R.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: R.border,
    alignItems: 'center',
    width: '100%',
  },
  cancelText: {
    fontSize: 15,
    color: R.textMuted,
    fontWeight: '700',
  },
});

export default WideModal;
