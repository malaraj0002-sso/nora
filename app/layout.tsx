import type { ReactNode } from 'react';

/**
 * Root layout — locale routes set their own <html>/<body> in [locale]/layout.
 * Studio already has an isolated studio/layout. Future app/dashboard/layout
 * must do the same (own html/body; no Header, Footer, SiteProvider, or
 * marketing globals). Keep this passthrough so isolated roots work.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
} 
