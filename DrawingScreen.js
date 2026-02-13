import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder, Alert, Image } from 'react-native';
import Svg, { Path, Rect, Line, Circle as SvgCircle } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import { supabase } from './supabaseConfig';
import Slider from '@react-native-community/slider';

export default function DrawingScreen({ navigation }) {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const canvasRef = useRef(null);

  // Available colors matching Figma
  const colors = [
    '#EA7171', // red
    '#EABC71', // orange
    '#EAEA71', // yellow
    '#8BEA71', // green
    '#71A7EA', // blue
    '#A171EA', // purple
    '#000000', // black
    '#9A7731', // brown
  ];

  const currentColorRef = useRef(currentColor);
  const currentSizeRef = useRef(currentSize);
  const isEraserRef = useRef(isEraser);
  
  currentColorRef.current = currentColor;
  currentSizeRef.current = currentSize;
  isEraserRef.current = isEraser;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setCurrentPath({
          pathData: `M${locationX},${locationY}`,
          color: isEraserRef.current ? '#FDFBF7' : currentColorRef.current,
          strokeWidth: isEraserRef.current ? 20 : currentSizeRef.current,
        });
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setCurrentPath((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            pathData: `${prev.pathData} L${locationX},${locationY}`,
          };
        });
      },
      onPanResponderRelease: () => {
        setCurrentPath((prev) => {
          if (prev && prev.pathData) {
            setPaths((prevPaths) => [...prevPaths, prev]);
          }
          return null;
        });
      },
    })
  ).current;

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath(null);
  };

  const undoLastStroke = () => {
    if (paths.length > 0) {
      setPaths(paths.slice(0, -1));
    }
  };

  const saveDrawing = async () => {
    if (paths.length === 0) {
      Alert.alert('Error', 'Please draw something first!');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'Please log in');
        return;
      }

      const uri = await canvasRef.current.capture();
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${user.id}/${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('drawings')
        .upload(fileName, blob, {
          contentType: 'image/png',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert('Error', 'Failed to upload drawing');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('drawings')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('user_drawings')
        .insert([
          {
            user_id: user.id,
            image_url: publicUrl,
          }
        ]);

      if (dbError) {
        console.error('Database error:', dbError);
        Alert.alert('Error', 'Failed to save drawing');
        return;
      }

      Alert.alert('Success', 'Drawing saved to library!');
      clearCanvas();
      
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save drawing');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Border */}
      <View style={styles.topBorder} />

      {/* Menu Button */}
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuOpen(!menuOpen)}
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
        
        {menuOpen && (
          <View style={styles.dropdown}>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                setMenuOpen(false);
                navigation.navigate('Library');
              }}
            >
              <Text style={styles.dropdownText}>Library</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Drawing Canvas */}
      <ViewShot ref={canvasRef} options={{ format: 'png', quality: 0.9 }} style={styles.canvasWrapper}>
        <View style={styles.canvasContainer} {...panResponder.panHandlers}>
          <Svg height="100%" width="100%">
            <Rect width="100%" height="100%" fill="#FDFBF7" />
            
            {paths.map((p, index) => (
              <Path
                key={`path-${index}`}
                d={p.pathData}
                stroke={p.color}
                strokeWidth={p.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            
            {currentPath && (
              <Path
                d={currentPath.pathData}
                stroke={currentPath.color}
                strokeWidth={currentPath.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </View>
      </ViewShot>

      {/* Bottom Controls Section */}
      <View style={styles.controlsSection}>
        {/* Draw/Erase Toggle */}
        <View style={styles.toolToggleRow}>
          <TouchableOpacity 
            style={[styles.toolToggleButton, !isEraser && styles.toolToggleActive]}
            onPress={() => setIsEraser(false)}
          >
            <Text style={styles.toolToggleText}>draw ✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toolToggleButton, isEraser && styles.toolToggleActive]}
            onPress={() => setIsEraser(true)}
          >
            <Text style={styles.toolToggleText}>erase 🧹</Text>
          </TouchableOpacity>
        </View>

        {/* Size Slider */}
        <View style={styles.sliderContainer}>
          <Svg height="80" width="100%" viewBox="0 0 400 80">
            <Line
              x1="20"
              y1="40"
              x2="380"
              y2="40"
              stroke="#706A61"
              strokeWidth="4"
            />
            <SvgCircle
              cx={20 + ((currentSize - 1) / 19) * 360}
              cy="40"
              r="20"
              fill="#FDFBF7"
              stroke="#706A61"
              strokeWidth="4"
            />
          </Svg>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={20}
            value={currentSize}
            onValueChange={setCurrentSize}
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            thumbTintColor="transparent"
          />
        </View>

        {/* Color Palette */}
        <View style={styles.colorPalette}>
          <View style={styles.colorRow}>
            {colors.slice(0, 4).map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor,
                ]}
                onPress={() => setCurrentColor(color)}
              />
            ))}
          </View>
          <View style={styles.colorRow}>
            {colors.slice(4, 8).map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor,
                ]}
                onPress={() => setCurrentColor(color)}
              />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.saveButton} onPress={saveDrawing}>
            <Text style={styles.buttonTextWhite}>save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.undoButton} onPress={undoLastStroke}>
            <Text style={styles.buttonTextWhite}>undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
            <Text style={styles.buttonTextBlack}>clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Border */}
      <View style={styles.bottomBorder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  topBorder: {
    height: 40,
    backgroundColor: '#ABA59C',
  },
  menuContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
  },
  menuButton: {
    width: 60,
    height: 60,
    backgroundColor: '#E6DFD3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#706A61',
    marginVertical: 3,
    borderRadius: 2,
  },
  dropdown: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 150,
  },
  dropdownItem: {
    padding: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  canvasWrapper: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 10,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  controlsSection: {
    backgroundColor: '#E6DFD3',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  toolToggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  toolToggleButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 70,
    backgroundColor: '#fff',
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  toolToggleActive: {
    backgroundColor: '#D4CFC3',
  },
  toolToggleText: {
    fontSize: 20,
    color: '#333',
  },
  sliderContainer: {
    height: 80,
    marginBottom: 20,
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  colorPalette: {
    marginBottom: 20,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  colorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedColor: {
    borderWidth: 4,
    borderColor: '#333',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  saveButton: {
    backgroundColor: '#706A61',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 72,
    flex: 1,
    alignItems: 'center',
  },
  undoButton: {
    backgroundColor: '#706A61',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 72,
    flex: 1,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FDFBF7',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 72,
    flex: 1,
    alignItems: 'center',
  },
  buttonTextWhite: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  buttonTextBlack: {
    color: '#000',
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  bottomBorder: {
    height: 40,
    backgroundColor: '#ABA59C',
  },
});