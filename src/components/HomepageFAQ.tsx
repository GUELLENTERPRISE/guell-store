import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'How long does shipping take?',
    a: 'Standard shipping takes 3–7 business days. GÜELL+ members enjoy free express shipping (1–2 business days) on eligible orders over $25. We ship to all 50 US states and select international destinations.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a hassle-free 30-day return policy on all items. If you\'re not 100% satisfied, simply initiate a return from your Orders page — we\'ll provide a prepaid shipping label and process your full refund within 3–5 business days.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Absolutely. We use bank-level 256-bit SSL encryption to protect every transaction. We never store your full credit card details, and all payments are processed through PCI-DSS Level 1 certified partners.',
  },
  {
    q: 'What is GÜELL+ membership?',
    a: 'GÜELL+ is our premium membership program offering exclusive benefits: free express shipping, early access to deals, member-only pricing, and priority customer support — all for one low annual fee.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order ships, you\'ll receive an email with a tracking number. You can also track all your orders in real-time from the Orders tab in your account. We provide updates at every step — from warehouse to doorstep.',
  },
  {
    q: 'Do you offer price matching?',
    a: 'Yes! If you find a lower price on an identical in-stock item from an authorized retailer within 14 days of purchase, we\'ll match it. Simply contact our 24/7 support team with proof of the lower price.',
  },
];

const HomepageFAQ = () => {
  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know before you shop. Can't find your answer?{' '}
            <a href="/help" className="text-primary hover:underline font-medium">
              Contact our support team
            </a>.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default HomepageFAQ;
