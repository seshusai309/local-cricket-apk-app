import React, { useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Animated, 
  Easing,
  Dimensions,
  Platform
} from 'react-native';
import { useMatchStore } from '../store/matchStore';

interface CreateMatchScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

const CreateMatchScreen: React.FC<CreateMatchScreenProps> = ({ navigation }) => {
  const [teamName, setTeamName] = useState('Local Team');
  const [maxOvers, setMaxOvers] = useState('20');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOvers, setSelectedOvers] = useState(20);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customOversValue, setCustomOversValue] = useState(20);
  const { createNewMatch } = useMatchStore();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Generate custom overs data (1-100)
  const customOversData = Array.from({ length: 100 }, (_, i) => (i + 1).toString());

  const animatePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim]);

  const handleOversSelect = useCallback((overs: number) => {
    setSelectedOvers(overs);
    setMaxOvers(overs.toString());
    setIsCustomMode(false);
    setCustomOversValue(overs);
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => glowAnim.setValue(0));
  }, [glowAnim]);

  const handleCustomSelect = useCallback(() => {
    setIsCustomMode(true);
    setSelectedOvers(0);
    // Set to current maxOvers or default to 20
    const currentVal = parseInt(maxOvers, 10) || 20;
    setCustomOversValue(currentVal);
  }, [maxOvers]);

  const handleWheelChange = useCallback((value: string | number, index: number) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    setCustomOversValue(numValue);
    setMaxOvers(numValue.toString());
  }, []);

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
              
              {/* Preset Chips */}
              <View style={styles.oversGrid}>
                {oversOptions.map((overs) => (
                  <TouchableOpacity
                    key={overs}
                    style={[
                      styles.oversChip,
                      selectedOvers === overs && !isCustomMode && styles.oversChipActive,
                    ]}
                    onPress={() => handleOversSelect(overs)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.oversChipText,
                      selectedOvers === overs && !isCustomMode && styles.oversChipTextActive
                    ]}>
                      {overs}
                    </Text>
                    <Text style={[
                      styles.oversChipSubtext,
                      selectedOvers === overs && !isCustomMode && styles.oversChipSubtextActive
                    ]}>
                      overs
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Compact Custom Section with Wheel Picker */}
              <View style={styles.customSection}>
                <TouchableOpacity 
                  style={[
                    styles.customToggle,
                    isCustomMode && styles.customToggleActive
                  ]}
                  onPress={handleCustomSelect}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.customToggleText,
                    isCustomMode && styles.customToggleTextActive
                  ]}>
                    Custom
                  </Text>
                </TouchableOpacity>

                {isCustomMode && (
  <View style={styles.stepperContainer}>
    <TouchableOpacity 
      style={styles.stepperButton}
      onPress={() => {
        const currentValue = parseInt(maxOvers, 10) || 1;
        setMaxOvers(Math.max(1, currentValue - 1).toString());
      }}
    >
      <Text style={styles.stepperText}>−</Text>
    </TouchableOpacity>
    
    <View style={styles.stepperValue}>
      <Text style={styles.stepperValueText}>{maxOvers}</Text>
    </View>
    
    <TouchableOpacity 
      style={styles.stepperButton}
      onPress={() => {
        const currentValue = parseInt(maxOvers, 10) || 1;
        setMaxOvers(Math.min(100, currentValue + 1).toString());
      }}
    >
      <Text style={styles.stepperText}>+</Text>
    </TouchableOpacity>
  </View>
)}
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
  stepperContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: 12,
  flex: 1,
},
stepperButton: {
  width: 44,
  height: 44,
  borderRadius: 12,
  backgroundColor: 'rgba(16, 185, 129, 0.2)',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#10b981',
},
stepperText: {
  fontSize: 24,
  fontWeight: '700',
  color: '#10b981',
},
stepperValue: {
  minWidth: 60,
  height: 50,
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 12,
  backgroundColor: 'rgba(0,0,0,0.3)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
},
stepperValueText: {
  fontSize: 24,
  fontWeight: '700',
  color: '#ffffff',
},
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
    marginBottom: 16,
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
  
  // Improved Custom Section Styles
  customSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 60,
  },
  customToggle: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
    alignItems: 'center',
  },
  customToggleActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  customToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  customToggleTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  wheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    flex: 1,
    height: 100,
  },
  wheelWrapper: {
    height: 100,
    width: 70,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  wheelItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  wheelActiveItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
  },
  wheelItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  wheelActiveItemText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Gradient fades for smooth wheel appearance
  wheelTopFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.9)',
  },
  wheelBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.9)',
  },
  wheelLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 12,
    fontWeight: '500',
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