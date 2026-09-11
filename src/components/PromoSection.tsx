
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PromoSection = () => {
  return (
    <div className="px-4 space-y-3">
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-yellow-400 text-foreground mb-2">GÜELL+ Member Deal</Badge>
              <h3 className="text-xl font-bold mb-1">Free Fast Delivery</h3>
              <p className="text-sm opacity-90">On millions of items with GÜELL+</p>
            </div>
            <div className="text-6xl opacity-30">🚚</div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
          <CardContent className="p-3">
            <h4 className="font-bold text-sm mb-1">Deal of the Day</h4>
            <p className="text-xs opacity-90">Up to 50% off</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white">
          <CardContent className="p-3">
            <h4 className="font-bold text-sm mb-1">Fresh Delivery</h4>
            <p className="text-xs opacity-90">Same-day grocery</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromoSection;
