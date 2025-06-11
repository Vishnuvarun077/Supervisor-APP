import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OtpScreen() {
  const { supervisorId } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);
  
  const handleResendOtp = async () => {
    setCountdown(60);
    // In a real app, call API to resend OTP
    console.log('Resending OTP for supervisor:', supervisorId);
  };
  
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // In a real app, call API to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful verification
      await signIn('mock-token-123', {
        id: supervisorId as string,
        name: 'Supervisor Name',
        zone: 'North Zone'
      });
      
      router.replace('/data-table');
    } catch (error) {
      setError('Invalid OTP. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter OTP</Text>
        
        <Text style={styles.description}>
          Please enter the 6-digit code sent to your registered mobile number.
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter OTP"
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleVerifyOtp}
          disabled={isLoading || !otp}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.resendContainer}>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>Resend OTP in {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 15,
    borderRadius: 8,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
    letterSpacing: 10,
  },
  button: {
    backgroundColor: '#007bff',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  countdownText: {
    color: '#666',
  },
  resendText: {
    color: '#007bff',
    fontWeight: '600',
  },
  backButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
