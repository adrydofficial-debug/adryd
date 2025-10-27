import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadToSignedUrl } from '../../../services/uploadFile';
import { companiesApi, companyCategoriesApi } from '../api/api';
import {
  Company,
  CompanyCategory,
  CompanyCategoryGroup,
} from '../domain/entities';

/* -------------------------------------------------------------------------- */
/* 🏢 COMPANIES HOOKS                                                        */
/* -------------------------------------------------------------------------- */

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: companiesApi.getCompanies,
  });
}

export function useCompany(id?: number) {
  return useQuery<Company>({
    queryKey: ['company', id],
    queryFn: () => companiesApi.getCompanyById(id!),
    enabled: !!id, // don’t fetch until ID exists
  });
}

/* -------------------------------------------------------------------------- */
/* 🔧 MUTATIONS (CREATE / UPDATE / DELETE)                                    */
/* -------------------------------------------------------------------------- */
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation<
    Company,
    Error,
    {
      data: Partial<Company>;
      file?: { uri: string; type: string; name: string }; // ✅ React Native–style file object
    }
  >({
    mutationFn: async ({ data, file }) => {
      // 1️⃣ Create the company
      const { company, upload } = await companiesApi.createCompany(data);

      // 2️⃣ Upload the logo if provided
      if (file) {
        await uploadToSignedUrl(upload.uploadUrl, {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      }

      // 3️⃣ Return the created company
      return company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Company> }) =>
      companiesApi.updateCompany(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => companiesApi.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* 🧩 COMPANY CATEGORY HOOKS                                                 */
/* -------------------------------------------------------------------------- */

export function useCompanyCategoryGroups() {
  return useQuery<{
    groups: CompanyCategoryGroup[];
    categories: CompanyCategory[];
  }>({
    queryKey: ['company-category-groups'],
    queryFn: companyCategoriesApi.getCategoryGroups,
  });
}
