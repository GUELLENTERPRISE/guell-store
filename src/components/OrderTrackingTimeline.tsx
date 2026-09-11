import React from 'react';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface OrderTrackingTimelineProps {
  orderId: string;
  trackingNumber?: string;
}

const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({ orderId, trackingNumber }) => {
  const { tracking, isLoading, getStatusIcon } = useOrderTracking(orderId);

  if (isLoading) {
    return <div className="text-muted-foreground">Loading tracking information...</div>;
  }

  if (tracking.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Package className="h-5 w-5" />
          Order Tracking
          {trackingNumber && (
            <Badge variant="secondary" className="ml-auto bg-secondary text-secondary-foreground">
              {trackingNumber}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {tracking.map((event, index) => (
            <div key={event.id} className="flex gap-4 pb-8 last:pb-0">
              {/* Timeline line */}
              {index !== tracking.length - 1 && (
                <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-border" />
              )}
              
              {/* Icon */}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                {getStatusIcon(event.status)}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold capitalize text-foreground">
                    {event.status.replace(/_/g, ' ')}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(event.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                {event.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </p>
                )}
                {event.notes && (
                  <p className="text-sm text-muted-foreground mt-1">{event.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTrackingTimeline;
