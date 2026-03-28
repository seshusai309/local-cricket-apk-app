import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { databaseService } from './src/services/database';
import { useMatchStore } from './src/store/matchStore';
import * as SplashScreen from 'expo-splash-screen';

import HomeScreen from './src/screens/HomeScreen';
import CreateMatchScreen from './src/screens/CreateMatchScreen';
import LiveMatchScreen from './src/screens/LiveMatchScreen';
import MatchHistoryScreen from './src/screens/MatchHistoryScreen';
import MatchDetailScreen from './src/screens/MatchDetailScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

const HEADER = {
  bg: '#FFFFFF',
  text: '#111111',
  tint: '#16A34A',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

const App: React.FC = () => {
  const [isInitialized, setInitialized] = useState(false);
  const { loadMatches } = useMatchStore();

  useEffect(() => {
    const init = async () => {
      try {
        await databaseService.init();
        await loadMatches();
        setInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        await SplashScreen.hideAsync();
      }
    };
    init();
  }, [loadMatches]);

  if (!isInitialized) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        id="MainStack"
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: HEADER.bg },
          headerTintColor: HEADER.tint,
          headerTitleStyle: {
            fontWeight: '900',
            fontSize: 14,
            fontFamily: HEADER.mono,
            letterSpacing: 2,
            color: HEADER.text,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#F5F5F5' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateMatch"
          component={CreateMatchScreen}
          options={{ title: 'NEW MATCH' }}
        />
        <Stack.Screen
          name="LiveMatch"
          component={LiveMatchScreen}
          options={{ title: 'LIVE', gestureEnabled: false }}
        />
        <Stack.Screen
          name="MatchHistory"
          component={MatchHistoryScreen}
          options={{ title: 'HISTORY' }}
        />
        <Stack.Screen
          name="MatchDetail"
          component={MatchDetailScreen}
          options={{ title: 'DETAILS' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
