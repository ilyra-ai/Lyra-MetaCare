import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      colors: {

        'lyra-teal': '#26A69A',
        'warm-coral': '#F06543',


        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',


          foreground: 'hsl(var(--success-foreground))',

          light: 'hsl(var(--success-light))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',


          foreground: 'hsl(var(--warning-foreground))',

          light: 'hsl(var(--warning-light))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',


          foreground: 'hsl(var(--info-foreground))',

          light: 'hsl(var(--info-light))',
        },
        cosmic: {
          DEFAULT: 'hsl(var(--cosmic))',


          foreground: 'hsl(var(--cosmic-foreground))',

          light: 'hsl(var(--cosmic-light))',
        },
        golden: {
          DEFAULT: 'hsl(var(--golden))',

          light: 'hsl(var(--golden-light))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

          foreground: 'hsl(var(--golden-foreground))',
          light: 'hsl(var(--golden-light))',
        },

        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {

        '2xl': 'var(--radius-2xl)',
        xl: 'var(--radius-xl)',
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius-sm)',

        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glass: 'var(--shadow-glass)',
        teal: 'var(--shadow-teal)',
        coral: 'var(--shadow-coral)',
        cosmic: 'var(--shadow-cosmic)',
      },
      backgroundImage: {
        'gradient-teal': 'var(--gradient-teal)',
        'gradient-coral': 'var(--gradient-coral)',
        'gradient-cosmic': 'var(--gradient-cosmic)',
        'gradient-aurora': 'var(--gradient-aurora)',
        'gradient-surface': 'var(--gradient-surface)',
        'gradient-hero': 'var(--gradient-hero)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
      },
      maxWidth: {
        '8xl': '1440px',

      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },


        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translate3d(0, 12px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translate3d(0, -12px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-left': {
          from: { transform: 'translate3d(-100%, 0, 0)' },
          to: { transform: 'translate3d(0, 0, 0)' },
        },
        'slide-in-right': {
          from: { transform: 'translate3d(100%, 0, 0)' },
          to: { transform: 'translate3d(0, 0, 0)' },

        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -6px, 0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.82', transform: 'scale(1.02)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'aurora-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 rgba(49, 155, 142, 0.12)' },
          '50%': { boxShadow: '0 0 24px rgba(49, 155, 142, 0.24)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.82)' },
          '55%': { opacity: '1', transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'aurora-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(38,166,154,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(38,166,154,0.5)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.24s ease-out',
        'accordion-up': 'accordion-up 0.24s ease-out',
        'fade-in': 'fade-in 300ms ease-out forwards',
        'fade-in-up': 'fade-in-up 400ms ease-out forwards',
        'fade-in-down': 'fade-in-down 400ms ease-out forwards',
        'scale-in': 'scale-in 300ms ease-out forwards',
        'slide-in-left': 'slide-in-left 350ms ease-out forwards',
        'slide-in-right': 'slide-in-right 350ms ease-out forwards',
        float: 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease infinite',

        'fade-in': 'fade-in 300ms ease-out',
        'fade-in-up': 'fade-in-up 400ms ease-out',
        'fade-in-down': 'fade-in-down 400ms ease-out',
        'scale-in': 'scale-in 300ms ease-out',
        'slide-in-left': 'slide-in-left 350ms ease-out',
        'slide-in-right': 'slide-in-right 350ms ease-out',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'spin-slow': 'spin-slow 60s linear infinite',
        'aurora-shift': 'aurora-shift 10s ease infinite',
        'glow-pulse': 'glow-pulse 2s ease infinite',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(21,21,37,0.04)',
        DEFAULT: '0 2px 8px rgba(21,21,37,0.06)',
        md: '0 4px 16px rgba(21,21,37,0.08)',
        lg: '0 8px 32px rgba(21,21,37,0.10)',
        xl: '0 16px 48px rgba(21,21,37,0.12)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',

        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'spin-slow': 'spin-slow 60s linear infinite',
        aurora: 'aurora-shift 10s ease infinite',
        'glow-pulse': 'glow-pulse 2.2s ease infinite',
        'bounce-in': 'bounce-in 500ms cubic-bezier(0.2, 0.7, 0.1, 1) forwards',

      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
