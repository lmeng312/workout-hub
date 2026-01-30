# FitCommunity - Social Fitness App

A social fitness mobile app where users can save workouts from YouTube and Instagram, organize workouts, and share them with friends.

## Features

- **Workout Management**: Save workouts from YouTube/Instagram links, create custom workouts
- **Workout Library**: Organize, view, edit, and mark workouts as completed
- **Social Features**: Follow friends, see workout feed, save and share workouts
- **Privacy Controls**: Set workouts as public or private

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT

## Project Structure

```
workout_app/
├── mobile/          # React Native Expo app
├── backend/         # Node.js Express API
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator, or Expo Go app on your phone

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fitcommunity
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Make sure MongoDB is running (if using local MongoDB):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod
```

5. Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Mobile App Setup

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update the API URL in `mobile/config.js` if your backend is running on a different address:
```javascript
export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3000/api';
// For iOS Simulator, use: http://localhost:3000/api
// For Android Emulator, use: http://10.0.2.2:3000/api
// For physical device, use your computer's IP address
```

4. Start the Expo development server:
```bash
npm start
```

5. Use the Expo Go app on your phone to scan the QR code, or press `i` for iOS simulator, `a` for Android emulator.

## Features Overview

### Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing

### Workout Management
- **Custom Workouts**: Create workouts manually with exercises, sets, and reps
- **YouTube Integration**: Paste YouTube links to automatically extract workout information
- **Instagram Integration**: Paste Instagram captions to parse workout details
- **Workout Library**: View all your created and saved workouts in one place
- **Workout Details**: View complete workout information with exercises and sets
- **Mark as Completed**: Track your workout completion

### Social Features
- **Follow Users**: Follow friends and other users
- **Social Feed**: See workouts from users you follow
- **Save Workouts**: Save workouts from other users to your library
- **Share Workouts**: Make workouts public or private
- **User Profiles**: View user profiles and statistics

### Design
- Clean, modern fitness-focused UI
- Green color theme (#22c55e)
- Mobile-first responsive design
- Intuitive navigation with bottom tabs

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Workouts
- `GET /api/workouts` - Get all public workouts
- `GET /api/workouts/library` - Get user's workout library
- `GET /api/workouts/:id` - Get workout details
- `POST /api/workouts` - Create custom workout
- `POST /api/workouts/parse` - Parse workout from YouTube/Instagram
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout
- `POST /api/workouts/:id/complete` - Mark workout as completed
- `POST /api/workouts/:id/save` - Save workout to library
- `POST /api/workouts/:id/unsave` - Unsave workout

### Social
- `GET /api/social/feed` - Get feed of followed users' workouts
- `POST /api/social/follow/:userId` - Follow a user
- `POST /api/social/unfollow/:userId` - Unfollow a user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/search/:query` - Search users

## Next Steps

- Add exercise builder UI for custom workouts
- Implement workout editing functionality
- Add image uploads for profile pictures
- Enhance workout parsing with AI/ML
- Add workout templates
- Implement push notifications
- Add workout analytics and progress tracking
