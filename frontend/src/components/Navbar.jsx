import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

export default function Navbar() {
  const { user, logout, isAdmin, isStaff, isCustomer } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [];
  if (user) {
    if (isCustomer) {
      links.push(
        { to: '/products', label: 'Products' },
        { to: '/cart', label: 'Cart' },
        { to: '/wishlist', label: 'Wishlist' },
        { to: '/orders', label: 'Orders' },
      );
    }
    if (isAdmin) {
      links.push(
        { to: '/admin/dashboard', label: 'Admin' },
        { to: '/admin/categories', label: 'Categories' },
        { to: '/admin/products', label: 'Inventory' },
        { to: '/admin/orders', label: 'Orders' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/reports', label: 'Reports' },
      );
    } else if (isStaff) {
      links.push(
        { to: '/staff/dashboard', label: 'Staff' },
        { to: '/staff/orders', label: 'Tasks' },
        { to: '/staff/reports', label: 'Reports' },
      );
    }
    links.push({ to: '/settings', label: 'Profile & Settings' });
  }

  return (
    <motion.nav
      className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-white/10"
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <motion.div whileHover={{ scale: 1.02 }} className="text-2xl font-semibold text-slate-900 dark:text-white">
          <Link to="/">Inventory<span className="text-blue-500">360</span></Link>
        </motion.div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {links.map(link => (
            <motion.div key={link.to} whileHover={{ y: -2 }}>
              <Link className="text-slate-600 dark:text-slate-200 hover:text-blue-500" to={link.to}>
                {link.label}
              </Link>
            </motion.div>
          ))}
          {user && (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-200"
              >
                {theme === 'light' ? 'Dark' : 'Light'}
              </motion.button>
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-300">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-red-500/90 px-3 py-1 text-white text-xs shadow-lg shadow-red-500/30 hover:bg-red-500"
                >
                  Logout
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

