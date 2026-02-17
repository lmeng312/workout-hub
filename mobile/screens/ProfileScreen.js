import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/Logo';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    workoutsCreated: 0,
    workoutsCompleted: 0,
    followers: 0,
    following: 0,
  });
  const [myWorkouts, setMyWorkouts] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    loadMyWorkouts();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setProfile(response.data);
      setStats({
        workoutsCreated: 0,
        workoutsCompleted: 0,
        followers: response.data.followers?.length || 0,
        following: response.data.following?.length || 0,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadMyWorkouts = async () => {
    try {
      const [libraryRes, completedRes] = await Promise.all([
        api.get('/workouts/library'),
        api.get('/workouts/stats/completed'),
      ]);
      const list = libraryRes.data || [];
      setMyWorkouts(list.slice(0, 6));
      setStats((prev) => ({
        ...prev,
        workoutsCreated: list.length,
        workoutsCompleted: completedRes.data?.completedCount || 0,
      }));
    } catch (error) {
      console.error('Error loading my workouts:', error);
    }
  };

  const getWorkoutIcon = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('run') || t.includes('cardio') || t.includes('hiit')) return 'walk';
    if (t.includes('yoga') || t.includes('flex')) return 'body';
    return 'barbell';
  };

  const formatWorkoutDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.headerLogoWrap}>
          <Logo size="small" style={styles.headerLogoCircle} />
        </View>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerLogoWrap} />
      </View>

      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="camera" size={28} color="#6b7280" />
          </View>
        </View>
        <Text style={styles.name}>
          {profile?.displayName || user?.displayName || user?.username || 'User'}
        </Text>
        <Text style={styles.username}>@{profile?.username || user?.username}</Text>
        {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.workoutsCreated}</Text>
          <Text style={styles.statLabel}>Created</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.workoutsCompleted}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Workouts</Text>
        <View style={styles.myWorkoutsGrid}>
          {myWorkouts.map((w) => (
            <TouchableOpacity
              key={w._id}
              style={styles.myWorkoutCard}
              onPress={() => navigation.navigate('WorkoutDetail', { workoutId: w._id })}
            >
              <View style={styles.myWorkoutIconWrap}>
                <Ionicons name={getWorkoutIcon(w.title)} size={20} color="#fff" />
              </View>
              <Text style={styles.myWorkoutTitle} numberOfLines={1}>{w.title}</Text>
              <Text style={styles.myWorkoutDate}>{formatWorkoutDate(w.updatedAt || w.createdAt)}</Text>
              {w.estimatedMinutes && (
                <Text style={styles.myWorkoutMeta}>
                  {w.estimatedMinutes} min{w.exercises?.length ? ` • ${w.exercises.length} exercises` : ''}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color="#22c55e" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="people-outline" size={24} color="#22c55e" />
          <Text style={styles.menuText}>Find Friends</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#22c55e" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLogoWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 24,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  myWorkoutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  myWorkoutCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  myWorkoutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  myWorkoutTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  myWorkoutDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  myWorkoutMeta: {
    fontSize: 11,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    textAlign: 'center',
    numberOfLines: 1,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
  },
  logoutText: {
    color: '#ef4444',
  },
});
