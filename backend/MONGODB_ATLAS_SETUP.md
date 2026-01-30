# MongoDB Atlas Setup (Easiest Option)

## Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign Up"
3. Create account (free tier available)

## Step 2: Create a Cluster

1. After signing in, click "Build a Database"
2. Choose **FREE** tier (M0)
3. Select a cloud provider and region (choose closest to you)
4. Click "Create"

## Step 3: Create Database User

1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (save these!)
5. Set privileges to "Atlas admin" or "Read and write to any database"
6. Click "Add User"

## Step 4: Whitelist Your IP

1. Go to "Network Access" in left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address
4. Click "Confirm"

## Step 5: Get Connection String

1. Go to "Database" in left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version (3.6 or later)
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File

Replace `<username>` and `<password>` in the connection string with your database user credentials, then add the database name:

```bash
cd backend

# Create .env file
cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fitcommunity?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
EOF
```

**Important**: Replace:
- `YOUR_USERNAME` with your database username
- `YOUR_PASSWORD` with your database password  
- `cluster0.xxxxx` with your actual cluster address
- Add `/fitcommunity` before the `?` to specify database name

## Step 7: Restart Backend

```bash
cd backend
# Stop current server (Ctrl+C)
npm run dev
```

You should see: `MongoDB connected` ✅

## Example .env File

```env
MONGODB_URI=mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/fitcommunity?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=my-super-secret-key-12345
NODE_ENV=development
```

## Troubleshooting

**"Authentication failed"**
- Check username/password are correct
- Make sure you replaced `<username>` and `<password>` in connection string

**"IP not whitelisted"**
- Go to Network Access and add your IP or "Allow from anywhere"

**"Connection timeout"**
- Check your internet connection
- Verify connection string is correct
- Make sure cluster is running (not paused)
