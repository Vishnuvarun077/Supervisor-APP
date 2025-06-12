import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Dimensions,
  ScrollView,
  TextInput,
  Animated,
  Platform,
  StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/ApiService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MeterReader {
  id: string;
  name: string;
  mobile: string;
  email: string;
  employee_code: string;
  agency: string;
  division_code: string;
  discom: string;
  created_at?: string;
  updated_at?: string;
}

interface SupervisorSummary {
  total_readers: number;
  active_readers: number;
}

const ITEMS_PER_PAGE = 25;

const COLUMNS = [
  { key: 'index', title: 'No.', width: 50, align: 'center' as const },
  { key: 'name', title: 'Name', width: 140, align: 'left' as const },
  { key: 'mobile', title: 'Mobile', width: 110, align: 'center' as const },
  { key: 'email', title: 'Email', width: 170, align: 'left' as const },
  { key: 'employee_code', title: 'Emp Code', width: 120, align: 'center' as const }, // Increased from 100 to 120
  { key: 'agency', title: 'Agency', width: 140, align: 'left' as const },
  { key: 'division_code', title: 'Division', width: 90, align: 'center' as const },
  { key: 'discom', title: 'DISCOM', width: 80, align: 'center' as const }
];



// const COLUMNS = [
//   { key: 'index', title: 'No.', width: 50, align: 'center' as const },
//   { key: 'name', title: 'Name', width: 150, align: 'left' as const },
//   { key: 'mobile', title: 'Mobile', width: 110, align: 'center' as const },
//   { key: 'email', title: 'Email', width: 180, align: 'left' as const },
//   { key: 'employee_code', title: 'Emp Code', width: 100, align: 'center' as const },
//   { key: 'agency', title: 'Agency', width: 150, align: 'left' as const },
//   { key: 'division_code', title: 'Division', width: 90, align: 'center' as const },
//   { key: 'discom', title: 'DISCOM', width: 80, align: 'center' as const }
// ];

const TABLE_WIDTH = COLUMNS.reduce((sum, col) => sum + col.width, 0) + 32;

// Animation constants
const HEADER_HEIGHT = 70;
const USER_CARD_HEIGHT = 140;
const CONTROLS_HEIGHT = 80;
const TOTAL_COLLAPSIBLE_HEIGHT = USER_CARD_HEIGHT + CONTROLS_HEIGHT;

