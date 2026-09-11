import { ShieldCheck, Truck, RotateCcw, Clock } from 'lucide-react';

const guarantees = [
  {
    icon: ShieldCheck,
    title: '100% Money-Back Guarantee',
    description: 'Not satisfied? Get a full refund — no questions asked within 30 days.',
  },
  {
    icon: Truck,
    title: 'Free Shipping on $25+',
    description: 'Every order over $25 ships free. GÜELL+ members get free express delivery.',
  },
  {
    icon: RotateCcw,
    title: 'Hassle-Free Returns',
    description: 'Easy 30-day returns with prepaid labels. We make it simple.',
  },
  {
    icon: Clock,
    title: '24/7 Customer Support',
    description: 'Our team is always available via chat, email, or phone.',
  },
];

const GuaranteeBanner = () => {
  return (
    <section className="py-12 px-4 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Shop with Confidence
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Your satisfaction is our top priority. Every purchase is backed by our iron-clad guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {guarantees.map((g, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <g.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm">
                {g.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {g.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuaranteeBanner;
