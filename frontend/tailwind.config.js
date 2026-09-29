/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#1D4ED8', light: '#3B82F6', dark: '#1E40AF', dim: '#DBEAFE' },
        sidebar:   { bg: '#0F172A', hover: '#1E293B', active: '#2563EB', text: '#94A3B8', 'text-active': '#F8FAFC' },
        surface:   { DEFAULT: '#FFFFFF', '2': '#F8FAFC', '3': '#F1F5F9' },
        success:   { DEFAULT: '#059669', dim: '#D1FAE5' },
        warning:   { DEFAULT: '#D97706', dim: '#FEF3C7' },
        danger:    { DEFAULT: '#DC2626', dim: '#FEE2E2' },
        info:      { DEFAULT: '#0284C7', dim: '#E0F2FE' },
        border:    '#E2E8F0',
        muted:     '#94A3B8',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        'card': '0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)',
        'card-hover': '0 4px 6px -1px rgba(15,23,42,.10), 0 2px 4px -2px rgba(15,23,42,.06)',
        'modal': '0 20px 25px -5px rgba(15,23,42,.15), 0 8px 10px -6px rgba(15,23,42,.08)',
      },
    },
  },
  plugins: [],
};
