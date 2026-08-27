import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'EU Product Radar',
  description: 'Compliance intelligence para catálogos de producto en Europa.'
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
