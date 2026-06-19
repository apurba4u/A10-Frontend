"use client";

export default function ErrorBoundary({ error, reset }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-6">
        <span className="text-4xl">!</span>
      </div>
      <h2 className="mt-6 font-serif text-2xl font-bold text-foreground">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
