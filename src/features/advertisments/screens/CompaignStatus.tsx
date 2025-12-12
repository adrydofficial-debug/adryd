import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomTab from '../../../app/navigation/BottomTab';
import { useAdvertisements } from '../hooks/useAdvertisements';
import CampaignTabs, { CampaignTab } from '../components/CampaignTabs';
import CampaignEmptyState from '../components/CampaignEmptyState';
import StatusCard from '../components/StatusCard';
import { SUPABASE_URL } from '../../../config';
import { AdvertisementStatus } from '../domain/entities';
import BackButton from '../../../components/BackButton';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface AdDetails {
  logo?: string;
  title: string;
  location: string;
  date?: string;
  status?: string;
  statusColor?: string;
  statusDot?: string;
  reviewTime?: string;
  reviewStatus?: string;
  name?: string;
  days?: string;
  category?: string;
}

interface PaymentInfo {
  date: string;
  tax: string;
  total: string;
}

interface ButtonType {
  title: string;
  type: 'cancel' | 'payment' | 'details' | 'track';
}

interface PaymentCard {
  id: number;
  type: string;
  title: string;
  backgroundColor: string;
  textColor: string;
  image: any;
  ad: AdDetails;
  payment: PaymentInfo;
  buttons?: ButtonType[];
}

interface CampaignCard {
  id: number;
  title: string;
  location: string;
  locationDetail?: string;
  date: string;
  status:
    | 'Publish'
    | 'Active'
    | 'Schedule'
    | 'Review'
    | 'Blocked'
    | 'Completed'
    | 'Payment Pending'
    | 'Draft'
    | 'InProgress';
  statusColor: string;
  daysLeft?: string;
  estimatedTime?: string;
  isExpanded: boolean;
  details?: AdDetails;
  payment: PaymentInfo;
  rawStatus: string;
  boardMediaUrl?: string;
}

interface ActiveCampaignProps {
  navigation?: any;
  onBackToHome?: () => void;
}

