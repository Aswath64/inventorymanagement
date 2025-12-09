import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import OrderDetailsModal from '../../components/modals/OrderDetailsModal';
import EmptyState from '../../components/EmptyState';

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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/customer/orders');
      setOrders(response.data);
      publish('order:new');
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format) => {
    try {
      const response = await api.get(`/customer/reports/order-history?format=${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order_history.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      addToast({ type: 'success', message: 'Report downloaded successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to download report' });
    }
  };

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;
    try {
      const response = await api.put(`/customer/orders/${orderId}/cancel`);
      const updatedOrder = response.data;
      
      // Update the order in local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, ...updatedOrder } : order
        )
      );
      
      addToast({ type: 'success', message: 'Order cancelled' });
      publish('order:status:success');
      
      // Also refresh from server to ensure consistency
      fetchOrders();
    } catch (error) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to cancel order' });
      publish('order:status:error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded-xl w-48 animate-pulse mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <motion.h1
            className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            My Orders
          </motion.h1>
          {orders.length > 0 && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => downloadReport('pdf')}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all"
              >
                Download PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => downloadReport('excel')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all"
              >
                Download Excel
              </motion.button>
            </div>
          )}
        </div>

        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Start shopping to see your orders here. Boxy is ready to help you find amazing products!"
            emotion="idle"
            size="lg"
            showBoxy={true}
            action={
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-cartoon-blue-500 to-cartoon-purple-500 text-white font-bold shadow-sticker-lg hover:shadow-floating transition-all border-2 border-white/20"
                >
                  Browse Products
                </Link>
              </motion.div>
            }
          />
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
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
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
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        Total: ${order.totalAmount?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Shipping Address: {order.shippingAddress}
                      </p>
                    </div>
                  </div>

                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Items:</h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3"
                          >
                            <span className="text-slate-700 dark:text-slate-300">
                              {item.productName} × {item.quantity}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              ${item.price?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => cancelOrder(order.id)}
                        className="px-6 py-2 rounded-xl bg-red-600 text-white font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all"
                      >
                        Cancel Order
                      </motion.button>
                    </div>
                  )}
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
