import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] bg-[#f4faf8] px-6 py-20 text-[#082c3a]">
      <div className="mx-auto max-w-2xl rounded-lg border border-[#cfe5df] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#117865]">
          TRI-P Tech
        </p>
        <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-[#4f6a72]">
          The page you are looking for may have moved or is no longer available.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#117865] px-5 text-sm font-bold text-white transition hover:bg-[#0d6757]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
