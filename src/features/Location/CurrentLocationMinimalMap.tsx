import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, Text } from 'react-native';

const CurrentLocationMinimalMap: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Simple Header */}

      {/* Map using your exact code */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 31.582,
          longitude: 74.329,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <Marker
          coordinate={{ latitude: 31.582, longitude: 74.329 }}
          title="Lahore, Pakistan"
          description="Test location"
          pinColor="#C539A5"
        />
      </MapView>

      {/* Simple Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>📍 Test Location: Lahore, Pakistan</Text>
        <Text style={styles.infoText}>Lat: 31.582, Lng: 74.329</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#C539A5',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  map: { 
    flex: 1,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
});

export default CurrentLocationMinimalMap;
