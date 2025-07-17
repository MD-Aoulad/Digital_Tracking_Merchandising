import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NewChannelScreen: React.FC = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Channel name required', 'Please enter a channel name.');
      return;
    }
    Alert.alert('Channel Created', `Channel "${name}" has been created!`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Channel</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Channel Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter channel name"
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter channel description"
          value={desc}
          onChangeText={setDesc}
        />
      </View>
      <View style={styles.privacyRow}>
        <Ionicons name="lock-closed" size={20} color={isPrivate ? '#007AFF' : '#6b7280'} />
        <Text style={styles.privacyLabel}>Private Channel</Text>
        <Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ false: '#e5e7eb', true: '#007AFF' }} />
      </View>
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Create Channel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  privacyLabel: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 10,
    flex: 1,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default NewChannelScreen; 