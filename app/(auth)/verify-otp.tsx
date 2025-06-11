import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/ApiService';
import StyledButton from '../../components/StyledButton';
import Colors from '../../constants/Colors';

export default function VerifyOtpScreen() {
  const { supervisorId, tempToken } = useLocalSearchParams();
  const { signIn } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  
  // Create refs for each input
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Set up the refs array with the correct size
  if (inputRefs.current.length !== 6) {
    inputRefs.current = Array(6).fill(null);
  }

  const handleOtpChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if current filled
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Move to previous input if current cleared
    if (text === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP.');
      return;
    }
    
    if (!supervisorId || typeof supervisorId !== 'string' || !tempToken || typeof tempToken !== 'string') {
      Alert.alert('Error', 'Session details are missing. Please go back and try again.');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.verifyOtp(supervisorId, fullOtp, tempToken);
      
      if (response.success && response.accessToken && response.supervisor) {
        signIn(response.accessToken, response.supervisor);
        router.replace('/(app)');
      } else {
        Alert.alert('Verification Failed', response.message || 'Invalid OTP or session expired.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      
      <Text style={styles.subtitle}>
        An OTP has been sent to the mobile number registered with Supervisor ID: {supervisorId}
      </Text>
      
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => inputRefs.current[index] = ref}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>
      
      <StyledButton
        title="Verify OTP"
        onPress={handleVerify}
        loading={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.light.icon,
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    backgroundColor: '#fff',
    color: Colors.light.text,
  },
});
