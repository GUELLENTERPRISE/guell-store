import React, { useState, useRef } from 'react';
import { Gift, Heart, Star, Calendar, MapPin, DollarSign, Share2, Download, QrCode, Utensils, Coffee } from 'lucide-react';
import { useAudioUX } from '@/utils/audio-ux';

interface GiftTicketData {
  id: string;
  fromName: string;
  toName: string;
  message: string;
  amount: number;
  restaurant?: string;
  deliveryAddress?: string;
  deliveryDate?: Date;
  occasion?: string;
  theme: 'birthday' | 'thank-you' | 'celebration' | 'just-because' | 'custom';
}

interface DigitalGiftTicketProps {
  giftData: GiftTicketData;
  isVisible: boolean;
  onClose?: () => void;
  onSend?: (giftData: GiftTicketData) => void;
  isPreview?: boolean;
}

const DigitalGiftTicket: React.FC<DigitalGiftTicketProps> = ({
  giftData,
  isVisible,
  onClose,
  onSend,
  isPreview = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const { playSound } = useAudioUX();

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      playSound('gift-sent', 0.4);
      
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [isVisible, playSound]);

  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case 'birthday':
        return 'from-pink-400 via-purple-400 to-indigo-400';
      case 'thank-you':
        return 'from-green-400 via-emerald-400 to-teal-400';
      case 'celebration':
        return 'from-orange-400 via-red-400 to-pink-400';
      case 'just-because':
        return 'from-blue-400 via-indigo-400 to-purple-400';
      default:
        return 'from-orange-400 via-yellow-400 to-orange-500';
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'birthday':
        return <Star className="w-6 h-6" />;
      case 'thank-you':
        return <Heart className="w-6 h-6" />;
      case 'celebration':
        return <Gift className="w-6 h-6" />;
      case 'just-because':
        return <Coffee className="w-6 h-6" />;
      default:
        return <Utensils className="w-6 h-6" />;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `A gift from ${giftData.fromName}!`,
          text: `${giftData.fromName} sent you a $${giftData.amount} GÜELL gift card!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const giftMessage = `${giftData.fromName} sent you a $${giftData.amount} GÜELL gift card! Redeem it at guell.com/gift/${giftData.id}`;
      await navigator.clipboard.writeText(giftMessage);
      alert('Gift details copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (ticketRef.current) {
      // Create a canvas from the ticket
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = 800;
        canvas.height = 600;
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(0.5, '#fbbf24');
        gradient.addColorStop(1, '#f97316');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
        
        // Draw gift card content
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.fillText('GÜELL Gift Card', 50, 100);
        
        ctx.font = '24px Arial';
        ctx.fillText(`$${giftData.amount}`, 50, 150);
        
        ctx.font = '18px Arial';
        ctx.fillText(`From: ${giftData.fromName}`, 50, 200);
        ctx.fillText(`To: ${giftData.toName}`, 50, 230);
        
        ctx.font = '16px Arial';
        ctx.fillText(giftData.message, 50, 280);
        
        if (giftData.restaurant) {
          ctx.fillText(`Restaurant: ${giftData.restaurant}`, 50, 320);
        }
        
        ctx.font = '14px Arial';
        ctx.fillText(`Gift ID: ${giftData.id}`, 50, 550);
        
        // Download the image
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `guell-gift-${giftData.id}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    }
  };

  const handleSendGift = () => {
    playSound('checkout-success', 0.5);
    onSend?.(giftData);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-2xl w-full">
        {/* Glassmorphism Gift Ticket */}
        <div
          ref={ticketRef}
          className={`
            relative bg-card bg-opacity-10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl
            border border-white border-opacity-20 overflow-hidden
            transform transition-all duration-500
            ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          `}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: `linear-gradient(135deg, 
              rgba(255, 255, 255, 0.1) 0%, 
              rgba(249, 115, 22, 0.1) 50%, 
              rgba(251, 191, 36, 0.1) 100%)`
          }}
        >
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Glass Reflection */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
            }}
          />

          {/* Gift Ticket Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getThemeGradient(giftData.theme)} text-white mb-4 shadow-lg`}>
                {getThemeIcon(giftData.theme)}
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                GÜELL Gift Card
              </h1>
              
              <div className="flex items-center justify-center gap-2 text-white">
                <DollarSign className="w-6 h-6" />
                <span className="text-4xl font-bold">{giftData.amount}</span>
              </div>
            </div>

            {/* Gift Details */}
            <div className="bg-card bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white border-opacity-30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* From/To */}
                <div className="space-y-4">
                  <div>
                    <p className="text-white text-sm opacity-80 mb-1">From</p>
                    <p className="text-white font-semibold text-lg">{giftData.fromName}</p>
                  </div>
                  
                  <div>
                    <p className="text-white text-sm opacity-80 mb-1">To</p>
                    <p className="text-white font-semibold text-lg">{giftData.toName}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  {giftData.restaurant && (
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-white opacity-80" />
                      <div>
                        <p className="text-white text-sm opacity-80">Restaurant</p>
                        <p className="text-white font-semibold">{giftData.restaurant}</p>
                      </div>
                    </div>
                  )}
                  
                  {giftData.deliveryDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white opacity-80" />
                      <div>
                        <p className="text-white text-sm opacity-80">Delivery Date</p>
                        <p className="text-white font-semibold">
                          {giftData.deliveryDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              {giftData.message && (
                <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                  <p className="text-white text-sm opacity-80 mb-2">Message</p>
                  <p className="text-white italic">"{giftData.message}"</p>
                </div>
              )}
            </div>

            {/* QR Code Section */}
            <div className="text-center">
              <button
                onClick={() => setShowQrCode(!showQrCode)}
                className="text-white opacity-80 hover:opacity-100 transition-opacity text-sm underline"
              >
                {showQrCode ? 'Hide' : 'Show'} QR Code
              </button>
              
              {showQrCode && (
                <div className="mt-4 bg-card rounded-lg p-4 inline-block">
                  <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Gift ID: {giftData.id}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isPreview && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleSendGift}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Gift className="w-4 h-4 mr-2 inline" />
                  Send Gift
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex-1 bg-card bg-opacity-20 backdrop-blur-lg text-white py-3 px-6 rounded-xl font-semibold hover:bg-opacity-30 transition-all border border-white border-opacity-30"
                >
                  <Share2 className="w-4 h-4 mr-2 inline" />
                  Share
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-card bg-opacity-20 backdrop-blur-lg text-white py-3 px-6 rounded-xl font-semibold hover:bg-opacity-30 transition-all border border-white border-opacity-30"
                >
                  <Download className="w-4 h-4 mr-2 inline" />
                  Download
                </button>
              </div>
            )}

            {/* Close Button */}
            {onClose && !isPreview && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-card bg-opacity-20 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all border border-white border-opacity-30"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full opacity-50 blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-400 rounded-full opacity-50 blur-xl" />
      </div>
    </div>
  );
};

