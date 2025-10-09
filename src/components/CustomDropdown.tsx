import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
  searchable?: boolean;
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
  searchable = false,
  maxHeight = 200,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [groupedOptions, setGroupedOptions] = useState<{[key: string]: DropdownOption[]}>({});
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const selectedOption = options.find(option => option.value === selectedValue);

  useEffect(() => {
    if (searchable) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchText, options, searchable]);

  useEffect(() => {
    // Group options by category
    const grouped = filteredOptions.reduce((acc, option) => {
      const group = option.group || 'Other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(option);
      return acc;
    }, {} as {[key: string]: DropdownOption[]});
    setGroupedOptions(grouped);
  }, [filteredOptions]);

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotateAnim]);


  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
    setSearchText('');
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const renderOption = (item: DropdownOption) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        item.disabled && styles.disabledOption,
        selectedValue === item.value && styles.selectedOption,
      ]}
      onPress={() => !item.disabled && handleSelect(item.value)}
      disabled={item.disabled}
    >
      <View style={styles.optionContent}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text
          style={[
            styles.optionText,
            item.disabled && styles.disabledOptionText,
            selectedValue === item.value && styles.selectedOptionText,
          ]}
        >
          {item.label}
        </Text>
      </View>
      {selectedValue === item.value && (
        <Ionicons name="checkmark" size={20} color="#C539A5" />
      )}
    </TouchableOpacity>
  );

  const renderGroup = (groupName: string, groupOptions: DropdownOption[]) => (
    <View key={groupName} style={styles.groupContainer}>
      {groupOptions.map((option, index) => (
        <View key={option.value}>
          {renderOption(option)}
          {index < groupOptions.length - 1 && <View style={styles.optionSeparator} />}
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[
          styles.dropdown,
          error && styles.errorDropdown,
          disabled && styles.disabledDropdown,
        ]}
        onPress={toggleDropdown}
        disabled={disabled}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedOption && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={disabled ? '#999' : '#666'}
          />
        </Animated.View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.dropdownList}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>{label}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsOpen(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={[styles.optionsList, { maxHeight }]}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {Object.entries(groupedOptions).map(([groupName, groupOptions]) =>
                  renderGroup(groupName, groupOptions)
                )}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ff4444',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  errorDropdown: {
    borderColor: '#ff4444',
  },
  disabledDropdown: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  disabledText: {
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.6,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  dropdownList: {
    flex: 1,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#f8f0ff',
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#C539A5',
    fontWeight: '600',
  },
  disabledOptionText: {
    color: '#999',
  },
  groupContainer: {
    marginBottom: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
    width: 12,
  },
  optionSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 20,
  },
});

export default CustomDropdown;
