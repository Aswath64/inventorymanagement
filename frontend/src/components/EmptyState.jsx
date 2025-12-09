import { motion } from 'framer-motion';
import Boxy from './Mascot/Boxy';

/**
 * EmptyState
 * 
 * Displays a friendly message when no data is available.
 * Integrates the Mascot for added personality.
 */
const EmptyState = ({
  title = "No data found",
  description = "There's nothing here yet.",
  action,
  emotion = "thinking"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/20 dark:bg-slate-800/20"
    >
      <div className="mb-6 w-32 h-32 flex items-center justify-center">
        <Boxy emotion={emotion} className="w-24 h-24" />
      </div>

      <h3 className="text-xl font-heading font-bold text-slate-800 dark:text-slate-100 mb-2">
        {title}
      </h3>

      <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-6 mx-auto leading-relaxed">
        {description}
      </p>

      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
