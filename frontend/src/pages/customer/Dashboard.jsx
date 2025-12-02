import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import AnimatedCard from '../../components/motion/AnimatedCard';
import ParallaxSection from '../../components/motion/ParallaxSection';

export default function CustomerDashboard() {
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-10 p-4 md:p-8">
      <ParallaxSection>
        <div className="rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-8 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-widest">Welcome back</p>
          <motion.h1
            className="mt-2 text-4xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {dashboard?.profile?.name}
          </motion.h1>
          <p className="text-white/80">Here's a quick overview of your activity</p>
        </div>
      </ParallaxSection>

      <div className="grid gap-6 md:grid-cols-3">
        <AnimatedCard delay={0.05}>
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-4xl font-semibold">{dashboard?.totalOrders || 0}</p>
        </AnimatedCard>
        <AnimatedCard delay={0.1}>
          <p className="text-sm text-slate-500">Wishlist Items</p>
          <p className="text-4xl font-semibold">{dashboard?.wishlistCount || 0}</p>
        </AnimatedCard>
        <AnimatedCard delay={0.15}>
          <p className="text-sm text-slate-500">Active Since</p>
          <p className="text-xl font-semibold">{new Date().toLocaleDateString()}</p>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={0.2}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Orders</h2>
        </div>
        <div className="space-y-4">
          {dashboard?.recentOrders?.map((order, idx) => (
            <motion.div
              key={order.id}
              className="rounded-2xl border border-slate-100/80 p-4"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-slate-500">${order.totalAmount}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );
}

