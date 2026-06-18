"use client";

export default function ErrorBoundary({ error, reset }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-semibold text-slate-900">
        Something went wrong
      </h2>
      <p className="mt-2 text-slate-500">
        {error?.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
