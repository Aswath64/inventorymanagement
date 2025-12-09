import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMascot } from '../context/MascotContext';
import soundManager from '../utils/soundUtils';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { setEmotion } = useMascot();
  const navigate = useNavigate();

  // Reset emotion on mount
  useEffect(() => {
    setEmotion('idle');
  }, [setEmotion]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setEmotion('error');
      soundManager.playError();
      return;
    }

    setError('');
    setLoading(true);
    setEmotion('thinking');
    soundManager.playClick();

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      setEmotion('success');
      soundManager.playSuccess();
      setTimeout(() => {
        navigate('/');
      }, 800);
    } else {
      setEmotion('error');
      soundManager.playError();
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2">
            Join the Club!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create your account to start managing inventory like a pro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm font-medium flex items-center gap-2 animate-shake"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Name Input */}
          <div className="relative group">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => setEmotion('idle')}
              required
              className="peer input-primary pt-6 pb-2 placeholder-transparent"
              placeholder="Full Name"
            />
            <label
              htmlFor="name"
              className="absolute left-4 top-1 text-xs text-slate-500 transition-all 
                         peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3.5 
                         peer-focus:top-1 peer-focus:text-xs peer-focus:text-brand-primary dark:peer-focus:text-brand-accent pointer-events-none"
            >
              Full Name
            </label>
          </div>

          {/* Email Input */}
          <div className="relative group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setEmotion('idle')}
              required
              className="peer input-primary pt-6 pb-2 placeholder-transparent"
              placeholder="Email Address"
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-1 text-xs text-slate-500 transition-all 
                         peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3.5 
                         peer-focus:top-1 peer-focus:text-xs peer-focus:text-brand-primary dark:peer-focus:text-brand-accent pointer-events-none"
            >
              Email Address
            </label>
          </div>

          {/* Role Selection (Restored Feature) */}
          <div className="relative group">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              onFocus={() => setEmotion('thinking')}
              className="peer input-primary pt-6 pb-2 appearance-none cursor-pointer"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="STAFF">Staff Member</option>
              <option value="ADMIN">Administrator</option>
            </select>
            <label
              htmlFor="role"
              className="absolute left-4 top-1 text-xs text-brand-primary dark:text-brand-accent pointer-events-none"
            >
              I am a...
            </label>
            <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Password Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => {
                  /* Only shy if visible, but Register page currently lacks toggle. 
                     If the user wants this behavior, I should probably add the toggle or just leave it as is for now 
                     but the user said "remove hands when password is not visible".
                     Since Register doesn't have a toggle yet (it's always hidden), 
                     it should arguably NEVER be shy? Or always shy?
                     "remove hands when the password is not visible" -> Default is hidden -> Remove hands -> Idle.
                     So I should remove the random onFocus 'shy' from Register.
                  */
                  setEmotion('idle');
                }}
                onBlur={() => setEmotion('idle')}
                required
                className="peer input-primary pt-6 pb-2 placeholder-transparent"
                placeholder="Password"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-1 text-xs text-slate-500 transition-all 
                           peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3.5 
                           peer-focus:top-1 peer-focus:text-xs peer-focus:text-brand-primary dark:peer-focus:text-brand-accent pointer-events-none"
              >
                Password
              </label>
            </div>
            <div className="relative group">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => {
                  /* Only shy if visible, but Register page currently lacks toggle. 
                     If the user wants this behavior, I should probably add the toggle or just leave it as is for now 
                     but the user said "remove hands when password is not visible".
                     Since Register doesn't have a toggle yet (it's always hidden), 
                     it should arguably NEVER be shy? Or always shy?
                     "remove hands when the password is not visible" -> Default is hidden -> Remove hands -> Idle.
                     So I should remove the random onFocus 'shy' from Register.
                  */
                  setEmotion('idle');
                }}
                onBlur={() => setEmotion('idle')}
                required
                className="peer input-primary pt-6 pb-2 placeholder-transparent"
                placeholder="Confirm"
              />
              <label
                htmlFor="confirmPassword"
                className="absolute left-4 top-1 text-xs text-slate-500 transition-all 
                           peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3.5 
                           peer-focus:top-1 peer-focus:text-xs peer-focus:text-brand-primary dark:peer-focus:text-brand-accent pointer-events-none"
              >
                Confirm
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary h-12 flex items-center justify-center text-lg shadow-glow-primary"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-primary font-bold hover:text-brand-secondary transition-colors underline decoration-2 decoration-transparent hover:decoration-brand-secondary underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
