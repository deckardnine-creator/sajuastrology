import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rimfactory.sajuastrology',
  appName: 'SajuAstrology',
  webDir: 'out',
  server: {
    url: 'https://sajuastrology.com/app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a0a1a',
    appendUserAgent: 'SajuApp',
  },
};

export default config;
