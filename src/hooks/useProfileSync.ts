import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addresses: Array<{
    id: string;
    street: string;
    number: string;
    city: string;
    state: string;
    zip: string;
    reference?: string;
    instructions?: string;
    isDefault: boolean;
  }>;
  preferences: {
    notifications: boolean;
    marketingEmails: boolean;
    language: string;
  };
}

const useProfileSync = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Get profile from localStorage (shared between store and food)
  const getProfileFromStorage = useCallback((): UserProfile | null => {
    try {
      const stored = localStorage.getItem('userProfile');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading profile from storage:', error);
      return null;
    }
  }, []);

  // Save profile to localStorage (shared between store and food)
  const saveProfileToStorage = useCallback((profileData: UserProfile) => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      setSyncStatus('success');
      
      // Trigger custom event for cross-tab synchronization
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: profileData 
      }));
    } catch (error) {
      console.error('Error saving profile to storage:', error);
      setSyncStatus('error');
    }
  }, []);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setSyncStatus('syncing');

      try {
        // Try to get from localStorage first
        let profileData = getProfileFromStorage();

        // If no profile in localStorage, fetch from API
        if (!profileData && user) {
          // Mock API call - in real app, this would be your backend
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          profileData = {
            id: user.id,
            email: user.email || '',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1-555-0123',
            addresses: [
              {
                id: 'addr-1',
                street: 'Main Street',
                number: '123',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                reference: 'Apartment 4B',
                instructions: 'Ring doorbell, leave at front desk',
                isDefault: true
              }
            ],
            preferences: {
              notifications: true,
              marketingEmails: false,
              language: 'en'
            }
          };
          
          // Save to localStorage for future use
          saveProfileToStorage(profileData);
        }

        setProfile(profileData);
        setSyncStatus('success');
      } catch (error) {
        console.error('Error loading profile:', error);
        setSyncStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, getProfileFromStorage, saveProfileToStorage]);

  // Listen for profile updates from other tabs
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      setProfile(event.detail);
      setSyncStatus('success');
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  // Update profile functions
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setSyncStatus('syncing');
    
    try {
      const updatedProfile = profile ? { ...profile, ...updates } : updates as UserProfile;
      
      // Mock API call - in real app, this would update backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save to localStorage
      saveProfileToStorage(updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSyncStatus('error');
    }
  }, [profile, saveProfileToStorage]);

  const addAddress = useCallback(async (address: Omit<UserProfile['addresses'][0], 'id'>) => {
    if (!profile) return;

    const newAddress = {
      ...address,
      id: `addr-${Date.now()}`,
      isDefault: profile.addresses.length === 0
    };

    const updatedAddresses = [...profile.addresses, newAddress];
    await updateProfile({ addresses: updatedAddresses });
  }, [profile, updateProfile]);

  const updateAddress = useCallback(async (addressId: string, updates: Partial<UserProfile['addresses'][0]>) => {
    if (!profile) return;

    const updatedAddresses = profile.addresses.map(addr =>
      addr.id === addressId ? { ...addr, ...updates } : addr
    );
    
    await updateProfile({ addresses: updatedAddresses });
  }, [profile, updateProfile]);

  const deleteAddress = useCallback(async (addressId: string) => {
    if (!profile) return;

    const updatedAddresses = profile.addresses.filter(addr => addr.id !== addressId);
    
    // If we deleted the default address, make the first remaining address default
    if (updatedAddresses.length > 0 && profile.addresses.find(addr => addr.id === addressId)?.isDefault) {
      updatedAddresses[0].isDefault = true;
    }
    
    await updateProfile({ addresses: updatedAddresses });
  }, [profile, updateProfile]);

  const setDefaultAddress = useCallback(async (addressId: string) => {
    if (!profile) return;

    const updatedAddresses = profile.addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    
    await updateProfile({ addresses: updatedAddresses });
  }, [profile, updateProfile]);

  // Get default address
  const getDefaultAddress = useCallback(() => {
    return profile?.addresses.find(addr => addr.isDefault) || null;
  }, [profile]);

  // Get addresses for specific section (store vs food)
  const getAddressesForSection = useCallback((section: 'store' | 'food') => {
    if (!profile) return [];
    
    // Filter addresses based on section requirements
    return profile.addresses.filter(addr => {
      // All addresses are valid for both sections, but we could add section-specific logic
      return true;
    });
  }, [profile]);

  // Sync profile between sections
  const syncProfile = useCallback(async () => {
    setSyncStatus('syncing');
    
    try {
      // Mock API call to sync profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload from storage to ensure consistency
      const syncedProfile = getProfileFromStorage();
      if (syncedProfile) {
        setProfile(syncedProfile);
        saveProfileToStorage(syncedProfile);
      }
      
      setSyncStatus('success');
    } catch (error) {
      console.error('Error syncing profile:', error);
      setSyncStatus('error');
    }
  }, [getProfileFromStorage, saveProfileToStorage]);

  return {
    profile,
    isLoading,
    syncStatus,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    getAddressesForSection,
    syncProfile
  };
};

export default useProfileSync;
export type { UserProfile };
