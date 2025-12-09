import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import OrderDetailsModal from '../../components/modals/OrderDetailsModal';

const getStatusColor = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
    case 'CANCELLED':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    case 'SHIPPED':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'PROCESSING':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
    default:
      return 'bg-slate-100 dark:bg-slate-700/30 text-slate-700 dark:text-slate-300';
  }
};

export default function StaffOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const addToast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/staff/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      addToast({ type: 'error', message: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingStatus(orderId);
    try {
      await api.put(`/staff/orders/${orderId}/status`, { status });
      fetchOrders();
      addToast({ type: 'success', message: `Order status updated to ${status}` });
    } catch (error) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to update status' });
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded-xl w-48 animate-pulse mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.h1
          className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          My Orders
        </motion.h1>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-12 text-center"
          >
            <div className="text-6xl mb-4 opacity-50">📦</div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No orders assigned
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Orders assigned to you will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {orders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="text-xl font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          Order #{order.id}
                        </motion.button>
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <p><span className="font-medium">Customer:</span> {order.userName}</p>
                        <p><span className="font-medium">Total:</span> ${order.totalAmount?.toFixed(2) || '0.00'}</p>
                      </div>
                      {order.orderItems && order.orderItems.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Items:</h4>
                          <div className="space-y-1">
                            {order.orderItems.map(item => (
                              <p key={item.id} className="text-sm text-slate-600 dark:text-slate-400">
                                {item.productName} × {item.quantity} - ${item.price?.toFixed(2) || '0.00'}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {order.status === 'PENDING' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateStatus(order.id, 'PROCESSING')}
                          disabled={updatingStatus === order.id}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {updatingStatus === order.id ? 'Updating...' : 'Mark as Processing'}
                        </motion.button>
                      )}
                      {order.status === 'PROCESSING' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateStatus(order.id, 'SHIPPED')}
                          disabled={updatingStatus === order.id}
                          className="px-4 py-2 rounded-xl bg-amber-600 text-white font-medium shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {updatingStatus === order.id ? 'Updating...' : 'Mark as Shipped'}
                        </motion.button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateStatus(order.id, 'DELIVERED')}
                          disabled={updatingStatus === order.id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {updatingStatus === order.id ? 'Updating...' : 'Mark as Delivered'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Order Details Modal */}
        <OrderDetailsModal
          isOpen={showOrderDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      </div>
    </div>
  );
}
