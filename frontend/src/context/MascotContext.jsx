import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import soundManager from '../utils/soundUtils';

const MascotContext = createContext();

export const useMascot = () => {
    const context = useContext(MascotContext);
    if (!context) {
        throw new Error('useMascot must be used within a MascotProvider');
    }
    return context;
};

// Initial State Constants
const INITIAL_SETTINGS = {
    soundEnabled: true,
    volume: 0.5,
    reduceMotion: false,
    isHidden: false
};

const INITIAL_GAMIFICATION = {
    xp: 0,
    level: 1,
    dailyXp: 0,
    lastXpDate: new Date().toISOString().split('T')[0]
};

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 3000, 5000]; // Explicit levels

export const MascotProvider = ({ children }) => {
    // --- State: Identity & Behavior ---
    const [emotion, setEmotionState] = useState('idle');
    const [mode, setMode] = useState('wander'); // 'wander' | 'focused' | 'dragged' | 'sleep' | 'hidden'
    const [tooltip, setTooltip] = useState(null);
    const [lookAtTarget, setLookAtTarget] = useState(null); // { x, y } for eyes to follow

    // --- State: Persistence (Settings & Gamification) ---
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('boxy_settings');
        return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    });

    const [gamification, setGamification] = useState(() => {
        const saved = localStorage.getItem('boxy_gamification');
        return saved ? JSON.parse(saved) : INITIAL_GAMIFICATION;
    });

    // --- Refs for Throttling & Logic ---
    const emotionTimeoutRef = useRef(null);
    const tooltipTimeoutRef = useRef(null);
    const lastEmotionTime = useRef(0);

    // --- Persistence Effects ---
    useEffect(() => {
        localStorage.setItem('boxy_settings', JSON.stringify(settings));
        soundManager.updateSettings(settings);
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('boxy_gamification', JSON.stringify(gamification));
    }, [gamification]);

    // --- Actions ---

    // 1. Emotion Handling with Throttling & Auto-Reset
    const setEmotion = useCallback((newEmotion, duration = 3000, force = false) => {
        const now = Date.now();
        // Prevent rapid flickering unless forced (e.g. immediate interaction)
        if (!force && now - lastEmotionTime.current < 500 && newEmotion !== 'idle') {
            return;
        }

        setEmotionState(newEmotion);
        lastEmotionTime.current = now;

        // Clear existing reset timer
        if (emotionTimeoutRef.current) clearTimeout(emotionTimeoutRef.current);

        // Auto-reset to idle for temporary emotions
        if (['success', 'error', 'shy', 'thinking', 'surprised'].includes(newEmotion)) {
            emotionTimeoutRef.current = setTimeout(() => {
                setEmotionState('idle');
            }, duration);
        }
    }, []);

    // 2. Settings Management
    const updateSettings = useCallback((updates) => {
        setSettings(prev => ({ ...prev, ...updates }));
    }, []);

    const toggleSound = useCallback(() => {
        updateSettings({ soundEnabled: !settings.soundEnabled });
    }, [settings.soundEnabled, updateSettings]);

    // 3. Gamification Logic
    const addXp = useCallback((amount) => {
        setGamification(prev => {
            const today = new Date().toISOString().split('T')[0];
            let newDailyXp = prev.dailyXp;

            // Reset daily cap if new day
            if (prev.lastXpDate !== today) {
                newDailyXp = 0;
            }

            // Daily Cap limit (e.g., 500 XP per day)
            if (newDailyXp >= 500) return { ...prev, lastXpDate: today };

            const finalAmount = Math.min(amount, 500 - newDailyXp);
            if (finalAmount <= 0) return { ...prev, lastXpDate: today };

            const nextXp = prev.xp + finalAmount;
            const nextDailyXp = newDailyXp + finalAmount;

            // Check Level Up
            const nextLevel = LEVEL_THRESHOLDS.findIndex(t => nextXp < t);
            const currentLevel = prev.level;
            const calculatedLevel = nextLevel === -1 ? LEVEL_THRESHOLDS.length : nextLevel;

            if (calculatedLevel > currentLevel) {
                setEmotion('success', 5000, true);
                setTooltip(`Level Up! You are now Level ${calculatedLevel} 🎉`);
            }

            return {
                xp: nextXp,
                level: calculatedLevel,
                dailyXp: nextDailyXp,
                lastXpDate: today
            };
        });
    }, [setEmotion]);

    // 4. Tooltip System
    const showTooltip = useCallback((text, duration = 4000) => {
        setTooltip(text);
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        if (duration > 0) {
            tooltipTimeoutRef.current = setTimeout(() => setTooltip(null), duration);
        }
    }, []);

    const value = {
        // State
        emotion,
        mode,
        settings,
        gamification,
        tooltip,
        lookAtTarget,

        // Actions
        setEmotion,
        setMode,
        updateSettings,
        toggleSound,
        addXp,
        showTooltip,
        setLookAtTarget
    };

    return <MascotContext.Provider value={value}>{children}</MascotContext.Provider>;
};
