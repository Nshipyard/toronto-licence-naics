import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { LangProvider } from "@/i18n";

export const metadata: Metadata = {
  metadataBase: new URL("https://licences.canada.nshipyard.com"),
  title: "Toronto Licence NAICS: every business licence, mapped to its industry",
  description:
    "Toronto's 37,469 active business licences joined to NAICS 2022 industry codes. Searchable explorer, sector analysis by ward, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
  openGraph: {
    title: "Toronto Licence NAICS: every business licence, mapped to its industry",
    description:
      "Toronto's 37,469 active business licences joined to NAICS 2022 industry codes. Searchable explorer, sector analysis by ward, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
    url: "https://licences.canada.nshipyard.com",
    siteName: "Toronto Licence NAICS",
    images: [{ url: "/og-image.png", width: 1200, height: 750, alt: "Toronto Licence NAICS — business licences mapped to industry" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toronto Licence NAICS: every business licence, mapped to its industry",
    description:
      "Toronto's 37,469 active business licences joined to NAICS 2022 industry codes. Searchable explorer, sector analysis by ward, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      "/favicon.ico",
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
