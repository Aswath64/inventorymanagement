import { motion } from 'framer-motion';
import boxyIdle from '../../assets/mascot/boxy_idle.png';

/**
 * Boxy Mascot Component
 * 
 * @param {Object} props
 * @param {'idle' | 'thinking' | 'shy' | 'success' | 'error'} props.emotion - The emotional state of Boxy
 * @param {string} props.className - Additional classes
 */
const Boxy = ({ emotion = 'idle', className = '' }) => {
    // Animation variants based on emotion
    const variants = {
        idle: {
            y: [0, -10, 0],
            rotate: [0, 1, -1, 0],
            scale: 1,
            transition: {
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }
        },
        thinking: {
            y: 0,
            rotate: -5,
            scale: 1,
            filter: "brightness(1.1)",
            transition: { duration: 0.5 }
        },
        shy: {
            y: 5,
            rotate: 5,
            scale: 0.95,
            opacity: 0.9,
            transition: { duration: 0.4 }
        },
        success: {
            y: -15,
            scale: 1.1,
            rotate: [-5, 5, -5, 0],
            filter: "brightness(1.2) sepia(0.2) hue-rotate(-50deg)", // Gold/Greenish tint hack until assets exist
            transition: {
                y: { duration: 0.5, type: "spring" },
                rotate: { duration: 0.5 }
            }
        },
        error: {
            x: [-5, 5, -5, 5, 0],
            rotate: 0,
            filter: "grayscale(0.5) brightness(0.9)",
            transition: { duration: 0.4 }
        }
    };

    return (
        <div className={`relative ${className}`} aria-hidden="true">
            {/* Aura/Glow Effect */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.1, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full"
            />

            {/* Main Character */}
            <motion.img
                src={boxyIdle}
                alt=""
                variants={variants}
                animate={emotion}
                className="relative z-10 w-full h-auto drop-shadow-2xl"
                style={{
                    maxHeight: '400px',
                    objectFit: 'contain'
                }}
            />

            {/* Shadow anchor */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 blur-lg rounded-full" />
        </div>
    );
};

export default Boxy;
