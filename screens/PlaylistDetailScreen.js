// screens/PlaylistDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMusicPlayer } from '../context/MusicPlayerContext';

export default function PlaylistDetailScreen({ route }) {
  // (1) Lấy dữ liệu playlist được truyền từ PlaylistScreen
  const { playlist } = route.params;
  const navigation = useNavigation();
  const { playTrack } = useMusicPlayer();

  // (2) Hàm xử lý khi nhấn vào bài hát
  const handlePressSong = (item) => {
    // Phát bài hát này (truyền cả danh sách của playlist)
    playTrack(item, playlist.songs); 
  };

  // (3) Giao diện render (Giống hệt FavoritesScreen/MusicListScreen)
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.songItem} 
      onPress={() => handlePressSong(item)}
    >
      <Image source={item.cover.includes('http') ? { uri: item.cover } : item.cover} style={styles.coverImage} />
      <View style={styles.songInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.artist}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {playlist.songs.length === 0 ? (
        <View style={styles.center}>
          <Text>Playlist này chưa có bài hát nào.</Text>
        </View>
      ) : (
        <FlatList
          data={playlist.songs}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

// (Sử dụng styles tương tự FavoritesScreen)
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
  songItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  coverImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 14,
    color: '#666',
  },
});