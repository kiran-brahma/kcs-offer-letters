import './globals.css';
import Link from 'next/link';
import LogoImg from './LogoImg';
import { COMPANY } from '@/lib/company';

export const metadata = {
  title: 'Appointment Letter Generator — Knighthood Corporate Services',
  description: 'Bulk appointment letter generation. Runs entirely in the browser.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="topbar">
            <LogoImg />
            <div>
              <h1>{COMPANY.name}</h1>
              <p>Appointment Letter Generator</p>
            </div>
            <nav>
              <Link className="btn ghost sm" href="/">Generate</Link>
              <Link className="btn ghost sm" href="/verify">Verify</Link>
            </nav>
          </header>
          {children}
          <p className="footnote">
            All processing happens in your browser. No employee data leaves this device.
          </p>
        </div>
      </body>
    </html>
  );
}
