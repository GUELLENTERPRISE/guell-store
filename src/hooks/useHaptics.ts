import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  const impact = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style });
    } catch (error) {
      // Haptics not available - TODO: add fallback
    }
  };

  const notification = async (type: NotificationType = NotificationType.Success) => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type });
    } catch (error) {
      // Haptics not available - TODO: add fallback
    }
  };

  const vibrate = async (duration: number = 300) => {
    if (!isNative) return;
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      // Haptics not available - TODO: add fallback
    }
  };

  const selectionStart = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionStart();
    } catch (error) {
      // Haptics not available - TODO: add fallback
    }
  };

  const selectionChanged = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      // Haptics not available - TODO: add fallback
    }
  };

  const selectionEnd = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionEnd();
    } catch (error) {
      // Haptics not available - TODO: add fallback
    }
  };

  // Convenience methods
  const lightTap = () => impact(ImpactStyle.Light);
  const mediumTap = () => impact(ImpactStyle.Medium);
  const heavyTap = () => impact(ImpactStyle.Heavy);
  const successFeedback = () => notification(NotificationType.Success);
  const warningFeedback = () => notification(NotificationType.Warning);
  const errorFeedback = () => notification(NotificationType.Error);

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
    lightTap,
    mediumTap,
    heavyTap,
    successFeedback,
    warningFeedback,
    errorFeedback,
    isNative,
  };
};

export { ImpactStyle, NotificationType };
