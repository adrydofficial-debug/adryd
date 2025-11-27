import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { markAllNotificationsRead } from '../api/api';
import Header from '../../../components/Header';
import { useAuthStore } from '../../../store/authStore';
import { Images } from '../../../assets/images';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

type Props = {
  navigation: any;
};

const GetAllNotification: React.FC<Props> = ({ navigation }) => {
  const { data, isLoading, error, refetch } = useNotifications();
  const { user } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await markAllNotificationsRead();
        console.log('[Notifications] markAll after 5s:', res);
        refetch();
      } catch (e) {
        console.warn('[Notifications] markAll failed:', e);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [refetch]);

  // Create welcome notification object - always visible
  const welcomeNotification = {
    id: 'welcome-notification',
    title: "Welcome to ADRYD!",
    body: "You're all set! Stay updated with important alerts and offer.",
    type: 'welcome',
    read: false,
    createdAt: new Date().toISOString(),
    isWelcome: true,
    isHighlighted: true,
  };

  // Combine welcome notification with backend notifications - always show welcome notification if user is logged in
  const allNotifications = user
    ? [welcomeNotification, ...(data || [])]
    : (data || []);

  const renderNotificationItem = ({ item }: any) => {
    const isWelcome = item.isWelcome || item.id === 'welcome-notification';
    
    return (
      <View
        style={[
          styles.notificationCard,
          item.isHighlighted && styles.highlightedCard,
          isWelcome && styles.welcomeCard,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={[
            styles.iconContainer, 
            isWelcome ? styles.welcomeIconContainer : { backgroundColor: '#F5F5F5' }
          ]}>
            {isWelcome ? (
              <Image
                source={Images.dp}
                style={styles.welcomeIcon}
                resizeMode="contain"
              />
            ) : null}
          </View>
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.notificationDate} numberOfLines={1}>
                {isWelcome ? '1 min' : new Date(item.createdAt).toDateString()}
              </Text>
            </View>
            <Text style={styles.notificationDescription} numberOfLines={2}>
              {item.body}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFF" barStyle="dark-content" />
  <Header
  title="Notification"
  onBackPress={() => navigation.goBack()}
  showRightIcon={false}
/>


      <View style={styles.listContainer}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <View>
            <Text>Failed to load notifications</Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text style={{ color: '#C539A5', fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={allNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: height * 0.02,
  },
  notificationCard: {
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.04,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: "#E5E7EB",
  },
  highlightedCard: {
    borderWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    backgroundColor: "#FDE7FB",
    borderColor: "#E5E7EB",
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
    backgroundColor: '#F5F5F5',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: height * 0.008,
  },
  notificationTitle: {
    fontSize: width * 0.035,
    fontWeight: 'bold',
    color: '#18181B',
    flex: 1,
    marginRight: width * 0.02,
  },
  notificationDate: {
    fontSize: 8,
    color: '#18181B',
    fontWeight: '500',
  },
  notificationDescription: {
    fontSize: width * 0.030,
    color: '#18181B',
    lineHeight: width * 0.045,
  },
  welcomeCard: {
    backgroundColor: '#FDE7FB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#E5E7EB',
  },
  welcomeIconContainer: {
    backgroundColor: '#C539A5',
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
  },
  welcomeIcon: {
    width: width * 0.14,
    height: width * 0.2,
  },
});

export default GetAllNotification;


