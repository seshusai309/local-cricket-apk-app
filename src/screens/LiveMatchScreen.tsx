import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useMatchStore } from '../store/matchStore';
import { ScoringEngine, ScoringAction } from '../utils/scoringEngine';
import ScoreHeader from '../components/ScoreHeader/ScoreHeader';
import OversList from '../components/OversList/OversList';
import ScoreButtons from '../components/ScoreButtons/ScoreButtons';

interface LiveMatchScreenProps {
  navigation: any;
}

const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({ navigation }) => {
  const { currentMatch, updateMatch, completeMatch, saveMatch } = useMatchStore();

  // Save match when leaving the screen
  useEffect(() => {
    return () => {
      // Save current match state when navigating away
      const match = useMatchStore.getState().currentMatch;
      if (match) {
        saveMatch(match);
      }
    };
  }, [saveMatch]);

  useEffect(() => {
    if (!currentMatch) {
      navigation.navigate('Home');
    }
  }, [currentMatch, navigation]);

  // Set up header right button for End Match
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.endMatchButton}
          onPress={() => {
            Alert.alert(
              'End Match',
              'Are you sure you want to end this match?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'End Match', style: 'destructive', onPress: () => handleEndMatch() }
              ]
            );
          }}
        >
          <Text style={styles.endMatchText}>End</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Override back button to go to Home instead of CreateMatch
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Prevent default back navigation
      e.preventDefault();
      // Navigate to Home instead
      navigation.navigate('Home');
    });

    return unsubscribe;
  }, [navigation]);

  const handleScore = async (action: ScoringAction) => {
    if (!currentMatch) return;

    try {
      const updatedMatch = ScoringEngine.addBall(currentMatch, action);
      updateMatch(updatedMatch);

      // Check if match should be completed (all wickets fallen or max overs completed)
      if (updatedMatch.wickets >= 10 || (updatedMatch.overs >= updatedMatch.maxOvers && updatedMatch.balls % 6 === 0)) {
        setTimeout(() => {
          Alert.alert(
            'Match Complete',
            'The match has been completed. View summary?',
            [
              { text: 'Continue', style: 'cancel' },
              { text: 'End Match', onPress: () => handleEndMatch() }
            ]
          );
        }, 500);
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleEndMatch = () => {
    completeMatch();
    navigation.navigate('Home');
  };

  if (!currentMatch) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScoreHeader match={currentMatch} />
      
      <View style={styles.oversContainer}>
        <OversList 
          overs={currentMatch.oversList} 
          currentOverNumber={currentMatch.overs + 1}
        />
      </View>

      <ScoreButtons onScore={handleScore} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  oversContainer: {
    flex: 1,
  },
  endMatchButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  endMatchText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LiveMatchScreen;
