import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from '../../../components/CustomButton';
const { width, height } = Dimensions.get('window');
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;
const AdvertismentConfirmationScreen = ({ navigation }) => {
  const renderProgressStep = (stepNumber, isActive, isCompleted) => (
    <View style={styles.progressStepContainer}>
      <View style={[
        styles.progressStep,
        isActive && styles.activeStep,
        isCompleted && styles.completedStep
      ]}>
        <Text style={[
          styles.progressStepText,
          isActive && styles.activeStepText,
          isCompleted && styles.completedStepText
        ]}>
          {stepNumber}
        </Text>
      </View>
      {stepNumber < 3 && (
        <View style={[
          styles.progressLine,
          isActive && styles.activeProgressLine,
          isCompleted && styles.completedProgressLine
        ]} />
      )}
    </View>
  );
  const renderDetailItem = (label, value, isLast = false) => (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
      {!isLast && <View style={styles.detailSeparator} />}
    </View>
  );
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#FFF4FD", "#FEF3F9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(6)} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirmation</Text>
          <View style={styles.headerSpacer} />
        </View>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {renderProgressStep(1, false, true)}
          {renderProgressStep(2, false, true)}
          {renderProgressStep(3, true, false)}
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Main Content Card */}
          <View style={styles.contentCard}>
            {/* Company Detail Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Company Detail</Text>
              <View style={styles.sectionContent}>
                <View style={styles.verticalLine} />
                <View style={styles.detailsContainer}>
                  {renderDetailItem('NAME:', 'Adryd')}
                  {renderDetailItem('BUSINESS:', 'Marketing')}
                  {renderDetailItem('NTN:', '151561651654')}
                  {renderDetailItem('ADDRESS:', 'Lahore DHA Phase-4')}
                  {renderDetailItem('EMAIL:', 'adryd@app')}
                  {renderDetailItem('NUMBER:', '03048794564', true)}
                </View>
              </View>
            </View>
            {/* Campaign Detail Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Campaign Detail</Text>
              <View style={styles.sectionContent}>
                <View style={styles.verticalLine} />
                <View style={styles.detailsContainer}>
                  {renderDetailItem('NAME:', 'Adryd Lahore DHA')}
                  {renderDetailItem('HOW MANY:', '8 Days')}
                  {renderDetailItem('CATEGORY:', 'Pole Sign Board')}
                  {renderDetailItem('LOCATION:', 'Lahore DHA Phase-4', true)}
                </View>
              </View>
            </View>
            {/* Summary Section */}
            <View style={styles.summarySection}>
              <View style={styles.dashedLine} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>DATE:</Text>
                <Text style={styles.summaryValue}>Sep 22.2025</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>TAX:</Text>
                <Text style={styles.summaryValue}>Pkr 1000</Text>
              </View>
              {/* Total Amount */}
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>PKR 30.000</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        {/* Next Button */}
        {/* <View style={styles.buttonContainer}>
          <CustomButton
            title="Next"
            onPress={() => {
              console.log('Next button pressed');
              navigation.navigate('CompaignReceipt');
            }}
            variant="primary"
            size="medium"
            buttonStyle={styles.nextButton}
          />
        </View> */}
         <View style={styles.buttonContainer}>
                 <CustomButton
                  title="UPLOAD FILES"
                  onPress={() => {
                   navigation.navigate('CompaignReceipt');
                  }}
                  variant="primary"
                  size="medium"
                  buttonStyle={styles.mainUploadButton}
                />
              </View>
      </LinearGradient>
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
    paddingHorizontal: wp(5),
    paddingTop: hp(5),
    paddingBottom: hp(3),
  },
  backButton: {
    backgroundColor: "#fff",
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainUploadButton: {
    width: '90%',
  },
  headerTitle: {
    fontSize: wp(5.5),
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    width: wp(10),
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
    paddingBottom: hp(3),
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#C538A5',
  },
  completedStep: {
    backgroundColor: '#C538A5',
  },
  progressStepText: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#999',
  },
  activeStepText: {
    color: '#fff',
  },
  completedStepText: {
    color: '#fff',
  },
  progressLine: {
    width: wp(15),
    height: 2,
    backgroundColor: '#C538A5',
  },
  activeProgressLine: {
    backgroundColor: '#C538A5',
  },
  completedProgressLine: {
    backgroundColor: '#C538A5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(15),
    flexGrow: 1,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: wp(4),
    padding: wp(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: hp(60),
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#C538A5',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verticalLine: {
    width: 2,
    backgroundColor: '#C538A5',
    marginRight: wp(3),
    marginTop: wp(1),
    minHeight: hp(15),
  },
  detailsContainer: {
    flex: 1,
  },
  detailItem: {
    marginBottom: hp(1),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C6C6C',
    flex: 0,
    minWidth: wp(25),
  },
  detailValue: {
    fontSize: 12,
    color: '#676869',
    fontWeight: '300',
    textAlign: 'left',
    flex: 1,
    marginLeft: wp(8),
  },
  detailSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: hp(0.5),
  },
  summarySection: {
    marginTop: hp(2),
    paddingTop: hp(2),
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#C539A5',
    borderStyle: 'dashed',
    marginBottom: hp(2),
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  summaryLabel: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#C539A5',
  },
  summaryValue: {
    fontSize: wp(4),
    color: '#666',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8E8F5',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    marginTop: hp(1),
  },
  totalLabel: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#C538A5',
  },
  totalValue: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#676869',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
    backgroundColor: '#FFF4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#C538A5',
    borderRadius: wp(2),
    paddingVertical: hp(2.5),
    shadowColor: '#C538A5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
export default AdvertismentConfirmationScreen;