import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to remove item' });
    }
  };

  const handleCheckout = async () => {
    const address = prompt('Enter shipping address:');
    if (!address) return;
    
    try {
      await api.post('/customer/orders/checkout', { shippingAddress: address });
      addToast({ type: 'success', message: 'Order placed successfully' });
      navigate('/orders');
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to checkout' });
    }
  };

  if (loading) {
    return (
      <div className="p-8">Loading...</div>
    );
  }

  const total = cart.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <motion.h1 className="text-3xl font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        Shopping Cart
      </motion.h1>
      {cart.length === 0 ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Your cart is empty
        </motion.p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map(item => (
              <motion.div
                key={item.id}
                className="glass-panel flex items-center justify-between rounded-3xl p-4"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="flex gap-4">
                  <img
                    src={item.productImage || '/placeholder.png'}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                      e.target.onerror = null;
                    }}
                  />
                  <div>
                    <h3 className="font-semibold">{item.productName}</h3>
                    <p>${item.productPrice}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${item.subtotal}</p>
                  <button onClick={() => removeItem(item.id)} className="text-red-600 mt-2">Remove</button>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div className="rounded-3xl border border-slate-200/60 p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <span className="text-xl font-bold">Total: ${total.toFixed(2)}</span>
              <button onClick={handleCheckout} className="rounded-2xl bg-blue-600 px-6 py-3 text-white shadow-lg">
                Checkout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

