import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from './supabaseConfig';

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
  if (!username || !displayName || !email || !password) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  if (password.length < 6) {
    Alert.alert('Error', 'Password must be at least 6 characters');
    return;
  }

  setLoading(true);

  // Create the user account WITHOUT auto-login
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email.trim(),
    password: password,
    options: {
      data: {
        username: username.trim(),
        display_name: displayName.trim(),
      },
      emailRedirectTo: undefined, // Prevents redirect issues
    }
  });

  if (authError) {
    setLoading(false);
    Alert.alert('Signup Failed', authError.message);
    return;
  }

  // Log them out immediately after signup
  await supabase.auth.signOut();

  // Create user record in database
  if (authData.user) {
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          username: username.trim(),
          display_name: displayName.trim(),
          email: email.trim(),
        }
      ]);

    if (dbError) {
      console.log('Database error:', dbError);
    }
  }

  setLoading(false);

  Alert.alert('Success', 'Account created! Please log in.');
  navigation.navigate('Login');
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DoodleBored</Text>
      <Text style={styles.subtitle}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
  },
});