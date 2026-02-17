import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/Logo';

export default function FeedScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setError(null);
    try {
      const response = await api.get('/social/feed');
      setActivities(response.data);
    } catch (err) {
      console.error('Error loading feed:', err);
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout');
      const isNetworkError = err.message === 'Network Error' || err.code === 'ERR_NETWORK';
      let message = err.response?.data?.message || err.message || 'Failed to load feed';
      if (isTimeout) {
        message = 'The request took too long. Check that your device and computer are on the same WiFi, and that the backend is running.';
      } else if (isNetworkError) {
        message = "Can't reach the server. Make sure the backend is running (npm start in /backend), and that your IP in mobile/config.js matches your computer's WiFi IP. Use localhost:3000 for iOS Simulator.";
      }
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  const handleLike = async (workoutId, index) => {
    try {
      const activity = activities[index];
      const isLiked = activity.workout.likedBy?.includes(user?.id);
      
      if (isLiked) {
        await api.post(`/workouts/${workoutId}/unlike`);
      } else {
        await api.post(`/workouts/${workoutId}/like`);
      }
      
      // Update local state
      const updatedActivities = [...activities];
      if (isLiked) {
        updatedActivities[index].workout.likedBy = activity.workout.likedBy.filter(id => id !== user?.id);
      } else {
        updatedActivities[index].workout.likedBy = [...(activity.workout.likedBy || []), user?.id];
      }
      setActivities(updatedActivities);
    } catch (error) {
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleDuplicate = async (workoutId) => {
    try {
      const response = await api.post(`/workouts/${workoutId}/duplicate`);
      Alert.alert(
        'Success!',
        'Workout duplicated to your library',
        [
          { text: 'View in Library', onPress: () => navigation.navigate('Library') },
          { text: 'OK', style: 'cancel' }
        ]
      );
      loadFeed(); // Refresh feed
    } catch (error) {
      Alert.alert('Error', 'Failed to duplicate workout');
    }
  };

  const renderActivity = ({ item, index }) => {
    const isCompleted = item.type === 'completed';
    const workout = item.workout;
    const creator = item.user;
    const isLiked = workout.likedBy?.includes(user?.id);
    const likesCount = workout.likedBy?.length || 0;
    const completionsCount = workout.completedBy?.length || 0;

    // Get difficulty badge color
    const getDifficultyColor = () => {
      switch (workout.difficulty) {
        case 'beginner': return '#22c55e';
        case 'intermediate': return '#f59e0b';
        case 'advanced': return '#ef4444';
        default: return '#6b7280';
      }
    };

    return (
      <View style={styles.activityCard}>
        {/* Activity type badge */}
        <View style={[styles.activityTypeBadge, isCompleted ? styles.activityTypeBadgeCompleted : styles.activityTypeBadgeCreated]}>
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'add-circle'}
            size={14}
            color={isCompleted ? '#166534' : '#1d4ed8'}
          />
          <Text style={[styles.activityTypeText, isCompleted ? styles.activityTypeTextCompleted : styles.activityTypeTextCreated]}>
            {isCompleted ? 'Completed a workout' : 'Created a workout'}
          </Text>
        </View>

        {/* Card content: title, user, meta, description */}
        <TouchableOpacity
          style={styles.workoutContent}
          onPress={() => navigation.navigate('WorkoutDetail', { workoutId: workout._id })}
          activeOpacity={0.9}
        >
          <View style={styles.cardTopRow}>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.workoutTitle} numberOfLines={1}>{workout.title}</Text>
              <View style={styles.userRow}>
                <View style={styles.avatar}>
                  {creator?.profilePicture ? (
                    <Text style={styles.avatarText}>
                      {creator.displayName?.[0] || creator.username?.[0]}
                    </Text>
                  ) : (
                    <Ionicons name="person" size={20} color="#fff" />
                  )}
                </View>
                <Text style={styles.userName}>{creator?.displayName || creator?.username}</Text>
              </View>
              <Text style={styles.activityDate}>
                {formatTimeAgo(item.timestamp)}
              </Text>
            </View>
            <View style={styles.cardMeta}>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color="#111827" />
                <Text style={styles.metaText}>{workout.estimatedDuration || 25} min</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="barbell-outline" size={14} color="#111827" />
                <Text style={styles.metaText}>{workout.exercises?.length || 0} exercises</Text>
              </View>
            </View>
          </View>

          {workout.description ? (
            <Text style={styles.workoutDescription} numberOfLines={2}>
              {workout.description}
            </Text>
          ) : null}
        </TouchableOpacity>

        {/* Like & Comment row */}
        <View style={styles.likeCommentRow}>
          <TouchableOpacity
            style={styles.likeCommentButton}
            onPress={() => handleLike(workout._id, index)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color="#111827"
            />
            <Text style={styles.likeCommentLabel}>
              {likesCount === 0 ? 'Like' : `${likesCount} like${likesCount !== 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeCommentButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#111827" />
            <Text style={styles.likeCommentLabel}>
              {workout.commentCount > 0 ? `${workout.commentCount} comments` : 'Comment'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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

      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[styles.list, activities.length === 0 && { flexGrow: 1 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#22c55e" />
            ) : error ? (
              <>
                <Ionicons name="cloud-offline-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyText}>Couldn't load feed</Text>
                <Text style={styles.emptySubtext}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadFeed}>
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="people-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyText}>No activity in your feed</Text>
                <Text style={styles.emptySubtext}>
                  Complete workouts or follow friends to see activities here!
                </Text>
              </>
            )}
          </View>
        }
      />
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
  list: {
    padding: 16,
  },
  activityTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  activityTypeBadgeCreated: {},
  activityTypeBadgeCompleted: {},
  activityTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activityTypeTextCreated: {
    color: '#1d4ed8',
  },
  activityTypeTextCompleted: {
    color: '#166534',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutContent: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  activityDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  cardMeta: {
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 13,
    color: '#111827',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  likeCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  likeCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCommentLabel: {
    fontSize: 14,
    color: '#111827',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
