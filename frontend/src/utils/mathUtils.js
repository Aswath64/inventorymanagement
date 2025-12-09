/**
 * Simple 1D Noise Generator (Pseudo-Perlin)
 * Used for organic random movement
 */
export const createNoise1D = () => {
    const perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;

    // Shuffle
    for (let i = 255; i > 0; i--) {
        const n = Math.floor(Math.random() * (i + 1));
        [p[i], p[n]] = [p[n], p[i]];
    }

    // Duplicate for wrapping
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (t, a, b) => a + t * (b - a);

    const grad = (hash, x) => {
        const h = hash & 15;
        const grad = 1 + (h & 7); // Gradient value 1-8
        return (h & 8 ? -grad : grad) * x; // Randomly invert
    };

    return (x) => {
        const X = Math.floor(x) & 255;
        x -= Math.floor(x);
        const u = fade(x);
        return lerp(u, grad(perm[X], x), grad(perm[X + 1], x - 1)) * 0.5 + 0.5;
    };
};

export const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
