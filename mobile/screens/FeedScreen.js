import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import SourcePreview from '../components/SourcePreview';

export default function FeedScreen() {
  const navigation = useNavigation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await api.get('/social/feed');
      setActivities(response.data);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const renderActivity = ({ item }) => {
    const isCompleted = item.type === 'completed';
    const workout = item.workout;
    const user = item.user;

    const hasThumbnail = workout.source?.preview?.thumbnail;
    const getSourceColor = () => {
      switch (workout.source?.type) {
        case 'youtube':
          return '#FF0000';
        case 'instagram':
          return '#E4405F';
        default:
          return '#6b7280';
      }
    };

    return (
      <TouchableOpacity
        style={styles.workoutCard}
        onPress={() => navigation.navigate('WorkoutDetail', { workoutId: workout._id })}
      >
        <View style={styles.workoutHeader}>
          <View style={styles.creatorHeader}>
            <View style={styles.avatar}>
              {user?.profilePicture ? (
                <Text style={styles.avatarText}>
                  {user.displayName?.[0] || user.username?.[0]}
                </Text>
              ) : (
                <Ionicons name="person" size={20} color="#22c55e" />
              )}
            </View>
            <View style={styles.headerTextContainer}>
              <View style={styles.activityRow}>
                <Text style={styles.creatorName}>
                  {user?.displayName || user?.username}
                </Text>
                {isCompleted ? (
                  <>
                    <Text style={styles.activityText}> completed </Text>
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  </>
                ) : (
                  <Text style={styles.activityText}> created</Text>
                )}
              </View>
              <Text style={styles.workoutTime}>
                {new Date(item.timestamp).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contentRow}>
          <View style={styles.textContent}>
            <View style={styles.titleRow}>
              <Text style={styles.workoutTitle}>{workout.title}</Text>
              <SourcePreview source={workout.source} variant="badge" />
            </View>
            
            {workout.description && (
              <Text style={styles.workoutDescription} numberOfLines={2}>
                {workout.description}
              </Text>
            )}
          </View>
          
          {hasThumbnail && (
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: workout.source.preview.thumbnail }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              {workout.source.preview.sourceDuration > 0 && (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {Math.floor(workout.source.preview.sourceDuration / 60)}:{(workout.source.preview.sourceDuration % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.workoutMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="barbell-outline" size={16} color="#6b7280" />
            <Text style={styles.metaText}>{workout.exercises?.length || 0} exercises</Text>
          </View>
          {workout.estimatedDuration && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.metaText}>{workout.estimatedDuration} min</Text>
            </View>
          )}
          {workout.completedBy && workout.completedBy.length > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#22c55e" />
              <Text style={styles.metaText}>{workout.completedBy.length} completed</Text>
            </View>
          )}
        </View>

        {workout.tags && workout.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {workout.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends' Workouts</Text>
        <Text style={styles.headerSubtitle}>See what your friends are doing</Text>
      </View>

      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No activity in your feed</Text>
            <Text style={styles.emptySubtext}>
              Follow friends to see their workouts and completions here!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  list: {
    padding: 16,
  },
  workoutCard: {
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
  workoutHeader: {
    marginBottom: 12,
  },
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  activityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  workoutTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 100,
    height: 75,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});
