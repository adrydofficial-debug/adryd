/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// Initialize Firebase before using any Firebase services
// Import Firebase config to ensure Firebase is initialized
import './src/firebase/firebaseConfig';
import { setupBackgroundMessageHandler } from './src/services/notificationService';

// Register background message handler for push notifications
// This must be called before App registration
setupBackgroundMessageHandler();

AppRegistry.registerComponent(appName, () => App);
