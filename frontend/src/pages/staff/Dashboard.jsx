import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function StaffDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/staff/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold">Pending Orders</h3>
          <p className="text-3xl font-bold">{dashboard?.pendingOrdersCount || 0}</p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold">Completed Orders</h3>
          <p className="text-3xl font-bold">{dashboard?.completedOrdersCount || 0}</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold">Today's Orders</h3>
          <p className="text-3xl font-bold">{dashboard?.todayOrders?.length || 0}</p>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Today's Orders</h2>
        <div className="space-y-4">
          {dashboard?.todayOrders?.map(order => (
            <div key={order.id} className="border p-4 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-gray-600">Customer: {order.userName}</p>
                  <p className="text-gray-600">${order.totalAmount}</p>
                </div>
                <span className={`px-3 py-1 rounded ${order.status === 'DELIVERED' ? 'bg-green-200' : 'bg-yellow-200'}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