const CompaignStatus: React.FC<ActiveCampaignProps> = ({ onBackToHome }) => {
  const navigation = useNavigation<any>();
  const [expandedCard, setExpandedCard] = useState<number | null>(1);
  const [activeBottomTab, setActiveBottomTab] = useState<string>('Boards');
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const {
    advertisements: advertisementList,
    loading,
    error,
    refetch,
  } = useAdvertisements({ limit: 1000, page: 1, status: undefined }); // Fetch ALL data - no status filter
  
  // Debug: Log what we received
  React.useEffect(() => {
    console.log('📋 SCREEN - Advertisement list updated:', {
      count: advertisementList.length,
      ids: advertisementList.map((ad: any) => ad.id),
      statuses: advertisementList.map((ad: any) => ad.status),
      firstItem: advertisementList[0]?.id,
      lastItem: advertisementList[advertisementList.length - 1]?.id,
    });
  }, [advertisementList]);

  // Always reset to "All" tab whenever the backend data changes
  React.useEffect(() => {
    setActiveTab('all');
  }, [advertisementList]);
  
  
  const handleBottomTabPress = (tabName: string) => {
    console.log('Bottom tab pressed:', tabName);
    setActiveBottomTab(tabName);
  };

  // Handle campaign tab press
  const handleCampaignTabPress = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleCreateCampaign = () => {
    navigation.navigate('ChooseOptionScreen' as never);
  };

  // Create tabs configuration
  const tabs: CampaignTab[] = useMemo(() => {
    const statusCounts = advertisementList?.reduce((acc, ad) => {
      const statusKey = (ad.status || 'UNKNOWN').toUpperCase();
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const getStatusCount = (...statuses: string[]) =>
      statuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);

    return [
      {
        id: AdvertisementStatus.PUBLISHED,
        label: 'Active',
        status: AdvertisementStatus.PUBLISHED,
        count: getStatusCount(AdvertisementStatus.PUBLISHED),
      },
      {
        id: 'IN_PROGRESS',
        label: 'In Progress',
        status: 'IN_PROGRESS',
        count: getStatusCount('IN_PROGRESS', 'IN_REVIEW', 'UNDER_REVIEW'),
      },
      {
        id: AdvertisementStatus.PAYMENT_PENDING,
        label: 'Payment',
        status: AdvertisementStatus.PAYMENT_PENDING,
        count: getStatusCount(AdvertisementStatus.PAYMENT_PENDING),
      },
      {
        id: AdvertisementStatus.SCHEDULED,
        label: 'Scheduled',
        status: AdvertisementStatus.SCHEDULED,
        count: getStatusCount(AdvertisementStatus.SCHEDULED),
      },
      {
        id: AdvertisementStatus.DRAFT,
        label: 'Draft',
        status: AdvertisementStatus.DRAFT,
        count: getStatusCount(AdvertisementStatus.DRAFT),
      },
      {
        id: 'BLOCKED',
        label: 'Blocked',
        status: 'BLOCKED',
        count: getStatusCount('BLOCKED'),
      },
      {
        id: AdvertisementStatus.COMPLETED,
        label: 'Complete',
        status: AdvertisementStatus.COMPLETED,
        count: getStatusCount(AdvertisementStatus.COMPLETED),
      },
    ];
  }, [advertisementList]);
  
  // Map API status to UI status based on the correct flow
  const mapStatusToUI = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { uiStatus: 'Draft', color: '#9E9E9E', tab: 'Draft' };
      case 'IN_PROGRESS':
        return { uiStatus: 'InProgress', color: '#ECBDF3', tab: 'In Progress' };
      case 'PAYMENT_PENDING':
        return { uiStatus: 'Payment Pending', color: '#FDD46C', tab: 'Payment' };
      case 'IN_REVIEW':
      case 'UNDER_REVIEW':
        return { uiStatus: 'InProgress', color: '#ECBDF3', tab: 'In Progress' };
      case 'SCHEDULED':
        return { uiStatus: 'Schedule', color: '#83B1FA', tab: 'Schedule' };
      case 'PUBLISHED':
        return { uiStatus: 'Active', color: '#36BD79', tab: 'Active' };
      case 'COMPLETED':
        return { uiStatus: 'Completed', color: '#9E9E9E', tab: 'Completed' };
      case 'BLOCKED':
        return { uiStatus: 'Blocked', color: '#F25255', tab: 'Blocked' };
      default:
        return { uiStatus: 'Draft', color: '#9E9E9E', tab: 'Draft' };
    }
  };
  
  // Get status description based on API status
  const getStatusDescription = (status: string) => {
    const statusDescriptions: { [key: string]: string } = {
      'DRAFT': 'Unsubmitted advertisement, still being edited.',
      'IN_PROGRESS': 'Campaign is in progress.',
      'PAYMENT_PENDING': 'Awaiting payment before review.',
      'IN_REVIEW': 'Being reviewed by the moderation team.',
      'UNDER_REVIEW': 'Being reviewed by the moderation team.',
      'SCHEDULED': 'Set to go live at a future date.',
      'PUBLISHED': 'Currently live and displaying content.',
      'COMPLETED': 'Ad campaign finished successfully.',
      'BLOCKED': 'Campaign has been blocked or rejected.',
    };
    return statusDescriptions[status] || 'Status update pending';
  };
  
  
  // Convert API advertisements to UI format - NO FILTERING, SHOW ALL
  const campaignData: CampaignCard[] = useMemo(() => {
    // Always show data, even if empty array
    console.log('🔄 MAPPING ADVERTISEMENTS:', {
      inputCount: advertisementList?.length || 0,
      inputIds: advertisementList?.map((ad: any) => ad.id) || [],
    });
    
    // NO EARLY RETURNS - Process all data
    if (!advertisementList || advertisementList.length === 0) {
      console.log('⚠️ No advertisements to map - returning empty array');
      return [];
    }
    
    console.log(`✅ Mapping ${advertisementList.length} advertisements to UI format`);
    
    return advertisementList.map((ad: any) => {
      const rawStatus = (ad.status || 'DRAFT').toUpperCase();
      const statusInfo = mapStatusToUI(rawStatus);
      const booking = ad.bookings?.[0];
      const startDateObj = booking ? new Date(booking.start_at) : new Date(ad.created_at);
      const endDateObj = booking?.end_at ? new Date(booking.end_at) : null;

      const daysDuration = booking && endDateObj
        ? Math.max(
            1,
            Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24))
          )
        : null;

      const board = ad.board || {};
      const boardTitle = (board.title || ad.title || 'Campaign Board').toString();

      const boardLocationName = (() => {
        const candidates = [
          board.title,
          board.slug ? board.slug.replace(/-/g, ' ') : undefined,
          ad.title,
        ];
        const found = candidates.find(value => {
          if (typeof value !== 'string') return false;
          return value.trim().length > 0;
        });
        return (found || 'N/A').toString();
      })();

      const boardArea = (() => {
        const candidates = [
          board.description,
          boardLocationName,
        ];
        const found = candidates.find(value => {
          if (typeof value !== 'string') return false;
          return value.trim().length > 0;
        });
        return (found || 'N/A').toString();
      })();
    const boardCity = (() => {
      const candidates = [
        board?.location?.city?.name,
        board?.location?.name,
        boardLocationName,
      ];
      const found = candidates.find(value => {
        if (typeof value !== 'string') return false;
        return value.trim().length > 0;
      });
      return (found || 'N/A').toString();
    })();

      const normalizeMediaUrl = (url?: string | null) => {
        if (!url) return undefined;
        if (/^https?:\/\//i.test(url)) {
          return url;
        }
        const base = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/`;
        return `${base}${url.replace(/^\/?/, '')}`;
      };

      const boardMediaUrl =
        normalizeMediaUrl(ad.media?.[0]?.url) ||
        normalizeMediaUrl(board?.media?.[0]?.url) ||
        undefined;

      const totalPayment = typeof ad.total_payment === 'number'
        ? ad.total_payment
        : Number(ad.total_payment || 0);

      return {
        id: ad.id,
        title: ad.title || boardTitle,
        rawStatus,
        location: boardLocationName,
        locationDetail: boardArea,
        date: startDateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: statusInfo.uiStatus as any,
        statusColor: statusInfo.color,
        daysLeft: endDateObj
          ? `${Math.max(1, Math.ceil((endDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Days Left`
          : 'Ongoing',
        isExpanded: false,
        details: {
          name: boardTitle,
          days: daysDuration ? `${daysDuration} days Ad` : 'Ongoing',
          category: board?.category?.name || 'Advertisement',
          location: boardLocationName,
          reviewTime: getStatusDescription(rawStatus),
          reviewStatus: statusInfo.uiStatus,
        } as any,
        payment: {
          date: startDateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          tax: `PKR ${Math.round(totalPayment * 0.1).toLocaleString()}`,
          total: `PKR ${totalPayment.toLocaleString()}`,
        },
        boardMediaUrl,
      };
    });
  }, [advertisementList]);
  
  // Debug: Log mapped data
  React.useEffect(() => {
    console.log('🎯 CAMPAIGN DATA MAPPED:', {
      mappedCount: campaignData.length,
      mappedIds: campaignData.map((item) => item.id),
      rawStatuses: campaignData.map((item) => item.rawStatus),
    });
  }, [campaignData]);
  
  
  // Filter data based on active tab
  const listData = useMemo(() => {
    const data = campaignData || [];
    
    console.log('📊 LIST DATA - BEFORE FILTERING:', {
      totalItems: data.length,
      activeTab,
      allItemIds: data.map((item) => item.id),
      allRawStatuses: data.map((item) => item.rawStatus),
    });
    
    // If 'all' tab is selected, show all data
    if (activeTab === 'all') {
      console.log('📊 LIST DATA - Showing ALL items:', {
        count: data.length,
        itemIds: data.map((item) => item.id),
      });
      return data;
    }
    
    // Filter by status based on active tab
    const filtered = data.filter((item) => {
      if (activeTab === AdvertisementStatus.DRAFT) {
        return (
          item.rawStatus === AdvertisementStatus.DRAFT ||
          item.rawStatus === 'IN_PROGRESS'
        );
      }
      if (activeTab === 'IN_PROGRESS') {
        return (
          item.rawStatus === 'IN_PROGRESS' ||
          item.rawStatus === 'IN_REVIEW' ||
          item.rawStatus === 'UNDER_REVIEW'
        );
      }
      if (activeTab === 'BLOCKED') {
        return item.rawStatus === 'BLOCKED';
      }
      // For other tabs, match the rawStatus with the tab's status
      return item.rawStatus === activeTab;
    });
    
    console.log('📊 LIST DATA (filtered):', {
      activeTab,
      showingCount: filtered.length,
      itemIds: filtered.map((item) => item.id),
      rawStatuses: filtered.map((item) => item.rawStatus),
      allStatusesInData: [...new Set(data.map((item) => item.rawStatus))],
    });
    
    return filtered;
  }, [campaignData, activeTab]);

  const renderStatusCard = ({ item, index }: { item: CampaignCard; index: number }) => {
    console.log(`🎨 RENDERING ITEM ${index + 1}:`, {
      id: item.id,
      title: item.title,
      status: item.rawStatus,
    });
    const originalAd = advertisementList.find((ad: any) => ad.id === item.id) || item;
    const booking = originalAd?.bookings?.[0];

    const board = originalAd?.board || {};
    const boardLocationName = (() => {
      const candidates = [
        board.title,
        board.slug ? board.slug.replace(/-/g, ' ') : undefined,
        item.title,
      ];
      const found = candidates.find(value => {
        if (typeof value !== 'string') return false;
        return value.trim().length > 0;
      });
      return (found || 'N/A').toString();
    })();

    const boardArea = (() => {
      const candidates = [board.description, boardLocationName];
      const found = candidates.find(value => {
        if (typeof value !== 'string') return false;
        return value.trim().length > 0;
      });
      return (found || 'N/A').toString();
    })();
    const boardCity = (() => {
      const candidates = [
        board?.location?.city?.name,
        board?.location?.name,
        boardLocationName,
      ];
      const found = candidates.find(value => {
        if (typeof value !== 'string') return false;
        return value.trim().length > 0;
      });
      return (found || 'N/A').toString();
    })();

    // Derive ad type tags from backend data instead of static placeholders
    const normalizeLabel = (value?: string | null) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      return trimmed
        .split(/[\s-_]+/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    };
    const rawCategory = normalizeLabel(originalAd?.board?.category?.name);
    const rawGroup = normalizeLabel(originalAd?.board?.category?.group?.name);
    const slugLabel = normalizeLabel(originalAd?.board?.slug?.replace(/-/g, ' '));
    const explicitType = normalizeLabel(
      typeof originalAd?.board?.type === 'string'
        ? originalAd.board.type
        : typeof originalAd?.ad_type === 'string'
        ? originalAd.ad_type
        : undefined,
    );
    const typeFromGroup = (() => {
      if (!rawGroup) return undefined;
      const [first] = rawGroup.split(' ');
      if (!first) return undefined;
      const lower = first.toLowerCase();
      return lower === 'digital' || lower === 'static'
        ? first.charAt(0).toUpperCase() + first.slice(1)
        : undefined;
    })();
    let typeFromCategory: string | undefined;
    let categoryFromCategory: string | undefined = rawCategory;
    if (rawCategory) {
      const [first, ...rest] = rawCategory.split(' ');
      if (first && (first.toLowerCase() === 'digital' || first.toLowerCase() === 'static')) {
        typeFromCategory = first;
        if (rest.length) {
          categoryFromCategory = rest.join(' ');
        }
      }
    }
    const typeFromSlug = (() => {
      if (!slugLabel) return undefined;
      const [first] = slugLabel.split(' ');
      if (!first) return undefined;
      const lower = first.toLowerCase();
      return lower === 'digital' || lower === 'static'
        ? first.charAt(0).toUpperCase() + first.slice(1)
        : undefined;
    })();
    const typeLabel =
      explicitType ||
      typeFromCategory ||
      typeFromGroup ||
      typeFromSlug ||
      'Static';
    const categoryLabel = categoryFromCategory || rawGroup || rawCategory || slugLabel;
    const adTypeTags = Array.from(
      new Set(
        [typeLabel, categoryLabel].filter(Boolean) as string[],
      ),
    );

    let startDate = '01.12. Dec';
    let endDate = '22.12. Dec';
    let purchaseDuration = '15 days';
    let daysDiff: number | null = null;

    if (booking) {
      const start = new Date(booking.start_at);
      const end = new Date(booking.end_at);
      daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.getMonth() + 1;
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        return `${day}.${month.toString().padStart(2, '0')}. ${monthName}`;
      };

      startDate = formatDate(start);
      endDate = formatDate(end);
      purchaseDuration = `${daysDiff} days`;
    } else if (item.details?.days) {
      purchaseDuration = item.details.days.replace('days Ad', 'days').replace(' Ad', ' days') || '15 days';
    }

    const estimatedTimeLabel =
      (daysDiff ? `${daysDiff} days` : undefined) ||
      (item.daysLeft ? item.daysLeft : undefined) ||
      (item.details?.days
        ? item.details.days.replace('days Ad', 'days').replace(' Ad', ' days')
        : undefined) ||
      purchaseDuration;

    const statusMessage = (() => {
      switch (item.status) {
        case 'InProgress':
          return estimatedTimeLabel ? `Estimated Time ${estimatedTimeLabel}` : getStatusDescription(item.rawStatus);
        case 'Schedule':
          return 'Your campaign is all set to go live as scheduled';
        case 'Blocked':
          return 'Your campaign has been blocked due to a violation of our content policy';
        case 'Payment Pending':
          return 'Finish your payment to confirm your campaign';
        case 'Draft':
          return "Continue from here whenever you're ready";
        case 'Completed':
          return 'Campaign completed';
        case 'Publish':
        case 'Active':
          return 'Your campaign is live';
        default:
          return getStatusDescription(item.rawStatus);
      }
    })();

    const timelineProgress = item.status === 'Publish'
      ? 75
      : item.status === 'Review'
        ? 50
        : item.status === 'Draft'
          ? 10
          : 25;
    const company = originalAd?.company;
    const companyId = originalAd?.company_id;
    const hasValidCompanyId = Boolean(
      companyId !== null &&
      companyId !== undefined &&
      companyId !== 0 &&
      typeof companyId === 'number' &&
      companyId > 0
    );
    // Second, check if company object exists and is not empty
    const hasValidCompanyObject = Boolean(
      company !== null &&
      company !== undefined &&
      typeof company === 'object' &&
      !Array.isArray(company) &&
      // Check if it's not an empty object {}
      Object.keys(company).length > 0 &&
      // Check company has a valid id
      company.id !== null &&
      company.id !== undefined &&
      company.id !== 0 &&
      typeof company.id === 'number' &&
      company.id > 0 &&
      // CRITICAL: company must have company_name (required field)
      company.company_name !== null &&
      company.company_name !== undefined &&
      company.company_name !== '' &&
      typeof company.company_name === 'string' &&
      company.company_name.trim().length > 0
    );
    
    // Both conditions must be true
    // For individual flow campaigns (company_id = 0), hasCompanyInfo will always be false
    const hasCompanyInfo = hasValidCompanyId && hasValidCompanyObject;

    // Debug logging - ALWAYS log to help debug
    console.log(`🔍 [CompaignStatus] Advertisement ${item.id} company check:`, {
      advertisementId: item.id,
      company_id: companyId,
      company_id_type: typeof companyId,
      company_id_value: companyId,
      isIndividualFlow: companyId === 0 || companyId === null,
      hasValidCompanyId,
      hasCompanyObject: !!company,
      companyObject: company,
      companyObjectKeys: company ? Object.keys(company) : [],
      companyObjectLength: company ? Object.keys(company).length : 0,
      companyId: company?.id,
      companyName: company?.company_name,
      companyNameLength: company?.company_name?.length || 0,
      isCompanyEmpty: company && Object.keys(company).length === 0,
      hasValidCompanyObject,
      hasCompanyInfo,
      shouldShowCompany: hasCompanyInfo,
      FINAL_DECISION: hasCompanyInfo ? 'SHOW COMPANY (Business Flow)' : 'HIDE COMPANY - Individual Flow or No Company Data',
    });

    const primaryMediaUrl = item.boardMediaUrl;

    return (
      <StatusCard
        id={item.id}
        title={item.title || 'Adryd Pole Sign Board ad'}
        status={item.status || 'Draft'}
        statusColor={item.statusColor}
        adType={adTypeTags.length ? adTypeTags : ['Static', 'Billboard']}
        purchaseDuration={purchaseDuration}
        startDate={startDate}
        endDate={endDate}
        location={boardCity}
        locationDetail={boardArea}
        // startDate={startDate}
        // endDate={endDate}
        timelineProgress={timelineProgress}
        isExpanded={expandedCard === item.id}
        onPress={() => toggleCardExpansion(item.id)}
        navigation={navigation}
        estimatedTimeLabel={estimatedTimeLabel}
        statusMessage={statusMessage}
        showCompanyDetail={hasCompanyInfo}
        companyDetail={hasCompanyInfo && originalAd?.company && originalAd.company.company_name ? {
          name: originalAd.company.company_name,
          business: originalAd.company.category?.name || undefined,
          location: originalAd.company.address || undefined,
          number: originalAd.company.contact_number || undefined,
          ntn: originalAd.company.company_ntn || undefined,
          address: originalAd.company.address || undefined,
          email: originalAd.company.email || undefined,
          logoUri: originalAd.company.logo_url || undefined,
        } : undefined}
        campaignDetail={{
          name: item.title || boardLocationName,
          size: (() => {
            const width = originalAd?.board?.width;
            const height = originalAd?.board?.height;
            if (width && height) {
              return `${width}ft by ${height}ft`;
            }
            return 'N/A';
          })(),
          category: originalAd?.board?.category?.name || 'Advertisement',
          type: originalAd?.board?.category?.group?.name || 'Billboard',
          location: boardLocationName,
          area: boardArea,
          boardImageUri: primaryMediaUrl,
        }}
        paymentDetail={{
          method: 'JazzCash',
          accountNumber: '*******31',
          status: 'Paid',
          amount: originalAd?.total_payment ? `PKR ${originalAd.total_payment.toLocaleString()}` : 'PKR 20000',
          date: startDate ? new Date(originalAd?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sep 22.2025',
          tax: originalAd?.total_payment ? `PKR ${Math.round(originalAd.total_payment * 0.1).toLocaleString()}` : 'PKR 20000',
          total: originalAd?.total_payment ? `PKR ${(originalAd.total_payment * 1.1).toLocaleString()}` : 'PKR 30,000',
        }}
      />
    );
  };

  const toggleCardExpansion = (cardId: number) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const renderPaymentCard = (item: PaymentCard) => {
    console.log('Rendering payment card:', item.title);
    return (
      <View key={item.id} style={[styles.paymentCard, { backgroundColor: item.backgroundColor }]}>
        {/* Header */}
        <View style={[styles.paymentCardHeader, { backgroundColor: item.backgroundColor }]}>
          <Text style={[styles.paymentHeaderTitle, { color: item.textColor }]}>{item.title}</Text>
        </View>
        
        {/* Content */}
        <View style={styles.paymentAdSection}>
          <View style={styles.paymentAdHeader}>
            <View style={styles.paymentLogoContainer}>
              <View style={styles.paymentLogo}>
                <Text style={styles.paymentLogoText}>T</Text>
              </View>
              <Text style={styles.paymentLogoLabel}>TAXX OIL</Text>
            </View>
            <View style={[styles.paymentStatusDot, { backgroundColor: item.ad.statusDot }]} />
          </View>
          
          <Text style={styles.paymentAdTitle}>{item.ad.title}</Text>
          
          <View style={styles.paymentLocationRow}>
            <Ionicons name="location" size={wp(3.5)} color="#666" />
            <Text style={styles.paymentLocationText}>{item.ad.location}</Text>
          </View>
          
          <Text style={styles.paymentDateText}>{item.ad.date}</Text>
          <Text style={[styles.paymentStatusText, { color: item.ad.statusColor }]}>{item.ad.status}</Text>
        </View>
        
        {/* Separator */}
        <View style={styles.paymentSeparator} />
        
        {/* Payment Summary */}
        <View style={styles.paymentSummary}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Date</Text>
            <Text style={styles.paymentValue}>{item.payment.date}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>TAX</Text>
            <Text style={styles.paymentValue}>{item.payment.tax}</Text>
          </View>
        </View>
        
        {/* Total Bar */}
        <View style={[styles.paymentTotalRow, {}]}>
          <Text style={styles.paymentTotalLabel}>TOTAL</Text>
          <Text style={styles.paymentTotalValue}>{item.payment.total}</Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity style={styles.paymentCancelButton}>
            <Text style={styles.paymentCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.paymentActionButton, { backgroundColor: item.ad.statusColor }]}>
            <Text style={styles.paymentActionButtonText}>Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCampaignCard = (item: CampaignCard) => {
    const isExpanded = expandedCard === item.id;
    const isActive = item.rawStatus === AdvertisementStatus.PUBLISHED;
    const isReview = item.rawStatus === AdvertisementStatus.UNDER_REVIEW || item.rawStatus === 'IN_REVIEW';
    const isBlocked = item.rawStatus === 'BLOCKED';
    const isRecentHistory = item.rawStatus === AdvertisementStatus.COMPLETED;

    return (
        <View key={item.id} style={[
             styles.campaignCard,
             isActive && styles.activeCard,
             isReview && styles.reviewCard,
             isBlocked && styles.blockedCard,
             isRecentHistory && styles.recentHistoryCard,
           ]}>
             <View style={styles.cardHeader}>
               <View style={styles.cardContent}>
                 <Text style={styles.campaignTitle}>{item.title}</Text>
                 <View style={styles.locationRow}>
                   <Ionicons 
                     name="location" 
                     size={wp(3.5)} 
                     color="#666" 
                     style={styles.locationIcon} 
                   />
                   <Text style={styles.locationText}>
                     {item.location}
                   </Text>
                 </View>
                 <Text style={styles.dateText}>
                   {item.date}
                 </Text>
               </View>
               <View style={styles.cardRight}>
                 <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
               </View>
             </View>
             <View style={styles.statusSection}>
               <View style={[styles.statusLine, { backgroundColor: item.statusColor }]} />
               <Text style={[styles.statusText, { color: item.statusColor }]}>
                 {item.daysLeft || item.estimatedTime}
               </Text>
               <TouchableOpacity 
                 onPress={() => toggleCardExpansion(item.id)}
                 style={styles.chevronButton}>
                 <Ionicons 
                   name={isExpanded ? "chevron-down" : "chevron-up"} 
                   size={wp(4.9)} 
                   color={item.statusColor} 
                 />
               </TouchableOpacity>
             </View>
             
             {/* Timeline Section - Only show for Active cards */}
             {isActive && (
               <View style={styles.timelineSection}>
                 <Text style={styles.timelineLabel}>Timeline</Text>
                 <View style={styles.timelineContainer}>
                   <View style={[styles.timelineDot, { backgroundColor: item.statusColor }]} />
                   <View style={[styles.timelineLine, { backgroundColor: item.statusColor }]} />
                   <View style={[styles.timelineDot, { backgroundColor: '#D8D8D8' }]} />
                   <View style={[styles.timelineLine, { backgroundColor: '#D8D8D8' }]} />
                   <View style={[styles.timelineDot, { backgroundColor: '#D8D8D8' }]} />
                   <View style={[styles.timelineLine, { backgroundColor: '#E0E0E0' }]} />
                   <View style={[styles.timelineDot, { backgroundColor: '#E0E0E0' }]} />
                   <View style={[styles.timelineLine, { backgroundColor: '#E0E0E0' }]} />
                   <View style={[styles.timelineDot, { backgroundColor: '#E0E0E0' }]} />
                 </View>
               </View>
             )}
             {isExpanded && item.details && (
               <View style={styles.expandedContent}>
                 <View style={styles.dashedLine} />
                 <Text style={styles.reviewTitle}>
                   YOUR <Text style={[styles.reviewHighlight, { color: item.statusColor }]}>{item.rawStatus}</Text> CAMPAIGN AD DETAIL
                 </Text>
                 <View style={styles.detailsBox}>
                   <View style={styles.detailItem}>
                     <Ionicons name="document-text" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>Name: {item.details?.name}</Text>
                   </View>
                   <View style={styles.detailItem}>
                     <Ionicons name="checkmark-circle" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>How many days: {item.details?.days}</Text>
                   </View>
                   <View style={styles.detailItem}>
                     <Ionicons name="checkmark-circle" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>Category: {item.details?.category}</Text>
                   </View>
                   <View style={styles.detailItem}>
                     <Ionicons name="location" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>Location: {item.details.location}</Text>
                   </View>
                   <View style={styles.detailItem}>
                     <Ionicons name="time" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>{item.details.reviewTime}</Text>
                   </View>
                   <View style={styles.detailItem}>
                     <Ionicons name="time" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>{item.details.reviewStatus}</Text>
                   </View>
                 </View>
     
                 {/* Payment Summary */}
                 <View style={styles.paymentSummary}>
                   <View style={styles.paymentRow}>
                     <Text style={[styles.paymentLabel, { color: item.statusColor }]}>Date</Text>
                     <Text style={[styles.paymentValue, { color: item.statusColor }]}>{item.payment.date}</Text>
                   </View>
                   <View style={styles.paymentRow}>
                     <Text style={[styles.paymentLabel, { color: item.statusColor }]}>TAX</Text>
                     <Text style={[styles.paymentValue, { color: item.statusColor }]}>{item.payment.tax}</Text>
                   </View>
                 
                 </View>
               </View>
             )}
           </View>
    );
  };

  return (
  <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      {/* Header with Campaign Tabs */}
      <View style={styles.header}>
        <BackButton
          style={styles.headerBackButton}
          onPress={() => {
            if (onBackToHome) {
              onBackToHome();
              return;
            }
            navigation.navigate('BottomTab' as never, { tab: 'Home' } as never);
          }}
        />
        <View style={styles.headerTabsWrapper}>
          <CampaignTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={handleCampaignTabPress}
          />
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C539A5" />
          <Text style={styles.loadingText}>Loading campaigns...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load campaigns. Please try again.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Campaign Data */}
      {!loading && !error && (
        <>
          {/* Debug Info - Remove in production */}

          {listData.length === 0 ? (
            <View style={styles.emptyWrapper}>
              <CampaignEmptyState onCreateCampaign={handleCreateCampaign} />
            </View>
          ) : (
            <FlatList
              style={styles.cardsContainer}
              data={listData}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              contentContainerStyle={styles.cardsContent}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              onLayout={() => {
                console.log('📱 FLATLIST RENDERED:', {
                  dataCount: listData.length,
                  itemIds: listData.map((item) => item.id),
                  allData: listData,
                });
              }}
              renderItem={renderStatusCard}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    // padding:2,
  },
  cardImg:{
    width: width * 0.14, 
    height: width * 0.18,
     resizeMode: 'contain',
     borderRadius:2,
    marginRight:10},
   header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.02,
    paddingTop: hp(6),
    paddingBottom: hp(1),
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    position: 'relative',
    left: 0,
    top: 0,
  },
  headerTabsWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: "#fff",
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    width: wp(10),
  },
  cardsContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  cardsContent: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingBottom: hp(2),
  },
  emptyWrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  campaignCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: wp(4),
    marginBottom: hp(2),
    padding: wp(5),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // borderWidth: 1,
    borderColor: '#E8F5E8',

  },
  activeCard: {
    backgroundColor: '#F0F8F0',
    borderColor: '#4CAF50',
  },
  reviewCard: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
  },
  blockedCard: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  recentHistoryCard: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9E9E9E',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1),
  },
  cardContent: {
    flex: 1,
    marginRight: wp(3),
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: hp(0.7),
    lineHeight: wp(5),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0),
  },
  locationIcon: {
    marginRight: wp(1.5),
  },
  locationText: {
    fontSize: wp(3.8),
    fontWeight: '400',
    color: '#666',
  },
  dateText: {
    fontSize: wp(3.8),
    fontWeight: '400',
    color: '#666',
    marginLeft:wp(5.5),
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  statusDot: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    marginBottom: hp(1),
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: hp(0.3),
    paddingVertical: hp(0.5),
  },
  statusLine: {
    width: wp(0.8),
    height: hp(5.5),
    marginRight: wp(2),
    marginLeft: wp(0.99),
    borderRadius: wp(0.4),
    position: 'absolute',
    bottom: hp(0.5),
  },
  statusText: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#4CAF50',
    flex: 1,
    marginLeft: wp(5.5),
  },
  chevronButton: {
    padding: wp(1),
    marginLeft: wp(2),
  },
  expandedContent: {
    marginTop: hp(1),
    marginBottom: hp(0),
  },
  dashedLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: hp(1),
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reviewTitle: {
    fontSize: wp(3.8),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(1),
  },
  reviewHighlight: {
    color: '#E91E63',
  },
  detailsBox: {
    backgroundColor: '#F8F8F8',
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(1),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  detailText: {
    fontSize: wp(3.5),
    color: '#666',
    marginLeft: wp(2),
    flex: 1,
  },
  paymentSummary: {
    marginTop: hp(1),
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.5),
  },
  paymentLabel: {
    fontSize: wp(3.5),
    color: '#666',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: wp(3.5),
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#C539A5',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    marginTop: hp(0.5),
  },
  totalLabel: {
    fontSize: wp(4),
    color: '#fff',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: wp(4),
    color: '#fff',
    fontWeight: 'bold',
  },
  // Payment Card Styles
  paymentCard: {
    borderRadius: wp(4),
    marginBottom: hp(2),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
    minHeight: hp(20),
  },
  paymentCardHeader: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
  },
  paymentHeaderTitle: {
    fontSize: wp(4),
    fontWeight: '600',
  },
  paymentAdSection: {
    padding: wp(4),
    minHeight: hp(12),
  },
  paymentAdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  paymentLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLogo: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    marginRight: wp(2),
  },
  paymentLogoText: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentLogoLabel: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#4CAF50',
  },
  paymentStatusDot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    position:"absolute",
    top:5,
    right:-5
  },
  paymentAdTitle: {
    fontSize: wp(3.8),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.2),
  },
  paymentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  paymentLocationText: {
    fontSize: wp(3.2),
    color: '#666',
    marginLeft: wp(1.5),
  },
  paymentDateText: {
    fontSize: wp(3.8),
    color: '#666',
    marginBottom: hp(0.2),
  },
  paymentStatusText: {
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  paymentDetailsSection: {
    paddingHorizontal: wp(10),
    paddingBottom: wp(4),
  },
  paymentDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.8),
  },
  paymentDetailsLabel: {
    fontSize: wp(3.8),
    color: '#0f0c0cff',
    fontWeight: '500',
  },
  paymentDetailsValue: {
    fontSize: wp(3.8),
    color: '#676869',
    fontWeight: '300',
  },
  paymentSeparator: {
    height: 1,
    backgroundColor: '#FEB600',
    marginVertical: hp(0.5),
  },
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    marginTop: hp(0.5),
  },
  paymentTotalLabel: {
    fontSize: wp(4),
    color: '#000',
    fontWeight: 'bold',
  },
  paymentTotalValue: {
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  paymentButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    paddingBottom: wp(4),
    justifyContent: 'space-between',
  },
  paymentActionButton: {
    flex: 1,
    paddingVertical: hp(1.2),
    width:'30%',
    borderRadius: wp(2),
    marginHorizontal: wp(1),
    alignItems: 'center',
  },
  paymentActionButtonText: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: '#fff',
  },
  paymentCancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width:'40%',
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
    marginHorizontal: wp(1),
    alignItems: 'center',
  },
  paymentPaymentButton: {
    backgroundColor: '#FFE8E8',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  paymentDetailsButton: {
    backgroundColor: '#F3E5F5',
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  paymentTrackButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  paymentButtonText: {
    fontSize: wp(3.8),
    fontWeight: '600',
  },
  paymentCancelButtonText: {
    color: '#666',
  },
  paymentPaymentButtonText: {
    color: '#FF4444',
  },
  paymentDetailsButtonText: {
    color: '#9C27B0',
  },
  paymentTrackButtonText: {
    color: '#4CAF50',
  },
  timelineSection: {
    marginTop: hp(1),
    paddingTop: hp(1),
  },
  timelineLabel: {
    fontSize: wp(3.5),
    color: '#666',
    marginBottom: hp(0.8),
    marginLeft: wp(5.5),
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp(5.5),
  },
  timelineDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    marginRight: wp(1),
  },
  timelineLine: {
    width: wp(3),
    height: wp(0.3),
    marginRight: wp(1),
    borderRadius: wp(0.15),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  loadingText: {
    fontSize: wp(4),
    color: '#666',
    marginTop: hp(1),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(4),
    paddingHorizontal: wp(4),
  },
  errorText: {
    fontSize: wp(4),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  retryButton: {
    backgroundColor: '#C539A5',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: wp(4),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(8),
    paddingHorizontal: wp(4),
  },
  emptyText: {
    fontSize: wp(5),
    color: '#333',
    fontWeight: '600',
    marginBottom: hp(1),
  },
  emptySubtext: {
    fontSize: wp(3.5),
    color: '#666',
    textAlign: 'center',
  },
  debugInfo: {
    backgroundColor: '#FFE5F3',
    padding: wp(2),
    marginHorizontal: wp(5),
    marginTop: hp(1),
    borderRadius: wp(2),
  },
  debugText: {
    fontSize: wp(3),
    color: '#C539A5',
    fontWeight: '600',
  },
});

export default CompaignStatus;
