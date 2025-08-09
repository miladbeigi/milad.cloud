import "./globals.css";

export const metadata = {
  title: "Milad Beigi",
  description: "Computer Engineer",
  metadataBase: new URL("https://milad.beigi.example"),
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
      <a href="/" className="text-sm font-semibold tracking-wide hover:underline">Home</a>
      <nav className="space-x-6 text-sm font-medium">
        <a className="hover:underline" href="/projects/">Projects</a>
        <a className="hover:underline" href="/blog/">Blog</a>
        <a className="hover:underline" href="/about/">About</a>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="py-12">
      <p className="text-center text-sm text-gray-500">
        © 2025 Milad Beigi · Built with Next.js & Tailwind.
      </p>
    </footer>
  );
}
