import { Shield, Lock, RefreshCw, Headphones } from 'lucide-react';

const TrustBadges = () => {
  const badges = [
    {
      icon: Lock,
      title: 'Secure Payment',
      description: '100% Protected',
    },
    {
      icon: Shield,
      title: 'Buyer Protection',
      description: 'Full Refund',
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '30-Day Return',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Dedicated Help',
    },
  ];

  return (
    <div className="bg-card border border-border py-8 px-4 my-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="bg-foreground p-4 rounded-full shadow-md mb-3">
  <badge.icon className="w-8 h-8 text-background" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">
                {badge.title}
              </h3>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
