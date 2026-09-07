import { useEffect, useState } from "react";
import { Link } from "wouter";

type S = { id: string; title: string; submissionType: string; scope?: string; status: string; reviewerNotes?: string | null; createdAt: string };
const STATUS_LABEL: Record<string, string> = { submitted: "Submitted", under_review: "Under Review", revision: "Revision Required", published: "Published", received: "Received", accepted: "Accepted", rejected: "Rejected" };

export default function MyPapersPage() {
  const [token] = useState(() => localStorage.getItem("buich_token") || "");
  const [papers, setPapers] = useState<S[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch("/api/submissions/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.submissions) setPapers(d.submissions); else setError(d.error || "Gagal memuat."); })
      .catch(() => setError("Terjadi kesalahan."));
  }, [token]);

  return <main className="min-h-screen bg-slate-50 px-5 py-10"><div className="mx-auto max-w-4xl">
    <Link href="/portal" className="text-sm font-bold text-teal-700">← Portal</Link>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4"><h1 className="text-4xl font-black">Paper Saya</h1><Link href="/submit-paper" className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">+ Submit Paper</Link></div>
    {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="mt-6 grid gap-4">
      {papers.length === 0 && <div className="rounded-3xl bg-white p-10 text-center"><p className="text-slate-500">Belum ada paper.</p><Link href="/submit-paper" className="mt-4 inline-block font-bold text-teal-700">Submit paper pertama Anda →</Link></div>}
      {papers.map(p => <div key={p.id} className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-black">{p.title}</h3><p className="mt-1 text-xs text-slate-500">{p.submissionType} · {p.scope || "—"} · {new Date(p.createdAt).toLocaleDateString()}</p></div><span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${p.status === "published" ? "bg-green-100 text-green-700" : p.status === "revision" ? "bg-orange-100 text-orange-700" : p.status === "under_review" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{STATUS_LABEL[p.status] || p.status}</span></div>{p.reviewerNotes && <p className="mt-3 rounded-xl bg-yellow-50 p-3 text-xs text-yellow-800"><strong>Catatan Reviewer:</strong> {p.reviewerNotes}</p>}</div>)}
    </div>
  </div></main>;
}
