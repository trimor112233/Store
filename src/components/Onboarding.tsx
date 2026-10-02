import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollege } from '../context/CollegeContext';
import { CollegeId } from '../types';
import { ArrowRight, Sparkles, GraduationCap, Check } from 'lucide-react';

export default function Onboarding() {
  const { completeOnboarding, allColleges } = useCollege();
  const [selectedCollegeId, setSelectedCollegeId] = useState<CollegeId | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = (id: CollegeId) => {
    setSelectedCollegeId(id);
    setIsTransitioning(true);

    setTimeout(() => {
      completeOnboarding(id);
    }, 1600);
  };

  const selectedCollege = allColleges.find((c) => c.id === selectedCollegeId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors duration-300">
      {/* Subtle background ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full z-10">
        <AnimatePresence mode="wait">
          {isTransitioning && selectedCollege ? (
            <motion.div
              key="confirmed-step"
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="text-center py-16 px-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-4xl"
              >
                {selectedCollege.icon}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3"
              >
                Great choice!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-zinc-600 dark:text-zinc-400 font-medium max-w-md mx-auto mb-6"
              >
                Let's get you what you need for <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{selectedCollege.name}</span>.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Personalizing store catalog...
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="selection-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Top Branding */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-4 shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Egyptian Universities Official Student Store</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                  Welcome to Student Hub 👋
                </h1>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                  Choose your college to personalize your tools, curated kits, and campus recommendations.
                </p>
              </div>

              {/* College Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-6">
                {allColleges.map((col, idx) => {
                  const isSelected = selectedCollegeId === col.id;
                  return (
                    <motion.button
                      key={col.id}
                      type="button"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * idx, duration: 0.25 }}
                      whileHover={{ scale: 1.015, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(col.id)}
                      className={`relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-500 shadow-md ring-1 ring-blue-500'
                          : 'border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800/90 flex items-center justify-center text-2xl shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                        {col.icon || '🎓'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                            {col.name}
                          </h3>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {col.categories?.slice(0, 2).join(' · ') || col.description || 'Verified Campus Hub'}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Direct Skip Option */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => completeOnboarding('other')}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 inline-flex items-center gap-1.5 transition-colors py-2 px-3 rounded-lg"
                >
                  <span>Skip for now and explore all products</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
