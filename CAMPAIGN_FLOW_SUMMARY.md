# Campaign Flow Summary

## Complete User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HOME SCREEN                                    │
│  (HomeScreen.tsx)                                                        │
│  - User clicks "Add" button (Bottom Tab)                                │
│  - Navigates to: ChooseOptionScreen                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CHOOSE OPTION SCREEN                                  │
│  (ChooseOptionScreen.tsx)                                                │
│  - Two options: Individual | Business                                   │
│                                                                          │
│  ┌──────────────┐              ┌──────────────┐                        │
│  │  Individual  │              │   Business   │                        │
│  └──────────────┘              └──────────────┘                        │
│         │                              │                                │
│         │                              │                                │
│         ▼                              ▼                                │
│  AdvertismentCreateScreen    CreateCompanyScreen                        │
│  (flow: 'individual')        (flow: 'business')                          │
└─────────────────────────────────────────────────────────────────────────┘
         │                              │
         │                              │
         │                              ▼
         │                    ┌─────────────────────────┐
         │                    │  CREATE COMPANY SCREEN  │
         │                    │  (CreateCompanyScreen)  │
         │                    │  - Company Name         │
         │                    │  - Business Category    │
         │                    │  - Email, Address, NTN  │
         │                    │  - Company Logo Upload  │
         │                    │  - Phone Number         │
         │                    │                        │
         │                    │  After Submit:          │
         │                    │  Navigates to:          │
         │                    │  AdvertismentCreateScreen│
         │                    └─────────────────────────┘
         │                              │
         │                              │
         └──────────────┬───────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              CAMPAIGN DETAIL SCREEN                                      │
│  (AdvertismentCreateScreen.tsx)                                         │
│  - Campaign Name                                                        │
│  - Size, Type, Category                                                 │
│  - Location, Area                                                       │
│  - Date Selection (Calendar)                                            │
│  - Description                                                          │
│                                                                          │
│  After Submit:                                                           │
│  - Creates Advertisement (API call)                                     │
│  - Navigates to: CampaignUploadFiles                                   │
└─────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              MEDIA UPLOAD SCREEN                                         │
│  (CampaignUploadFiles.tsx)                                               │
│  - Upload campaign image/video                                           │
│  - After upload completion:                                             │
│                                                                          │
│    ┌────────────────────────────────────────────────────┐              │
│    │  If flow === 'individual':                         │              │
│    │  → Navigate to: CompanywithoutInfoScreen          │              │
│    │                                                    │              │
│    │  If flow === 'business':                           │              │
│    │  → Navigate to: CompanyWithInfoScreen              │              │
│    └────────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  CONFIRMATION (Individual)│  │  CONFIRMATION (Business)  │
│  (CompanywithoutInfoScreen)│  │  (CompanyWithInfoScreen)  │
│                            │  │                          │
│  Shows:                    │  │  Shows:                  │
│  ┌────────────────────┐    │  │  ┌──────────┐  ┌──────────┐
│  │                    │    │  │  │ Company  │  │ Campaign │
│  │  Campaign Image    │    │  │  │  Image   │  │  Image   │
│  │  Box (Single)      │    │  │  │   Box    │  │   Box    │
│  │                    │    │  │  └──────────┘  └──────────┘
│  └────────────────────┘    │  │                          │
│                            │  │  + Link Icon between    │
│  Campaign Details:         │  │    the two boxes         │
│  - Name                    │  │                          │
│  - Days                    │  │  Company Details:        │
│  - Category                │  │  - Name, Business         │
│  - Type                    │  │  - NTN, Address          │
│                            │  │  - Email, Number         │
│                            │  │                          │
│                            │  │  Campaign Details:      │
│                            │  │  - Name, Days            │
│                            │  │  - Category, Type        │
│                            │  │  - Location              │
└────────────────────────────┘  └──────────────────────────┘
         │                              │
         │                              │
         └──────────────┬───────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CAMPAIGN STATUS SCREEN                                │
