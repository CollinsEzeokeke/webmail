import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./stores/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-secondary": "var(--gradient-secondary)",
        "gradient-hero": "var(--gradient-hero)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-glow": "var(--gradient-glow)",
        "gradient-mesh": "var(--gradient-mesh)",
      },
      backdropBlur: {
        glass: "16px",
      },
      boxShadow: {
        sm:      "0 1px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)",
        DEFAULT: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.05)",
        md:      "0 4px 16px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.05)",
        lg:      "0 8px 24px rgba(0,0,0,0.08), 0 3px 8px rgba(0,0,0,0.05)",
        xl:      "0 16px 40px rgba(0,0,0,0.09), 0 6px 16px rgba(0,0,0,0.06)",
        "2xl":   "0 24px 56px rgba(0,0,0,0.10), 0 8px 20px rgba(0,0,0,0.07)",
        glow:    "var(--shadow-glow)",
        elegant: "var(--shadow-elegant)",
        glass:   "var(--shadow-glass)",
        float:   "var(--shadow-float)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInFromLeft: {
          "0%": { opacity: "0", transform: "translateX(-50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInFromRight: {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        iconFloat: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-2px) scale(1.02)" },
        },
        logoFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        logoGlow: {
          "0%, 100%": { filter: "drop-shadow(0 0 20px hsl(158 64% 52% / 0.4))" },
          "50%": { filter: "drop-shadow(0 0 40px hsl(158 64% 52% / 0.7))" },
        },
        ringPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.3" },
          "50%": { transform: "scale(1.08)", opacity: "0.15" },
        },
        logoPulseColor: {
          "0%, 100%": { color: "hsl(158 64% 52%)" },
          "50%": { color: "#ffffff" },
        },
        auroraShift1: {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)", opacity: "0.6" },
          "33%": { transform: "translate(8%, -12%) scale(1.15)", opacity: "0.8" },
          "66%": { transform: "translate(-6%, 8%) scale(0.9)", opacity: "0.5" },
        },
        auroraShift2: {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1.1)", opacity: "0.5" },
          "33%": { transform: "translate(-10%, 6%) scale(0.95)", opacity: "0.7" },
          "66%": { transform: "translate(12%, -8%) scale(1.2)", opacity: "0.4" },
        },
        auroraShift3: {
          "0%, 100%": { transform: "translate(0%, 0%) scale(0.9)", opacity: "0.4" },
          "50%": { transform: "translate(5%, 10%) scale(1.1)", opacity: "0.6" },
        },
        gentleGlow: {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.25" },
        },
        gridShimmer: {
          "0%, 100%": { opacity: "0.05" },
          "50%": { opacity: "0.15" },
        },
        shieldPulseSubtle: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.01)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        particlePulsate: {
          "0%, 100%": { opacity: "0", transform: "scale(0.8)" },
          "50%": { opacity: "0.7", transform: "scale(1.2)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        fadeInUp: "fadeInUp 0.8s ease-out",
        slideInFromLeft: "slideInFromLeft 0.8s ease-out",
        slideInFromRight: "slideInFromRight 0.8s ease-out",
        iconFloat: "iconFloat 6s ease-in-out infinite",
        logoFloat: "logoFloat 6s ease-in-out infinite",
        logoGlow: "logoGlow 4s ease-in-out infinite",
        ringPulse: "ringPulse 3s ease-in-out infinite",
        logoPulseColor: "logoPulseColor 3s ease-in-out infinite",
        auroraShift1: "auroraShift1 22s ease-in-out infinite",
        auroraShift2: "auroraShift2 28s ease-in-out infinite",
        auroraShift3: "auroraShift3 34s ease-in-out infinite",
        gentleGlow: "gentleGlow 8s ease-in-out infinite",
        gridShimmer: "gridShimmer 4s ease-in-out infinite",
        shieldPulseSubtle: "shieldPulseSubtle 4s ease-in-out infinite",
        countUp: "countUp 0.6s ease-out forwards",
        particlePulsate: "particlePulsate 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
