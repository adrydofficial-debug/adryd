import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export interface DropdownData {
  label: string;
  value: string;
  // When true, this row is a visual separator and should not be selectable
  isSeparator?: boolean;
  // Some libraries respect a disable flag to block selection
  disable?: boolean;
}

interface BusinessCategoryDropdownProps {
  label: string;
  data: DropdownData[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  containerStyle?: any;
  error?: boolean;
}

const BusinessCategoryDropdown: React.FC<BusinessCategoryDropdownProps> = ({
  label,
  data,
  value,
  onSelect,
  placeholder = 'Select an option',
  required = false,
  containerStyle,
  error = false,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  
  // Use data directly without separators
  const dataWithSeparators: DropdownData[] = React.useMemo(() => {
    console.log('Processing data for dropdown:', data);
    if (!Array.isArray(data) || data.length === 0) {
      console.log('No data available for dropdown');
      return [];
    }
    return data;
  }, [data]);

  return (
    <View style={[styles.container, containerStyle]}>
       {/* <Text style={styles.label}>
        {label} */}
        {/* {required && <Text style={styles.required}> *</Text>} */}
      {/* </Text>  */}
      
      <Dropdown
        style={[
          styles.dropdown,
          error && styles.dropdownError,
          isFocused && !error && styles.dropdownFocused
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={[
          styles.selectedTextStyle,
          isFocused && !error && styles.selectedTextFocused
        ]}
        iconStyle={styles.iconStyle}
        data={dataWithSeparators}
        search={false}
        maxHeight={400}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={item => {
          console.log('Dropdown onChange triggered with item:', item);
          console.log('Calling onSelect with value:', item.value);
          onSelect(item.value);
          setIsFocused(false);
        }}
        renderRightIcon={() => (
          <View style={styles.rightIconContainer}>
            <Ionicons 
              name="chevron-down" 
              size={18} 
              color={error ? '#EF4444' : '#6B7280'} 
            />
          </View>
        )}
        renderItem={(item: DropdownData) => {
          const isSelected = item.value === value;
          return (
            <View style={[
              styles.dropdownItem,
              isSelected && styles.dropdownItemSelected
            ]}>
              <View style={styles.itemContent}>
                <Text style={[
                  styles.bulletPoint,
                  isSelected && styles.bulletPointSelected
                ]}>•</Text>
                <Text style={[
                  styles.itemText,
                  isSelected && styles.itemTextSelected
                ]}>
                  {item.label}
                </Text>
              </View>
            </View>
          );
        }}
        dropdownPosition="auto"
        containerStyle={styles.dropdownContainer}
        itemContainerStyle={styles.itemContainer}
        activeColor="#C539A5"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    zIndex: 10,
    elevation: 10,
  },
  label: {
    fontSize: width * 0.04,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#ff4444',
  },
  dropdown: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingTop: 10,
    paddingRight: 16,
    paddingBottom: 10,
    paddingLeft: 16,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    zIndex: 10,
    justifyContent: 'center',
  },
  dropdownError: {
    borderColor: '#EF4444',
    borderWidth: 0.5,
    backgroundColor: '#FFFFFF',
  },
  dropdownFocused: {
    borderColor: '#18181B',
    borderWidth: 0.5,
  },
  placeholderStyle: {
    fontSize: 12,
    color: '#70737D',
    fontWeight: '400',
  },
  selectedTextStyle: {
    fontSize: 12,
    color: '#70737D',
    fontWeight: '400',
  },
  selectedTextFocused: {
    color: '#18181B',
    fontWeight: '500',
  },
  iconStyle: {
    width: 20,
    height: 20,
    tintColor: '#C539A5', // Make icon more visible with brand color
  },
  leftIconContainer: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    minHeight: 44,
  },
  dropdownItemSelected: {
    backgroundColor: '#C539A5',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 12,
    width: 8,
    textAlign: 'center',
  },
  bulletPointSelected: {
    color: '#FFFFFF',
  },
  itemText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '400',
    flex: 1,
  },
  itemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dropdownContainer: {
    width: width - (width * 0.12 * 2),
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 20,
    marginTop: 4,
    overflow: 'hidden',
  },
  itemContainer: {
    borderRadius: 0,
    paddingVertical: 2,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderWidth: 0,
  },
});

export default BusinessCategoryDropdown;

