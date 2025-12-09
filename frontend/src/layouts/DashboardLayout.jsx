import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

/**
 * DashboardLayout
 * 
 * The main shell for the application after login.
 * Includes Navbar, Premium Background, and Container logic.
 */
const DashboardLayout = ({ children, className = '' }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-x-hidden selection:bg-brand-primary/30">

            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] dark:bg-brand-primary/5 animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] dark:bg-brand-secondary/5 animate-float-slow" />
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05]" />
            </div>

            <Navbar />

            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-28 min-h-screen ${className}`}
            >
                {children}
            </motion.main>
        </div>
    );
};

export default DashboardLayout;
