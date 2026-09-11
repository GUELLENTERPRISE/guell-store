
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useCheckout } from '@/hooks/useCheckout';
import { toast } from 'sonner';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment, isVerifyingPayment } = useCheckout();

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (sessionId && orderId) {
      verifyPayment({ sessionId, orderId });
    } else {
      toast.error('Missing payment information');
      navigate('/');
    }
  }, [sessionId, orderId, verifyPayment, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            {isVerifyingPayment ? 'Processing...' : 'Order Confirmed!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isVerifyingPayment ? (
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Verifying your payment...</p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground">
                Thank you for your purchase! Your order has been confirmed and is being processed.
              </p>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Confirmation Email Sent!</span>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  We've sent an order confirmation with all details to your email address.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">What's next?</span>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  You'll receive tracking information once your order ships.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Button onClick={() => navigate('/orders')} className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  View My Orders
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSuccessPage;
