import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { uploadToSignedUrl } from '../../../services/uploadFile';
import { useAuthStore } from '../../../store/authStore';
import { profileApi } from '../api/api';

// -----------------------------
// Types
// -----------------------------
export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

// -----------------------------
// 1️⃣ Get User Profile
// -----------------------------
export const useProfile = (enabled: boolean = true) => {
  const user = useAuthStore(s => s.user);

  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: enabled && !!user?.id, // Only run when enabled and we have a user ID
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

// -----------------------------
// 2️⃣ Update User Profile
// -----------------------------
export const useUpdateProfile = () => {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<UserProfile> => {
      // Get current user from Supabase (regardless of store state)
      const { data: currentUser, error: getUserError } =
        await supabase.auth.getUser();
      if (getUserError || !currentUser.user) {
        throw new Error('User not authenticated. Please log in first.');
      }

      const currentMetaData = currentUser.user.user_metadata || {};
      const updatedMetaData = {
        ...currentMetaData,
        ...data,
      };

      // Update user metadata
      console.log('🔄 Updating user metadata:', updatedMetaData);
      console.log('🔄 Current user before update:', currentUser.user.id);

      const { data: updateData, error: updateError } =
        await supabase.auth.updateUser({
          data: updatedMetaData,
        });

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError);
        console.error(
          '❌ Error details:',
          JSON.stringify(updateError, null, 2),
        );
        throw updateError;
      }

      console.log(
        '✅ Successfully updated user metadata:',
        updateData.user?.user_metadata,
      );
      console.log(
        '✅ Updated raw_user_meta_data:',
        updateData.user?.user_metadata,
      );

      const updatedUser = updateData.user!;
      const newMetaData = updatedUser.user_metadata || {};

      return {
        id: updatedUser.id,
        username: newMetaData.username,
        full_name: newMetaData.full_name,
        first_name: newMetaData.first_name,
        last_name: newMetaData.last_name,
        avatar_url: newMetaData.avatar_url,
        phone: updatedUser.phone || '',
        email: updatedUser.email || '',
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at || updatedUser.created_at,
      };
    },
    onSuccess: data => {
      // Update the authStore with the new user data first
      if (user) {
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            username: data.username,
            full_name: data.full_name,
            first_name: data.first_name,
            last_name: data.last_name,
            avatar_url: data.avatar_url,
          },
        };

        // Update the authStore
        const { setUser } = useAuthStore.getState();
        setUser(updatedUser);

        console.log(
          '✅ Updated authStore with new user data:',
          updatedUser.user_metadata,
        );
        console.log('✅ Updated full_name:', data.full_name);
        console.log('✅ Updated avatar_url:', data.avatar_url);
      } else {
        console.warn('⚠️ No user in authStore to update');
      }

      // Invalidate and refetch all profile queries
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.setQueryData(['profile', user?.id], data);

      // Force refetch by removing from cache and refetching
      qc.removeQueries({ queryKey: ['profile', user?.id] });
    },
  });
};

// -----------------------------
// 3️⃣ Update Username Only
// -----------------------------
export const useUpdateUsername = () => {
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async (username: string): Promise<UserProfile> => {
      // Validate username
      if (!username.trim()) {
        throw new Error('Username cannot be empty');
      }

      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (username.length > 20) {
        throw new Error('Username must be less than 20 characters');
      }

      // Get current user to check against
      const { data: currentUser } = await supabase.auth.getUser();
      const currentUserId = currentUser?.user?.id;

      // Check if username is already taken by querying all users
      const { data: allUsers, error } = await supabase.auth.admin.listUsers();

      if (error) {
        // If we can't check (no admin access), we'll skip the check
        console.warn('Could not check username uniqueness:', error.message);
      } else {
        // Check if username is already taken by another user
        const existingUser = allUsers.users.find(
          u => u.id !== currentUserId && u.user_metadata?.username === username,
        );

        if (existingUser) {
          throw new Error('Username is already taken');
        }
      }

      return updateProfile.mutateAsync({ username });
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

export const useUploadProfileAvatar = () => {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: async (file: { uri: string; type: string; name: string }) => {
      console.log('🟡 [AvatarUpload] Starting upload for file:', file);

      if (!user?.id) {
        console.error('❌ [AvatarUpload] No authenticated user found.');
        throw new Error('User not authenticated');
      }

      console.log('👤 [AvatarUpload] Authenticated user:', user.id);

      // Step 1 → Get signed upload URL from backend
      console.log('🌐 [AvatarUpload] Requesting signed upload URL...');
      console.log('🧾 [AvatarUpload] File details:', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });
      const filename = file.name || file.fileName || 'avatar.jpg';
      const contentType = file.type || 'image/jpeg';
      console.log('🧾 [AvatarUpload] Normalized file details:', {
        filename,
        contentType,
      });

      const { uploadUrl, publicUrl } = await profileApi.getAvatarUploadUrl({
        filename: file.name,
        contentType: file.type,
      });
      console.log('✅ [AvatarUpload] Received signed URL:', uploadUrl);
      console.log('🌍 [AvatarUpload] Public URL will be:', publicUrl);

      // Step 2 → Upload file directly to storage
      console.log('📤 [AvatarUpload] Uploading file to signed URL...');
      await uploadToSignedUrl(uploadUrl, file);
      console.log('✅ [AvatarUpload] Upload complete.');

      // DB trigger will handle updating Supabase; return public URL for optimistic update
      return publicUrl;
    },

    onSuccess: async publicUrl => {
      console.log('🟢 [AvatarUpload] Upload success! Public URL:', publicUrl);

      // Update user metadata immediately
      console.log('🔄 [AvatarUpload] Updating Supabase user metadata...');
      const { data, error } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (error) {
        console.error(
          '❌ [AvatarUpload] Failed to update user metadata:',
          error,
        );
        throw error;
      }

      console.log('✅ [AvatarUpload] Supabase metadata updated.');

      // Update cache and store
      const updatedUser = data.user!;
      console.log('🧠 [AvatarUpload] Updating local auth store...');
      const { setUser } = useAuthStore.getState();
      setUser(updatedUser);

      console.log(
        '🧩 [AvatarUpload] Invalidating profile cache for user:',
        user?.id,
      );
      qc.invalidateQueries({ queryKey: ['profile', user?.id] });

      console.log('🎉 [AvatarUpload] Avatar upload and sync complete.');
    },

    onError: err => {
      console.error('💀 [AvatarUpload] Avatar upload failed:', err);
    },
  });
};
