import React, { useState, useEffect, useContext } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import SourcePreview from '../components/SourcePreview';
import Logo from '../components/Logo';

export default function LibraryScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    try {
      const response = await api.get('/workouts/library');
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  const renderWorkout = ({ item }) => {
    const currentUserId = user?.id;
    const isOwned = item.creator?._id?.toString() === currentUserId;
    const isSaved = !isOwned && (item.isSaved || false);
    const hasThumbnail = item.source?.preview?.thumbnail;

    return (
      <TouchableOpacity
        style={styles.workoutCard}
        onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item._id })}
      >
        <View style={styles.contentRow}>
          <View style={styles.workoutInfo}>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutTitleContainer}>
                <Text style={styles.workoutTitle}>{item.title}</Text>
                <View style={styles.badgesRow}>
                  {isSaved && (
                    <View style={styles.savedBadge}>
                      <Ionicons name="heart" size={12} color="#ef4444" />
                      <Text style={styles.savedText}>Saved</Text>
                    </View>
                  )}
                  <SourcePreview source={item.source} variant="badge" />
                </View>
              </View>
              {item.isPublic ? (
                <Ionicons name="globe-outline" size={16} color="#22c55e" />
              ) : (
                <Ionicons name="lock-closed-outline" size={16} color="#6b7280" />
              )}
            </View>

            {item.description && (
              <Text style={styles.workoutDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <View style={styles.workoutMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="barbell-outline" size={16} color="#6b7280" />
                <Text style={styles.metaText}>{item.exercises?.length || 0} exercises</Text>
              </View>
              {item.likedBy && item.likedBy.length > 0 && (
                <View style={styles.metaItem}>
                  <Ionicons name="heart" size={16} color="#ef4444" />
                  <Text style={[styles.metaText, styles.likedText]}>{item.likedBy.length}</Text>
                </View>
              )}
              {item.creator && (
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>{item.creator.displayName || item.creator.username}</Text>
                </View>
              )}
            </View>
          </View>

          {hasThumbnail && (
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: item.source.preview.thumbnail }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              {item.source.preview.sourceDuration > 0 && (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {Math.floor(item.source.preview.sourceDuration / 60)}:{(item.source.preview.sourceDuration % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo size="small" />
          <Text style={styles.headerTitle}>My Library</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateWorkout')}
        >
          <Ionicons name="add-circle" size={32} color="#22c55e" />
        </TouchableOpacity>
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
            <Ionicons name="library-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Your library is empty</Text>
            <Text style={styles.emptySubtext}>Create or save workouts to get started!</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    padding: 4,
  },
  list: {
    padding: 16,
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workoutTitleContainer: {
    flexDirection: 'column',
    gap: 6,
    flex: 1,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  savedText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 16,
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
  likedText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  thumbnailContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  },
});
