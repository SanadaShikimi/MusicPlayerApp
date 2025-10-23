// screens/MusicListScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, Button, TextInput, ScrollView
} from 'react-native';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// --- Dữ liệu Lyrics ---
const numbLyrics = [
    { time: 5.10, line: "I'm tired of being what you want me to be" },
    { time: 8.87, line: "Feeling so faithless, lost under the surface" },
    { time: 12.59, line: "Don't know what you're expecting of me" },
    { time: 16.32, line: "Put under the pressure of walking in your shoes" },
    { time: 20.37, line: "(Caught in the undertow, just caught in the undertow)" },
    { time: 23.95, line: "Every step that I take is another mistake to you" },
    { time: 27.81, line: "(Caught in the undertow, just caught in the undertow)" },
    { time: 31.06, line: "I've become so numb, I can't feel you there" },
    { time: 34.87, line: "Become so tired, so much more aware" },
    { time: 38.60, line: "I'm becoming this, all I want to do" },
    { time: 42.34, line: "Is be more like me and be less like you" },
    { time: 45.97, line: "..." },
    { time: 50.11, line: "Can't you see that you're smothering me?" },
    { time: 53.86, line: "Holding too tightly, afraid to lose control" },
    { time: 57.57, line: "'Cause everything that you thought I would be" },
    { time: 61.32, line: "Has fallen apart right in front of you" },
    { time: 65.41, line: "(Caught in the undertow, just caught in the undertow)" },
    { time: 68.96, line: "Every step that I take is another mistake to you" },
    { time: 72.82, line: "(Caught in the undertow, just caught in the undertow)" },
    { time: 76.43, line: "And every second I waste is more than I can take" },
    { time: 80.08, line: "I've become so numb, I can't feel you there" },
    { time: 83.87, line: "Become so tired, so much more aware" },
    { time: 87.62, line: "I'm becoming this, all I want to do" },
    { time: 91.35, line: "Is be more like me and be less like you" },
    { time: 94.98, line: "..." },
    { time: 102.66, line: "And I know" },
    { time: 106.01, line: "I may end up failing too" },
    { time: 110.14, line: "But I know" },
    { time: 113.67, line: "You were just like me, with someone disappointed in you" },
    { time: 118.06, line: "I've become so numb, I can't feel you there" },
    { time: 121.84, line: "Become so tired, so much more aware" },
    { time: 125.60, line: "I'm becoming this, all I want to do" },
    { time: 129.35, line: "Is be more like me and be less like you" },
    { time: 133.09, line: "I've become so numb, I can't feel you there" },
    { time: 136.71, line: "I'm tired of being what you want me to be" },
    { time: 140.59, line: "I've become so numb, I can't feel you there" },
    { time: 144.18, line: "I'm tired of being what you want me to be" }
];

const inTheEndLyrics = [
    { time: 0.10, line: "(It starts with one)" },
    { time: 7.73, line: "One thing, I don't know why" },
    { time: 10.87, line: "It doesn't even matter how hard you try" },
    { time: 13.98, line: "Keep that in mind, I designed this rhyme" },
    { time: 17.20, line: "To explain in due time" },
    { time: 19.38, line: "All I know" },
    { time: 21.03, line: "Time is a valuable thing" },
    { time: 23.41, line: "Watch it fly by as the pendulum swings" },
    { time: 26.68, line: "Watch it count down 'till the end of the day" },
    { time: 29.83, line: "The clock ticks life away" },
    { time: 32.18, line: "It's so unreal" },
    { time: 34.25, line: "You didn't look out below" },
    { time: 36.65, line: "Watch the time go right out the window" },
    { time: 39.81, line: "Trying to hold on, didn't even know" },
    { time: 43.14, line: "I wasted it all just to watch you go" },
    { time: 46.81, line: "I kept everything inside" },
    { time: 49.38, line: "And even though I tried, it all fell apart" },
    { time: 53.06, line: "What it meant to me will eventually" },
    { time: 56.50, line: "Be a memory of a time when" },
    { time: 59.81, line: "I tried so hard and got so far" },
    { time: 64.67, line: "But in the end, it doesn't even matter" },
    { time: 69.86, line: "I had to fall to lose it all" },
    { time: 74.67, line: "But in the end, it doesn't even matter" },
    { time: 83.18, line: "One thing, I don't know why" },
    { time: 86.37, line: "It doesn't even matter how hard you try" },
    { time: 89.57, line: "Keep that in mind, I designed this rhyme" },
    { time: 92.74, line: "To remind myself how I tried so hard" },
    { time: 96.67, line: "In spite of the way you were mocking me" },
    { time: 99.47, line: "Acting like I was part of your property" },
    { time: 102.73, line: "Remembering all the times you fought with me" },
    { time: 105.99, line: "I'm surprised it got so far" },
    { time: 108.77, line: "Things aren't the way they were before" },
    { time: 112.38, line: "You wouldn't even recognize me anymore" },
    { time: 115.53, line: "Not that you knew me back then" },
    { time: 118.57, line: "But it all comes back to me in the end" },
    { time: 122.37, line: "You kept everything inside" },
    { time: 124.96, line: "And even though I tried, it all fell apart" },
    { time: 128.61, line: "What it meant to me will eventually" },
    { time: 132.06, line: "Be a memory of a time when" },
    { time: 135.40, line: "I tried so hard and got so far" },
    { time: 140.23, line: "But in the end, it doesn't even matter" },
    { time: 145.41, line: "I had to fall to lose it all" },
    { time: 150.23, line: "But in the end, it doesn't even matter" },
    { time: 158.46, line: "I've put my trust in you" },
    { time: 161.64, line: "Pushed as far as I can go" },
    { time: 164.84, line: "For all this" },
    { time: 167.99, line: "There's only one thing you should know" },
    { time: 171.21, line: "I've put my trust in you" },
    { time: 174.40, line: "Pushed as far as I can go" },
    { time: 177.60, line: "For all this" },
    { time: 180.75, line: "There's only one thing you should know" },
    { time: 187.16, line: "I tried so hard and got so far" },
    { time: 191.99, line: "But in the end, it doesn't even matter" },
    { time: 197.18, line: "I had to fall to lose it all" },
    { time: 201.99, line: "But in the end, it doesn't even matter" }
];

