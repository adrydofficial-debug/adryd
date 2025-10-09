import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';

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
export const useProfile = () => {
  const user = useAuthStore(s => s.user);
  console.log('🔍 useProfile - Auth store user:', user?.id);

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      console.log('🔍 useProfile queryFn - Starting profile fetch...');
      
      // If no user in store, try to get current user from Supabase
      if (!user?.id) {
        console.log('🔍 No user in store, checking Supabase auth...');
        const { data: userData, error } = await supabase.auth.getUser();
        
        console.log('🔍 Supabase auth result:', { 
          hasUser: !!userData.user, 
          userId: userData.user?.id,
          error: error?.message 
        });
        
        if (error || !userData.user) {
          console.log('❌ No authenticated user found:', error?.message);
          return null;
        }

        const currentUser = userData.user;
        const metaData = currentUser.user_metadata || {};

        console.log('📊 Current user metadata:', metaData);
        console.log('👤 Username from metadata:', metaData.username);
        console.log('🖼️ Avatar URL from metadata:', metaData.avatar_url);

        const profileData = {
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

        console.log('✅ Profile data created:', profileData);
        return profileData;
      }

      // Get user data from auth.users table
      const { data: userData, error } = await supabase.auth.getUser();
      
      if (error || !userData.user) {
        throw error || new Error('User not found');
      }

      const currentUser = userData.user;
      const metaData = currentUser.user_metadata || {};

      console.log('📊 Current user metadata:', metaData);
      console.log('👤 Username from metadata:', metaData.username);
      console.log('🖼️ Avatar URL from metadata:', metaData.avatar_url);

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
    enabled: true, // Always enabled, will handle auth check inside
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      const { data: currentUser, error: getUserError } = await supabase.auth.getUser();
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
      
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: updatedMetaData
      });

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError);
        console.error('❌ Error details:', JSON.stringify(updateError, null, 2));
        throw updateError;
      }

      console.log('✅ Successfully updated user metadata:', updateData.user?.user_metadata);
      console.log('✅ Updated raw_user_meta_data:', updateData.user?.user_metadata);

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
    onSuccess: (data) => {
      // Update the profile in cache
      qc.setQueryData(['profile', user?.id], data);
      qc.invalidateQueries({ queryKey: ['profile'] });
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
        const existingUser = allUsers.users.find(u => 
          u.id !== currentUserId && 
          u.user_metadata?.username === username
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
