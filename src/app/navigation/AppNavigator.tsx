// src/app/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CreateCompanyScreen from '../../features/companies/screens/CreateCompanyScreen';

// 🔹 Define navigation param types
export type AppStackParamList = {
  HomeScreen: undefined;
  CompaniesScreen: undefined;
  CreateCompanyScreen: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={CreateCompanyScreen} />
    <Stack.Screen name="CompaniesScreen" component={CreateCompanyScreen} />
    <Stack.Screen name="CreateCompanyScreen" component={CreateCompanyScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