const placeholderLyrics = (title) => [{ time: 0, line: `(Chưa có lời cho ${title})` }];

const MOCK_SONGS = [
  {
    id: '1',
    title: 'Bring Me to Life',
    artist: 'Evanescence',
    album: 'Fallen',
    genre: 'Rock',
    url: require('../assets/music/BringMeToLife.mp3'),
    cover: 'https://picsum.photos/seed/evanescence/100',
    lyrics: placeholderLyrics('Bring Me to Life')
  },
  {
    id: '2',
    title: 'Numb',
    artist: 'Linkin Park',
    album: 'Meteora',
    genre: 'Rock',
    url: require('../assets/music/Numb.mp3'),
    cover: 'https://picsum.photos/seed/linkinpark/100',
    lyrics: numbLyrics
  },
  {
    id: '3',
    title: 'Sing Me to Sleep',
    artist: 'Alan Walker',
    album: 'Different World',
    genre: 'Electronic',
    url: require('../assets/music/SingMeToSleep.mp3'),
    cover: 'https://picsum.photos/seed/alanwalker/100',
    lyrics: placeholderLyrics('Sing Me to Sleep')
  },
  {
    id: '4',
    title: 'Kings & Queens',
    artist: 'Ava Max',
    album: 'Heaven & Hell',
    genre: 'Pop',
    url: require('../assets/music/KingsandQueens.mp3'),
    cover: 'https://picsum.photos/seed/avamax/100',
    lyrics: placeholderLyrics('Kings & Queens')
  },
  {
    id: '5',
    title: 'How Do You Do?',
    artist: 'Roxette',
    album: 'Tourism',
    genre: 'Pop',
    url: require('../assets/music/HowDoYouDo.mp3'),
    cover: 'https://picsum.photos/seed/roxette/100',
    lyrics: placeholderLyrics('How Do You Do?')
  },
  {
    id: '6',
    title: 'In the End',
    artist: 'Linkin Park',
    album: 'Hybrid Theory',
    genre: 'Rock',
    url: require('../assets/music/InTheEnd.mp3'),
    cover: 'https://picsum.photos/seed/linkinpark2/100',
    lyrics: inTheEndLyrics
  },
  {
    id: '7', title: 'SoundHelix Song 4', artist: 'Various Artists', album: 'SoundHelix Collection', genre: 'Electronic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 
    cover: 'https://picsum.photos/seed/song4/100',
    lyrics: placeholderLyrics('SoundHelix Song 4')
  },
  {
    id: '8', title: 'SoundHelix Song 5', artist: 'Sample Band', album: 'Test Tracks', genre: 'Pop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', // <-- URL Web
    cover: 'https://picsum.photos/seed/song5/100',
    lyrics: placeholderLyrics('SoundHelix Song 5')
  },
  {
    id: '9', title: 'SoundHelix Song 6', artist: 'Demo Project', album: 'SoundHelix Collection', genre: 'Rock',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', // <-- URL Web
    cover: 'https://picsum.photos/seed/song6/100',
    lyrics: placeholderLyrics('SoundHelix Song 6')
  },
  {
    id: '10', title: 'SoundHelix Song 7', artist: 'Various Artists', album: 'Test Tracks', genre: 'Electronic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', // <-- URL Web
    cover: 'https://picsum.photos/seed/song7/100',
    lyrics: placeholderLyrics('SoundHelix Song 7')
  },
  {
    id: '11', title: 'SoundHelix Song 8', artist: 'Sample Band', album: 'SoundHelix Collection', genre: 'Pop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', // <-- URL Web
    cover: 'https://picsum.photos/seed/song8/100',
    lyrics: placeholderLyrics('SoundHelix Song 8')
  },
  {
    id: '12', title: 'SoundHelix Song 9', artist: 'Demo Project', album: 'Test Tracks', genre: 'Rock',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', // <-- URL Web
    cover: 'https://picsum.photos/seed/song9/100',
    lyrics: placeholderLyrics('SoundHelix Song 9')
  },
  {
    id: '13', title: 'SoundHelix Song 10', artist: 'Various Artists', album: 'SoundHelix Collection', genre: 'Electronic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', // <-- URL Web
    cover: 'https://picsum.photos/seed/song10/100',
    lyrics: placeholderLyrics('SoundHelix Song 10')
  },
  {
    id: '14', title: 'SoundHelix Song 11', artist: 'Sample Band', album: 'Test Tracks', genre: 'Pop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', // <-- URL Web
    cover: 'https://picsum.photos/seed/song11/100',
    lyrics: placeholderLyrics('SoundHelix Song 11')
  },
  {
    id: '15', title: 'SoundHelix Song 12', artist: 'Demo Project', album: 'SoundHelix Collection', genre: 'Rock',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', // <-- URL Web
    cover: 'https://picsum.photos/seed/song12/100',
    lyrics: placeholderLyrics('SoundHelix Song 12')
  },
  {
    id: '16', title: 'SoundHelix Song 13', artist: 'Various Artists', album: 'Test Tracks', genre: 'Electronic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', // <-- URL Web
    cover: 'https://picsum.photos/seed/song13/100',
    lyrics: placeholderLyrics('SoundHelix Song 13')
  },
];

