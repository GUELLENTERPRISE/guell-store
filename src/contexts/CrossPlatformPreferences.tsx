import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useTheme } from './ThemeContext';
import { useAudioUX } from '@/utils/audio-ux';
import { useUnifiedUser } from './UnifiedUserContext';

interface CrossPlatformPreferences {
  darkMode: {
    enabled: boolean;
    autoStartTime: number;
    autoEndTime: number;
    mode: 'light' | 'dark' | 'auto';
  };
  audioUX: {
    enabled: boolean;
    volume: number;
    muted: boolean;
    customSounds: Record<string, boolean>;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  ui: {
    compactMode: boolean;
    highContrast: boolean;
    animationsEnabled: boolean;
    autoPlayVideos: boolean;
  };
  privacy: {
    analyticsEnabled: boolean;
    crashReporting: boolean;
    personalizedAds: boolean;
  };
}

interface CrossPlatformState {
  preferences: CrossPlatformPreferences;
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}

type CrossPlatformAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_PREFERENCES'; payload: CrossPlatformPreferences }
  | { type: 'UPDATE_DARK_MODE'; payload: Partial<CrossPlatformPreferences['darkMode']> }
  | { type: 'UPDATE_AUDIO_UX'; payload: Partial<CrossPlatformPreferences['audioUX']> }
  | { type: 'UPDATE_NOTIFICATIONS'; payload: Partial<CrossPlatformPreferences['notifications']> }
  | { type: 'UPDATE_UI'; payload: Partial<CrossPlatformPreferences['ui']> }
  | { type: 'UPDATE_PRIVACY'; payload: Partial<CrossPlatformPreferences['privacy']> }
  | { type: 'SET_LAST_SYNC'; payload: Date };

const initialState: CrossPlatformState = {
  preferences: {
    darkMode: {
      enabled: false,
      autoStartTime: 19,
      autoEndTime: 7,
      mode: 'auto'
    },
    audioUX: {
      enabled: true,
      volume: 0.3,
      muted: false,
      customSounds: {
        'add-to-cart': true,
        'checkout-success': true,
        'notification': true,
        'level-up': true,
        'button-click': false,
        'error': true,
        'success': true,
        'gift-sent': true
      }
    },
    notifications: {
      email: true,
      sms: true,
      push: true,
      marketing: false
    },
    ui: {
      compactMode: false,
      highContrast: false,
      animationsEnabled: true,
      autoPlayVideos: false
    },
    privacy: {
      analyticsEnabled: true,
      crashReporting: true,
      personalizedAds: false
    }
  },
  isLoading: false,
  error: null,
  lastSync: null
};

const crossPlatformReducer = (state: CrossPlatformState, action: CrossPlatformAction): CrossPlatformState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload, isLoading: false };
    
    case 'UPDATE_DARK_MODE':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          darkMode: { ...state.preferences.darkMode, ...action.payload }
        }
      };
    
    case 'UPDATE_AUDIO_UX':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          audioUX: { ...state.preferences.audioUX, ...action.payload }
        }
      };
    
    case 'UPDATE_NOTIFICATIONS':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          notifications: { ...state.preferences.notifications, ...action.payload }
        }
      };
    
    case 'UPDATE_UI':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ui: { ...state.preferences.ui, ...action.payload }
        }
      };
    
    case 'UPDATE_PRIVACY':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          privacy: { ...state.preferences.privacy, ...action.payload }
        }
      };
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    
    default:
      return state;
  }
};

const CrossPlatformContext = createContext<{
  state: CrossPlatformState;
  actions: {
    // Dark Mode
    setDarkMode: (enabled: boolean) => void;
    setDarkModeMode: (mode: 'light' | 'dark' | 'auto') => void;
    setAutoTime: (start: number, end: number) => void;
    
    // Audio UX
    setAudioEnabled: (enabled: boolean) => void;
    setAudioVolume: (volume: number) => void;
    setAudioMuted: (muted: boolean) => void;
    setCustomSound: (sound: string, enabled: boolean) => void;
    
    // Notifications
    setEmailNotifications: (enabled: boolean) => void;
    setSmsNotifications: (enabled: boolean) => void;
    setPushNotifications: (enabled: boolean) => void;
    setMarketingNotifications: (enabled: boolean) => void;
    
    // UI Preferences
    setCompactMode: (enabled: boolean) => void;
    setHighContrast: (enabled: boolean) => void;
    setAnimationsEnabled: (enabled: boolean) => void;
    setAutoPlayVideos: (enabled: boolean) => void;
    
    // Privacy
    setAnalyticsEnabled: (enabled: boolean) => void;
    setCrashReporting: (enabled: boolean) => void;
    setPersonalizedAds: (enabled: boolean) => void;
    
    // Sync
    syncPreferences: () => Promise<void>;
    resetToDefaults: () => void;
  };
} | undefined>(undefined);

