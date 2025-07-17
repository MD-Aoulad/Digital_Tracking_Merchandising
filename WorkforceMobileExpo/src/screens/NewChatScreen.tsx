import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { shadowStyles } from '../utils/shadows';

const NewChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleCreate = () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please enter both title and message.');
      return;
    }
    Alert.alert('Chat Created', `New chat "${title}" has been created!`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start New Chat</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Chat Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter chat title"
          value={title}
          onChangeText={setTitle}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Initial Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter your message..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />
      </View>
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Ionicons name="chatbubble" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Create Chat</Text>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...shadowStyles.small,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    ...shadowStyles.medium,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default NewChatScreen; 