import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

export default function WorkoutSessionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { workout } = route.params;
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [restDuration, setRestDuration] = useState(60); // default 60s

  const adjustRestTime = (delta) => {
    setRestDuration(prev => Math.max(5, prev + delta));
  };

  const startManualRest = () => {
    setRestTimeRemaining(restDuration);
    setIsResting(true);
  };

  // Main timer
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Rest timer
  useEffect(() => {
    if (!isResting || isPaused) return;

    const interval = setInterval(() => {
      setRestTimeRemaining(prev => {
        if (prev <= 1) {
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteExercise = (index) => {
    if (completedExercises.includes(index)) {
      setCompletedExercises(completedExercises.filter(i => i !== index));
      // When deselecting, show the deselected exercise as current in the main view and list
      setCurrentExerciseIndex(index);
    } else {
      setCompletedExercises([...completedExercises, index]);
      
      // Start rest timer using the user's chosen rest duration
      setRestTimeRemaining(restDuration);
      setIsResting(true);
      
      // Move to next exercise
      if (index === currentExerciseIndex && index < workout.exercises.length - 1) {
        setCurrentExerciseIndex(index + 1);
      }
    }
  };

  const handleFinishWorkout = async () => {
    const completionRate = (completedExercises.length / workout.exercises.length * 100).toFixed(0);
    
    Alert.alert(
      'Finish Workout?',
      `You completed ${completedExercises.length}/${workout.exercises.length} exercises (${completionRate}%)\nTime: ${formatTime(elapsedTime)}`,
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            try {
              await api.post(`/workouts/${workout._id}/complete`, { durationSeconds: elapsedTime });
              Alert.alert('Great job!', `Workout completed in ${formatTime(elapsedTime)}`, [
                { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Discover' }) }
              ]);
            } catch (error) {
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  const currentExercise = workout.exercises[currentExerciseIndex];
  const progress = (completedExercises.length / workout.exercises.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header with timer and progress */}
      <View style={styles.header}>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={24} color="#22c55e" />
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        </View>
        <TouchableOpacity onPress={() => setIsPaused(!isPaused)} style={styles.pauseButton}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedExercises.length}/{workout.exercises.length} exercises
        </Text>
      </View>

      {/* Rest timer overlay */}
      {isResting && (
        <View style={styles.restOverlay}>
          <Text style={styles.restTitle}>Rest Time</Text>
          <Text style={styles.restTimer}>{formatTime(restTimeRemaining)}</Text>
          <View style={styles.restAdjustRow}>
            <TouchableOpacity style={styles.restAdjustButton} onPress={() => setRestTimeRemaining(prev => Math.max(0, prev - 15))}>
              <Text style={styles.restAdjustText}>-15s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.restAdjustButton} onPress={() => setRestTimeRemaining(prev => prev + 15)}>
              <Text style={styles.restAdjustText}>+15s</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.skipRestButton}
            onPress={() => setIsResting(false)}
          >
            <Text style={styles.skipRestText}>Skip Rest</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Current exercise highlight */}
      {!isResting && currentExercise && (
        <View style={styles.currentExerciseCard}>
          <Text style={styles.currentLabel}>CURRENT EXERCISE</Text>
          <Text style={styles.currentName}>{currentExercise.name}</Text>
          {currentExercise.sets && currentExercise.sets[0] && (
            <View style={styles.currentDetails}>
              {currentExercise.sets[0].duration > 0 ? (
                <Text style={styles.currentDetailText}>
                  {currentExercise.sets[0].duration}s duration
                </Text>
              ) : (
                <Text style={styles.currentDetailText}>
                  {currentExercise.sets[0].reps} reps
                </Text>
              )}
              {currentExercise.sets.length > 1 && (
                <Text style={styles.currentDetailText}>
                  × {currentExercise.sets.length} sets
                </Text>
              )}
            </View>
          )}
          {/* Rest time setter */}
          <View style={styles.restSetterContainer}>
            <Text style={styles.restSetterLabel}>Rest after exercise</Text>
            <View style={styles.restSetterControls}>
              <TouchableOpacity style={styles.restSetterButton} onPress={() => adjustRestTime(-15)}>
                <Ionicons name="remove" size={18} color="#166534" />
              </TouchableOpacity>
              <Text style={styles.restSetterValue}>{restDuration}s</Text>
              <TouchableOpacity style={styles.restSetterButton} onPress={() => adjustRestTime(15)}>
                <Ionicons name="add" size={18} color="#166534" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.currentButtonsRow}>
            <TouchableOpacity
              style={styles.completeCurrentButton}
              onPress={() => handleCompleteExercise(currentExerciseIndex)}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.completeCurrentText}>Mark Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.startRestButton}
              onPress={startManualRest}
            >
              <Ionicons name="timer-outline" size={20} color="#166534" />
              <Text style={styles.startRestText}>Rest</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Exercise list */}
      <ScrollView style={styles.exerciseList}>
        <Text style={styles.listTitle}>All Exercises</Text>
        {workout.exercises.map((exercise, index) => {
          const isCompleted = completedExercises.includes(index);
          const isCurrent = index === currentExerciseIndex;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.exerciseItem,
                isCompleted && styles.exerciseItemCompleted,
                isCurrent && styles.exerciseItemCurrent,
              ]}
              onPress={() => handleCompleteExercise(index)}
            >
              <View style={styles.exerciseItemLeft}>
                <View style={[
                  styles.checkbox,
                  isCompleted && styles.checkboxCompleted
                ]}>
                  {isCompleted && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.exerciseItemInfo}>
                  <Text style={[
                    styles.exerciseItemName,
                    isCompleted && styles.exerciseItemNameCompleted
                  ]}>
                    {exercise.name}
                  </Text>
                  {exercise.sets && exercise.sets[0] && (
                    <Text style={styles.exerciseItemDetails}>
                      {exercise.sets[0].duration > 0 
                        ? `${exercise.sets[0].duration}s`
                        : `${exercise.sets[0].reps} reps`}
                      {exercise.sets.length > 1 && ` × ${exercise.sets.length}`}
                    </Text>
                  )}
                </View>
              </View>
              {isCurrent && !isCompleted && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Finish button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishWorkout}
        >
          <Ionicons name="checkmark-done" size={24} color="#fff" />
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  pauseButton: {
    padding: 8,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  restOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(34, 197, 94, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  restTimer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 32,
  },
  restAdjustRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  restAdjustButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  restAdjustText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skipRestButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  skipRestText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  currentExerciseCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#dcfce7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
    letterSpacing: 1,
  },
  currentExerciseImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  currentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  currentDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  currentDetailText: {
    fontSize: 16,
    color: '#166534',
    fontWeight: '500',
  },
  restSetterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#bbf7d0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  restSetterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  restSetterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  restSetterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restSetterValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    minWidth: 40,
    textAlign: 'center',
  },
  currentButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  completeCurrentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 12,
  },
  completeCurrentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  startRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  startRestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  exerciseList: {
    flex: 1,
    padding: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exerciseItemCurrent: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  exerciseItemCompleted: {
    backgroundColor: '#f9fafb',
    opacity: 0.7,
  },
  exerciseItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  exerciseItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  exerciseItemInfo: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  exerciseItemNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  exerciseItemDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  currentBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 12,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
