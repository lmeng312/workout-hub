import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';
import VideoEmbed from '../components/VideoEmbed';

export default function WorkoutSessionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { workout } = route.params;
  const scrollRef = useRef(null);
  const itemPositions = useRef({});

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [restDuration, setRestDuration] = useState(60);

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

  const scrollToExercise = (index) => {
    const y = itemPositions.current[index];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 8), animated: true });
    }
  };

  const navigateToExercise = (index) => {
    setCurrentExerciseIndex(index);
    scrollToExercise(index);
  };

  const handleCompleteExercise = (index) => {
    if (completedExercises.includes(index)) {
      setCompletedExercises(completedExercises.filter(i => i !== index));
      setCurrentExerciseIndex(index);
    } else {
      setCompletedExercises([...completedExercises, index]);
      setRestTimeRemaining(restDuration);
      setIsResting(true);

      if (index === currentExerciseIndex && index < workout.exercises.length - 1) {
        const nextIndex = index + 1;
        setCurrentExerciseIndex(nextIndex);
        setTimeout(() => scrollToExercise(nextIndex), 300);
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
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'Finish Workout',
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

  const progress = (completedExercises.length / workout.exercises.length) * 100;

  const formatExerciseDetail = (exercise) => {
    if (!exercise.sets || !exercise.sets[0]) return null;
    const set = exercise.sets[0];
    const count = exercise.sets.length;
    if (set.duration > 0) {
      return `${set.duration}s${count > 1 ? ` × ${count} sets` : ''}`;
    }
    return `${set.reps} reps${count > 1 ? ` × ${count} sets` : ''}`;
  };

  return (
    <View style={styles.container}>
      {/* Header with timer and progress */}
      <View style={styles.header}>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color="#22c55e" />
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        </View>
        <View style={styles.progressPill}>
          <Text style={styles.progressPillText}>
            {completedExercises.length}/{workout.exercises.length}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsPaused(!isPaused)} style={styles.pauseButton}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={20} color="#22c55e" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
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

      {/* Full exercise list — current exercise expanded inline */}
      <ScrollView ref={scrollRef} style={styles.exerciseList} contentContainerStyle={styles.exerciseListContent}>
        {/* Source video (collapsible) */}
        {workout.source && workout.source.type !== 'custom' && (
          <VideoEmbed source={workout.source} collapsible />
        )}

        {workout.exercises.map((exercise, index) => {
          const isCompleted = completedExercises.includes(index);
          const isCurrent = index === currentExerciseIndex;
          const detail = formatExerciseDetail(exercise);

          return (
            <View
              key={index}
              onLayout={(e) => { itemPositions.current[index] = e.nativeEvent.layout.y; }}
            >
              {isCurrent && !isCompleted ? (
                /* Expanded current exercise card */
                <View style={styles.currentCard}>
                  <View style={styles.currentCardHeader}>
                    <View style={styles.currentNumberBadge}>
                      <Text style={styles.currentNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.currentCardHeaderText}>
                      <Text style={styles.currentCardName}>{exercise.name}</Text>
                      {detail && <Text style={styles.currentCardDetail}>{detail}</Text>}
                    </View>
                  </View>
                  {exercise.notes ? (
                    <Text style={styles.currentCardNotes}>{exercise.notes}</Text>
                  ) : null}

                  {/* Rest time setter */}
                  <View style={styles.restSetterContainer}>
                    <Text style={styles.restSetterLabel}>Rest</Text>
                    <View style={styles.restSetterControls}>
                      <TouchableOpacity style={styles.restSetterButton} onPress={() => adjustRestTime(-15)}>
                        <Ionicons name="remove" size={16} color="#166534" />
                      </TouchableOpacity>
                      <Text style={styles.restSetterValue}>{restDuration}s</Text>
                      <TouchableOpacity style={styles.restSetterButton} onPress={() => adjustRestTime(15)}>
                        <Ionicons name="add" size={16} color="#166534" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.currentButtonsRow}>
                    <TouchableOpacity
                      style={styles.completeCurrentButton}
                      onPress={() => handleCompleteExercise(index)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.completeCurrentText}>Done</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.manualRestButton}
                      onPress={startManualRest}
                    >
                      <Ionicons name="timer-outline" size={18} color="#166534" />
                      <Text style={styles.manualRestText}>Rest</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* Compact exercise row */
                <TouchableOpacity
                  style={[
                    styles.exerciseRow,
                    isCompleted && styles.exerciseRowCompleted,
                  ]}
                  onPress={() => isCompleted ? handleCompleteExercise(index) : navigateToExercise(index)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    ) : (
                      <Text style={styles.exerciseNumber}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.exerciseRowInfo}>
                    <Text
                      style={[styles.exerciseRowName, isCompleted && styles.exerciseRowNameCompleted]}
                      numberOfLines={1}
                    >
                      {exercise.name}
                    </Text>
                    {detail && (
                      <Text style={styles.exerciseRowDetail}>{detail}</Text>
                    )}
                  </View>
                  {!isCompleted && (
                    <TouchableOpacity
                      style={styles.quickCompleteButton}
                      onPress={() => handleCompleteExercise(index)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="checkmark-circle-outline" size={24} color="#d1d5db" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishWorkout}
        >
          <Ionicons name="checkmark-done" size={22} color="#fff" />
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  timerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  progressPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  pauseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Progress bar
  progressBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },

  // Rest overlay
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
    fontVariant: ['tabular-nums'],
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

  // Exercise list
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    padding: 12,
    paddingBottom: 0,
  },

  // Current exercise — expanded inline card
  currentCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#22c55e',
    padding: 16,
    marginBottom: 8,
  },
  currentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  currentNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentNumberText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  currentCardHeaderText: {
    flex: 1,
  },
  currentCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  currentCardDetail: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
    marginTop: 2,
  },
  currentCardNotes: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 12,
    paddingLeft: 44,
  },
  restSetterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  restSetterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  restSetterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  restSetterButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restSetterValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#166534',
    minWidth: 36,
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
    gap: 6,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
  },
  completeCurrentText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  manualRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  manualRestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },

  // Compact exercise row
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  exerciseRowCompleted: {
    backgroundColor: '#f9fafb',
    opacity: 0.6,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  exerciseNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
  },
  exerciseRowInfo: {
    flex: 1,
  },
  exerciseRowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  exerciseRowNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  exerciseRowDetail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  quickCompleteButton: {
    padding: 4,
  },

  // Footer
  footer: {
    padding: 12,
    paddingBottom: 24,
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
    paddingVertical: 16,
    borderRadius: 12,
  },
  finishButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
});
