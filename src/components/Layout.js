// Layout.js

"use client";

// React
import * as React from 'react';

// MUI
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import AppBarComponent from './Appbar/Appbar';
import DrawerComponent from './Drawer/Drawer';

// Theme Context
import { ThemeProviderWrapper, useThemeContext } from '@/components/ThemeContext';

// Global Variables
const drawerWidth = 240;
const drawerWidthClosed = 100;

const MainLayoutContent = ({ children, menuItems }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = React.useState(false); // React.useState(!isMobile);

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: "100vh", }}>
            <CssBaseline />

            {/* Appbar */}
            <AppBarComponent handleDrawerToggle={handleDrawerToggle} />

            {/* Main Content */}
            <Box component="main"
                sx={{
                    marginTop: 6,
                    flexGrow: 1,
                    p: 3,
                    width: {
                        xs: "100%",
                        md: `calc(100% - ${drawerWidth}px)`,
                    },
                    transition: (theme) =>
                        theme.transitions.create("margin", {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                    ...(open && {
                        ml: {
                            xs: 0,
                            md: `${drawerWidth}px`,
                        },
                        transition: (theme) =>
                            theme.transitions.create("margin", {
                                easing: theme.transitions.easing.easeOut,
                                duration:
                                    theme.transitions.duration.enteringScreen,
                            }),
                    }),
                }}
            >

                {/* Drawer */}
                <DrawerComponent open={open} handleDrawerToggle={handleDrawerToggle} menuItems={menuItems} />

                <Box>
                    {children}
                </Box>
            </Box>
        
        </Box>
    );
};

// Export MainLayout
export default function MainLayout({ children, menuItems }) {
    return (
        <ThemeProviderWrapper>
            <MainLayoutContent menuItems={menuItems}>
                {children}
            </MainLayoutContent>
        </ThemeProviderWrapper>
    );
}
