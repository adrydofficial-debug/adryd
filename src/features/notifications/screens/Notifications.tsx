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
import { Images } from '../../../assets/images';
import BackButton from '../../../components/BackButton';

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
      title: 'Taxxoil',
      date: 'Sep 07,2025',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing ipsum dolor sit amet Lorem ipsum dolor sit amet, consectetur adipiscing dolor sit amet, ',
      icon: 'leaf',
      iconColor: '#4CAF50',
      iconBgColor: '#E8F5E8',
      isHighlighted: true,
      image: Images.ellipse,
    },
    {
      id: '2',
      title: 'Adryd',
      date: 'Sep 07, 2025',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing\nLorem ipsum dolor sit amet, consectetur adipiscing',
      icon: 'a',
      iconColor: '#E91E63',
      iconBgColor: '#FCE4EC',
      isHighlighted: false,
      image: Images.adrydLogo,
    },
    {
      id: '3',
      title: 'Dot',
      date: 'Sep 07,2025',
      description: 'Logicotropiscing Lost dolor sit amet,',
      icon: 'ellipse',
      iconColor: '#757575',
      iconBgColor: '#F5F5F5',
      isHighlighted: false,
      image: Images.dot,
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
      image: Images.axoVolt,
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
      <StatusBar backgroundColor="b" barStyle="dark-content" />
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Notification</Text>
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
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.04,
    backgroundColor: '#FFFFFF',
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    alignItems: 'center',
    marginTop:20,
  },
  headerSpacer: {
    width: width * 0.1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: height * 0.02,
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: width * 0.04,
    height: height * 0.13,
    justifyContent: 'center',
    borderBottomWidth:1,
    borderTopWidth:1,
    borderColor:"#E5E7EB",
  },
  highlightedCard: {
      borderWidth: 1,
    backgroundColor:"#FDE7FB",
    
  },
  selectedCard: {
    backgroundColor: '#FDE7FB',
    borderColor: '#C539A5',
  },
  firstItemGray: {
    backgroundColor: '#FDE7FB',
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
    fontSize: 14,
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
    fontSize: 11,
    color: '#18181B',
    lineHeight: width * 0.045,
  },
});

export default Notifications;


