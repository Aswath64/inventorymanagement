import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createUser, deleteUser, fetchUsers, updateUser } from '../../services/adminUserService';
import AnimatedCard from '../../components/motion/AnimatedCard';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95 },
};

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'CUSTOMER',
  phone: '',
  address: '',
  avatarUrl: '',
  themePreference: 'light',
  emailNotifications: true,
  pushNotifications: false,
  enabled: true,
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ role: '', keyword: '' });
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const loadUsers = async (page = 0) => {
    setLoading(true);
    try {
      const data = await fetchUsers({ page, size: 6, ...filters });
      setUsers(data.content);
      setPageInfo({ page: data.page, totalPages: data.totalPages });
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const openModal = (user) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        ...user,
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData(emptyForm);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await createUser(formData);
      }
      setModalOpen(false);
      loadUsers(pageInfo.page);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(id);
    loadUsers(pageInfo.page);
  };

  const paginationButtons = useMemo(() => {
    const buttons = [];
    for (let i = 0; i < pageInfo.totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => loadUsers(i)}
          className={`px-3 py-1 rounded-full ${i === pageInfo.page ? 'bg-blue-600 text-white' : 'bg-white/70'}`}
        >
          {i + 1}
        </button>
      );
    }
    return buttons;
  }, [pageInfo]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">Admin Control</p>
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <button
          onClick={() => openModal(null)}
          className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-2 text-white shadow-lg hover:shadow-indigo-500/40"
        >
          Add User
        </button>
      </div>

      <AnimatedCard>
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search name or email..."
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-2"
          />
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-2"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
            <option value="CUSTOMER">Customer</option>
          </select>
          <button
            onClick={() => loadUsers()}
            className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </AnimatedCard>

      <div className="grid gap-4 md:grid-cols-3">
        {loading && <div>Loading users...</div>}
        {!loading && users.map((user, idx) => (
          <motion.div
            key={user.id}
            className="gradient-border rounded-2xl bg-white/70 p-5 dark:bg-slate-900/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="flex items-center gap-4">
              <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                alt={user.name}
                className="h-12 w-12 rounded-2xl object-cover"
              />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-sm text-slate-500">
              <p>Role: <span className="font-medium">{user.role}</span></p>
              <p>Status: {user.enabled ? 'Active' : 'Disabled'}</p>
            </div>
            <div className="mt-4 flex gap-2 text-sm">
              <button onClick={() => openModal(user)} className="flex-1 rounded-xl bg-slate-900/80 px-4 py-2 text-white">
                Edit
              </button>
              <button onClick={() => handleDelete(user.id)} className="rounded-xl bg-red-500/80 px-3 py-2 text-white">
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">{paginationButtons}</div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} >
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{editingUser ? 'Edit User' : 'Create User'}</h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">Close</button>
              </div>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                {['name', 'email', 'phone', 'address', 'avatarUrl'].map((field) => (
                  <div key={field} className="flex flex-col gap-1">
                    <label className="text-sm text-slate-500 capitalize">{field}</label>
                    <input
                      type="text"
                      value={formData[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="rounded-xl border border-slate-200 px-4 py-2"
                      required={field === 'name' || field === 'email'}
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-500">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="rounded-xl border border-slate-200 px-4 py-2"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-500">Theme</label>
                  <select
                    value={formData.themePreference}
                    onChange={(e) => setFormData({ ...formData, themePreference: e.target.value })}
                    className="rounded-xl border border-slate-200 px-4 py-2"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                {!editingUser && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-slate-500">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="rounded-xl border border-slate-200 px-4 py-2"
                      required
                    />
                  </div>
                )}
                {editingUser && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-slate-500">New Password (optional)</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="rounded-xl border border-slate-200 px-4 py-2"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                  />
                  Email Notifications
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.pushNotifications}
                    onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked })}
                  />
                  Push Notifications
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                  Enabled
                </label>
                <div className="md:col-span-2 flex justify-end gap-3 pt-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2">
                    Cancel
                  </button>
                  <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2 text-white shadow-lg hover:shadow-blue-600/40">
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

