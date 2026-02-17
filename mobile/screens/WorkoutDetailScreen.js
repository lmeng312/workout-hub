import React, { useState, useEffect, useContext, useCallback } from 'react';
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
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
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

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  // Reload workout data when returning from Edit screen
  useFocusEffect(
    useCallback(() => {
      loadWorkout();
    }, [workoutId])
  );

  const loadWorkout = async () => {
    try {
      const response = await api.get(`/workouts/${workoutId}`);
      setWorkout(response.data);
      const currentUserId = user?.id;
      setIsSaved(response.data.isSaved || false);
      setIsCompleted(response.data.completedBy?.some(completion => completion.user?.toString() === currentUserId) || false);
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

  const formatSetsReps = (exercise) => {
    if (!exercise.sets || exercise.sets.length === 0) return '';
    const set = exercise.sets[0];
    if (set.duration > 0) return `${exercise.sets.length}x${set.duration} sec`;
    return `${exercise.sets.length}x${set.reps || 0}`;
  };

  return (
    <View style={styles.container}>
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{workout.title}</Text>
        <Text style={styles.subtitle}>
          Created by @{(workout.creator?.username || 'fituser')} - {workout.estimatedDuration || 45} min - {workout.exercises?.length || 0} exercises
        </Text>
      </View>

      {workout.exercises && workout.exercises.length > 0 ? (
        <View style={styles.exercisesContainer}>
          {workout.exercises.map((exercise, index) => {
            const isFirst = index === 0;
            const isLast = index === workout.exercises.length - 1;
            return (
              <View
                key={index}
                style={[
                  styles.exerciseCard,
                  isFirst && styles.exerciseCardHighlight,
                ]}
              >
                <View style={styles.exerciseRow}>
                  <Text style={[styles.exerciseName, isLast && styles.exerciseNameFaded]}>
                    {index + 1}. {exercise.name}
                  </Text>
                  {exercise.sets && exercise.sets.length > 0 && (
                    <Text style={[styles.exerciseReps, isFirst && styles.exerciseRepsHighlight, isLast && styles.exerciseNameFaded]}>
                      {formatSetsReps(exercise)}
                    </Text>
                  )}
                </View>
                {exercise.notes ? (
                  <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                ) : null}
              </View>
            );
          })}
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

      {workout.creator?._id === user?.id && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditWorkout', { workout })}
          >
            <Ionicons name="create-outline" size={20} color="#22c55e" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Spacer so content doesn't hide behind the sticky button */}
      <View style={{ height: 80 }} />
    </ScrollView>

    {/* Sticky Start Workout button */}
    <View style={styles.stickyButtonContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.startButton]}
        onPress={() => navigation.navigate('WorkoutSession', { workout })}
      >
        <Ionicons name="play-circle" size={20} color="#fff" />
        <Text style={styles.startButtonText}>Start Workout</Text>
      </TouchableOpacity>
    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContainer: {
    flex: 1,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  titleBlock: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  exercisesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  exerciseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exerciseCardHighlight: {
    borderColor: '#22c55e',
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  exerciseNameFaded: {
    color: '#9ca3af',
  },
  exerciseReps: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
  },
  exerciseRepsHighlight: {
    color: '#22c55e',
  },
  exerciseNotes: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyExercises: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
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
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
    color: '#111827',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
    borderColor: '#22c55e',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
  },
  saveButton: {
    backgroundColor: '#ffffff',
  },
  savedButton: {
    backgroundColor: '#22c55e',
  },
  completeButton: {
    backgroundColor: '#ffffff',
  },
  completedButton: {
    backgroundColor: '#22c55e',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
  },
  savedButtonText: {
    color: '#fff',
  },
  completedButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#ffffff',
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
