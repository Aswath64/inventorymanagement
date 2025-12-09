import { motion } from 'framer-motion';
import Boxy from '../components/Mascot/Boxy';

/**
 * MascotAuthLayout
 * 
 * Split screen layout for authentication pages.
 * Desktop: Left = Mascot, Right = Form
 * Mobile: Top = Mascot Banner, Bottom = Form
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The form content
 * @param {string} props.title - Use as aria-label or accessible title
 * @param {'idle' | 'thinking' | 'shy' | 'success' | 'error'} props.emotion - Current emotion of Boxy
 */
const MascotAuthLayout = ({ children, title, emotion = 'idle' }) => {
    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-900 overflow-hidden">

            {/* Left Column: Mascot Area (Desktop) / Top Banner (Mobile) */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="
          relative w-full lg:w-1/2 
          h-[35vh] lg:h-screen 
          bg-gradient-to-br from-brand-primary/10 via-surface-muted to-brand-secondary/10 
          dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
          flex items-center justify-center
          overflow-hidden
        "
            >
                {/* Background Decorations */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-primary/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay animate-pulse-slow" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay animate-float-slow" />
                </div>

                {/* Mascot Container */}
                <div className="relative z-10 w-full max-w-md p-8 flex items-center justify-center">
                    <Boxy emotion={emotion} className="w-48 h-48 lg:w-96 lg:h-96" />
                </div>
            </motion.div>

            {/* Right Column: Form Area */}
            <main
                className="
          w-full lg:w-1/2 
          flex flex-col items-center justify-center 
          p-6 lg:p-12 
          bg-surface dark:bg-slate-900
          relative
        "
                aria-label={title}
            >
                <div className="w-full max-w-md space-y-8">
                    {children}
                </div>

                {/* Footer/Legal (Optional) */}
                <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Inventory360. All rights reserved.</p>
                </div>
            </main>
        </div>
    );
};

export default MascotAuthLayout;
