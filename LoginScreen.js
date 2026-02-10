import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from './supabaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      console.log('Logged in:', data.user);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainBackground}>
        {/* Left stripe */}
        <View style={styles.leftStripe} />
        
        {/* Content area */}
        <View style={styles.contentArea}>
          {/* Login Frame */}
          <View style={styles.loginFrame}>
            <Text style={styles.loginTitle}>LOGIN</Text>
            
            {/* Email Input - label and line on same row */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <View style={styles.inputLineContainer}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#ABA59C"
                />
                <View style={styles.inputUnderline} />
              </View>
            </View>

            {/* Password Input - label and line on same row */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputLineContainer}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#ABA59C"
                />
                <View style={styles.inputUnderlineShort} />
              </View>
            </View>

            {/* Sign up link and Login button on same line */}
            <View style={styles.signupLinkContainer}>
              <View style={styles.signupTextWrapper}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.signupLink}>Sign up here</Text>
                </TouchableOpacity>
              </View>
              
              {/* Login button on the right */}
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Paper label section */}
          <View style={styles.paperLabel}>
            {/* Left orange stripe */}
            <View style={styles.orangeStripeLeft} />
            
            {/* DoodleBoard text */}
            <Text style={styles.doodleBoardText}>DoodleBoard</Text>
            
            {/* Bottom orange bar */}
            <View style={styles.orangeBarBottom} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: '5%',
  },
  mainBackground: {
    flex: 1,
    width: '100%',
    backgroundColor: '#ABA59C',
    flexDirection: 'row',
  },
  leftStripe: {
    width: '5%',
    backgroundColor: '#8C867D',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: '3%',
    paddingVertical: 10,
    justifyContent: 'flex-start',
  },
  loginFrame: {
    paddingVertical: '4%',
    paddingHorizontal: '4%',
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#8C867D',
    gap: 20,
    marginTop: '50%',
    marginHorizontal: '-4%',  // Match contentArea padding
  },
  loginTitle: {
    color: '#766F65',
    fontFamily: 'helvetica',
    fontSize: 35,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputLabel: {
    color: '#766F65',
    fontFamily: 'helvetica',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.4,
    width: '30%',  // Percentage-based width
  },
  inputLineContainer: {
    flex: 1,
  },
  input: {
    color: '#766F65',
    fontFamily: 'helvetica',
    fontSize: 16,
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  inputUnderline: {
    height: 2,
    backgroundColor: '#767168',
    width: '90%',
  },
  inputUnderlineShort: {
    height: 2,
    backgroundColor: '#767168',
    width: '80%',
  },
  signupLinkContainer: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    gap: 20,
  },
  signupTextWrapper: {
    flexDirection: 'row',
    flexShrink: 1,
  },
  signupText: {
    color: '#766F65',
    fontFamily: 'helvetica',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  signupLink: {
    color: '#766F65',
    fontFamily: 'helvetica',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
    textDecorationLine: 'underline',
  },
  paperLabel: {
    backgroundColor: '#FCF8F2',
    paddingVertical: '5%',
    paddingHorizontal: '5%',
    position: 'relative',
    marginTop: '16%',
    marginLeft: '-9%',  // Covers leftStripe (10%) + contentArea padding (3%)
    marginRight: '-3%',   // Match contentArea padding
    marginBottom: -10,
    minHeight: 200,  // Changed to minHeight for flexibility
  },
  orangeStripeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3%',  // Percentage-based
    backgroundColor: '#EDBB6F',
  },
  doodleBoardText: {
    color: '#766F65',
    fontFamily: 'helvetica',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginLeft: '5%',  // Percentage-based
  },
  orangeBarBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '16%',  // Percentage-based
    backgroundColor: '#EDBB6F',
  },
  loginButton: {
    backgroundColor: '#EDBB6F',
    paddingVertical: 6,
    paddingHorizontal: '6%',  // Percentage-based
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#766F65',
    fontFamily: 'helvetica',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});