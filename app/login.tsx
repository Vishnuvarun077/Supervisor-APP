import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiService } from '../services/ApiService';

const { height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const [supervisorId, setSupervisorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleLogin = async () => {
    if (!supervisorId.trim()) {
      setError('Supervisor ID is required');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await ApiService.sendOtp(supervisorId.trim());
      
      if (response.success && response.tempToken) {
        const navigationParams = {
          supervisorId: supervisorId.trim(),
          tempToken: response.tempToken 
        };
        
        router.push({
          pathname: '/otp',
          params: navigationParams
        });
      } else {
        const errorMessage = response.message || 'Failed to send OTP. Please try again.';
        setError(errorMessage);
      }
      
    } catch (error) {
      const errorMessage = 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (text: string) => {
    setSupervisorId(text);
    if (error) {
      setError('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/images/icon.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <Text style={styles.title}>Supervisor Login</Text>
              <Text style={styles.subtitle}>Enter your credentials to continue</Text>
            </View>
            
            {/* Form Section */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Supervisor ID</Text>
                <TextInput
                  style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    error && styles.inputError
                  ]}
                  value={supervisorId}
                  onChangeText={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Enter your supervisor ID"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                  keyboardType="default"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  editable={!isLoading}
                />
              </View>
              
              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}
              
              {/* Submit Button */}
              <TouchableOpacity 
                style={[
                  styles.button,
                  isLoading && styles.buttonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.loadingText}>Sending OTP...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: screenHeight * 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    color: '#212529',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: {
    borderColor: '#007bff',
    shadowColor: '#007bff',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '500',
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
});





// import React, { useState } from 'react';
// import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
// import { router } from 'expo-router';
// import { useAuth } from '../context/AuthContext';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { ApiService } from '../services/ApiService';

// export default function LoginScreen() {
//   const [supervisorId, setSupervisorId] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
  
//   const handleLogin = async () => {
//     if (!supervisorId.trim()) {
//       setError('Supervisor ID is required');
//       return;
//     }
    
//     setError('');
//     setIsLoading(true);
    
//     try {
//       // Call the API to send OTP
//       const response = await ApiService.sendOtp(supervisorId.trim());
      
//       if (response.success && response.tempToken) {
//         // Navigate to OTP screen with the temp token
//         router.push({
//           pathname: '/otp',
//           params: { 
//             supervisorId: supervisorId.trim(),
//             tempToken: response.tempToken 
//           }
//         });
//       } else {
//         setError(response.message || 'Failed to send OTP. Please try again.');
//       }
//     } catch (error) {
//       setError('Network error. Please check your connection and try again.');
//       console.error('Login error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         <Image 
//           source={require('../assets/images/icon.png')} 
//           style={styles.logo} 
//           resizeMode="contain"
//         />
        
//         <Text style={styles.title}>Supervisor Login</Text>
        
//         <View style={styles.inputContainer}>
//           <Text style={styles.label}>Supervisor ID</Text>
//           <TextInput
//             style={styles.input}
//             value={supervisorId}
//             onChangeText={setSupervisorId}
//             placeholder="Enter your ID"
//             autoCapitalize="characters"
//             autoCorrect={false}
//           />
//         </View>
        
//         {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
//         <TouchableOpacity 
//           style={styles.button}
//           onPress={handleLogin}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Send OTP</Text>
//           )}
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
//     alignItems: 'center',
//   },
//   logo: {
//     width: 150,
//     height: 150,
//     marginBottom: 30,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 30,
//     color: '#333',
//   },
//   inputContainer: {
//     width: '100%',
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//     color: '#333',
//   },
//   input: {
//     backgroundColor: '#fff',
//     width: '100%',
//     padding: 15,
//     borderRadius: 8,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#ddd',
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
//   },
// });