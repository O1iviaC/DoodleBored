import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import DrawingScreen from './DrawingScreen';

export default function App() {
  return (
    <>
      <DrawingScreen />
      <StatusBar style="auto" />
    </>
  );
}