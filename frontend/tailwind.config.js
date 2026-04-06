export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Green ramp (primary brand — from template --g vars)
        g50:  '#f2f9f0',
        g100: '#d6efd0',
        g200: '#a8d99c',
        g300: '#72bf62',
        g400: '#4a9e3a',
        g500: '#357a27',
        g600: '#235718',
        g700: '#14360d',

        // Yellow/Gold ramp (accent — from template --y vars)
        y100: '#fef3c7',
        y200: '#fde480',
        y300: '#f9c932',
        y500: '#b37f00',
        y600: '#7a5200',

        // Earthy tones
        br:   '#8c5e2a',   // brown — used for secondary text, farm names
        soil: '#3d2b1f',   // dark brown — primary text
        cream:'#faf7f2',   // app background

        // Page background
        page: '#e8e0d8',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],        // headings — matches template brand/section titles
        body:    ['system-ui', 'sans-serif'], // body text — matches template default
      },
      borderRadius: {
        DEFAULT: '8px',
        sm:  '6px',
        md:  '10px',
        lg:  '12px',
        xl:  '20px',
        full:'9999px',
      },
      fontSize: {
        '10': '10px',
        '11': '11px',
        '12': '12px',
        '13': '13px',
        '14': '14px',
        '17': '17px',
        '19': '19px',
      },
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,0.08)',
        browser: '0 8px 32px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
}