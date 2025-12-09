import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function StaffReports() {
  const [downloading, setDownloading] = useState(false);
  const addToast = useToast();

  const downloadReport = async () => {
    setDownloading(true);
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
      addToast({ type: 'success', message: 'Report downloaded successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to download report' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.h1
          className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Reports
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-2xl"
        >
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl mb-4">
            📊
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            My Orders Report
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Download a comprehensive report of all orders assigned to you in Excel format.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadReport}
            disabled={downloading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {downloading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Downloading...
              </span>
            ) : (
              'Download Excel Report'
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
