import { Link, useLocation } from "wouter";

export function LandingAuthLinks() {
  const [location] = useLocation();
  if (location !== "/") return null;
  return <div className="fixed right-5 top-[88px] z-50 flex gap-2 sm:right-8"><Link href="/portal" className="rounded-full border border-teal-700 bg-white px-4 py-2 text-xs font-bold text-teal-800 shadow-sm">Login</Link><Link href="/registration" className="rounded-full bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-sm">Register</Link></div>;
}
