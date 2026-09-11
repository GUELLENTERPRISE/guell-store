import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from './useTranslation';
import { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'user_profiles'>;

export const useUserProfile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      toast.success(t('notifications.success'));
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('notifications.errorOccurred'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    setLoading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-avatar.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });
      
      toast.success(t('notifications.success'));
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(t('notifications.errorOccurred'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    setLoading(true);
    try {
      // Remove avatar URL from profile
      await updateProfile({ avatar_url: null });
      toast.success(t('notifications.success'));
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error(t('notifications.errorOccurred'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, fetchProfile]);

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    refetch: fetchProfile
  };
};