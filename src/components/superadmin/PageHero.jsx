import React from 'react';
import { motion } from 'framer-motion';

/**
 * Branded gradient page header for the Superadmin panel.
 * Keeps every superadmin page visually consistent.
 *
 * @param {React.ComponentType} [icon]   - react-icons component shown in the badge
 * @param {string} title
 * @param {string} [subtitle]
 * @param {React.ReactNode} [children]    - action area (buttons), rendered on the right.
 *                                          Use white / translucent styles for contrast.
 */
export default function PageHero({ icon: Icon, title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-secondary to-secondary-dark p-7 md:p-8 shadow-lg"
    >
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute -top-12 -right-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/10 border border-white/20 items-center justify-center backdrop-blur-sm shrink-0">
              <Icon className="text-white" size={26} />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-white/70 font-medium">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-2.5 flex-wrap">{children}</div>}
      </div>
    </motion.div>
  );
}

/** White solid CTA that reads on the gradient. */
export function HeroButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-secondary text-sm font-bold shadow-lg hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

/** Translucent (ghost) secondary action that reads on the gradient. */
export function HeroGhostButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/25 text-sm font-bold backdrop-blur-sm hover:bg-white/20 active:scale-[0.98] transition-all disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
