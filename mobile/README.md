# FitCommunity Mobile App

React Native mobile app built with Expo for the FitCommunity social fitness platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update API configuration in `config.js`:
```javascript
export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3000/api';
```

3. Start the development server:
```bash
npm start
```

## Project Structure

```
mobile/
├── screens/         # Screen components
├── context/         # React context (AuthContext)
├── services/        # API service
├── config.js        # Configuration
├── App.js           # Main app component
└── package.json
```

## Running on Different Platforms

- **iOS Simulator**: Press `i` in the Expo CLI
- **Android Emulator**: Press `a` in the Expo CLI
- **Physical Device**: Install Expo Go app and scan QR code

## Notes

- Make sure your backend server is running before starting the mobile app
- For physical devices, use your computer's local IP address in `config.js`
- iOS Simulator can use `localhost`, Android Emulator should use `10.0.2.2`
