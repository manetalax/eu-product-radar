import './globals.css';
import './dashboard-polish.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'EU Product Radar',
  description: 'Detecta campos documentales incompletos, prioriza revisiones y genera informes para catálogos de producto en Europa.'
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
