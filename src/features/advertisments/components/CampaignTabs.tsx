import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AdvertisementStatus } from '../domain/entities';

const { width } = Dimensions.get('window');

export interface CampaignTab {
  id: string;
  label: string;
  status?: AdvertisementStatus;
  count?: number;
}

interface CampaignTabsProps {
  tabs: CampaignTab[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

const CampaignTabs: React.FC<CampaignTabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  const { i18n } = useTranslation();
  const language = i18n.language || 'en';
  const isEnglish = language.startsWith('en');
  const isRTL = I18nManager.isRTL;

  const contentStyles = [
    styles.scrollContent,
    isRTL
      ? styles.scrollContentRTL
      : isEnglish
        ? styles.scrollContentEnglish
        : styles.scrollContentDefault,
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentStyles}
        style={styles.scrollView}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
              index === 0 && styles.firstTab,
              index === tabs.length - 1 && styles.lastTab,
            ]}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
            {tab.count !== undefined && (
              <View style={[
                styles.countBadge,
                activeTab === tab.id && styles.activeCountBadge,
              ]}>
                <Text style={[
                  styles.countText,
                  activeTab === tab.id && styles.activeCountText,
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  scrollContentDefault: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  scrollContentEnglish: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },
  scrollContentRTL: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    minWidth: 80,
    justifyContent: 'center',
    marginEnd: 12,
  },
  firstTab: {
    marginStart: 0,
  },
  lastTab: {
    marginEnd: 20, // Extra margin for the last tab
  },
  activeTab: {
    backgroundColor: '#C539A5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  countBadge: {
    marginLeft: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeCountText: {
    color: '#FFFFFF',
  },
});

export default CampaignTabs;