export const useCrossPlatformPreferences = () => {
  const context = useContext(CrossPlatformContext);
  if (context === undefined) {
    throw new Error('useCrossPlatformPreferences must be used within a CrossPlatformProvider');
  }
  return context;
};

interface CrossPlatformProviderProps {
  children: ReactNode;
}

export const CrossPlatformProvider: React.FC<CrossPlatformProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(crossPlatformReducer, initialState);
  const { isDark } = useTheme();
  const { setVolume, toggleMute, getVolume, getIsMuted } = useAudioUX();
  const { state: userState, actions: userActions } = useUnifiedUser();

  // Load preferences from localStorage and user profile
  useEffect(() => {
    loadPreferences();
  }, []);

  // Sync dark mode with actual state
  useEffect(() => {
    if (state.preferences.darkMode.enabled !== isDark) {
      dispatch({
        type: 'UPDATE_DARK_MODE',
        payload: { enabled: isDark }
      });
    }
  }, [isDark, state.preferences.darkMode.enabled]);

  // Sync audio UX with actual state
  useEffect(() => {
    const currentVolume = getVolume();
    const currentMuted = getIsMuted();
    
    if (state.preferences.audioUX.volume !== currentVolume || state.preferences.audioUX.muted !== currentMuted) {
      dispatch({
        type: 'UPDATE_AUDIO_UX',
        payload: { volume: currentVolume, muted: currentMuted }
      });
    }
  }, [getVolume, getIsMuted]);

  // Load preferences from storage
  const loadPreferences = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Load from localStorage
      const stored = localStorage.getItem('guell-cross-platform-preferences');
      let preferences = { ...initialState.preferences };
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          preferences = { ...preferences, ...parsed };
        } catch (error) {
          console.error('Error parsing stored preferences:', error);
        }
      }

      // Load from user profile if available
      if (userState.profile?.preferences) {
        preferences = {
          ...preferences,
          darkMode: {
            ...preferences.darkMode,
            enabled: userState.profile.preferences.darkMode ?? preferences.darkMode.enabled
          },
          audioUX: {
            ...preferences.audioUX,
            muted: userState.profile.preferences.audioMuted ?? preferences.audioUX.muted,
            volume: userState.profile.preferences.audioVolume ?? preferences.audioUX.volume
          },
          notifications: {
            ...preferences.notifications,
            email: userState.profile.preferences.emailNotifications ?? preferences.notifications.email,
            sms: userState.profile.preferences.smsNotifications ?? preferences.notifications.sms,
            push: userState.profile.preferences.pushNotifications ?? preferences.notifications.push,
            marketing: userState.profile.preferences.marketingEmails ?? preferences.notifications.marketing
          }
        };
      }

      dispatch({ type: 'SET_PREFERENCES', payload: preferences });
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
      
      // Apply preferences to actual systems
      await applyPreferences(preferences);
      
    } catch (error) {
      console.error('Error loading preferences:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load preferences' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Apply preferences to actual systems
  const applyPreferences = async (preferences: CrossPlatformPreferences) => {
    // Apply dark mode
    setMode(preferences.darkMode.mode);
    
    // Apply audio UX
    setVolume(preferences.audioUX.volume);
    if (preferences.audioUX.muted !== getIsMuted()) {
      toggleMute();
    }
    
    // Apply UI preferences
    if (preferences.ui.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
    
    if (preferences.ui.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    if (!preferences.ui.animationsEnabled) {
      document.body.classList.add('no-animations');
    } else {
      document.body.classList.remove('no-animations');
    }
  };

  // Save preferences
  const savePreferences = async () => {
    try {
      // Save to localStorage
      localStorage.setItem('guell-cross-platform-preferences', JSON.stringify(state.preferences));
      
      // Save to user profile
      if (userState.profile) {
        await userActions.updateProfile({
          preferences: {
            newsletter: state.preferences.notifications.email,
            smsNotifications: state.preferences.notifications.sms,
            emailNotifications: state.preferences.notifications.email,
            pushNotifications: state.preferences.notifications.push,
            marketingEmails: state.preferences.notifications.marketing,
            darkMode: state.preferences.darkMode.enabled,
            audioMuted: state.preferences.audioUX.muted,
            audioVolume: state.preferences.audioUX.volume
          }
        });
      }
      
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
    } catch (error) {
      console.error('Error saving preferences:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save preferences' });
    }
  };

  // Action implementations
  const setDarkMode = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_DARK_MODE', payload: { enabled } });
    setMode(enabled ? 'dark' : 'light');
    savePreferences();
  };

  const setDarkModeMode = (mode: 'light' | 'dark' | 'auto') => {
    dispatch({ type: 'UPDATE_DARK_MODE', payload: { mode } });
    setMode(mode);
    savePreferences();
  };

  const setAutoTime = (start: number, end: number) => {
    dispatch({ type: 'UPDATE_DARK_MODE', payload: { autoStartTime: start, autoEndTime: end } });
    savePreferences();
  };

  const setAudioEnabled = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_AUDIO_UX', payload: { enabled } });
    savePreferences();
  };

  const setAudioVolume = (volume: number) => {
    dispatch({ type: 'UPDATE_AUDIO_UX', payload: { volume } });
    setVolume(volume);
    savePreferences();
  };

  const setAudioMuted = (muted: boolean) => {
    dispatch({ type: 'UPDATE_AUDIO_UX', payload: { muted } });
    if (muted !== getIsMuted()) {
      toggleMute();
    }
    savePreferences();
  };

  const setCustomSound = (sound: string, enabled: boolean) => {
    dispatch({
      type: 'UPDATE_AUDIO_UX',
      payload: {
        customSounds: {
          ...state.preferences.audioUX.customSounds,
          [sound]: enabled
        }
      }
    });
    savePreferences();
  };

  const setEmailNotifications = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: { email: enabled } });
    savePreferences();
  };

  const setSmsNotifications = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: { sms: enabled } });
    savePreferences();
  };

  const setPushNotifications = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: { push: enabled } });
    savePreferences();
  };

  const setMarketingNotifications = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: { marketing: enabled } });
    savePreferences();
  };

  const setCompactMode = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_UI', payload: { compactMode: enabled } });
    
    if (enabled) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
    
    savePreferences();
  };

  const setHighContrast = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_UI', payload: { highContrast: enabled } });
    
    if (enabled) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    savePreferences();
  };

  const setAnimationsEnabled = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_UI', payload: { animationsEnabled: enabled } });
    
    if (!enabled) {
      document.body.classList.add('no-animations');
    } else {
      document.body.classList.remove('no-animations');
    }
    
    savePreferences();
  };

  const setAutoPlayVideos = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_UI', payload: { autoPlayVideos: enabled } });
    savePreferences();
  };

  const setAnalyticsEnabled = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_PRIVACY', payload: { analyticsEnabled: enabled } });
    savePreferences();
  };

  const setCrashReporting = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_PRIVACY', payload: { crashReporting: enabled } });
    savePreferences();
  };

  const setPersonalizedAds = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_PRIVACY', payload: { personalizedAds: enabled } });
    savePreferences();
  };

  const syncPreferences = async () => {
    await loadPreferences();
  };

  const resetToDefaults = () => {
    dispatch({ type: 'SET_PREFERENCES', payload: initialState.preferences });
    applyPreferences(initialState.preferences);
    localStorage.removeItem('guell-cross-platform-preferences');
  };

  const actions = {
    setDarkMode,
    setDarkModeMode,
    setAutoTime,
    setAudioEnabled,
    setAudioVolume,
    setAudioMuted,
    setCustomSound,
    setEmailNotifications,
    setSmsNotifications,
    setPushNotifications,
    setMarketingNotifications,
    setCompactMode,
    setHighContrast,
    setAnimationsEnabled,
    setAutoPlayVideos,
    setAnalyticsEnabled,
    setCrashReporting,
    setPersonalizedAds,
    syncPreferences,
    resetToDefaults
  };

  return (
    <CrossPlatformContext.Provider value={{ state, actions }}>
      {children}
    </CrossPlatformContext.Provider>
  );
};

export default CrossPlatformProvider;
