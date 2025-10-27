import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const { width, height } = Dimensions.get('window');

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
  group?: string;
}

interface CustomDropdownProps {
  label: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  error?: string;
  containerStyle?: any;
  required?: boolean;
  maxHeight?: number;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  selectedValue,
  onSelect,
  disabled = false,
  error,
  containerStyle,
  required = false,
  maxHeight = 300,
}) => {
  const [focused, setFocused] = React.useState(false);
  // Build a derived list with grouped options
  const dataWithGroups: DropdownOption[] = React.useMemo(() => {
    if (!Array.isArray(options) || options.length === 0) return [];
    
    // Group options by category
    const grouped = options.reduce((acc, option) => {
      const group = option.group || 'Other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(option);
      return acc;
    }, {} as {[key: string]: DropdownOption[]});

    const output: DropdownOption[] = [];
    
    // Add "All" option first
    output.push({
      label: 'All',
      value: 'all',
      group: 'All',
    });

    // Add separator after "All"
    output.push({
      label: '__sep__all',
      value: '__sep__all',
      group: 'separator',
    });

    // Add grouped options
    Object.entries(grouped).forEach(([groupName, groupOptions]) => {
      // Add group header
      output.push({
        label: groupName,
        value: `__group__${groupName}`,
        group: 'header',
      });
      
      // Add group options
      groupOptions.forEach((option, index) => {
        output.push(option);
        // Add separator after every 5 items within a group
        if ((index + 1) % 5 === 0 && index < groupOptions.length - 1) {
          output.push({
            label: `__sep__${groupName}_${index}`,
            value: `__sep__${groupName}_${index}`,
            group: 'separator',
          });
        }
      });
    });
    
    return output;
  }, [options]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <Dropdown
        style={[
          styles.dropdown,
          error && styles.errorDropdown,
          disabled && styles.disabledDropdown,
          focused && styles.dropdownFocused,
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        iconStyle={styles.iconStyle}
        data={dataWithGroups}
        search={false}
        maxHeight={maxHeight}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={selectedValue}
        onChange={item => {
          // Ignore taps on separator and header rows
          if (item.group === 'separator' || item.group === 'header') return;
          onSelect(item.value);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        renderItem={(item: DropdownOption) => {
          if (item.group === 'separator') {
            return <View style={styles.separatorLine} />;
          }
          if (item.group === 'header') {
            return (
              <View style={styles.groupHeaderContainer}>
                <Text style={styles.groupHeader}>{item.label}</Text>
              </View>
            );
          }
          if (item.value === 'all') {
            return (
              <View style={styles.allOptionContainer}>
                <Text style={styles.allOptionText}>{item.label}</Text>
              </View>
            );
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
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
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
    borderWidth: 1,
    borderColor: '#e2d1d1',
  },
  dropdownFocused: {
    borderColor: '#C539A5',
    borderWidth: 2,
  },
  errorDropdown: {
    borderColor: '#ff4444',
  },
  disabledDropdown: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
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
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
  },
  dropdownContainer: {
    width: width * 0.62,
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
    elevation: 5,
  },
  itemContainer: {
    borderRadius: 8,
  },
  allOptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  allOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C539A5',
  },
  groupHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  groupHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  itemText: {
    fontSize: 16,
    color: '#595959',
    flex: 1,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
    width: 12,
    textAlign: 'center',
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 20,
    marginVertical: 6,
  },
});

export default CustomDropdown;
