import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { PRIMARY_GREEN } from '../theme';

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [friendsWorkoutsCompleted, setFriendsWorkoutsCompleted] = useState(true);
  const [myWorkoutsCompleted, setMyWorkoutsCompleted] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/auth/me/notifications');
      const prefs = response.data;
      setFriendsWorkoutsCompleted(prefs.friendsWorkoutsCompleted ?? true);
      setMyWorkoutsCompleted(prefs.myWorkoutsCompleted ?? true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePref = async (key, value) => {
    const updates = {
      friendsWorkoutsCompleted: key === 'friendsWorkoutsCompleted' ? value : friendsWorkoutsCompleted,
      myWorkoutsCompleted: key === 'myWorkoutsCompleted' ? value : myWorkoutsCompleted,
    };
    if (key === 'friendsWorkoutsCompleted') setFriendsWorkoutsCompleted(value);
    else setMyWorkoutsCompleted(value);

    try {
      await api.put('/auth/me/notifications', updates);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update setting');
      if (key === 'friendsWorkoutsCompleted') setFriendsWorkoutsCompleted(!value);
      else setMyWorkoutsCompleted(!value);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_GREEN} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.sectionDescription}>
          Choose which notifications you'd like to receive.
        </Text>

        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Ionicons name="people" size={22} color={PRIMARY_GREEN} style={styles.rowIcon} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Workouts by Friends</Text>
              <Text style={styles.rowSubtitle}>
                When someone you follow completes a workout
              </Text>
            </View>
          </View>
          <View style={styles.switchWrap}>
            <Switch
              value={friendsWorkoutsCompleted}
              onValueChange={(v) => updatePref('friendsWorkoutsCompleted', v)}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={friendsWorkoutsCompleted ? PRIMARY_GREEN : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={[styles.row, styles.rowBorder]}>
          <View style={styles.rowContent}>
            <Ionicons name="barbell" size={22} color={PRIMARY_GREEN} style={styles.rowIcon} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>My Workouts</Text>
              <Text style={styles.rowSubtitle}>
                When someone completes a workout you created
              </Text>
            </View>
          </View>
          <View style={styles.switchWrap}>
            <Switch
              value={myWorkoutsCompleted}
              onValueChange={(v) => updatePref('myWorkoutsCompleted', v)}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={myWorkoutsCompleted ? PRIMARY_GREEN : '#f3f4f6'}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 16,
    minWidth: 0,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowIcon: {
    marginRight: 12,
  },
  switchWrap: {
    flexShrink: 0,
    transform: [{ scale: 0.85 }],
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
});
