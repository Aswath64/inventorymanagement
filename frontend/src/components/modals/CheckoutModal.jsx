import { useState } from 'react';
import { motion } from 'framer-motion';
import PictureInPictureModal from './PictureInPictureModal';

export default function CheckoutModal({ isOpen, onClose, onConfirm, loading, totalAmount }) {
  const [formData, setFormData] = useState({
    shippingAddress: '',
    phoneNumber: '',
    specialInstructions: '',
    preferredDeliveryDate: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Shipping address is required';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onConfirm(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      shippingAddress: '',
      phoneNumber: '',
      specialInstructions: '',
      preferredDeliveryDate: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <PictureInPictureModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Complete Your Order"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Summary */}
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Order Total</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totalAmount?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Shipping Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleChange}
            rows={3}
            className={`w-full rounded-xl border ${
              errors.shippingAddress
                ? 'border-red-300 dark:border-red-700'
                : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200 resize-none`}
            placeholder="Enter your complete shipping address"
            required
          />
          {errors.shippingAddress && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.shippingAddress}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`w-full rounded-xl border ${
              errors.phoneNumber
                ? 'border-red-300 dark:border-red-700'
                : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200`}
            placeholder="+1 (555) 000-0000"
            required
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Preferred Delivery Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Preferred Delivery Date (Optional)
          </label>
          <input
            type="date"
            name="preferredDeliveryDate"
            value={formData.preferredDeliveryDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
          />
        </div>

        {/* Special Instructions */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Special Instructions (Optional)
          </label>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200 resize-none"
            placeholder="Any special delivery instructions or notes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClose}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              'Place Order'
            )}
          </motion.button>
        </div>
      </form>
    </PictureInPictureModal>
  );
}







