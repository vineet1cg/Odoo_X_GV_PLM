import { Network } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();

// ── Network Monitoring ──────────────────────────────────────────────────────
export const getNetworkStatus = async () => {
  const status = await Network.getStatus();
  return status;
};

export const addNetworkListener = (callback: (connected: boolean) => void) => {
  return Network.addListener('networkStatusChange', (status) => {
    callback(status.connected);
  });
};

// ── Haptic Feedback (for approval actions, alerts) ──────────────────────────
export const hapticSuccess = () => {
  if (isNative) Haptics.impact({ style: ImpactStyle.Medium });
};

export const hapticError = () => {
  if (isNative) Haptics.notification({ type: 'ERROR' as any });
};

export const hapticLight = () => {
  if (isNative) Haptics.impact({ style: ImpactStyle.Light });
};

// ── Secure Local Preferences (replaces localStorage for auth tokens) ────────
export const secureSet = async (key: string, value: string) => {
  await Preferences.set({ key, value });
};

export const secureGet = async (key: string): Promise<string | null> => {
  const { value } = await Preferences.get({ key });
  return value;
};

export const secureRemove = async (key: string) => {
  await Preferences.remove({ key });
};

// ── App Initialization ───────────────────────────────────────────────────────
export const initializeApp = async () => {
  if (!isNative) return;

  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#0a0a0f' });

  // Hide splash after fonts/data load
  await SplashScreen.hide({ fadeOutDuration: 400 });
};
