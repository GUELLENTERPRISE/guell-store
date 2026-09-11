import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ChevronDown } from "lucide-react";

const DeliveryAddressSelector = () => {
  const [currentAddress, setCurrentAddress] = useState("123 Main Street, Downtown");
  const [estimatedTime, setEstimatedTime] = useState("25-35 min");

  const addresses = [
    { id: 1, address: "123 Main Street, Downtown", time: "25-35 min" },
    { id: 2, address: "456 Oak Avenue, Midtown", time: "30-40 min" },
    { id: 3, address: "789 Pine Street, Uptown", time: "20-30 min" },
  ];

  return (
    <div className="flex items-center gap-3 bg-card rounded-full px-4 py-2 shadow-md border border-gray-200 min-w-[300px]">
      <MapPin className="w-4 h-4 text-orange-600" />
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{currentAddress}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{estimatedTime}</span>
        </div>
      </div>
      <ChevronDown className="w-4 h-4 text-muted-foreground" />
    </div>
  );
};

export default DeliveryAddressSelector;
