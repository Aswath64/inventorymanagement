import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PictureInPictureModal from './PictureInPictureModal';
import ProductImageCarousel from '../product/ProductImageCarousel';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import { maskEmail } from '../../utils/emailUtils';

const getStatusColor = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-cartoon-green-100 dark:bg-cartoon-green-900/30 text-cartoon-green-700 dark:text-cartoon-green-300 border-2 border-cartoon-green-300 dark:border-cartoon-green-700';
    case 'CANCELLED':
      return 'bg-cartoon-red-100 dark:bg-cartoon-red-900/30 text-cartoon-red-700 dark:text-cartoon-red-300 border-2 border-cartoon-red-300 dark:border-cartoon-red-700';
    case 'SHIPPED':
      return 'bg-cartoon-blue-100 dark:bg-cartoon-blue-900/30 text-cartoon-blue-700 dark:text-cartoon-blue-300 border-2 border-cartoon-blue-300 dark:border-cartoon-blue-700';
    case 'PROCESSING':
      return 'bg-cartoon-yellow-100 dark:bg-cartoon-yellow-900/30 text-cartoon-yellow-700 dark:text-cartoon-yellow-300 border-2 border-cartoon-yellow-300 dark:border-cartoon-yellow-700';
    default:
      return 'bg-slate-100 dark:bg-slate-700/30 text-slate-700 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-700';
  }
};

const getStatusEmotion = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'happy';
    case 'CANCELLED':
      return 'panicked';
    case 'SHIPPED':
      return 'happy';
    case 'PROCESSING':
      return 'idle';
    default:
      return 'idle';
  }
};

