
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'world.trueharvest.app',
  appName: 'True Harvest',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      "*.firebasejs.sh",
      "*.gstatic.com",
      "*.aistudiocdn.com",
      "esm.sh"
    ]
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#020617'
  }
};

export default config;
