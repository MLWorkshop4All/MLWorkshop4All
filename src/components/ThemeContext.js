// ThemeContext.js

import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createAppTheme from './theme';

const ThemeContext = createContext();

export const ThemeProviderWrapper = ({ children }) => {
    const [mode, setMode] = useState('light');

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => createAppTheme(mode), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => useContext(ThemeContext);
