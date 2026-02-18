// HomeScreen.tsx
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Animated,
  Dimensions 
} from 'react-native';
import { useMatchStore } from '../store/matchStore';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { currentMatch, matches, deleteMatch, reset } = useMatchStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

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

  const completedCount = matches.filter(m => m.isCompleted).length;

  return (
    <View style={styles.container}>
      <View style={styles.backgroundPattern}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
          </View>
          <Text style={styles.title}>Cricket</Text>
          <Text style={styles.subtitle}>Professional Local Scoring</Text>
        </View>

        <Animated.View 
          style={[
            styles.menuContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleCreateNewMatch}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <View style={[styles.icon, { backgroundColor: '#10b981' }]}>
                <Text style={styles.iconText}>+</Text>
              </View>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>New Match</Text>
              <Text style={styles.menuSubtitle}>Start scoring a fresh game</Text>
            </View>
            <View style={styles.chevron}>
              <View style={styles.chevronInner} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={[styles.menuItem, !currentMatch && styles.menuItemDisabled]}
            onPress={handleContinueMatch}
            disabled={!currentMatch}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBg, { backgroundColor: currentMatch ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 116, 139, 0.1)' }]}>
              <View style={[styles.icon, { backgroundColor: currentMatch ? '#f59e0b' : '#64748b' }]}>
                <Text style={styles.iconText}>▶</Text>
              </View>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, !currentMatch && styles.menuTitleDisabled]}>
                Continue Match
              </Text>
              {currentMatch ? (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>
                    {currentMatch.totalRuns}/{currentMatch.wickets} • {currentMatch.overs}.{currentMatch.balls % 6} ov
                  </Text>
                </View>
              ) : (
                <Text style={styles.menuSubtitle}>No active match</Text>
              )}
            </View>
            {currentMatch && (
              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={handleDeleteCurrentMatch}
              >
                <Text style={styles.deleteBtnText}>×</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleMatchHistory}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBg, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <View style={[styles.icon, { backgroundColor: '#6366f1' }]}>
                <Text style={styles.iconText}>📋</Text>
              </View>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>History</Text>
              <Text style={styles.menuSubtitle}>
                {completedCount} {completedCount === 1 ? 'match' : 'matches'} completed
              </Text>
            </View>
            <View style={styles.chevron}>
              <View style={styles.chevronInner} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.offlineBadge}>
            <View style={styles.offlineDot} />
            <Text style={styles.footerText}>Fully Offline</Text>
          </View>
          <Text style={styles.credits}>Built by Sai Sesha Reddy</Text>
          <Text style={styles.version}>v2.0</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    top: -100,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
    bottom: 100,
    left: -50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 50,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  logoCore: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  menuContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '700',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  menuTitleDisabled: {
    color: '#64748b',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  liveText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  chevron: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronInner: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#475569',
    transform: [{ rotate: '45deg' }],
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteBtnText: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: '700',
    marginTop: -2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 20,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 40,
    alignItems: 'center',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  credits: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 8,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  version: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
});

export default HomeScreen;