import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Boxy from '../../components/Mascot/Boxy';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

const CustomerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/customer/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'My Orders',
      value: dashboard?.totalOrders || 0,
      icon: '📦',
      color: 'bg-brand-primary',
      link: '/orders',
    },
    {
      label: 'Wishlist',
      value: dashboard?.wishlistCount || 0,
      icon: '❤️',
      color: 'bg-brand-secondary',
      link: '/wishlist',
    },
    {
      label: 'Member Since',
      value: dashboard?.profile?.createdAt
        ? new Date(dashboard.profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      icon: '⭐',
      color: 'bg-brand-accent',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" height="180px" className="w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton variant="card" height="140px" />
          <Skeleton variant="card" height="140px" />
          <Skeleton variant="card" height="140px" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Mascot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl bg-gradient-to-r from-brand-primary to-indigo-600 p-8 sm:p-10 text-white shadow-glow-primary overflow-hidden"
      >
        <div className="relative z-10 sm:max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">
            Welcome back, {dashboard?.profile?.name || 'Customer'}!
          </h1>
          <p className="text-indigo-100 text-lg opacity-90">
            Ready to explore? Boxy has found some great new items for you today.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/products"
              className="px-6 py-2.5 rounded-xl bg-white text-brand-primary font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Browse Shop
            </Link>
            <Link
              to="/orders"
              className="px-6 py-2.5 rounded-xl bg-indigo-700/50 text-white font-medium hover:bg-indigo-700/70 transition-colors"
            >
              Track Orders
            </Link>
          </div>
        </div>

        {/* Mascot Peeking */}
        <div className="absolute -bottom-12 -right-12 sm:right-4 sm:-bottom-8 md:w-64 md:h-64 pointer-events-none">
          <Boxy emotion="idle" className="w-48 h-48 md:w-64 md:h-64" />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="group relative cursor-pointer"
          >
            <Link to={card.link || '#'}>
              <div className="glass-panel p-6 rounded-2xl h-full flex flex-col justify-between hover:shadow-glass-hover transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{card.label}</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${card.color} text-white flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-premium"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-slate-800 dark:text-white">Recent Orders</h2>
          <Link to="/orders" className="text-sm font-medium text-brand-primary hover:text-brand-dark">View All</Link>
        </div>

        {dashboard?.recentOrders && dashboard.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 font-medium">Order ID</th>
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {dashboard.recentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 font-medium text-slate-900 dark:text-white">#{order.id}</td>
                    <td className="py-4 text-slate-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-medium">${order.totalAmount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No orders yet"
            description="Looks like you haven't bought anything yet."
            emotion="shy"
            action={
              <Link to="/products" className="btn-primary py-2 px-4 text-sm inline-block">Start Shopping</Link>
            }
          />
        )}
      </motion.div>
    </div>
  );
};

export default CustomerDashboard;
