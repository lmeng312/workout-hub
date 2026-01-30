import React, { useState, useEffect } from 'react';
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
import ProfileScreen from './screens/ProfileScreen';
import FeedScreen from './screens/FeedScreen';
import { AuthContext } from './context/AuthContext';
import { API_BASE_URL } from './config';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Feed') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Library') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9ca3af',
        headerStyle: {
          backgroundColor: '#22c55e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
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
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUserToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const authContext = {
    signIn: async (token, userData) => {
      try {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUserToken(token);
        setUser(userData);
      } catch (error) {
        console.error('Error signing in:', error);
      }
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUserToken(null);
        setUser(null);
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
    user,
    token: userToken,
  };

  if (isLoading) {
    return null; // You can add a loading screen here
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
                  headerStyle: { backgroundColor: '#22c55e' },
                  headerTintColor: '#fff',
                  title: 'Create Workout'
                }}
              />
              <Stack.Screen 
                name="WorkoutDetail" 
                component={WorkoutDetailScreen}
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#22c55e' },
                  headerTintColor: '#fff',
                  title: 'Workout Details'
                }}
              />
              <Stack.Screen 
                name="WorkoutPreview" 
                component={require('./screens/WorkoutPreviewScreen').default}
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#22c55e' },
                  headerTintColor: '#fff',
                  title: 'Review Workout'
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
