import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import soundManager from '../utils/soundUtils';

/**
 * Sound Toggle Component
 * 
 * Allows users to enable/disable sound effects
 */
export default function SoundToggle({ className = '' }) {
  const [enabled, setEnabled] = useState(soundManager.isEnabled());

  useEffect(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem('soundEnabled');
    if (saved !== null) {
      const isEnabled = saved === 'true';
      if (!isEnabled && soundManager.isEnabled()) {
        soundManager.toggle();
      }
      setEnabled(isEnabled);
    }
  }, []);

  const handleToggle = () => {
    const newState = soundManager.toggle();
    setEnabled(newState);
    localStorage.setItem('soundEnabled', newState.toString());
    
    // Play a test sound if enabling
    if (newState) {
      setTimeout(() => soundManager.playClick(), 100);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
        enabled
          ? 'bg-cartoon-blue-500 border-cartoon-blue-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
      } ${className}`}
      aria-label={enabled ? 'Disable sound' : 'Enable sound'}
      title={enabled ? 'Sound On' : 'Sound Off'}
    >
      {enabled ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
          <path d="M3.707 3.293a1 1 0 00-1.414 1.414l12 12a1 1 0 001.414-1.414l-12-12z" />
        </svg>
      )}
    </motion.button>
  );
}


