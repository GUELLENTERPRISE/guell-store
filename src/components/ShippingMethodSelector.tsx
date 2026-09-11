
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { ShippingMethod } from '@/hooks/useShippingMethods';

interface ShippingMethodSelectorProps {
  shippingMethods: ShippingMethod[];
  selectedMethod: string;
  onMethodSelect: (methodId: string) => void;
}

const ShippingMethodSelector = ({ 
  shippingMethods, 
  selectedMethod, 
  onMethodSelect 
}: ShippingMethodSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Shipping Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {shippingMethods.map((method) => (
            <div key={method.id} className="border rounded-lg p-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => onMethodSelect(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1 flex justify-between items-start">
                  <div>
                    <div className="font-medium">{method.name}</div>
                    {method.description && (
                      <div className="text-sm text-muted-foreground">{method.description}</div>
                    )}
                    {method.estimated_days_min && method.estimated_days_max && (
                      <div className="text-sm text-muted-foreground">
                        {method.estimated_days_min === method.estimated_days_max 
                          ? `${method.estimated_days_min} day${method.estimated_days_min > 1 ? 's' : ''}`
                          : `${method.estimated_days_min}-${method.estimated_days_max} days`
                        }
                      </div>
                    )}
                  </div>
                  <div className="font-medium">
                    {method.base_cost === 0 ? 'FREE' : `$${method.base_cost.toFixed(2)}`}
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingMethodSelector;
