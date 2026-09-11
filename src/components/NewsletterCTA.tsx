import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Gift } from 'lucide-react';
import { toast } from 'sonner';

const NewsletterCTA = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Welcome! Check your inbox for your 15% discount code.');
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <section className="py-16 px-4 bg-primary text-primary-foreground">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-foreground/10 mb-6">
          <Gift className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-bold mb-3">
          Get 15% Off Your First Order
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
          Subscribe to our newsletter for exclusive deals, new arrivals, and insider-only discounts delivered straight to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 bg-primary-foreground text-foreground border-0 h-12"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            {isSubmitting ? 'Subscribing...' : 'Claim My 15% Off'}
          </Button>
        </form>

        <p className="text-xs text-primary-foreground/60 mt-4">
          No spam, ever. Unsubscribe anytime. By subscribing you agree to our Privacy Policy.
        </p>
      </div>
    </section>
  );
};

export default NewsletterCTA;
