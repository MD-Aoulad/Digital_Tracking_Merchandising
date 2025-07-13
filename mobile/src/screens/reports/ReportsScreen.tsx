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

interface Report {
  id: string;
  title: string;
  type: 'sales' | 'inventory' | 'visit' | 'incident' | 'maintenance';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  submittedAt?: string;
  store?: string;
  description: string;
}

export default function ReportsScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'rejected'>('all');
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Weekly Sales Report',
      type: 'sales',
      status: 'submitted',
      createdAt: '2024-01-10',
      submittedAt: '2024-01-12',
      store: 'Store #123',
      description: 'Weekly sales performance and metrics',
    },
    {
      id: '2',
      title: 'Inventory Check Report',
      type: 'inventory',
      status: 'draft',
      createdAt: '2024-01-13',
      store: 'Store #456',
      description: 'Monthly inventory verification report',
    },
    {
      id: '3',
      title: 'Store Visit Report',
      type: 'visit',
      status: 'approved',
      createdAt: '2024-01-08',
      submittedAt: '2024-01-09',
      store: 'Store #789',
      description: 'Routine store visit and assessment',
    },
    {
      id: '4',
      title: 'Equipment Incident Report',
      type: 'incident',
      status: 'rejected',
      createdAt: '2024-01-11',
      submittedAt: '2024-01-11',
      store: 'Store #123',
      description: 'Equipment malfunction and resolution',
    },
  ]);

  const filteredReports = reports.filter(report => {
    if (selectedFilter === 'all') return true;
    return report.status === selectedFilter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Refreshed', 'Reports updated!');
    }, 1000);
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'draft':
        return '#666';
      case 'submitted':
        return '#007AFF';
      case 'approved':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      default:
        return '#666';
    }
  };

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'sales':
        return 'trending-up';
      case 'inventory':
        return 'list';
      case 'visit':
        return 'location';
      case 'incident':
        return 'warning';
      case 'maintenance':
        return 'construct';
      default:
        return 'document-text';
    }
  };

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'sales':
        return '#34C759';
      case 'inventory':
        return '#007AFF';
      case 'visit':
        return '#FF9500';
      case 'incident':
        return '#FF3B30';
      case 'maintenance':
        return '#8E44AD';
      default:
        return '#666';
    }
  };

  const handleReportPress = (report: Report) => {
    Alert.alert(
      report.title,
      `Type: ${report.type}\nStatus: ${report.status}\nCreated: ${report.createdAt}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => viewReportDetails(report) },
        { text: 'Edit', onPress: () => editReport(report) },
      ]
    );
  };

  const viewReportDetails = (report: Report) => {
    Alert.alert('Coming Soon', 'Detailed report view will be available soon!');
  };

  const editReport = (report: Report) => {
    Alert.alert('Coming Soon', 'Report editing will be available soon!');
  };

  const createNewReport = () => {
    Alert.alert(
      'Create New Report',
      'Select report type:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sales Report', onPress: () => Alert.alert('Coming Soon', 'Sales report creation') },
        { text: 'Inventory Report', onPress: () => Alert.alert('Coming Soon', 'Inventory report creation') },
        { text: 'Visit Report', onPress: () => Alert.alert('Coming Soon', 'Visit report creation') },
        { text: 'Incident Report', onPress: () => Alert.alert('Coming Soon', 'Incident report creation') },
      ]
    );
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

  const ReportCard = ({ report }: { report: Report }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => handleReportPress(report)}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleContainer}>
          <View style={[
            styles.typeIcon,
            { backgroundColor: getTypeColor(report.type) + '20' }
          ]}>
            <Ionicons
              name={getTypeIcon(report.type)}
              size={20}
              color={getTypeColor(report.type)}
            />
          </View>
          <View style={styles.reportTitleContent}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportType}>{report.type.toUpperCase()}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
            {report.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.reportDescription}>{report.description}</Text>

      <View style={styles.reportFooter}>
        <View style={styles.reportMeta}>
          {report.store && (
            <Text style={styles.storeText}>{report.store}</Text>
          )}
          <Text style={styles.dateText}>Created: {report.createdAt}</Text>
        </View>
        {report.submittedAt && (
          <Text style={styles.submittedText}>Submitted: {report.submittedAt}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={createNewReport}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton title="All" filter="all" isSelected={selectedFilter === 'all'} />
          <FilterButton title="Draft" filter="draft" isSelected={selectedFilter === 'draft'} />
          <FilterButton title="Submitted" filter="submitted" isSelected={selectedFilter === 'submitted'} />
          <FilterButton title="Approved" filter="approved" isSelected={selectedFilter === 'approved'} />
          <FilterButton title="Rejected" filter="rejected" isSelected={selectedFilter === 'rejected'} />
        </ScrollView>
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReportCard report={item} />}
        contentContainerStyle={styles.reportsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No reports found</Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'all' 
                ? 'You have no reports yet. Create your first report!'
                : `No ${selectedFilter} reports found.`
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
  reportsList: {
    padding: 16,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportTitleContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reportType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
  reportDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportMeta: {
    flex: 1,
  },
  storeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  submittedText: {
    fontSize: 12,
    color: '#999',
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
