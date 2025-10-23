// screens/FavoritesScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // (1) Import useIsFocused
import { getFavorites } from '../services/Database';
import { useMusicPlayer } from '../context/MusicPlayerContext'; // (2) Import music player

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigation = useNavigation();
  const { playTrack } = useMusicPlayer(); // (3) Lấy hàm playTrack
  
  // (4) useIsFocused là một hook của React Navigation.
  // Nó sẽ trả về 'true' khi màn hình này được focus (hiển thị)
  const isFocused = useIsFocused();

  // (5) Load danh sách yêu thích khi màn hình được focus
  useEffect(() => {
    if (isFocused) {
      loadFavorites();
    }
  }, [isFocused]); // Chạy lại mỗi khi isFocused thay đổi

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu thích:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // (6) Hàm xử lý khi nhấn vào một bài hát trong danh sách yêu thích
  const handlePressSong = (item) => {
    // Bắt đầu phát bài hát này (truyền cả danh sách favorites làm playlist)
    playTrack(item, favorites); 
  };

  // (7) Giao diện render (Giống hệt MusicListScreen)
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.songItem} 
      onPress={() => handlePressSong(item)}
    >
      <Image source={{ uri: item.cover }} style={styles.coverImage} />
      <View style={styles.songInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.artist}>{item.artist}</Text>
      </View>
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
      {favorites.length === 0 ? (
        <View style={styles.center}>
          <Text>Bạn chưa có bài hát yêu thích nào.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

// (Sử dụng styles tương tự MusicListScreen)
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