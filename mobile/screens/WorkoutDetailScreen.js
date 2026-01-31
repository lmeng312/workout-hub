import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import SourcePreview from '../components/SourcePreview';

export default function WorkoutDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      const response = await api.get(`/workouts/${workoutId}`);
      setWorkout(response.data);
      const currentUserId = user?.id;
      setIsSaved(response.data.savedBy?.some(userId => userId.toString() === currentUserId) || false);
      setIsCompleted(response.data.completedBy?.some(completion => completion.user?.toString() === currentUserId) || false);
      setIsFavorited(response.data.isFavorited || false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load workout');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await api.post(`/workouts/${workoutId}/unsave`);
        setIsSaved(false);
      } else {
        await api.post(`/workouts/${workoutId}/save`);
        setIsSaved(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update save status');
    }
  };

  const handleFavorite = async () => {
    try {
      if (isFavorited) {
        await api.post(`/workouts/${workoutId}/unfavorite`);
        setIsFavorited(false);
      } else {
        await api.post(`/workouts/${workoutId}/favorite`);
        setIsFavorited(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleComplete = async () => {
    try {
      await api.post(`/workouts/${workoutId}/complete`);
      setIsCompleted(true);
      Alert.alert('Success', 'Workout marked as completed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark workout as completed');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/workouts/${workoutId}`);
              Alert.alert('Success', 'Workout deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  if (loading || !workout) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{workout.title}</Text>
            {workout.isPublic ? (
              <Ionicons name="globe-outline" size={20} color="#22c55e" />
            ) : (
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.favoriteButtonTop}
              onPress={handleFavorite}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={28}
                color="#ef4444"
              />
            </TouchableOpacity>
            {workout.creator?._id === user?.id && (
              <TouchableOpacity
                style={styles.editButtonTop}
                onPress={() => navigation.navigate('EditWorkout', { workout })}
              >
                <Ionicons name="create-outline" size={24} color="#22c55e" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {workout.creator && (
          <View style={styles.creatorInfo}>
            <Ionicons name="person-outline" size={16} color="#94a3b8" />
            <Text style={styles.creatorText}>
              {workout.creator.displayName || workout.creator.username}
            </Text>
          </View>
        )}
        {workout.description && (
          <Text style={styles.description}>{workout.description}</Text>
        )}
        
        <SourcePreview source={workout.source} variant="full" />
      </View>

      {workout.exercises && workout.exercises.length > 0 ? (
        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {workout.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseNameContainer}>
                  {exercise.image && (
                    <Image
                      source={{ uri: exercise.image }}
                      style={styles.exerciseImage}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                </View>
                <Text style={styles.exerciseOrder}>{index + 1}</Text>
              </View>
              {exercise.sets && exercise.sets.length > 0 && (
                <View style={styles.setsContainer}>
                  {exercise.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setItem}>
                      <Text style={styles.setText}>
                        Set {setIndex + 1}: {set.reps} reps
                        {set.weight > 0 && ` @ ${set.weight}lbs`}
                        {set.duration > 0 && ` (${set.duration}s)`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {exercise.notes && (
                <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyExercises}>
          <Ionicons name="barbell-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No exercises added yet</Text>
          <Text style={styles.emptySubtext}>Edit this workout to add exercises</Text>
        </View>
      )}

      {workout.tags && workout.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsList}>
            {workout.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Activity Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Activity</Text>
        <View style={styles.statsGrid}>
          {workout.completedBy && workout.completedBy.length > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
              <Text style={styles.statValue}>{workout.completedBy.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.startButton]}
          onPress={() => navigation.navigate('WorkoutSession', { workout })}
        >
          <Ionicons name="play-circle" size={20} color="#fff" />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>

      {workout.creator?._id === user?.id && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Delete Workout</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoriteButtonTop: {
    padding: 4,
  },
  editButtonTop: {
    padding: 4,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  creatorText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  description: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
    marginBottom: 4,
  },
  exercisesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  exerciseOrder: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    backgroundColor: '#166534',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  setsContainer: {
    marginTop: 8,
  },
  setItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  setText: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  exerciseNotes: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyExercises: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  tagsContainer: {
    padding: 16,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#166534',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 14,
    color: '#dcfce7',
    fontWeight: '500',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#22c55e',
    backgroundColor: '#1e293b',
  },
  startButton: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#1e293b',
    borderColor: '#22c55e',
  },
  saveButton: {
    backgroundColor: '#1e293b',
  },
  savedButton: {
    backgroundColor: '#22c55e',
  },
  favoriteButton: {
    backgroundColor: '#1e293b',
    borderColor: '#ef4444',
  },
  favoritedButton: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  completeButton: {
    backgroundColor: '#1e293b',
  },
  completedButton: {
    backgroundColor: '#22c55e',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
  },
  favoriteButtonText: {
    color: '#ef4444',
  },
  favoritedButtonText: {
    color: '#fff',
  },
  savedButtonText: {
    color: '#fff',
  },
  completedButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#1e293b',
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
