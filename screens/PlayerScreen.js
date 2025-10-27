// screens/PlayerScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert,
  Dimensions, ScrollView, Image, Linking
} from 'react-native';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  addFavorite, removeFavorite, isFavorite,
  getPlaylists, addSongToPlaylist
} from '../services/Database';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import * as Clipboard from 'expo-clipboard';
import { COLORS } from '../constants/colors';
import * as Progress from 'react-native-progress';

const LyricDisplay = ({ lyrics, currentTime }) => {
  const scrollViewRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!lyrics || lyrics.length === 0) {
      setActiveIndex(-1);
      return;
    }
    const currentTimeInSeconds = currentTime / 1000;
    let newActiveIndex = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTimeInSeconds >= lyrics[i].time) {
        newActiveIndex = i;
      } else {
        break;
      }
    }
    if (newActiveIndex !== activeIndex) {
      setActiveIndex(newActiveIndex);
      if (scrollViewRef.current && newActiveIndex >= 0) {
        const wrapperHeight = height * 0.18;
        const scrollToY = newActiveIndex * 30 - wrapperHeight * 0.3;
        scrollViewRef.current.scrollTo({
          y: Math.max(0, scrollToY),
          animated: true
        });
      }
    }
  }, [currentTime, lyrics]);

  if (!lyrics || lyrics.length === 0) {
    return (
      <View style={styles.lyricWrapper}>
        <Text style={styles.noLyricText}>Không có lời bài hát</Text>
      </View>
    );
  }

  return (
    <View style={styles.lyricWrapper}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.lyricScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lyricContent}
        nestedScrollEnabled={true}
      >
        <View style={{ height: height * 0.05 }} />
        {lyrics.map((item, index) => (
          <Text
            key={index}
            style={[
              styles.lyricLine,
              index === activeIndex && styles.activeLyricLine
            ]}
          >
            {item.line}
          </Text>
        ))}
        <View style={{ height: height * 0.05 }} />
      </ScrollView>
    </View>
  );
};

const formatTime = (millis) => {
  if (!millis || isNaN(millis) || millis < 0) {
    return '0:00';
  }
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedSeconds = String(seconds).padStart(2, '0');
  return `${minutes}:${formattedSeconds}`;
};

const { width, height } = Dimensions.get('window');