// Gift Creation Form
export const GiftCreationForm: React.FC<{
  onSubmit: (giftData: GiftTicketData) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fromName: '',
    toName: '',
    message: '',
    amount: 25,
    restaurant: '',
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    occasion: 'just-because' as const,
    theme: 'just-because' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const giftData: GiftTicketData = {
      id: `gift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...formData
    };
    
    onSubmit(giftData);
  };

  const themes = [
    { id: 'birthday', name: 'Birthday', icon: 'cake' },
    { id: 'thank-you', name: 'Thank You', icon: 'heart' },
    { id: 'celebration', name: 'Celebration', icon: 'party' },
    { id: 'just-because', name: 'Just Because', icon: 'gift' }
  ];

  const amounts = [25, 50, 75, 100, 150, 200];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6">Send a Gift Card</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From/To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="text"
                required
                value={formData.fromName}
                onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="text"
                required
                value={formData.toName}
                onChange={(e) => setFormData(prev => ({ ...prev, toName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Recipient name"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gift Amount</label>
            <div className="grid grid-cols-3 gap-2">
              {amounts.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, amount }))}
                  className={`py-2 px-3 rounded-lg border-2 transition-all ${
                    formData.amount === amount
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, theme: theme.id as any }))}
                  className={`py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                    formData.theme === theme.id
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
              placeholder="Add a personal message..."
            />
          </div>

          {/* Restaurant (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant (Optional)</label>
            <input
              type="text"
              value={formData.restaurant}
              onChange={(e) => setFormData(prev => ({ ...prev, restaurant: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Specific restaurant or leave blank for flexibility"
            />
          </div>

          {/* Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
            <input
              type="date"
              required
              value={formData.deliveryDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: new Date(e.target.value) }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Preview Gift Card
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DigitalGiftTicket;
