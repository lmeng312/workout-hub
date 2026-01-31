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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import SourcePreview from '../components/SourcePreview';

export default function FeedScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await api.get('/social/feed');
      setActivities(response.data);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed();
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
        {/* User Header */}
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {creator?.profilePicture ? (
                <Text style={styles.avatarText}>
                  {creator.displayName?.[0] || creator.username?.[0]}
                </Text>
              ) : (
                <Ionicons name="person" size={20} color="#22c55e" />
              )}
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>
                {creator?.displayName || creator?.username}
              </Text>
              <Text style={styles.activityDate}>
                {new Date(item.timestamp).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => handleLike(workout._id, index)}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color="#ef4444"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => handleDuplicate(workout._id)}
            >
              <Ionicons name="copy-outline" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Workout Card */}
        <TouchableOpacity
          style={styles.workoutContent}
          onPress={() => navigation.navigate('WorkoutDetail', { workoutId: workout._id })}
          activeOpacity={0.9}
        >
          {/* Title & Source Badge */}
          <View style={styles.workoutTitleRow}>
            <Text style={styles.workoutTitle}>{workout.title}</Text>
            <SourcePreview source={workout.source} variant="badge" />
          </View>

          {/* Description */}
          {workout.description && (
            <Text style={styles.workoutDescription} numberOfLines={2}>
              {workout.description}
            </Text>
          )}

          {/* Exercise List Preview */}
          <View style={styles.exercisesPreview}>
            {workout.exercises?.slice(0, 3).map((exercise, idx) => (
              <View key={idx} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets?.[0]?.reps && `${exercise.sets.length} × ${exercise.sets[0].reps}`}
                </Text>
              </View>
            ))}
            {workout.exercises?.length > 3 && (
              <Text style={styles.moreExercises}>
                +{workout.exercises.length - 3} more exercises
              </Text>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Ionicons name="barbell-outline" size={14} color="#94a3b8" />
              <Text style={styles.statText}>{workout.exercises?.length || 0} exercises</Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="time-outline" size={14} color="#94a3b8" />
              <Text style={styles.statText}>{workout.estimatedDuration || 25} min</Text>
            </View>
            {completionsCount > 0 && (
              <View style={[styles.statBadge, styles.completionsBadge]}>
                <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                <Text style={[styles.statText, styles.completionsText]}>
                  {completionsCount} {completionsCount === 1 ? 'completion' : 'completions'}
                </Text>
              </View>
            )}
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
                {workout.difficulty || 'intermediate'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Start Workout Button */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('WorkoutSession', { workout })}
          >
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Feed</Text>
        <Text style={styles.headerSubtitle}>See what your friends are doing</Text>
      </View>

      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No activity in your feed</Text>
            <Text style={styles.emptySubtext}>
              Complete workouts or follow friends to see activities here!
            </Text>
          </View>
        }
      />
    </View>
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
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  activityCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    backgroundColor: '#1e293b',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userTextContainer: {
    gap: 2,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  activityDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconButton: {
    padding: 4,
  },
  moreButton: {
    padding: 4,
  },
  workoutContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1e293b',
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 12,
  },
  exercisesPreview: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  exerciseName: {
    fontSize: 14,
    color: '#e2e8f0',
    flex: 1,
  },
  exerciseDetails: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  moreExercises: {
    fontSize: 13,
    color: '#22c55e',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  completionsBadge: {
    backgroundColor: '#166534',
    borderColor: '#22c55e',
  },
  completionsText: {
    color: '#dcfce7',
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#166534',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completionText: {
    fontSize: 13,
    color: '#dcfce7',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#1e293b',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#ef4444',
    fontWeight: '600',
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
