import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Lock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { useAuthStore } from '../store/authStore';
import { userAPI, authAPI } from '../lib/api';

export default function Settings() {
  const { user, updateUser, clearAuth } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState({});

  const updateProfileMutation = useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (response) => {
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: userAPI.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to change password');
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!profileData.full_name.trim()) {
      newErrors.full_name = 'Name is required';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateProfileMutation.mutate(profileData);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 6) {
      newErrors.new_password = 'Password must be at least 6 characters';
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      changePasswordMutation.mutate({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      clearAuth();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" />
              <CardTitle>Profile Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={profileData.full_name}
                onChange={(e) => {
                  setProfileData({ ...profileData, full_name: e.target.value });
                  if (errors.full_name) setErrors({ ...errors, full_name: '' });
                }}
                error={errors.full_name}
              />

              <Input
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => {
                  setProfileData({ ...profileData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                error={errors.email}
              />

              <Button
                type="submit"
                loading={updateProfileMutation.isPending}
              >
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary-600" />
              <CardTitle>Change Password</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, current_password: e.target.value });
                  if (errors.current_password) setErrors({ ...errors, current_password: '' });
                }}
                error={errors.current_password}
              />

              <Input
                label="New Password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, new_password: e.target.value });
                  if (errors.new_password) setErrors({ ...errors, new_password: '' });
                }}
                error={errors.new_password}
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirm_password: e.target.value });
                  if (errors.confirm_password) setErrors({ ...errors, confirm_password: '' });
                }}
                error={errors.confirm_password}
              />

              <Button
                type="submit"
                loading={changePasswordMutation.isPending}
              >
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-600" />
              <CardTitle>Logout</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Sign out of your account on this device.
            </p>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}