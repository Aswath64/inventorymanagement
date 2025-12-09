import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMascot } from '../context/MascotContext';
import soundManager from '../utils/soundUtils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { setEmotion } = useMascot();
  const navigate = useNavigate();

  // Reset emotion on mount
  useEffect(() => {
    setEmotion('idle');
  }, [setEmotion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setEmotion('thinking');
    soundManager.playClick();

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      setEmotion('success');
      soundManager.playSuccess();
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (user.role === 'STAFF') {
          navigate('/staff/dashboard');
        } else {
          navigate('/');
        }
      }, 500);
    } else {
      setEmotion('error');
      soundManager.playError();
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2">
            Welcome Back!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Email Input */}
          <div className="relative group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
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

          {/* Password Input */}
          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onFocus={() => {
                // Only act shy if the password is actually visible
                if (showPassword) setEmotion('shy');
                else setEmotion('idle');
              }}
              onBlur={() => setEmotion('idle')}
              required
              className="peer input-primary pt-6 pb-2 placeholder-transparent pr-12"
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
            <button
              type="button"
              onClick={() => {
                const newShowPassword = !showPassword;
                setShowPassword(newShowPassword);
                // "Cover eyes" (shy) if visible, "Remove hands" (idle) if hidden
                setEmotion(newShowPassword ? 'shy' : 'idle');
              }}
              className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/30" />
              <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary h-12 flex items-center justify-center text-lg shadow-glow-primary"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-brand-primary font-bold hover:text-brand-secondary transition-colors underline decoration-2 decoration-transparent hover:decoration-brand-secondary underline-offset-4"
            >
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
