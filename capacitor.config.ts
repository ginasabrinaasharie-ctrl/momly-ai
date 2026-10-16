import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.momly.ai',
  appName: 'Momly',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
