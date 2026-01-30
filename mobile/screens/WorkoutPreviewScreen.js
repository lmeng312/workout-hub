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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

export default function WorkoutPreviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { parsedWorkout, sourceType, url, originalText } = route.params;
  
  const [workout, setWorkout] = useState(parsedWorkout);
  const [isPublic, setIsPublic] = useState(parsedWorkout.isPublic !== false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.post('/workouts/parse', {
        workoutData: {
          ...workout,
          isPublic
        },
        sourceType,
        url,
        text: originalText
      });
      
      Alert.alert('Success', 'Workout saved successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Library') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const updateExercise = (index, field, value) => {
    const updatedExercises = [...workout.exercises];
    if (field === 'name') {
      updatedExercises[index].name = value;
    } else if (field.startsWith('set_')) {
      const setIndex = parseInt(field.split('_')[1]);
      const prop = field.split('_')[2];
      if (updatedExercises[index].sets[setIndex]) {
        updatedExercises[index].sets[setIndex][prop] = parseInt(value) || 0;
      }
    }
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review Workout</Text>
        <Text style={styles.headerSubtitle}>
          Found {workout.exercises.length} exercises. Edit if needed before saving.
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

      {workout.description && (
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
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Exercises ({workout.exercises.length})</Text>
        {workout.exercises.map((exercise, exIndex) => (
          <View key={exIndex} style={styles.exerciseCard}>
            <TextInput
              style={styles.exerciseNameInput}
              value={exercise.name}
              onChangeText={(text) => updateExercise(exIndex, 'name', text)}
              placeholder="Exercise name"
            />
            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow}>
                <Text style={styles.setLabel}>Set {setIndex + 1}:</Text>
                {set.reps > 0 && (
                  <TextInput
                    style={styles.setInput}
                    value={set.reps.toString()}
                    onChangeText={(text) => updateExercise(exIndex, `set_${setIndex}_reps`, text)}
                    keyboardType="numeric"
                    placeholder="Reps"
                  />
                )}
                {set.duration > 0 && (
                  <TextInput
                    style={styles.setInput}
                    value={set.duration.toString()}
                    onChangeText={(text) => updateExercise(exIndex, `set_${setIndex}_duration`, text)}
                    keyboardType="numeric"
                    placeholder="Duration (sec)"
                  />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      {workout.tags && workout.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagsContainer}>
            {workout.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.privacyContainer}>
          <Text style={styles.privacyLabel}>Make workout public</Text>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={isPublic ? '#22c55e' : '#f3f4f6'}
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
            {saving ? 'Saving...' : 'Save Workout'}
          </Text>
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
    marginBottom: 8,
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
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exerciseNameInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  setLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 60,
  },
  setInput: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    width: 80,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagsContainer: {
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
