import React from 'react';

interface OrderConfirmationEmailProps {
  order: {
    id: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      totalPrice: number;
      modifiers?: Array<{
        name: string;
        price: number;
      }>;
      specialInstructions?: string;
    }>;
    deliveryAddress: {
      street: string;
      number: string;
      reference?: string;
      instructions?: string;
    };
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    estimatedDeliveryTime: string;
    createdAt: Date;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({ order, customer }) => {
  const orderNumber = order.id.split('-')[1];
  
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '600px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '40px 30px',
        textAlign: 'center',
        borderBottom: '1px solid #e9ecef'
      }}>
        {/* GÜELL Logo */}
        <div style={{ 
          backgroundColor: '#ea580c', 
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          display: 'inline-block',
          marginBottom: '20px',
          fontWeight: 'bold',
          fontSize: '24px',
          letterSpacing: '1px'
        }}>
          GÜELL
        </div>
        
        <h1 style={{ 
          color: '#212529', 
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 10px 0'
        }}>
          Order Confirmed!
        </h1>
        
        <p style={{ 
          color: '#6c757d', 
          fontSize: '16px',
          margin: '0'
        }}>
          Thank you for your order. We're preparing it with care.
        </p>
        
        <div style={{
          backgroundColor: '#198754',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '20px',
          display: 'inline-block',
          marginTop: '20px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Order #{orderNumber}
        </div>
      </div>

      {/* Order Details */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '30px',
        margin: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          color: '#212529', 
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          borderBottom: '2px solid #ea580c',
          paddingBottom: '10px'
        }}>
          Order Details
        </h2>

        {/* Items */}
        <div style={{ marginBottom: '30px' }}>
          {order.items.map((item, index) => (
            <div key={index} style={{ 
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: index < order.items.length - 1 ? '1px solid #e9ecef' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ 
                    color: '#212529', 
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 5px 0'
                  }}>
                    {item.quantity} × {item.name}
                  </h3>
                  <p style={{ 
                    color: '#6c757d', 
                    fontSize: '14px',
                    margin: '0'
                  }}>
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: '#212529', 
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Modifiers */}
              {item.modifiers && item.modifiers.length > 0 && (
                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '6px',
                  padding: '10px',
                  marginTop: '10px'
                }}>
                  <div style={{ 
                    color: '#856404', 
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '5px'
                  }}>
                    MODIFICATIONS:
                  </div>
                  {item.modifiers.map((modifier, modIndex) => (
                    <div key={modIndex} style={{ 
                      color: '#856404', 
                      fontSize: '13px',
                      marginBottom: '2px'
                    }}>
                      {modifier.name}
                      {modifier.price > 0 && ` (+$${modifier.price.toFixed(2)})`}
                    </div>
                  ))}
                </div>
              )}

              {/* Special Instructions */}
              {item.specialInstructions && (
                <div style={{
                  backgroundColor: '#d1ecf1',
                  border: '1px solid #bee5eb',
                  borderRadius: '6px',
                  padding: '10px',
                  marginTop: '10px'
                }}>
                  <div style={{ 
                    color: '#0c5460', 
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '5px'
                  }}>
                    SPECIAL INSTRUCTIONS:
                  </div>
                  <div style={{ 
                    color: '#0c5460', 
                    fontSize: '13px',
                    fontStyle: 'italic'
                  }}>
                    {item.specialInstructions}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div style={{ 
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ 
            color: '#212529', 
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 15px 0'
          }}>
            Price Breakdown
          </h3>
          
          <div style={{ spaceY: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6c757d', fontSize: '14px' }}>Subtotal</span>
              <span style={{ color: '#212529', fontSize: '14px' }}>${order.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6c757d', fontSize: '14px' }}>Delivery Fee</span>
              <span style={{ color: '#212529', fontSize: '14px' }}>${order.deliveryFee.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6c757d', fontSize: '14px' }}>Tax</span>
              <span style={{ color: '#212529', fontSize: '14px' }}>${order.tax.toFixed(2)}</span>
            </div>
            <div style={{ 
              borderTop: '2px solid #212529',
              paddingTop: '8px',
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#212529', fontSize: '18px', fontWeight: 'bold' }}>Total</span>
              <span style={{ color: '#ea580c', fontSize: '20px', fontWeight: 'bold' }}>
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '30px',
        margin: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          color: '#212529', 
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          borderBottom: '2px solid #ea580c',
          paddingBottom: '10px'
        }}>
          Delivery Information
        </h2>

        <div style={{ spaceY: '15px' }}>
          <div>
            <h4 style={{ 
              color: '#6c757d', 
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '5px',
              textTransform: 'uppercase'
            }}>
              Delivery Address
            </h4>
            <p style={{ 
              color: '#212529', 
              fontSize: '16px',
              margin: '0'
            }}>
              {order.deliveryAddress.street} {order.deliveryAddress.number}
              {order.deliveryAddress.reference && `, ${order.deliveryAddress.reference}`}
            </p>
          </div>

          {order.deliveryAddress.instructions && (
            <div>
              <h4 style={{ 
                color: '#6c757d', 
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '5px',
                textTransform: 'uppercase'
              }}>
                Delivery Instructions
              </h4>
              <p style={{ 
                color: '#212529', 
                fontSize: '14px',
                margin: '0',
                fontStyle: 'italic'
              }}>
                {order.deliveryAddress.instructions}
              </p>
            </div>
          )}

          <div>
            <h4 style={{ 
              color: '#6c757d', 
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '5px',
              textTransform: 'uppercase'
            }}>
              Estimated Delivery Time
            </h4>
            <p style={{ 
              color: '#ea580c', 
              fontSize: '16px',
              fontWeight: '600',
              margin: '0'
            }}>
              {order.estimatedDeliveryTime}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Service */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '30px',
        margin: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          color: '#212529', 
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 15px 0'
        }}>
          Need Help?
        </h2>
        
        <p style={{ 
          color: '#6c757d', 
          fontSize: '14px',
          margin: '0 0 20px 0'
        }}>
          Our customer service team is here to help you with any questions about your order.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div>
            <div style={{ 
              color: '#6c757d', 
              fontSize: '12px',
              marginBottom: '5px'
            }}>
              Email
            </div>
            <div style={{ 
              color: '#ea580c', 
              fontSize: '16px',
              fontWeight: '600'
            }}>
              support@guell.com
            </div>
          </div>
          
          <div>
            <div style={{ 
              color: '#6c757d', 
              fontSize: '12px',
              marginBottom: '5px'
            }}>
              Phone
            </div>
            <div style={{ 
              color: '#ea580c', 
              fontSize: '16px',
              fontWeight: '600'
            }}>
              1-800-GÜELL
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        backgroundColor: '#212529', 
        color: '#ffffff',
        padding: '30px',
        textAlign: 'center'
      }}>
        <div style={{ 
          backgroundColor: '#ea580c', 
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '6px',
          display: 'inline-block',
          marginBottom: '15px',
          fontWeight: 'bold',
          fontSize: '20px'
        }}>
          GÜELL
        </div>
        
        <p style={{ 
          fontSize: '14px',
          margin: '0 0 10px 0'
        }}>
          Delicious food, delivered fast.
        </p>
        
        <p style={{ 
          fontSize: '12px',
          color: '#6c757d',
          margin: '0'
        }}>
          © 2024 GÜELL. All rights reserved.
        </p>
        
        <div style={{ marginTop: '15px' }}>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', margin: '0 10px', fontSize: '12px' }}>
            Privacy Policy
          </a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', margin: '0 10px', fontSize: '12px' }}>
            Terms of Service
          </a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', margin: '0 10px', fontSize: '12px' }}>
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationEmail;
