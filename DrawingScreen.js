import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

export default function DrawingScreen() {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const canvasRef = useRef(null);

  // Available colors
  const colors = [
    { name: 'black', value: '#000000' },
    { name: 'white', value: '#FFFFFF' },
    { name: 'red', value: '#FF0000' },
    { name: 'orange', value: '#FFA500' },
    { name: 'blue', value: '#0000FF' },
  ];

  const sizes = [2, 5, 12];

  // Use refs to store the latest values
  const currentColorRef = useRef(currentColor);
  const currentSizeRef = useRef(currentSize);
  const isEraserRef = useRef(isEraser);
  
  // Update refs whenever state changes
  currentColorRef.current = currentColor;
  currentSizeRef.current = currentSize;
  isEraserRef.current = isEraser;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        // Start a new path with current settings from refs
        // If eraser, use tan color (#D2B48C) to "erase"
        setCurrentPath({
          pathData: `M${locationX},${locationY}`,
          color: isEraserRef.current ? '#D2B48C' : currentColorRef.current,
          strokeWidth: isEraserRef.current ? 10 : currentSizeRef.current, // Eraser is bigger
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
            // Save the completed path
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

  const toggleEraser = () => {
    setIsEraser(!isEraser);
  };

  return (
    <View style={styles.container}>
      {/* Menu Button */}
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuOpen(!menuOpen)}
        >
          <Text style={styles.menuIcon}>☰</Text>
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
            {/* Add more menu items here later */}
          </View>
        )}
      </View>
      {/* Drawing Canvas */}
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%">
          {/* Tan background */}
          <Rect width="100%" height="100%" fill="#D2B48C" />
          
          {/* Draw all completed paths */}
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
          
          {/* Current path being drawn */}
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

      {/* Tool Selection (Pen or Eraser) */}
      <View style={styles.toolContainer}>
        <TouchableOpacity 
          style={[styles.toolButton, !isEraser && styles.selectedTool]}
          onPress={() => setIsEraser(false)}
        >
          <Text style={styles.toolText}>✏️ Pen</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toolButton, isEraser && styles.selectedTool]}
          onPress={toggleEraser}
        >
          <Text style={styles.toolText}>🧹 Eraser</Text>
        </TouchableOpacity>
      </View>

      {/* Color Picker - only show when not in eraser mode */}
      {!isEraser && (
        <View style={styles.colorContainer}>
          <Text style={styles.label}>Color:</Text>
          {colors.map((color) => (
            <TouchableOpacity
              key={color.value}
              style={[
                styles.colorButton,
                { backgroundColor: color.value },
                currentColor === color.value && styles.selectedButton,
                color.value === '#FFFFFF' && styles.whiteBorder,
              ]}
              onPress={() => setCurrentColor(color.value)}
            />
          ))}
        </View>
      )}

      {/* Size Picker - only show when not in eraser mode */}
      {!isEraser && (
        <View style={styles.sizeContainer}>
          <Text style={styles.label}>Size:</Text>
          {sizes.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeButton,
                currentSize === size && styles.selectedButton,
              ]}
              onPress={() => setCurrentSize(size)}
            >
              <Text>{size === 2 ? 'S' : size === 5 ? 'M' : 'L'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.completeButton}>
          <Text style={styles.buttonText}>Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    zIndex: 1000,
  },
  menuButton: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 24,
    color: '#333',
  },
  dropdown: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    minWidth: 150,
  },
  dropdownItem: {
    padding: 15,
    borderRadius: 5,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 50,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#D2B48C',
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  toolContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
  },
  toolButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedTool: {
    backgroundColor: '#4CAF50',
  },
  toolText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  label: {
    marginRight: 10,
    fontWeight: 'bold',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  whiteBorder: {
    borderWidth: 2,
    borderColor: '#ccc',
  },
  selectedButton: {
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  sizeContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sizeButton: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-around',
    backgroundColor: '#fff',
  },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});