import { useState } from 'react';
import { ArrowLeft, Search, Package, CreditCard, Truck, MessageCircle, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import TopHeader from '@/components/TopHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { useCart } from '@/hooks/useCart';
import SEOHead from '@/components/SEOHead';

const HelpCenterPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { cart } = useCart();
  const cartCount = cart?.length || 0;

  const categories = [
    {
      icon: Package,
      title: 'Orders & Shipping',
      description: 'Track orders, shipping info',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: CreditCard,
      title: 'Payments & Pricing',
      description: 'Payment methods, refunds',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Truck,
      title: 'Returns & Refunds',
      description: 'Return policy, replacements',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Shield,
      title: 'Account & Security',
      description: 'Account settings, privacy',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: FileText,
      title: 'Product Information',
      description: 'Product details, availability',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      icon: MessageCircle,
      title: 'Contact Support',
      description: 'Chat with us, email support',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'You can track your order by going to "Your Orders" in your account. Click on the order you want to track and you\'ll see real-time tracking information.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Some items like personalized products may not be eligible for return.',
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business days delivery. Prime members get free 2-day shipping on eligible items.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, PayPal, and GÜELL gift cards.',
    },
    {
      question: 'How do I cancel an order?',
      answer: 'You can cancel an order within 1 hour of placing it by going to "Your Orders" and clicking the "Cancel Items" button. After 1 hour, the order may have already been processed.',
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers.',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Help Center - GÜELL"
        description="Get help with your GÜELL orders, shipping, returns, and more. Find answers to frequently asked questions."
      />
      <TopHeader cartCount={cartCount} />
      
      <div className="flex-1 pb-20">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-12">
          <div className="max-w-4xl mx-auto px-4">
            <Button 
              variant="ghost" 
              className="mb-4 text-primary-foreground hover:bg-card/10" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-primary-foreground/80 mb-6">
              Search our help center or browse categories below
            </p>
            
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="pl-10 bg-card text-foreground h-12"
              />
            </div>
          </div>
        </div>

        {/* Help categories */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* FAQs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact support */}
          <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="py-8">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                <p className="text-muted-foreground mb-4">
                  Our customer support team is available 24/7 to assist you
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Live Chat
                  </Button>
                  <Button variant="outline">
                    Email Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation 
        activeTab="support" 
        setActiveTab={() => {}} 
        cartCount={cartCount} 
      />
    </div>
  );
};

export default HelpCenterPage;
