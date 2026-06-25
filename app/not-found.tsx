import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white/10 mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-3">Page not found</h2>
        <p className="text-white/50 text-sm mb-6 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-white text-black px-6 py-2.5 text-sm font-medium transition-colors hover:bg-white/90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
