import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Mock data for the table
const mockData = [
  { id: '1', name: 'John Doe', task: 'Inspection', status: 'Completed', date: '2023-06-01' },
  { id: '2', name: 'Jane Smith', task: 'Maintenance', status: 'Pending', date: '2023-06-02' },
  { id: '3', name: 'Robert Johnson', task: 'Survey', status: 'In Progress', date: '2023-06-03' },
  { id: '4', name: 'Emily Davis', task: 'Repair', status: 'Completed', date: '2023-06-04' },
  { id: '5', name: 'Michael Wilson', task: 'Inspection', status: 'Pending', date: '2023-06-05' },
  { id: '6', name: 'Sarah Brown', task: 'Maintenance', status: 'Completed', date: '2023-06-06' },
  { id: '7', name: 'David Miller', task: 'Survey', status: 'In Progress', date: '2023-06-07' },
  { id: '8', name: 'Lisa Garcia', task: 'Repair', status: 'Pending', date: '2023-06-08' },
];

export default function DataTableScreen() {
  const { user, signOut } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call to fetch data
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData(mockData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const renderTableHeader = () => {
    return (
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, { flex: 0.5 }]}>ID</Text>
        <Text style={[styles.headerText, { flex: 1.5 }]}>Name</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>Task</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>Status</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>Date</Text>
      </View>
    );
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4caf50';
      case 'Pending': return '#ff9800';
      case 'In Progress': return '#2196f3';
      default: return '#000';
    }
  };
  
  const renderItem = ({ item, index }) => {
    return (
      <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
        <Text style={[styles.cellText, { flex: 0.5 }]}>{item.id}</Text>
        <Text style={[styles.cellText, { flex: 1.5 }]}>{item.name}</Text>
        <Text style={[styles.cellText, { flex: 1 }]}>{item.task}</Text>
        <Text 
          style={[
            styles.cellText, 
            { flex: 1, color: getStatusColor(item.status) }
          ]}
        >
          {item.status}
        </Text>
        <Text style={[styles.cellText, { flex: 1 }]}>{item.date}</Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
          <Text style={styles.zoneText}>Zone: {user?.zone}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Task Assignments</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={renderTableHeader}
            stickyHeaderIndices={[0]}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userInfo: {
    marginTop: 5,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
  },
  zoneText: {
    color: '#e6e6e6',
    fontSize: 14,
  },
  logoutButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    marginLeft: 5,
  },
  tableContainer: {
    flex: 1,
    padding: 15,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  evenRow: {
    backgroundColor: '#fff',
  },
  oddRow: {
    backgroundColor: '#f9f9f9',
  },
  cellText: {
    fontSize: 14,
  },
  loader: {
    marginTop: 50,
  },
});
