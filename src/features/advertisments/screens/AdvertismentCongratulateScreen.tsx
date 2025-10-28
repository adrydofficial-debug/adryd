import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomButton from '../../../components/CustomButton';
import NoInternet from '../../../components/NoInternet';

const { width, height } = Dimensions.get('window');

// Type definitions
type AppStackParamList = {
  BottomTab: undefined;
  [key: string]: any;
};

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Helper functions
const wp = (percentage: number): number => (width * percentage) / 100;
const hp = (percentage: number): number => (height * percentage) / 100;

const AdvertismentCongratulateScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#FFF4FD', '#FEF3F9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Content Card */}
          <View style={styles.contentCard}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              {/* Congratulations Icon */}
              <View style={styles.iconContainer}>
                <Image source={require('../../../assets/images/shakHands.png')} style={styles.imgStyle}/>
              </View>
              {/* Congratulations Text */}
              <Text style={styles.congratulationsText}>Congratulations</Text>
              <Text style={styles.subtitleText}>
                Today's Your ad seen successfully!
              </Text>
            </View>
            {/* Reward Section */}
            <View style={styles.rewardContainer}>
              <Text style={styles.rewardAmount}>Pkr 30,000</Text>
            </View>
            {/* Campaign Details Section */}
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>04:50</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>12.12.2025</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Your Campaign:</Text>
                <Text style={styles.detailValue}>8 day</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>Lahore DHA Phase 4</Text>
              </View>
            </View>
            {/* Receipt Section */}
            <View style={styles.receiptSection}>
              <View style={styles.dashedLine} />
              {/* Barcode */}
              <View style={styles.barcodeContainer}>
                <View style={styles.barcode}>
                  {/* Simulated barcode lines */}
                  <View style={[styles.barcodeLine, { width: wp(2), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(1), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(3), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(1), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(2), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(1), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(4), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(1), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(2), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(1), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(3), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(1), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(2), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(1), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(4), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(1), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(2), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(1), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(3), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(1), height: hp(3) }]} />
                  <View style={[styles.barcodeLine, { width: wp(2), height: hp(3) }]} />
                </View>
              </View>
              {/* Receipt ID */}
              <View style={styles.receiptIdContainer}>
                <Text style={styles.receiptIdLabel}>Receipt ID:</Text>
                <Text style={styles.receiptIdValue}>
                  83EBYBY:DEZIGN.UMAIR&LHRPOLEF7G
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        {/* Download Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Download"
            onPress={() => {
              navigation.navigate('BottomTab');
            }}
            variant="primary"
            size="medium"
            buttonStyle={styles.downloadButton}
          />
        </View>
        {/* No Internet Modal */}
        <NoInternet />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FD',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    // paddingBottom: hp(20),
    flexGrow: 1,
  },
  imgStyle:{
    height:60,
    width:60
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: wp(6),
    padding: wp(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minHeight: hp(50),
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: hp(4),
  },
  iconContainer: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(8),
    // backgroundColor: '#C538A5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  handshakeIcon: {
    fontSize: wp(8),
  },
  congratulationsText: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: wp(4),
    color: '#666',
    textAlign: 'center',
    lineHeight: wp(5),
  },
  rewardContainer: {
    backgroundColor: '#F8E8F5',
    borderRadius: wp(3),
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(4),
    alignItems: 'center',
    marginBottom: hp(4),
  },
  rewardAmount: {
    fontSize: wp(7),
    fontWeight: 'bold',
    color: '#C538A5',
  },
  detailsSection: {
    marginBottom: hp(3),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
    paddingVertical: hp(0.5),
  },
  detailLabel: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#6C6C6C',
    flex: 0,
    minWidth: wp(30),
  },
  detailValue: {
    fontSize: wp(4),
    color: '#676869',
    fontWeight: '300',
    textAlign: 'right',
    flex: 1,
    marginLeft: wp(2),
  },
  receiptSection: {
    marginTop: hp(2),
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#C538A5',
    borderStyle: 'dashed',
    marginBottom: hp(3),
  },
  barcodeContainer: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  barcode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderRadius: wp(1),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  barcodeLine: {
    backgroundColor: '#000',
    marginHorizontal: wp(0.2),
  },
  receiptIdContainer: {
    alignItems: 'center',
  },
  receiptIdLabel: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#6C6C6C',
    marginBottom: hp(0.5),
  },
  receiptIdValue: {
    fontSize: wp(3.2),
    color: '#676869',
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: wp(0.2),
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.09,
    paddingBottom: height * 0.03,
  },
  downloadButton: {
    width: '100%',
  },
});

export default AdvertismentCongratulateScreen;
