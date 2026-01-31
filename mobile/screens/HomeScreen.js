import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [libraryWorkouts, setLibraryWorkouts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [libraryRes, feedRes] = await Promise.all([
        api.get('/workouts/library'),
        api.get('/social/feed')
      ]);
      setLibraryWorkouts(libraryRes.data.slice(0, 6)); // Show first 6 workouts
      setRecentActivities(feedRes.data.slice(0, 3)); // Show recent 3 activities
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderExerciseCard = ({ item }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item._id })}
    >
      <View style={styles.exerciseIconContainer}>
        <Ionicons name="fitness" size={24} color="#8b5cf6" />
      </View>
      <Text style={styles.exerciseName} numberOfLines={1}>{item.title}</Text>
      <View style={styles.exerciseTags}>
        {item.difficulty && (
          <View style={[styles.exerciseTag, styles.intermediateTag]}>
            <Text style={styles.exerciseTagText}>{item.difficulty}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderActivityItem = ({ item }) => {
    const creator = item.user;
    const workout = item.workout;
    
    return (
      <View style={styles.activityItem}>
        <View style={styles.activityAvatar}>
          <Ionicons name="person" size={16} color="#fff" />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>
            <Text style={styles.activityUser}>{creator?.displayName || creator?.username}</Text>
            {' '}shared a new workout: "{workout?.title}"
          </Text>
          <Text style={styles.activityTime}>
            {getTimeAgo(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#8b5cf6"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="fitness" size={24} color="#8b5cf6" />
          <Text style={styles.logoText}>FitCommunity</Text>
        </View>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome back!</Text>
        <Text style={styles.welcomeSubtitle}>Ready for your next workout?</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateWorkout')}
          >
            <View style={[styles.actionIcon, styles.greenAction]}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>New Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Library')}
          >
            <View style={[styles.actionIcon, styles.purpleAction]}>
              <Ionicons name="checkmark-circle" size={28} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Log Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateWorkout')}
          >
            <View style={[styles.actionIcon, styles.blueAction]}>
              <Ionicons name="download" size={28} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Import</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Exercise Library */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Exercise Library</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Library')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {libraryWorkouts.length > 0 ? (
          <FlatList
            horizontal
            data={libraryWorkouts}
            renderItem={renderExerciseCard}
            keyExtractor={(item) => item._id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exerciseList}
          />
        ) : (
          <View style={styles.emptyLibrary}>
            <Text style={styles.emptyText}>No workouts in your library yet</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateWorkout')}
            >
              <Text style={styles.createButtonText}>Create Your First Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Activity Feed */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Feed</Text>
        {recentActivities.length > 0 ? (
          <View style={styles.activityFeed}>
            {recentActivities.map((item) => (
              <View key={item._id}>
                {renderActivityItem({ item })}
              </View>
            ))}
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Feed')}
            >
              <Text style={styles.viewAllText}>View All Activity</Text>
              <Ionicons name="chevron-forward" size={16} color="#8b5cf6" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyActivity}>
            <Ionicons name="people-outline" size={48} color="#4b5563" />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  greenAction: {
    backgroundColor: '#22c55e',
  },
  purpleAction: {
    backgroundColor: '#8b5cf6',
  },
  blueAction: {
    backgroundColor: '#3b82f6',
  },
  actionLabel: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '600',
    textAlign: 'center',
  },
  exerciseList: {
    paddingRight: 20,
  },
  exerciseCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 160,
    borderWidth: 1,
    borderColor: '#334155',
  },
  exerciseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2d1b4e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  exerciseTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  exerciseTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intermediateTag: {
    backgroundColor: '#451a03',
  },
  exerciseTagText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyLibrary: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  activityFeed: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  activityUser: {
    fontWeight: 'bold',
    color: '#fff',
  },
  activityTime: {
    fontSize: 12,
    color: '#64748b',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  emptyActivity: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
});
