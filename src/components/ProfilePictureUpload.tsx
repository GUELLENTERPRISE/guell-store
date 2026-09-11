import { useState, useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

interface ProfilePictureUploadProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showUploadButton?: boolean;
}

const ProfilePictureUpload = ({ 
  className = '', 
  size = 'md', 
  showUploadButton = false 
}: ProfilePictureUploadProps) => {
  const { user } = useAuth();
  const { profile, uploadAvatar, removeAvatar, loading } = useUserProfile();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      await uploadAvatar(file);
      setOpen(false);
    } catch (error) {
      console.error('Upload failed:', error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
      setOpen(false);
    } catch (error) {
      console.error('Remove failed:', error);
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const AvatarComponent = (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={profile?.avatar_url || undefined} alt="Profile picture" />
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getUserInitials()}
      </AvatarFallback>
    </Avatar>
  );

  if (!showUploadButton) {
    return AvatarComponent;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative cursor-pointer group">
          {AvatarComponent}
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-4 w-4 text-white" />
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url || undefined} alt="Profile picture" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col space-y-2 w-full">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {profile?.avatar_url ? 'Change Picture' : 'Upload Picture'}
            </Button>
            
            {profile?.avatar_url && (
              <Button
                onClick={handleRemoveAvatar}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Picture
              </Button>
            )}
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureUpload;