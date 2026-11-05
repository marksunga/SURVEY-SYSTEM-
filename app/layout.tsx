import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IT Department Feedback and Survey System',
  description: 'Enterprise web-based survey management, encrypted feedback, and reporting portal for the IT Department.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}

