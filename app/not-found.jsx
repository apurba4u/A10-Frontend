export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-primary/10 p-6">
        <span className="text-6xl font-bold text-primary">404</span>
      </div>
      <h2 className="mt-6 font-serif text-2xl font-bold text-foreground">
        Page Not Found
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Return Home
      </a>
    </div>
  );
}
