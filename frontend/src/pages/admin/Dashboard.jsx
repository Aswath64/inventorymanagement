import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <motion.h1 className="text-3xl font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        Admin Dashboard
      </motion.h1>
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Total Products', value: dashboard?.totalProducts || 0, color: 'from-blue-500 to-indigo-500' },
          { label: 'Total Customers', value: dashboard?.totalCustomers || 0, color: 'from-emerald-500 to-teal-500' },
          { label: 'Total Staff', value: dashboard?.totalStaff || 0, color: 'from-amber-500 to-orange-500' },
          { label: 'Total Sales', value: `$${dashboard?.totalSales || 0}`, color: 'from-purple-500 to-pink-500' },
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            className={`rounded-3xl bg-gradient-to-br ${card.color} p-6 text-white shadow-xl`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <p className="text-sm uppercase tracking-wider">{card.label}</p>
            <p className="text-3xl font-semibold">{card.value}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div className="glass-panel rounded-3xl p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-semibold mb-4">Low Stock Products</h2>
          <div className="space-y-2">
            {dashboard?.lowStockProducts?.map(product => (
              <div key={product.id} className="rounded-2xl border border-slate-100 p-3">
                <p className="font-semibold">{product.name}</p>
                <p className="text-red-500 text-sm">Stock: {product.stock}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div className="glass-panel rounded-3xl p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-semibold mb-4">Most Sold Products</h2>
          <div className="space-y-2">
            {dashboard?.mostSoldProducts?.map(product => (
              <div key={product.id} className="rounded-2xl border border-slate-100 p-3">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-slate-500">Price: ${product.price}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

