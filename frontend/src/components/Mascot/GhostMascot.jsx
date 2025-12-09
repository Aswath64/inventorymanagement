import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const GhostMascot = ({ emotion = 'idle', className = '' }) => {
    // Variants for the main ghost body
    const bodyVariants = {
        idle: {
            y: [0, -15, 0],
            rotate: [0, 2, -2, 0],
            transition: {
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
        },
        thinking: {
            y: [0, -5, 0],
            rotate: [0, 360],
            scale: [1, 1.1, 1],
            transition: {
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }
        },
        shy: {
            y: 10,
            scale: 0.9,
            rotate: 5,
            transition: { duration: 0.5 }
        },
        error: {
            x: [-5, 5, -5, 5, 0],
            rotate: [-5, 5, -5, 5, 0],
            backgroundColor: '#EF4444', // Red-500
            transition: { duration: 0.4 }
        },
        success: {
            y: [0, -40, 0],
            rotate: [0, -10, 10, 0],
            scale: [1, 1.2, 1],
            backgroundColor: '#10B981', // Emerald-500
            transition: { duration: 0.6, repeat: 2 }
        },
        sleep: {
            y: 15,
            rotate: 10,
            scale: 0.95,
            opacity: 0.8,
            transition: { duration: 1 }
        },
        surprised: {
            y: -20,
            scale: 1.1,
            rotate: 0,
            transition: { type: 'spring', stiffness: 400, damping: 10 }
        }
    };

    // Eye variants
    const eyeVariants = {
        idle: { scaleY: 1 },
        thinking: { scaleY: [1, 0.1, 1], transition: { repeat: Infinity, duration: 1.5 } }, // Blinking rapidly
        shy: { scaleY: 0.5, y: 5 }, // Looking down
        error: { rotate: 20, scaleY: 0.8 }, // Angry brows effect
        success: { scaleY: 0.5, scaleX: 1.2 }, // Happy squint
        sleep: { scaleY: 0.1, scaleX: 1.2 }, // Closed
        surprised: { scale: 1.5, scaleY: 1.2 } // Wide open
    };

    // Hand variants
    const leftHandVariants = {
        idle: { x: -30, y: 10 },
        shy: { x: -10, y: -35, rotate: -20 },
        error: { x: -40, y: 0, rotate: -45 },
        success: { x: -40, y: -30, rotate: -90 },
        thinking: { x: -25, y: 25 },
        sleep: { x: -15, y: 30, rotate: -10 }, // Dropped
        surprised: { x: -45, y: -10, rotate: -45 }
    };

    const rightHandVariants = {
        idle: { x: 30, y: 10 },
        shy: { x: 10, y: -35, rotate: 20 },
        error: { x: 40, y: 0, rotate: 45 },
        success: { x: 40, y: -30, rotate: 90 },
        thinking: { x: 25, y: -15, rotate: -45 },
        sleep: { x: 15, y: 30, rotate: 10 },
        surprised: { x: 45, y: -10, rotate: 45 }
    };

    return (
        <div className={`relative w-32 h-32 flex items-center justify-center ${className}`}>
            {/* Ghost Body */}
            <motion.div
                variants={bodyVariants}
                animate={emotion}
                className="relative w-24 h-28 bg-white dark:bg-slate-100 rounded-t-full shadow-[0_0_40px_rgba(255,255,255,0.4)] flex flex-col items-center justify-center z-10"
                style={{
                    borderBottomLeftRadius: '10px',
                    borderBottomRightRadius: '10px',
                }}
            >
                {/* Tail / Bottom Wiggles (CSS Clip Path or simple rounded bottoms) */}
                <div className="absolute -bottom-4 w-full flex justify-between">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="w-8 h-8 bg-white dark:bg-slate-100 rounded-full -mt-4" />
                    ))}
                </div>

                {/* Face Container */}
                <div className="relative w-full h-full">
                    {/* Eyes */}
                    <div className="absolute top-8 left-0 right-0 flex justify-center gap-4">
                        <motion.div variants={eyeVariants} animate={emotion} className="w-3 h-3 bg-slate-800 rounded-full" />
                        <motion.div variants={eyeVariants} animate={emotion} className="w-3 h-3 bg-slate-800 rounded-full" />
                    </div>

                    {/* Mouth */}
                    <motion.div
                        className="absolute top-14 left-1/2 -translate-x-1/2 w-4 h-2 bg-pink-100 rounded-full opacity-50"
                        animate={{
                            scale: emotion === 'success' ? 2 : 1,
                            height: emotion === 'thinking' ? 4 : 8,
                            opacity: emotion === 'shy' ? 0.2 : 0.5
                        }}
                    />

                    {/* Hands */}
                    <motion.div
                        variants={leftHandVariants}
                        animate={emotion}
                        className="absolute top-1/2 left-1/2 w-6 h-6 bg-white dark:bg-slate-100 rounded-full shadow-sm"
                    />
                    <motion.div
                        variants={rightHandVariants}
                        animate={emotion}
                        className="absolute top-1/2 left-1/2 w-6 h-6 bg-white dark:bg-slate-100 rounded-full shadow-sm"
                    />
                </div>
            </motion.div>

            {/* Shadow */}
            <motion.div
                animate={{
                    scale: emotion === 'success' ? [1, 0.5, 1] : [1, 0.9, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-[-20px] w-16 h-4 bg-black/20 rounded-[100%] blur-sm"
            />
        </div>
    );
};

export default GhostMascot;
