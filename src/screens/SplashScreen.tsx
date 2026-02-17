import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface SplashScreenProps {
  onFinish: () => void;
  navigation?: any;
  route?: any;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [animationLoaded, setAnimationLoaded] = useState(false);

  useEffect(() => {
    // Simulate splash screen duration
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../../assets/animations/cricket-splash.json')}
          autoPlay={true}
          loop={false}
          style={styles.animation}
          onAnimationFinish={() => {
            // Animation finished, but we'll wait for the timer
          }}
        />
      </View>
      <Text style={styles.appName}>Seshu Local Cricket App</Text>
      <Text style={styles.tagline}>Offline Cricket Scoring</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#d1fae5',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SplashScreen;
