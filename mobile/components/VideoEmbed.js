import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Extract YouTube video ID from various URL formats.
 */
function getYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url?.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * VideoEmbed Component
 *
 * Renders an embedded YouTube player (via WebView) or an Instagram preview card.
 *
 * Props:
 * - source: workout source object { type, url, preview }
 * - collapsible: boolean - if true, starts collapsed with a tap-to-expand strip
 * - style: optional container style overrides
 */
export default function VideoEmbed({ source, collapsible = false, style }) {
  const [expanded, setExpanded] = useState(!collapsible);

  if (!source || !source.url || source.type === 'custom') {
    return null;
  }

  const isYouTube = source.type === 'youtube';
  const videoId = isYouTube ? getYouTubeVideoId(source.url) : null;

  const title = source.preview?.sourceTitle || (isYouTube ? 'YouTube Video' : 'Instagram Post');
  const thumbnail = source.preview?.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

  const handleOpenVideo = async () => {
    try {
      await Linking.openURL(source.url);
    } catch {
      Alert.alert('Error', 'Failed to open video link');
    }
  };

  // Collapsed strip
  if (collapsible && !expanded) {
    return (
      <TouchableOpacity
        style={[styles.collapsedBar, style]}
        onPress={() => setExpanded(true)}
        activeOpacity={0.7}
      >
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.collapsedThumb} />
        ) : (
          <View style={[styles.collapsedThumbPlaceholder, { backgroundColor: isYouTube ? '#FF000020' : '#E4405F20' }]}>
            <Ionicons name={isYouTube ? 'logo-youtube' : 'logo-instagram'} size={18} color={isYouTube ? '#FF0000' : '#E4405F'} />
          </View>
        )}
        <View style={styles.collapsedInfo}>
          <Text style={styles.collapsedTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.collapsedSubtitle}>
            {isYouTube ? 'Tap to watch video' : 'Tap to view'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>
    );
  }

  // Instagram: show preview card with "Watch on Instagram" button
  if (!isYouTube) {
    return (
      <View style={style}>
        {collapsible && (
          <CollapseHeader
            title={title}
            icon="logo-instagram"
            color="#E4405F"
            onCollapse={() => setExpanded(false)}
          />
        )}
        <InstagramCard source={source} />
      </View>
    );
  }

  // YouTube: inline player via react-native-youtube-iframe
  const playerWidth = SCREEN_WIDTH - 32;
  const playerHeight = Math.round(playerWidth * 9 / 16);

  return (
    <View style={[styles.container, style]}>
      {collapsible && (
        <CollapseHeader
          title={title}
          icon="logo-youtube"
          color="#FF0000"
          onCollapse={() => setExpanded(false)}
        />
      )}
      {videoId ? (
        <YoutubePlayer
          height={playerHeight}
          width={playerWidth}
          videoId={videoId}
          play={false}
          webViewProps={{
            allowsInlineMediaPlayback: true,
          }}
        />
      ) : (
        <TouchableOpacity activeOpacity={0.85} onPress={handleOpenVideo}>
          <View style={styles.thumbnailContainer}>
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="logo-youtube" size={48} color="#FF0000" />
            </View>
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={32} color="#fff" style={{ marginLeft: 3 }} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
      <View style={styles.ytInfoRow}>
        <View style={styles.ytInfoText}>
          <Text style={styles.ytTitle} numberOfLines={2}>{title}</Text>
          {source.preview?.sourceCreator && (
            <Text style={styles.ytCreator} numberOfLines={1}>
              {source.preview.sourceCreator}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.ytOpenButton} onPress={handleOpenVideo} activeOpacity={0.7}>
          <Ionicons name="logo-youtube" size={16} color="#fff" />
          <Text style={styles.ytOpenButtonText}>YouTube</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Collapse header bar shown above an expanded player.
 */
function CollapseHeader({ title, icon, color, onCollapse }) {
  return (
    <TouchableOpacity style={styles.collapseHeader} onPress={onCollapse} activeOpacity={0.7}>
      <View style={styles.collapseHeaderLeft}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={styles.collapseHeaderTitle} numberOfLines={1}>{title}</Text>
      </View>
      <Ionicons name="chevron-up" size={20} color="#6b7280" />
    </TouchableOpacity>
  );
}

/**
 * Instagram preview card with thumbnail and "Watch on Instagram" CTA.
 */
function InstagramCard({ source, style }) {
  const handleOpen = async () => {
    try {
      const canOpen = await Linking.canOpenURL(source.url);
      if (canOpen) {
        await Linking.openURL(source.url);
      } else {
        Alert.alert('Error', 'Unable to open this link');
      }
    } catch {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const thumbnail = source.preview?.thumbnail;
  const title = source.preview?.sourceTitle || 'Instagram Post';
  const creator = source.preview?.sourceCreator;

  return (
    <View style={[styles.instagramCard, style]}>
      {thumbnail ? (
        <Image source={{ uri: thumbnail }} style={styles.instagramThumb} resizeMode="cover" />
      ) : (
        <View style={styles.instagramThumbPlaceholder}>
          <Ionicons name="logo-instagram" size={48} color="#E4405F" />
        </View>
      )}
      <View style={styles.instagramInfo}>
        <Text style={styles.instagramTitle} numberOfLines={2}>{title}</Text>
        {creator && (
          <View style={styles.instagramCreatorRow}>
            <Ionicons name="person-outline" size={14} color="#6b7280" />
            <Text style={styles.instagramCreator} numberOfLines={1}>@{creator}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.instagramButton} onPress={handleOpen} activeOpacity={0.7}>
          <Ionicons name="logo-instagram" size={16} color="#fff" />
          <Text style={styles.instagramButtonText}>Watch on Instagram</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // YouTube card
  container: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1a1a1a',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ytInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#111',
    gap: 10,
  },
  ytInfoText: {
    flex: 1,
  },
  ytTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  ytCreator: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  ytOpenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FF0000',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  ytOpenButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  // Collapsed bar
  collapsedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  collapsedThumb: {
    width: 48,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  collapsedThumbPlaceholder: {
    width: 48,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapsedInfo: {
    flex: 1,
  },
  collapsedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  collapsedSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 1,
  },

  // Collapse header (shown above expanded player)
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#111',
  },
  collapseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  collapseHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },

  // Instagram card
  instagramCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  instagramThumb: {
    width: '100%',
    height: 200,
  },
  instagramThumbPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#fdf2f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instagramInfo: {
    padding: 12,
  },
  instagramTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  instagramCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  instagramCreator: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  instagramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E4405F',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  instagramButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
