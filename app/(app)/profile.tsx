import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import StyledButton from '../../components/StyledButton';
import Colors from '../../constants/Colors';

interface User {
  id: string;
  name: string;
  zone: string;
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load profile information');
      }
    };

    loadUser();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: signOut, style: 'destructive' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'S'}</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        {user ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Supervisor ID</Text>
              <Text style={styles.infoValue}>{user.id}</Text>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Zone</Text>
              <Text style={styles.infoValue}>{user.zone}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading profile information...</Text>
        )}
      </View>
      
      <View style={styles.footer}>
        <StyledButton
          title="Logout"
          onPress={handleSignOut}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: Colors.light.tint,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  infoContainer: {
    backgroundColor: Colors.light.card,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.light.icon,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  footer: {
    padding: 20,
    marginTop: 'auto',
  },
  loadingText: {
    textAlign: 'center',
    color: Colors.light.icon,
    padding: 20,
  }
});
