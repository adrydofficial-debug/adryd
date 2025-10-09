// src/app/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CreateCompanyScreen from '../../features/companies/screens/CreateCompanyScreen';
import HomeScreen from '../../features/boards/HomeScreen';
import UpdateProfile from '../../features/Profile/screens/UpdateProfile';
import ChangePassword from '../../features/Profile/screens/ChangePassword';
import PreviousCompanyScreen from '../../features/Profile/screens/PreviousCompany';
import CurrentLocationMinimalMap from '../../features/Location/CurrentLocationMinimalMap'
import AdvertismentCreateScreen from '../../features/advertisments/screens/AdvertismentCreateScreen';
// 🔹 Define navigation param types
export type AppStackParamList = {
  AdvertismentCreateScreen: undefined;
  CurrentLocation: undefined;
  HomeScreen: undefined;
  CompaniesScreen: undefined;
  CreateCompanyScreen: undefined;
  UpdateProfile: undefined;
    PreviousCompanyScreen:undefined;
    ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
 
  <Stack.Screen name="AdvertismentCreateScreen" component={AdvertismentCreateScreen} />
  <Stack.Screen name="HomeScreen" component={HomeScreen} />
  <Stack.Screen name="CompaniesScreen" component={CreateCompanyScreen} />
  <Stack.Screen name="CreateCompanyScreen" component={CreateCompanyScreen} />
  <Stack.Screen name="ChangePassword" component={ChangePassword} />
  <Stack.Screen name="PreviousCompanyScreen" component={PreviousCompanyScreen}/>
  <Stack.Screen name="CurrentLocation" component={CurrentLocationMinimalMap} />
   <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
  </Stack.Navigator>

);

export default AppNavigator;
