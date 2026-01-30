/**
 * API Configuration
 * 
 * Update this based on how you're testing the app:
 * 
 * 1. iOS Simulator: 'http://localhost:3000/api'
 * 2. Android Emulator: 'http://10.0.2.2:3000/api'
 * 3. Physical Device: 'http://YOUR_COMPUTER_IP:3000/api'
 *    - Find your IP: System Preferences → Network (Mac) or ipconfig (Windows)
 *    - Example: 'http://192.168.1.100:3000/api'
 * 
 * Make sure your backend is running on port 3000!
 */

// For development - change based on your testing method
// Physical device: Use your computer's IP address (found: 192.168.6.40)
const DEV_API_URL = 'http://192.168.6.40:3000/api';

// For production (when you deploy)
const PROD_API_URL = 'https://your-production-api.com/api';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;
