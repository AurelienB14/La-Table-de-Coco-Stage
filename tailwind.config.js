/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './partials/*.html', './src/pages/*.html'],
  theme: {
    extend: {
      colors: {
        bg: '#E8E2D0',
        surface: '#DED5BC',
        ink: '#2E2B1F',
        accent: {
          DEFAULT: '#C9A15D',
          100: '#FBF3E4',
          200: '#F3E2C0',
          300: '#E8CD97',
          400: '#DBB878',
          500: '#C9A15D',
          600: '#A9813F',
          700: '#866430',
          800: '#5F4722',
          900: '#3D2D16',
        },
        olive: {
          DEFAULT: '#6E6F49',
          100: '#F1F1E7',
          200: '#DEDFC9',
          300: '#C4C6A2',
          400: '#A9AB80',
          500: '#8A8B5C',
          600: '#6E6F49',
          700: '#5C5D3B',
          800: '#45462C',
          900: '#2F301E',
        },
        stone: {
          100: '#FAF7F0',
          200: '#F0EBDD',
          300: '#E0D9C4',
          400: '#C7BEA0',
          500: '#A8A184',
          600: '#86806A',
          700: '#66614F',
          800: '#48453A',
          900: '#302E26',
        },
      },
      fontFamily: {
        heading: ["'Playfair Display'", 'serif'],
        body: ["'Figtree'", 'sans-serif'],
      },
      borderRadius: {
        md: '16px',
        lg: '28px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(46,43,31,0.14)',
        md: '0 3px 10px rgba(46,43,31,0.16)',
        lg: '0 12px 32px rgba(46,43,31,0.22)',
      },
    },
  },
  plugins: [],
};
