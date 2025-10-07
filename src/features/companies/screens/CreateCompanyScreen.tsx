// src/features/companies/screens/CreateCompanyScreen.tsx

import { Formik, FormikHelpers } from 'formik';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Yup from 'yup';
import LogoutButton from '../../../components/LogoutButton';
import { useBusinessCategoriesWithGroups, useCreateCompany } from '../hooks';
import { CreateCompanyRequest } from '../types';

const validationSchema = Yup.object().shape({
  company_name: Yup.string()
    .required('Company name is required')
    .min(2, 'Company name must be at least 2 characters'),
  business_category_id: Yup.number()
    .required('Business category is required')
    .positive('Please select a valid category'),
  company_ntn: Yup.string()
    .required('Company NTN is required')
    .matches(/^[0-9]{7}-[0-9]{1}$/, 'Enter a valid NTN format (1234567-1)'),
  address: Yup.string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters'),
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  contact_number: Yup.string()
    .required('Contact number is required')
    .matches(/^\+92[0-9]{10}$/, 'Enter a valid Pakistani phone number'),
});

interface CreateCompanyScreenProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateCompanyScreen: React.FC<CreateCompanyScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const createCompanyMutation = useCreateCompany();
  const { data: categoriesWithGroupsData } = useBusinessCategoriesWithGroups();

  const groupsWithCategories = categoriesWithGroupsData?.data || [];
  const groups = groupsWithCategories.map(group => ({
    id: group.id,
    name: group.name,
    description: group.description,
  }));
  const categories = selectedGroupId
    ? groupsWithCategories.find(group => group.id === selectedGroupId)
        ?.categories || []
    : [];

  const handleSubmit = async (
    values: CreateCompanyRequest,
    { setSubmitting, resetForm }: FormikHelpers<CreateCompanyRequest>,
  ) => {
    try {
      await createCompanyMutation.mutateAsync(values);
      Alert.alert('Success', 'Company created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            onSuccess?.();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create company. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGroupSelect = (groupId: number) => {
    setSelectedGroupId(groupId);
    setShowGroupDropdown(false);
    setShowCategoryDropdown(true);
  };

  const handleCategorySelect = (categoryId: number, setFieldValue: any) => {
    setFieldValue('business_category_id', categoryId);
    setShowCategoryDropdown(false);
  };

  return (
    <LinearGradient
      colors={['#FFF4FD', '#fef3f9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onCancel}>
              <Ionicons name="arrow-back" size={24} color="#C539A5" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Company</Text>
            <View style={styles.placeholder} />
          </View>

          <Formik<CreateCompanyRequest>
            initialValues={{
              company_name: '',
              business_category_id: 0,
              company_ntn: '',
              address: '',
              email: '',
              contact_number: '+92',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
              isSubmitting,
            }) => (
              <View style={styles.form}>
                {/* Company Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company Name *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.company_name && errors.company_name
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder="Enter company name"
                    value={values.company_name}
                    onChangeText={handleChange('company_name')}
                    onBlur={handleBlur('company_name')}
                    placeholderTextColor="#999"
                  />
                  {touched.company_name && errors.company_name && (
                    <Text style={styles.errorText}>{errors.company_name}</Text>
                  )}
                </View>

                {/* Business Group Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Business Group *</Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdown,
                      !selectedGroupId ? styles.inputError : undefined,
                    ]}
                    onPress={() => setShowGroupDropdown(!showGroupDropdown)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !selectedGroupId && styles.placeholderText,
                      ]}
                    >
                      {selectedGroupId
                        ? groups.find(g => g.id === selectedGroupId)?.name
                        : 'Select business group'}
                    </Text>
                    <Ionicons
                      name={showGroupDropdown ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                  {showGroupDropdown && (
                    <View style={styles.dropdownList}>
                      {groups.map(group => (
                        <TouchableOpacity
                          key={group.id}
                          style={styles.dropdownItem}
                          onPress={() => handleGroupSelect(group.id)}
                        >
                          <Text style={styles.dropdownItemText}>
                            {group.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Business Category Selection */}
                {selectedGroupId && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Business Category *</Text>
                    <TouchableOpacity
                      style={[
                        styles.dropdown,
                        touched.business_category_id &&
                        errors.business_category_id
                          ? styles.inputError
                          : undefined,
                      ]}
                      onPress={() =>
                        setShowCategoryDropdown(!showCategoryDropdown)
                      }
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          !values.business_category_id &&
                            styles.placeholderText,
                        ]}
                      >
                        {values.business_category_id
                          ? categories.find(
                              c => c.id === values.business_category_id,
                            )?.name
                          : 'Select business category'}
                      </Text>
                      <Ionicons
                        name={
                          showCategoryDropdown ? 'chevron-up' : 'chevron-down'
                        }
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                    {showCategoryDropdown && (
                      <View style={styles.dropdownList}>
                        {categories.map(category => (
                          <TouchableOpacity
                            key={category.id}
                            style={styles.dropdownItem}
                            onPress={() =>
                              handleCategorySelect(category.id, setFieldValue)
                            }
                          >
                            <Text style={styles.dropdownItemText}>
                              {category.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {touched.business_category_id &&
                      errors.business_category_id && (
                        <Text style={styles.errorText}>
                          {errors.business_category_id}
                        </Text>
                      )}
                  </View>
                )}

                {/* Company NTN */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company NTN *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.company_ntn && errors.company_ntn
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder="1234567-1"
                    value={values.company_ntn}
                    onChangeText={handleChange('company_ntn')}
                    onBlur={handleBlur('company_ntn')}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  {touched.company_ntn && errors.company_ntn && (
                    <Text style={styles.errorText}>{errors.company_ntn}</Text>
                  )}
                </View>

                {/* Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Address *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      touched.address && errors.address
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder="Enter complete address"
                    value={values.address}
                    onChangeText={handleChange('address')}
                    onBlur={handleBlur('address')}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor="#999"
                  />
                  {touched.address && errors.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.email && errors.email
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder="company@example.com"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                {/* Contact Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Number *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.contact_number && errors.contact_number
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder="+923001234567"
                    value={values.contact_number}
                    onChangeText={handleChange('contact_number')}
                    onBlur={handleBlur('contact_number')}
                    keyboardType="phone-pad"
                    placeholderTextColor="#999"
                  />
                  {touched.contact_number && errors.contact_number && (
                    <Text style={styles.errorText}>
                      {errors.contact_number}
                    </Text>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.disabledButton,
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonContent}>
                    {isSubmitting && (
                      <ActivityIndicator
                        size="small"
                        color="#fff"
                        style={styles.loader}
                      />
                    )}
                    <Text style={styles.buttonText}>
                      {isSubmitting ? 'Creating...' : 'Create Company'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
          <LogoutButton style={{ marginTop: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C539A5',
  },
  placeholder: {
    width: 40,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#C539A5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loader: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateCompanyScreen;
