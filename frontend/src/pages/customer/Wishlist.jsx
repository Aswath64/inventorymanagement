import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    <div className="text-7xl mb-4 opacity-50">❤️</div>
    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Your wishlist is empty</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
      Start adding products to your wishlist to see them here.
    </p>
    <motion.a
      href="/products"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40 transition-all"
    >
      Browse Products
    </motion.a>
  </motion.div>
);

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/customer/wishlist');
      setWishlist(response.data);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load wishlist' });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (wishlistId) => {
    try {
      await api.delete(`/customer/wishlist/${wishlistId}`);
      fetchWishlist();
      addToast({ type: 'success', message: 'Item removed from wishlist' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to remove item' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded-xl w-48 animate-pulse mb-8"></div>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
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
          My Wishlist
        </motion.h1>

        {wishlist.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {wishlist.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to={`/products/${item.productId}`} className="block">
                    <div className="relative overflow-hidden">
                      <motion.img
                        src={item.productImage || '/placeholder.png'}
                        alt={item.productName}
                        className="w-full h-48 object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                          e.target.onerror = null;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                        {item.productName}
                      </h3>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${item.productPrice?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeItem(item.id)}
                    className="w-full px-4 py-3 rounded-b-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium hover:from-red-600 hover:to-pink-600 transition-all"
                  >
                    Remove from Wishlist
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
