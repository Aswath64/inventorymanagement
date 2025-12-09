import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { ProductCardSkeleton } from '../../components/skeletons/ProductSkeletons';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [page, search, categoryId]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = { page, size: 12 };
      if (search) params.name = search;
      if (categoryId) params.categoryId = categoryId;
      const response = await api.get('/products', { params });
      setProducts(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <motion.div
          className="rounded-3xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 p-8 text-white shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold">Products</h1>
          <p className="text-white/80">Explore everything in inventory</p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <motion.div
        className="rounded-3xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 p-8 text-white shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold">Products</h1>
        <p className="text-white/80">Explore everything in inventory</p>
      </motion.div>
      <motion.div
        className="glass-panel flex flex-col gap-4 rounded-3xl p-6 md:flex-row"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-2xl border border-slate-200/60 px-4 py-3"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-2xl border border-slate-200/60 px-4 py-3"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -6, rotate: 0.2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <Link 
              to={`/products/${product.id}`} 
              className="gradient-border block rounded-3xl bg-white/80 dark:bg-slate-900/80 overflow-hidden shadow-sticker hover:shadow-sticker-lg transition-all"
              onClick={() => {
                // Sound feedback on product click
                if (window.soundManager) window.soundManager.playClick();
              }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                <img
                  src={product.imageUrls?.[0] || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div className="space-y-1 p-4">
                <p className="text-sm uppercase tracking-wide text-slate-500">{product.categoryName}</p>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-2xl font-bold text-blue-600">${product.price}</p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Stock: {product.stock}</span>
                  {product.stockStatus === 'OUT_OF_STOCK' && (
                    <span className="rounded-full bg-cartoon-red-100 dark:bg-cartoon-red-900/40 px-3 py-1 text-xs font-bold text-cartoon-red-700 dark:text-cartoon-red-300 border-2 border-cartoon-red-300 dark:border-cartoon-red-700 shadow-sticker">
                      Out of Stock
                    </span>
                  )}
                  {product.stockStatus === 'LOW_STOCK' && product.stockStatus !== 'OUT_OF_STOCK' && (
                    <span className="rounded-full bg-cartoon-yellow-100 dark:bg-cartoon-yellow-900/40 px-3 py-1 text-xs font-bold text-cartoon-yellow-700 dark:text-cartoon-yellow-300 border-2 border-cartoon-yellow-300 dark:border-cartoon-yellow-700 shadow-sticker">
                      Low Stock
                    </span>
                  )}
                  {product.stockStatus === 'IN_STOCK' && (
                    <span className="rounded-full bg-cartoon-green-100 dark:bg-cartoon-green-900/40 px-3 py-1 text-xs font-bold text-cartoon-green-700 dark:text-cartoon-green-300 border-2 border-cartoon-green-300 dark:border-cartoon-green-700 shadow-sticker">
                      In Stock
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

