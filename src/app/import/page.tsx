import Link from "next/link";
export default function Import() {
  return <main className="mx-auto max-w-5xl px-4 py-8">
    <h1 className="text-2xl font-semibold">Issuer-managed holdings</h1>
    <p className="mt-3">This site now uses scheduled issuer downloads instead of a shared upload database. Add holdings links to config/sources.json in the repository.</p>
    <Link href="/sources" className="mt-4 block underline">View data updates →</Link>
  </main>;
}
