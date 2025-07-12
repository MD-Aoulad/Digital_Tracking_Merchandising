import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './App';

// Register the app
AppRegistry.registerComponent('main', () => App);

// For web, we need to register the root component
if (typeof document !== 'undefined') {
  AppRegistry.runApplication('main', {
    rootTag: document.getElementById('root') || document.getElementById('main')
  });
}

// For Expo
registerRootComponent(App);
