import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const reportCards = [
  {
    title: 'Sales Report',
    description: 'Download comprehensive sales analytics',
    icon: '💰',
    type: 'sales',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Product Stock Report',
    description: 'View current inventory levels',
    icon: '📦',
    type: 'products',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Order Report',
    description: 'Export order history and details',
    icon: '📋',
    type: 'orders',
    gradient: 'from-purple-500 to-pink-600',
  },
];

export default function Reports() {
  const [downloading, setDownloading] = useState({});
  const addToast = useToast();

  const downloadReport = async (type, format) => {
    const key = `${type}-${format}`;
    setDownloading({ ...downloading, [key]: true });
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
      addToast({ type: 'success', message: 'Report downloaded successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to download report' });
    } finally {
      setDownloading({ ...downloading, [key]: false });
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
          Reports & Analytics
        </motion.h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reportCards.map((card, idx) => (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-3xl mb-4`}>
                {card.icon}
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {card.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                {card.description}
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => downloadReport(card.type, 'pdf')}
                  disabled={downloading[`${card.type}-pdf`]}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {downloading[`${card.type}-pdf`] ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    </span>
                  ) : (
                    'PDF'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => downloadReport(card.type, 'excel')}
                  disabled={downloading[`${card.type}-excel`]}
                  className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {downloading[`${card.type}-excel`] ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    </span>
                  ) : (
                    'Excel'
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
