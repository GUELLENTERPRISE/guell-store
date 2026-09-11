import React, { useState, useEffect } from 'react';
import { Check, Package, Truck, Clock, MapPin, ChefHat, Flame } from 'lucide-react';

interface OrderStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'in-progress' | 'completed';
  timestamp?: Date;
}

interface InteractiveProgressBarProps {
  steps: OrderStep[];
  currentStep: string;
  showDeliveryPerson?: boolean;
  className?: string;
}

const InteractiveProgressBar: React.FC<InteractiveProgressBarProps> = ({
  steps,
  currentStep,
  showDeliveryPerson = true,
  className = ''
}) => {
  const [animatedStep, setAnimatedStep] = useState(currentStep);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentStep !== animatedStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setAnimatedStep(currentStep);
        setIsAnimating(false);
      }, 300);
    }
  }, [currentStep, animatedStep]);

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const getStepStatus = (stepId: string) => {
    const currentIndex = getCurrentStepIndex();
    const stepIndex = steps.findIndex(step => step.id === stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'in-progress';
    return 'pending';
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getDeliveryPersonPosition = () => {
    const progress = getProgressPercentage();
    return Math.min(Math.max(progress, 0), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-orange-600 bg-orange-100 animate-pulse';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getLineColor = (index: number) => {
    const currentStepIndex = getCurrentStepIndex();
    if (index < currentStepIndex) return 'bg-green-500';
    if (index === currentStepIndex) return 'bg-orange-500 animate-pulse';
    return 'bg-gray-300';
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Progress Header */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {steps.find(s => s.id === currentStep)?.title}
        </h3>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Actualizado hace 2 minutos</span>
          <span>•</span>
          <span>{getProgressPercentage().toFixed(0)}% completado</span>
        </div>
      </div>

      {/* Progress Line with Delivery Person */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 rounded-full" />
        
        {/* Progress line */}
        <div 
          className="absolute top-8 left-8 h-1 bg-gradient-to-r from-green-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${getProgressPercentage()}%`,
            boxShadow: '0 0 10px rgba(251, 146, 60, 0.5)'
          }}
        />

        {/* Delivery Person Animation */}
        {showDeliveryPerson && (
          <div
            className="absolute top-4 transition-all duration-500 ease-out"
            style={{
              left: `calc(8px + ${getDeliveryPersonPosition()} * (calc(100% - 16px)))`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="relative">
              {/* Delivery person icon */}
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                <Truck className="w-4 h-4" />
              </div>
              
              {/* Flame trail effect */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              </div>
              
              {/* Particle effects */}
              <div className="absolute inset-0">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-orange-300 rounded-full animate-ping"
                    style={{
                      top: `${i * 4}px`,
                      left: `${i * 2}px`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isCurrent = step.id === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step Circle */}
                <div className={`
                  relative z-10 w-16 h-16 rounded-full flex items-center justify-center
                  transition-all duration-300 transform
                  ${getStatusColor(status)}
                  ${isCurrent ? 'scale-110 shadow-lg' : 'scale-100'}
                  ${isAnimating && isCurrent ? 'animate-bounce' : ''}
                `}>
                  {status === 'completed' ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    step.icon
                  )}
                  
                  {/* Pulse effect for current step */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-ping" />
                  )}
                </div>
                
                {/* Step Title */}
                <div className="mt-4 text-center max-w-[120px]">
                  <h4 className={`font-medium text-sm mb-1 ${
                    status === 'completed' ? 'text-green-700' : 
                    status === 'in-progress' ? 'text-orange-700' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-xs ${
                    status === 'completed' ? 'text-green-600' : 
                    status === 'in-progress' ? 'text-orange-600' : 'text-muted-foreground'
                  }`}>
                    {step.description}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white animate-pulse">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-orange-900">Tu pedido está en camino</h4>
            <p className="text-sm text-orange-700">
              Tiempo estimado de llegada: 25-35 minutos
            </p>
          </div>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Ver en mapa
          </button>
        </div>
      </div>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes deliveryBounce {
            0%, 100% {
              transform: translateY(0) translateX(-50%);
            }
            50% {
              transform: translateY(-10px) translateX(-50%);
            }
          }
          
          @keyframes flameFlicker {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(0.9);
            }
          }
          
          @keyframes particleFloat {
            0% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateY(-20px) scale(0);
              opacity: 0;
            }
          }
          
          .delivery-person-animation {
            animation: deliveryBounce 2s ease-in-out infinite;
          }
          
          .flame-animation {
            animation: flameFlicker 0.5s ease-in-out infinite alternate;
          }
          
          .particle-animation {
            animation: particleFloat 1s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

// Predefined order steps for common use cases
export const createOrderSteps = (): OrderStep[] => [
  {
    id: 'confirmed',
    title: 'Pedido Confirmado',
    description: 'Restaurante está preparando tu orden',
    icon: <ChefHat className="w-5 h-5" />,
    status: 'pending'
  },
  {
    id: 'preparing',
    title: 'Preparando',
    description: 'Tu comida está siendo preparada',
    icon: <Package className="w-5 h-5" />,
    status: 'pending'
  },
  {
    id: 'ready',
    title: 'Listo para Entrega',
    description: 'Tu pedido está listo y esperando al repartidor',
    icon: <Check className="w-5 h-5" />,
    status: 'pending'
  },
  {
    id: 'delivering',
    title: 'En Camino',
    description: 'Tu pedido está en camino',
    icon: <Truck className="w-5 h-5" />,
    status: 'pending'
  },
  {
    id: 'delivered',
    title: 'Entregado',
    description: '¡Disfruta tu comida!',
    icon: <MapPin className="w-5 h-5" />,
    status: 'pending'
  }
];

// Enhanced version with more animations
export const EnhancedInteractiveProgressBar: React.FC<InteractiveProgressBarProps> = ({
  steps,
  currentStep,
  showDeliveryPerson = true,
  className = ''
}) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    // Add sparkles when step changes
    const newSparkles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    
    setSparkles(newSparkles);
    
    const timeout = setTimeout(() => {
      setSparkles([]);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [currentStep]);

  return (
    <div className={`relative ${className}`}>
      {/* Sparkle effects */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${Math.random() * 500}ms`
          }}
        />
      ))}
      
      {/* Main progress bar */}
      <InteractiveProgressBar
        steps={steps}
        currentStep={currentStep}
        showDeliveryPerson={showDeliveryPerson}
        className="relative z-10"
      />
    </div>
  );
};

export default InteractiveProgressBar;
