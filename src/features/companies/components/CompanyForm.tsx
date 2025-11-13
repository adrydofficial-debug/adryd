// Reusable Company Form Component with Clean API Integration
// This component demonstrates clean methodology with proper separation of concerns

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomInput from '../../../components/CustomInput';

// Clean imports
import { CreateCompanyRequest } from '../types';
import { getErrorMessage, isValidationError, isNetworkError } from '../utils/errorHandler';

// Validation schema
const companyFormValidationSchema = Yup.object().shape({
  company_name: Yup.string()
    .required('Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  company_category_id: Yup.number()
    .required('Business category is required')
    .positive('Please select a valid category'),
  company_ntn: Yup.string()
    .required('Company NTN is required')
    .matches(/^[0-9]{7}-[0-9]{1}$/, 'Enter a valid NTN format (1234567-1)'),
  address: Yup.string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must be less than 500 characters'),
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  contact_number: Yup.string()
    .required('Contact number is required')
    .matches(/^\+92[0-9]{10}$/, 'Enter a valid Pakistani phone number'),
  logo_url: Yup.string()
    .url('Enter a valid URL')
    .required('Logo URL is required'),
  logo_filename: Yup.string()
    .required('Logo filename is required')
    .matches(/\.(jpg|jpeg|png|gif|svg)$/i, 'Invalid file format'),
  logo_size: Yup.number()
    .required('Logo size is required')
    .positive('Logo size must be positive')
    .max(10 * 1024 * 1024, 'Logo size must be less than 10MB'),
  logo_type: Yup.string()
    .required('Logo type is required')
    .matches(/^image\/(jpg|jpeg|png|gif|svg)$/i, 'Invalid image type'),
});

interface CompanyFormProps {
  initialValues?: Partial<CreateCompanyRequest>;
  onSubmit: (values: CreateCompanyRequest) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
  categories?: Array<{ id: number; name: string }>;
  groups?: Array<{ id: number; name: string }>;
  showLogoFields?: boolean;
  showCategorySelection?: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  submitButtonText = 'Submit',
  isSubmitting = false,
  categories = [],
  groups = [],
  showLogoFields = true,
  showCategorySelection = true,
}) => {
  // Clean state management
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Form management using clean methodology
  const formik = useFormik<CreateCompanyRequest>({
    initialValues: {
      company_name: initialValues.company_name || '',
      company_category_id: initialValues.company_category_id || 0,
      company_ntn: initialValues.company_ntn || '',
      address: initialValues.address || '',
      email: initialValues.email || '',
      contact_number: initialValues.contact_number || '+92',
      logo_url: initialValues.logo_url || '',
      logo_filename: initialValues.logo_filename || '',
      logo_size: initialValues.logo_size || 0,
      logo_type: initialValues.logo_type || '',
    },
    validationSchema: companyFormValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Clean event handlers
  const handleGroupSelect = (groupId: number) => {
    setSelectedGroupId(groupId);
    setShowGroupDropdown(false);
    setShowCategoryDropdown(true);
    formik.setFieldValue('company_category_id', 0);
  };

  const handleCategorySelect = (categoryId: number) => {
    formik.setFieldValue('company_category_id', categoryId);
    setShowCategoryDropdown(false);
  };

  const handleFieldChange = (field: keyof CreateCompanyRequest, value: any) => {
    formik.setFieldValue(field, value);
  };

  const filteredCategories = selectedGroupId
    ? categories.filter(cat => cat.id === selectedGroupId)
    : categories;

  return (
    <View style={styles.container}>
      {/* Company Name */}
      <CustomInput
        label="Company Name *"
        placeholder="Enter company name"
        value={formik.values.company_name}
        onChangeText={(value) => handleFieldChange('company_name', value)}
        onBlur={formik.handleBlur('company_name')}
        error={formik.touched.company_name && formik.errors.company_name ? formik.errors.company_name : null}
        containerStyle={styles.inputGroup}
      />

      {/* Business Group Selection */}
      {showCategorySelection && groups.length > 0 && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Group *</Text>
          <TouchableOpacity
            style={[
              styles.dropdown,
              !selectedGroupId && styles.inputError,
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
                  <Text style={styles.dropdownItemText}>{group.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Business Category Selection */}
      {showCategorySelection && selectedGroupId && categories.length > 0 && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Category *</Text>
          <TouchableOpacity
            style={[
              styles.dropdown,
              formik.touched.company_category_id && formik.errors.company_category_id && styles.inputError,
            ]}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text
              style={[
                styles.dropdownText,
                !formik.values.company_category_id && styles.placeholderText,
              ]}
            >
              {formik.values.company_category_id
                ? categories.find(c => c.id === formik.values.company_category_id)?.name
                : 'Select business category'}
            </Text>
            <Ionicons
              name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
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
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Text style={styles.dropdownItemText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {formik.touched.company_category_id && formik.errors.company_category_id && (
            <Text style={styles.errorText}>{formik.errors.company_category_id}</Text>
          )}
        </View>
      )}

      {/* Company NTN */}
      <CustomInput
        label="Company NTN *"
        placeholder="1234567-1"
        value={formik.values.company_ntn}
        onChangeText={(value) => handleFieldChange('company_ntn', value)}
        onBlur={formik.handleBlur('company_ntn')}
        keyboardType="numeric"
        error={formik.touched.company_ntn && formik.errors.company_ntn ? formik.errors.company_ntn : null}
        containerStyle={styles.inputGroup}
      />

      {/* Address */}
      <CustomInput
        label="Address *"
        placeholder="Enter complete address"
        value={formik.values.address}
        onChangeText={(value) => handleFieldChange('address', value)}
        onBlur={formik.handleBlur('address')}
        multiline={true}
        numberOfLines={3}
        error={formik.touched.address && formik.errors.address ? formik.errors.address : null}
        containerStyle={styles.inputGroup}
      />

      {/* Email */}
      <CustomInput
        label="Email *"
        placeholder="company@example.com"
        value={formik.values.email}
        onChangeText={(value) => handleFieldChange('email', value)}
        onBlur={formik.handleBlur('email')}
        keyboardType="email-address"
        error={formik.touched.email && formik.errors.email ? formik.errors.email : null}
        containerStyle={styles.inputGroup}
      />

      {/* Contact Number */}
      <CustomInput
        label="Contact Number *"
        placeholder="3XXXXXXXXX"
        isPhoneNumber={true}
        value={formik.values.contact_number}
        onChangeText={(value) => handleFieldChange('contact_number', value)}
        onBlur={formik.handleBlur('contact_number')}
        error={formik.touched.contact_number && formik.errors.contact_number ? formik.errors.contact_number : null}
        containerStyle={styles.inputGroup}
      />

      {/* Logo Fields */}
      {showLogoFields && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Logo Information</Text>
          </View>

          {/* Logo URL */}
          <CustomInput
            label="Logo URL *"
            placeholder="https://example.com/logo.png"
            value={formik.values.logo_url}
            onChangeText={(value) => handleFieldChange('logo_url', value)}
            onBlur={formik.handleBlur('logo_url')}
            keyboardType="url"
            error={formik.touched.logo_url && formik.errors.logo_url ? formik.errors.logo_url : null}
            containerStyle={styles.inputGroup}
          />

          {/* Logo Filename */}
          <CustomInput
            label="Logo Filename *"
            placeholder="logo.png"
            value={formik.values.logo_filename}
            onChangeText={(value) => handleFieldChange('logo_filename', value)}
            onBlur={formik.handleBlur('logo_filename')}
            error={formik.touched.logo_filename && formik.errors.logo_filename ? formik.errors.logo_filename : null}
            containerStyle={styles.inputGroup}
          />

          {/* Logo Size and Type Row */}
          <View style={styles.row}>
            <CustomInput
              label="Logo Size (bytes) *"
              placeholder="2048"
              value={formik.values.logo_size.toString()}
              onChangeText={(value) => handleFieldChange('logo_size', parseInt(value) || 0)}
              onBlur={formik.handleBlur('logo_size')}
              keyboardType="numeric"
              error={formik.touched.logo_size && formik.errors.logo_size ? formik.errors.logo_size : null}
              containerStyle={[styles.inputGroup, styles.halfWidth]}
            />

            <CustomInput
              label="Logo Type *"
              placeholder="image/png"
              value={formik.values.logo_type}
              onChangeText={(value) => handleFieldChange('logo_type', value)}
              onBlur={formik.handleBlur('logo_type')}
              error={formik.touched.logo_type && formik.errors.logo_type ? formik.errors.logo_type : null}
              containerStyle={[styles.inputGroup, styles.halfWidth]}
            />
          </View>
        </>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || formik.isSubmitting) && styles.disabledButton,
          ]}
          onPress={() => formik.handleSubmit()}
          disabled={isSubmitting || formik.isSubmitting}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            {(isSubmitting || formik.isSubmitting) && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={styles.loader}
              />
            )}
            <Text style={styles.buttonText}>
              {isSubmitting || formik.isSubmitting ? 'Submitting...' : submitButtonText}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#C539A5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#C539A5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
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

export default CompanyForm;
