import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

export default function CreateWorkoutScreen() {
  const navigation = useNavigation();
  const [mode, setMode] = useState('custom'); // 'custom', 'youtube', 'instagram'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkOrText, setLinkOrText] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Exercise builder state
  const [exercises, setExercises] = useState([]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: Date.now().toString(),
        name: '',
        sets: [{ reps: 10, weight: 0, duration: 0, rest: 60 }],
        notes: '',
        order: exercises.length,
      },
    ]);
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const updateExercise = (id, field, value) => {
    setExercises(
      exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const addSet = (exerciseId) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 0, duration: 0, rest: 60 };
          return {
            ...ex,
            sets: [...ex.sets, { ...lastSet }],
          };
        }
        return ex;
      })
    );
  };

  const removeSet = (exerciseId, setIndex) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId && ex.sets.length > 1) {
          return {
            ...ex,
            sets: ex.sets.filter((_, idx) => idx !== setIndex),
          };
        }
        return ex;
      })
    );
  };

  const updateSet = (exerciseId, setIndex, field, value) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((set, idx) =>
              idx === setIndex ? { ...set, [field]: value } : set
            ),
          };
        }
        return ex;
      })
    );
  };

  const handleCreate = async () => {
    if (mode === 'custom' && !title) {
      Alert.alert('Error', 'Please enter a workout title');
      return;
    }

    if (mode === 'custom' && exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    if (mode === 'custom' && exercises.some(ex => !ex.name.trim())) {
      Alert.alert('Error', 'Please name all exercises');
      return;
    }

    if (mode === 'youtube' && !linkOrText) {
      Alert.alert('Error', 'Please enter a YouTube link');
      return;
    }

    if (mode === 'instagram' && (!instagramUrl || !linkOrText)) {
      Alert.alert('Error', 'Please enter both Instagram URL and caption text');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'custom') {
        const workout = {
          title,
          description,
          isPublic,
          exercises: exercises.map((ex, idx) => ({
            name: ex.name,
            sets: ex.sets.map((set) => ({
              reps: parseFloat(set.reps) || 0,
              weight: parseFloat(set.weight) || 0,
              duration: parseFloat(set.duration) || 0,
              rest: parseFloat(set.rest) || 60,
            })),
            notes: ex.notes,
            order: idx,
          })),
          tags: [],
        };
        const response = await api.post('/workouts', workout);
        Alert.alert('Success', 'Workout created!', [
          { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Library' }) }
        ]);
      } else {
        // Parse from YouTube or Instagram - show preview first
        const url = (mode === 'youtube' ? linkOrText : instagramUrl).trim();
        const response = await api.post('/workouts/parse/preview', {
          text: linkOrText.trim(),
          sourceType: mode,
          url: url,
        });

        if (response.data.success && response.data.workout) {
          // Navigate to preview screen
          navigation.navigate('WorkoutPreview', {
            parsedWorkout: response.data.workout,
            sourceType: mode,
            url: url,
            originalText: linkOrText,
          });
        } else {
          Alert.alert('Error', response.data.message || 'Failed to parse workout');
        }
      }
    } catch (error) {
      const isNetworkError = error.message === 'Network Error' || error.code === 'ERR_NETWORK';
      const message = isNetworkError
        ? "Can't reach the server. Ensure the backend is running and mobile/config.js has the correct API URL for your setup."
        : (error.response?.data?.message || error.message || 'Failed to create workout');
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={styles.container}>
        <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'custom' && styles.modeButtonActive]}
          onPress={() => {
            setMode('custom');
            setLinkOrText('');
            setInstagramUrl('');
          }}
        >
          <Text style={[styles.modeText, mode === 'custom' && styles.modeTextActive]}>
            Custom
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'youtube' && styles.modeButtonActive]}
          onPress={() => {
            setMode('youtube');
            setLinkOrText('');
            setInstagramUrl('');
          }}
        >
          <Ionicons
            name="logo-youtube"
            size={20}
            color={mode === 'youtube' ? '#fff' : '#22c55e'}

          />
          <Text style={[styles.modeText, mode === 'youtube' && styles.modeTextActive]}>
            YouTube
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'instagram' && styles.modeButtonActive]}
          onPress={() => {
            setMode('instagram');
            setLinkOrText('');
            setInstagramUrl('');
          }}
        >
          <Ionicons
            name="logo-instagram"
            size={20}
            color={mode === 'instagram' ? '#fff' : '#22c55e'}

          />
          <Text style={[styles.modeText, mode === 'instagram' && styles.modeTextActive]}>
            Instagram
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'custom' ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Workout Title *"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise}>
              <Ionicons name="add-circle" size={24} color="#22c55e" />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {exercises.map((exercise, exerciseIndex) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseNumber}>#{exerciseIndex + 1}</Text>
                <TouchableOpacity
                  onPress={() => removeExercise(exercise.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Exercise Name *"
                placeholderTextColor="#9ca3af"
                value={exercise.name}
                onChangeText={(value) => updateExercise(exercise.id, 'name', value)}
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
                {exercise.sets.map((set, setIndex) => {
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
                        onChangeText={(value) =>
                          updateSet(exercise.id, setIndex, 'reps', value)
                        }
                      />
                      <TextInput
                        style={styles.smallInput}
                        placeholder={prev ? String(prev.weight ?? 0) : '0'}
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={set.weight === '' || set.weight === undefined ? '' : String(set.weight)}
                        onChangeText={(value) =>
                          updateSet(exercise.id, setIndex, 'weight', value)
                        }
                      />
                      <TextInput
                        style={styles.smallInput}
                        placeholder={prev ? String(prev.duration ?? 0) : '0'}
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={set.duration === '' || set.duration === undefined ? '' : String(set.duration)}
                        onChangeText={(value) =>
                          updateSet(exercise.id, setIndex, 'duration', value)
                        }
                      />
                    </View>
                    {exercise.sets.length > 1 ? (
                      <TouchableOpacity
                        onPress={() => removeSet(exercise.id, setIndex)}
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
                onPress={() => addSet(exercise.id)}
              >
                <Ionicons name="add" size={16} color="#22c55e" />
                <Text style={styles.addSetText}>Add Set</Text>
              </TouchableOpacity>

              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="Notes (optional)"
                placeholderTextColor="#9ca3af"
                value={exercise.notes}
                onChangeText={(value) => updateExercise(exercise.id, 'notes', value)}
              />
            </View>
          ))}

          {exercises.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No exercises added yet</Text>
              <Text style={styles.emptySubtext}>Tap "Add Exercise" to get started</Text>
            </View>
          )}
        </>
      ) : mode === 'youtube' ? (
        <View>
          <Text style={styles.label}>YouTube Link</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Paste YouTube link here..."
            placeholderTextColor="#9ca3af"
            value={linkOrText}
            onChangeText={setLinkOrText}
            multiline
            numberOfLines={3}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            Workout information will be extracted from the post content.
          </Text>
        </View>
      ) : (
        <View>
          <Text style={styles.label}>
            <Ionicons name="link" size={14} color="#111827" /> Step 1: Post Link
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Paste Instagram link here..."
            placeholderTextColor="#9ca3af"
            value={instagramUrl}
            onChangeText={setInstagramUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>
            <Ionicons name="chatbox-ellipses" size={14} color="#111827" /> Step 2: Caption Text
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Paste the workout caption here...

Example:
Full Body HIIT 🔥
1. Burpees - 3x15
2. Push-ups - 3x20
3. Squats - 3x25"
            placeholderTextColor="#9ca3af"
            value={linkOrText}
            onChangeText={setLinkOrText}
            multiline
            numberOfLines={8}
          />
          <Text style={styles.hint}>
            Workout information will be extracted from the post content.
          </Text>
        </View>
      )}

      <View style={styles.privacyContainer}>
        <Text style={styles.privacyLabel}>Make workout public</Text>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ false: '#d1d5db', true: '#86efac' }}
          thumbColor={isPublic ? '#22c55e' : '#f3f4f6'}
        />
      </View>

      <TouchableOpacity
        style={[styles.createButton, loading && styles.createButtonDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={styles.createButtonText}>
          {loading ? 'Creating...' : mode === 'custom' ? 'Create Workout' : 'Preview Workout'}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#22c55e',
    minHeight: 48,
  },
  modeButtonActive: {
    backgroundColor: '#22c55e',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
    flexShrink: 1,
    textAlign: 'center',
    numberOfLines: 1,
  },
  modeTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -8,
    marginBottom: 24,
  },
  note: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
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
  exerciseCard: {
    backgroundColor: '#ffffff',
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
  removeButton: {
    padding: 4,
  },
  setsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
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
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlign: 'center',
    color: '#111827',
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
    marginTop: 4,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
