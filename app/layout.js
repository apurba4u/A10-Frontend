import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "../components/Providers";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Fable – Ebook Sharing Platform",
  description: "Discover & read original ebooks.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
        </Providers>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
