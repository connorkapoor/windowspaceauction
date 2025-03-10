import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Window Space Auction',
  description: 'Bid on this prime window real estate!',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="preload" 
          href="https://db.onlinewebfonts.com/t/7cc6719bd5f0310be3150ba33418e72e.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="preload" 
          href="https://db.onlinewebfonts.com/t/7cc6719bd5f0310be3150ba33418e72e.woff" 
          as="font" 
          type="font/woff" 
          crossOrigin="anonymous" 
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
} 