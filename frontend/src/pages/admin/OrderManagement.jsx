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

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  useEffect(() => {
    fetchOrders();
    fetchStaff();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders', { params: { page: 0, size: 100 } });
      setOrders(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      addToast({ type: 'error', message: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await api.get('/admin/users', { params: { page: 0, size: 100 } });
      // API returns PageResponse with content array
      const users = response.data?.content || response.data || [];
      setStaff(Array.isArray(users) ? users.filter(u => u.role === 'STAFF') : []);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      setStaff([]); // Set empty array on error to prevent further issues
    }
  };

  const handleAssign = async (orderId) => {
    if (!selectedStaffId) {
      addToast({ type: 'error', message: 'Please select a staff member' });
      return;
    }
    try {
      const response = await api.put(`/admin/orders/${orderId}/assign`, { staffId: parseInt(selectedStaffId) });
      
      // Update the order in local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, staffId: parseInt(selectedStaffId), staffName: response.data?.staffName || 'Assigned' }
            : order
        )
      );
      
      setAssigningOrderId(null);
      setSelectedStaffId('');
      addToast({ type: 'success', message: 'Order assigned successfully' });
      
      // Also refresh from server to ensure consistency
      fetchOrders();
    } catch (error) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to assign order' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded-xl w-64 animate-pulse mb-8"></div>
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
          Order Management
        </motion.h1>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-12 text-center"
          >
            <div className="text-6xl mb-4 opacity-50">📦</div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No orders yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Orders will appear here once customers place them.
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
                      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-medium">Customer:</span> {order.userName}</p>
                        <p><span className="font-medium">Total:</span> ${order.totalAmount?.toFixed(2) || '0.00'}</p>
                        {order.staffName && (
                          <p><span className="font-medium">Assigned to:</span> {order.staffName}</p>
                        )}
                      </div>
                    </div>

                    {!order.staffId && (
                      <div className="flex flex-col gap-2">
                        {assigningOrderId === order.id ? (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={selectedStaffId}
                              onChange={(e) => setSelectedStaffId(e.target.value)}
                              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                              <option value="">Select Staff</option>
                              {staff.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAssign(order.id)}
                              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all"
                            >
                              Assign
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setAssigningOrderId(null);
                                setSelectedStaffId('');
                              }}
                              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAssigningOrderId(order.id)}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all"
                          >
                            Assign to Staff
                          </motion.button>
                        )}
                      </div>
                    )}
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
          onOrderUpdate={(updatedOrder) => {
            if (updatedOrder && updatedOrder.id) {
              // Immediately update the orders list
              setOrders(prevOrders => {
                const newOrders = prevOrders.map(order => {
                  if (order.id === updatedOrder.id) {
                    // Return a new object to ensure React detects the change
                    return {
                      ...order,
                      status: updatedOrder.status !== undefined ? updatedOrder.status : order.status,
                      staffId: updatedOrder.staffId !== undefined ? updatedOrder.staffId : order.staffId,
                      staffName: updatedOrder.staffName !== undefined ? updatedOrder.staffName : order.staffName,
                      updatedAt: updatedOrder.updatedAt || order.updatedAt
                    };
                  }
                  return order;
                });
                return newOrders;
              });
              
              // Update selectedOrder if it's the same order
              if (selectedOrder && selectedOrder.id === updatedOrder.id) {
                setSelectedOrder({
                  ...selectedOrder,
                  status: updatedOrder.status !== undefined ? updatedOrder.status : selectedOrder.status,
                  staffId: updatedOrder.staffId !== undefined ? updatedOrder.staffId : selectedOrder.staffId,
                  staffName: updatedOrder.staffName !== undefined ? updatedOrder.staffName : selectedOrder.staffName,
                  updatedAt: updatedOrder.updatedAt || selectedOrder.updatedAt
                });
              }
            }
            
            // Refresh from server after a delay to ensure consistency
            setTimeout(() => {
              fetchOrders();
            }, 1000);
          }}
        />
      </div>
    </div>
  );
}
