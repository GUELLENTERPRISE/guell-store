import React, { useState } from 'react';
import { CreditCard, Smartphone, Plus, Edit2, Trash2, Star, Check, AlertCircle, Shield } from 'lucide-react';
import { useUnifiedUser } from '@/contexts/UnifiedUserContext';
import GlassmorphismModal from '@/components/ui/glassmorphism-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PAYMENT_TYPE_COLORS } from '@/utils/statusColors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnifiedPaymentManagerProps {
  onSelectPayment?: (paymentMethod: any) => void;
  selectedPaymentId?: string;
  showAddButton?: boolean;
  maxVisible?: number;
  className?: string;
}

const UnifiedPaymentManager: React.FC<UnifiedPaymentManagerProps> = ({
  onSelectPayment,
  selectedPaymentId,
  showAddButton = true,
  maxVisible = 3,
  className = ''
}) => {
  const { state, actions } = useUnifiedUser();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'card' as 'card' | 'paypal' | 'apple_pay' | 'google_pay',
    cardInfo: {
      holderName: '',
      number: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    },
    paypalInfo: {
      email: '',
      accountName: '',
    },
    isDefault: false
  });

  const resetForm = () => {
    setFormData({
      type: 'card',
      cardInfo: {
        holderName: '',
        number: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
      },
      paypalInfo: {
        email: '',
        accountName: '',
      },
      isDefault: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let paymentData: any = {
        type: formData.type,
        isDefault: formData.isDefault,
      };

      if (formData.type === 'card') {
        paymentData.cardInfo = {
          holderName: formData.cardInfo.holderName,
          last4: formData.cardInfo.number.slice(-4),
          brand: getCardBrand(formData.cardInfo.number),
          expiryMonth: parseInt(formData.cardInfo.expiryMonth),
          expiryYear: parseInt(formData.cardInfo.expiryYear),
        };
      } else if (formData.type === 'paypal') {
        paymentData.paypalInfo = formData.paypalInfo;
      }

      if (editingPayment) {
        await actions.updatePaymentMethod(editingPayment.id, paymentData);
        setShowEditModal(false);
        setEditingPayment(null);
      } else {
        await actions.addPaymentMethod(paymentData);
        setShowAddModal(false);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const handleEdit = (paymentMethod: any) => {
    setEditingPayment(paymentMethod);
    
    if (paymentMethod.type === 'card') {
      setFormData({
        type: 'card',
        cardInfo: {
          holderName: paymentMethod.cardInfo?.holderName || '',
          number: `****-****-****-${paymentMethod.cardInfo?.last4}`,
          expiryMonth: paymentMethod.cardInfo?.expiryMonth?.toString() || '',
          expiryYear: paymentMethod.cardInfo?.expiryYear?.toString() || '',
          cvv: '',
        },
        paypalInfo: {
          email: '',
          accountName: '',
        },
        isDefault: paymentMethod.isDefault
      });
    } else if (paymentMethod.type === 'paypal') {
      setFormData({
        type: 'paypal',
        cardInfo: {
          holderName: '',
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
        },
        paypalInfo: {
          email: paymentMethod.paypalInfo?.email || '',
          accountName: paymentMethod.paypalInfo?.accountName || '',
        },
        isDefault: paymentMethod.isDefault
      });
    }
    
    setShowEditModal(true);
  };

  const handleDelete = async (paymentId: string) => {
    setDeleteTargetId(paymentId);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    
    try {
      await actions.deletePaymentMethod(deleteTargetId);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      setDeleteTargetId(null);
    }
  };

  const handleSetDefault = async (paymentId: string) => {
    try {
      await actions.setDefaultPaymentMethod(paymentId);
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const getCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    return 'unknown';
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'paypal': return <Smartphone className="w-4 h-4" />;
      case 'apple_pay': return <Smartphone className="w-4 h-4" />;
      case 'google_pay': return <Smartphone className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    return PAYMENT_TYPE_COLORS[type] || PAYMENT_TYPE_COLORS.default;
  };

  const formatCardNumber = (number: string) => {
    return number.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const visiblePaymentMethods = state.paymentMethods.slice(0, maxVisible);
  const hasMorePaymentMethods = state.paymentMethods.length > maxVisible;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Payment Methods List */}
      <div className="space-y-3">
        {visiblePaymentMethods.map((paymentMethod) => (
          <Card
            key={paymentMethod.id}
            className={`
              cursor-pointer transition-all duration-200 hover:shadow-md
              ${selectedPaymentId === paymentMethod.id ? 'ring-2 ring-orange-500 bg-orange-50' : ''}
              ${paymentMethod.isDefault ? 'border-orange-200' : ''}
            `}
            onClick={() => onSelectPayment?.(paymentMethod)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getPaymentTypeColor(paymentMethod.type)}`}>
                    {getPaymentIcon(paymentMethod.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground capitalize">
                        {paymentMethod.type.replace('_', ' ')}
                      </h3>
                      {paymentMethod.isDefault && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    
                    {paymentMethod.type === 'card' && paymentMethod.cardInfo && (
                      <div className="space-y-1">
                        <p className="text-gray-700 text-sm">
                          {paymentMethod.cardInfo.brand.toUpperCase()} **** {paymentMethod.cardInfo.last4}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Expires {paymentMethod.cardInfo.expiryMonth}/{paymentMethod.cardInfo.expiryYear}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {paymentMethod.cardInfo.holderName}
                        </p>
                      </div>
                    )}
                    
                    {paymentMethod.type === 'paypal' && paymentMethod.paypalInfo && (
                      <div className="space-y-1">
                        <p className="text-gray-700 text-sm">
                          {paymentMethod.paypalInfo.email}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {paymentMethod.paypalInfo.accountName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {!paymentMethod.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(paymentMethod.id);
                      }}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(paymentMethod);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(paymentMethod.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show More Link */}
      {hasMorePaymentMethods && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {/* Navigate to full payment management */}}
        >
          View all {state.paymentMethods.length} payment methods
        </Button>
      )}

      {/* Add Payment Method Button */}
      {showAddButton && (
        <Button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      )}

      {/* Add Payment Method Modal */}
      <GlassmorphismModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Payment Method"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Payment Type</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Credit/Debit Card
                  </div>
                </SelectItem>
                <SelectItem value="paypal">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    PayPal
                  </div>
                </SelectItem>
                <SelectItem value="apple_pay">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Apple Pay
                  </div>
                </SelectItem>
                <SelectItem value="google_pay">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Google Pay
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'card' && (
            <>
              {/* 
                ⚠️ SECURITY TODO: This form currently accepts raw card data.
                Before going to production, replace this entire card form with
                Stripe Elements (https://stripe.com/docs/stripe-js) to achieve
                PCI compliance. Never store raw card numbers in your database.
              */}
              <Alert className="border-yellow-200 bg-yellow-50 mb-4">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">
                  Payment processing integration required before launch. Card data is not being charged.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="holderName">Cardholder Name</Label>
                <Input
                  id="holderName"
                  value={formData.cardInfo.holderName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cardInfo: { ...prev.cardInfo, holderName: e.target.value }
                  }))}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="number">Card Number</Label>
                <Input
                  id="number"
                  value={formData.cardInfo.number}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cardInfo: { ...prev.cardInfo, number: formatCardNumber(e.target.value) }
                  }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Select value={formData.cardInfo.expiryMonth} onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    cardInfo: { ...prev.cardInfo, expiryMonth: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                          {(i + 1).toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Select value={formData.cardInfo.expiryYear} onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    cardInfo: { ...prev.cardInfo, expiryYear: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="YY" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={new Date().getFullYear() + i} value={(new Date().getFullYear() + i).toString()}>
                          {new Date().getFullYear() + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={formData.cardInfo.cvv}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      cardInfo: { ...prev.cardInfo, cvv: e.target.value.replace(/\D/g, '') }
                    }))}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {formData.type === 'paypal' && (
            <>
              <div>
                <Label htmlFor="paypalEmail">PayPal Email</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  value={formData.paypalInfo.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    paypalInfo: { ...prev.paypalInfo, email: e.target.value }
                  }))}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="paypalAccountName">Account Name</Label>
                <Input
                  id="paypalAccountName"
                  value={formData.paypalInfo.accountName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    paypalInfo: { ...prev.paypalInfo, accountName: e.target.value }
                  }))}
                  placeholder="John Doe"
                  required
                />
              </div>
            </>
          )}

          {(formData.type === 'apple_pay' || formData.type === 'google_pay') && (
            <Alert>
              <Smartphone className="w-4 h-4" />
              <AlertDescription>
                {formData.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} will be configured through your device's payment system when you make your first purchase.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <Label htmlFor="isDefault" className="text-sm">
              Set as default payment method
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Saving...' : 'Add Payment Method'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </GlassmorphismModal>

      {/* Edit Payment Method Modal */}
      <GlassmorphismModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPayment(null);
          resetForm();
        }}
        title="Edit Payment Method"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Similar form fields as Add Modal */}
          <div>
            <Label>Payment Type</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {getPaymentIcon(formData.type)}
                <span className="capitalize">{formData.type.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {formData.type === 'card' && (
            <>
              <div>
                <Label htmlFor="edit-number">Card Number</Label>
                <Input
                  id="edit-number"
                  placeholder={`Card ending in ${editingPayment?.cardInfo?.last4 ?? '****'}`}
                  disabled
                  className="bg-background text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Card number cannot be edited. Delete and re-add this payment method to use a different card.
                </p>
              </div>

              <div>
                <Label htmlFor="edit-holderName">Cardholder Name</Label>
                <Input
                  id="edit-holderName"
                  value={formData.cardInfo.holderName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cardInfo: { ...prev.cardInfo, holderName: e.target.value }
                  }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-expiryMonth">Expiry Month</Label>
                  <Select value={formData.cardInfo.expiryMonth} onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    cardInfo: { ...prev.cardInfo, expiryMonth: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                          {(i + 1).toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-expiryYear">Expiry Year</Label>
                  <Select value={formData.cardInfo.expiryYear} onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    cardInfo: { ...prev.cardInfo, expiryYear: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={new Date().getFullYear() + i} value={(new Date().getFullYear() + i).toString()}>
                          {new Date().getFullYear() + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {formData.type === 'paypal' && (
            <>
              <div>
                <Label htmlFor="edit-paypalEmail">PayPal Email</Label>
                <Input
                  id="edit-paypalEmail"
                  type="email"
                  value={formData.paypalInfo.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    paypalInfo: { ...prev.paypalInfo, email: e.target.value }
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-paypalAccountName">Account Name</Label>
                <Input
                  id="edit-paypalAccountName"
                  value={formData.paypalInfo.accountName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    paypalInfo: { ...prev.paypalInfo, accountName: e.target.value }
                  }))}
                  required
                />
              </div>
            </>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <Label htmlFor="edit-isDefault" className="text-sm">
              Set as default payment method
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Updating...' : 'Update Payment Method'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingPayment(null);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </GlassmorphismModal>

      {/* Security Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <Shield className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Your payment information is encrypted and secure. We never store your full card details.
        </AlertDescription>
      </Alert>

      {/* Error Alert */}
      {state.error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {state.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this payment method?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The payment method will be permanently removed from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Payment Method Selector Component (for checkout)
export const PaymentSelector: React.FC<{
  onPaymentSelect: (paymentMethod: any) => void;
  selectedPaymentId?: string;
  className?: string;
}> = ({ onPaymentSelect, selectedPaymentId, className = '' }) => {
  const { state } = useUnifiedUser();

  if (state.paymentMethods.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No payment methods saved</h3>
        <p className="text-muted-foreground mb-4">Add a payment method to get started</p>
        <UnifiedPaymentManager showAddButton={true} maxVisible={0} />
      </div>
    );
  }

  return (
    <UnifiedPaymentManager
      onSelectPayment={onPaymentSelect}
      selectedPaymentId={selectedPaymentId}
      showAddButton={true}
      maxVisible={5}
      className={className}
    />
  );
};

export default UnifiedPaymentManager;
