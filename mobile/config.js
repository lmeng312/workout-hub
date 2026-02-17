/**
 * API Configuration
 *
 * Auto-detects: iOS Simulator → localhost, Android Emulator → 10.0.2.2, Physical Device → your IP
 * For physical device, set your Mac's IP below (run: ipconfig getifaddr en0)
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';

const PHYSICAL_DEVICE_IP = '192.168.6.39'; // Change if your IP differs: ipconfig getifaddr en0

function getDevApiUrl() {
  if (Platform.OS === 'android') {
    return Device.isDevice ? `http://${PHYSICAL_DEVICE_IP}:3000/api` : 'http://10.0.2.2:3000/api';
  }
  if (Platform.OS === 'ios') {
    return Device.isDevice ? `http://${PHYSICAL_DEVICE_IP}:3000/api` : 'http://localhost:3000/api';
  }
  return `http://${PHYSICAL_DEVICE_IP}:3000/api`;
}

const DEV_API_URL = getDevApiUrl();
const PROD_API_URL = 'https://your-production-api.com/api';

if (__DEV__) {
  console.log('[Config] API URL:', __DEV__ ? DEV_API_URL : PROD_API_URL, '| Device:', Device.isDevice, '| Platform:', Platform.OS);
}

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;
