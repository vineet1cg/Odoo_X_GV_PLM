import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.plmflow.enterprise',
  appName: 'PLM Flow',
  webDir: 'dist',
  server: {
    // IMPORTANT: For hackathon demo with live backend, use your deployed backend URL.
    // If running backend locally during demo, use your machine's LAN IP, e.g.:
    // url: 'http://192.168.1.X:5000',
    // cleartext: true,
    androidScheme: 'https',
    allowNavigation: ['*.supabase.co', '*.mongodb.net', 'api.emailjs.com'],
    errorPath: '/index.html', // SPA fallback
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#0a0a0f',         // Match your dark glassmorphic bg
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0a0a0f',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,    // Enable for hackathon demo/debugging
  },
};

export default config;
