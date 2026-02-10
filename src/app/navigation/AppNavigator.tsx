// src/app/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AdvertismentCreateScreen from '../../features/advertisments/screens/AdvertismentCreateScreen';
import CampaignUploadFiles from '../../features/advertisments/screens/CampaignUploadFiles';
import CompaignStatus from '../../features/advertisments/screens/CompaignStatus';
import FilterCategoryList from '../../features/boards/screens/FilterCategoryList';
import HomeScreen from '../../features/boards/screens/HomeScreen';
import SingleBoardDetail from '../../features/boards/screens/SingleBoardDetail';
import CampaignChatDetailScreen from '../../features/chat/screens/CampaignChatDetailScreen';
import ChatScreen from '../../features/chat/screens/ChatScreen';
import InboxScreen from '../../features/chat/screens/InboxScreen';
import CompanyListScreen from '../../features/companies/screens/CompanyListScreen';
import CreateCompanyScreen from '../../features/companies/screens/CreateCompanyScreen';
import FavouritesScreen from '../../features/favourites/screens/FavouritesScreen';
import ChangePassword from '../../features/profile/screens/ChangePassword';
import UpdateProfile from '../../features/profile/screens/UpdateProfile';
import BottomTab from './BottomTab';
// import PreviousCompanyScreen from '../../features/profile/screens/PreviousCompany';
import InviteLink from '../../features/invite/screens/InviteLink';
//  import UpdateProfile from '../../features/profile/screens/UpdateProfile';
import ContactSupportScreen from '../../components/ContactSupportScreen';
import AdvertismentCongratulateScreen from '../../features/advertisments/screens/AdvertismentCongratulateScreen';
import ChooseOptionScreen from '../../features/advertisments/screens/ChooseOptionScreen';
import CompanyWithInfoScreen from '../../features/advertisments/screens/CompanyWithInfoScreen';
import CompanywithoutInfoScreen from '../../features/advertisments/screens/CompanywithoutInfoScreen';
import SearchLocation from '../../features/locations/screens/SearchLocation';
import GetAllNotification from '../../features/notifications/screens/GetAllNotification';
import FAQsScreen from '../../features/profile/screens/FAQsScreen';
import HelpFAQsScreen from '../../features/profile/screens/HelpFAQsScreen';
import HelpMainScreen from '../../features/profile/screens/HelpMainScreen';
import PrivacyPolicy from '../../features/profile/screens/PrivacyPolicy';
import TermsAndConditions from '../../features/profile/screens/TermsAndConditions';
import TermsPrivacyOptions from '../../features/profile/screens/TermsPrivacyOptions';

// Payment Screens
import PaymentMethodScreen from '../../features/payment/screen/ChoosePayment';
import CardPaymentScreen from '../../features/payment/screens/CardPaymentScreen';
import OTPScreen from '../../features/payment/screens/OTPScreen';
import PaymentResultScreen from '../../features/payment/screens/PaymentResultScreen';
import WalletPaymentScreen from '../../features/payment/screens/WalletPaymentScreen';

