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

const { width } = Dimensions.get('window');

export interface CampaignTab {
  id: string;
  label: string;
  status?: string;
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
    isRTL ? styles.scrollContentRTL : styles.scrollContentLTR,
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentStyles}
        style={styles.scrollView}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabText, isActive && styles.activeTabText]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>

              {/* {typeof tab.count === 'number' && (
                <View
                  style={[styles.countBadge, isActive && styles.activeCountBadge]}
                >
                  <Text
                    style={[styles.countText, isActive && styles.activeCountText]}
                  >
                    {tab.count}
                  </Text>
                </View>
              )} */}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 0,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingLeft: 12,
    paddingRight: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  scrollContentLTR: {
    flexDirection: 'row',
  },
  scrollContentRTL: {
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 6,
  },
  activeTab: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F5F5F5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#1F2937',
    fontWeight: '500',
  },
  countBadge: {
    marginLeft: 8,
    backgroundColor: 'transparent',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  activeCountBadge: {
    backgroundColor: '#EEF2FF',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6F7380',
  },
  activeCountText: {
    color: '#111827',
  },
});

export default CampaignTabs;
