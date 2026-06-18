import Link from "next/link";
import { BookOpen, Search, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Discover & share
          <span className="text-indigo-600"> original ebooks</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-slate-600">
          Fable is a community-driven platform where writers publish and readers
          discover unique ebooks. Read, bookmark, and support your favorite
          authors.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/ebooks"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Search className="h-4 w-4" />
            Browse Ebooks
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
          >
            Start Writing
          </Link>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Why Fable?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <h3 className="mt-4 text-lg font-semibold">Discover</h3>
              <p className="mt-2 text-sm text-slate-600">
                Browse a curated collection of original ebooks across every genre.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              <h3 className="mt-4 text-lg font-semibold">Publish</h3>
              <p className="mt-2 text-sm text-slate-600">
                Writers can publish their work and reach readers directly.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <Search className="h-8 w-8 text-indigo-600" />
              <h3 className="mt-4 text-lg font-semibold">Support</h3>
              <p className="mt-2 text-sm text-slate-600">
                Purchase ebooks and support the authors you love.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
