import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function StaffOrderManagement() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/staff/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/staff/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-gray-600">Customer: {order.userName}</p>
                <p className="text-gray-600">Total: ${order.totalAmount}</p>
              </div>
              <span className={`px-3 py-1 rounded ${order.status === 'DELIVERED' ? 'bg-green-200' : 'bg-yellow-200'}`}>
                {order.status}
              </span>
            </div>
            {order.orderItems && order.orderItems.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold mb-1">Items:</h4>
                {order.orderItems.map(item => (
                  <p key={item.id} className="text-sm">
                    {item.productName} x {item.quantity} - ${item.price}
                  </p>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              {order.status === 'PENDING' && (
                <button onClick={() => updateStatus(order.id, 'PROCESSING')} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Mark as Processing
                </button>
              )}
              {order.status === 'PROCESSING' && (
                <button onClick={() => updateStatus(order.id, 'SHIPPED')} className="bg-yellow-600 text-white px-4 py-2 rounded">
                  Mark as Shipped
                </button>
              )}
              {order.status === 'SHIPPED' && (
                <button onClick={() => updateStatus(order.id, 'DELIVERED')} className="bg-green-600 text-white px-4 py-2 rounded">
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

