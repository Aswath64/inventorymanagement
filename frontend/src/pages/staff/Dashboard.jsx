import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import api from '../../utils/api';

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-lg animate-pulse">
    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
  </div>
);

const EmptyState = ({ icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center py-12 px-6 text-center"
  >
    <div className="text-6xl mb-4 opacity-50">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
  </motion.div>
);

export default function StaffDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/staff/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Pending Orders',
      value: dashboard?.pendingOrdersCount || 0,
      gradient: 'from-amber-500 via-amber-600 to-orange-600',
      icon: '⏳',
    },
    {
      label: 'Completed Orders',
      value: dashboard?.completedOrdersCount || 0,
      gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
      icon: '✅',
    },
    {
      label: "Today's Orders",
      value: dashboard?.todayOrders?.length || 0,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      icon: '📅',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.4,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="mb-8">
            <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded-xl w-64 animate-pulse"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Parallax background decoration */}
      <motion.div
        style={{ y: backgroundY }}
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Main content with parallax */}
      <motion.div style={{ y: contentY }} className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mb-8 lg:mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              Staff Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base lg:text-lg">
              Manage your assigned orders and track your performance
            </p>
          </motion.div>

          {/* Stats Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-8 lg:mb-12"
          >
            {statCards.map((card, idx) => (
              <motion.div
                key={card.label}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-6 text-white shadow-xl shadow-black/10 dark:shadow-black/20 cursor-pointer transition-all duration-300`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl opacity-90 group-hover:scale-110 transition-transform duration-300">
                      {card.icon}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors"></div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium uppercase tracking-wider opacity-90 mb-2">
                    {card.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {card.value}
                  </p>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Today's Orders Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white">
                Today's Orders
              </h2>
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
            </div>

            {dashboard?.todayOrders && dashboard.todayOrders.length > 0 ? (
              <div className="space-y-3">
                {dashboard.todayOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="rounded-xl bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-700/20 dark:to-slate-600/20 border border-slate-200/50 dark:border-slate-600/30 p-4 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white mb-1">
                          Order #{order.id}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          Customer: {order.userName}
                        </p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          ${order.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📭"
                title="No orders today"
                description="Orders assigned to you today will appear here."
              />
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