export default function DataTableScreen() {
  const { user, signOut, session } = useAuth();
  const [allMeterReaders, setAllMeterReaders] = useState<MeterReader[]>([]);
  const [filteredReaders, setFilteredReaders] = useState<MeterReader[]>([]);
  const [summary, setSummary] = useState<SupervisorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const stickyOpacity = useRef(new Animated.Value(0)).current;
  
  const totalPages = Math.ceil(filteredReaders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = filteredReaders.slice(startIndex, endIndex);
  
  // Filter data based on search query
  const filterData = useMemo(() => {
    if (!searchQuery.trim()) {
      setFilteredReaders(allMeterReaders);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = allMeterReaders.filter(reader => 
      Object.values(reader).some(value => 
        value && String(value).toLowerCase().includes(query)
      )
    );
    setFilteredReaders(filtered);
    setCurrentPage(1);
  }, [searchQuery, allMeterReaders]);
  
  useEffect(() => {
    filterData;
  }, [filterData]);
  
  useEffect(() => {
    fetchMeterReaders();
  }, []);

  // Enhanced animation setup
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      // Header opacity - fade out faster
      const headerOpacityValue = value > 30 ? 0 : 1 - (value / 30);
      
      // Sticky bar opacity - fade in when header fades out
      const stickyOpacityValue = value > 50 ? 1 : value > 20 ? (value - 20) / 30 : 0;
      
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: headerOpacityValue,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(stickyOpacity, {
          toValue: stickyOpacityValue,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY, headerOpacity, stickyOpacity]);
  
  const fetchMeterReaders = async (isRefresh = false) => {
    if (!user?.id || !session) {
      Alert.alert('Error', 'User session not found. Please login again.'); 
      signOut(); 
      return;
    }
    
    if (isRefresh) setRefreshing(true); 
    else setLoading(true);
    setError('');
    
    try {
      const response = await ApiService.getMeterReaders(user.id, session);
      if (response.success && response.meterReaders) {
        setAllMeterReaders(response.meterReaders);
        setFilteredReaders(response.meterReaders);
        setSummary(response.summary);
        setCurrentPage(1);
      } else {
        const msg = response.message || 'Failed to fetch meter readers data';
        setError(msg);
        Alert.alert('Error', msg);
      }
    } catch (err) {
      const msg = 'A network error occurred while fetching data.';
      setError(msg); 
      Alert.alert('Error', msg);
    } finally {
      setLoading(false); 
      setRefreshing(false);
    }
  };

  const onRefresh = () => fetchMeterReaders(true);
  
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

  const goToPage = (page: number) => { 
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const clearSearch = () => setSearchQuery('');

  const getCellContent = (key: string, item: MeterReader, indexInPage: number): string => {
    if (key === 'index') return (startIndex + indexInPage + 1).toString();
    const value = item[key as keyof MeterReader];
    return value ? String(value) : 'N/A';
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.messageText}>Loading meter readers...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.messageContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#dc3545" />
          <Text style={styles.messageTitle}>Error Loading Data</Text>
          <Text style={styles.messageText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchMeterReaders()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (currentPageData.length === 0) {
      return (
        <View style={styles.messageContainer}>
          <Ionicons name={searchQuery ? "search-outline" : "people-outline"} size={48} color="#6c757d" />
          <Text style={styles.messageTitle}>
            {searchQuery ? "No Results Found" : "No Meter Readers"}
          </Text>
          <Text style={styles.messageText}>
            {searchQuery 
              ? `No meter readers match your search for "${searchQuery}".` 
              : "There are no meter readers assigned to you yet."
            }
          </Text>
          {searchQuery && (
            <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
              <Text style={styles.clearSearchText}>Clear Search</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ minWidth: TABLE_WIDTH }}
        style={styles.horizontalScrollView}
      >
        <View style={styles.tableContent}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            {COLUMNS.map(col => (
              <View key={col.key} style={[styles.headerCell, { width: col.width }]}>
                <Text style={[styles.headerText, { textAlign: col.align }]}>
                  {col.title}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Table Rows */}
          {currentPageData.map((item, index) => (
            <View 
              key={`${item.id || 'item'}_${startIndex + index}`} 
              style={[
                styles.tableRow, 
                index % 2 === 0 ? styles.evenRow : styles.oddRow
              ]}
            >
              {COLUMNS.map(col => (
                <View key={col.key} style={[styles.tableCell, { width: col.width }]}>
                  <Text 
                    style={[
                      styles.cellText, 
                      { textAlign: col.align }, 
                      col.key === 'name' && styles.nameCellText
                    ]} 
                    numberOfLines={
                      col.key === 'email' || col.key === 'agency' ? 2 : 
                      col.key === 'employee_code' ? 1 : 1
                    }
                    ellipsizeMode={col.key === 'employee_code' ? 'middle' : 'tail'} // Changed ellipsize mode for employee code
                  >
                    {getCellContent(col.key, item, index)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };
  

  const renderPaginationControls = () => {
    if (totalPages <= 1 || loading || error || currentPageData.length === 0) return null;
    
    const getPageNumbers = () => {
      const pages: (number | -1 | -2)[] = [];
      const maxVisible = screenWidth < 400 ? 3 : 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        
        if (currentPage > 3) {
          pages.push(-1); // Ellipsis
        }
        
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
          if (i > 1 && i < totalPages) {
            pages.push(i);
          }
        }
        
        if (currentPage < totalPages - 2) {
          pages.push(-2); // Ellipsis
        }
        
        pages.push(totalPages);
      }
      
      return pages;
    };

    return (
      <View style={styles.paginationContainer}>
        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredReaders.length)} of {filteredReaders.length}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.paginationScrollContent}
          style={styles.paginationScrollView}
        >
          <View style={styles.paginationControls}>
            <TouchableOpacity 
              style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]} 
              onPress={() => goToPage(1)} 
              disabled={currentPage === 1}
            >
              <Ionicons name="play-skip-back-outline" size={16} color={currentPage === 1 ? '#adb5bd' : '#007bff'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]} 
              onPress={() => goToPage(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              <Ionicons name="chevron-back-outline" size={16} color={currentPage === 1 ? '#adb5bd' : '#007bff'} />
            </TouchableOpacity>
            
            {getPageNumbers().map((page, index) => (
              page > 0 ? (
                <TouchableOpacity 
                  key={`page_${page}`} 
                  style={[
                    styles.pageNumberButton, 
                    currentPage === page && styles.activePageButton
                  ]} 
                  onPress={() => goToPage(page)}
                >
                  <Text style={[
                    styles.pageNumberText, 
                    currentPage === page && styles.activePageText
                  ]}>
                    {page}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text key={`ellipsis_${index}`} style={styles.ellipsisText}>...</Text>
              )
            ))}
            
            <TouchableOpacity 
              style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]} 
              onPress={() => goToPage(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              <Ionicons name="chevron-forward-outline" size={16} color={currentPage === totalPages ? '#adb5bd' : '#007bff'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]} 
              onPress={() => goToPage(totalPages)} 
              disabled={currentPage === totalPages}
            >
              <Ionicons name="play-skip-forward-outline" size={16} color={currentPage === totalPages ? '#adb5bd' : '#007bff'} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderStickyStatusBar = () => (
    <Animated.View 
      style={[
        styles.stickyStatusBar,
        {
          opacity: stickyOpacity,
          transform: [{
            translateY: stickyOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            })
          }]
        }
      ]}
      pointerEvents={stickyOpacity._value > 0.5 ? 'auto' : 'none'}
    >
      <Text style={styles.stickyStatusText}>
        {user?.name} • Page {currentPage}/{totalPages} • {filteredReaders.length} records
      </Text>
      <TouchableOpacity 
        style={styles.stickyRefreshButton} 
        onPress={onRefresh}
        disabled={refreshing || loading}
      >
        <Ionicons 
          name="refresh" 
          size={16} 
          color="#fff" 
          style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}}
        />
      </TouchableOpacity>
    </Animated.View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007bff" />
      
      {/* Fixed Header - Now properly within safe area */}
      <Animated.View 
        style={[
          styles.fixedHeader,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Welcome, {user?.name || 'User'}</Text>
          <Text style={styles.headerSubtitle}>Meter Readers Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Sticky Status Bar */}
      {renderStickyStatusBar()}

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Animated.ScrollView
          style={styles.scrollView}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007bff']}
              tintColor="#007bff"
              progressViewOffset={TOTAL_COLLAPSIBLE_HEIGHT}
            />
          }
        >
          {/* Collapsible Header Content */}
          <Animated.View 
            style={[
              styles.collapsibleHeader,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }]
              }
            ]}
          >
            {/* User Info Card */}
            <View style={styles.userInfoCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userNameText}>{user?.name || 'Supervisor Name'}</Text>
                <Text style={styles.userInfoText}>ID: {user?.id || 'N/A'}</Text>
                <Text style={styles.userInfoText}>Zone: {user?.zone || 'N/A'}</Text>
                <Text style={styles.userInfoText}>Mobile: {user?.mobile || 'N/A'}</Text>
                <Text style={styles.userInfoText}>DISCOM: {user?.discom || 'N/A'}</Text>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statsLabel}>Total</Text>
                  <Text style={styles.statsValue}>{allMeterReaders.length}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statsLabel}>Showing</Text>
                  <Text style={[styles.statsValue, styles.activeStatValue]}>
                    {filteredReaders.length}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Search and Controls */}
            <View style={styles.controlsContainer}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search-outline" size={20} color="#6c757d" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name, mobile, email etc."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#888"
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearSearchIconWrapper}>
                    <Ionicons name="close-circle-outline" size={20} color="#6c757d" />
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={onRefresh}
                disabled={refreshing || loading}
              >
                <Ionicons 
                  name="refresh-outline" 
                  size={22} 
                  color="#fff" 
                  style={refreshing ? styles.refreshingIcon : {}}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          {/* Table Card */}
          <View style={styles.tableCard}>
            <View style={styles.tableCardHeader}>
              <View style={styles.tableHeaderLeft}>
                <Text style={styles.tableCardTitle}>Meter Reader List</Text>
                <Text style={styles.tableCardSubtitle}>
                  ({filteredReaders.length} {filteredReaders.length === 1 ? "record" : "records"}
                  {searchQuery ? " found" : ""})
                </Text>
              </View>
              {totalPages > 1 && (
                <View style={styles.pageIndicator}>
                  <Text style={styles.pageIndicatorText}>Page {currentPage}/{totalPages}</Text>
                </View>
              )}
            </View>
            {renderTableContent()}
            {renderPaginationControls()}
          </View>
          
          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  fixedHeader: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 1000,
    // Removed position absolute - now properly within SafeAreaView
  },
  headerLeft: {
    flex: 1,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
    fontWeight: '400',
  },
  logoutButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stickyStatusBar: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 123, 255, 0.96)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    elevation: 6,
  },
  stickyStatusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  stickyRefreshButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  mainContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  collapsibleHeader: {
    paddingTop: 16,
  },
  userInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    elevation: 2,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userNameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  userInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
    lineHeight: 17,
    fontWeight: '500',
  },
  statsContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 10,
  },
  statsLabel: {
    fontSize: 10,
    color: '#777',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  activeStatValue: {
    color: '#28a745',
  },
  controlsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 52,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
    fontWeight: '500',
  },
  clearSearchIconWrapper: {
    padding: 6,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 28,
    marginLeft: 14,
    elevation: 4,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  refreshingIcon: {
    transform: [{ rotate: '180deg' }],
  },
  tableCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  tableCardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafbfc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableHeaderLeft: {
    flex: 1,
  },
  tableCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  tableCardSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  pageIndicator: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pageIndicatorText: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '600',
  },
  horizontalScrollView: {
    flex: 1,
  },
  tableContent: {
    flex: 1,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0056b3',
  },
  headerCell: {
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  headerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    minHeight: 60,
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#fff',
  },
  oddRow: {
    backgroundColor: '#fafbfc',
  },
  tableCell: {
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cellText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    fontWeight: '500',
  },
  nameCellText: {
    fontWeight: '600',
    color: '#007bff',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
    minHeight: 350,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#495057',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  messageText: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  clearSearchButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  paginationContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fafbfc',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paginationText: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  paginationScrollView: {
    height: 56,
  },
  paginationScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paginationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#dee2e6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    elevation: 1,
    shadowOpacity: 0.05,
  },
  pageNumberButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#dee2e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activePageButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
    elevation: 6,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    transform: [{ scale: 1.05 }],
  },
  pageNumberText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007bff',
    textAlign: 'center',
    lineHeight: 20,
  },
  activePageText: {
    color: '#fff',
    fontWeight: '700',
  },
  ellipsisText: {
    fontSize: 16,
    color: '#6c757d',
    paddingHorizontal: 8,
    lineHeight: 44,
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 30,
  },
});



