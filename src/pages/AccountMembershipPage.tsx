import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Star, 
  Check, 
  Crown, 
  Zap, 
  Truck, 
  Gift,
  ArrowRight,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  savings?: number;
}

const AccountMembershipPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Mock user membership data
  const currentMembership = {
    tier: 'guell_plus_basic',
    status: 'active',
    startDate: '2023-06-15',
    nextBilling: '2024-06-15',
    autoRenew: true,
    savings: 127.45,
    benefitsUsed: 234,
    benefitsAvailable: 500
  };

  const membershipTiers: MembershipTier[] = [
    {
      id: 'free',
      name: 'GÜELL Free',
      price: 0,
      billing: 'monthly',
      features: [
        'Standard shipping (5-7 days)',
        'Basic customer support',
        'Order tracking',
        '30-day returns'
      ],
      isCurrent: currentMembership.tier === 'free'
    },
    {
      id: 'guell_plus_basic',
      name: 'GÜELL+ Basic',
      price: 9.99,
      billing: 'monthly',
      features: [
        'Free shipping on all orders',
        'Priority customer support',
        'Early access to deals',
        '5% member discount',
        'Order tracking',
        '30-day returns'
      ],
      isPopular: true,
      isCurrent: currentMembership.tier === 'guell_plus_basic',
      savings: 15
    },
    {
      id: 'guell_plus_premium',
      name: 'GÜELL+ Premium',
      price: 19.99,
      billing: 'monthly',
      features: [
        'Free express shipping',
        '24/7 premium support',
        'Early access to exclusive deals',
        '15% member discount',
        'Free returns',
        'Price matching guarantee',
        'Birthday rewards'
      ],
      isCurrent: currentMembership.tier === 'guell_plus_premium',
      savings: 35
    }
  ];

  const yearlyTiers: MembershipTier[] = membershipTiers.map(tier => ({
    ...tier,
    price: tier.id === 'free' ? 0 : tier.price * 12 * 0.8, // 20% discount for yearly
    billing: 'yearly' as const
  }));

  const handleUpgrade = (tierId: string) => {
    // TODO: Implement subscription upgrade logic
    toast.success(`Redirecting to upgrade ${tierId}...`);
    // navigate('/subscription/checkout?tier=' + tierId);
  };

  const handleCancelMembership = () => {
    // TODO: Implement cancellation logic
    toast.success('Membership cancellation request submitted');
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free':
        return <Users className="w-6 h-6" />;
      case 'guell_plus_basic':
        return <Shield className="w-6 h-6" />;
      case 'guell_plus_premium':
        return <Crown className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const displayTiers = billingCycle === 'yearly' ? yearlyTiers : membershipTiers;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/account')}
              className="text-white hover:bg-card/10 hover:text-foreground"
            >
              ← Back to Account
            </Button>
            <div>
              <h1 className="text-3xl font-bold">GÜELL+ Membership</h1>
              <p className="text-purple-100">Unlock exclusive benefits and save money</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Current Membership Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Current Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {membershipTiers.find(tier => tier.id === currentMembership.tier)?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Member since {currentMembership.startDate}
                    </div>
                  </div>
                  <Badge className={`${
                    currentMembership.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'
                  } text-white`}>
                    {currentMembership.status === 'active' ? 'Active' : 'Pending'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${currentMembership.savings.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{currentMembership.benefitsUsed}</div>
                    <div className="text-sm text-muted-foreground">Benefits Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{currentMembership.benefitsAvailable}</div>
                    <div className="text-sm text-muted-foreground">Benefits Available</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-sm text-muted-foreground">Next Billing Date</div>
                    <div className="font-semibold">{currentMembership.nextBilling}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoRenew"
                      checked={currentMembership.autoRenew}
                      className="rounded"
                      readOnly
                    />
                    <Label htmlFor="autoRenew">Auto-renew</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membership Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Savings This Year
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-600">${currentMembership.savings.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">From member discounts</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-600" />
                    Member Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Birthday Month</span>
                    <Badge className="bg-pink-100 text-pink-800">June</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Exclusive Access</span>
                    <Badge className="bg-purple-100 text-purple-800">3 New Deals</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Points Earned</span>
                    <Badge className="bg-blue-100 text-blue-800">1,250</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Free Shipping',
                  description: 'Free standard shipping on all orders',
                  icon: <Truck className="w-8 h-8 text-blue-600" />,
                  available: currentMembership.tier !== 'free'
                },
                {
                  title: 'Member Discounts',
                  description: `${currentMembership.tier === 'guell_plus_premium' ? '15%' : currentMembership.tier === 'guell_plus_basic' ? '5%' : '0%'} off all orders`,
                  icon: <Zap className="w-8 h-8 text-yellow-500" />,
                  available: currentMembership.tier !== 'free'
                },
                {
                  title: 'Priority Support',
                  description: 'Get faster response times',
                  icon: <Shield className="w-8 h-8 text-green-600" />,
                  available: currentMembership.tier !== 'free'
                },
                {
                  title: 'Early Access',
                  description: 'Shop deals 24 hours before everyone',
                  icon: <Clock className="w-8 h-8 text-purple-600" />,
                  available: currentMembership.tier !== 'free'
                },
                {
                  title: 'Free Returns',
                  description: 'No restocking fees on returns',
                  icon: <Gift className="w-8 h-8 text-red-600" />,
                  available: currentMembership.tier === 'guell_plus_premium'
                }
              ].map((benefit, index) => (
                <Card key={index} className={`${benefit.available ? '' : 'opacity-50'}`}>
                  <CardContent className="p-4 text-center">
                    <div className="mb-3">{benefit.icon}</div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    {benefit.available ? (
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs">Active</Badge>
                    ) : (
                      <Badge className="bg-muted dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs">Upgrade Required</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Upgrade Tab */}
          <TabsContent value="upgrade" className="space-y-6">
            {/* Billing Cycle Toggle */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Billing Cycle</div>
                    <Button
                      variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                      onClick={() => setBillingCycle('monthly')}
                      className="w-full"
                    >
                      Monthly
                    </Button>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Save 20%</div>
                    <Button
                      variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                      onClick={() => setBillingCycle('yearly')}
                      className="w-full"
                    >
                      Yearly
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membership Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayTiers.map((tier) => (
                <Card key={tier.id} className={`relative ${tier.isCurrent ? 'ring-2 ring-primary' : ''} ${tier.isPopular ? 'border-2 border-purple-600' : ''}`}>
                  {tier.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  {tier.isCurrent && (
                    <div className="absolute -top-3 right-3">
                      <Badge className="bg-green-600 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Current
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-3">
                    <div className="flex justify-center mb-3">
                      {getTierIcon(tier.id)}
                    </div>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      ${tier.price.toFixed(2)}
                      <span className="text-sm text-muted-foreground font-normal">/{tier.billing}</span>
                    </div>
                    {tier.savings && (
                      <div className="text-sm text-green-600">
                        Save ${tier.savings}/month
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleUpgrade(tier.id)}
                      className="w-full"
                      disabled={tier.isCurrent}
                      variant={tier.isCurrent ? 'outline' : 'default'}
                    >
                      {tier.isCurrent ? 'Current Plan' : 'Upgrade Now'}
                      {!tier.isCurrent && (
                        <ArrowRight className="w-4 h-4 ml-2" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Current Plan Actions */}
            {currentMembership.tier !== 'free' && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Membership</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/account/settings')}
                    className="w-full"
                  >
                    Manage Billing Settings
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelMembership}
                    className="w-full"
                  >
                    Cancel Membership
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    You can continue using member benefits until the end of your billing period
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountMembershipPage;
