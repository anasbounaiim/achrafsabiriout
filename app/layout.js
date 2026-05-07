import "./globals.css";

export const metadata = {
  title: "Sabiri Out Petition",
  description: "A supporter-style petition page built with Next.js.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
