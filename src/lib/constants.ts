export const APP_CONFIG = {
  name: 'AiRafa Leads Dashboard',
  description: 'Futuristic real-time leads dashboard for AI clinic consultants',
  version: '1.0.0',
  refreshInterval: 10000, // 10 seconds
  cacheTimeout: 30000, // 30 seconds
} as const;

export const COLORS = {
  primary: '#6366F1', // Indigo
  secondary: '#8B5CF6', // Purple
  accent: '#06B6D4', // Cyan
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#EF4444', // Red
} as const;

export const BACKGROUNDS = {
  main: '#0F172A', // Slate 900
  secondary: '#1E293B', // Slate 800
  card: 'rgba(30, 41, 59, 0.5)',
} as const;

export const TREATMENTS: Record<string, { name: string; icon: string; color: string }> = {
  'botox': { name: 'Botox', icon: 'Syringe', color: 'from-pink-500 to-rose-500' },
  'filler': { name: 'Dermal Fillers', icon: 'Droplets', color: 'from-blue-500 to-cyan-500' },
  'laser': { name: 'Laser Treatment', icon: 'Zap', color: 'from-yellow-500 to-orange-500' },
  'facial': { name: 'Facial Treatment', icon: 'Sparkles', color: 'from-purple-500 to-pink-500' },
  'hair': { name: 'Hair Treatment', icon: 'Scissors', color: 'from-green-500 to-emerald-500' },
  'body': { name: 'Body Contouring', icon: 'Activity', color: 'from-indigo-500 to-purple-500' },
  'other': { name: 'Other', icon: 'Plus', color: 'from-gray-500 to-slate-500' },
};

export const STATUS_COLORS: Record<string, string> = {
  'New': 'from-cyan-500 to-blue-500',
  'Contacted': 'from-blue-500 to-indigo-500',
  'Booked': 'from-purple-500 to-pink-500',
  'Converted': 'from-emerald-500 to-green-500',
  'Not Interested': 'from-gray-500 to-slate-500',
};

export const ANIMATIONS = {
  shimmer: {
    keyframes: {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' },
    },
    animation: 'shimmer 2s infinite linear',
  },
  float: {
    keyframes: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    animation: 'float 3s ease-in-out infinite',
  },
  glow: {
    keyframes: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    animation: 'glow 2s ease-in-out infinite',
  },
} as const;

export const GLASSMORPHISM_CLASSES = {
  card: 'bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 shadow-xl shadow-indigo-500/10',
  button: 'bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 hover:bg-slate-700/50',
  input: 'bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 focus:border-indigo-500/50',
  modal: 'bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-indigo-500/20',
} as const;

export const GRADIENTS = {
  primary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
  secondary: 'bg-gradient-to-br from-cyan-400 to-blue-500',
  success: 'bg-gradient-to-tr from-emerald-400 to-teal-500',
  warning: 'bg-gradient-to-r from-amber-400 to-orange-500',
  danger: 'bg-gradient-to-r from-red-500 to-pink-500',
} as const;
