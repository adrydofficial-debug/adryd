import React, { useState } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

type NotificationItem = {
  id: string;
  title: string;
  date: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  isHighlighted: boolean;
  image: any;
};

type Props = {
  navigation: any;
};

const Notifications: React.FC<Props> = ({ navigation }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const notificationData: NotificationItem[] = [
    {
      id: '1',
      title: 'Taxx Oil Ad Review',
      date: 'Sep 09, 2005',
      description: 'Lompoceturpiscing\nLoveme concetur adipisicing dolor sit amet',
      icon: 'leaf',
      iconColor: '#4CAF50',
      iconBgColor: '#E8F5E8',
      isHighlighted: true,
      image: require('../../../assets/images/Ellipse.png'),
    },
    {
      id: '2',
      title: 'Adryd Ad Review',
      date: 'Sep 07, 2025',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing\nLorem ipsum dolor sit amet, consectetur adipiscing',
      icon: 'a',
      iconColor: '#E91E63',
      iconBgColor: '#FCE4EC',
      isHighlighted: false,
      image: require('../../../assets/images/AdrydLogo.png'),
    },
    {
      id: '3',
      title: 'Dot Ad Active',
      date: 'Sep 02, 2025',
      description: 'Logicotropiscing\nLost dolor sit amet,',
      icon: 'ellipse',
      iconColor: '#757575',
      iconBgColor: '#F5F5F5',
      isHighlighted: false,
      image: require('../../../assets/images/Dot.png'),
    },
    {
      id: '4',
      title: 'Axovolt Ad Review',
      date: 'Aug 07, 2025',
      description: 'Loconsecranipiscing\nLorem ipsum dolor sit concupacing',
      icon: 'a',
      iconColor: '#4CAF50',
      iconBgColor: '#E8F5E8',
      isHighlighted: false,
      image: require('../../../assets/images/AxoVolt.png'),
    },
  ];

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        item.isHighlighted && styles.highlightedCard,
        selectedItem === item.id && styles.selectedCard,
        item.id === '1' && selectedItem !== '1' && selectedItem !== null && styles.firstItemGray,
      ]}
      onPress={() => {
        setSelectedItem(selectedItem === item.id ? null : item.id);
      }}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.iconBgColor }]}>
          <Image
            source={item.image}
            style={{ width: width * 0.12, height: width * 0.12, resizeMode: 'contain', borderRadius: 25 }}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationDate}>{item.date}</Text>
          </View>
          <Text style={styles.notificationDescription}>{item.description}</Text>
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
        <Text style={styles.headerTitle}>Noifiation</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={notificationData}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
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
  firstItemGray: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    fontSize: width * 0.035,
    color: '#666',
    fontWeight: '500',
  },
  notificationDescription: {
    fontSize: width * 0.032,
    color: '#666',
    lineHeight: width * 0.045,
  },
});

export default Notifications;


