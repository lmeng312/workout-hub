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
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (mode === 'custom' && !title) {
      Alert.alert('Error', 'Please enter a workout title');
      return;
    }

    if ((mode === 'youtube' || mode === 'instagram') && !linkOrText) {
      Alert.alert('Error', `Please enter a ${mode === 'youtube' ? 'YouTube link' : 'Instagram caption'}`);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'custom') {
        // For custom workouts, you'd need to build an exercise builder UI
        // For now, create a basic workout structure
        const workout = {
          title,
          description,
          isPublic,
          exercises: [],
          tags: [],
        };
        const response = await api.post('/workouts', workout);
        navigation.goBack();
      } else {
        // Parse from YouTube or Instagram - show preview first
        const response = await api.post('/workouts/parse/preview', {
          text: linkOrText,
          sourceType: mode,
          url: mode === 'youtube' ? linkOrText : '',
        });

        if (response.data.success && response.data.workout) {
          // Navigate to preview screen
          navigation.navigate('WorkoutPreview', {
            parsedWorkout: response.data.workout,
            sourceType: mode,
            url: mode === 'youtube' ? linkOrText : '',
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
    <ScrollView style={styles.container}>
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'custom' && styles.modeButtonActive]}
          onPress={() => setMode('custom')}
        >
          <Text style={[styles.modeText, mode === 'custom' && styles.modeTextActive]}>
            Custom
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'youtube' && styles.modeButtonActive]}
          onPress={() => setMode('youtube')}
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
          onPress={() => setMode('instagram')}
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
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.note}>
            Note: Full exercise builder coming soon. For now, you can create a basic workout and edit it later.
          </Text>
        </>
      ) : (
        <View>
          <Text style={styles.label}>
            {mode === 'youtube' ? 'YouTube Link' : 'Instagram Caption'}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={
              mode === 'youtube'
                ? 'Paste YouTube link here...'
                : 'Paste Instagram caption with workout details...'
            }
            value={linkOrText}
            onChangeText={setLinkOrText}
            multiline
            numberOfLines={6}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            {mode === 'youtube'
              ? 'The app will extract workout information from the video title and description.'
              : 'Paste the caption text that contains exercise names, sets, and reps.'}
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
          {loading ? 'Creating...' : 'Create Workout'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
    gap: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  modeButtonActive: {
    backgroundColor: '#22c55e',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  modeTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    marginBottom: 16,
  },
  note: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
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
