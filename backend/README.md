# FitCommunity Backend API

Node.js/Express backend for the FitCommunity social fitness app.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fitcommunity
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

3. Start MongoDB (if using local installation)

4. Run the server:
```bash
npm run dev
```

## Project Structure

```
backend/
├── models/          # Mongoose models (User, Workout)
├── routes/          # API route handlers
├── middleware/      # Custom middleware (auth)
├── utils/           # Utility functions (workout parser)
├── server.js        # Main server file
└── package.json
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