// 🔹 Define navigation param types
export type AppStackParamList = {
  BottomTab: undefined;
  CompaignStatus: undefined;
  AdvertismentCreateScreen: {
    flow?: 'individual' | 'business';
    companyId?: number;
    boardData?: any;
  };
  CampaignUploadFiles: { uploadUrl: string; flow?: 'individual' | 'business' };
  CurrentLocation: undefined;
  HomeScreen: undefined;
  CompaniesScreen: undefined;
  CompanyListScreen: undefined;
  CreateCompanyScreen: { flow?: 'individual' | 'business'; boardData?: any };
  UpdateProfile: undefined;
  PreviousCompanyScreen:
    | { isSelectable?: boolean; boardData?: any }
    | undefined;
  ChangePassword: undefined;
  FavouritesScreen: undefined;
  FilterCategoryList: { slug?: string; autoSelectSeeAll?: boolean };
  SingleBoardDetail: { item: any };
  CompanyWithInfoScreen: { campaignId: string };
  AdvertismentCongratulateScreen: { campaignId: string };
  ChatScreen: { chatId: string; userName: string };
  InboxScreen: undefined;
  CampaignChatDetail: {
    campaignId: number;
    campaignName: string;
    boardLocation?: string;
  };
  Notifications: undefined;
  SearchLocation: { autoSelectSeeAll?: boolean } | undefined;
  ChooseOptionScreen: { boardData?: any };
  ContactSupportScreen: undefined;
  CompanywithoutInfoScreen: { campaignId: string };
  TermsAndConditions: { fromAuth?: boolean; navigateTo?: string } | undefined;
  HelpFAQsScreen: undefined;
  FAQsScreen: {
    card: {
      id: string;
      category: string;
      leadingLabel: string;
      title: string;
      icon: string;
      backgroundColor: string;
      borderColor: string;
      iconColor: string;
    };
  };

  InviteLink: undefined;
  TermsPrivacyOptions: undefined;
  HelpMainScreen: undefined;
  PrivacyPolicy: { fromAuth?: boolean; navigateTo?: string } | undefined;

  // Payment Screens
  ChoosePayment: {
    campaignId: string;
    amount: number;
    customerEmail: string;
    customerPhone: string;
  };
  CardPaymentScreen: {
    campaignId: string;
    amount: number;
    customerEmail: string;
    customerPhone: string;
  };
  WalletPaymentScreen: {
    campaignId: string;
    amount: number;
    walletType: 'jazzcash' | 'easypaisa';
    customerEmail: string;
  };
  OTPScreen: {
    transactionId: string;
    phoneNumber: string;
    walletType: 'jazzcash' | 'easypaisa';
    amount: number;
    campaignId?: string;
  };
  PaymentResultScreen: {
    status: 'success' | 'failure';
    transactionId: string;
    amount: number;
    orderId?: string;
    errorMessage?: string;
    campaignId?: string;
  };
};
const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTab" component={BottomTab} />
      <Stack.Screen name="CompanyListScreen" component={CompanyListScreen} />
      <Stack.Screen
        name="CreateCompanyScreen"
        component={CreateCompanyScreen}
      />
      <Stack.Screen
        name="CampaignUploadFiles"
        component={CampaignUploadFiles}
      />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="FavouritesScreen" component={FavouritesScreen} />
      <Stack.Screen name="SingleBoardDetail" component={SingleBoardDetail} />
      <Stack.Screen name="CompaignStatus" component={CompaignStatus} />
      <Stack.Screen name="FilterCategoryList" component={FilterCategoryList} />
      <Stack.Screen
        name="AdvertismentCreateScreen"
        component={AdvertismentCreateScreen}
      />
      <Stack.Screen
        name="AdvertismentCongratulateScreen"
        component={AdvertismentCongratulateScreen}
      />
      <Stack.Screen
        name="CompanyWithInfoScreen"
        component={CompanyWithInfoScreen}
      />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      {/* <Stack.Screen
        name="PreviousCompanyScreen"
        component={PreviousCompanyScreen}
      /> */}
      <Stack.Screen
        name="ContactSupportScreen"
        component={ContactSupportScreen}
      />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="InboxScreen" component={InboxScreen} />
      <Stack.Screen
        name="CampaignChatDetail"
        component={CampaignChatDetailScreen}
      />
      <Stack.Screen name="ChooseOptionScreen" component={ChooseOptionScreen} />
      <Stack.Screen
        name="CompanywithoutInfoScreen"
        component={CompanywithoutInfoScreen}
      />

      {/* <Stack.Screen
      name="CurrentLocation"
      component={CurrentLocationMinimalMap}
    /> */}
      <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
      <Stack.Screen name="Notifications" component={GetAllNotification} />
      <Stack.Screen name="SearchLocation" component={SearchLocation} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
      <Stack.Screen name="HelpFAQsScreen" component={HelpFAQsScreen} />
      <Stack.Screen name="HelpMainScreen" component={HelpMainScreen} />

      <Stack.Screen name="FAQsScreen" component={FAQsScreen} />
      <Stack.Screen name="InviteLink" component={InviteLink} />
      <Stack.Screen
        name="TermsPrivacyOptions"
        component={TermsPrivacyOptions}
      />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />

      {/* Payment Screens */}
      <Stack.Screen name="ChoosePayment" component={PaymentMethodScreen} />
      <Stack.Screen name="CardPaymentScreen" component={CardPaymentScreen} />
      <Stack.Screen
        name="WalletPaymentScreen"
        component={WalletPaymentScreen}
      />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen
        name="PaymentResultScreen"
        component={PaymentResultScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
