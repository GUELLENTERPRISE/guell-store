import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChefHat, Heart, Clock, MapPin, Star, Award } from "lucide-react";
import { Merchant } from "@/types/food";

interface ChefStoryProps {
  merchant: Merchant;
}

const ChefStory: React.FC<ChefStoryProps> = ({ merchant }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <ChefHat className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Story of the Chef
          <Badge className="ml-2 bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
            GÜELL Exclusive
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-start gap-6">
          <img
            src={merchant.logo}
            alt={`${merchant.businessName} logo`}
            className="h-24 w-24 rounded-xl border-4 border-border object-cover"
          />

          <div className="flex-1">
            <h3 className="mb-2 text-2xl font-bold text-foreground">
              {merchant.businessName}
            </h3>

            <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
                <span className="font-medium text-foreground">{merchant.rating}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{merchant.deliveryTime}</span>
              </div>

              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{merchant.deliveryRadius} miles</span>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              {merchant.verified && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300">
                  ✓ Verified Partner
                </Badge>
              )}

              {merchant.cuisineType.map((cuisine) => (
                <Badge key={cuisine} variant="outline" className="text-xs">
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="mb-4 text-lg font-semibold text-foreground">Our Journey</h4>

          {merchant.story ? (
            <div className="max-w-none">
              <p className="text-base leading-relaxed text-muted-foreground">
                {merchant.story}
              </p>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <ChefHat className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium text-foreground">Coming Soon</p>
              <p className="text-sm">
                The chef is preparing their story to share with you. Check back
                soon for their culinary journey!
              </p>
            </div>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-orange-50 p-4 text-center dark:bg-orange-950/30">
            <Award className="mx-auto mb-2 h-8 w-8 text-orange-600 dark:text-orange-400" />
            <h5 className="font-semibold text-orange-800 dark:text-orange-300">
              Family Recipe
            </h5>
            <p className="text-sm text-orange-700 dark:text-orange-200/80">
              Passed down through generations
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-950/30">
            <Heart className="mx-auto mb-2 h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h5 className="font-semibold text-blue-800 dark:text-blue-300">
              Made with Love
            </h5>
            <p className="text-sm text-blue-700 dark:text-blue-200/80">
              Each dish prepared with care
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/30">
            <Clock className="mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400" />
            <h5 className="font-semibold text-green-800 dark:text-green-300">
              Fresh Daily
            </h5>
            <p className="text-sm text-green-700 dark:text-green-200/80">
              Ingredients sourced locally
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-orange-100 to-red-100 p-6 text-center dark:from-orange-950/40 dark:to-red-950/30">
          <h4 className="mb-2 text-lg font-bold text-foreground">
            Taste the Difference
          </h4>
          <p className="mb-4 text-muted-foreground">
            Every dish tells a story of tradition, passion, and flavor. We're
            honored to be part of your dining experience.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Badge className="bg-orange-600 px-4 py-2 text-white dark:bg-orange-500">
              Since {new Date().getFullYear() - 30} years
            </Badge>

            <Badge
              variant="outline"
              className="border-orange-600 px-4 py-2 text-orange-700 dark:border-orange-400 dark:text-orange-300"
            >
              {merchant.cuisineType[0]} Cuisine
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChefStory;