import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import LibraryScreen from './screens/LibraryScreen';
import CreateWorkoutScreen from './screens/CreateWorkoutScreen';
import WorkoutDetailScreen from './screens/WorkoutDetailScreen';
import WorkoutPreviewScreen from './screens/WorkoutPreviewScreen';
import EditWorkoutScreen from './screens/EditWorkoutScreen';
import WorkoutSessionScreen from './screens/WorkoutSessionScreen';
import ProfileScreen from './screens/ProfileScreen';
import FeedScreen from './screens/FeedScreen';
import Logo from './components/Logo';
import { AuthContext } from './context/AuthContext';
import { API_BASE_URL } from './config';
import { setSignOutHandler } from './services/api';
import { PRIMARY_GREEN } from './theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginTop: 24,
  },
});

function CreatePlaceholder() {
  return <View style={{ flex: 1 }} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Create') {
            return (
              <View style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: PRIMARY_GREEN,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="add" size={size} color="#fff" />
              </View>
            );
          }
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Library') iconName = focused ? 'library' : 'library-outline';
          else if (route.name === 'Discover') iconName = focused ? 'compass' : 'compass-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: PRIMARY_GREEN,
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#111827',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={FeedScreen} />
      <Tab.Screen
        name="Create"
        component={CreatePlaceholder}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CreateWorkout');
          },
        })}
      />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        // Validate access token against the server
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (response.ok) {
            setUserToken(token);
            setUser(JSON.parse(userData));
          } else if (refreshToken) {
            // Access token expired — try refreshing
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              await AsyncStorage.setItem('userToken', data.token);
              await AsyncStorage.setItem('refreshToken', data.refreshToken);
              setUserToken(data.token);
              setUser(JSON.parse(userData));
            } else {
              // Refresh token also invalid — clear everything
              await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userData']);
            }
          } else {
            await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userData']);
          }
        } catch {
          // Network error — allow offline use with cached token
          setUserToken(token);
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Error loading token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token, refreshToken, userData) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUserToken(token);
      setUser(userData);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      // Revoke refresh token on the server
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const token = await AsyncStorage.getItem('userToken');
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ refreshToken }),
          });
        } catch {
          // Server unreachable — still clear local state
        }
      }
      await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userData']);
      setUserToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const authContext = {
    signIn,
    signOut,
    user,
    token: userToken,
  };

  // Register signOut so the API interceptor can auto-logout on 401
  useEffect(() => {
    setSignOutHandler(signOut);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <Logo size="large" />
        <ActivityIndicator size="large" color={PRIMARY_GREEN} style={styles.loadingSpinner} />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userToken == null ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen 
                name="CreateWorkout" 
                component={CreateWorkoutScreen}
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', shadowOpacity: 0, elevation: 0 },
                  headerTintColor: '#111827',
                  title: 'Create Workout'
                }}
              />
              <Stack.Screen 
                name="WorkoutDetail" 
                component={WorkoutDetailScreen}
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', shadowOpacity: 0, elevation: 0 },
                  headerTintColor: '#111827',
                  title: '',
                  headerRight: () => <Logo size="small" style={{ marginRight: 16 }} />,
                }}
              />
              <Stack.Screen 
                name="WorkoutPreview" 
                component={WorkoutPreviewScreen}
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', shadowOpacity: 0, elevation: 0 },
                  headerTintColor: '#111827',
                  title: 'Review Workout'
                }}
              />
              <Stack.Screen 
                name="EditWorkout" 
                component={EditWorkoutScreen}
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', shadowOpacity: 0, elevation: 0 },
                  headerTintColor: '#111827',
                  title: 'Edit Workout'
                }}
              />
              <Stack.Screen 
                name="WorkoutSession" 
                component={WorkoutSessionScreen}
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', shadowOpacity: 0, elevation: 0 },
                  headerTintColor: '#111827',
                  title: 'Workout Session',
                  headerLeft: null,
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
