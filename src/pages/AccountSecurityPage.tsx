import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Mail, 
  Eye, 
  EyeOff, 
  Check, 
  AlertTriangle,
  Lock,
  User,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  status: 'enabled' | 'disabled' | 'warning';
  lastUpdated: string;
  action?: string;
}

const AccountSecurityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([
    {
      id: 'password',
      title: 'Password',
      description: 'Last changed 3 months ago',
      status: 'warning',
      lastUpdated: '2023-12-15',
      action: 'Change Password'
    },
    {
      id: '2fa',
      title: 'Two-Factor Authentication',
      description: 'Extra security for your account',
      status: 'disabled',
      lastUpdated: 'Never',
      action: 'Enable 2FA'
    },
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Email address is verified',
      status: 'enabled',
      lastUpdated: '2023-06-15',
      action: 'Change Email'
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'Phone number is verified',
      status: 'enabled',
      lastUpdated: '2023-06-20',
      action: 'Change Phone'
    }
  ]);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) throw error;
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordDialog(false);
      toast.success('Password changed successfully!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to change password. Please try again.');
    }
  };

  const handle2FAEnable = () => {
    setSecuritySettings(prev => prev.map(setting => 
      setting.id === '2fa' 
        ? { ...setting, status: 'enabled' as const, lastUpdated: new Date().toISOString().split('T')[0] }
        : setting
    ));
    setShow2FADialog(false);
    toast.success('Two-factor authentication enabled!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enabled':
        return <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"><Check className="w-3 h-3 mr-1" />Enabled</Badge>;
      case 'disabled':
        return <Badge className="bg-muted dark:bg-gray-800 text-gray-800 dark:text-gray-200">Disabled</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Action Needed</Badge>;
      default:
        return null;
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Header */}
      <div className="bg-card dark:bg-gray-800 border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/?tab=account')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Account
            </Button>
            <div>
              <h1 className="text-2xl font-light text-foreground">Login & Security</h1>
              <p className="text-sm text-muted-foreground">Password and account security settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Security Overview */}
          <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground mb-2">Security Status</h3>
                  <p className="text-muted-foreground mb-4">
                    Your account security is moderate. We recommend enabling two-factor authentication 
                    and updating your password for better protection.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Email verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Phone verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-gray-700">Password needs update</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-light text-foreground dark:text-gray-100">Security Settings</CardTitle>
              <CardDescription className="text-sm">Manage your account security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {securitySettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      {setting.id === 'password' && <Key className="w-5 h-5 text-muted-foreground" />}
                      {setting.id === '2fa' && <Smartphone className="w-5 h-5 text-muted-foreground" />}
                      {setting.id === 'email' && <Mail className="w-5 h-5 text-muted-foreground" />}
                      {setting.id === 'phone' && <Smartphone className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{setting.title}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Updated: {setting.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(setting.status)}
                    {setting.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (setting.id === 'password') setShowPasswordDialog(true);
                          if (setting.id === '2fa') setShow2FADialog(true);
                        }}
                        className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-background dark:hover:bg-gray-700"
                      >
                        {setting.action}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-light text-foreground dark:text-gray-100">Recent Activity</CardTitle>
              <CardDescription className="text-sm">Recent login attempts and account changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Login successful', location: 'New York, NY', time: '2 hours ago', device: 'Chrome on Windows' },
                  { action: 'Password changed', location: 'New York, NY', time: '3 months ago', device: 'Chrome on Windows' },
                  { action: 'Email verification', location: 'New York, NY', time: '9 months ago', device: 'Chrome on Windows' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">{activity.device}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-foreground">{activity.location}</div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-light">Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="border-gray-200 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="border-gray-200 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="border-gray-200 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-background"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              >
                Change Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enable 2FA Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-light">Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Add an extra layer of security to your account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-6">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">Enable 2FA</h3>
              <p className="text-muted-foreground mb-4">
                We'll send a verification code to your phone each time you sign in
              </p>
              <div className="bg-background p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Verification code will be sent to:</div>
                <div className="font-medium text-foreground">
                  {user?.phone ?? user?.user_metadata?.phone ?? 'No phone number on file. Please add one in your profile.'}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShow2FADialog(false)}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-background"
              >
                Cancel
              </Button>
              <Button
                onClick={handle2FAEnable}
                className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              >
                Enable 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountSecurityPage;
