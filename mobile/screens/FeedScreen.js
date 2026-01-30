import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

export default function FeedScreen() {
  const navigation = useNavigation();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await api.get('/social/feed');
      setWorkouts(response.data);
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

  const renderWorkout = ({ item }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item._id })}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.creatorHeader}>
          {item.creator?.profilePicture ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.creator.displayName?.[0] || item.creator.username?.[0]}
              </Text>
            </View>
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#22c55e" />
            </View>
          )}
          <View>
            <Text style={styles.creatorName}>
              {item.creator?.displayName || item.creator?.username}
            </Text>
            <Text style={styles.workoutTime}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.workoutTitle}>{item.title}</Text>
      
      {item.description && (
        <Text style={styles.workoutDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      <View style={styles.workoutMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="barbell-outline" size={16} color="#6b7280" />
          <Text style={styles.metaText}>{item.exercises?.length || 0} exercises</Text>
        </View>
        {item.completedBy && item.completedBy.length > 0 && (
          <View style={styles.metaItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#22c55e" />
            <Text style={styles.metaText}>{item.completedBy.length} completed</Text>
          </View>
        )}
      </View>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends' Workouts</Text>
        <Text style={styles.headerSubtitle}>See what your friends are doing</Text>
      </View>

      <FlatList
        data={workouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No workouts in your feed</Text>
            <Text style={styles.emptySubtext}>
              Follow friends to see their workouts here!
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
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
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
