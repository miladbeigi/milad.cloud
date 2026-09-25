import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Milad Beigi",
  description: "Personal website",
  metadataBase: new URL("https://milad.cloud"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <div className="mx-auto max-w-5xl px-6">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between py-6">
      <nav className="flex justify-center space-x-6 text-sm font-medium">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/projects/" className="hover:underline">Projects</Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="py-12">
      <p className="text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Milad Beigi · Built with Next.js & Tailwind.
      </p>
    </footer>
  );
}
