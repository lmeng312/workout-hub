# Install MongoDB Locally (Alternative Option)

## Install via Homebrew

```bash
# Add MongoDB tap
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

## Verify Installation

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Or test connection
mongosh
# Should connect to MongoDB shell
```

## Create .env File

```bash
cd backend

cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017/fitcommunity
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
EOF
```

## Start Backend

```bash
npm run dev
```

You should see: `MongoDB connected` ✅

## If MongoDB Won't Start

```bash
# Check logs
brew services list

# Try manual start
mongod --config /opt/homebrew/etc/mongod.conf

# Check if port 27017 is in use
lsof -i :27017
```
