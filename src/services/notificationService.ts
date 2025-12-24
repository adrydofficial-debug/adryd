// src/services/notificationService.ts
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

/**
 * Request notification permissions
 */
export async function requestNotificationPermission() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log('❌ Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Get FCM token
 */
export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('📱 FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Display local notification when app is in foreground
 */
export async function displayLocalNotification(
  title: string,
  body: string,
  data?: any
) {
  try {
    // Create a channel (Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    // Display notification
    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
}

/**
 * Setup foreground message handler
 */
export function setupForegroundMessageHandler() {
  return messaging().onMessage(async remoteMessage => {
    console.log('📨 Foreground notification received:', remoteMessage);
    
    const { notification, data } = remoteMessage;
    
    if (notification) {
      await displayLocalNotification(
        notification.title || 'New Notification',
        notification.body || '',
        data
      );
    }
  });
}

/**
 * Setup background message handler
 * This must be called at the top level of index.js
 */
export function setupBackgroundMessageHandler() {
  try {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📨 Background notification received:', remoteMessage);
      // Background notifications are handled automatically by the OS
    });
  } catch (error) {
    // If Firebase isn't initialized yet, log warning but don't crash
    // The handler will work once Firebase initializes from native config
    console.warn('Background message handler setup deferred - Firebase initializing:', error.message);
  }
}

/**
 * Handle notification tap (when app is opened from notification)
 */
export function setupNotificationOpenedHandler(
  onNotificationOpened: (data: any) => void
) {
  // Check if app was opened from a notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('📨 App opened from notification:', remoteMessage);
        onNotificationOpened(remoteMessage.data);
      }
    });

  // Listen for notification taps when app is in background
  const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('📨 Notification opened app:', remoteMessage);
    onNotificationOpened(remoteMessage.data);
  });

  return unsubscribe;
}

