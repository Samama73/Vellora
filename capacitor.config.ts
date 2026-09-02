import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vellora.app',
  appName: 'Vellora',
  webDir: 'public', // Capacitor ko required hai, lekin hum use nahi karenge kyunki server.url set hai
  server: {
      url: 'https://vellora.salonchairwala.com',
      cleartext: false
    }
};

export default config;