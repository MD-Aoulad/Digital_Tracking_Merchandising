import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  location: string;
}

const AttendanceScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    // Mock attendance data
    const mockRecords: AttendanceRecord[] = [
      {
        id: '1',
        date: '2024-01-15',
        clockIn: '09:00',
        clockOut: '17:30',
        totalHours: 8.5,
        status: 'present',
        location: 'San Francisco, CA',
      },
      {
        id: '2',
        date: '2024-01-14',
        clockIn: '08:45',
        clockOut: '17:15',
        totalHours: 8.5,
        status: 'present',
        location: 'San Francisco, CA',
      },
      {
        id: '3',
        date: '2024-01-13',
        clockIn: '09:15',
        clockOut: '17:45',
        totalHours: 8.5,
        status: 'late',
        location: 'San Francisco, CA',
      },
      {
        id: '4',
        date: '2024-01-12',
        clockIn: '09:00',
        clockOut: '13:00',
        totalHours: 4.0,
        status: 'half-day',
        location: 'San Francisco, CA',
      },
      {
        id: '5',
        date: '2024-01-11',
        clockIn: '09:00',
        clockOut: '17:30',
        totalHours: 8.5,
        status: 'present',
        location: 'San Francisco, CA',
      },
    ];
    setAttendanceRecords(mockRecords);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#4CAF50';
      case 'late':
        return '#FF9800';
      case 'absent':
        return '#F44336';
      case 'half-day':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return 'check-circle';
      case 'late':
        return 'schedule';
      case 'absent':
        return 'cancel';
      case 'half-day':
        return 'schedule';
      default:
        return 'help';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateMonthlyStats = () => {
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const lateDays = attendanceRecords.filter(r => r.status === 'late').length;
    const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
    const totalHours = attendanceRecords.reduce((sum, r) => sum + r.totalHours, 0);

    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      totalHours,
      attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
    };
  };

  const stats = calculateMonthlyStats();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <Text style={styles.headerSubtitle}>
          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.attendanceRate}%</Text>
            <Text style={styles.statLabel}>Attendance Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalHours}h</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.presentDays}</Text>
            <Text style={styles.statLabel}>Present Days</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.lateDays}</Text>
            <Text style={styles.statLabel}>Late Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.absentDays}</Text>
            <Text style={styles.statLabel}>Absent Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalDays}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
        </View>
      </View>

      <View style={styles.recordsContainer}>
        <Text style={styles.sectionTitle}>Daily Records</Text>
        {attendanceRecords.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{formatDate(record.date)}</Text>
                <Text style={styles.dayText}>
                  {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <Icon
                  name={getStatusIcon(record.status)}
                  size={20}
                  color={getStatusColor(record.status)}
                />
                <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.timeContainer}>
              <View style={styles.timeItem}>
                <Icon name="login" size={16} color="#4CAF50" />
                <Text style={styles.timeLabel}>Clock In</Text>
                <Text style={styles.timeValue}>{record.clockIn}</Text>
              </View>
              <View style={styles.timeItem}>
                <Icon name="logout" size={16} color="#F44336" />
                <Text style={styles.timeLabel}>Clock Out</Text>
                <Text style={styles.timeValue}>{record.clockOut}</Text>
              </View>
              <View style={styles.timeItem}>
                <Icon name="schedule" size={16} color="#2196F3" />
                <Text style={styles.timeLabel}>Total</Text>
                <Text style={styles.timeValue}>{record.totalHours}h</Text>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <Icon name="location-on" size={14} color="#666" />
              <Text style={styles.locationText}>{record.location}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Status Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name="schedule" size={16} color="#FF9800" />
            <Text style={styles.legendText}>Late</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name="cancel" size={16} color="#F44336" />
            <Text style={styles.legendText}>Absent</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name="schedule" size={16} color="#9C27B0" />
            <Text style={styles.legendText}>Half Day</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  recordsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeItem: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  legendContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
});

export default AttendanceScreen; 