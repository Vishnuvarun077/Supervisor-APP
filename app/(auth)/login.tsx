import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import StyledInput from '../../components/StyledInput';
import StyledButton from '../../components/StyledButton';
import { ApiService } from '../../services/ApiService';
import Colors from '../../constants/Colors';

export default function LoginScreen() {
  const [supervisorId, setSupervisorId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!supervisorId.trim()) {
      Alert.alert('Validation Error', 'Supervisor ID cannot be empty.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await ApiService.sendOtp(supervisorId.trim());
      
      if (response.success && response.temp_token) {
        // Navigate to OTP screen with params
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { 
            supervisorId: supervisorId.trim(), 
            tempToken: response.temp_token 
          }
        });
      } else {
        Alert.alert('Login Failed', response.message || 'An unknown error occurred.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Supervisor Login</Text>
          
          <Text style={styles.subtitle}>
            Enter your Supervisor ID to receive an OTP on your registered mobile number.
          </Text>
          
          <StyledInput
            icon="id-card"
            placeholder="Enter Supervisor ID"
            value={supervisorId}
            onChangeText={setSupervisorId}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          
          <StyledButton
            title="Send OTP"
            onPress={handleSendOtp}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: Colors.light.tint,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.light.icon,
    marginBottom: 40,
  },
});
