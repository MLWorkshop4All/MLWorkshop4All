// theme.js

'use client';

// React
import { Roboto } from 'next/font/google';

// MUI
import { createTheme } from '@mui/material/styles';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // light mode palette
                background: {
                    default: '#ffffff',
                },
            }
            : {
                // dark mode palette
                background: {
                    default: '#121212',
                },
            }),
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
});

const createAppTheme = (mode) => createTheme(getDesignTokens(mode));

export default createAppTheme;
