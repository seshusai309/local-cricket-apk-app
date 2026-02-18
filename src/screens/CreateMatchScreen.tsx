// CreateMatchScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Animated, Easing } from 'react-native';
import { useMatchStore } from '../store/matchStore';

interface CreateMatchScreenProps {
  navigation: any;
}

const CreateMatchScreen: React.FC<CreateMatchScreenProps> = ({ navigation }) => {
  const [teamName, setTeamName] = useState('Local Team');
  const [maxOvers, setMaxOvers] = useState('20');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOvers, setSelectedOvers] = useState(20);
  const [isCustomInputFocused, setIsCustomInputFocused] = useState(false);
  const { createNewMatch } = useMatchStore();
  
  const scaleAnim = new Animated.Value(1);
  const glowAnim = new Animated.Value(0);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleOversSelect = (overs: number) => {
    setSelectedOvers(overs);
    setMaxOvers(overs.toString());
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => glowAnim.setValue(0));
  };

  const handleCustomInputFocus = () => {
    setIsCustomInputFocused(true);
  };

  const handleCustomInputBlur = () => {
    setIsCustomInputFocused(false);
  };

  const handleCreateMatch = async () => {
    animatePress();
    setIsCreating(true);
    try {
      const overs = parseInt(maxOvers, 10) || 20;
      await createNewMatch(teamName || 'Local Team', overs);
      navigation.navigate('LiveMatch');
    } catch (error) {
      console.error('Error creating match:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const oversOptions = [5, 10, 20, 50];

  return (
    <View style={styles.container}>
      <View style={styles.gradientOverlay}>
        <View style={styles.header}>
          
          <Text style={styles.title}>New Match</Text>
          <Text style={styles.subtitle}>Configure your game settings</Text>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>TEAM NAME</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={teamName}
                  onChangeText={setTeamName}
                  placeholder="Enter team name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  selectionColor="#10b981"
                />
                <View style={styles.inputLine} />
              </View>
            </View>

            <View style={styles.oversSection}>
              <Text style={styles.label}>MATCH OVERS</Text>
              <View style={styles.oversGrid}>
                {oversOptions.map((overs) => (
                  <TouchableOpacity
                    key={overs}
                    style={[
                      styles.oversChip,
                      selectedOvers === overs && styles.oversChipActive,
                      isCustomInputFocused && styles.oversChipDisabled
                    ]}
                    onPress={() => handleOversSelect(overs)}
                    disabled={isCustomInputFocused}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.oversChipText,
                      selectedOvers === overs && styles.oversChipTextActive
                    ]}>
                      {overs}
                    </Text>
                    <Text style={[
                      styles.oversChipSubtext,
                      selectedOvers === overs && styles.oversChipSubtextActive
                    ]}>
                      overs
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.customOversContainer}>
                <Text style={styles.customLabel}>Custom:</Text>
                <TextInput
                  style={styles.customInput}
                  value={maxOvers}
                  onChangeText={setMaxOvers}
                  keyboardType="numeric"
                  maxLength={3}
                  selectionColor="#10b981"
                  onFocus={handleCustomInputFocus}
                  onBlur={handleCustomInputBlur}
                />
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[styles.createButton, isCreating && styles.disabledButton]}
                onPress={handleCreateMatch}
                disabled={isCreating}
                activeOpacity={0.9}
              >
                <View style={styles.buttonGradient}>
                  <Text style={styles.createButtonText}>
                    {isCreating ? 'Creating...' : 'Start Match'}
                  </Text>
                  <View style={styles.arrowContainer}>
                    <View style={styles.arrow} />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  cricketIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  ballInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#10b981',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputWrapper: {
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  inputLine: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
  },
  oversSection: {
    marginTop: 8,
  },
  oversGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  oversChip: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  oversChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  oversChipText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#94a3b8',
  },
  oversChipTextActive: {
    color: '#ffffff',
  },
  oversChipDisabled: {
    opacity: 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  oversChipSubtext: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  oversChipSubtextActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  customOversContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  customLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 12,
  },
  customInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 32,
    gap: 16,
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    backgroundColor: '#10b981',
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arrowContainer: {
    marginLeft: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#ffffff',
    transform: [{ rotate: '45deg' }],
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateMatchScreen;