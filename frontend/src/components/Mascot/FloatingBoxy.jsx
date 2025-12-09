import { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { useMascot } from '../../context/MascotContext';
import GhostMascot from './GhostMascot';
import soundManager from '../../utils/soundUtils';
import { createNoise1D, lerp, clamp } from '../../utils/mathUtils';

/**
 * FloatingBoxy - Physics-Driven Mascot
 * 
 * Features:
 * - Organic random wandering using Noise
 * - Soft boundary repulsion (stays on screen)
 * - Depth illusion (scale based on Y position)
 * - Drag & Drop with physics resume
 * - Sound & Emotion reaction
 */
const FloatingBoxy = () => {
    const {
        emotion,
        setMode,
        mode,
        tooltip,
        settings,
        lookAtTarget
    } = useMascot();

    const [isDragging, setIsDragging] = useState(false);

    // Physics State (Refs for performance)
    const pos = useRef({ x: window.innerWidth - 150, y: window.innerHeight - 200 });
    const velocity = useRef({ x: 0, y: 0 });
    const time = useRef(Math.random() * 100);

    // Noise Generators
    const noiseX = useRef(createNoise1D());
    const noiseY = useRef(createNoise1D());

    // Motion Values for Framer
    const x = useMotionValue(pos.current.x);
    const y = useMotionValue(pos.current.y);
    const scale = useSpring(1, { stiffness: 300, damping: 20 });

    // Controls
    const controls = useAnimation();
    const bounds = useRef({ w: window.innerWidth, h: window.innerHeight });

    // --- Window Resize Handler ---
    useEffect(() => {
        const handleResize = () => {
            bounds.current = { w: window.innerWidth, h: window.innerHeight };
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- Physics Loop ---
    useEffect(() => {
        let animationFrameId;

        const loop = () => {
            if (isDragging || settings.reduceMotion || mode === 'sleep') {
                animationFrameId = requestAnimationFrame(loop);
                return;
            }

            // 1. Advance Time
            time.current += 0.005; // Speed of wandering

            // 2. Calculate Noise Force (Organic Drift)
            const nX = (noiseX.current(time.current) - 0.5) * 2; // -1 to 1
            const nY = (noiseY.current(time.current + 100) - 0.5) * 2;

            // 3. Apply Forces
            let ax = nX * 0.2; // Acceleration
            let ay = nY * 0.2;

            // 4. Boundary Repulsion (Soft Walls)
            const margin = 100;
            const repulsionStrength = 0.5;

            if (pos.current.x < margin) ax += repulsionStrength;
            if (pos.current.x > bounds.current.w - margin) ax -= repulsionStrength;
            if (pos.current.y < margin) ay += repulsionStrength;
            if (pos.current.y > bounds.current.h - margin) ay -= repulsionStrength;

            // 5. Update Velocity & Position
            velocity.current.x += ax;
            velocity.current.y += ay;

            // Damping (Friction)
            velocity.current.x *= 0.95;
            velocity.current.y *= 0.95;

            pos.current.x += velocity.current.x;
            pos.current.y += velocity.current.y;

            // Hard Clamp (Failsafe)
            pos.current.x = clamp(pos.current.x, 0, bounds.current.w - 100);
            pos.current.y = clamp(pos.current.y, 0, bounds.current.h - 100);

            // 6. Update Visuals
            x.set(pos.current.x);
            y.set(pos.current.y);

            // Depth Effect: Scale slightly smaller near top of screen (farther away)
            const depthScale = lerp(0.85, 1.1, pos.current.y / bounds.current.h);
            scale.set(depthScale);

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isDragging, settings.reduceMotion, mode, x, y, scale]);

    // --- Interaction Handlers ---
    const handleDragStart = () => {
        setIsDragging(true);
        setMode('dragged');
        soundManager.playClick();
        scale.set(1.1); // Pop up
    };

    const handleDragEnd = (_, info) => {
        setIsDragging(false);
        setMode('wander');
        soundManager.playClick(); // Drop sound

        // Update physics pos to match drop location
        pos.current.x = x.get();
        pos.current.y = y.get();

        // Add throw momentum
        velocity.current.x = info.velocity.x * 0.05;
        velocity.current.y = info.velocity.y * 0.05;
    };

    if (settings.isHidden) return null;

    return (
        <motion.div
            drag
            dragMomentum={false} // We handle momentum manually if needed, or let Framer do it, but we want to seamless resume.
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ x, y, scale, touchAction: 'none' }}
            className="fixed top-0 left-0 z-[9999] group pointer-events-auto"
            initial={false}
        >
            {/* Tooltip Bubble */}
            {tooltip && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: -0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-sm font-bold whitespace-nowrap border border-slate-100 dark:border-slate-700 z-50 pointer-events-none"
                >
                    {tooltip}
                    {/* Speech Bubble Arrow */}
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 rotate-45 border-b border-r border-slate-100 dark:border-slate-700" />
                </motion.div>
            )}

            {/* Mascot Visual */}
            <div className="w-32 h-32 md:w-40 md:h-40 cursor-grab active:cursor-grabbing">
                <GhostMascot emotion={emotion} className="w-full h-full drop-shadow-2xl" />
            </div>

            {/* Quick Actions Overlay (Visible on Hover) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
                <button
                    onClick={(e) => { e.stopPropagation(); useMascot().toggleSound(); }}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
                    title={settings.soundEnabled ? "Mute" : "Unmute"}
                >
                    {settings.soundEnabled ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    )}
                </button>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
                <button
                    onClick={(e) => { e.stopPropagation(); useMascot().updateSettings({ isHidden: true }); }}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-red-500 transition-colors"
                    title="Hide Mascot"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </motion.div>
        </motion.div>
    );
};

export default FloatingBoxy;
