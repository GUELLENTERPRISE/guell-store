import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wifi, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => Promise<void>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRetrying: boolean;
  retryCount: number;
  lastSuccessTime: number;
}

class NetworkErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRetrying: false,
      retryCount: 0,
      lastSuccessTime: Date.now()
    };
  }

  componentDidMount() {
    this.startHealthCheck();
  }

  componentWillUnmount() {
    this.cleanup();
  }

  cleanup = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  };

  startHealthCheck = () => {
    // Check connection health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 30000);
  };

  checkConnectionHealth = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        this.setState({
          lastSuccessTime: Date.now()
        });
      }
    } catch (error) {
      // Health check failed silently - TODO: add monitoring
    }
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if it's a network-related error
    const isNetworkError = 
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.name === 'TypeError';

    if (isNetworkError) {
      return {
        hasError: true,
        error
      };
    }

    return {};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only handle network-related errors
    const isNetworkError = 
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.name === 'TypeError';

    if (isNetworkError) {
      this.setState({
        error,
        hasError: true
      });

      console.error('Network error caught:', error, errorInfo);
    }
  }

  handleRetry = async () => {
    const { retryCount } = this.state;
    
    if (retryCount >= 3) {
      return;
    }

    this.setState({ isRetrying: true });

    try {
      // Attempt to reconnect
      if (this.props.onRetry) {
        await this.props.onRetry();
      } else {
        // Default retry logic
        await this.checkConnectionHealth();
      }

      // If successful, reset error state
      this.setState({
        hasError: false,
        error: null,
        isRetrying: false,
        retryCount: retryCount + 1
      });

    } catch (error) {
      // Retry failed
      this.setState({
        isRetrying: false
      });

      // Schedule automatic retry with exponential backoff
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      this.retryTimeout = setTimeout(() => {
        this.handleRetry();
      }, delay);
    }
  };

  getConnectionStatus = () => {
    const { lastSuccessTime } = this.state;
    const timeSinceLastSuccess = Date.now() - lastSuccessTime;
    
    if (timeSinceLastSuccess < 60000) { // Less than 1 minute
      return { status: 'good', message: 'Conexión estable' };
    } else if (timeSinceLastSuccess < 300000) { // Less than 5 minutes
      return { status: 'warning', message: 'Conexión inestable' };
    } else {
      return { status: 'error', message: 'Sin conexión' };
    }
  };

  render() {
    const { hasError, error, isRetrying, retryCount } = this.state;
    const connectionStatus = this.getConnectionStatus();

    if (hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert className="border-orange-200 bg-orange-50">
            <Wifi className="h-4 w-4 text-orange-600" />
            <AlertDescription className="space-y-3">
              <div>
                <div className="font-medium text-orange-800">
                  Problema de Conexión
                </div>
                <div className="text-sm text-orange-700">
                  No podemos conectar con nuestros servidores. Por favor, verifica tu conexión a internet.
                </div>
              </div>

              {retryCount > 0 && (
                <div className="text-xs text-orange-600">
                  Intento {retryCount} de 3
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={this.handleRetry}
                  disabled={isRetrying || retryCount >= 3}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Reintentando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Reintentar
                    </>
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Recargar Página
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Show connection status indicator
    return (
      <>
        {connectionStatus.status !== 'good' && (
          <div className="fixed bottom-4 right-4 z-40">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs ${
              connectionStatus.status === 'warning' 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {connectionStatus.status === 'warning' ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <Wifi className="w-3 h-3" />
              )}
              <span>{connectionStatus.message}</span>
            </div>
          </div>
        )}
        
        {this.props.children}
      </>
    );
  }
}

// Hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleConnectionChange = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('connectionchange', handleConnectionChange);

    // Initial connection check
    handleConnectionChange();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('connectionchange', handleConnectionChange);
    };
  }, []);

  return {
    isOnline,
    connectionType,
    connectionSpeed: connectionType === '4g' ? 'fast' : connectionType === '3g' ? 'medium' : 'slow'
  };
};

export default NetworkErrorBoundary;
