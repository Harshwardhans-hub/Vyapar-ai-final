import { motion } from 'framer-motion';

export function CardSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-2/3 bg-white/5 rounded" />
          <div className="h-5 w-10 bg-white/5 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-white/5 rounded-full" />
          <div className="h-4 w-20 bg-white/5 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/5 rounded" />
          <div className="h-3 w-4/5 bg-white/5 rounded" />
        </div>
        <div className="flex gap-1.5 mt-3">
          <div className="h-5 w-12 bg-white/5 rounded-full" />
          <div className="h-5 w-14 bg-white/5 rounded-full" />
          <div className="h-5 w-10 bg-white/5 rounded-full" />
        </div>
        <div className="mt-3 p-3 rounded-xl bg-white/[0.02]">
          <div className="h-3 w-full bg-white/5 rounded" />
          <div className="h-3 w-3/4 bg-white/5 rounded mt-1" />
        </div>
      </div>
    </div>
  );
}

export function BundleSkeleton() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-1/2 bg-white/5 rounded" />
          <div className="h-3 w-1/3 bg-white/5 rounded" />
        </div>
      </div>
      <div className="h-3 w-2/3 bg-white/5 rounded mb-4" />
      <div className="space-y-2 mb-4">
        <div className="h-3 w-3/4 bg-white/5 rounded" />
        <div className="h-3 w-1/2 bg-white/5 rounded" />
      </div>
      <div className="flex justify-between pt-4 border-t border-white/5">
        <div className="h-6 w-16 bg-white/5 rounded" />
        <div className="h-8 w-24 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="w-4 h-4 rounded bg-white/5" />
      </div>
      <div className="h-7 w-16 bg-white/5 rounded mb-1" />
      <div className="h-3 w-20 bg-white/5 rounded" />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex gap-2">
      <div className="w-7 h-7 rounded-full bg-white/5 shrink-0" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3 w-3/4 bg-white/5 rounded" />
        <div className="h-3 w-1/2 bg-white/5 rounded" />
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* AI response skeleton */}
      <div className="glass-card p-6 animate-pulse">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-20 bg-white/5 rounded" />
            <div className="h-3 w-full bg-white/5 rounded" />
            <div className="h-3 w-4/5 bg-white/5 rounded" />
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </motion.div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto animate-pulse space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5" />
          <div className="space-y-1.5">
            <div className="h-6 w-48 bg-white/5 rounded" />
            <div className="h-3 w-32 bg-white/5 rounded" />
          </div>
        </div>
        <div className="glass-card p-6 space-y-4">
          <div className="h-10 w-full bg-white/5 rounded-xl" />
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 flex-1 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
