import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { useMatchStore } from '../store/matchStore';

const { width, height } = Dimensions.get('window');

const R = {
  bg: '#1B3A2F',
  bgDark: '#122B22',
  bgCard: '#1E4034',
  text: '#F5F5DC',
  textMuted: '#8FAF99',
  accent: '#D4A017',
  teal: '#00897B',
  border: '#2E5040',
  red: '#C62828',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { currentMatch, matches, deleteMatch, reset } = useMatchStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const batAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(batAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(batAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ),
    ]).start();
  }, []);

  const batRotate = batAnim.interpolate({ inputRange: [0, 1], outputRange: ['-5deg', '5deg'] });

  const handleDeleteCurrentMatch = () => {
    if (!currentMatch) return;
    Alert.alert(
      'Delete Match',
      `Delete "${currentMatch.teamName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => { await deleteMatch(currentMatch.id); reset(); },
        },
      ],
    );
  };

  const completedCount = matches.filter(m => m.isCompleted).length;

  return (
    <View style={styles.container}>

      {/* Background field lines decoration */}
      <View style={styles.fieldCircleOuter} />
      <View style={styles.fieldCircleInner} />
      <View style={styles.fieldLine} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* ── Logo / Brand ── */}
        <View style={styles.brand}>
          <Animated.Text style={[styles.batEmoji, { transform: [{ rotate: batRotate }] }]}>
            🏏
          </Animated.Text>
          <Text style={styles.appName}>SESHCRIC</Text>
          <Text style={styles.tagline}>LOCAL CRICKET SCORER</Text>
          <View style={styles.brandRule} />
        </View>

        {/* ── Active Match Banner (if any) ── */}
        {currentMatch && (
          <View style={styles.activeBanner}>
            <View style={styles.activeBannerLeft}>
              <View style={styles.activePulse}>
                <View style={styles.activeDot} />
              </View>
              <View>
                <Text style={styles.activeBannerLabel}>IN PROGRESS</Text>
                <Text style={styles.activeBannerScore} numberOfLines={1}>
                  {currentMatch.teamName}  ·  {currentMatch.totalRuns}/{currentMatch.wickets}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.activeDel} onPress={handleDeleteCurrentMatch}>
              <Text style={styles.activeDelText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Main action buttons ── */}
        <View style={styles.actions}>

          {/* New Match */}
          <TouchableOpacity
            style={styles.btnNew}
            onPress={() => navigation.navigate('CreateMatch')}
            activeOpacity={0.82}
          >
            <View style={styles.btnNewInner}>
              <Text style={styles.btnNewIcon}>+</Text>
              <View>
                <Text style={styles.btnNewTitle}>NEW MATCH</Text>
                <Text style={styles.btnNewSub}>Start scoring</Text>
              </View>
            </View>
            <Text style={styles.btnChevron}>›</Text>
          </TouchableOpacity>

          {/* Continue Match */}
          <TouchableOpacity
            style={[styles.btnRow, !currentMatch && styles.btnRowDisabled]}
            onPress={() => currentMatch && navigation.navigate('LiveMatch')}
            disabled={!currentMatch}
            activeOpacity={0.82}
          >
            <View style={styles.btnRowLeft}>
              <View style={[styles.btnRowIcon, { backgroundColor: currentMatch ? 'rgba(0,137,123,0.2)' : 'rgba(46,80,64,0.5)', borderColor: currentMatch ? R.teal : R.border }]}>
                <Text style={[styles.btnRowIconText, { color: currentMatch ? R.teal : R.border }]}>▶</Text>
              </View>
              <View>
                <Text style={[styles.btnRowTitle, !currentMatch && { color: R.textMuted }]}>CONTINUE</Text>
                <Text style={styles.btnRowSub}>{currentMatch ? `${currentMatch.overs}.${currentMatch.balls % 6} ov played` : 'No active match'}</Text>
              </View>
            </View>
            <Text style={[styles.btnChevron, !currentMatch && { color: R.border }]}>›</Text>
          </TouchableOpacity>

          {/* History */}
          <TouchableOpacity
            style={styles.btnRow}
            onPress={() => navigation.navigate('MatchHistory')}
            activeOpacity={0.82}
          >
            <View style={styles.btnRowLeft}>
              <View style={[styles.btnRowIcon, { backgroundColor: 'rgba(212,160,23,0.15)', borderColor: R.accent }]}>
                <Text style={[styles.btnRowIconText, { color: R.accent }]}>≡</Text>
              </View>
              <View>
                <Text style={styles.btnRowTitle}>HISTORY</Text>
                <Text style={styles.btnRowSub}>{completedCount} {completedCount === 1 ? 'match' : 'matches'} done</Text>
              </View>
            </View>
            <Text style={styles.btnChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.offlinePill}>
            <View style={styles.offlineDot} />
            <Text style={styles.offlineText}>OFFLINE</Text>
          </View>
          <Text style={styles.credits}>Built by Sai Sesha Reddy  ·  v3.0</Text>
        </View>

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: R.bg,
    overflow: 'hidden',
  },

  // Decorative cricket field lines
  fieldCircleOuter: {
    position: 'absolute',
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    borderWidth: 1,
    borderColor: 'rgba(46,80,64,0.4)',
    top: -width * 0.3,
    alignSelf: 'center',
  },
  fieldCircleInner: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 1,
    borderColor: 'rgba(46,80,64,0.3)',
    top: -width * 0.05,
    alignSelf: 'center',
  },
  fieldLine: {
    position: 'absolute',
    width: 1,
    height: height,
    backgroundColor: 'rgba(46,80,64,0.2)',
    alignSelf: 'center',
  },

  content: {
    flex: 1,
    paddingHorizontal: 22,
  },

  // Brand
  brand: {
    alignItems: 'center',
    marginTop: 72,
    marginBottom: 32,
  },
  batEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: R.accent,
    letterSpacing: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  tagline: {
    fontSize: 11,
    color: R.textMuted,
    letterSpacing: 3,
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  brandRule: {
    width: 60,
    height: 2,
    backgroundColor: R.accent,
    borderRadius: 1,
    marginTop: 14,
  },

  // Active match banner
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(198,40,40,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(198,40,40,0.3)',
  },
  activeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  activePulse: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(198,40,40,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: R.red,
  },
  activeBannerLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: R.red,
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  activeBannerScore: {
    fontSize: 13,
    fontWeight: '700',
    color: R.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    maxWidth: width - 120,
  },
  activeDel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(198,40,40,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDelText: {
    fontSize: 14,
    color: R.red,
    fontWeight: '900',
  },

  // Action buttons
  actions: {
    gap: 10,
  },

  // New Match — large primary button
  btnNew: {
    backgroundColor: R.accent,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: R.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  btnNewInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  btnNewIcon: {
    fontSize: 28,
    fontWeight: '900',
    color: R.bgDark,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    width: 36,
    textAlign: 'center',
  },
  btnNewTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: R.bgDark,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  btnNewSub: {
    fontSize: 12,
    color: 'rgba(18,43,34,0.65)',
    marginTop: 2,
  },

  // Regular row buttons
  btnRow: {
    backgroundColor: R.bgCard,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: R.border,
  },
  btnRowDisabled: { opacity: 0.45 },
  btnRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  btnRowIconText: {
    fontSize: 20,
    fontWeight: '900',
  },
  btnRowTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: R.text,
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  btnRowSub: {
    fontSize: 12,
    color: R.textMuted,
    marginTop: 2,
  },
  btnChevron: {
    fontSize: 24,
    color: R.textMuted,
    fontWeight: '300',
  },

  // Footer
  footer: {
    marginTop: 'auto',
    marginBottom: 32,
    alignItems: 'center',
    gap: 10,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,137,123,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,137,123,0.2)',
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: R.teal,
  },
  offlineText: {
    fontSize: 10,
    fontWeight: '900',
    color: R.teal,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  credits: {
    fontSize: 12,
    color: R.textMuted,
  },
});

export default HomeScreen;
