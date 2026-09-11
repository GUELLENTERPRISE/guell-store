import { Card, CardContent } from "@/components/ui/card";
import { Truck, Star, Shield, Award, Users } from "lucide-react";

const FoodTrustBadges = () => {
  const badges = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "30-45 min average",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-950/40",
    },
    {
      icon: Shield,
      title: "Food Safety",
      description: "Restaurant certified",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-950/40",
    },
    {
      icon: Star,
      title: "4.8★ Rating",
      description: "Customer satisfaction",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-950/40",
    },
    {
      icon: Users,
      title: "10,000+ Orders",
      description: "Happy customers",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-950/40",
    },
    {
      icon: Award,
      title: "Best Choice 2024",
      description: "Food delivery award",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-950/40",
    },
  ];

  return (
    <div className="mb-12">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Why Choose GÜELL Food?
        </h2>
        <p className="text-muted-foreground">
          Trusted by thousands of hungry customers daily
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
        {badges.map((badge, index) => (
          <Card
            key={index}
            className="text-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <CardContent className="p-6">
              <div
                className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full ${badge.bgColor}`}
              >
                <badge.icon className={`h-8 w-8 ${badge.color}`} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {badge.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {badge.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FoodTrustBadges;