import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug,
  Wifi,
  Database,
  Image as ImageIcon,
  Clock
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'network' | 'database' | 'image' | 'render' | 'unknown';
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Determine error type based on error message
    let errorType: State['errorType'] = 'unknown';
    
    if (error.message.includes('fetch') || error.message.includes('network')) {
      errorType = 'network';
    } else if (error.message.includes('database') || error.message.includes('connection')) {
      errorType = 'database';
    } else if (error.message.includes('image') || error.message.includes('load')) {
      errorType = 'image';
    } else if (error.message.includes('render') || error.name === 'TypeError') {
      errorType = 'render';
    }

    return {
      hasError: true,
      error,
      errorType
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for monitoring
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service (in production)
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(error, errorInfo);
    }
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  private sendErrorToMonitoring = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to error monitoring service
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          errorInfo: {
            componentStack: errorInfo.componentStack
          },
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {
        // Silently fail if error reporting fails
      });
    } catch (e) {
      // Silently fail if error reporting fails
    }
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    // Limit retry attempts
    if (retryCount >= 3) {
      return;
    }

    // Clear previous retry timeout
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts = [];

    // Set retry timeout with exponential backoff
    const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
    const timeout = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        errorType: 'unknown',
        retryCount: prevState.retryCount + 1
      }));
    }, delay);

    this.retryTimeouts.push(timeout);
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      retryCount: 0
    });
  };

  private getErrorIcon = () => {
    switch (this.state.errorType) {
      case 'network':
        return <Wifi className="w-8 h-8 text-orange-600" />;
      case 'database':
        return <Database className="w-8 h-8 text-red-600" />;
      case 'image':
        return <ImageIcon className="w-8 h-8 text-blue-600" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-muted-foreground" />;
    }
  };

  private getErrorMessage = () => {
    const { error, errorType } = this.state;
    
    switch (errorType) {
      case 'network':
        return {
          title: 'Error de Conexión',
          description: 'No podemos conectar con nuestros servidores. Por favor, verifica tu conexión a internet.',
          action: 'Reintentar Conexión'
        };
      case 'database':
        return {
          title: 'Error en la Base de Datos',
          description: 'Estamos experimentando problemas con nuestra base de datos. Nuestro equipo ya está trabajando en solucionarlo.',
          action: 'Reintentar'
        };
      case 'image':
        return {
          title: 'Error al Cargar Imagen',
          description: 'No pudimos cargar algunas imágenes. El contenido sigue disponible.',
          action: 'Reintentar Carga'
        };
      default:
        return {
          title: 'Algo Salio Mal',
          description: error?.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
          action: 'Reintentar'
        };
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { retryCount } = this.state;
      const message = this.getErrorMessage();
      const canRetry = retryCount < 3;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {this.getErrorIcon()}
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                {message.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {message.description}
                </AlertDescription>
              </Alert>

              {retryCount > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Intento {retryCount} de 3</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {message.action}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={this.handleReset}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir al Inicio
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-gray-800">
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      Ver Detalles del Error (Desarrollo)
                    </div>
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded text-xs text-gray-700 overflow-auto max-h-40">
                    <div className="font-bold mb-2">Error:</div>
                    <pre className="whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <>
                        <div className="font-bold mt-2 mb-2">Component Stack:</div>
                        <pre className="whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {
        // Silently fail
      });
    }
  };

  return { handleError };
};

export default ErrorBoundary;
