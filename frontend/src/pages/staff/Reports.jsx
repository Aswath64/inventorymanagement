import api from '../../utils/api';

export default function StaffReports() {
  const downloadReport = async () => {
    try {
      const response = await api.get('/staff/reports/orders', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my_orders_report.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert('Failed to download report');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <div className="border p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">My Orders Report</h2>
        <button onClick={downloadReport} className="bg-green-600 text-white px-4 py-2 rounded">
          Download Excel
        </button>
      </div>
    </div>
  );
}

