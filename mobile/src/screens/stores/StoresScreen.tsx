import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface Store {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastVisit?: string;
  nextVisit?: string;
  tasksCount: number;
  completedTasksCount: number;
  distance?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export default function StoresScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [stores, setStores] = useState<Store[]>([
    {
      id: '1',
      name: 'Store #123',
      address: '123 Main Street, Downtown',
      status: 'active',
      lastVisit: '2024-01-10',
      nextVisit: '2024-01-17',
      tasksCount: 5,
      completedTasksCount: 3,
      distance: '2.3 km',
    },
    {
      id: '2',
      name: 'Store #456',
      address: '456 Oak Avenue, Midtown',
      status: 'active',
      lastVisit: '2024-01-12',
      nextVisit: '2024-01-19',
      tasksCount: 3,
      completedTasksCount: 2,
      distance: '5.1 km',
    },
    {
      id: '3',
      name: 'Store #789',
      address: '789 Pine Road, Uptown',
      status: 'maintenance',
      lastVisit: '2024-01-08',
      nextVisit: '2024-01-15',
      tasksCount: 2,
      completedTasksCount: 1,
      distance: '8.7 km',
    },
    {
      id: '4',
      name: 'Store #101',
      address: '101 Elm Street, Suburbia',
      status: 'inactive',
      lastVisit: '2024-01-05',
      nextVisit: '2024-01-20',
      tasksCount: 0,
      completedTasksCount: 0,
      distance: '12.4 km',
    },
  ]);

  const filteredStores = stores.filter(store => {
    if (selectedFilter === 'all') return true;
    return store.status === selectedFilter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Refreshed', 'Stores updated!');
    }, 1000);
  };

  const getStatusColor = (status: Store['status']) => {
    switch (status) {
      case 'active':
        return '#34C759';
      case 'inactive':
        return '#666';
      case 'maintenance':
        return '#FF9500';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: Store['status']) => {
    switch (status) {
      case 'active':
        return 'checkmark-circle';
      case 'inactive':
        return 'close-circle';
      case 'maintenance':
        return 'construct';
      default:
        return 'help-circle';
    }
  };

  const handleStorePress = (store: Store) => {
    Alert.alert(
      store.name,
      `Address: ${store.address}\nStatus: ${store.status}\nTasks: ${store.completedTasksCount}/${store.tasksCount} completed`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => viewStoreDetails(store) },
        { text: 'Start Visit', onPress: () => startStoreVisit(store) },
        { text: 'Get Directions', onPress: () => getDirections(store) },
      ]
    );
  };

  const viewStoreDetails = (store: Store) => {
    Alert.alert('Coming Soon', 'Detailed store view will be available soon!');
  };

  const startStoreVisit = (store: Store) => {
    Alert.alert('Coming Soon', 'Store visit feature will be available soon!');
  };

  const getDirections = (store: Store) => {
    Alert.alert('Coming Soon', 'Navigation feature will be available soon!');
  };

  const FilterButton = ({ 
    title, 
    filter, 
    isSelected 
  }: {
    title: string;
    filter: typeof selectedFilter;
    isSelected: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, isSelected && styles.filterButtonActive]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const StoreCard = ({ store }: { store: Store }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => handleStorePress(store)}
    >
      <View style={styles.storeHeader}>
        <View style={styles.storeTitleContainer}>
          <View style={[styles.statusIcon, { backgroundColor: getStatusColor(store.status) + '20' }]}>
            <Ionicons
              name={getStatusIcon(store.status)}
              size={20}
              color={getStatusColor(store.status)}
            />
          </View>
          <View style={styles.storeTitleContent}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeAddress}>{store.address}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(store.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(store.status) }]}>
            {store.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.storeStats}>
        <View style={styles.statItem}>
          <Ionicons name="list" size={16} color="#007AFF" />
          <Text style={styles.statText}>{store.tasksCount} Tasks</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.statText}>{store.completedTasksCount} Completed</Text>
        </View>
        {store.distance && (
          <View style={styles.statItem}>
            <Ionicons name="location" size={16} color="#FF9500" />
            <Text style={styles.statText}>{store.distance}</Text>
          </View>
        )}
      </View>

      <View style={styles.storeFooter}>
        <View style={styles.visitInfo}>
          {store.lastVisit && (
            <Text style={styles.visitText}>Last: {store.lastVisit}</Text>
          )}
          {store.nextVisit && (
            <Text style={styles.visitText}>Next: {store.nextVisit}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.visitButton}
          onPress={() => startStoreVisit(store)}
        >
          <Ionicons name="play" size={16} color="#fff" />
          <Text style={styles.visitButtonText}>Visit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stores</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Coming Soon', 'Add new store feature')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton title="All" filter="all" isSelected={selectedFilter === 'all'} />
          <FilterButton title="Active" filter="active" isSelected={selectedFilter === 'active'} />
          <FilterButton title="Inactive" filter="inactive" isSelected={selectedFilter === 'inactive'} />
          <FilterButton title="Maintenance" filter="maintenance" isSelected={selectedFilter === 'maintenance'} />
        </ScrollView>
      </View>

      {/* Stores List */}
      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoreCard store={item} />}
        contentContainerStyle={styles.storesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="business" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No stores found</Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'all' 
                ? 'No stores assigned to you yet.'
                : `No ${selectedFilter} stores found.`
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  storesList: {
    padding: 16,
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeTitleContent: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  storeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitInfo: {
    flex: 1,
  },
  visitText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  visitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  visitButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
