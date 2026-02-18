import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScoringAction } from '../../utils/scoringEngine';

interface ScoreButtonsProps {
  onScore: (action: ScoringAction) => void;
  disabled?: boolean;
}

const ScoreButtons: React.FC<ScoreButtonsProps> = ({ onScore, disabled = false }) => {
  const handleRun = (runs: number) => {
    onScore({ type: 'run', value: runs });
  };

  const handleWicket = () => {
    onScore({ type: 'wicket' });
  };

  const handleWide = () => {
    onScore({ type: 'wide' });
  };

  const handleNoBall = () => {
    onScore({ type: 'noball' });
  };

  const handleDot = () => {
    onScore({ type: 'dot' });
  };

  const handleUndo = () => {
    onScore({ type: 'undo' });
  };

  return (
    <View style={styles.container}>
      {/* Run buttons row */}
      <View style={styles.buttonRow}>
        {[1, 2, 3, 4, 6].map((run) => (
          <TouchableOpacity
            key={run}
            style={[
              styles.runButton,
              run === 4 && styles.fourButton,
              run === 6 && styles.sixButton,
              disabled && styles.disabledButton
            ]}
            onPress={() => handleRun(run)}
            disabled={disabled}
          >
            <Text style={[
              styles.buttonText,
              (run === 4 || run === 6) && styles.specialButtonText,
              disabled && styles.disabledButtonText
            ]}>
              {run}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Special buttons row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.specialButton, styles.wicketButton, disabled && styles.disabledButton]}
          onPress={handleWicket}
          disabled={disabled}
        >
          <Text style={[styles.buttonText, disabled && styles.disabledButtonText]}>W</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.specialButton, styles.dotButton, disabled && styles.disabledButton]}
          onPress={handleDot}
          disabled={disabled}
        >
          <Text style={[styles.buttonText, disabled && styles.disabledButtonText]}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.specialButton, styles.noBallButton, disabled && styles.disabledButton]}
          onPress={handleNoBall}
          disabled={disabled}
        >
          <Text style={[styles.buttonText, disabled && styles.disabledButtonText]}>NB</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.specialButton, styles.wideButton, disabled && styles.disabledButton]}
          onPress={handleWide}
          disabled={disabled}
        >
          <Text style={[styles.buttonText, disabled && styles.disabledButtonText]}>WD</Text>
        </TouchableOpacity>
      </View>

      {/* Undo button */}
      <View style={styles.undoRow}>
        <TouchableOpacity
          style={[styles.undoButton, disabled && styles.disabledButton]}
          onPress={handleUndo}
          disabled={disabled}
        >
          <Text style={[styles.undoButtonText, disabled && styles.disabledButtonText]}>
            ↶ Undo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  runButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  fourButton: {
    backgroundColor: '#1e40af',
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sixButton: {
    backgroundColor: '#059669',
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  specialButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  wicketButton: {
    backgroundColor: '#dc2626',
    borderColor: '#ef4444',
    borderWidth: 1,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dotButton: {
    backgroundColor: '#475569',
    borderColor: '#64748b',
    borderWidth: 1,
  },
  noBallButton: {
    backgroundColor: '#d97706',
    borderColor: '#f59e0b',
    borderWidth: 1,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  wideButton: {
    backgroundColor: '#d97706',
    borderColor: '#f59e0b',
    borderWidth: 1,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  specialButtonText: {
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  disabledButton: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: '#64748b',
  },
  undoRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  undoButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  undoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
});

export default ScoreButtons;
