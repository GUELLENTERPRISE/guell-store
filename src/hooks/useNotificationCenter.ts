import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'points' | 'coupon' | 'tier' | 'order' | 'promotion' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    type: 'navigate' | 'apply_coupon' | 'view_points' | 'view_order';
    data?: Record<string, unknown>;
  };
  icon?: string;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
}

interface NotificationSettings {
  points: boolean;
  coupons: boolean;
  tier: boolean;
  orders: boolean;
  promotions: boolean;
  system: boolean;
  email: boolean;
  push: boolean;
}

const useNotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    points: true,
    coupons: true,
    tier: true,
    orders: true,
    promotions: true,
    system: true,
    email: true,
    push: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      setIsLoading(true);
      
      try {
        // Mock API call - in real app, this would fetch from backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'points',
            title: '¡Puntos Ganados!',
            message: 'Has ganado 142 puntos en tu última compra en Burger Palace.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            read: false,
            action: {
              type: 'view_points',
              data: { source: 'purchase', orderId: 'order-123' }
            },
            icon: 'star',
            priority: 'medium'
          },
          {
            id: '2',
            type: 'coupon',
            title: 'Nuevo Cupón Disponible',
            message: '¡Felicidades! Tienes un nuevo cupón: SUMMER20 - 20% de descuento.',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            read: false,
            action: {
              type: 'apply_coupon',
              data: { code: 'SUMMER20', discount: 20 }
            },
            icon: 'tag',
            priority: 'high'
          },
          {
            id: '3',
            type: 'tier',
            title: '¡Subiste de Nivel!',
            message: '¡Felicidades! Ahora eres miembro Silver y tienes beneficios exclusivos.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            read: true,
            action: {
              type: 'view_points',
              data: { tier: 'silver' }
            },
            icon: 'trophy',
            priority: 'high'
          },
          {
            id: '4',
            type: 'order',
            title: 'Pedido Entregado',
            message: 'Tu pedido #order-456 ha sido entregado. ¡Que lo disfrutes!',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            read: true,
            action: {
              type: 'view_order',
              data: { orderId: 'order-456' }
            },
            icon: 'package',
            priority: 'medium'
          },
          {
            id: '5',
            type: 'promotion',
            title: 'Promoción de Fin de Semana',
            message: 'Delivery gratis en todos los pedidos mayores a $25 este fin de semana.',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            read: true,
            icon: 'gift',
            priority: 'low',
            expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Expires in 2 days
          }
        ];
        
        setNotifications(mockNotifications);
        
        // Calculate unread count
        const unread = mockNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
        
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification if enabled
    if (settings.push && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.png',
        tag: notification.id
      });
    }
  }, [settings.push]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Handle notification action
  const handleNotificationAction = useCallback((notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);

    // Execute action
    if (notification.action) {
      switch (notification.action.type) {
        case 'navigate':
          // Navigate to specific page
          window.location.href = notification.action.data.url;
          break;
        case 'apply_coupon':
          // Apply coupon (this would integrate with coupon system)
          // Apply coupon - TODO: integrate with coupon system
          break;
        case 'view_points':
          // Navigate to loyalty points page
          window.location.href = '/profile/loyalty';
          break;
        case 'view_order':
          // Navigate to order details
          window.location.href = `/food/orders/${notification.action.data.orderId}`;
          break;
      }
    }
  }, [markAsRead]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Update notification settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority: Notification['priority']) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  // Clean expired notifications
  const cleanExpiredNotifications = useCallback(() => {
    const now = new Date();
    setNotifications(prev => 
      prev.filter(n => !n.expiresAt || n.expiresAt > now)
    );
  }, []);

  // Auto-clean expired notifications
  useEffect(() => {
    const interval = setInterval(cleanExpiredNotifications, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [cleanExpiredNotifications]);

  // Generate notification templates
  const generateNotification = useCallback((
    type: Notification['type'],
    data?: Record<string, string>
  ): Omit<Notification, 'id' | 'timestamp'> => {
    const templates = {
      points: {
        title: '¡Puntos Ganados!',
        message: `Has ganado ${data?.points} puntos en tu compra.`,
        icon: 'star',
        priority: 'medium' as const,
        action: {
          type: 'view_points' as const,
          data: { source: 'purchase', orderId: data.orderId }
        }
      },
      coupon: {
        title: 'Nuevo Cupón Disponible',
        message: `¡Felicidades! Tienes un nuevo cupón: ${data.code} - ${data.discount}% de descuento.`,
        icon: 'tag',
        priority: 'high' as const,
        action: {
          type: 'apply_coupon' as const,
          data: { code: data.code, discount: data.discount }
        }
      },
      tier: {
        title: '¡Subiste de Nivel!',
        // Tier upgrade notification - TODO: integrate with notification system
        message: `¡Felicidades! Ahora eres miembro ${data.tierName} y tienes beneficios exclusivos.`,
        icon: 'trophy',
        priority: 'high' as const,
        action: {
          type: 'view_points' as const,
          data: { tier: data.tierId }
        }
      },
      order: {
        title: 'Pedido Actualizado',
        message: `Tu pedido #${data.orderId} ha sido actualizado: ${data.status}.`,
        icon: 'package',
        priority: 'medium' as const,
        action: {
          type: 'view_order' as const,
          data: { orderId: data.orderId }
        }
      },
      promotion: {
        title: 'Nueva Promoción',
        message: data.message,
        icon: 'gift',
        priority: 'low' as const,
        expiresAt: data.expiresAt
      },
      system: {
        title: 'Información del Sistema',
        message: data.message,
        icon: 'info',
        priority: 'medium' as const
      }
    };

    const template = templates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    return {
      type,
      ...template,
      read: false
    };
  }, []);

  return {
    notifications,
    unreadCount,
    settings,
    isLoading,
    isOpen,
    setIsOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    handleNotificationAction,
    requestNotificationPermission,
    updateSettings,
    getNotificationsByType,
    getUnreadNotifications,
    getNotificationsByPriority,
    generateNotification,
    cleanExpiredNotifications
  };
};

export default useNotificationCenter;
export type { Notification, NotificationSettings };
