import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * SourcePreview Component
 * 
 * Displays a preview of the original source (YouTube, Instagram) for a workout
 * Shows thumbnail, title, creator, and allows opening the original link
 * 
 * Props:
 * - source: object with { type, url, preview: { thumbnail, sourceTitle, sourceCreator, sourceDuration } }
 * - variant: 'full' (with thumbnail) or 'badge' (compact badge only)
 * - onPress: optional override for the default open-URL behavior
 */
export default function SourcePreview({ source, variant = 'full', onPress }) {
  if (!source || !source.url || source.type === 'custom') {
    return null;
  }

  const handleOpenSource = async () => {
    if (source.url) {
      try {
        const canOpen = await Linking.canOpenURL(source.url);
        if (canOpen) {
          await Linking.openURL(source.url);
        } else {
          Alert.alert('Error', 'Unable to open this link');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open link');
      }
    }
  };

  const getSourceColor = () => {
    switch (source.type) {
      case 'youtube':
        return '#FF0000';
      case 'instagram':
        return '#E4405F';
      default:
        return '#6b7280';
    }
  };

  const getSourceName = () => {
    switch (source.type) {
      case 'youtube':
        return 'YouTube';
      case 'instagram':
        return 'Instagram';
      default:
        return 'Source';
    }
  };

  const getSourceIcon = () => {
    switch (source.type) {
      case 'youtube':
        return 'logo-youtube';
      case 'instagram':
        return 'logo-instagram';
      default:
        return 'link-outline';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins}m`;
  };

  const handlePress = onPress || handleOpenSource;

  // Badge variant - compact display for cards
  if (variant === 'badge') {
    return (
      <TouchableOpacity
        style={[styles.badge, { borderColor: getSourceColor() }]}
        onPress={handlePress}
      >
        <Ionicons name={getSourceIcon()} size={14} color={getSourceColor()} />
        <Text style={[styles.badgeText, { color: getSourceColor() }]}>
          {getSourceName()}
        </Text>
        <Ionicons name="open-outline" size={12} color="#6b7280" />
      </TouchableOpacity>
    );
  }

  // Full variant - with thumbnail and metadata
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name={getSourceIcon()} size={20} color={getSourceColor()} />
          <Text style={styles.sourceLabel}>Original Source</Text>
        </View>
        <Ionicons name="open-outline" size={18} color="#6b7280" />
      </View>

      <View style={styles.content}>
        {source.preview?.thumbnail ? (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: source.preview.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            {source.preview?.sourceDuration > 0 && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {formatDuration(source.preview.sourceDuration)}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.thumbnailPlaceholder, { backgroundColor: getSourceColor() + '20' }]}>
            <Ionicons name={getSourceIcon()} size={40} color={getSourceColor()} />
          </View>
        )}

        <View style={styles.metadata}>
          {source.preview?.sourceTitle && (
            <Text style={styles.sourceTitle} numberOfLines={2}>
              {source.preview.sourceTitle}
            </Text>
          )}
          {source.preview?.sourceCreator && (
            <View style={styles.creatorRow}>
              <Ionicons name="person-outline" size={14} color="#6b7280" />
              <Text style={styles.creatorName} numberOfLines={1}>
                {source.preview.sourceCreator}
              </Text>
            </View>
          )}
          <View style={styles.platformRow}>
            <Ionicons name={getSourceIcon()} size={14} color={getSourceColor()} />
            <Text style={[styles.platformText, { color: getSourceColor() }]}>
              View on {getSourceName()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Badge variant styles
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  
  // Full variant styles
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 120,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: 120,
    height: 90,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  metadata: {
    flex: 1,
    justifyContent: 'space-between',
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 18,
    marginBottom: 4,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
