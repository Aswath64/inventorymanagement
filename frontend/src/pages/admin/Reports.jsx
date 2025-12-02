import api from '../../utils/api';

export default function Reports() {
  const downloadReport = async (type, format) => {
    try {
      const response = await api.get(`/admin/reports/${type}?format=${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `${type}_report.${extension}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert('Failed to download report');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Sales Report</h2>
          <div className="flex gap-2">
            <button onClick={() => downloadReport('sales', 'pdf')} className="bg-red-600 text-white px-4 py-2 rounded">
              Download PDF
            </button>
            <button onClick={() => downloadReport('sales', 'excel')} className="bg-green-600 text-white px-4 py-2 rounded">
              Download Excel
            </button>
          </div>
        </div>
        <div className="border p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Product Stock Report</h2>
          <div className="flex gap-2">
            <button onClick={() => downloadReport('products', 'pdf')} className="bg-red-600 text-white px-4 py-2 rounded">
              Download PDF
            </button>
            <button onClick={() => downloadReport('products', 'excel')} className="bg-green-600 text-white px-4 py-2 rounded">
              Download Excel
            </button>
          </div>
        </div>
        <div className="border p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Order Report</h2>
          <button onClick={() => downloadReport('orders', 'excel')} className="bg-green-600 text-white px-4 py-2 rounded">
            Download Excel
          </button>
        </div>
      </div>
    </div>
  );
}

