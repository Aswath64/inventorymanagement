import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProfile, updateProfile, changePassword, updateSettings } from '../../services/profileService';
import AnimatedCard from '../../components/motion/AnimatedCard';
import { useTheme } from '../../context/ThemeContext';

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
  const { setTheme } = useTheme();

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
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update settings');
    }
  };

  if (!profile) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        className="flex flex-col gap-4 md:flex-row md:items-center"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <motion.img
          src={profile.avatarUrl || `https://ui-avatars.com/api/?background=random&name=${profile.name}`}
          alt={profile.name}
          className="w-28 h-28 rounded-3xl object-cover shadow-2xl border-4 border-white/60"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 150 }}
        />
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">Hello again</p>
          <h1 className="text-4xl font-bold">{profile.name}</h1>
          <p className="text-slate-500">{profile.email}</p>
        </div>
      </motion.div>

      {message && (
        <motion.div
          className="glass-panel p-4 rounded-xl text-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {message}
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
            <button className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-2 text-white shadow-lg hover:shadow-indigo-500/30 transition-shadow">
              Save Profile
            </button>
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
            <button className="w-full rounded-xl border border-slate-200/80 py-2 text-slate-800 hover:bg-slate-50">
              Update Password
            </button>
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
          <button className="rounded-xl bg-slate-900 text-white px-6 py-2 shadow-lg hover:shadow-slate-900/40">
            Save Preferences
          </button>
        </form>
      </AnimatedCard>
    </div>
  );
}