export default function OrderDetailsModal({ isOpen, onClose, order, onOrderUpdate }) {
  const { user, isAdmin, isStaff } = useAuth();
  const addToast = useToast();
  const [products, setProducts] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [availableStaff, setAvailableStaff] = useState([]);

  useEffect(() => {
    if (order?.orderItems && isOpen) {
      // Fetch product details for images
      order.orderItems.forEach(async (item) => {
        if (item.productId && !products[item.productId]) {
          try {
            const response = await api.get(`/products/${item.productId}`);
            setProducts(prev => ({ ...prev, [item.productId]: response.data }));
          } catch (error) {
            console.error(`Failed to fetch product ${item.productId}:`, error);
          }
        }
      });
    }
  }, [order, isOpen]);

  useEffect(() => {
    if (isAdmin && isOpen) {
      // Fetch staff for assignment
      api.get('/admin/users', { params: { page: 0, size: 100 } })
        .then(response => {
          // API returns PageResponse with content array
          const users = response.data?.content || response.data || [];
          setAvailableStaff(Array.isArray(users) ? users.filter(u => u.role === 'STAFF') : []);
        })
        .catch(error => {
          console.error('Failed to fetch staff:', error);
          setAvailableStaff([]); // Set empty array on error
        });
    }
  }, [isAdmin, isOpen]);

  if (!order) return null;

  const handleStatusUpdate = async (newStatus) => {
    // Check permissions: Admin can update any order, Staff can only update assigned orders
    if (!isAdmin && !(isStaff && order.staffId === user?.id)) {
      addToast({ type: 'error', message: 'You do not have permission to update this order' });
      return;
    }
    setUpdatingStatus(true);
    try {
      // Use /staff/orders/{id}/status endpoint - works for both ADMIN and STAFF
      // Backend endpoint: PUT /api/staff/orders/{id}/status
      const response = await api.put(`/staff/orders/${order.id}/status`, { status: newStatus });
      
      // Update the order in local state immediately (optimistic update)
      const updatedOrder = response.data;
      
      // Update local order state immediately for instant feedback
      if (updatedOrder) {
        // This will be passed to parent via onOrderUpdate, but also update locally
        // The parent will handle the list update
      }
      
      // Call callback to update parent component's order list
      if (onOrderUpdate) {
        onOrderUpdate(updatedOrder);
      }
      
      addToast({ type: 'success', message: 'Order status updated!' });
      
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      addToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update status. Make sure you have permission.' 
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignStaff = async () => {
    if (!isAdmin || !selectedStaffId) return;
    setAssigningStaff(true);
    try {
      const response = await api.put(`/admin/orders/${order.id}/assign`, { staffId: parseInt(selectedStaffId) });
      addToast({ type: 'success', message: 'Order assigned successfully!' });
      
      // Update order list immediately with assigned staff info
      const updatedOrder = response.data;
      if (onOrderUpdate) {
        onOrderUpdate(updatedOrder);
      }
      
      setSelectedStaffId('');
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to assign order' });
    } finally {
      setAssigningStaff(false);
    }
  };

  const handleCancelOrder = async () => {
    // Check permissions
    const canCancel = isAdmin || (order.userId === user?.id && (order.status === 'PENDING' || order.status === 'PROCESSING'));
    if (!canCancel) {
      addToast({ type: 'error', message: 'You cannot cancel this order' });
      return;
    }
    
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setUpdatingStatus(true);
    try {
      let updatedOrder;
      
      // Use different endpoints based on role
      if (order.userId === user?.id) {
        // Customer cancels their own order
        const response = await api.put(`/customer/orders/${order.id}/cancel`);
        updatedOrder = response.data;
      } else if (isAdmin) {
        // Admin cancels any order using status update endpoint
        const response = await api.put(`/staff/orders/${order.id}/status`, { status: 'CANCELLED' });
        updatedOrder = response.data;
      }
      
      addToast({ type: 'success', message: 'Order cancelled' });
      
      // Update order list immediately
      if (onOrderUpdate && updatedOrder) {
        onOrderUpdate(updatedOrder);
      }
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to cancel order' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <PictureInPictureModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span>Order #{order.id} Details</span>
        </div>
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* Order Status & Summary - Enhanced with cartoon style */}
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-gradient-to-r from-cartoon-blue-50 to-cartoon-purple-50 dark:from-cartoon-blue-900/20 dark:to-cartoon-purple-900/20 p-5 border-2 border-cartoon-blue-200 dark:border-cartoon-blue-800 shadow-sticker"
          >
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Order Status</p>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)} shadow-sticker`}>
              {order.status}
            </span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-gradient-to-r from-cartoon-green-50 to-teal-50 dark:from-cartoon-green-900/20 dark:to-teal-900/20 p-5 border-2 border-cartoon-green-200 dark:border-cartoon-green-800 shadow-sticker"
          >
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Total Amount</p>
            <p className="text-3xl font-bold text-cartoon-green-600 dark:text-cartoon-green-400">
              ${order.totalAmount?.toFixed(2) || '0.00'}
            </p>
          </motion.div>
        </div>

        {/* Order Dates */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-700/30 p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Order Date</p>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {order.updatedAt && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/30 p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Last Updated</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {new Date(order.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Customer Information - With masked email */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-700/30 p-5 border-2 border-slate-200 dark:border-slate-700 shadow-sticker">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 font-heading">Customer Information</h3>
          <div className="space-y-2">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-bold">Name:</span> {order.userName || 'N/A'}
            </p>
            {order.userEmail && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-bold">Email:</span> {maskEmail(order.userEmail)}
              </p>
            )}
            {order.userId && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-bold">Customer ID:</span> {order.userId}
              </p>
            )}
          </div>
        </div>

        {/* Staff Information (if assigned) */}
        {order.staffName && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Assigned Staff</h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">Staff Name:</span> {order.staffName}
              </p>
              {order.staffId && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Staff ID:</span> {order.staffId}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-4 border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Shipping Address</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">{order.shippingAddress}</p>
          </div>
        )}

        {/* Order Items - Enhanced with product images */}
        {order.orderItems && order.orderItems.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-slate-800 p-5 border-2 border-slate-200 dark:border-slate-700 shadow-sticker-lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-heading">Order Items</h3>
            <div className="space-y-4">
              {order.orderItems.map((item, idx) => {
                const product = products[item.productId];
                const productImages = product?.imageUrls || [];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-600/30 border-2 border-slate-200 dark:border-slate-600 shadow-sticker hover:shadow-sticker-lg transition-all"
                  >
                    {/* Product Image */}
                    {productImages.length > 0 ? (
                      <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-600">
                        <ProductImageCarousel
                          images={productImages}
                          productName={item.productName}
                          autoRotate={true}
                          rotationInterval={3000}
                          aspectRatio="1/1"
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 flex-shrink-0 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-slate-300 dark:border-slate-600">
                        <span className="text-3xl opacity-50">📦</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white mb-1 text-base">{item.productName}</p>
                      {item.productSku && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">SKU: {item.productSku}</p>
                      )}
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Quantity: <span className="font-bold">{item.quantity}</span> × <span className="font-bold text-cartoon-green-600 dark:text-cartoon-green-400">${item.price?.toFixed(2) || '0.00'}</span>
                      </p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-slate-300 dark:border-slate-600 flex items-center justify-between">
              <span className="text-xl font-bold text-slate-900 dark:text-white">Total</span>
              <span className="text-3xl font-bold text-cartoon-green-600 dark:text-cartoon-green-400">
                ${order.totalAmount?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        )}

        {/* Role-Based Actions */}
        <div className="rounded-2xl bg-gradient-to-r from-cartoon-purple-50 to-pink-50 dark:from-cartoon-purple-900/20 dark:to-pink-900/20 p-5 border-2 border-cartoon-purple-200 dark:border-cartoon-purple-800 shadow-sticker">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-heading">Actions</h3>
          <div className="space-y-3">
            {/* Admin: Assign Staff */}
            {isAdmin && !order.staffId && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Assign to Staff</label>
                <div className="flex gap-2">
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="flex-1 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-slate-900 dark:text-white focus:border-cartoon-blue-500 focus:ring-2 focus:ring-cartoon-blue-500/20"
                  >
                    <option value="">Select Staff Member</option>
                    {availableStaff.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAssignStaff}
                    disabled={!selectedStaffId || assigningStaff}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cartoon-blue-500 to-cartoon-purple-500 text-white font-bold shadow-sticker-lg hover:shadow-floating disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigningStaff ? 'Assigning...' : 'Assign'}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Admin/Staff: Update Status */}
            {(isAdmin || (isStaff && order.staffId === user?.id)) && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {['PROCESSING', 'SHIPPED', 'DELIVERED'].map(status => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={updatingStatus || order.status === status}
                      className={`px-4 py-2 rounded-full text-sm font-bold shadow-sticker ${
                        order.status === status
                          ? getStatusColor(status) + ' opacity-50 cursor-not-allowed'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-600 hover:border-cartoon-blue-500'
                      }`}
                    >
                      {status}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Admin/Customer: Cancel Order */}
            {(isAdmin || (order.userId === user?.id && (order.status === 'PENDING' || order.status === 'PROCESSING'))) && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelOrder}
                disabled={updatingStatus}
                className="w-full px-4 py-2.5 rounded-2xl bg-cartoon-red-500 text-white font-bold shadow-sticker-lg hover:shadow-floating disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingStatus ? 'Cancelling...' : 'Cancel Order'}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </PictureInPictureModal>
  );
}



