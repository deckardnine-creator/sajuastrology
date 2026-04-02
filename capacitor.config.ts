import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rimfactory.sajuastrology',
  appName: 'SajuAstrology',
  webDir: 'out',
  server: {
    url: 'https://sajuastrology.com',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a0a1a',
  },
};

export default config;
