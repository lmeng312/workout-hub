import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
          {workout.creator?._id === user?.id && (
            <TouchableOpacity
              style={styles.editButtonTop}
              onPress={() => navigation.navigate('EditWorkout', { workout })}
            >
              <Ionicons name="create-outline" size={24} color="#22c55e" />
            </TouchableOpacity>
          )}
        </View>
        {workout.creator && (
          <View style={styles.creatorInfo}>
            <Ionicons name="person-outline" size={16} color="#6b7280" />
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
                <Text style={styles.exerciseName}>{exercise.name}</Text>
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

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.startButton]}
          onPress={() => navigation.navigate('WorkoutSession', { workout })}
        >
          <Ionicons name="play-circle" size={20} color="#fff" />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton, isSaved && styles.savedButton]}
          onPress={handleSave}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? '#fff' : '#22c55e'}
          />
          <Text style={[styles.actionButtonText, isSaved && styles.savedButtonText]}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton, isCompleted && styles.completedButton]}
          onPress={handleComplete}
          disabled={isCompleted}
        >
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={20}
            color={isCompleted ? '#fff' : '#22c55e'}
          />
          <Text style={[styles.actionButtonText, isCompleted && styles.completedButtonText]}>
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </Text>
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
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    color: '#111827',
    flex: 1,
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
    color: '#6b7280',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 4,
  },
  exercisesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  exerciseOrder: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    backgroundColor: '#dcfce7',
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
    borderBottomColor: '#f3f4f6',
  },
  setText: {
    fontSize: 14,
    color: '#374151',
  },
  exerciseNotes: {
    fontSize: 12,
    color: '#6b7280',
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
    backgroundColor: '#fff',
    borderColor: '#22c55e',
  },
  saveButton: {
    backgroundColor: '#fff',
  },
  savedButton: {
    backgroundColor: '#22c55e',
  },
  completeButton: {
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
