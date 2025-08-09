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
      <nav className="space-x-6 text-sm font-medium">
        <a href="/" className="hover:underline">Home</a>
        <a href="/projects/" className="hover:underline">Projects</a>
        <a href="/blog/" className="hover:underline">Blog</a>
        <a href="/about/" className="hover:underline">About</a>
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
