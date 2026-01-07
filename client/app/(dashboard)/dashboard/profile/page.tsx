'use client';

import { motion } from 'framer-motion';
import { User, Settings, Lock } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AvatarUploadDialog } from '@/components/shared/avatar-upload-dialog';
import { authApi } from '@/lib/api/auth';

export default function ProfilePage() {
  const { t } = useTranslation('common');
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleSaveProfile = () => {
    // API call would go here
    toast.success('Profile updated successfully!');
  };

  const handleSavePassword = async () => {
    // Validation
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authApi.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData.confirm_password,
      });
      
      toast.success('Password changed successfully! Please log in with your new password.');
      
      // Clear password fields
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      console.error('Error response:', error?.response?.data);
      
      // Handle various error formats from the backend
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error?.response?.data) {
        const data = error.response.data;
        
        // Check for field-specific errors
        if (data.old_password) {
          errorMessage = Array.isArray(data.old_password) ? data.old_password[0] : data.old_password;
        } else if (data.new_password) {
          errorMessage = Array.isArray(data.new_password) ? data.new_password[0] : data.new_password;
        } else if (data.new_password_confirm) {
          errorMessage = Array.isArray(data.new_password_confirm) ? data.new_password_confirm[0] : data.new_password_confirm;
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    try {
      // Call API to persist avatar URL
      await authApi.updateAvatar(url);
      
      // Update user avatar in store
      if (user) {
        setUser({ ...user, avatar: url });
      }
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Failed to update avatar:', error);
      toast.error('Failed to save avatar. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl font-bold tracking-tight">{t('user.profile')}</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Settings className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and avatar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                      alt={user?.username || 'User'}
                    />
                    <AvatarFallback className="text-2xl">
                      {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => setAvatarDialogOpen(true)}>
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Name Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a little about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Brief description for your profile. Max 200 characters.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account security and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user?.username || ''} disabled />
                  <p className="text-xs text-muted-foreground">
                    Username cannot be changed
                  </p>
                </div>

                <Separator />

                {/* Password Change */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t('user.change_password')}
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input 
                        id="current_password" 
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        disabled={isUpdatingPassword}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input 
                        id="new_password" 
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        disabled={isUpdatingPassword}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input 
                        id="confirm_password" 
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        disabled={isUpdatingPassword}
                      />
                    </div>
                    <Button onClick={handleSavePassword} disabled={isUpdatingPassword}>
                      {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Danger Zone */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-destructive">Danger Zone</h4>
                  <Card className="border-destructive">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Delete Account</h5>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <Button variant="destructive">Delete Account</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </motion.div>

      {/* Avatar Upload Dialog */}
      <AvatarUploadDialog
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
        currentAvatar={user?.avatar}
        userName={user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
        onUploadComplete={handleAvatarUpload}
      />
    </div>
  );
}
