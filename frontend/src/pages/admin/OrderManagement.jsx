import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchStaff();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders', { params: { page: 0, size: 100 } });
      setOrders(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await api.get('/admin/users'); // Assuming this endpoint exists
      setStaff(response.data.filter(u => u.role === 'STAFF'));
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const handleAssign = async (orderId) => {
    try {
      await api.put(`/admin/orders/${orderId}/assign`, { staffId: parseInt(selectedStaffId) });
      setAssigningOrderId(null);
      setSelectedStaffId('');
      fetchOrders();
    } catch (error) {
      alert('Failed to assign order');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-gray-600">Customer: {order.userName}</p>
                <p className="text-gray-600">Total: ${order.totalAmount}</p>
                {order.staffName && <p className="text-gray-600">Assigned to: {order.staffName}</p>}
              </div>
              <span className={`px-3 py-1 rounded ${order.status === 'DELIVERED' ? 'bg-green-200' : 'bg-yellow-200'}`}>
                {order.status}
              </span>
            </div>
            {!order.staffId && (
              <div className="mt-2">
                {assigningOrderId === order.id ? (
                  <div className="flex gap-2">
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="border px-3 py-2 rounded"
                    >
                      <option value="">Select Staff</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <button onClick={() => handleAssign(order.id)} className="bg-blue-600 text-white px-4 py-2 rounded">
                      Assign
                    </button>
                    <button onClick={() => setAssigningOrderId(null)} className="bg-gray-600 text-white px-4 py-2 rounded">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setAssigningOrderId(order.id)} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Assign to Staff
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

