import LayoutWrapper from '../components/LayoutWrapper';
import './globals.css';

export const metadata = {
  title: 'CRM Lead Tracker',
  description: 'A responsive and user-friendly CRM for leads tracking',
};

import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
