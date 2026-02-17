import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

export default function EditWorkoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { workout: initialWorkout } = route.params;
  
  const [workout, setWorkout] = useState(initialWorkout);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert string values back to numbers before saving
      const payload = {
        ...workout,
        exercises: workout.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((set) => ({
            ...set,
            reps: parseFloat(set.reps) || 0,
            weight: parseFloat(set.weight) || 0,
            duration: parseFloat(set.duration) || 0,
            rest: parseFloat(set.rest) || 60,
          })),
        })),
      };
      const response = await api.put(`/workouts/${workout._id}`, payload);
      
      Alert.alert('Success', 'Workout updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update workout');
    } finally {
      setSaving(false);
    }
  };

  const addExercise = () => {
    const updatedExercises = [
      ...workout.exercises,
      {
        name: '',
        sets: [{ reps: 10, weight: 0, duration: 0, rest: 60 }],
        notes: '',
        order: workout.exercises.length,
      },
    ];
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  const updateExercise = (index, field, value) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises[index][field] = value;
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  const deleteExercise = (index) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedExercises = workout.exercises.filter((_, i) => i !== index);
            setWorkout({ ...workout, exercises: updatedExercises });
          }
        }
      ]
    );
  };

  const addSet = (exerciseIndex) => {
    const updatedExercises = [...workout.exercises];
    const lastSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
    updatedExercises[exerciseIndex].sets.push({ ...lastSet });
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...workout.exercises];
    if (updatedExercises[exerciseIndex].sets.length > 1) {
      updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter(
        (_, idx) => idx !== setIndex
      );
      setWorkout({ ...workout, exercises: updatedExercises });
    }
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Workout</Text>
            <Text style={styles.headerSubtitle}>
              {workout.exercises.length} exercises
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Workout Title</Text>
            <TextInput
              style={styles.input}
              value={workout.title}
              onChangeText={(text) => setWorkout({ ...workout, title: text })}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={workout.description}
              onChangeText={(text) => setWorkout({ ...workout, description: text })}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Exercises ({workout.exercises.length})</Text>
              <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise}>
                <Ionicons name="add-circle" size={24} color="#22c55e" />
                <Text style={styles.addExerciseText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>
            
            {workout.exercises.map((exercise, exIndex) => (
              <View key={exIndex} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseNumber}>#{exIndex + 1}</Text>
                  <TouchableOpacity 
                    onPress={() => deleteExercise(exIndex)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.exerciseNameInput}
                  value={exercise.name}
                  onChangeText={(text) => updateExercise(exIndex, 'name', text)}
                  placeholder="Exercise name *"
                />

                <Text style={styles.setsLabel}>Sets</Text>
                <View style={styles.setsTable}>
                  <View style={styles.setsHeaderRow}>
                    <View style={styles.setsHeaderLabel} />
                    <View style={styles.setInputsRow}>
                      <Text style={styles.setsHeaderCell}>Reps</Text>
                      <Text style={styles.setsHeaderCell}>Wt (lbs)</Text>
                      <Text style={styles.setsHeaderCell}>Time (s)</Text>
                    </View>
                    <View style={styles.setsHeaderSpacer} />
                  </View>
                  {exercise.sets && exercise.sets.map((set, setIndex) => {
                    const prev = setIndex > 0 ? exercise.sets[setIndex - 1] : null;
                    return (
                      <View key={setIndex} style={styles.setRow}>
                      <Text style={styles.setNumber}>Set {setIndex + 1}</Text>
                      <View style={styles.setInputsRow}>
                        <TextInput
                          style={styles.smallInput}
                          placeholder={prev ? String(prev.reps ?? 10) : '10'}
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={set.reps === '' || set.reps === undefined ? '' : String(set.reps)}
                          onChangeText={(text) => updateSet(exIndex, setIndex, 'reps', text)}
                        />
                        <TextInput
                          style={styles.smallInput}
                          placeholder={prev ? String(prev.weight ?? 0) : '0'}
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={set.weight === '' || set.weight === undefined ? '' : String(set.weight)}
                          onChangeText={(text) => updateSet(exIndex, setIndex, 'weight', text)}
                        />
                        <TextInput
                          style={styles.smallInput}
                          placeholder={prev ? String(prev.duration ?? 0) : '0'}
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={set.duration === '' || set.duration === undefined ? '' : String(set.duration)}
                          onChangeText={(text) => updateSet(exIndex, setIndex, 'duration', text)}
                        />
                      </View>
                      {exercise.sets.length > 1 ? (
                        <TouchableOpacity
                          onPress={() => removeSet(exIndex, setIndex)}
                          style={styles.removeSetButton}
                        >
                          <Ionicons name="close-circle" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.removeSetPlaceholder} />
                      )}
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.addSetButton}
                  onPress={() => addSet(exIndex)}
                >
                  <Ionicons name="add" size={16} color="#22c55e" />
                  <Text style={styles.addSetText}>Add Set</Text>
                </TouchableOpacity>

                <TextInput
                  style={[styles.notesInput]}
                  value={exercise.notes || ''}
                  onChangeText={(text) => updateExercise(exIndex, 'notes', text)}
                  placeholder="Notes (optional)"
                />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.privacyContainer}>
              <Text style={styles.privacyLabel}>Make workout public</Text>
              <Switch
                value={workout.isPublic}
                onValueChange={(value) => setWorkout({ ...workout, isPublic: value })}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={workout.isPublic ? '#22c55e' : '#f3f4f6'}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addExerciseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exerciseNameInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  deleteButton: {
    padding: 4,
  },
  setsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  setsTable: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
  },
  setsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  setsHeaderLabel: {
    width: 40,
  },
  setsHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  setsHeaderSpacer: {
    width: 24,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  setNumber: {
    width: 40,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  setInputsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  smallInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlign: 'center',
  },
  removeSetButton: {
    width: 24,
    alignItems: 'center',
  },
  removeSetPlaceholder: {
    width: 24,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
