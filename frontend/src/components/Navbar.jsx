import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SoundToggle from './SoundToggle';
import soundManager from '../utils/soundUtils';

export default function Navbar() {
  const { user, logout, isAdmin, isStaff, isCustomer } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    soundManager.playTransition();
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navLinks = [];
  if (user) {
    if (isCustomer) {
      navLinks.push(
        { to: '/products', label: 'Products' },
        { to: '/cart', label: 'Cart' },
        { to: '/wishlist', label: 'Wishlist' },
        { to: '/orders', label: 'Orders' },
      );
    } else if (isAdmin) {
      navLinks.push(
        { to: '/admin/dashboard', label: 'Overview' },
        { to: '/admin/products', label: 'Inventory' },
        { to: '/admin/categories', label: 'Categories' },
        { to: '/admin/orders', label: 'Orders' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/reports', label: 'Reports' },
      );
    } else if (isStaff) {
      navLinks.push(
        { to: '/staff/dashboard', label: 'Overview' },
        { to: '/staff/orders', label: 'Tasks' },
        { to: '/staff/reports', label: 'Reports' },
      );
    }
  }

  // Active link styles
  const getLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-all px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive
      ? 'text-brand-primary bg-brand-primary/5 dark:text-brand-accent'
      : 'text-slate-600 dark:text-slate-300'
    }`;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-navbar transition-all duration-300 ${scrolled
            ? 'glass-panel border-b border-white/20 dark:border-slate-700/50 py-3'
            : 'bg-transparent py-5'
          }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={() => soundManager.playClick()}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
              I
            </div>
            <span className="text-xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
              Inventory<span className="text-brand-primary">360</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={getLinkClass}
                onClick={() => soundManager.playClick()}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                <SoundToggle />
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-slate-500 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>

                <div className="relative group">
                  <Link to="/settings" className="flex items-center gap-2 pl-2">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs ring-2 ring-transparent group-hover:ring-brand-primary/20 transition-all">
                      {user.name.charAt(0)}
                    </div>
                  </Link>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn-secondary py-1.5 px-4 text-xs"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-[60px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 md:hidden overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl transition-all ${isActive
                      ? 'bg-brand-primary/10 text-brand-primary font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-slate-500">Appearance</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>
              </div>
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 btn-secondary py-3 text-center text-red-500 dark:text-red-400 border-red-100 dark:border-red-900/30 hover:bg-red-50"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
