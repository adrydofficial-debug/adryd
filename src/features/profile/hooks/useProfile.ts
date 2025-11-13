import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { uploadToSignedUrl } from '../../../services/uploadFile';
import { useAuthStore } from '../../../store/authStore';
import { profileApi } from '../api/api';
import { UserProfile } from '../domain/entities';

export interface UpdateProfileData {
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatarFile?: { uri: string; type: string; name: string };
}

// -----------------------------
// 1️⃣ Get User Profile
// -----------------------------
export const useProfile = (enabled: boolean = true) => {
  const user = useAuthStore(s => s.user);

  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: enabled && !!user?.id,
    queryFn: async (): Promise<UserProfile | null> => {
      // Get user data from Supabase
      const { data: userData, error } = await supabase.auth.getUser();

      if (error || !userData.user) {
        throw error || new Error('User not found');
      }

      const currentUser = userData.user;
      const metaData = currentUser.user_metadata || {};

      return {
        id: currentUser.id,
        username: metaData.username,
        full_name: metaData.full_name || currentUser.user_metadata?.full_name,
        first_name: metaData.first_name,
        last_name: metaData.last_name,
        avatar_url: metaData.avatar_url,
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        created_at: currentUser.created_at,
        updated_at: currentUser.updated_at || currentUser.created_at,
      };
    },
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window comes into focus
    refetchOnReconnect: true, // Refetch when reconnecting
  });
};

export const useUpdateUserProfile = () => {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!user?.id) throw new Error('User not authenticated.');

      // Step 1 — Upload avatar if present
      let avatarUrl: string | undefined;
      if (data.avatarFile) {
        console.log('📸 Uploading new avatar...');
        const { name, type } = data.avatarFile;
        const { uploadUrl, publicUrl } = await profileApi.getAvatarUploadUrl({
          filename: name,
          contentType: type,
        });
        await uploadToSignedUrl(uploadUrl, data.avatarFile);
        avatarUrl = publicUrl;
        console.log('✅ Avatar uploaded:', avatarUrl);
      }

      // Step 2 — Merge with existing metadata
      const { data: currentUser, error: getUserError } =
        await supabase.auth.getUser();
      if (getUserError || !currentUser.user)
        throw new Error('Failed to fetch current user.');

      const currentMeta = currentUser.user.user_metadata || {};
      const updatedMeta = {
        ...currentMeta,
        ...data,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      };
      delete updatedMeta.avatarFile; // in case it sneaks in

      // Step 3 — Update Supabase user metadata
      const { data: updated, error: updateError } =
        await supabase.auth.updateUser({
          data: updatedMeta,
        });
      if (updateError) throw updateError;

      const updatedUser = updated.user!;
      console.log('✅ Supabase metadata updated:', updatedUser.user_metadata);

      // Step 4 — Update local store and query cache
      const { setUser } = useAuthStore.getState();
      setUser(updatedUser);
      qc.invalidateQueries({ queryKey: ['profile', user.id] });

      return updatedUser.user_metadata;
    },

    onError: err => {
      console.error('💀 Profile update failed:', err);
    },
  });
};

// -----------------------------
// 4️⃣ Profile Validation
// -----------------------------
export const validateUsername = (username: string): string | null => {
  if (!username.trim()) {
    return 'Username is required';
  }

  if (username.length < 3) {
    return 'Username must be at least 3 characters long';
  }

  if (username.length > 20) {
    return 'Username must be less than 20 characters';
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }

  if (username.startsWith('_') || username.endsWith('_')) {
    return 'Username cannot start or end with underscore';
  }

  return null;
};
