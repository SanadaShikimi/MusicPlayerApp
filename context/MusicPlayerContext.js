// context/MusicPlayerContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import {
  addSongToHistory,
  getDownloadedSongsMap,
  saveDownloadedSong,
  removeDownloadedSongInfo,
  getMusicDirectory
} from '../services/Database';

const MusicPlayerContext = createContext();

const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

export const MusicPlayerProvider = ({ children }) => {
  // States cơ bản
  const [sound, setSound] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [originalSongList, setOriginalSongList] = useState([]);
  const [activeSongList, setActiveSongList] = useState([]);
  const [repeatMode, setRepeatMode] = useState('off');
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1.0);

  // States cho Download
  const [downloadedSongs, setDownloadedSongs] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({ songId: null, progress: 0, active: false });

  const isHandlingEnd = useRef(false);

  // Load danh sách đã tải khi khởi động
  useEffect(() => {
    const loadDownloads = async () => {
      const map = await getDownloadedSongsMap();
      setDownloadedSongs(map);
    };
    loadDownloads();
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  useEffect(() => {
    if (playbackStatus?.didJustFinish && !isHandlingEnd.current) {
      isHandlingEnd.current = true;
      handleTrackEnd();
    } else if (!playbackStatus?.didJustFinish) {
      isHandlingEnd.current = false;
    }
  }, [playbackStatus?.didJustFinish]);

  const handleTrackEnd = async () => {
    if (repeatMode === 'one') {
      if (sound) {
        try {
          await sound.replayAsync();
        } catch (error) {
          console.error("Error replaying:", error);
        }
      }
    } else if (repeatMode === 'all') {
      handleNext(true);
    } else {
      setIsPlaying(false);
      if (sound) {
        try {
          await sound.setPositionAsync(0);
          await sound.pauseAsync();
        } catch (error) {
          console.error("Error resetting position:", error);
        }
      }
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    setPlaybackStatus(status);
    
    if (!status.isLoaded) {
      if (!isLoading) {
        setIsPlaying(false);
      }
      return;
    }
    
    if (!status.didJustFinish) {
      setIsPlaying(status.isPlaying);
    }
  };

 const playTrack = async (track, list = [], options = {}) => {
    if (!options.isContinuation && track && track.id !== currentTrack?.id) {
       addSongToHistory(track);
    }
    if (isLoading) return;
    setIsLoading(true);
    if (sound) {
      await sound.unloadAsync(); setSound(null); setPlaybackStatus(null);
    }

    if (track) {
      setCurrentTrack(track);
      if (!options.isContinuation) {
           const newList = list.length > 0 ? list : [track];
           setOriginalSongList(newList);
           if (isShuffleOn) { /* ... shuffle logic ... */ }
           else { setActiveSongList(newList); }
      }

      try {
        let source;
        const localUri = downloadedSongs[track.id]; // Ưu tiên offline

        if (localUri) {
          console.log(`Playing offline version: ${localUri}`);
          source = { uri: localUri };
        } else if (typeof track.url === 'string') { // Link web
          source = { uri: track.url };
        } else {
          // --- XỬ LÝ REQUIRE ---
          // Tìm lại bài hát gốc trong MOCK_SONGS bằng ID
          const originalSong = MOCK_SONGS.find(song => song.id === track.id);
          if (originalSong && typeof originalSong.url !== 'string') {
             // Lấy require() gốc từ MOCK_SONGS
             console.log("Playing from original require() source");
             source = originalSong.url;
          } else if (typeof track.url !== 'string') {
             // Nếu không tìm thấy hoặc track.url không phải require() gốc? Vẫn thử dùng nó
             console.warn("Could not find original song in MOCK_SONGS, attempting to play passed source");
             source = track.url;
          } else {
             // Trường hợp url là string nhưng không phải link web? (Lỗi logic?)
             throw new Error("Invalid track source type after checks.");
          }
          // --- KẾT THÚC XỬ LÝ REQUIRE ---
        }

        if (!source) throw new Error("Could not determine valid playback source.");

        const { sound: newSound } = await Audio.Sound.createAsync(
          source,
          { shouldPlay: true, volume: volume },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
      } catch (error) {
        console.error("Lỗi khi tải/phát bài hát:", error);
        
        // Fallback: nếu phát offline lỗi, thử phát từ bundle
        if (localUri && track.url && typeof track.url !== 'string') {
          console.log("Phát offline lỗi, thử phát từ bundle...");
          try {
            const { sound: newSound } = await Audio.Sound.createAsync(
              track.url,
              { shouldPlay: true, volume: volume },
              onPlaybackStatusUpdate
            );
            setSound(newSound);
            setIsPlaying(true);
            
            // Xóa thông tin file offline bị lỗi
            await removeDownloadedSongInfo(track.id);
            setDownloadedSongs(prev => {
              const newMap = {...prev};
              delete newMap[track.id];
              return newMap;
            });
          } catch (fallbackError) {
            console.error("Lỗi khi phát từ bundle:", fallbackError);
            setIsPlaying(false);
            setCurrentTrack(null);
            setPlaybackStatus(null);
          }
        } else {
          setIsPlaying(false);
          setCurrentTrack(null);
          setPlaybackStatus(null);
        }
      }
    } else {
      setCurrentTrack(null);
      setIsPlaying(false);
      setPlaybackStatus(null);
    }
    
    setIsLoading(false);
  };

  const downloadSong = async (song) => {
    if (!song || !song.url || typeof song.url !== 'string') {
        Alert.alert("Lỗi", "Không thể tải bài hát này (thiếu URL web).");
        return;
    }
    if (downloadProgress.active) {
        Alert.alert("Đang tải", "Một bài hát khác đang được tải về.");
        return;
    }
    if (downloadedSongs[song.id]) {
        Alert.alert("Đã tải", "Bài hát này đã được tải về.");
        return;
    }

    // Callback cập nhật tiến trình
    const callback = downloadProgress => {
      // Đảm bảo totalBytesExpectedToWrite > 0 để tránh chia cho 0
      const progress = downloadProgress.totalBytesExpectedToWrite > 0
        ? downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite
        : 0; // Hoặc giá trị mặc định khác nếu cần
      setDownloadProgress({ songId: song.id, progress: progress, active: true });
    };

    try {
        // Lấy đường dẫn thư mục nhạc (sử dụng hàm cũ từ Database.js)
        const musicDir = await getMusicDirectory();
        const filename = `${song.id}_${song.title.replace(/[^a-zA-Z0-9.-]/g, '_')}.mp3`;
        const fileUri = musicDir + filename; // Đường dẫn file cục bộ cuối cùng

        console.log(`Bắt đầu tải: ${song.url} -> ${fileUri}`);
        setDownloadProgress({ songId: song.id, progress: 0, active: true });

        // ✅✅✅ SỬ DỤNG API MỚI ✅✅✅
        const downloadInstance = new FileSystem.DownloadResumable(
            song.url,
            fileUri, // Đường dẫn file cục bộ
            {}, // Tùy chọn (ví dụ: headers)
            callback // Callback tiến trình
            // Resume data (để tiếp tục tải nếu bị gián đoạn - bỏ qua trong ví dụ này)
        );
        // ✅✅✅ KẾT THÚC SỬ DỤNG API MỚI ✅✅✅

        setDownloadResumable(downloadInstance); // Lưu lại để hủy

        const result = await downloadInstance.downloadAsync();
        setDownloadResumable(null);

        if (result?.status === 200) {
            console.log('Tải thành công:', result.uri);
            await saveDownloadedSong(song.id, result.uri);
            setDownloadedSongs(prev => ({ ...prev, [song.id]: result.uri }));
            setDownloadProgress({ songId: song.id, progress: 1, active: false });
            Alert.alert('Thành công', `Đã tải "${song.title}"`);
        } else {
            console.error('Tải thất bại, status:', result?.status, 'URI:', result?.uri);
             // Cố gắng xóa file tạm nếu tải thất bại
             if (result?.uri) {
                await FileSystem.deleteAsync(result.uri, { idempotent: true });
             }
            setDownloadProgress({ songId: song.id, progress: 0, active: false });
            Alert.alert('Lỗi', `Tải bài hát thất bại (Status: ${result?.status})`);
        }
    } catch (e) {
        console.error('Lỗi nghiêm trọng khi tải:', e);
        setDownloadResumable(null);
        setDownloadProgress({ songId: song.id, progress: 0, active: false });
        Alert.alert('Lỗi', `Đã xảy ra lỗi khi tải bài hát: ${e.message}`);
         // Cố gắng xóa file tạm nếu có lỗi
         // (Cần lấy fileUri từ bên trong try hoặc cấu trúc lại)
    }
  };

  // --- (6) HÀM MỚI: Hủy Download (SỬ DỤNG API MỚI) ---
  const cancelDownload = async () => {
      if (downloadResumable) {
          console.log("Hủy tải về...");
          try {
              // ✅✅✅ API MỚI ĐỂ HỦY ✅✅✅
              await downloadResumable.cancelAsync();
          } catch (e) {
              console.error("Lỗi khi hủy tải:", e);
              // Có thể file đã tải xong hoặc có lỗi khác
          } finally {
              setDownloadResumable(null);
              setDownloadProgress({ songId: null, progress: 0, active: false });
              // Cân nhắc xóa file tạm ở đây nếu cần
          }
      }
  };

  const deleteDownloadedSong = async (songId) => {
    const localUri = downloadedSongs[songId];
    if (!localUri) return;

    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc muốn xóa bản offline của bài hát này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(localUri, { idempotent: true });
              await removeDownloadedSongInfo(songId);
              setDownloadedSongs(prev => {
                const newMap = {...prev};
                delete newMap[songId];
                return newMap;
              });
              console.log(`Đã xóa file offline: ${localUri}`);
              Alert.alert("Đã xóa", "Đã xóa bản offline của bài hát.");
            } catch (e) {
              console.error('Lỗi khi xóa file offline:', e);
              await removeDownloadedSongInfo(songId);
              setDownloadedSongs(prev => {
                const newMap = {...prev};
                delete newMap[songId];
                return newMap;
              });
              Alert.alert("Lỗi", "Không thể xóa file offline.");
            }
          }
        }
      ]
    );
  };

  const changeVolume = async (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    if (sound && !isLoading) {
      try {
        await sound.setVolumeAsync(clampedVolume);
      } catch (error) {
        console.error("Error setting volume:", error);
      }
    }
  };

  const togglePlayPause = async () => {
    if (isLoading || !sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        const status = await sound.getStatusAsync();
        
        if (status.didJustFinish) {
          await sound.setPositionAsync(0);
          await sound.playAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  };

  const handleNext = (isFromRepeat = false) => {
    if (isLoading) return;
    if (!currentTrack || activeSongList.length === 0) return;
    
    const currentIndex = activeSongList.findIndex(t => t.id === currentTrack.id);
    
    if (currentIndex === activeSongList.length - 1) {
      if (repeatMode === 'all' || isFromRepeat) {
        playTrack(activeSongList[0], [], { isContinuation: true });
      } else {
        return;
      }
    } else {
      const nextIndex = currentIndex + 1;
      playTrack(activeSongList[nextIndex], [], { isContinuation: true });
    }
  };

  const handlePrevious = () => {
    if (isLoading) return;
    if (!currentTrack || activeSongList.length === 0) return;
    
    const currentIndex = activeSongList.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + activeSongList.length) % activeSongList.length;
    playTrack(activeSongList[prevIndex], [], { isContinuation: true });
  };

  const seek = async (position) => {
    if (isLoading || !sound) return;
    
    const seekPosition = Math.max(0, Math.floor(position));
    if (isNaN(seekPosition)) return;

    try {
      await sound.setPositionAsync(seekPosition);
      
      if (!isPlaying) {
        await sound.pauseAsync();
      }
    } catch (error) {
      console.error("Seek error:", error);
    }
  };

  const toggleShuffle = () => {
    const newShuffleState = !isShuffleOn;
    setIsShuffleOn(newShuffleState);

    if (newShuffleState) {
      if (currentTrack) {
        const otherSongs = originalSongList.filter(t => t.id !== currentTrack.id);
        const shuffled = [currentTrack, ...shuffleArray(otherSongs)];
        setActiveSongList(shuffled);
      } else {
        setActiveSongList(shuffleArray([...originalSongList]));
      }
    } else {
      setActiveSongList([...originalSongList]);
    }
  };

  const cycleRepeatMode = () => {
    let nextMode;
    if (repeatMode === 'off') {
      nextMode = 'all';
    } else if (repeatMode === 'all') {
      nextMode = 'one';
    } else {
      nextMode = 'off';
    }
    setRepeatMode(nextMode);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        sound,
        currentTrack,
        isPlaying,
        playbackStatus,
        repeatMode,
        isShuffleOn,
        isLoading,
        playTrack,
        togglePlayPause,
        handleNext,
        handlePrevious,
        seek,
        toggleShuffle,
        cycleRepeatMode,
        volume,
        changeVolume,
        downloadedSongs,
        downloadProgress,
        downloadSong,
        deleteDownloadedSong,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};