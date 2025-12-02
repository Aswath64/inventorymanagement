import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

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
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, formData);
      } else {
        await api.post('/admin/categories', formData);
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      alert('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Category Management</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4 max-w-md">
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
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
          {editingId ? 'Update' : 'Create'} Category
        </button>
      </form>
      <div className="space-y-2">
        {categories.map(category => (
          <div key={category.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-gray-600">{category.description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(category)} className="bg-yellow-600 text-white px-4 py-2 rounded">
                Edit
              </button>
              <button onClick={() => handleDelete(category.id)} className="bg-red-600 text-white px-4 py-2 rounded">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

