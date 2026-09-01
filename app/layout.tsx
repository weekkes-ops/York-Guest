import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'The York Guest House | Boutique Stays, Inventory & Direct Booking',
  description: 'Book luxury rooms in York with real-time multi-platform inventory sync, zero double-booking guarantee, secure checkout, and local attraction guide. Support: (088) 557740.',
  openGraph: {
    title: 'The York Guest House | Boutique Stays & Booking Engine',
    description: 'Book luxury rooms in York with real-time inventory sync, integrated payments, and local attraction guide. Support: (088) 557740.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The York Guest House | Boutique Stays & Booking Engine',
    description: 'Book luxury rooms in York with real-time inventory sync and local guide. Support: (088) 557740.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
