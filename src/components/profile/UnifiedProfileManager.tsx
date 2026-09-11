import React, { useState, useRef } from 'react';
import { User, Camera, Edit2, Save, X, Trophy, Star, Settings, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { useUnifiedUser } from '@/contexts/UnifiedUserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAudioUX, useAudioUXSimple } from '@/utils/audio-ux';
import useLoyaltySystem from '@/hooks/useLoyaltySystem';
import GlassmorphismModal from '@/components/ui/glassmorphism-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

interface UnifiedProfileManagerProps {
  className?: string;
}

const UnifiedProfileManager: React.FC<UnifiedProfileManagerProps> = ({ className = '' }) => {
  const { state, actions } = useUnifiedUser();
  const { isDark } = useTheme();
  const { volume, setVolume, isMuted, toggleMute, playSound } = useAudioUX();
  const { points, tier } = useLoyaltySystem();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say' as 'male' | 'female' | 'other' | 'prefer_not_to_say',
    bio: '',
    preferences: {
      newsletter: false,
      smsNotifications: false,
      emailNotifications: false,
      pushNotifications: false,
      marketingEmails: false,
      darkMode: false,
      audioMuted: false,
      audioVolume: 0.3
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (state.profile) {
      setFormData({
        firstName: state.profile.firstName,
        lastName: state.profile.lastName,
        phoneNumber: state.profile.phoneNumber || '',
        dateOfBirth: state.profile.dateOfBirth ? state.profile.dateOfBirth.toISOString().split('T')[0] : '',
        gender: state.profile.gender || 'prefer_not_to_say',
        bio: state.profile.bio || '',
        preferences: {
          newsletter: state.profile.preferences.newsletter,
          smsNotifications: state.profile.preferences.smsNotifications,
          emailNotifications: state.profile.preferences.emailNotifications,
          pushNotifications: state.profile.preferences.pushNotifications,
          marketingEmails: state.profile.preferences.marketingEmails,
          darkMode: isDark,
          audioMuted: isMuted,
          audioVolume: volume
        }
      });
    }
  }, [state.profile, isDark, isMuted, volume]);

  const handleSave = async () => {
    try {
      await actions.updateProfile({
        ...formData,
        preferences: {
          ...formData.preferences,
          audioMuted: isMuted,
          audioVolume: volume,
          newsletter: formData.preferences.newsletter,
          smsNotifications: formData.preferences.smsNotifications,
          emailNotifications: formData.preferences.emailNotifications,
          pushNotifications: formData.preferences.pushNotifications,
          marketingEmails: formData.preferences.marketingEmails,
          darkMode: formData.preferences.darkMode
        }
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a service
      const reader = new FileReader();
      reader.onloadend = () => {
        // Mock avatar update
        actions.updateProfile({
          avatar: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
    setShowAvatarModal(false);
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    console.log('Dark mode toggle handled by ThemeProvider');
  };

  const handleAudioToggle = (muted: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        audioMuted: muted
      }
    }));
    if (muted !== getIsMuted()) {
      toggleMute();
    }
  };

  const handleVolumeChange = (volume: number) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        audioVolume: volume
      }
    }));
    setVolume(volume);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getTierColor = (tierName: string) => {
    switch (tierName?.toLowerCase()) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver': return 'bg-muted text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  if (!state.profile) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Loading profile...</h3>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={state.profile.avatar} alt={state.profile.firstName} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xl font-bold">
                  {getInitials(state.profile.firstName, state.profile.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600"
                onClick={() => setShowAvatarModal(true)}
              >
                <Camera className="w-4 h-4 text-white" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {state.profile.firstName} {state.profile.lastName}
                </h1>
                
                {/* Loyalty Tier Badge */}
                {tier && (
                  <Badge className={getTierColor(tier.name)}>
                    <Trophy className="w-3 h-3 mr-1" />
                    {tier.name}
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-2">{state.profile.email}</p>
              
              {state.profile.bio && (
                <p className="text-gray-700 text-sm italic">"{state.profile.bio}"</p>
              )}
              
              {/* Loyalty Points */}
              {points && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-800 font-semibold">{points.current} points</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {points.pointsToNextTier > 0 && `${points.pointsToNextTier} to ${tier?.nextTier?.name}`}
                  </span>
                </div>
              )}
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Edit Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value: any) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                disabled={state.isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {state.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Communication Preferences */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Communication</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newsletter">Newsletter</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly updates and offers</p>
                </div>
                <Switch
                  id="newsletter"
                  checked={formData.preferences.newsletter}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, newsletter: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Order updates and promotions</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={formData.preferences.emailNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, emailNotifications: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Delivery updates via text</p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={formData.preferences.smsNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, smsNotifications: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser notifications</p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={formData.preferences.pushNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, pushNotifications: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketingEmails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Special offers and recommendations</p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={formData.preferences.marketingEmails}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, marketingEmails: checked }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Cross-Platform Preferences */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Cross-Platform Settings</h3>
            <div className="space-y-3">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Applies to both Food and Store</p>
                  </div>
                </div>
                <Switch
                  checked={formData.preferences.darkMode}
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>

              {/* Audio UX */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {formData.preferences.audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <Label>Audio Feedback</Label>
                    <p className="text-sm text-muted-foreground">Sounds for interactions</p>
                  </div>
                </div>
                <Switch
                  checked={!formData.preferences.audioMuted}
                  onCheckedChange={(checked) => handleAudioToggle(!checked)}
                />
              </div>

              {/* Audio Volume */}
              {!formData.preferences.audioMuted && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Audio Volume</Label>
                    <span className="text-sm text-muted-foreground">{Math.round(formData.preferences.audioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.preferences.audioVolume * 100}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value) / 100)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #f97316 ${formData.preferences.audioVolume * 100}%, #e5e7eb ${formData.preferences.audioVolume * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => playSound('button-click')}
                    className="w-full"
                  >
                    Test Sound
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Upload Modal */}
      <GlassmorphismModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Update Profile Picture"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={state.profile.avatar} alt={state.profile.firstName} />
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-2xl font-bold">
                {getInitials(state.profile.firstName, state.profile.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <p className="text-muted-foreground mb-4">
              Upload a new profile picture
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <div className="flex gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Choose Photo
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowAvatarModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Supported formats: JPG, PNG, GIF. Max size: 5MB
          </p>
        </div>
      </GlassmorphismModal>
    </div>
  );
};

export default UnifiedProfileManager;
