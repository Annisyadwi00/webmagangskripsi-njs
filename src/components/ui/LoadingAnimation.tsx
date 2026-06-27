"use client";

import { motion } from 'framer-motion';

export default function LoadingAnimation({ text = "Memuat Data..." }: { text?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Outer pulsating ring */}
        <motion.div
          className="absolute h-full w-full rounded-full border-4 border-blue-500/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Inner spinning ring */}
        <motion.div
          className="absolute h-16 w-16 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 dark:border-t-blue-400 dark:border-r-blue-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center dot */}
        <motion.div
          className="h-4 w-4 rounded-full bg-blue-600 dark:bg-blue-400"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.p
        className="mt-6 text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {text}
      </motion.p>
    </div>
  );
}
