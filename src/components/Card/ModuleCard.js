
// React
import React from 'react';

// MUI
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';



export default function ModuleCard({ title, description, link, ...sx }) {
    return (
        <Card sx={{ minWidth: 300, margin: 2, ...sx }}>
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Module
                </Typography>
                <Typography variant="h5" component="div">
                    {title}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Overview
                </Typography>
                <Typography variant="body2">
                    {description}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button variant="contained" size="small" href={link}>Start now</Button>
            </CardActions>
        </Card>
    );
};
