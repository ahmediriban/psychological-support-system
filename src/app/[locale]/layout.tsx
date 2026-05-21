import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { routing } from "../../i18n/routing";
import "../../app/globals.css";
import { Provider } from "../../components/ui/provider";
import { fonts } from "../../components/ui/fonts";
import QueryClientProvider from "../../components/ui/queryClient";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";
  
  return (
    <html lang={locale} dir={dir}>
      <body className={dir === "rtl" ? fonts.tajawal.className : fonts.inter.className}>
      <QueryClientProvider>
        <NextIntlClientProvider messages={messages}>
          <Provider locale={locale}>{children}</Provider>
        </NextIntlClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
