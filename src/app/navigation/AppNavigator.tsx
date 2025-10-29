// src/app/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AdvertismentCreateScreen from '../../features/advertisments/screens/AdvertismentCreateScreen';
import CampaignUploadFiles from '../../features/advertisments/screens/CampaignUploadFiles';
import CompaignStatus from '../../features/advertisments/screens/CompaignStatus';
import AdvertismentConfirmationScreen from '../../features/advertisments/screens/AdvertismentConfirmationScreen';
import AdvertismentCongratulateScreen from '../../features/advertisments/screens/AdvertismentCongratulateScreen';
import FilterCategoryList from '../../features/boards/screens/FilterCategoryList';
import HomeScreen from '../../features/boards/screens/HomeScreen';
import SingleBoardDetail from '../../features/boards/screens/SingleBoardDetail';
import CreateCompanyScreen from '../../features/companies/screens/CreateCompanyScreen';
import FavouritesScreen from '../../features/favourites/screens/FavouritesScreen';
import { ChatScreen } from '../../features/chat';
import ContactSupportScreen from '../../components/ContactSupportScreen';
import BottomTab from './BottomTab';
import UpdateProfile from '../../features/profile/screens/UpdateProfile';
import ChangePassword from '../../features/profile/screens/ChangePassword';
import PreviousCompanyScreen from '../../features/profile/screens/PreviousCompany';

// 🔹 Define navigation param types
export type AppStackParamList = {
  BottomTab: undefined;
  CompaignStatus: undefined;
  AdvertismentCreateScreen: undefined;
  CampaignUploadFiles: { uploadUrl: string };
  CurrentLocation: undefined;
  CurrentLocationMinimalMap: undefined;
  HomeScreen: undefined;
  CompaniesScreen: undefined;
  CreateCompanyScreen: undefined;
  UpdateProfile: undefined;
  PreviousCompanyScreen: undefined;
  ChangePassword: undefined;
  FavouritesScreen: undefined;
  FilterCategoryList: {
    slug?: string;
    categoryId?: string;
    categoryName?: string;
    selectedTab?: string;
    filter?: string;
    tabType?: string;
  };
  SingleBoardDetail: { item: any };
  ChatScreen: undefined;
  ContactSupportScreen: undefined;
  AdvertismentConfirmationScreen: { campaignId: string };
  AdvertismentCongratulateScreen: { campaignId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BottomTab" component={BottomTab} />
    <Stack.Screen name="AdvertismentCreateScreen" component={AdvertismentCreateScreen} />
    <Stack.Screen name="CampaignUploadFiles" component={CampaignUploadFiles} />
    <Stack.Screen name="CreateCompanyScreen" component={CreateCompanyScreen} />
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="FavouritesScreen" component={FavouritesScreen} />
    <Stack.Screen name="SingleBoardDetail" component={SingleBoardDetail} />
    <Stack.Screen name="CompaignStatus" component={CompaignStatus} />
    <Stack.Screen name="FilterCategoryList" component={FilterCategoryList} />
    <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
    <Stack.Screen name="ChangePassword" component={ChangePassword} />
    <Stack.Screen name="PreviousCompanyScreen" component={PreviousCompanyScreen} />
    <Stack.Screen name="ChatScreen" component={ChatScreen} />
    <Stack.Screen name="ContactSupportScreen" component={ContactSupportScreen} />
    <Stack.Screen name="AdvertismentConfirmationScreen" component={AdvertismentConfirmationScreen} />
    <Stack.Screen name="AdvertismentCongratulateScreen" component={AdvertismentCongratulateScreen} />
  </Stack.Navigator>
);

export default AppNavigator;