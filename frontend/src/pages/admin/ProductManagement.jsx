import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', active: true });
  const [images, setImages] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showInactiveToo, setShowInactiveToo] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [showInactiveToo]);

  const fetchProducts = async () => {
    try {
      const params = { page: 0, size: 100 };
      // when checkbox is off, only active products; when on, include both
      if (!showInactiveToo) {
        params.active = true;
      }
      const response = await api.get('/admin/products', { params });
      setProducts(response.data.content || []);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to fetch products' });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      });
      if (images) {
        Array.from(images).forEach(file => {
          formDataToSend.append('images', file);
        });
      }

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, formData);
      } else {
        await api.post('/admin/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', active: true });
      setImages(null);
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to save product' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete product' });
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <motion.h1 className="text-3xl font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        Product Management
      </motion.h1>
      <div className="flex items-center gap-2 text-sm">
        <input
          id="showInactive"
          type="checkbox"
          checked={showInactiveToo}
          onChange={(e) => setShowInactiveToo(e.target.checked)}
        />
        <label htmlFor="showInactive">Include inactive products</label>
      </div>
      <form onSubmit={handleSubmit} className="glass-panel mb-6 space-y-4 rounded-3xl p-6 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: e.target.value})}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          />
          <label htmlFor="active" className="text-sm font-medium">Active</label>
        </div>
        {!editingId && (
          <div>
            <label className="block text-sm font-medium mb-1">Images</label>
            <input
              type="file"
              multiple
              onChange={(e) => setImages(e.target.files)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        )}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
          {editingId ? 'Update' : 'Create'} Product
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(product => (
          <motion.div key={product.id} className="rounded-3xl border border-slate-100 p-4" whileHover={{ y: -4 }}>
            <img
              src={product.imageUrls?.[0] || '/placeholder.png'}
              alt={product.name}
              className="w-full h-48 object-cover rounded mb-2"
              onError={(e) => {
                e.target.src = '/placeholder.png';
                e.target.onerror = null;
              }}
            />
            <h3 className="font-semibold">{product.name}</h3>
            <p>${product.price} - Stock: {product.stock}</p>
            <div className="mt-1 text-xs">
              {product.active === false && (
                <span className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  Inactive
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleDelete(product.id)} className="bg-red-600 text-white px-4 py-2 rounded text-sm">
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

