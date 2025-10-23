// screens/HistoryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getHistory } from '../services/Database'; // (1) Import hàm lấy lịch sử
import { useMusicPlayer } from '../context/MusicPlayerContext';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();
  const { playTrack } = useMusicPlayer();
  const isFocused = useIsFocused();

  // Load lịch sử khi màn hình được focus
  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const historyData = await getHistory(); // (2) Gọi hàm lấy lịch sử
      setHistory(historyData);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý khi nhấn vào bài hát trong lịch sử
  const handlePressSong = (item) => {
    // Phát bài hát này (truyền cả danh sách lịch sử làm playlist)
    playTrack(item, history);
  };

  // Giao diện render (Giống FavoritesScreen)
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handlePressSong(item)}
    >
      <Image
        source={typeof item.cover === 'string' ? { uri: item.cover } : item.cover}
        style={styles.coverImage}
      />
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
      {history.length === 0 ? (
        <View style={styles.center}>
          <Text>Lịch sử nghe nhạc trống.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id + index} // Dùng index để đảm bảo key duy nhất nếu có bài hát trùng
        />
      )}
    </View>
  );
}

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