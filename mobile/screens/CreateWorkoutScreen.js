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
              idx === setIndex ? { ...set, [field]: parseFloat(value) || 0 } : set
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
            sets: ex.sets,
            notes: ex.notes,
            order: idx,
          })),
          tags: [],
        };
        const response = await api.post('/workouts', workout);
        Alert.alert('Success', 'Workout created!');
        navigation.goBack();
      } else {
        // Parse from YouTube or Instagram - show preview first
        const url = mode === 'youtube' ? linkOrText : instagramUrl;
        const response = await api.post('/workouts/parse/preview', {
          text: linkOrText,
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
      Alert.alert('Error', error.response?.data?.message || 'Failed to create workout');
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
            placeholderTextColor="#64748b"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            placeholderTextColor="#64748b"
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
                placeholderTextColor="#64748b"
                value={exercise.name}
                onChangeText={(value) => updateExercise(exercise.id, 'name', value)}
              />

              <Text style={styles.setsLabel}>Sets</Text>
              {exercise.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={styles.setNumber}>Set {setIndex + 1}</Text>
                  <View style={styles.setInputs}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Reps</Text>
                      <TextInput
                        style={styles.smallInput}
                        placeholder="10"
                        keyboardType="numeric"
                        value={set.reps.toString()}
                        onChangeText={(value) =>
                          updateSet(exercise.id, setIndex, 'reps', value)
                        }
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Weight (lbs)</Text>
                      <TextInput
                        style={styles.smallInput}
                        placeholder="0"
                        keyboardType="numeric"
                        value={set.weight.toString()}
                        onChangeText={(value) =>
                          updateSet(exercise.id, setIndex, 'weight', value)
                        }
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Duration (s)</Text>
                      <TextInput
                        style={styles.smallInput}
                        placeholder="0"
                        keyboardType="numeric"
                        value={set.duration.toString()}
                        onChangeText={(value) =>
                          updateSet(exercise.id, setIndex, 'duration', value)
                        }
                      />
                    </View>
                  </View>
                  {exercise.sets.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeSet(exercise.id, setIndex)}
                      style={styles.removeSetButton}
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

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
                placeholderTextColor="#64748b"
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
            placeholderTextColor="#64748b"
            value={linkOrText}
            onChangeText={setLinkOrText}
            multiline
            numberOfLines={3}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            The app will extract workout information from the video title and description.
          </Text>
        </View>
      ) : (
        <View>
          <View style={styles.instructionBox}>
            <View style={styles.instructionHeader}>
              <Ionicons name="information-circle" size={20} color="#6366f1" />
              <Text style={styles.instructionTitle}>How to import from Instagram</Text>
            </View>
            <View style={styles.instructionSteps}>
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Tap Share (•••) on the Instagram post</Text>
              </View>
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Select "Copy Link" and paste below</Text>
              </View>
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Copy the caption text and paste it too</Text>
              </View>
            </View>
          </View>

          <Text style={styles.label}>
            <Ionicons name="link" size={14} color="#fff" /> Step 1: Post Link
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Paste Instagram link here..."
            placeholderTextColor="#64748b"
            value={instagramUrl}
            onChangeText={setInstagramUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>
            <Ionicons name="chatbox-ellipses" size={14} color="#fff" /> Step 2: Caption Text
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Paste the workout caption here...

Example:
Full Body HIIT 🔥
1. Burpees - 3x15
2. Push-ups - 3x20
3. Squats - 3x25"
            placeholderTextColor="#64748b"
            value={linkOrText}
            onChangeText={setLinkOrText}
            multiline
            numberOfLines={8}
          />
          <Text style={styles.successHint}>
            <Ionicons name="checkmark-circle" size={12} color="#22c55e" /> The app will extract exercises, sets, and reps automatically
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
    backgroundColor: '#0f172a',
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
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    minHeight: 48,
  },
  modeButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
    flexShrink: 1,
    textAlign: 'center',
    numberOfLines: 1,
  },
  modeTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#fff',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: -8,
    marginBottom: 24,
  },
  successHint: {
    fontSize: 12,
    color: '#22c55e',
    marginTop: 4,
    marginBottom: 24,
  },
  note: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  instructionBox: {
    backgroundColor: '#312e81',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c7d2fe',
  },
  instructionSteps: {
    gap: 8,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepText: {
    fontSize: 13,
    color: '#e0e7ff',
    flex: 1,
    paddingTop: 2,
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
    color: '#fff',
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
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
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
    backgroundColor: '#166534',
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
    color: '#fff',
    marginTop: 8,
    marginBottom: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
  },
  setNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    width: 45,
    paddingTop: 20,
  },
  setInputs: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  inputGroup: {
    flex: 1,
    alignItems: 'stretch',
  },
  inputLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 4,
    textAlign: 'center',
  },
  smallInput: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    textAlign: 'center',
    color: '#fff',
  },
  removeSetButton: {
    padding: 4,
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
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
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
