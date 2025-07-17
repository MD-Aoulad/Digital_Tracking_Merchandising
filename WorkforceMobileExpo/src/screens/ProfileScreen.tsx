import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Profile Picture',
      'Choose how to update your profile picture',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ProfileItem = ({ icon, title, value, onPress, showArrow = true }: {
    icon: string;
    title: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon as any} size={20} color="#6b7280" />
        <Text style={styles.profileItemTitle}>{title}</Text>
      </View>
      <View style={styles.profileItemRight}>
        {value && <Text style={styles.profileItemValue}>{value}</Text>}
        {showArrow && onPress && <Ionicons name="chevron-forward" size={20} color="#6b7280" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)}>
          <Ionicons name="settings" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <TouchableOpacity style={styles.profilePictureContainer} onPress={showImagePicker}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profilePicture} />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Ionicons name="person" size={48} color="#6b7280" />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userRole}>{user?.role || 'Employee'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@company.com'}</Text>
        </View>

        {/* After the profile image and name, add a stats section: */}
        {user?.role === 'admin' || user?.role === 'manager' ? (
          <View style={styles.statsCard} accessible accessibilityLabel="Team Stats">
            <Text style={styles.statsTitle}>Team Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}><Text style={styles.statValue}>24</Text><Text style={styles.statLabel}>Employees</Text></View>
              <View style={styles.statItem}><Text style={styles.statValue}>92%</Text><Text style={styles.statLabel}>Attendance</Text></View>
              <View style={styles.statItem}><Text style={styles.statValue}>8</Text><Text style={styles.statLabel}>Pending Tasks</Text></View>
            </View>
          </View>
        ) : (
          <View style={styles.statsCard} accessible accessibilityLabel="My Stats">
            <Text style={styles.statsTitle}>My Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}><Text style={styles.statValue}>5</Text><Text style={styles.statLabel}>Tasks</Text></View>
              <View style={styles.statItem}><Text style={styles.statValue}>6.5</Text><Text style={styles.statLabel}>Hours Today</Text></View>
              <View style={styles.statItem}><Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>Leave</Text></View>
            </View>
          </View>
        )}

        {/* Personal Information */}
        <ProfileSection title="Personal Information">
          <ProfileItem
            icon="person"
            title="Full Name"
            value={user?.name}
            onPress={() => navigation.navigate('EditName' as never)}
          />
          <ProfileItem
            icon="mail"
            title="Email"
            value={user?.email}
            onPress={() => navigation.navigate('EditEmail' as never)}
          />
          <ProfileItem
            icon="call"
            title="Phone Number"
            value="+1 (555) 123-4567"
            onPress={() => navigation.navigate('EditPhone' as never)}
          />
          <ProfileItem
            icon="location"
            title="Location"
            value="New York, NY"
            onPress={() => navigation.navigate('EditLocation' as never)}
          />
        </ProfileSection>

        {/* Work Information */}
        <ProfileSection title="Work Information">
          <ProfileItem
            icon="business"
            title="Department"
            value="Sales & Marketing"
            onPress={() => navigation.navigate('EditDepartment' as never)}
          />
          <ProfileItem
            icon="person-circle"
            title="Manager"
            value="John Smith"
            onPress={() => navigation.navigate('ViewManager' as never)}
          />
          <ProfileItem
            icon="calendar"
            title="Join Date"
            value="January 15, 2023"
            showArrow={false}
          />
          <ProfileItem
            icon="id-card"
            title="Employee ID"
            value="EMP-2023-001"
            showArrow={false}
          />
        </ProfileSection>

        {/* App Settings */}
        <ProfileSection title="App Settings">
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="notifications" size={20} color="#6b7280" />
              <Text style={styles.settingItemTitle}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="location" size={20} color="#6b7280" />
              <Text style={styles.settingItemTitle}>Location Services</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#e5e7eb', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
          <ProfileItem
            icon="language"
            title="Language"
            value="English"
            onPress={() => navigation.navigate('LanguageSettings' as never)}
          />
          <ProfileItem
            icon="moon"
            title="Dark Mode"
            onPress={() => navigation.navigate('ThemeSettings' as never)}
          />
        </ProfileSection>

        {/* Security */}
        <ProfileSection title="Security">
          <ProfileItem
            icon="lock-closed"
            title="Change Password"
            onPress={() => navigation.navigate('ChangePassword' as never)}
          />
          <ProfileItem
            icon="finger-print"
            title="Biometric Login"
            onPress={() => navigation.navigate('BiometricSettings' as never)}
          />
          <ProfileItem
            icon="shield-checkmark"
            title="Two-Factor Authentication"
            onPress={() => navigation.navigate('TwoFactorSettings' as never)}
          />
        </ProfileSection>

        {/* Support */}
        <ProfileSection title="Support">
          <ProfileItem
            icon="help-circle"
            title="Help & Support"
            onPress={() => navigation.navigate('HelpSupport' as never)}
          />
          <ProfileItem
            icon="document-text"
            title="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          />
          <ProfileItem
            icon="document-text"
            title="Terms of Service"
            onPress={() => navigation.navigate('TermsOfService' as never)}
          />
          <ProfileItem
            icon="information-circle"
            title="About"
            value="Version 2.0.0"
            onPress={() => navigation.navigate('About' as never)}
          />
        </ProfileSection>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  profilePictureSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9ca3af',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItemValue: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
  // Add statsCard, statsTitle, statsRow, statItem, statValue, statLabel for card shadow, spacing, and color.
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default ProfileScreen; 