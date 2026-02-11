import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { supabase } from './supabaseConfig';

export default function LibraryScreen({ navigation }) {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrawings();
  }, []);

  const loadDrawings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'Please log in');
        return;
      }

      // Get user's drawings from database
      const { data, error } = await supabase
        .from('user_drawings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading drawings:', error);
        Alert.alert('Error', 'Failed to load drawings');
      } else {
        setDrawings(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDrawing = ({ item }) => (
    <TouchableOpacity style={styles.drawingCard}>
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Drawings</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : drawings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No drawings yet!</Text>
          <Text style={styles.emptySubtext}>Create your first drawing</Text>
        </View>
      ) : (
        <FlatList
          data={drawings}
          renderItem={renderDrawing}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    fontSize: 18,
    color: '#4CAF50',
    marginRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  grid: {
    padding: 10,
  },
  drawingCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#D2B48C',
  },
  date: {
    padding: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
});