import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const FoodTestimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      rating: 5,
      comment:
        "Best food delivery app I've ever used! The food arrives hot and fresh every time. Love the real-time tracking!",
      food: "Margherita Pizza",
      time: "2 days ago",
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "MC",
      rating: 5,
      comment:
        "The variety of restaurants is amazing. From local gems to popular chains, GÜELL Food has it all. The modifier system is perfect for customizing orders.",
      food: "Custom Burger",
      time: "1 week ago",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "ER",
      rating: 4,
      comment:
        "As someone with dietary restrictions, I appreciate how clearly allergens are listed and how easy it is to customize my orders. Game changer!",
      food: "Veggie Sushi Roll",
      time: "2 weeks ago",
    },
    {
      id: 4,
      name: "David Kim",
      avatar: "DK",
      rating: 5,
      comment:
        "Lightning fast delivery and customer service is top-notch. Had an issue with an order once and they resolved it within minutes.",
      food: "Korean BBQ",
      time: "3 weeks ago",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400 dark:fill-yellow-300 dark:text-yellow-300"
            : "text-muted-foreground/40"
        }`}
      />
    ));
  };

  return (
    <div className="mb-12">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          What Our Customers Say
        </h2>
        <p className="text-muted-foreground">
          Real reviews from hungry food lovers like you
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.id}
            className="transition-all duration-300 hover:shadow-lg"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-lg font-bold text-white dark:from-orange-500 dark:to-red-600">
                  {testimonial.avatar}
                </div>

                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h3>
                    <div className="flex items-center">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Quote className="h-4 w-4" />
                    <span>{testimonial.time}</span>
                  </div>
                </div>
              </div>

              <blockquote className="mb-4 italic leading-relaxed text-muted-foreground">
                "{testimonial.comment}"
              </blockquote>

              <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                <span>Ordered:</span>
                <span className="rounded bg-orange-100 px-2 py-1 dark:bg-orange-950/40 dark:text-orange-300">
                  {testimonial.food}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="mx-auto max-w-md rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white dark:from-orange-600 dark:to-red-600">
          <Quote className="mx-auto mb-3 h-8 w-8" />
          <h3 className="mb-2 text-xl font-bold">Join 10,000+ Happy Customers</h3>
          <p className="mb-4 text-white/90">
            Experience the best food delivery service today!
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="mb-1 text-3xl font-bold">4.8★</div>
              <div className="text-sm text-white/80">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-3xl font-bold">30min</div>
              <div className="text-sm text-white/80">Avg Delivery</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-3xl font-bold">98%</div>
              <div className="text-sm text-white/80">On-Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodTestimonials;