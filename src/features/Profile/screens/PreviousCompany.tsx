import React, { useState } from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AddIcon from '../../../assets/images/add.svg';
import AdrydLogo from '../../../assets/images/AdrydLogo.png';
import AxoVoltLogo from '../../../assets/images/AxoVolt.png';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

// Base dimensions for responsive scaling
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Responsive scaling functions
const scaleWidth = (size: number) => (width / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (height / BASE_HEIGHT) * size;
const scaleFont = (size: number) => (width / BASE_WIDTH) * size;

interface Company {
  id: string;
  name: string;
  logo: any; // Image source
  color: string;
  business: string;
  ntn: string;
  address: string;
  email: string;
  number: string;
}

interface PreviousCompanyScreenProps {
  onCompanySelect?: (company: Company) => void;
  onAddNewCompany?: () => void;
}

const PreviousCompanyScreen: React.FC<PreviousCompanyScreenProps> = ({
  onCompanySelect,
  onAddNewCompany,
}) => {
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Mock data for companies - in real app this would come from API/store
  const companies: Company[] = [
    {
      id: '1',
      name: 'ADRYD PVT-LTD',
      logo: AdrydLogo,
      color: '#C539A5',
      business: 'Marketing',
      ntn: '151561651654',
      address: 'DHA Phase-4',
      email: 'adryd@app',
      number: '03048794564',
    },
    {
      id: '2',
      name: 'TAXX OIL PVT-LTD',
      logo: AxoVoltLogo,
      color: '#4CAF50',
      business: 'Oil & Gas',
      ntn: '123456789012',
      address: 'Karachi Port',
      email: 'contact@taxxoil.com',
      number: '03012345678',
    },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddNewCompany = () => {
    onAddNewCompany?.();
    // Navigate to add company screen or show modal
    console.log('Add new company pressed');
  };

  const handleCompanySelect = (company: Company) => {
    onCompanySelect?.(company);
    // Navigate to company details or dashboard
    console.log('Company selected:', company.name);
  };

  const toggleExpanded = (companyId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const isExpanded = (companyId: string) => expandedItems.has(companyId);

  const renderAddCompanyCard = () => (
    <TouchableOpacity
      style={styles.addCompanyCard}
      onPress={handleAddNewCompany}
      activeOpacity={0.8}>
      <View style={styles.addCompanyIconContainer}>
        <AddIcon
          width={scaleFont(32)}
          height={scaleFont(32)}
          // color="#9E9E9E"
        />
      </View>
    </TouchableOpacity>
  );

  const renderCompanyCard = (company: Company) => {
    const expanded = isExpanded(company.id);
    
    return (
      <View style={styles.companyCard}>
        {/* Header Section */}
        <TouchableOpacity
          style={styles.companyCardHeader}
          onPress={() => toggleExpanded(company.id)}
          activeOpacity={0.8}>
          <View style={styles.companyCardContent}>
            {/* Company Logo */}
            <View style={[styles.companyLogoContainer, { backgroundColor: '#FFFFFF' }]}>
              <Image 
                source={company.logo} 
                style={styles.companyLogoImage}
                resizeMode="contain"
              />
            </View>

            {/* Company Name */}
            <View style={styles.companyInfoContainer}>
              <Text style={styles.companyName}>{company.name}</Text>
            </View>

            {/* Chevron Indicator */}
            <View style={styles.chevronContainer}>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={scaleFont(16)}
               color={expanded ? "#999" : "#C539A5"} 
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Expandable Details Section */}
        {expanded && (
          <View style={styles.companyDetailsSection}>
            <View style={styles.detailsContainer}>
              <View style={styles.pinkLine} />
              <View style={styles.detailsContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Business</Text>
                  <Text style={styles.detailValue}>{company.business}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>NTN</Text>
                  <Text style={styles.detailValue}>{company.ntn}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{company.address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{company.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Number</Text>
                  <Text style={styles.detailValue}>{company.number}</Text>
                </View>
              </View>
            </View>
            
            {/* Continue Business Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => handleCompanySelect(company)}
              activeOpacity={0.8}>
              <Text style={styles.continueButtonText}>Continue this business</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}>
          <Ionicons
            name="chevron-back"
            size={scaleFont(24)}
            color="#000000"
          />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Select</Text>
          <Text style={styles.headerSubtitle}>Select previous company</Text>
        </View>
        
     
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderAddCompanyCard()}
        <View style={styles.companyList}>
          {companies.map((company) => (
            <View key={company.id}>
              {renderCompanyCard(company)}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical:25
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(2),
  },
  backButton: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(20),
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: '#000000',
    marginBottom: scaleHeight(2),
  },
  headerSubtitle: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: '#666666',
  },
  headerSpacer: {
    width: scaleWidth(40),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  addCompanyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleWidth(12),
    height: scaleHeight(80),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCompanyIconContainer: {
    width: scaleWidth(40),
    height: scaleWidth(48),
    borderRadius: scaleWidth(24),
    // backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyList: {
    flex: 1,
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleWidth(12),
    marginBottom: hp(1.5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  companyCardHeader: {
    minHeight: scaleHeight(70),
    backgroundColor: '#ffffff',
    borderTopLeftRadius: scaleWidth(12),
    borderTopRightRadius: scaleWidth(12),
  },
  companyCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  companyLogoContainer: {
    // width: scaleWidth(48),
    // height: scaleWidth(48),
    // borderRadius: scaleWidth(24),
    // alignItems: 'center',
    // justifyContent: 'center',
    // marginRight: wp(4),
    // padding: scaleWidth(8),
  },
  companyLogoImage: {
    width: scaleWidth(48),
    height: scaleWidth(48),
    borderRadius: scaleWidth(24),
  },
  companyInfoContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: '#000000',
    paddingHorizontal: wp(2),
  },
  chevronContainer: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyDetailsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(5),
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: hp(2),
    paddingHorizontal: wp(5),
  },
  pinkLine: {
    width: scaleWidth(4),
    backgroundColor: '#C539A5',
    marginRight: wp(4),
    borderRadius: scaleWidth(2),
  },
  detailsContent: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(0.8),
    minHeight: scaleHeight(35),
  },
  detailLabel: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  detailValue: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: '#666666',
    flex: 1,
    textAlign: 'right',
  },
  continueButton: {
    backgroundColor: '#C539A5',
    // borderRadius: scaleWidth(8),
    paddingVertical: hp(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(2),
    width:380,
    position:'absolute',
    bottom:0,
    // left:wp(4)
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
});

export default PreviousCompanyScreen;
