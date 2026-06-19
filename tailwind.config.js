/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Tokens semânticos mapeados para as CSS vars do index.css ──
        // Uso: bg-background, text-foreground, border-border, etc.
        background:  'var(--background)',
        foreground:  'var(--foreground)',

        card:        'var(--card)',
        'card-fg':   'var(--card-foreground)',

        primary: {
          DEFAULT: 'var(--primary)',
          fg:      'var(--primary-foreground)',
          hover:   '#2A527A',          // primary 15% mais claro
          subtle:  '#EEF3F8',          // primary 5% opacidade sobre branco
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          fg:      'var(--secondary-foreground)',
          subtle:  '#EEF3F8',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          fg:      'var(--accent-foreground)',
          subtle:  '#FDF6EE',          // accent 5% opacidade sobre branco
          dark:    '#8C6A30',          // texto sobre fundo accent-subtle
        },

        muted: {
          DEFAULT: 'var(--muted)',
          fg:      'var(--muted-foreground)',
        },

        border:  'var(--border)',
        input:   'var(--input-background)',
        ring:    'var(--ring)',

        destructive: {
          DEFAULT: 'var(--destructive)',
          fg:      'var(--destructive-foreground)',
        },

        // ── Gráficos ──────────────────────────────────────────────────
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
      },

      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
}
