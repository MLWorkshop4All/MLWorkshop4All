
// React
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';

// MUI
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/components/theme';


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "MLWorkshop4All Platform",
    description: "Welcome to the MLWorkshop4All platform!",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AppRouterCacheProvider>
                    {/* <ThemeProvider theme={theme}> */}
                        {children}
                    {/* </ThemeProvider> */}
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}


