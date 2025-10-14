//src/features/companies/domain/mappers.ts
import {
  CompanyCategoryGroupsResponse,
  CompanyResponse,
} from '../api/types/responses';
import {
  Company,
  CompanyCategory,
  CompanyCategoryGroup,
  UserProfile,
} from './entities';

/* -------------------------------------------------------------------------- */
/* 🏢 Map single company                                                      */
/* -------------------------------------------------------------------------- */
export const mapCompany = (data: CompanyResponse): Company => ({
  id: data.id,
  company_name: data.company_name,
  company_ntn: data.company_ntn ?? null,
  address: data.address ?? null,
  email: data.email ?? null,
  contact_number: data.contact_number ?? null,
  logo_url: data.logo_url ?? null,
  logo_filename: data.logo_filename ?? null,
  logo_size: data.logo_size ?? null,
  logo_type: data.logo_type ?? null,
  is_verified: data.is_verified ?? false,
  created_at: data.created_at,
  updated_at: data.updated_at,
  category: data.company_category_ref
    ? mapCategory(data.company_category_ref)
    : null,
  user: data.user ? mapUserProfile(data.user) : null,
});

/* -------------------------------------------------------------------------- */
/* 🏷️ Map single category                                                    */
/* -------------------------------------------------------------------------- */
export const mapCategory = (data: any): CompanyCategory => ({
  id: data.id,
  name: data.name,
  group: data.group
    ? {
        id: data.group.id,
        name: data.group.name,
        description: data.group.description ?? null,
        categories: [],
      }
    : null,
  companiesCount:
    data._count?.companies ??
    data.companies_count ?? // handle flattened structure
    0,
});

/* -------------------------------------------------------------------------- */
/* 🧩 Map groups + categories (combined response)                             */
/* -------------------------------------------------------------------------- */
export const mapCompanyCategoryGroups = (
  res: CompanyCategoryGroupsResponse,
): {
  groups: CompanyCategoryGroup[];
  categories: CompanyCategory[];
} => {
  // Map hierarchical groups
  const groups: CompanyCategoryGroup[] = (res.groups ?? []).map(group => ({
    id: group.id,
    name: group.name,
    description: group.description ?? null,
    categories: (group.categories ?? []).map(cat => ({
      id: cat.id,
      name: cat.name,
      group: {
        id: group.id,
        name: group.name,
        description: group.description ?? null,
        categories: [],
      },
      companiesCount: cat._count?.companies ?? 0,
    })),
  }));

  // Map flattened categories
  const categories: CompanyCategory[] = (res.categories ?? []).map(cat => ({
    id: cat.id,
    name: cat.name,
    group: {
      id: cat.group_id,
      name: cat.group_name,
      description: null,
      categories: [],
    },
    companiesCount: cat.companies_count ?? 0,
  }));

  return { groups, categories };
};

/* -------------------------------------------------------------------------- */
/* 👤 Map user profile                                                       */
/* -------------------------------------------------------------------------- */
export const mapUserProfile = (user: UserProfile): UserProfile => ({
  id: user.id,
  full_name: user.full_name ?? null,
  email: user.email ?? null,
  avatar_url: user.avatar_url ?? null,
});
