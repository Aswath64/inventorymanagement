import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/customer/orders');
      setOrders(response.data);
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
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to download report' });
    }
  };

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;
    try {
      await api.put(`/customer/orders/${orderId}/cancel`);
      fetchOrders();
      addToast({ type: 'success', message: 'Order cancelled' });
    } catch (error) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to cancel order' });
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <motion.h1 className="text-3xl font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          My Orders
        </motion.h1>
        <div className="flex gap-2">
          <button onClick={() => downloadReport('pdf')} className="rounded-2xl bg-red-600 px-4 py-2 text-white">
            Download PDF
          </button>
          <button onClick={() => downloadReport('excel')} className="rounded-2xl bg-green-600 px-4 py-2 text-white">
            Download Excel
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {orders.map(order => (
          <motion.div
            key={order.id}
            className="glass-panel rounded-3xl p-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded ${order.status === 'DELIVERED' ? 'bg-green-200' : 'bg-yellow-200'}`}>
                {order.status}
              </span>
            </div>
            <p className="font-bold text-lg">Total: ${order.totalAmount}</p>
            <div className="mt-2">
              <p className="text-sm">Shipping Address: {order.shippingAddress}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold">Items:</h4>
              {order.orderItems?.map(item => (
                <p key={item.id} className="text-sm">{item.productName} x {item.quantity} - ${item.price}</p>
              ))}
            </div>
            {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
              <div className="mt-4 text-right">
                <button
                  onClick={() => cancelOrder(order.id)}
                  className="rounded-2xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

