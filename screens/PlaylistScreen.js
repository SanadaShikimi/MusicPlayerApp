// screens/PlaylistScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, Button, Alert, ActivityIndicator 
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getPlaylists, createPlaylist } from '../services/Database';
import { Ionicons } from '@expo/vector-icons';

export default function PlaylistScreen() {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState(''); // State cho TextInput
  
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // Load danh sách playlists khi màn hình được focus
  useEffect(() => {
    if (isFocused) {
      loadPlaylists();
    }
  }, [isFocused]);

  const loadPlaylists = async () => {
    try {
      setIsLoading(true);
      const pls = await getPlaylists();
      setPlaylists(pls);
    } catch (error) {
      console.error("Lỗi khi tải playlists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // (FR-3.2) Hàm xử lý tạo playlist mới
  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim() === '') {
      Alert.alert('Lỗi', 'Tên playlist không được để trống');
      return;
    }
    
    try {
      await createPlaylist(newPlaylistName);
      setNewPlaylistName(''); // Xóa nội dung TextInput
      loadPlaylists(); // Tải lại danh sách
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', error.message); // Hiển thị lỗi (ví dụ: tên trùng)
    }
  };

  // (FR-3.4) Hàm render danh sách
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.playlistItem} 
      // Chuyển sang màn hình chi tiết khi nhấn
      onPress={() => navigation.navigate('PlaylistDetail', { playlist: item })}
    >
      <Ionicons name="musical-notes" size={24} color="#555" />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.songCount}>{item.songs.length} bài hát</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* (FR-3.2) Phần tạo playlist mới */}
      <View style={styles.createContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tên playlist mới..."
          value={newPlaylistName}
          onChangeText={setNewPlaylistName}
        />
        <Button title="Tạo mới" onPress={handleCreatePlaylist} color="#FF5500" />
      </View>

      {/* (FR-3.4) Danh sách các playlist */}
      {playlists.length === 0 ? (
        <View style={styles.center}>
          <Text>Bạn chưa có playlist nào.</Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

// (Styles mới cho màn hình này)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  playlistItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  songCount: {
    fontSize: 14,
    color: '#666',
  },
});