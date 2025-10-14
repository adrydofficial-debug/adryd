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
  console.log('BusinessCategoryDropdown - Received data:', data);
  console.log('BusinessCategoryDropdown - Received value:', value);
  console.log('BusinessCategoryDropdown - Received onSelect:', onSelect);
  
  // Build a derived list with a separator item inserted after every 5 real items
  const dataWithSeparators: DropdownData[] = React.useMemo(() => {
    console.log('Processing data for dropdown:', data);
    if (!Array.isArray(data) || data.length === 0) {
      console.log('No data available for dropdown');
      return [];
    }
    const output: DropdownData[] = [];
    data.forEach((item, idx) => {
      output.push(item);
      const isEnd = idx === data.length - 1;
      const shouldInsert = (idx + 1) % 5 === 0 && !isEnd;
      if (shouldInsert) {
        output.push({
          label: `__sep__${idx}`,
          value: `__sep__${idx}`,
          isSeparator: true,
          disable: true,
        });
      }
    });
    console.log('Processed data with separators:', output);
    return output;
  }, [data]);

  return (
    <View style={[styles.container, containerStyle]}>
       {/* <Text style={styles.label}>
        {label} */}
        {/* {required && <Text style={styles.required}> *</Text>} */}
      {/* </Text>  */}
      
      <Dropdown
        style={[styles.dropdown, error && styles.dropdownError]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        iconStyle={styles.iconStyle}
        data={dataWithSeparators}
        search={false}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={item => {
          console.log('Dropdown onChange triggered with item:', item);
          // Ignore taps on separator rows
          if ((item as DropdownData)?.isSeparator) {
            console.log('Ignoring separator item');
            return;
          }
          console.log('Calling onSelect with value:', item.value);
          onSelect(item.value);
        }}
        // renderLeftIcon={() => (
          // <View style={styles.leftIconContainer}>
          //   <Ionicons name="business" size={18} color="#C539A5" />
          // </View>
        // )}
        renderRightIcon={() => (
          <View style={styles.rightIconContainer}>
            <Ionicons name="chevron-down" size={20} color="#C539A5" />
          </View>
        )}
        renderItem={(item: DropdownData) => {
          if (item.isSeparator) {
            return <View style={styles.separatorLine} />;
          }
          return (
            <View style={styles.dropdownItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.itemText}>{item.label}</Text>
            </View>
          );
        }}
        dropdownPosition="auto"
        containerStyle={styles.dropdownContainer}
        itemContainerStyle={styles.itemContainer}
        activeColor="#f8f0ff"
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
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 0,
    borderColor: 'transparent',
    zIndex: 10,
  },
  dropdownError: {
    borderColor: '#ff4444',
    borderWidth: 1,
    backgroundColor: '#fff5f5',
  },
  placeholderStyle: {
    fontSize: 12,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 12,
    color: '#333',
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
  },
  bulletPoint: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
    width: 12,
    textAlign: 'center',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  itemText: {
    fontSize: 12,
    color: '#595959',
    flex: 1,
  },
  dropdownContainer: {
    width: width * 0.62, // reduce dropdown list width
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 20,
    zIndex: 20,
  },
  itemContainer: {
    borderRadius: 8,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 20,
    marginVertical: 6,
  },
});

export default BusinessCategoryDropdown;
