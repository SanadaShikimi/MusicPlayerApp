// components/AddToPlaylistModal.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert, Button
} from 'react-native';
import { getPlaylists, addSongToPlaylist } from '../services/Database';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const AddToPlaylistModal = ({ visible, onClose, songToAdd }) => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load playlists khi modal mở
  useEffect(() => {
    if (visible) {
      loadPlaylists();
    }
  }, [visible]);

  const loadPlaylists = async () => {
    setIsLoading(true);
    try {
      const pls = await getPlaylists();
      setPlaylists(pls);
    } catch (error) {
      console.error("Lỗi tải playlist trong modal:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách playlist.");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi chọn 1 playlist
  const handleSelectPlaylist = async (playlist) => {
    if (!songToAdd) return;
    try {
      await addSongToPlaylist(playlist.id, songToAdd);
      Alert.alert('Thành công', `Đã thêm "${songToAdd.title}" vào playlist "${playlist.name}"`);
      onClose(); // Đóng modal sau khi thêm thành công
    } catch (e) {
      Alert.alert('Lỗi', `Không thể thêm bài hát: ${e.message}`);
      // Không đóng modal nếu lỗi để người dùng thử lại
    }
  };

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handleSelectPlaylist(item)}
    >
      <Ionicons name="musical-notes-outline" size={24} color={COLORS.grey} />
      <Text style={styles.playlistName}>{item.name}</Text>
      <Text style={styles.songCount}>{item.songs?.length || 0} bài</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true} // Nền trong suốt
      visible={visible}
      onRequestClose={onClose} // Cho phép nút back Android đóng modal
    >
      {/* Lớp nền mờ */}
      <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose} // Nhấn nền để đóng
      />
      {/* Nội dung Modal */}
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>Thêm vào Playlist</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : playlists.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có playlist nào.</Text>
        ) : (
          <FlatList
            data={playlists}
            renderItem={renderPlaylistItem}
            keyExtractor={item => item.id}
            style={styles.flatList}
          />
        )}

        {/* Nút đóng */}
        <Button title="Đóng" onPress={onClose} color={COLORS.primary} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { // Lớp nền mờ che phủ toàn màn hình
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Màu đen mờ 50%
  },
  modalView: { // Khung nội dung modal ở dưới cùng
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30, // Thêm padding dưới
    maxHeight: '60%', // Giới hạn chiều cao tối đa
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center', // Căn giữa tiêu đề, nút đóng
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.text,
  },
  flatList: {
    width: '100%', // FlatList chiếm toàn bộ chiều rộng modal
    marginBottom: 15,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    width: '100%',
  },
  playlistName: {
    flex: 1, // Đẩy số lượng bài hát ra cuối
    fontSize: 16,
    marginLeft: 15,
    color: COLORS.text,
  },
  songCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyText: {
      marginTop: 20,
      marginBottom: 20,
      fontSize: 16,
      color: COLORS.grey,
  }
});

export default AddToPlaylistModal;