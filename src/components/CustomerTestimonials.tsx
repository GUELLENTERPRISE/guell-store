import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'New York, NY',
    rating: 5,
    text: "I've been shopping on GÜELL for over a year now and the quality never disappoints. Fast shipping, great prices, and the customer service is outstanding. My go-to for everything!",
    initials: 'SM',
    verified: true,
  },
  {
    name: 'James K.',
    location: 'Los Angeles, CA',
    rating: 5,
    text: "The deals are unbeatable — I saved over $200 last month alone. The return process is seamless and I always feel confident making purchases here.",
    initials: 'JK',
    verified: true,
  },
  {
    name: 'Maria L.',
    location: 'Miami, FL',
    rating: 5,
    text: "What sets GÜELL apart is the curated selection. Every product feels hand-picked. The GÜELL+ membership pays for itself within the first week with free express shipping.",
    initials: 'ML',
    verified: true,
  },
  {
    name: 'David R.',
    location: 'Chicago, IL',
    rating: 4,
    text: "Incredible variety and competitive prices. I compared several platforms and GÜELL consistently comes out on top. The app experience is buttery smooth too.",
    initials: 'DR',
    verified: true,
  },
  {
    name: 'Emily T.',
    location: 'Austin, TX',
    rating: 5,
    text: "From electronics to home goods, everything arrives in perfect condition. The 30-day return policy gives me total peace of mind. Highly recommend!",
    initials: 'ET',
    verified: true,
  },
];

const CustomerTestimonials = () => {
  return (
    <section className="py-12 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Trusted by Thousands of Happy Customers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join over 50,000 satisfied shoppers who choose GÜELL for quality, value, and reliability.
          </p>
          <div className="flex items-center justify-center gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-warning text-warning" />
            ))}
            <span className="ml-2 text-sm font-medium text-foreground">4.8/5</span>
            <span className="text-sm text-muted-foreground ml-1">average rating</span>
          </div>
        </div>

        <Carousel opts={{ align: 'start', loop: true }} className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((t, i) => (
              <CarouselItem key={i} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <Card className="h-full border-border bg-card">
                  <CardContent className="p-6 flex flex-col h-full">
                    <Quote className="w-8 h-8 text-primary/20 mb-4 flex-shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed flex-1 mb-6">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                      <Avatar className="h-10 w-10 bg-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {t.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{t.name}</span>
                          {t.verified && (
                            <span className="text-xs text-success font-medium">✓ Verified</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{t.location}</span>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {[...Array(t.rating)].map((_, j) => (
                          <Star key={j} className="w-3.5 h-3.5 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default CustomerTestimonials;
