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

const { width } = Dimensions.get('window');

const R = {
  bg: '#F5F5F5',
  bgCard: '#FFFFFF',
  text: '#111111',
  textMuted: '#666666',
  accent: '#16A34A',
  red: '#DC2626',
  redDim: 'rgba(220,38,38,0.08)',
  border: '#E0E0E0',
  borderBright: '#CCCCCC',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { currentMatch, matches, deleteMatch, reset } = useMatchStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(44)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

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

  const completedMatches = matches.filter(m => m.isCompleted);
  const bestScore = completedMatches.length > 0 ? Math.max(...completedMatches.map(m => m.totalRuns)) : 0;
  const totalRuns = completedMatches.reduce((sum, m) => sum + m.totalRuns, 0);
  const runsDisplay = totalRuns >= 1000 ? `${(totalRuns / 1000).toFixed(1)}K` : totalRuns.toString();

  return (
    <View style={styles.container}>
      {/* Nothing Phone glyph-inspired ring decorations */}
      <View style={styles.ring1} />
      <View style={styles.ring2} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* ── Brand ── */}
        <View style={styles.brand}>
          <Text style={styles.appName}>
            SESH<Text style={styles.appNameAccent}>CRIC</Text>
          </Text>
          <Text style={styles.tagline}>· LOCAL CRICKET SCORER ·</Text>
        </View>

        {/* ── Big Stats (W / D / L inspired) ── */}
        <View style={styles.statsPanel}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>
              {String(completedMatches.length).padStart(2, '0')}
            </Text>
            <Text style={styles.statLabel}>MATCHES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: R.accent }]}>{bestScore}</Text>
            <Text style={styles.statLabel}>BEST</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{runsDisplay}</Text>
            <Text style={styles.statLabel}>RUNS</Text>
          </View>
        </View>

        {/* ── Active match banner ── */}
        {currentMatch && (
          <View style={styles.activeBanner}>
            <View style={styles.activeBannerLeft}>
              <View style={styles.activeDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.activeBannerLabel}>IN PROGRESS</Text>
                <Text style={styles.activeBannerScore} numberOfLines={1}>
                  {currentMatch.teamName}{currentMatch.team2Name ? ` vs ${currentMatch.team2Name}` : ''}  ·  {currentMatch.totalRuns}/{currentMatch.wickets}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.activeDelBtn} onPress={handleDeleteCurrentMatch}>
              <Text style={styles.activeDelText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Action buttons ── */}
        <View style={styles.actions}>

          {/* NEW MATCH — neon primary */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('CreateMatch')}
            activeOpacity={0.85}
          >
            <View style={styles.btnRow}>
              <View style={styles.btnIconDark}>
                <Text style={styles.btnIconDarkText}>+</Text>
              </View>
              <View>
                <Text style={styles.btnPrimaryTitle}>NEW MATCH</Text>
                <Text style={styles.btnPrimarySub}>Start scoring</Text>
              </View>
            </View>
            <Text style={styles.chevronDark}>›</Text>
          </TouchableOpacity>

          {/* CONTINUE */}
          <TouchableOpacity
            style={[styles.btnSecondary, !currentMatch && styles.btnDisabled]}
            onPress={() => currentMatch && navigation.navigate('LiveMatch')}
            disabled={!currentMatch}
            activeOpacity={0.85}
          >
            <View style={styles.btnRow}>
              <View style={[styles.btnIconBorder, { borderColor: currentMatch ? R.accent : R.borderBright }]}>
                <Text style={[styles.btnIconBorderText, { color: currentMatch ? R.accent : R.borderBright }]}>▶</Text>
              </View>
              <View>
                <Text style={[styles.btnSecondaryTitle, !currentMatch && { color: R.textMuted }]}>CONTINUE</Text>
                <Text style={styles.btnSecondarySub}>
                  {currentMatch ? `${currentMatch.overs}.${currentMatch.balls % 6} ov played` : 'No active match'}
                </Text>
              </View>
            </View>
            <Text style={[styles.chevron, !currentMatch && { color: R.borderBright }]}>›</Text>
          </TouchableOpacity>

          {/* HISTORY */}
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => navigation.navigate('MatchHistory')}
            activeOpacity={0.85}
          >
            <View style={styles.btnRow}>
              <View style={[styles.btnIconBorder, { borderColor: R.borderBright }]}>
                <Text style={[styles.btnIconBorderText, { color: R.textMuted }]}>≡</Text>
              </View>
              <View>
                <Text style={styles.btnSecondaryTitle}>HISTORY</Text>
                <Text style={styles.btnSecondarySub}>
                  {completedMatches.length} {completedMatches.length === 1 ? 'match' : 'matches'} done
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
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

  // Nothing glyph rings
  ring1: {
    position: 'absolute',
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.08)',
    top: -width * 0.55,
    right: -width * 0.35,
  },
  ring2: {
    position: 'absolute',
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.14)',
    top: -width * 0.1,
    right: -width * 0.08,
  },

  content: {
    flex: 1,
    paddingHorizontal: 22,
  },

  // Brand
  brand: {
    marginTop: 72,
    marginBottom: 32,
  },
  appName: {
    fontSize: 52,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
    letterSpacing: -1,
  },
  appNameAccent: {
    color: R.accent,
  },
  tagline: {
    fontSize: 10,
    color: R.textMuted,
    letterSpacing: 3,
    marginTop: 6,
    fontFamily: R.mono,
  },

  // Big stats (W/D/L style)
  statsPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: R.border,
    paddingVertical: 22,
    marginBottom: 28,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 58,
    fontWeight: '900',
    color: R.text,
    fontFamily: R.mono,
    letterSpacing: -2,
    lineHeight: 62,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: R.textMuted,
    letterSpacing: 2.5,
    marginTop: 4,
    fontFamily: R.mono,
  },
  statDivider: {
    width: 1,
    height: 56,
    backgroundColor: R.border,
  },

  // Active banner
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: R.redDim,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.3)',
  },
  activeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: R.red,
  },
  activeBannerLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: R.red,
    letterSpacing: 2,
    fontFamily: R.mono,
  },
  activeBannerScore: {
    fontSize: 14,
    fontWeight: '700',
    color: R.text,
    fontFamily: R.mono,
    marginTop: 2,
  },
  activeDelBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(220,38,38,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDelText: {
    fontSize: 13,
    color: R.red,
    fontWeight: '900',
  },

  // Action buttons
  actions: { gap: 8 },

  btnPrimary: {
    backgroundColor: R.accent,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  btnIconDark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIconDarkText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: R.mono,
  },
  btnPrimaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    fontFamily: R.mono,
  },
  btnPrimarySub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  chevronDark: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '300',
  },

  btnSecondary: {
    backgroundColor: R.bgCard,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: R.border,
  },
  btnDisabled: { opacity: 0.4 },
  btnIconBorder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  btnIconBorderText: {
    fontSize: 18,
    fontWeight: '900',
  },
  btnSecondaryTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: R.text,
    letterSpacing: 1.5,
    fontFamily: R.mono,
  },
  btnSecondarySub: {
    fontSize: 11,
    color: R.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: R.textMuted,
    fontWeight: '300',
  },

  // Footer
  footer: {
    marginTop: 'auto',
    marginBottom: 36,
    alignItems: 'center',
    gap: 8,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: R.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: R.border,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: R.accent,
  },
  offlineText: {
    fontSize: 9,
    fontWeight: '900',
    color: R.accent,
    letterSpacing: 2.5,
    fontFamily: R.mono,
  },
  credits: {
    fontSize: 11,
    color: R.textMuted,
    fontFamily: R.mono,
  },
});

export default HomeScreen;
