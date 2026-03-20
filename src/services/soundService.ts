/**
 * SoundService — Haptic + sound feedback for game events.
 *
 * Haptics work out-of-the-box on device (iOS & Android).
 * To add real sounds: place sound files in assets/sounds/ and
 * install expo-av (`npx expo install expo-av`), then uncomment the Audio sections.
 */

import * as Haptics from 'expo-haptics';

class SoundService {
  private ready = false;

  async init() {
    this.ready = true;
  }

  // ── Haptic helpers ──────────────────────────────────────────────────────────

  async playRun(runs: number) {
    if (runs >= 4) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  async playSix() {
    // Heavy double pulse for six
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 120);
  }

  async playFour() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  async playWicket() {
    // Error notification for wicket
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  async playWide() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  }

  async playNoBall() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  }

  async playDot() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async playUndo() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  }

  async playHatTrick() {
    // Triple pulse for hat-trick
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 120);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 240);
  }

  async destroy() {
    this.ready = false;
  }
}

export const soundService = new SoundService();
