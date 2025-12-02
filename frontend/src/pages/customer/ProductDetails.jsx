import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ProductDetailsSkeleton } from '../../components/skeletons/ProductSkeletons';

export default function ProductDetails() {
  const { id } = useParams();
  const { isCustomer } = useAuth();
  const addToast = useToast();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load product details' });
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/products/${id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load reviews' });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customer/reviews', {
        productId: parseInt(id, 10),
        rating: parseInt(rating, 10),
        comment,
      });
      setRating(5);
      setComment('');
      fetchReviews();
      addToast({ type: 'success', message: 'Review submitted' });
    } catch (error) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to submit review' });
    }
  };

  const handleAddToCart = async () => {
    try {
      await api.post('/customer/cart/add', { productId: id, quantity });
      addToast({ type: 'success', message: 'Added to cart' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to add to cart' });
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await api.post(`/customer/wishlist/add/${id}`);
      addToast({ type: 'success', message: 'Added to wishlist' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to add to wishlist' });
    }
  };

  if (!product) return <ProductDetailsSkeleton />;

  return (
    <div className="space-y-10 p-6">
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <motion.img
            src={product.imageUrls?.[currentImage] || '/placeholder.png'}
            alt={product.name}
            className="h-96 w-full rounded-3xl object-cover shadow-2xl"
            key={currentImage}
            initial={{ opacity: 0.8, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onError={(e) => {
              e.target.src = '/placeholder.png';
              e.target.onerror = null;
            }}
          />
          {product.imageUrls?.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {product.imageUrls.map((url, idx) => (
                  <motion.img
                    key={idx}
                    src={url}
                    alt={`${product.name} ${idx + 1}`}
                    onClick={() => setCurrentImage(idx)}
                    className={`h-20 w-20 cursor-pointer rounded-2xl object-cover ${currentImage === idx ? 'ring-2 ring-blue-500' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                      e.target.onerror = null;
                    }}
                  />
              ))}
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-xl">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-3xl font-semibold text-blue-600">${product.price}</p>
          <p className="text-slate-600">{product.description}</p>
          <div className="flex items-center gap-3">
            <p>Stock: {product.stock}</p>
            {product.stockStatus === 'OUT_OF_STOCK' && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                Out of Stock
              </span>
            )}
            {product.stockStatus === 'LOW_STOCK' && product.stockStatus !== 'OUT_OF_STOCK' && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Low Stock
              </span>
            )}
            {product.stockStatus === 'IN_STOCK' && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                In Stock
              </span>
            )}
          </div>
          {product.averageRating && (
            <p className="text-sm text-slate-500">
              Rating: {product.averageRating.toFixed(1)} / 5 ({product.reviewCount} reviews)
            </p>
          )}
          {isCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm text-slate-500">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-24 rounded-2xl border border-slate-200 px-3 py-2"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart} className="flex-1 rounded-2xl bg-blue-600 px-6 py-2 text-white shadow-lg">
                  Add to Cart
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToWishlist} className="flex-1 rounded-2xl bg-emerald-500 px-6 py-2 text-white shadow-lg">
                  Add to Wishlist
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-semibold">Reviews</h2>
        {isCustomer && (
          <form onSubmit={handleSubmitReview} className="mb-6 space-y-3 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="border px-3 py-2 rounded w-32"
              >
                {[1,2,3,4,5].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                rows={3}
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Submit Review
            </button>
          </form>
        )}
        <div className="space-y-4">
          {reviews.map(review => (
            <motion.div key={review.id} className="rounded-2xl border border-slate-100 p-4" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{review.userName}</span>
                <span>Rating: {review.rating}/5</span>
              </div>
              <p>{review.comment}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

