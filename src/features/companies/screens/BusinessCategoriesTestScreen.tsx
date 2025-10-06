// src/features/companies/screens/BusinessCategoriesTestScreen.tsx

import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useBusinessCategoriesWithGroups} from '../hooks';

const BusinessCategoriesTestScreen: React.FC = () => {
  const {data, isLoading, error} = useBusinessCategoriesWithGroups();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#C539A5" />
        <Text style={styles.loadingText}>Loading business categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  const groups = data?.data || [];

  const renderGroup = ({item}: {item: any}) => (
    <View style={styles.groupCard}>
      <Text style={styles.groupTitle}>{item.name}</Text>
      <Text style={styles.groupDescription}>{item.description}</Text>
      <Text style={styles.categoriesCount}>
        {item.categories?.length || 0} categories
      </Text>
      {item.categories?.slice(0, 3).map((category: any) => (
        <Text key={category.id} style={styles.categoryItem}>
          • {category.name}
        </Text>
      ))}
      {item.categories?.length > 3 && (
        <Text style={styles.moreText}>
          +{item.categories.length - 3} more...
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Business Categories Test</Text>
      <Text style={styles.subtitle}>
        Found {groups.length} business category groups
      </Text>
      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  groupCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C539A5',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoriesCount: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  categoryItem: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    marginBottom: 2,
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginLeft: 8,
  },
});

export default BusinessCategoriesTestScreen;
