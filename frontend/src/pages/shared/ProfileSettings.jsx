import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProfile, updateProfile, changePassword, updateSettings, uploadProfilePicture } from '../../services/profileService';
import AnimatedCard from '../../components/motion/AnimatedCard';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import ProfilePictureUpload from '../../components/ProfilePictureUpload';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ProfileSettings() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [settingsData, setSettingsData] = useState({ themePreference: 'light', emailNotifications: true, pushNotifications: false });
  const [message, setMessage] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { setTheme } = useTheme();
  const addToast = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        address: data.user.address || '',
      });
      setSettingsData({
        themePreference: data.settings.themePreference || 'light',
        emailNotifications: data.settings.emailNotifications ?? true,
        pushNotifications: data.settings.pushNotifications ?? false,
      });
    } catch (error) {
      console.error('Failed to load profile', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully');
      loadProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(passwordData);
      setPasswordData({ currentPassword: '', newPassword: '' });
      setMessage('Password updated successfully');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await updateSettings(settingsData);
      setSettingsData({
        themePreference: data.themePreference,
        emailNotifications: data.emailNotifications,
        pushNotifications: data.pushNotifications,
      });
      if (data.themePreference) {
        setTheme(data.themePreference);
      }
      setMessage('Settings saved');
      addToast({ type: 'success', message: 'Settings saved successfully!' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update settings');
      addToast({ type: 'error', message: 'Failed to update settings' });
    }
  };

  const handleAvatarUpload = async (file) => {
    setUploadingAvatar(true);
    try {
      const response = await uploadProfilePicture(file);
      
      // Update profile state immediately with new avatar URL from response
      if (response?.user) {
        // Get the base URL without any existing query parameters
        const baseUrl = response.user.avatarUrl?.split('?')[0] || response.user.avatarUrl;
        // Add cache-busting timestamp - use a unique timestamp
        const timestamp = Date.now();
        const newAvatarUrl = baseUrl 
          ? `${baseUrl}?v=${timestamp}`
          : response.user.avatarUrl;
        
        // Update profile state immediately - create new object to force React update
        const updatedProfile = {
          ...response.user,
          avatarUrl: newAvatarUrl,
          _updated: timestamp // Add a flag to force re-render
        };
        
        // Force state update
        setProfile({ ...updatedProfile });
        
        // Also update formData to keep everything in sync
        setFormData(prev => ({
          ...prev,
          name: updatedProfile.name,
          email: updatedProfile.email,
          phone: updatedProfile.phone || '',
          address: updatedProfile.address || ''
        }));
      }
      
      // Reload full profile after a brief delay to ensure server has processed
      setTimeout(async () => {
        try {
          const freshData = await getProfile();
          if (freshData?.user) {
            const freshBaseUrl = freshData.user.avatarUrl?.split('?')[0] || freshData.user.avatarUrl;
            const freshTimestamp = Date.now();
            const freshAvatarUrl = freshBaseUrl 
              ? `${freshBaseUrl}?v=${freshTimestamp}`
              : freshData.user.avatarUrl;
            
            // Force update with new timestamp
            setProfile({
              ...freshData.user,
              avatarUrl: freshAvatarUrl,
              _updated: freshTimestamp
            });
          }
        } catch (error) {
          console.error('Failed to reload profile:', error);
        }
      }, 800);
      
      addToast({ type: 'success', message: 'Profile picture updated! 🎉' });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to upload profile picture' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!profile) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        key={`profile-header-${profile.avatarUrl}`} // Force re-render when avatar changes
        className="flex flex-col gap-6 md:flex-row md:items-center"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        {/* Editable Profile Picture */}
        <ProfilePictureUpload
          currentAvatarUrl={profile.avatarUrl}
          userName={profile.name}
          onUpload={handleAvatarUpload}
          loading={uploadingAvatar}
        />
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Hello again</p>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-heading mb-1">{profile.name}</h1>
          <p className="text-slate-600 dark:text-slate-400">{profile.email}</p>
        </div>
      </motion.div>

      {message && (
        <motion.div
          className="glass-panel p-4 rounded-2xl text-sm border-2 border-cartoon-green-200 dark:border-cartoon-green-800 bg-cartoon-green-50 dark:bg-cartoon-green-900/20"
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-cartoon-green-700 dark:text-cartoon-green-300 font-medium">{message}</span>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <AnimatedCard delay={0.1}>
          <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {['name', 'email', 'phone', 'address'].map((field) => (
              <div key={field} className="space-y-1">
                <label className="text-sm text-slate-500 capitalize">{field}</label>
                <input
                  type="text"
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/70 px-4 py-2 focus:border-blue-500 focus:ring"
                  required={field === 'name' || field === 'email'}
                />
              </div>
            ))}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-cartoon-blue-500 to-cartoon-purple-500 py-3 text-white font-bold shadow-sticker-lg hover:shadow-floating transition-all"
            >
              Save Profile
            </motion.button>
          </form>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-500">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-200/60 bg-white/70 px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-500">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-200/60 bg-white/70 px-4 py-2"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full rounded-2xl border-2 border-slate-300 dark:border-slate-600 py-3 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sticker"
            >
              Update Password
            </motion.button>
          </form>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={0.3}>
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-500 mb-2 block">Theme</label>
            <div className="flex gap-4">
              {['light', 'dark'].map((theme) => (
                <label key={theme} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={settingsData.themePreference === theme}
                    onChange={() => setSettingsData({ ...settingsData, themePreference: theme })}
                  />
                  <span className="capitalize">{theme}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settingsData.emailNotifications}
              onChange={(e) => setSettingsData({ ...settingsData, emailNotifications: e.target.checked })}
            />
            Email Notifications
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settingsData.pushNotifications}
              onChange={(e) => setSettingsData({ ...settingsData, pushNotifications: e.target.checked })}
            />
            Push Notifications
          </label>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white px-6 py-3 font-bold shadow-sticker-lg hover:shadow-floating transition-all"
          >
            Save Preferences
          </motion.button>
        </form>
      </AnimatedCard>
    </div>
  );
}

