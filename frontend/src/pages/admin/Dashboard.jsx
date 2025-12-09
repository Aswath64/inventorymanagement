import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useMascot } from '../../context/MascotContext';
import soundManager from '../../utils/soundUtils';

// --- Mock Data ---
const REVENUE_DATA = [
  { name: 'Jan', revenue: 4000, orders: 240 },
  { name: 'Feb', revenue: 3000, orders: 139 },
  { name: 'Mar', revenue: 2000, orders: 980 },
  { name: 'Apr', revenue: 2780, orders: 390 },
  { name: 'May', revenue: 1890, orders: 480 },
  { name: 'Jun', revenue: 2390, orders: 380 },
  { name: 'Jul', revenue: 3490, orders: 430 },
];

const CATEGORY_DATA = [
  { name: 'Electronics', value: 400 },
  { name: 'Clothing', value: 300 },
  { name: 'Home', value: 300 },
  { name: 'Books', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const { setEmotion, showTooltip, setLookAtTarget, addXp } = useMascot();
  const [timeRange, setTimeRange] = useState('6M');

  // --- Trend Analysis ---
  const trend = useMemo(() => {
    const lastMonth = REVENUE_DATA[REVENUE_DATA.length - 1].revenue;
    const prevMonth = REVENUE_DATA[REVENUE_DATA.length - 2].revenue;
    const diff = lastMonth - prevMonth;
    const percent = ((diff / prevMonth) * 100).toFixed(1);
    return { diff, percent, isUp: diff > 0 };
  }, []);

  // --- Mascot Reaction on Mount ---
  useEffect(() => {
    // Initial Reaction to Data
    if (trend.isUp) {
      setTimeout(() => {
        setEmotion('success');
        showTooltip(`Revenue is UP by ${trend.percent}%! Great job! 🚀`);
        soundManager.playSuccess();
        addXp(50);
      }, 1000);
    } else {
      setTimeout(() => {
        setEmotion('thinking');
        showTooltip(`Revenue dip of ${trend.percent}%. Let's push for more sales! 📉`);
        soundManager.playThinking();
      }, 1000);
    }
  }, [trend, setEmotion, showTooltip, addXp]);

  // --- Interactive Handlers ---
  const handleChartHover = (e) => {
    if (!e) return;
    // Recharts gives us data points, but getting raw screen coordinates is tricky directly from its events sometimes.
    // We can simulate generally looking at the center of the screen or just trigger 'focused' mode.
    // For actual mouse tracking, we rely on the global mouse listener in FloatingBoxy/Context if implemented,
    // or we can pass a generic "Look here" flag.
    // Here we'll just set emotion to 'focused' occasionally.
    // setEmotion('thinking', 1000); 
  };

  return (
    <div className="p-6 space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Oversight</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, Administrator.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-brand-primary text-white rounded-lg shadow-glow-primary hover:bg-brand-secondary transition-colors">
            Add Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={`$${REVENUE_DATA.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}`}
          trend={trend.percent + "%"}
          isUp={trend.isUp}
          delay={0}
        />
        <KPICard
          title="Active Orders"
          value="1,245"
          trend="+12%"
          isUp={true}
          delay={0.1}
        />
        <KPICard
          title="New Customers"
          value="321"
          trend="+5.4%"
          isUp={true}
          delay={0.2}
        />
        <KPICard
          title="Avg. Order Value"
          value="$142"
          trend="-2.1%"
          isUp={false}
          delay={0.3}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart (Main) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
          onMouseEnter={() => {
            setEmotion('focused', 2000);
            setLookAtTarget({ x: window.innerWidth * 0.3, y: window.innerHeight * 0.5 }); // Rough center of chart
          }}
          onMouseLeave={() => {
            setEmotion('idle');
            setLookAtTarget(null);
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Revenue Analysis</h2>
            <select
              className="bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-3 py-1 text-sm font-medium outline-none cursor-pointer"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="6M">Last 6 Months</option>
              <option value="1Y">Last Year</option>
            </select>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} onMouseMove={handleChartHover}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `$${value}`} />
                <ChartTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
          onMouseEnter={() => {
            setEmotion('thinking', 2000);
            setLookAtTarget({ x: window.innerWidth * 0.8, y: window.innerHeight * 0.5 });
          }}
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Sales by Category</h2>
          <div className="h-[300px] w-full flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  itemStyle={{ color: '#1e293b' }}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
              <span className="block text-2xl font-bold text-slate-800 dark:text-white">1.2K</span>
              <span className="text-xs text-slate-500">Sales</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const KPICard = ({ title, value, trend, isUp, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-default group"
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
      <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
        {isUp ? '↑' : '↓'} {trend}
      </span>
    </div>
    <div className="flex items-baseline gap-2">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">{value}</h2>
    </div>
  </motion.div>
);

export default Dashboard;
