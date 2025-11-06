import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text, 
  TouchableOpacity,
  View,
} from 'react-native';
import PinkLocation from '../../../assets/images/PinkkLocation.svg';
import { useCities } from '../hooks/hooks';
import { useCityStore } from '../../../cities/cityStore';

const { width, height } = Dimensions.get('window');

type City = {
  id: number;
  name: string;
};

type Props = {
  label?: string;
  onSelectCity?: (city: City) => void;
};

const LocationButton: React.FC<Props> = ({
  label = 'Select City',
  onSelectCity,
}) => {
  const { selectedCity, setSelectedCity } = useCityStore();

  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(label);

  const { data: cities, isLoading, isError } = useCities();

const handleCitySelect = (city: City) => {
  setSelected(city.name);       // local state for display
  setSelectedCity(city.name);   // store state
  setVisible(false);
  onSelectCity?.(city);         // optional callback
};


  return (
    <>
     <TouchableOpacity
  style={styles.locationBtnCustom}
  onPress={() => setVisible(true)}
>
  <PinkLocation
    width={width * 0.03}
    height={width * 0.03}
    style={{ marginRight: width * 0.011 }}
  />
  <Text style={styles.locationBtnText}>
    {selectedCity || selected}   
  </Text>
</TouchableOpacity>


      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Your City</Text>

            {isLoading && (
              <ActivityIndicator
                size="small"
                color="#e91e63"
                style={{ marginVertical: 20 }}
              />
            )}

            {isError && (
              <Text
                style={{
                  textAlign: 'center',
                  color: 'red',
                  marginVertical: 10,
                }}
              >
                Failed to load cities.
              </Text>
            )}

            {!isLoading && cities && (
              <FlatList
                data={cities}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cityItem}
                    onPress={() => handleCitySelect(item)}
                  >
                    <Text
                      style={[
                        styles.cityText,
                        item.name === selected && styles.selectedCityText,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  locationBtnCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
    marginRight: width * 0.01,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationBtnText: {
    color: '#595959',
    fontWeight: '400',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
  },
  modalTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  cityItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedCityText: {
    color: '#e91e63',
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#777',
    fontSize: 14,
  },
});

export default LocationButton;
