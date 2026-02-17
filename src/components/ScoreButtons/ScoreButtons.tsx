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
        {[1, 2, 3, 4, 5, 6].map((run) => (
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
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  runButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  fourButton: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  sixButton: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  specialButton: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  wicketButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  dotButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#6b7280',
    borderWidth: 1,
  },
  noBallButton: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  wideButton: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  specialButtonText: {
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  undoRow: {
    alignItems: 'center',
  },
  undoButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  undoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});

export default ScoreButtons;
