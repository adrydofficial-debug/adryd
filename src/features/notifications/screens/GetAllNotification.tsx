import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNotifications } from '../hooks/useNotifications';
import { markAllNotificationsRead } from '../api/api';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

type Props = {
  navigation: any;
};

const GetAllNotification: React.FC<Props> = ({ navigation }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useNotifications();

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

  const renderNotificationItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        item.isHighlighted && styles.highlightedCard,
        selectedItem === item.id && styles.selectedCard,
      ]}
      onPress={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: '#F5F5F5' }]} />
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.notificationDate} numberOfLines={1}>
              {new Date(item.createdAt).toDateString()}
            </Text>
          </View>
          <Text style={styles.notificationDescription} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

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
            data={data || []}
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
    backgroundColor: '#FFF4FD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.04,
    backgroundColor: '#FFF4FD',
  },
  backButton: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    width: width * 0.1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: width * 0.04,
  },
  listContent: {
    paddingBottom: height * 0.02,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: width * 0.02,
    marginBottom: height * 0.015,
    padding: width * 0.04,
    height: height * 0.13,
    justifyContent: 'center',
  },
  highlightedCard: {
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  selectedCard: {
    backgroundColor: '#FDE7FB',
    borderRadius: width * 0.02,
    borderWidth: 2,
    borderColor: '#C539A5',
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
    fontSize: width * 0.042,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginRight: width * 0.02,
  },
  notificationDate: {
    fontSize: width * 0.025,
    color: '#666',
    fontWeight: '500',
    position:'absolute',
    bottom:10,
    right:0
  },
  notificationDescription: {
    fontSize: width * 0.032,
    color: '#666',
    lineHeight: width * 0.045,
  },
});

export default GetAllNotification;


