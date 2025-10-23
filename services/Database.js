// services/Database.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const FAVORITES_KEY = 'favorites';
const PLAYLISTS_KEY = 'playlists';
const HISTORY_KEY = 'history';
const MAX_HISTORY_LENGTH = 50;
const DOWNLOADED_SONGS_KEY = 'downloaded_songs';

export const initDatabase = () => {
  return Promise.resolve(true);
};

// ==================== FAVORITES ====================

export const addFavorite = async (song) => {
  try {
    const currentFavorites = await getFavorites();
    const isAlreadyFavorite = currentFavorites.some(item => item.id === song.id);
    
    if (!isAlreadyFavorite) {
      const newFavorites = [...currentFavorites, song];
      const jsonValue = JSON.stringify(newFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
      console.log(`Đã thêm bài hát ${song.id} vào yêu thích`);
    } else {
      console.log(`Bài hát ${song.id} đã có trong yêu thích.`);
    }
  } catch (error) {
    console.error('Lỗi khi thêm vào yêu thích (AsyncStorage):', error);
  }
};

export const removeFavorite = async (songId) => {
  try {
    const currentFavorites = await getFavorites();
    const newFavorites = currentFavorites.filter(item => item.id !== songId);
    const jsonValue = JSON.stringify(newFavorites);
    await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
    console.log(`Đã xóa bài hát ${songId} khỏi yêu thích`);
  } catch (error) {
    console.error('Lỗi khi xóa khỏi yêu thích (AsyncStorage):', error);
  }
};

export const getFavorites = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách yêu thích (AsyncStorage):', error);
    return [];
  }
};

export const isFavorite = async (songId) => {
  try {
    const currentFavorites = await getFavorites();
    return currentFavorites.some(item => item.id === songId);
  } catch (error) {
    console.error('Lỗi khi kiểm tra yêu thích (AsyncStorage):', error);
    return false;
  }
};

// ==================== PLAYLISTS ====================

const savePlaylists = async (playlists) => {
  try {
    const jsonValue = JSON.stringify(playlists);
    await AsyncStorage.setItem(PLAYLISTS_KEY, jsonValue);
  } catch (e) {
    console.error('Lỗi khi lưu playlists:', e);
  }
};

export const getPlaylists = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(PLAYLISTS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Lỗi khi lấy playlists:', e);
    return [];
  }
};

export const createPlaylist = async (name) => {
  if (!name || name.trim() === '') {
    throw new Error('Tên playlist không được để trống');
  }
  
  const currentPlaylists = await getPlaylists();
  const nameExists = currentPlaylists.some(p => p.name.toLowerCase() === name.toLowerCase());
  
  if (nameExists) {
    throw new Error('Tên playlist này đã tồn tại');
  }
  
  const newPlaylist = {
    id: Date.now().toString(),
    name: name.trim(),
    songs: [],
  };
  
  const newPlaylists = [...currentPlaylists, newPlaylist];
  await savePlaylists(newPlaylists);
  return newPlaylists;
};

export const addSongToPlaylist = async (playlistId, song) => {
  const currentPlaylists = await getPlaylists();
  
  const updatedPlaylists = currentPlaylists.map(playlist => {
    if (playlist.id === playlistId) {
      const songExists = playlist.songs.some(s => s.id === song.id);
      if (!songExists) {
        return {
          ...playlist,
          songs: [...playlist.songs, song],
        };
      }
    }
    return playlist;
  });
  
  await savePlaylists(updatedPlaylists);
  return updatedPlaylists;
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  const currentPlaylists = await getPlaylists();
  
  const updatedPlaylists = currentPlaylists.map(playlist => {
    if (playlist.id === playlistId) {
      const updatedSongs = playlist.songs.filter(s => s.id !== songId);
      return {
        ...playlist,
        songs: updatedSongs,
      };
    }
    return playlist;
  });
  
  await savePlaylists(updatedPlaylists);
  return updatedPlaylists;
};

// ==================== HISTORY ====================

export const getHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Lỗi khi lấy lịch sử:', e);
    return [];
  }
};

export const addSongToHistory = async (song) => {
  try {
    let currentHistory = await getHistory();
    currentHistory = currentHistory.filter(item => item.id !== song.id);
    currentHistory.unshift(song);
    
    if (currentHistory.length > MAX_HISTORY_LENGTH) {
      currentHistory = currentHistory.slice(0, MAX_HISTORY_LENGTH);
    }
    
    const jsonValue = JSON.stringify(currentHistory);
    await AsyncStorage.setItem(HISTORY_KEY, jsonValue);
  } catch (e) {
    console.error('Lỗi khi thêm vào lịch sử:', e);
  }
};

// ==================== DOWNLOADED SONGS ====================

export const getDownloadedSongsMap = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(DOWNLOADED_SONGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error('Lỗi khi lấy map downloaded songs:', e);
    return {};
  }
};

export const saveDownloadedSong = async (songId, localUri) => {
  try {
    const currentMap = await getDownloadedSongsMap();
    currentMap[songId] = localUri;
    const jsonValue = JSON.stringify(currentMap);
    await AsyncStorage.setItem(DOWNLOADED_SONGS_KEY, jsonValue);
    console.log(`Đã lưu thông tin download cho songId: ${songId}`);
  } catch (e) {
    console.error('Lỗi khi lưu downloaded song:', e);
  }
};

export const removeDownloadedSongInfo = async (songId) => {
  try {
    const currentMap = await getDownloadedSongsMap();
    if (currentMap[songId]) {
      delete currentMap[songId];
      const jsonValue = JSON.stringify(currentMap);
      await AsyncStorage.setItem(DOWNLOADED_SONGS_KEY, jsonValue);
      console.log(`Đã xóa thông tin download cho songId: ${songId}`);
    }
  } catch (e) {
    console.error('Lỗi khi xóa downloaded song info:', e);
  }
};

export const getMusicDirectory = async () => {
    const musicDir = FileSystem.documentDirectory + 'music/';
    try {
        const dirInfo = await FileSystem.getInfoAsync(musicDir); // Hàm này giờ OK vì import legacy
        if (!dirInfo.exists) {
            console.log("Thư mục music chưa tồn tại, đang tạo...");
            await FileSystem.makeDirectoryAsync(musicDir, { intermediates: true }); // Hàm này cũng OK
            console.log("Đã tạo thư mục:", musicDir);
        } else if (!dirInfo.isDirectory) {
             console.error("Đường dẫn music tồn tại nhưng không phải thư mục!");
             throw new Error("Music directory path exists but is not a directory.");
        }
        return musicDir;
    } catch (error) {
        console.error("Lỗi khi kiểm tra/tạo thư mục music:", error);
        throw new Error(`Không thể truy cập hoặc tạo thư mục lưu nhạc: ${error.message}`);
    }
};