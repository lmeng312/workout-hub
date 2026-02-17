import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/Logo';

// Exact colors from design: gradient top → bottom, dark green for accents
const GREEN_TOP = '#38B05E';
const GREEN_BOTTOM = '#1A964D';
const GREEN_DARK = '#1A964D'; // logo figures, Login text, Sign Up
const WHITE = '#FFFFFF';
const PLACEHOLDER_GRAY = '#BDBDBD';
const FADED_WHITE = 'rgba(255, 255, 255, 0.7)';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleForgotPassword = async () => {
    const trimmed = forgotPasswordEmail.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    setForgotPasswordLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: trimmed });
      Alert.alert(
        'Check your email',
        "If an account exists for that email, you'll receive a link to reset your password. The link expires in 1 hour."
      );
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Something went wrong. Try again later.'
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && !username) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = isLogin
        ? { email, password }
        : { username, email, password, displayName: displayName || username };

      const response = await api.post(endpoint, data);
      if (!isLogin) {
        Alert.alert(
          'Account created',
          "Check your email to verify your address. You're signed in and can use the app."
        );
      }
      await signIn(response.data.token, response.data.refreshToken, response.data.user);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[GREEN_TOP, GREEN_BOTTOM]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.logoWrapper}>
            <Logo size="large" />
          </View>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            FitCommunity
          </Text>
          <Text style={styles.subtitle}>
            {showForgotPassword ? 'Enter your email for a reset link' : isLogin ? 'Welcome back!' : 'Join the community'}
          </Text>

          {showForgotPassword ? (
            <>
              <View style={styles.inputCapsuleRow}>
                <Ionicons name="mail-outline" size={20} color={PLACEHOLDER_GRAY} style={styles.inputIconLeft} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Email"
                  placeholderTextColor={PLACEHOLDER_GRAY}
                  value={forgotPasswordEmail}
                  onChangeText={setForgotPasswordEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={handleForgotPassword}
                disabled={forgotPasswordLoading}
              >
                <Text style={styles.buttonText}>
                  {forgotPasswordLoading ? 'Sending...' : 'Send reset link'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowForgotPassword(false); setForgotPasswordEmail(''); }}
                style={styles.switchButton}
              >
                <Text style={styles.switchText}>Back to </Text>
                <Text style={[styles.switchTextLink, { color: WHITE }]}>Login</Text>
              </TouchableOpacity>
            </>
          ) : (
          <>
          {!isLogin && (
            <TextInput
              style={styles.inputCapsule}
              placeholder="Username"
              placeholderTextColor={PLACEHOLDER_GRAY}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}

          {!isLogin && (
            <TextInput
              style={styles.inputCapsule}
              placeholder="Display Name (optional)"
              placeholderTextColor={PLACEHOLDER_GRAY}
              value={displayName}
              onChangeText={setDisplayName}
            />
          )}

          <View style={styles.inputCapsuleRow}>
            <Ionicons name="mail-outline" size={20} color={PLACEHOLDER_GRAY} style={styles.inputIconLeft} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Email"
              placeholderTextColor={PLACEHOLDER_GRAY}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputCapsuleRow}>
            <Ionicons name="lock-closed-outline" size={20} color={PLACEHOLDER_GRAY} style={styles.inputIconLeft} />
            <TextInput
              style={styles.inputWithIconRight}
              placeholder="Password"
              placeholderTextColor={PLACEHOLDER_GRAY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.eyeButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={PLACEHOLDER_GRAY}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity
              onPress={() => setShowForgotPassword(true)}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={[styles.switchTextLink, isLogin && { color: WHITE }]}>{isLogin ? 'Sign Up' : 'Login'}</Text>
            </Text>
          </TouchableOpacity>
          </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: WHITE,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: WHITE,
    textAlign: 'center',
    marginBottom: 36,
    opacity: 0.95,
  },
  inputCapsule: {
    backgroundColor: WHITE,
    borderRadius: 26,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputCapsuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 26,
    marginBottom: 14,
    paddingLeft: 20,
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIconLeft: {
    marginRight: 10,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
  },
  inputWithIconRight: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 8,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  button: {
    backgroundColor: WHITE,
    borderRadius: 26,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontWeight: '700',
    color: GREEN_DARK,
    fontSize: 18,
  },
  forgotPasswordButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: FADED_WHITE,
    textDecorationLine: 'underline',
  },
  switchButton: {
    marginTop: 28,
    alignItems: 'center',
  },
  switchText: {
    fontWeight: '400',
    color: FADED_WHITE,
    fontSize: 15,
  },
  switchTextLink: {
    fontWeight: '400',
    color: GREEN_DARK,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
