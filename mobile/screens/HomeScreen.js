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
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/Logo';
import { PRIMARY_GREEN } from '../theme';

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
        <Ionicons name="fitness" size={24} color={PRIMARY_GREEN} />
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
    const isCompleted = item.type === 'completed';
    
    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityAvatar, isCompleted && styles.activityAvatarCompleted]}>
          <Ionicons name={isCompleted ? 'checkmark' : 'person'} size={16} color="#fff" />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>
            <Text style={styles.activityUser}>{creator?.displayName || creator?.username}</Text>
            {isCompleted
              ? ` completed a workout: "${workout?.title}"`
              : ` created a new workout: "${workout?.title}"`}
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
    <View style={styles.container}>
      {/* White header: logo + FitCommunity + bell with badge */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo size="small" />
          <Text style={styles.headerTitle}>
            <Text style={styles.headerTitleFit}>Fit</Text>
            <Text style={styles.headerTitleCommunity}>Community</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={24} color="#111827" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY_GREEN} />
        }
      >
        <View style={styles.contentCard}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.cardSubtitle}>Ready for your next workout?</Text>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Library')}>
              <Ionicons name="barbell" size={24} color={PRIMARY_GREEN} />
              <Text style={styles.actionLabel} numberOfLines={2}>Start Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CreateWorkout')}>
              <Ionicons name="add" size={24} color={PRIMARY_GREEN} />
              <Text style={styles.actionLabel} numberOfLines={1}>New</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CreateWorkout')}>
              <Ionicons name="download" size={24} color={PRIMARY_GREEN} />
              <Text style={styles.actionLabel} numberOfLines={1}>Import</Text>
            </TouchableOpacity>
          </View>

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
                <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateWorkout')}>
                  <Text style={styles.createButtonText}>Create Your First Workout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Feed</Text>
            {recentActivities.length > 0 ? (
              <View style={styles.activityFeed}>
                {recentActivities.map((item) => (
                  <View key={item._id}>{renderActivityItem({ item })}</View>
                ))}
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Discover')}>
                  <Text style={styles.viewAllText}>View All Activity</Text>
                  <Ionicons name="chevron-forward" size={16} color={PRIMARY_GREEN} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyActivity}>
                <Ionicons name="people-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No recent activity</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
  },
  headerTitleFit: {
    color: '#111827',
    fontWeight: '500',
  },
  headerTitleCommunity: {
    color: '#111827',
    fontWeight: '700',
  },
  bellButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionLabel: {
    fontSize: 12,
    color: PRIMARY_GREEN,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
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
    color: '#111827',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: PRIMARY_GREEN,
    fontWeight: '600',
  },
  exerciseList: {
    paddingRight: 20,
  },
  exerciseCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 160,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exerciseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
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
    backgroundColor: '#fef3c7',
  },
  exerciseTagText: {
    fontSize: 11,
    color: '#d97706',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyLibrary: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },
  createButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activityFeed: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityAvatarCompleted: {
    backgroundColor: PRIMARY_GREEN,
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  activityUser: {
    fontWeight: 'bold',
    color: '#111827',
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
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
    color: PRIMARY_GREEN,
    fontWeight: '600',
  },
  emptyActivity: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});
