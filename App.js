// App.js
import * as React from 'react'; // (1) Đảm bảo import React
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';

// Import các màn hình
import MusicListScreen from './screens/MusicListScreen';
import PlayerScreen from './screens/PlayerScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import PlaylistScreen from './screens/PlaylistScreen';
import PlaylistDetailScreen from './screens/PlaylistDetailScreen';
import HistoryScreen from './screens/HistoryScreen';

// Import Context Provider
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import MiniPlayer from './components/MiniPlayer';

// (KHÔNG cần import 'initDatabase' nữa nếu bạn đã xóa nó ở Phần 3)
// import { initDatabase } from './services/Database'; 

const Stack = createStackNavigator();

function AppStack() {
  return (
    <Stack.Navigator initialRouteName="MusicList">
      <Stack.Screen 
        name="MusicList" 
        component={MusicListScreen} 
        options={{ title: 'Danh sách nhạc' }} 
      />
      <Stack.Screen 
        name="Player" 
        component={PlayerScreen} 
        options={{ 
          title: 'Đang phát', 
          presentation: 'modal',
          gestureEnabled: true,
        }} 
      />
      <Stack.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ title: 'Yêu thích' }} 
      />
      <Stack.Screen 
        name="Playlists" 
        component={PlaylistScreen} 
        options={{ title: 'Playlists' }} 
      />
      <Stack.Screen 
        name="PlaylistDetail" 
        component={PlaylistDetailScreen} 
        options={({ route }) => ({ title: route.params.playlist.name })}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Lịch sử nghe' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  // (2) Thêm state để theo dõi tên màn hình hiện tại
  const [currentScreen, setCurrentScreen] = React.useState('MusicList');

  // React.useEffect(() => {
  //   initDatabase();
  // }, []); // (Giữ lại nếu bạn vẫn dùng)

  return (
    <MusicPlayerProvider>
      <NavigationContainer
        // (3) Thêm prop 'onStateChange'
        // Khi màn hình thay đổi, nó sẽ cập nhật state 'currentScreen'
        onStateChange={(state) => {
          if (state) {
            const routeName = state.routes[state.index]?.name;
            setCurrentScreen(routeName);
          }
        }}
      >
        <View style={styles.container}>
          <AppStack />
          {/* (4) Truyền state 'currentScreen' vào MiniPlayer */}
          <MiniPlayer currentScreen={currentScreen} />
        </View>
      </NavigationContainer>
    </MusicPlayerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});