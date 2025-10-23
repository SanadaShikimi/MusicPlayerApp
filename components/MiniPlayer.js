// components/MiniPlayer.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors'; // <-- Import màu
import Slider from '@react-native-community/slider'; // Import Slider

export default function MiniPlayer({ currentScreen }) {
  const {
    currentTrack, isPlaying, togglePlayPause, isLoading,
    playbackStatus, seek, // Lấy thêm playbackStatus và seek
    openPlayer // Lấy hàm openPlayer (nếu bạn muốn nhấn để mở)
  } = useMusicPlayer();
  const navigation = useNavigation();

  // Ẩn nếu không có nhạc HOẶC đang ở màn hình Player (nếu dùng modal)
  // Nếu bạn dùng cách khác (vd: BottomSheet), điều kiện này có thể cần thay đổi
  if (!currentTrack || currentScreen === 'Player') {
    return null;
  }

  const duration = playbackStatus?.durationMillis || 0;
  const position = playbackStatus?.positionMillis || 0;
  const progress = duration > 0 ? (position / duration) : 0;

  // Hàm này có thể dùng để mở PlayerScreen khi nhấn vào info
  // Hoặc bạn có thể dùng openPlayer() nếu đã chuyển sang BottomSheet
  const handleOpenPlayer = () => {
     navigation.navigate('Player');
     // hoặc: openPlayer();
  };


  return (
    <View style={styles.container}>
      {/* Thanh progress nhỏ ở trên cùng */}
      <Slider
          style={styles.miniSlider}
          minimumValue={0}
          maximumValue={1} // Giá trị từ 0 đến 1
          value={progress} // Dùng giá trị progress đã tính
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.lightGrey}
          thumbTintColor="transparent" // Ẩn nút kéo
          disabled={true} // Không cho người dùng kéo
        />
      <View style={styles.content}>
        <TouchableOpacity style={styles.songInfo} onPress={handleOpenPlayer} activeOpacity={0.7}>
          <Image
            source={typeof currentTrack.cover === 'string' ? { uri: currentTrack.cover } : currentTrack.cover}
            style={styles.coverImage}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
            {/* <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text> */}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={COLORS.text} /> // Màu đen/xám
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.surface, // Màu nền nhẹ
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    // Không cần position absolute nữa
  },
  miniSlider: {
      width: '100%',
      height: 3, // Rất mỏng
      position: 'absolute', // Nằm đè lên trên cùng của mini player
      top: -2, // Dịch lên 1 chút để không bị che
  },
  content: { // Bao bọc nội dung chính (ảnh, text, nút play)
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 60, // Chiều cao cố định
      paddingHorizontal: 15,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Chiếm phần lớn không gian
  },
  coverImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '500', // Đậm vừa
    color: COLORS.text,
  },
  artist: { // Tạm ẩn artist nếu muốn gọn hơn
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  playButton: {
    padding: 8, // Tăng vùng chạm
  },
});