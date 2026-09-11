import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Settings,
  Star,
  Tag,
  Trophy,
  Package,
  Gift,
  Info,
  ChevronDown,
  Clock
} from 'lucide-react';
import useNotificationCenter, { Notification } from '@/hooks/useNotificationCenter';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const {
    notifications,
    unreadCount,
    settings,
    isLoading,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    handleNotificationAction,
    updateSettings,
    getNotificationsByType,
    getUnreadNotifications
  } = useNotificationCenter();

  const [filter, setFilter] = useState<'all' | 'unread' | Notification['type']>('all');
  const [showSettings, setShowSettings] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
    const iconMap = {
      points: <Star className="w-4 h-4 text-yellow-500" />,
      coupon: <Tag className="w-4 h-4 text-green-500" />,
      tier: <Trophy className="w-4 h-4 text-purple-500" />,
      order: <Package className="w-4 h-4 text-blue-500" />,
      promotion: <Gift className="w-4 h-4 text-red-500" />,
      system: <Info className="w-4 h-4 text-muted-foreground" />
    };
    return iconMap[type] || <Info className="w-4 h-4 text-muted-foreground" />;
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    const colorMap = {
      low: 'border-gray-200',
      medium: 'border-orange-200',
      high: 'border-red-200'
    };
    return colorMap[priority];
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} d`;
    return timestamp.toLocaleDateString();
  };

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return getUnreadNotifications();
    return getNotificationsByType(filter as Notification['type']);
  }, [notifications, filter, getUnreadNotifications, getNotificationsByType]);

  const handleNotificationClick = (notification: Notification) => {
    handleNotificationAction(notification);
    setIsOpen(false);
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    markAsRead(notificationId);
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  if (!isOpen) {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="relative p-2"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Notificaciones</h2>
            {unreadCount > 0 && (
              <Badge className="bg-blue-500">
                {unreadCount} nuevas
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b bg-background">
            <h3 className="text-sm font-semibold mb-3">Configuración de Notificaciones</h3>
            <div className="space-y-2">
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm capitalize">
                    {key === 'email' ? 'Email' : key === 'push' ? 'Push' : key}
                  </label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleSettingChange(key as keyof typeof settings, e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              No leídas
            </Button>
            <Button
              variant={filter === 'points' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('points')}
            >
              <Star className="w-3 h-3 mr-1" />
              Puntos
            </Button>
            <Button
              variant={filter === 'coupon' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('coupon')}
            >
              <Tag className="w-3 h-3 mr-1" />
              Cupones
            </Button>
            <Button
              variant={filter === 'order' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('order')}
            >
              <Package className="w-3 h-3 mr-1" />
              Pedidos
            </Button>
          </div>
        </div>

        {/* Actions */}
        {(unreadCount > 0 || notifications.length > 0) && (
          <div className="p-4 border-b flex items-center justify-between bg-background">
            <div className="text-sm text-muted-foreground">
              {filteredNotifications.length} notificaciones
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Marcar todas como leídas
                </Button>
              )}
              
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Limpiar todas
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filter === 'unread' ? 'No tienes notificaciones no leídas' : 'No tienes notificaciones'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-background cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  } ${getPriorityColor(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-foreground' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.expiresAt && (
                        <div className="text-xs text-orange-600 mb-2">
                          Expira: {notification.expiresAt.toLocaleDateString()}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                            {notification.priority === 'high' ? 'Alta' : 
                             notification.priority === 'medium' ? 'Media' : 'Baja'}
                          </Badge>
                          
                          {!notification.read && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Nueva
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleMarkAsRead(e, notification.id)}
                              className="p-1 h-6 w-6"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