│  (CompaignStatus.tsx) - "Boards" Tab                                    │
│                                                                          │
│  Shows ALL campaigns with tabs:                                          │
│  - All | Draft | InProgress | Payment | Review | Active | Blocked      │
│                                                                          │
│  Each campaign card can be expanded to show details:                     │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  CAMPAIGN WITH COMPANY DETAIL                                 │     │
│  │  (showCompanyDetail === true)                                  │     │
│  │                                                                │     │
│  │  ┌──────────────┐    ✓    ┌──────────────┐                  │     │
│  │  │   Company    │          │   Campaign   │                  │     │
│  │  │   Image Box  │          │  Image Box   │                  │     │
│  │  └──────────────┘          └──────────────┘                  │     │
│  │                                                                │     │
│  │  Company Detail Section:                                      │     │
│  │  - Name, Business, Location                                   │     │
│  │  - Number, NTN, Address                                      │     │
│  │                                                                │     │
│  │  Campaign Detail Section:                                     │     │
│  │  - Name, Size, Category                                       │     │
│  │  - Type, Location, Area                                       │     │
│  │                                                                │     │
│  │  Payment Detail Section (if not Draft):                      │     │
│  │  - Method, Account, Status                                    │     │
│  │  - Date, Tax, Total                                           │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  CAMPAIGN WITHOUT COMPANY DETAIL                              │     │
│  │  (showCompanyDetail === false)                                │     │
│  │                                                                │     │
│  │         ┌──────────────┐                                     │     │
│  │         │   Campaign   │                                     │     │
│  │         │  Image Box    │                                     │     │
│  │         │   (Single)    │                                     │     │
│  │         └──────────────┘                                     │     │
│  │                                                                │     │
│  │  Campaign Detail Section:                                     │     │
│  │  - Name, Size, Category                                       │     │
│  │  - Type, Location, Area                                       │     │
│  │                                                                │     │
│  │  Payment Detail Section (if not Draft):                      │     │
│  │  - Method, Account, Status                                    │     │
│  │  - Date, Tax, Total                                           │     │
│  └──────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Components & Files

### Navigation Flow Files:
1. **HomeScreen.tsx** → Click "Add" → `ChooseOptionScreen`
2. **ChooseOptionScreen.tsx** → Select option → `AdvertismentCreateScreen` or `CreateCompanyScreen`
3. **CreateCompanyScreen.tsx** → After company creation → `AdvertismentCreateScreen`
4. **AdvertismentCreateScreen.tsx** → After campaign creation → `CampaignUploadFiles`
5. **CampaignUploadFiles.tsx** → After upload → `CompanywithoutInfoScreen` or `CompanyWithInfoScreen`
6. **CompanywithoutInfoScreen.tsx** → Confirmation (Individual flow)
7. **CompanyWithInfoScreen.tsx** → Confirmation (Business flow)
8. **CompaignStatus.tsx** → Shows all campaigns in "Boards" tab

### Key Logic:

#### Flow Types:
- **Individual Flow**: `flow: 'individual'`
  - User → Campaign Detail → Media Upload → Confirmation (Single Image Box)
  
- **Business Flow**: `flow: 'business'`
  - User → Company Creation → Campaign Detail → Media Upload → Confirmation (Two Image Boxes)

#### Campaign Status Screen Logic:
- **With Company Detail**: 
  - `showCompanyDetail === true` when `company_id` exists and `company.company_name` is valid
  - Shows: Company Image Box + Campaign Image Box (connected with link icon)
  - Displays both Company Details and Campaign Details
  
- **Without Company Detail**:
  - `showCompanyDetail === false` when no company data exists
  - Shows: Only Campaign Image Box (single, centered)
  - Displays only Campaign Details

#### StatusCard Component:
- Located in: `src/features/advertisments/components/StatusCard.tsx`
- Props:
  - `showCompanyDetail`: Boolean to control company section visibility
  - `companyDetail`: Company data object (optional)
  - `campaignDetail`: Campaign data object (required)
  - `paymentDetail`: Payment data object (optional)

## Data Flow:

1. **Company Data** stored in: `useCampaignStore` → `companyData`
2. **Advertisement Data** stored in: `useCampaignStore` → `advertisementData`
3. **Campaign Status** fetches from: `useAdvertisements()` hook → API
4. **Company Detection** in StatusCard:
   ```typescript
   const hasCompanyInfo = hasValidCompanyId && hasValidCompanyObject
   // where:
   // - hasValidCompanyId: company_id exists and > 0
   // - hasValidCompanyObject: company object exists with company_name
   ```

## Visual Differences:

### Confirmation Screens:
- **CompanywithoutInfoScreen**: Single centered campaign image box
- **CompanyWithInfoScreen**: Two side-by-side image boxes (Company + Campaign) with link icon

### Campaign Status Cards:
- **With Company**: Two image boxes in connection section + company details grid
- **Without Company**: Single centered campaign image box + only campaign details

