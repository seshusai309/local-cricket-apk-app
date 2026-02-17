import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useMatchStore } from '../store/matchStore';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { currentMatch, matches, createNewMatch, deleteMatch, reset } = useMatchStore();

  const handleCreateNewMatch = () => {
    navigation.navigate('CreateMatch');
  };

  const handleContinueMatch = () => {
    if (currentMatch) {
      navigation.navigate('LiveMatch');
    }
  };

  const handleDeleteCurrentMatch = () => {
    if (!currentMatch) return;
    
    Alert.alert(
      'Delete Match',
      `Are you sure you want to delete the current match?\n\n${currentMatch.teamName} - ${currentMatch.totalRuns}/${currentMatch.wickets}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteMatch(currentMatch.id);
            reset();
          }
        }
      ]
    );
  };

  const handleMatchHistory = () => {
    navigation.navigate('MatchHistory');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Seshu Cricket</Text>
        <Text style={styles.subtitle}>Local Scoring App</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[styles.optionButton, styles.createButton]}
          onPress={handleCreateNewMatch}
        >
          <Text style={styles.buttonText}>Create New Match</Text>
        </TouchableOpacity>

        <View style={styles.continueMatchContainer}>
          <TouchableOpacity 
            style={[
              styles.optionButton, 
              styles.continueButton,
              !currentMatch && styles.disabledButton
            ]}
            onPress={handleContinueMatch}
            disabled={!currentMatch}
          >
            <Text style={[
              styles.buttonText,
              !currentMatch && styles.disabledButtonText
            ]}>
              Continue Match
            </Text>
            {currentMatch && (
              <Text style={styles.matchInfo}>
                {currentMatch.teamName} - {currentMatch.totalRuns}/{currentMatch.wickets}
              </Text>
            )}
          </TouchableOpacity>
          
          {currentMatch && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteCurrentMatch}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.optionButton, styles.historyButton]}
          onPress={handleMatchHistory}
        >
          <Text style={styles.buttonText}>Match History</Text>
          {matches.length > 0 && (
            <Text style={styles.matchCount}>
              {matches.filter(m => m.isCompleted).length} completed matches
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Fully Offline • No Internet Required</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  continueButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    flex: 1,
  },
  continueMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: -2,
  },
  historyButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  disabledButtonText: {
    color: '#94a3b8',
  },
  matchInfo: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  matchCount: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default HomeScreen;
