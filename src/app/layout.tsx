import type { ReactNode } from "react";

// Root layout delegates html/body to [locale]/layout.tsx so locale and dir
// can be set dynamically per request.
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html><body>{children}</body></html>;
}
