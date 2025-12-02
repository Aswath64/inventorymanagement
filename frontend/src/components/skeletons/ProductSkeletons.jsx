export const ProductCardSkeleton = () => (
  <div className="gradient-border block rounded-3xl bg-white/80 dark:bg-slate-900/80">
    <div className="h-48 w-full rounded-t-3xl bg-slate-200/70 animate-pulse" />
    <div className="space-y-2 p-4">
      <div className="h-3 w-24 rounded-full bg-slate-200/80 animate-pulse" />
      <div className="h-4 w-32 rounded-full bg-slate-200/80 animate-pulse" />
      <div className="h-5 w-20 rounded-full bg-slate-200/80 animate-pulse" />
    </div>
  </div>
);

export const ProductDetailsSkeleton = () => (
  <div className="space-y-10 p-6">
    <div className="grid gap-8 md:grid-cols-2">
      <div className="h-96 w-full rounded-3xl bg-slate-200/70 animate-pulse" />
      <div className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-xl">
        <div className="h-6 w-40 rounded-full bg-slate-200/80 animate-pulse" />
        <div className="h-8 w-32 rounded-full bg-slate-200/80 animate-pulse" />
        <div className="h-16 w-full rounded-2xl bg-slate-200/60 animate-pulse" />
        <div className="h-4 w-24 rounded-full bg-slate-200/80 animate-pulse" />
      </div>
    </div>
  </div>
);


