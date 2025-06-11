import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Dimensions,
  ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/ApiService';

const { width: screenWidth } = Dimensions.get('window');

interface MeterReader {
  id: string;
  name: string;
  mobile: string;
  email: string;
  employee_code: string;
  agency: string;
  division_code: string;
  discom: string;
  pending_readings: number;
  total_assigned: number;
  completion_rate: string;
  status: string;
}

interface SupervisorSummary {
  total_readers: number;
  active_readers: number;
  total_pending: number;
}

export default function DataTableScreen() {
  const { user, signOut, session } = useAuth();
  const [meterReaders, setMeterReaders] = useState<MeterReader[]>([]);
  const [summary, setSummary] = useState<SupervisorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchMeterReaders();
  }, []);
  
  const fetchMeterReaders = async (isRefresh = false) => {
    console.log('🔄 Fetching meter readers data...');
    
    if (!user?.id || !session) {
      Alert.alert('Error', 'User session not found. Please login again.');
      signOut();
      return;
    }
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    
    try {
      const response = await ApiService.getMeterReaders(user.id, session);
      
      console.log('📊 Meter readers response:', response);
      
      if (response.success && response.meterReaders) {
        setMeterReaders(response.meterReaders);
        setSummary(response.summary);
        console.log('✅ Data loaded successfully:', {
          readers: response.meterReaders.length,
          summary: response.summary
        });
      } else {
        setError(response.message || 'Failed to fetch meter readers data');
        Alert.alert('Error', response.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('❌ Error fetching meter readers:', error);
      const errorMessage = 'Network error occurred while fetching data';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchMeterReaders(true);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: signOut }
      ]
    );
  };
  
  const renderDetailedTableHeader = () => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.detailedTableHeader}>
          <Text style={[styles.headerText, { width: 80 }]}>ID</Text>
          <Text style={[styles.headerText, { width: 140 }]}>Name</Text>
          <Text style={[styles.headerText, { width: 110 }]}>Mobile</Text>
          <Text style={[styles.headerText, { width: 100 }]}>Emp Code</Text>
          <Text style={[styles.headerText, { width: 120 }]}>Agency</Text>
          <Text style={[styles.headerText, { width: 100 }]}>Division</Text>
        </View>
      </ScrollView>
    );
  };
  
  const renderDetailedMeterReader = ({ item, index }: { item: MeterReader; index: number }) => {
    const isEven = index % 2 === 0;
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.detailedTableRow, isEven ? styles.evenRow : styles.oddRow]}>
          <Text style={[styles.cellText, { width: 80 }]} numberOfLines={1}>
            {item.id?.slice(-6) || 'N/A'}
          </Text>
          <Text style={[styles.cellText, { width: 140, fontWeight: '600' }]} numberOfLines={2}>
            {item.name || 'Unknown'}
          </Text>
          <Text style={[styles.cellText, { width: 110, fontSize: 11 }]} numberOfLines={1}>
            {item.mobile || 'N/A'}
          </Text>
          <Text style={[styles.cellText, { width: 100, fontSize: 11 }]} numberOfLines={1}>
            {item.employee_code || 'N/A'}
          </Text>
          <Text style={[styles.cellText, { width: 120, fontSize: 11 }]} numberOfLines={2}>
            {item.agency || 'N/A'}
          </Text>
          <Text style={[styles.cellText, { width: 100, fontSize: 11 }]} numberOfLines={1}>
            {item.division_code || 'N/A'}
          </Text>
          <View style={[styles.cellContainer, { width: 80 }]}>
            <Text style={[
              styles.cellText,
              { 
                color: item.pending_readings > 0 ? '#ff6b35' : '#28a745',
                fontWeight: '700'
              }
            ]}>
              {item.pending_readings || 0}
            </Text>
          </View>
          <Text style={[styles.cellText, { width: 80, fontSize: 11, color: '#007bff' }]} numberOfLines={1}>
            {item.completion_rate || '0%'}
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        {error ? (
          <>
            <Ionicons name="alert-circle-outline" size={48} color="#dc3545" />
            <Text style={styles.emptyTitle}>Error Loading Data</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchMeterReaders()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Ionicons name="people-outline" size={48} color="#6c757d" />
            <Text style={styles.emptyTitle}>No Meter Readers Found</Text>
            <Text style={styles.emptyText}>No meter readers are assigned to this supervisor</Text>
          </>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Welcome, {user?.name}</Text>
          <Text style={styles.subtitle}>Supervisor Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Enhanced User Info Card */}
      <View style={styles.userInfoCard}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'S'}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user?.name || 'Supervisor'}</Text>
          <Text style={styles.userInfo}>ID: {user?.id}</Text>
          <Text style={styles.userInfo}>Zone: {user?.zone || 'Not assigned'}</Text>
          <Text style={styles.userInfo}>DISCOM: {user?.discom || 'Not assigned'}</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statsLabel}>Total</Text>
            <Text style={styles.statsValue}>{summary?.total_readers || meterReaders.length}</Text>
          </View>
        </View>
      </View>
      
      {/* Table Container */}
      <View style={styles.tableContainer}>
        <View style={styles.tableTitle}>
          <Text style={styles.tableTitleText}>Meter Readers Details</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={onRefresh}
            disabled={refreshing || loading}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color="#007bff" 
              style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}}
            />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading meter readers...</Text>
          </View>
        ) : (
          <FlatList
            data={meterReaders}
            renderItem={renderDetailedMeterReader}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            ListHeaderComponent={meterReaders.length > 0 ? renderDetailedTableHeader : null}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007bff']}
                tintColor="#007bff"
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={meterReaders.length === 0 ? styles.emptyListContainer : {}}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    opacity: 0.9,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  userInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 3,
  },
  userInfo: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 10,
    color: '#6c757d',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  tableTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  refreshButton: {
    padding: 4,
  },
  detailedTableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#007bff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    minWidth: screenWidth * 2, // Ensures horizontal scroll
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  detailedTableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    minHeight: 50,
    alignItems: 'center',
    minWidth: screenWidth * 2,
  },
  evenRow: {
    backgroundColor: '#f8f9fa',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
  cellContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 12,
    color: '#495057',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6c757d',
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});








// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { useAuth } from '../context/AuthContext';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';

// // Mock data for the table
// const mockData = [
//   { id: '1', name: 'John Doe', task: 'Inspection', status: 'Completed', date: '2023-06-01' },
//   { id: '2', name: 'Jane Smith', task: 'Maintenance', status: 'Pending', date: '2023-06-02' },
//   { id: '3', name: 'Robert Johnson', task: 'Survey', status: 'In Progress', date: '2023-06-03' },
//   { id: '4', name: 'Emily Davis', task: 'Repair', status: 'Completed', date: '2023-06-04' },
//   { id: '5', name: 'Michael Wilson', task: 'Inspection', status: 'Pending', date: '2023-06-05' },
//   { id: '6', name: 'Sarah Brown', task: 'Maintenance', status: 'Completed', date: '2023-06-06' },
//   { id: '7', name: 'David Miller', task: 'Survey', status: 'In Progress', date: '2023-06-07' },
//   { id: '8', name: 'Lisa Garcia', task: 'Repair', status: 'Pending', date: '2023-06-08' },
// ];

// export default function DataTableScreen() {
//   const { user, signOut } = useAuth();
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   useEffect(() => {
//     // Simulate API call to fetch data
//     const fetchData = async () => {
//       try {
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         setData(mockData);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchData();
//   }, []);
  
//   const renderTableHeader = () => {
//     return (
//       <View style={styles.tableHeader}>
//         <Text style={[styles.headerText, { flex: 0.5 }]}>ID</Text>
//         <Text style={[styles.headerText, { flex: 1.5 }]}>Name</Text>
//         <Text style={[styles.headerText, { flex: 1 }]}>Task</Text>
//         <Text style={[styles.headerText, { flex: 1 }]}>Status</Text>
//         <Text style={[styles.headerText, { flex: 1 }]}>Date</Text>
//       </View>
//     );
//   };
  
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Completed': return '#4caf50';
//       case 'Pending': return '#ff9800';
//       case 'In Progress': return '#2196f3';
//       default: return '#000';
//     }
//   };
  
//   const renderItem = ({ item, index }) => {
//     return (
//       <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
//         <Text style={[styles.cellText, { flex: 0.5 }]}>{item.id}</Text>
//         <Text style={[styles.cellText, { flex: 1.5 }]}>{item.name}</Text>
//         <Text style={[styles.cellText, { flex: 1 }]}>{item.task}</Text>
//         <Text 
//           style={[
//             styles.cellText, 
//             { flex: 1, color: getStatusColor(item.status) }
//           ]}
//         >
//           {item.status}
//         </Text>
//         <Text style={[styles.cellText, { flex: 1 }]}>{item.date}</Text>
//       </View>
//     );
//   };
  
//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Dashboard</Text>
//         <View style={styles.userInfo}>
//           <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
//           <Text style={styles.zoneText}>Zone: {user?.zone}</Text>
//         </View>
//         <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
//           <Ionicons name="log-out-outline" size={24} color="#fff" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       </View>
      
//       <View style={styles.tableContainer}>
//         <Text style={styles.tableTitle}>Task Assignments</Text>
        
//         {loading ? (
//           <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
//         ) : (
//           <FlatList
//             data={data}
//             renderItem={renderItem}
//             keyExtractor={item => item.id}
//             ListHeaderComponent={renderTableHeader}
//             stickyHeaderIndices={[0]}
//           />
//         )}
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     backgroundColor: '#007bff',
//     padding: 20,
//     paddingBottom: 15,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 5,
//   },
//   userInfo: {
//     marginTop: 5,
//   },
//   welcomeText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   zoneText: {
//     color: '#e6e6e6',
//     fontSize: 14,
//   },
//   logoutButton: {
//     position: 'absolute',
//     right: 20,
//     top: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   logoutText: {
//     color: '#fff',
//     marginLeft: 5,
//   },
//   tableContainer: {
//     flex: 1,
//     padding: 15,
//   },
//   tableTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 15,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: '#e0e0e0',
//     padding: 10,
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
//   headerText: {
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   evenRow: {
//     backgroundColor: '#fff',
//   },
//   oddRow: {
//     backgroundColor: '#f9f9f9',
//   },
//   cellText: {
//     fontSize: 14,
//   },
//   loader: {
//     marginTop: 50,
//   },
// });
