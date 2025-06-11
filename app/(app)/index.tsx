import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/ApiService';
import * as SecureStore from 'expo-secure-store';
import Colors from '../../constants/Colors';

interface MeterReader {
  id: string;
  name: string;
  pending_readings: number;
}

interface User {
  id: string;
  name: string;
  zone: string;
}

export default function DashboardScreen() {
  const { signOut } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [meterReaders, setMeterReaders] = useState<MeterReader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync('user');
        const session = await SecureStore.getItemAsync('session');
        
        if (storedUser && session) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          const response = await ApiService.getMeterReaders(parsedUser.id, session);
          if (response.success && response.meterReaders) {
            setMeterReaders(response.meterReaders);
          } else {
            Alert.alert('Error', response.message || 'Failed to fetch data.');
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: MeterReader }) => (
    <View style={styles.card}>
      <Text style={styles.readerName}>{item.name}</Text>
      <Text style={styles.readerId}>ID: {item.id}</Text>
      
      <View style={styles.pendingContainer}>
        <Text style={styles.pendingText}>Pending Readings:</Text>
        <Text style={styles.pendingCount}>{item.pending_readings}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Welcome, {user?.name}</Text>
          <Text style={{ color: 'white' }}>Zone: {user?.zone}</Text>
        </View>
        <StyledButton 
          title="Logout" 
          onPress={signOut} 
          variant="secondary"
          style={styles.logoutButton}
        />
      </View>

      <Text style={styles.listHeader}>Your Meter Readers</Text>

      <FlatList
        data={meterReaders}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No meter readers assigned.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// Since StyledButton isn't being imported above, let's create a simple inline version
function StyledButton({ title, onPress, variant = 'primary', style = {} }) {
  return (
    <TouchableOpacity 
      style={[
        { 
          padding: 10, 
          borderRadius: 8, 
          backgroundColor: variant === 'primary' ? Colors.light.tint : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: 'white',
          alignItems: 'center'
        },
        style
      ]} 
      onPress={onPress}
    >
      <Text style={{ color: 'white', fontWeight: '500' }}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    width: 'auto',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  listHeader: {
    fontSize: 20,
    fontWeight: '600',
    margin: 20,
    color: Colors.light.text,
  },
  list: {
    paddingHorizontal: 20,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: Colors.light.card,
  },
  readerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  readerId: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 4,
  },
  pendingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  pendingText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  pendingCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.error,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.icon,
  },
});