const MOCK_TRENDING = MOCK_SONGS.slice(0, 3);

export default function MusicListScreen({ navigation }) {
  const { playTrack, currentTrack } = useMusicPlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSongs, setFilteredSongs] = useState(MOCK_SONGS);
  const [viewMode, setViewMode] = useState('all');

  useEffect(() => {
    let results = [...MOCK_SONGS];

    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      results = results.filter(
        song =>
          song.title.toLowerCase().includes(lowercasedQuery) ||
          song.artist.toLowerCase().includes(lowercasedQuery) ||
          (song.album && song.album.toLowerCase().includes(lowercasedQuery))
      );
    }

    if (viewMode === 'artist') {
      results.sort((a, b) => {
        const artistA = a.artist.toLowerCase();
        const artistB = b.artist.toLowerCase();
        if (artistA < artistB) return -1;
        if (artistA > artistB) return 1;
        const albumA = a.album?.toLowerCase() || '';
        const albumB = b.album?.toLowerCase() || '';
        if (albumA < albumB) return -1;
        if (albumA > albumB) return 1;
        return 0;
      });
    } else if (viewMode === 'album') {
      results.sort((a, b) => {
        const albumA = a.album?.toLowerCase() || '';
        const albumB = b.album?.toLowerCase() || '';
        if (albumA < albumB) return -1;
        if (albumA > albumB) return 1;
        const artistA = a.artist.toLowerCase();
        const artistB = b.artist.toLowerCase();
        if (artistA < artistB) return -1;
        if (artistA > artistB) return 1;
        return 0;
      });
    }

    setFilteredSongs(results);

  }, [searchQuery, viewMode]);


  const handlePressSong = (item, list) => {
    playTrack(item, list || filteredSongs);
  };

  const renderMainListItem = ({ item }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => handlePressSong(item, filteredSongs)}>
      <Image source={typeof item.cover === 'string' ? { uri: item.cover } : item.cover} style={styles.coverImage} />
      <View style={styles.songInfo}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
        {viewMode === 'album' && <Text style={styles.albumText} numberOfLines={1}>{item.album}</Text>}
        {viewMode === 'artist' && <Text style={styles.albumText} numberOfLines={1}>{item.album}</Text>}
      </View>
       <Ionicons name="play-circle-outline" size={24} color={COLORS.lightGrey} />
    </TouchableOpacity>
  );

  const renderTrendingItem = ({ item }) => (
     <TouchableOpacity
       style={styles.trendingItem}
       onPress={() => handlePressSong(item, MOCK_TRENDING)} // Chơi nhạc từ list trending
     >
       <Image
         source={typeof item.cover === 'string' ? { uri: item.cover } : item.cover}
         style={styles.trendingCoverImage}
       />
       <Text style={styles.trendingTitle} numberOfLines={1}>{item.title}</Text>
       <Text style={styles.trendingArtist} numberOfLines={1}>{item.artist}</Text>
     </TouchableOpacity>
   );

  const isMiniPlayerVisible = currentTrack !== null;
  const navigationButtonsHeight = 50;
  const miniPlayerHeight = 60;

  return (
    <View style={styles.outerContainer}>
      {/* ScrollView bao bọc toàn bộ nội dung CÓ THỂ CUỘN */}
      <ScrollView
          style={styles.scrollView}
          // ✅✅✅ CẬP NHẬT contentContainerStyle ✅✅✅
          contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: navigationButtonsHeight + (isMiniPlayerVisible ? miniPlayerHeight : 0) + 10
              }
          ]}
          // ✅✅✅ KẾT THÚC CẬP NHẬT ✅✅✅
          showsVerticalScrollIndicator={false} // Ẩn thanh cuộn dọc
          keyboardShouldPersistTaps='handled' // Đóng bàn phím khi chạm ra ngoài
      >

      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.grey} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm bài hát, nghệ sĩ, album..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          placeholderTextColor={COLORS.grey} // Màu placeholder
        />
      </View>

      <View style={styles.trendingSection}>
            <Text style={styles.sectionTitle}>Xu hướng 🔥</Text>
            <FlatList
                data={MOCK_TRENDING}
                renderItem={renderTrendingItem}
                keyExtractor={item => 'trending-' + item.id} // Thêm prefix để key không trùng
                horizontal={true} // QUAN TRỌNG: Hiển thị ngang
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingListContent}
            />
        </View>

      {/* Nút chọn chế độ xem */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'all' && styles.activeViewModeButton]}
          onPress={() => setViewMode('all')}
        >
          <Text style={[styles.viewModeText, viewMode === 'all' && styles.activeViewModeText]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'artist' && styles.activeViewModeButton]}
          onPress={() => setViewMode('artist')}
        >
          <Text style={[styles.viewModeText, viewMode === 'artist' && styles.activeViewModeText]}>Nghệ sĩ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'album' && styles.activeViewModeButton]}
          onPress={() => setViewMode('album')}
        >
          <Text style={[styles.viewModeText, viewMode === 'album' && styles.activeViewModeText]}>Album</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainListSection}>
             <Text style={styles.sectionTitle}>Tất cả bài hát</Text>
             {filteredSongs.length > 0 ? (
                 filteredSongs.map(item => (
                     // Gọi lại hàm render item thủ công
                     <View key={item.id}>
                         {renderMainListItem({ item })}
                     </View>
                 ))
             ) : (
                 <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không tìm thấy kết quả.</Text>
                 </View>
             )}
         </View>

      </ScrollView>

      <View style={styles.navigationButtons}>
         <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Favorites')}>
            <Ionicons name="heart-outline" size={24} color={COLORS.inactiveTab} />
            <Text style={styles.navButtonText}>Yêu thích</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Playlists')}>
             <Ionicons name="list-outline" size={24} color={COLORS.inactiveTab} />
             <Text style={styles.navButtonText}>Playlists</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('History')}>
             <Ionicons name="time-outline" size={24} color={COLORS.inactiveTab} />
             <Text style={styles.navButtonText}>Lịch sử</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
      flex: 1,
  },
  scrollContent: {
      flexGrow: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
trendingSection: {
      marginTop: 15,
      marginBottom: 10,
  },
  sectionTitle: { // Style chung cho tiêu đề mục
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.text,
      marginLeft: 15,
      marginBottom: 10,
  },
  trendingListContent: { // Padding cho danh sách trending ngang
      paddingHorizontal: 15,
      paddingVertical: 5,
  },
  trendingItem: {
      width: 120, // Chiều rộng cố định cho mỗi item
      marginRight: 15, // Khoảng cách giữa các item
      alignItems: 'center',
  },
  trendingCoverImage: {
      width: 120,
      height: 120, // Ảnh vuông
      borderRadius: 8,
      marginBottom: 8,
  },
  trendingTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: COLORS.text,
      textAlign: 'center',
  },
  trendingArtist: {
      fontSize: 12,
      color: COLORS.textSecondary,
      textAlign: 'center',
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    marginBottom: 5,
  },
  viewModeButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  activeViewModeButton: {
    backgroundColor: '#FF5500',
    borderColor: '#FF5500',
  },
  viewModeText: {
    color: '#555',
    fontSize: 14,
  },
  activeViewModeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mainListSection: {
      marginTop: 10, // Khoảng cách với mục filter
  },
  songItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  coverImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  artist: {
    fontSize: 14,
    color: '#666',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    height: 50,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
  }
});