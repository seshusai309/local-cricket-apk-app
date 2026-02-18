import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { databaseService } from './src/services/database';
import { useMatchStore } from './src/store/matchStore';
import * as SplashScreen from 'expo-splash-screen';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import CreateMatchScreen from './src/screens/CreateMatchScreen';
import LiveMatchScreen from './src/screens/LiveMatchScreen';
import MatchHistoryScreen from './src/screens/MatchHistoryScreen';
import MatchDetailScreen from './src/screens/MatchDetailScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  const [isInitialized, setInitialized] = useState(false);
  const { loadMatches } = useMatchStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await databaseService.init();
        
        // Load existing matches
        await loadMatches();
        
        setInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        // Hide splash screen when ready
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, [loadMatches]);

  if (!isInitialized) {
    return null; // Show loading screen while initializing
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        id="MainStack"
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#059669',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name="CreateMatch"
          component={CreateMatchScreen}
          options={{ 
            title: 'Create Match',
          }}
        />
        <Stack.Screen
          name="LiveMatch"
          component={LiveMatchScreen}
          options={{ 
            title: 'Live Match',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="MatchHistory"
          component={MatchHistoryScreen}
          options={{ 
            title: 'Match History',
          }}
        />
        <Stack.Screen
          name="MatchDetail"
          component={MatchDetailScreen}
          options={{ 
            title: 'Match Details',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
