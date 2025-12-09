/**
 * Premium Skeleton Loader
 * Uses shimmer effect on glass panels.
 */
const Skeleton = ({ className = '', height, width, variant = 'text' }) => {

    // Base classes for glass shimmer
    const baseClasses = "relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-lg";
    const shimmerClasses = "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent dark:after:via-white/5";

    // Variant specifics
    const variants = {
        text: "h-4 w-3/4 rounded-md",
        circle: "rounded-full h-12 w-12",
        card: "rounded-2xl h-64 w-full",
        button: "h-10 w-32 rounded-xl"
    };

    const style = {
        height: height,
        width: width,
    };

    return (
        <div
            className={`${baseClasses} ${shimmerClasses} ${variants[variant] || ''} ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
};

export default Skeleton;