export default function PlayerScreen() {
  const {
    currentTrack, isPlaying, playbackStatus, repeatMode,
    isShuffleOn, isLoading, togglePlayPause, handleNext,
    handlePrevious, seek, toggleShuffle, cycleRepeatMode,
    volume, changeVolume,
    downloadedSongs,
    downloadProgress,
    downloadSong,
    deleteDownloadedSong
  } = useMusicPlayer();

  const [isFav, setIsFav] = useState(false);
  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      checkIfFavorite(currentTrack.id);
    } else {
      setIsFav(false);
    }
  }, [currentTrack]);

  const checkIfFavorite = async (id) => {
    if (!id) return;
    const favorited = await isFavorite(id);
    setIsFav(favorited);
  };

  const handleFavoriteToggle = async () => {
    if (!currentTrack) return;
    try {
      if (isFav) {
        await removeFavorite(currentTrack.id);
      } else {
        await addFavorite(currentTrack);
      }
      setIsFav(!isFav);
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu thích:", error);
    }
  };

  const handleAddToPlaylist = () => {
    if (!currentTrack) return;
    setIsPlaylistModalVisible(true);
  };

  const handleShare = async () => {
    if (!currentTrack) return;

    const shareText = `Listen to ${currentTrack.title} by ${currentTrack.artist} on #MusicPlayerApp`;
    const shareLink = `musicplayerapp://song/${currentTrack.id}`;
    const fullShareContent = `${shareText}\n${shareLink}`;

    const shareOptions = [
      {
        text: '📋 Sao chép đường liên kết',
        onPress: async () => {
          try {
            await Clipboard.setStringAsync(shareLink);
            Alert.alert('Thành công', 'Đã sao chép đường liên kết!');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể sao chép đường liên kết');
          }
        }
      },
      {
        text: '💬 Messenger',
        onPress: async () => {
          try {
            await Clipboard.setStringAsync(fullShareContent);
            const messengerUrl = 'fb-messenger://';
            const canOpen = await Linking.canOpenURL(messengerUrl);
            
            if (canOpen) {
              await Linking.openURL(messengerUrl);
              Alert.alert('Đã sao chép', 'Nội dung đã được sao chép. Hãy dán vào Messenger!');
            } else {
              Alert.alert(
                'Mở Messenger',
                'Đã sao chép nội dung. Vui lòng cài đặt Messenger để chia sẻ.',
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            await Clipboard.setStringAsync(fullShareContent);
            Alert.alert('Đã sao chép', 'Hãy mở Messenger và dán nội dung!');
          }
        }
      },
      {
        text: '📘 Facebook',
        onPress: async () => {
          try {
            await Clipboard.setStringAsync(fullShareContent);
            const facebookUrl = 'fb://';
            const canOpen = await Linking.canOpenURL(facebookUrl);
            
            if (canOpen) {
              await Linking.openURL(facebookUrl);
              Alert.alert('Đã sao chép', 'Nội dung đã được sao chép. Hãy dán vào Facebook!');
            } else {
              Alert.alert(
                'Mở Facebook',
                'Đã sao chép nội dung. Vui lòng cài đặt Facebook để chia sẻ.',
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            await Clipboard.setStringAsync(fullShareContent);
            Alert.alert('Đã sao chép', 'Hãy mở Facebook và dán nội dung!');
          }
        }
      },
      {
        text: '🐦 X (Twitter)',
        onPress: async () => {
          try {
            const twitterText = encodeURIComponent(fullShareContent);
            const twitterUrl = `twitter://post?message=${twitterText}`;
            const twitterWebUrl = `https://twitter.com/intent/tweet?text=${twitterText}`;
            const canOpen = await Linking.canOpenURL(twitterUrl);
            
            if (canOpen) {
              await Linking.openURL(twitterUrl);
            } else {
              await Linking.openURL(twitterWebUrl);
            }
          } catch (error) {
            await Clipboard.setStringAsync(fullShareContent);
            Alert.alert('Đã sao chép', 'Hãy mở X (Twitter) và dán nội dung!');
          }
        }
      },
      {
        text: '🧵 Threads',
        onPress: async () => {
          try {
            await Clipboard.setStringAsync(fullShareContent);
            const threadsUrl = 'barcelona://create';
            const canOpen = await Linking.canOpenURL(threadsUrl);
            
            if (canOpen) {
              await Linking.openURL(threadsUrl);
              Alert.alert('Đã sao chép', 'Nội dung đã được sao chép. Hãy dán vào Threads!');
            } else {
              Alert.alert(
                'Mở Threads',
                'Đã sao chép nội dung. Vui lòng cài đặt Threads để chia sẻ.',
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            await Clipboard.setStringAsync(fullShareContent);
            Alert.alert('Đã sao chép', 'Hãy mở Threads và dán nội dung!');
          }
        }
      },
      {
        text: '📷 Instagram',
        onPress: async () => {
          try {
            await Clipboard.setStringAsync(fullShareContent);
            const instagramUrl = 'instagram://story-camera';
            const canOpen = await Linking.canOpenURL(instagramUrl);
            
            if (canOpen) {
              await Linking.openURL(instagramUrl);
              Alert.alert('Đã sao chép', 'Nội dung đã được sao chép. Hãy dán vào Instagram Story!');
            } else {
              Alert.alert(
                'Mở Instagram',
                'Đã sao chép nội dung. Vui lòng cài đặt Instagram để chia sẻ.',
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            await Clipboard.setStringAsync(fullShareContent);
            Alert.alert('Đã sao chép', 'Hãy mở Instagram và dán nội dung!');
          }
        }
      },
      {
        text: '🟦 Zalo',
        onPress: async () => {
          try {
            await Clipboard.setStringAsync(fullShareContent);
            const zaloUrl = 'zalo://';
            const canOpen = await Linking.canOpenURL(zaloUrl);
            
            if (canOpen) {
              await Linking.openURL(zaloUrl);
              Alert.alert('Đã sao chép', 'Nội dung đã được sao chép. Hãy dán vào Zalo!');
            } else {
              Alert.alert(
                'Mở Zalo',
                'Đã sao chép nội dung. Vui lòng cài đặt Zalo để chia sẻ.',
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            await Clipboard.setStringAsync(fullShareContent);
            Alert.alert('Đã sao chép', 'Hãy mở Zalo và dán nội dung!');
          }
        }
      },
      {
        text: '📤 Chia sẻ khác',
        onPress: async () => {
          try {
            await Clipboard.setStringAsync(fullShareContent);
            Alert.alert(
              'Chia sẻ',
              'Nội dung đã được sao chép vào clipboard. Bạn có thể dán vào bất kỳ ứng dụng nào!',
              [{ text: 'OK' }]
            );
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể sao chép nội dung');
          }
        }
      },
      {
        text: 'Hủy',
        style: 'cancel'
      }
    ];

    Alert.alert(
      '🔗 Chia sẻ bài hát',
      `"${currentTrack.title}" - ${currentTrack.artist}`,
      shareOptions,
      { cancelable: true }
    );
  };

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Không có bài hát nào đang phát.</Text>
      </SafeAreaView>
    );
  }

  const duration = playbackStatus?.durationMillis || 0;
  const position = playbackStatus?.positionMillis || 0;
  
  const getIconColor = (isActive, disabled = false) => {
    if (disabled) return '#ccc';
    return isActive ? COLORS.primary : 'gray';
  };

  const isDownloaded = downloadedSongs[currentTrack?.id] ? true : false;
  const isDownloadingThisSong = downloadProgress.active && downloadProgress.songId === currentTrack?.id;
  const canDownload = currentTrack?.url && typeof currentTrack.url === 'string';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.imageContainer}>
          <Image
            source={typeof currentTrack.cover === 'string'
              ? { uri: currentTrack.cover }
              : currentTrack.cover}
            style={styles.coverImage}
          />
        </View>

        <LyricDisplay
          lyrics={currentTrack?.lyrics}
          currentTime={position}
        />

        <View style={styles.controlsSection}>
          <View style={styles.trackInfoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor="#ccc"
              thumbTintColor={COLORS.primary}
              onSlidingComplete={(value) => seek(value)}
              disabled={isLoading}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.volumeContainer}>
            <Ionicons name="volume-low" size={20} color="#888" />
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor="#ccc"
              thumbTintColor={COLORS.primary}
              onValueChange={changeVolume}
              disabled={isLoading}
            />
            <Ionicons name="volume-high" size={20} color="#888" />
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={handlePrevious} disabled={isLoading}>
              <Ionicons
                name="play-skip-back"
                size={40}
                color={isLoading ? '#ccc' : 'black'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.playButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={50}
                  color="white"
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} disabled={isLoading}>
              <Ionicons
                name="play-skip-forward"
                size={40}
                color={isLoading ? '#ccc' : 'black'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomControls}>
            <TouchableOpacity 
              onPress={toggleShuffle} 
              disabled={isLoading || isDownloadingThisSong} 
              style={styles.bottomControlButton}
            >
              <Ionicons
                name="shuffle"
                size={22}
                color={getIconColor(isShuffleOn, isLoading || isDownloadingThisSong)}
              />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleFavoriteToggle} 
              disabled={isLoading || isDownloadingThisSong} 
              style={styles.bottomControlButton}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={22}
                color={getIconColor(isFav, isLoading || isDownloadingThisSong)}
              />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleAddToPlaylist} // ✅ Gọi hàm mở Modal
                disabled={isLoading || isDownloadingThisSong}
                style={styles.bottomControlButton}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color={getIconColor(false, isLoading || isDownloadingThisSong)}
                />
              </TouchableOpacity>

            {canDownload && (
              <TouchableOpacity
                onPress={() => {
                  if (isDownloaded) {
                    deleteDownloadedSong(currentTrack.id);
                  } else if (!isDownloadingThisSong) {
                    downloadSong(currentTrack);
                  }
                }}
                disabled={isLoading}
                style={styles.bottomControlButton}
              >
                {isDownloadingThisSong ? (
                  <Progress.Circle
                    size={22}
                    progress={downloadProgress.progress}
                    color={COLORS.primary}
                    showsText={false}
                    borderWidth={2}
                  />
                ) : isDownloaded ? (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                ) : (
                  <Ionicons 
                    name="cloud-download-outline" 
                    size={22} 
                    color={getIconColor(false, isLoading)} 
                  />
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              onPress={handleShare} 
              disabled={isLoading || isDownloadingThisSong} 
              style={styles.bottomControlButton}
            >
              <Ionicons
                name="share-social-outline"
                size={22}
                color={getIconColor(false, isLoading || isDownloadingThisSong)}
              />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={cycleRepeatMode} 
              disabled={isLoading || isDownloadingThisSong} 
              style={styles.bottomControlButton}
            >
              {repeatMode === 'one' ? (
                <MaterialIcons
                  name="repeat-one"
                  size={22}
                  color={getIconColor(true, isLoading || isDownloadingThisSong)}
                />
              ) : (
                <Ionicons
                  name="repeat"
                  size={22}
                  color={getIconColor(repeatMode !== 'off', isLoading || isDownloadingThisSong)}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <AddToPlaylistModal
          visible={isPlaylistModalVisible}
          onClose={() => setIsPlaylistModalVisible(false)}
          songToAdd={currentTrack} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: height * 0.05,
    marginBottom: 20,
  },
  coverImage: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  lyricWrapper: {
    width: '90%',
    height: height * 0.18,
    marginBottom: 20,
  },
  lyricScrollView: {
    width: '100%',
  },
  lyricContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  lyricLine: {
    fontSize: 16,
    color: COLORS.grey,
    textAlign: 'center',
    fontWeight: 'normal',
    lineHeight: 30,
    paddingHorizontal: 15,
    marginVertical: 1,
  },
  activeLyricLine: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  noLyricText: {
    fontSize: 16,
    color: COLORS.lightGrey,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: height * 0.05,
  },
  controlsSection: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  trackInfoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  artist: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sliderContainer: {
    width: '100%',
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 0,
    marginTop: -10,
    marginBottom: 10,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.grey,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
    marginBottom: 15,
  },
  volumeSlider: {
    flex: 1,
    height: 30,
    marginHorizontal: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '70%',
    marginBottom: 15,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  bottomControlButton: {
    padding: 5,
  },
});
