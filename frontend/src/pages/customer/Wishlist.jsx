import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

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
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to remove item' });
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <motion.h1 className="text-3xl font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        Wishlist
      </motion.h1>
      {wishlist.length === 0 ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Your wishlist is empty</motion.p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.map(item => (
            <motion.div key={item.id} className="gradient-border overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}>
              <Link to={`/products/${item.productId}`}>
                <img
                  src={item.productImage || '/placeholder.png'}
                  alt={item.productName}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                    e.target.onerror = null;
                  }}
                />
                <div className="p-4">
                  <h3 className="font-semibold">{item.productName}</h3>
                  <p className="text-blue-600 font-bold">${item.productPrice}</p>
                </div>
              </Link>
              <button onClick={() => removeItem(item.id)} className="w-full bg-red-600 text-white py-2 hover:bg-red-700">
                Remove
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

