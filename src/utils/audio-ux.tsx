// Audio-UX System for GÜELL Platform
import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

// Audio context types
interface AudioUXContextType {
  isMuted: boolean;
  volume: number;
  enabled: boolean;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setEnabled: (enabled: boolean) => void;
  playSound: (soundType: string, volume?: number) => void;
}

// Sound types
type SoundType = 
  | 'button-click'
  | 'add-to-cart'
  | 'checkout-success'
  | 'notification'
  | 'level-up'
  | 'error'
  | 'success'
  | 'gift-sent';

// Create context
const AudioUXContext = createContext<AudioUXContextType | null>(null);

// Audio-UX Provider
export const AudioUXProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [enabled, setEnabled] = useState(true);

  // Load preferences from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('guell-audio-volume');
    const savedMuted = localStorage.getItem('guell-audio-muted');
    const savedEnabled = localStorage.getItem('guell-audio-enabled');

    if (savedVolume) setVolume(parseFloat(savedVolume));
    if (savedMuted) setIsMuted(savedMuted === 'true');
    if (savedEnabled) setEnabled(savedEnabled === 'true');
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('guell-audio-volume', volume.toString());
    localStorage.setItem('guell-audio-muted', isMuted.toString());
    localStorage.setItem('guell-audio-enabled', enabled.toString());
  }, [volume, isMuted, enabled]);

  // Generate audio context
  const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

  // Create oscillator for simple sounds
  const createSound = useCallback((type: SoundType, customVolume?: number) => {
    if (!audioContext || isMuted || !enabled) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Different sound types
    switch (type) {
      case 'button-click':
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        break;
      case 'add-to-cart':
        oscillator.frequency.value = 600;
        oscillator.type = 'triangle';
        break;
      case 'checkout-success':
        oscillator.frequency.value = 1000;
        oscillator.type = 'sine';
        break;
      case 'notification':
        oscillator.frequency.value = 440;
        oscillator.type = 'square';
        break;
      case 'level-up':
        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';
        break;
      case 'error':
        oscillator.frequency.value = 300;
        oscillator.type = 'sawtooth';
        break;
      case 'success':
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        break;
      case 'gift-sent':
        oscillator.frequency.value = 900;
        oscillator.type = 'triangle';
        break;
    }

    // Set volume
    const finalVolume = customVolume !== undefined ? customVolume : volume;
    gainNode.gain.value = finalVolume * 0.1; // Scale down to reasonable volume

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Play sound
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1); // Play for 100ms
  }, [audioContext, isMuted, enabled, volume]);

  // Context value
  const contextValue: AudioUXContextType = {
    isMuted,
    volume,
    enabled,
    toggleMute: () => setIsMuted(!isMuted),
    setVolume,
    setEnabled,
    playSound: createSound
  };

  return (
    <AudioUXContext.Provider value={contextValue}>
      {children}
    </AudioUXContext.Provider>
  );
};

// Hook to use audio context
export const useAudioUX = () => {
  const context = useContext(AudioUXContext);
  if (!context) {
    // Return safe defaults instead of throwing error to prevent crashes
    return {
      isMuted: true,
      volume: 0.3,
      enabled: false,
      toggleMute: () => {},
      setVolume: () => {},
      setEnabled: () => {},
      playSound: () => {}
    };
  }
  return context;
};

// Simplified hook for common operations
export const useAudioUXSimple = () => {
  const { playSound, isMuted, volume } = useAudioUX();

  const playClick = () => playSound('button-click');
  const playAddToCart = () => playSound('add-to-cart');
  const playSuccess = () => playSound('success');
  const playError = () => playSound('error');
  const playNotification = () => playSound('notification');
  const playLevelUp = () => playSound('level-up');
  const playGiftSent = () => playSound('gift-sent');

  return {
    playClick,
    playAddToCart,
    playSuccess,
    playError,
    playNotification,
    playLevelUp,
    playGiftSent,
    isMuted,
    volume
  };
};

// Test sound function
export const playTestSound = () => {
  const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.frequency.value = 440; // A note
  oscillator.type = 'sine';
  gainNode.gain.value = 0.1;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2); // Play for 200ms
};

// Component for audio controls
export const AudioUXControls: React.FC = () => {
  const { isMuted, toggleMute } = useAudioUX();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground dark:text-gray-100">Audio Feedback</h3>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">Subtle sounds for key interactions</p>
        </div>
      </div>
      
      <button
        onClick={toggleMute}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isMuted ? 'bg-gray-300' : 'bg-orange-500'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-card dark:bg-gray-800 transition-transform ${
            isMuted ? 'translate-x-1' : 'translate-x-6'
          }`}
        />
      </button>
    </div>
  );
};

export default AudioUXProvider;
