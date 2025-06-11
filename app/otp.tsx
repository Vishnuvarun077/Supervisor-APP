
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiService } from '../services/ApiService';

export default function OtpScreen() {
  const { supervisorId, tempToken } = useLocalSearchParams();
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
    if (!supervisorId || typeof supervisorId !== 'string') {
      Alert.alert('Error', 'Session expired. Please go back and try again.');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await ApiService.sendOtp(supervisorId);
      
      if (response.success && response.tempToken) {
        // Update the tempToken parameter for this screen
        router.setParams({ tempToken: response.tempToken });
        setCountdown(60);
        Alert.alert('Success', 'New OTP sent successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }
    
    if (!supervisorId || !tempToken || typeof supervisorId !== 'string' || typeof tempToken !== 'string') {
      Alert.alert('Error', 'Session information is missing. Please go back and try again.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await ApiService.verifyOtp(supervisorId, otp, tempToken);
      
      if (response.success && response.accessToken && response.supervisor) {
        // Sign in with the received data
        await signIn(response.accessToken, response.supervisor);
        router.replace('/data-table');
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter OTP</Text>
        
        <Text style={styles.description}>
          Please enter the 6-digit code sent to your registered mobile number for Supervisor ID: {supervisorId}
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.otpInput, error && styles.otpInputError]}
            value={otp}
            onChangeText={(text) => {
              setOtp(text.replace(/[^0-9]/g, ''));
              if (error) setError('');
            }}
            placeholder="Enter OTP"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus={true}
          />
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}
        
        <TouchableOpacity 
          style={[styles.button, (!otp || isLoading) && styles.buttonDisabled]}
          onPress={handleVerifyOtp}
          disabled={isLoading || !otp}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText}>Verifying...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.resendContainer}>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>Resend OTP in {countdown}s</Text>
          ) : (
            <TouchableOpacity 
              onPress={handleResendOtp}
              disabled={isLoading}
              style={styles.resendButton}
            >
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212529',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 280,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#e9ecef',
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
    color: '#212529',
  },
  otpInputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resendContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  countdownText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  resendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resendText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
});








// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { router, useLocalSearchParams } from 'expo-router';
// import { useAuth } from '../context/AuthContext';
// import { SafeAreaView } from 'react-native-safe-area-context';

// export default function OtpScreen() {
//   const { supervisorId } = useLocalSearchParams();
//   const [otp, setOtp] = useState('');
//   const [countdown, setCountdown] = useState(60);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { signIn } = useAuth();
  
//   useEffect(() => {
//     let timer: NodeJS.Timeout;
    
//     if (countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//     }
    
//     return () => {
//       if (timer) clearTimeout(timer);
//     };
//   }, [countdown]);
  
//   const handleResendOtp = async () => {
//     setCountdown(60);
//     // In a real app, call API to resend OTP
//     console.log('Resending OTP for supervisor:', supervisorId);
//   };
  
//   const handleVerifyOtp = async () => {
//     if (!otp || otp.length < 4) {
//       setError('Please enter a valid OTP');
//       return;
//     }
    
//     setIsLoading(true);
//     setError('');
    
//     try {
//       // In a real app, call API to verify OTP
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // Mock successful verification
//       await signIn('mock-token-123', {
//         id: supervisorId as string,
//         name: 'Supervisor Name',
//         zone: 'North Zone'
//       });
      
//       router.replace('/data-table');
//     } catch (error) {
//       setError('Invalid OTP. Please try again.');
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         <Text style={styles.title}>Enter OTP</Text>
        
//         <Text style={styles.description}>
//           Please enter the 6-digit code sent to your registered mobile number.
//         </Text>
        
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.otpInput}
//             value={otp}
//             onChangeText={setOtp}
//             placeholder="Enter OTP"
//             keyboardType="number-pad"
//             maxLength={6}
//           />
//         </View>
        
//         {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
//         <TouchableOpacity 
//           style={styles.button}
//           onPress={handleVerifyOtp}
//           disabled={isLoading || !otp}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Verify OTP</Text>
//           )}
//         </TouchableOpacity>
        
//         <View style={styles.resendContainer}>
//           {countdown > 0 ? (
//             <Text style={styles.countdownText}>Resend OTP in {countdown}s</Text>
//           ) : (
//             <TouchableOpacity onPress={handleResendOtp}>
//               <Text style={styles.resendText}>Resend OTP</Text>
//             </TouchableOpacity>
//           )}
//         </View>
        
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <Text style={styles.backButtonText}>Back to Login</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#333',
//     textAlign: 'center',
//   },
//   description: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   inputContainer: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   otpInput: {
//     backgroundColor: '#fff',
//     width: '80%',
//     padding: 15,
//     borderRadius: 8,
//     fontSize: 18,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     textAlign: 'center',
//     letterSpacing: 10,
//   },
//   button: {
//     backgroundColor: '#007bff',
//     width: '100%',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   errorText: {
//     color: 'red',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   resendContainer: {
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   countdownText: {
//     color: '#666',
//   },
//   resendText: {
//     color: '#007bff',
//     fontWeight: '600',
//   },
//   backButton: {
//     marginTop: 30,
//     alignItems: 'center',
//   },
//   backButtonText: {
//     color: '#666',
//     fontSize: 16,
//   },
// });
