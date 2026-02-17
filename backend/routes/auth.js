const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();

const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY_DAYS = 90;
const EMAIL_VERIFY_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;     // 1 hour

// Generate a cryptographically random refresh token
function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

// Hash a refresh token for storage (don't store raw tokens in the DB)
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Validate required fields and lengths (friendly messages before hitting DB)
    const emailTrim = (email && typeof email === 'string') ? email.trim().toLowerCase() : '';
    const usernameTrim = (username && typeof username === 'string') ? username.trim() : '';
    if (!emailTrim) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    if (!usernameTrim) {
      return res.status(400).json({ message: 'Username is required.' });
    }
    if (usernameTrim.length < 3 || usernameTrim.length > 30) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: emailTrim }, { username: usernameTrim }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Create user (use normalized email/username)
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const user = new User({
      username: usernameTrim,
      email: emailTrim,
      password,
      displayName: (displayName && typeof displayName === 'string' ? displayName.trim() : '') || usernameTrim,
      emailVerifyToken,
      emailVerifyExpires: new Date(Date.now() + EMAIL_VERIFY_EXPIRY_MS),
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = generateRefreshToken();
    user.refreshTokens.push({ token: hashToken(refreshToken) });

    await user.save();

    // Send verification email (non-blocking; don't fail signup if email fails)
    sendVerificationEmail(user.email, emailVerifyToken).catch((err) =>
      console.error('Verification email failed:', err.message)
    );

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
      }
    });
  } catch (error) {
    // Log so you can see the real error in the terminal
    console.error('Register error:', error.message);
    if (error.name === 'ValidationError') {
      const first = Object.values(error.errors)[0];
      return res.status(400).json({
        message: first ? first.message : 'Validation failed. Check username (3–30 chars) and password (min 6).'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server misconfiguration. JWT_SECRET is not set.' });
    }
    res.status(500).json({ message: error.message || 'Something went wrong. Please try again.' });
  }
});

// Verify email (link from confirmation email)
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send('Missing verification token.');
    }
    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).send('Invalid or expired verification link. You can request a new one from the app.');
    }
    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();
    res.send(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Email verified</title></head>
      <body style="font-family:sans-serif;max-width:400px;margin:2rem auto;padding:1rem;">
        <h1>Email verified</h1>
        <p>Your ${process.env.APP_NAME || 'FitCommunity'} account is confirmed. You can close this page and use the app.</p>
      </body></html>
    `);
  } catch (error) {
    res.status(500).send('Something went wrong.');
  }
});

// Forgot password — request reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Don't reveal whether the email exists
      return res.json({ message: 'If an account exists for that email, you will receive a password reset link.' });
    }
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
    await user.save();
    await sendPasswordResetEmail(user.email, rawToken);
    res.json({ message: 'If an account exists for that email, you will receive a password reset link.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset password — set new password with token from email
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const hashed = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new password reset.' });
    }
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ message: 'Password updated. You can sign in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve reset-password page (form with token in query; form POSTs to /api/auth/reset-password)
router.get('/reset-password-page', (req, res) => {
  const raw = req.query.token;
  const token = (raw != null && raw !== '') ? String(Array.isArray(raw) ? raw[0] : raw) : '';
  const appName = process.env.APP_NAME || 'FitCommunity';

  if (!token) {
    res.set('Content-Type', 'text/html');
    return res.status(400).send(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Invalid link – ${appName}</title></head>
<body style="font-family:system-ui;max-width:360px;margin:2rem auto;padding:1rem;">
  <h1>Invalid or missing link</h1>
  <p>This password reset link is invalid or has expired. Please request a new reset link from the app.</p>
</body>
</html>
    `);
  }

  res.set('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset password – ${appName}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 360px; margin: 2rem auto; padding: 1rem; }
    input { width: 100%; padding: 10px; margin: 8px 0; box-sizing: border-box; }
    button { width: 100%; padding: 12px; background: #22c55e; color: #fff; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .msg { margin-top: 1rem; padding: 10px; border-radius: 8px; }
    .msg.success { background: #dcfce7; color: #166534; }
    .msg.error { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <h1>Set new password</h1>
  <p>Enter a new password for your ${appName} account.</p>
  <form id="form">
    <input type="hidden" name="token" value="${token.replace(/"/g, '&quot;')}" />
    <label>New password (min 6 characters)</label>
    <input type="password" name="newPassword" minlength="6" required autocomplete="new-password" />
    <button type="submit" id="btn">Update password</button>
  </form>
  <div id="msg" class="msg" style="display:none;"></div>
  <script>
    document.getElementById('form').onsubmit = async (e) => {
      e.preventDefault();
      var btn = document.getElementById('btn');
      var msg = document.getElementById('msg');
      btn.disabled = true;
      msg.style.display = 'none';
      var form = e.target;
      var token = form.token.value;
      var newPassword = form.newPassword.value;
      var base = window.location.origin;
      try {
        var r = await fetch(base + '/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token, newPassword: newPassword })
        });
        var data = await r.json().catch(function() { return {}; });
        msg.style.display = 'block';
        if (r.ok) {
          msg.className = 'msg success';
          msg.textContent = data.message || 'Password updated. You can close this page and sign in in the app.';
          form.reset();
        } else {
          msg.className = 'msg error';
          msg.textContent = data.message || 'Something went wrong. Try requesting a new reset link.';
        }
      } catch (err) {
        msg.style.display = 'block';
        msg.className = 'msg error';
        msg.textContent = 'Network error. Check your connection and try again.';
      }
      btn.disabled = false;
    };
  </script>
</body>
</html>
  `);
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNormalized = (email && typeof email === 'string') ? email.trim().toLowerCase() : '';

    if (!emailNormalized || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user (email is stored lowercase)
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = generateRefreshToken();
    user.refreshTokens.push({ token: hashToken(refreshToken) });

    // Clean up old refresh tokens (keep max 5 per user)
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const hashedToken = hashToken(refreshToken);

    // Find user with this refresh token
    const user = await User.findOne({
      'refreshTokens.token': hashedToken
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Remove the used refresh token (rotation)
    user.refreshTokens = user.refreshTokens.filter(
      rt => rt.token !== hashedToken
    );

    // Issue new tokens
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const newRefreshToken = generateRefreshToken();
    user.refreshTokens.push({ token: hashToken(newRefreshToken) });

    await user.save();

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout — revoke refresh token
router.post('/logout', auth, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          rt => rt.token !== hashedToken
        );
        await user.save();
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password (requires current password)
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notification preferences (must be before GET /me)
router.get('/me/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('notificationPreferences')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    const prefs = user.notificationPreferences || {};
    res.json({
      friendsWorkoutsCompleted: prefs.friendsWorkoutsCompleted ?? true,
      myWorkoutsCompleted: prefs.myWorkoutsCompleted ?? true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update notification preferences
router.put('/me/notifications', auth, async (req, res) => {
  try {
    const { friendsWorkoutsCompleted, myWorkoutsCompleted } = req.body;
    const update = {};
    if (typeof friendsWorkoutsCompleted === 'boolean') {
      update['notificationPreferences.friendsWorkoutsCompleted'] = friendsWorkoutsCompleted;
    }
    if (typeof myWorkoutsCompleted === 'boolean') {
      update['notificationPreferences.myWorkoutsCompleted'] = myWorkoutsCompleted;
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No valid notification preferences to update' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('notificationPreferences');
    const prefs = user?.notificationPreferences || {};
    res.json({
      friendsWorkoutsCompleted: prefs.friendsWorkoutsCompleted ?? true,
      myWorkoutsCompleted: prefs.myWorkoutsCompleted ?? true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
