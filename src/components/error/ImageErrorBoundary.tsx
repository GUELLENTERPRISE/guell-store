import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Image as ImageIcon, RefreshCw } from 'lucide-react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

class ImageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Image error:', error, errorInfo);
    this.props.onError?.(error);
  }

  handleRetry = () => {
    if (this.state.retryCount < 3) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={`flex flex-col items-center justify-center bg-muted border-2 border-dashed border-gray-300 rounded-lg ${this.props.className || ''}`}>
          <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
          <span className="text-sm text-muted-foreground mb-3">No se pudo cargar la imagen</span>
          {this.state.retryCount < 3 && (
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              <RefreshCw className="w-3 h-3" />
              Reintentar
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe Image Component
export const SafeImage: React.FC<Props> = (props) => {
  return (
    <ImageErrorBoundary {...props}>
      <img
        src={props.src}
        alt={props.alt}
        className={props.className}
        onError={(e) => {
          // Handle image load errors
          const error = new Error(`Failed to load image: ${props.src}`);
          props.onError?.(error);
        }}
      />
    </ImageErrorBoundary>
  );
};

export default ImageErrorBoundary;
