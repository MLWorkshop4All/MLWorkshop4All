// Appbar.js 

// React
import * as React from 'react';

// MUI
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

// MUI: Icons
import MenuIcon from '@mui/icons-material/Menu';

// Theme Context
import { useThemeContext } from '@/components/ThemeContext';

const AppBarComponent = ({ handleDrawerToggle }) => {
    const theme = useTheme();
    const { toggleTheme, mode } = useThemeContext();

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: theme.zIndex.drawer + 1,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerToggle}
                    edge="start"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    MLWorkshop4All
                </Typography>
                <Switch checked={mode === 'dark'} onChange={toggleTheme} />
            </Toolbar>
        </AppBar>
    );
};

export default AppBarComponent;
