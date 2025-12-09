import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import CheckoutModal from '../../components/modals/CheckoutModal';

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    <div className="text-7xl mb-4 opacity-50">🛒</div>
    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Your cart is empty</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
      Start adding products to your cart to see them here.
    </p>
    <motion.a
      href="/products"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all"
    >
      Browse Products
    </motion.a>
  </motion.div>
);

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const navigate = useNavigate();
  const addToast = useToast();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/customer/cart');
      setCart(response.data);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load cart' });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    if (quantity < 1) return;
    try {
      await api.put(`/customer/cart/${cartId}`, { quantity });
      fetchCart();
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update quantity' });
    }
  };

  const removeItem = async (cartId) => {
    try {
      await api.delete(`/customer/cart/${cartId}`);
      fetchCart();
      addToast({ type: 'success', message: 'Item removed from cart' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to remove item' });
    }
  };

  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleConfirmCheckout = async (formData) => {
    setCheckoutLoading(true);
    try {
      await api.post('/customer/orders/checkout', {
        shippingAddress: formData.shippingAddress,
        phoneNumber: formData.phoneNumber,
        specialInstructions: formData.specialInstructions,
        preferredDeliveryDate: formData.preferredDeliveryDate,
      });
      addToast({ type: 'success', message: 'Order placed successfully' });
      setShowCheckoutModal(false);
      navigate('/orders');
    } catch (error) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to checkout' });
    } finally {
      setCheckoutLoading(false);
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

  const total = cart.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.h1
          className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Shopping Cart
        </motion.h1>

        {cart.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-4 mb-8">
              <AnimatePresence>
                {cart.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="relative w-full sm:w-32 aspect-square overflow-hidden rounded-xl">
                        <motion.img
                          src={item.productImage || '/placeholder.png'}
                          alt={item.productName}
                          className="w-full h-full object-cover object-center"
                          whileHover={{ scale: 1.05 }}
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            {item.productName}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            ${item.productPrice?.toFixed(2) || '0.00'} each
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Quantity:</span>
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                −
                              </motion.button>
                              <span className="w-12 text-center font-semibold text-slate-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                              >
                                +
                              </motion.button>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-3">
                          <p className="text-xl font-bold text-slate-900 dark:text-white">
                            ${item.subtotal?.toFixed(2) || '0.00'}
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeItem(item.id)}
                            className="px-4 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            Remove
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-0 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    ${total.toFixed(2)}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {checkoutLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          onConfirm={handleConfirmCheckout}
          loading={checkoutLoading}
          totalAmount={total}
        />
      </div>
    </div>
  );
}
