import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";

type User = { id: string; fullName: string; email: string; role: string };
type Registration = { id: string; registrationCode: string; fullName: string; email: string; status: string; paymentStatus: string; feeAmount?: number; currency?: string; paymentProofName?: string | null };

async function api<T>(url: string, init: RequestInit = {}) {
  const response = await fetch(url, init);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(`Server error (${response.status}): ${text.slice(0, 100)}`);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Terjadi kesalahan.");
  return body as T;
}
function authHeaders(token: string) { return { Authorization: `Bearer ${token}` }; }
const input = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600";

export default function ParticipantPortal() {
  const [token, setToken] = useState(() => localStorage.getItem("buich_token") || "");
  const [user, setUser] = useState<User | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [mode, setMode] = useState<"login" | "register">(() => new URLSearchParams(window.location.search).get("mode") === "register" ? "register" : "login");
  const [credentials, setCredentials] = useState({ fullName: "", email: "", password: "" });
  const [proof, setProof] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (current = token) => {
    if (!current) return;
    const headers = authHeaders(current);
    const [me, mine] = await Promise.all([
      api<{ user: User }>("/api/auth/me", { headers }),
      api<{ registration: Registration | null }>("/api/registrations/me", { headers })
    ]);
    setUser(me.user); setRegistration(mine.registration);
  };
  useEffect(() => { void load().catch(() => { localStorage.removeItem("buich_token"); setToken(""); }); }, []);

  const authenticate = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const result = await api<{ token: string; user: User }>(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials) });
      localStorage.setItem("buich_token", result.token); setToken(result.token); setUser(result.user); await load(result.token);
    } catch (e) { setError(e instanceof Error ? e.message : "Tidak dapat masuk."); } finally { setBusy(false); }
  };

  const uploadProof = async (event: FormEvent) => {
    event.preventDefault(); if (!proof) return; setBusy(true); setError("");
    try {
      const upload = await api<{ uploadURL: string; objectPath: string }>("/api/storage/payment-proofs/request-url", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ name: proof.name, size: proof.size, contentType: proof.type }) });
      await fetch(upload.uploadURL, { method: "PUT", headers: { "Content-Type": proof.type }, body: proof });
      const result = await api<{ registration: Registration; message: string }>("/api/registrations/payment-proof", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ paymentReference: "Manual-Transfer", paymentProofName: proof.name, paymentProofPath: upload.objectPath }) });
      setRegistration(result.registration); setMessage(result.message); setProof(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Unggah gagal."); } finally { setBusy(false); }
  };

  const logout = () => { localStorage.removeItem("buich_token"); window.location.href = "/"; };

  if (!token || !user) return <main className="min-h-screen bg-slate-50 px-5 py-16"><div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm"><Link href="/" className="text-sm font-bold text-teal-700">← Kembali ke BUICH</Link><p className="mt-8 text-xs font-bold uppercase tracking-widest text-teal-700">BUICH participant portal</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">{mode === "login" ? "Masuk" : "Buat akun"}</h1><p className="mt-3 text-sm leading-6 text-slate-600">{mode === "login" ? "Masuk untuk melanjutkan pendaftaran dan memantau pembayaran." : "Buat akun terlebih dahulu, lalu lengkapi pendaftaran BUICH."}</p><form className="mt-7 grid gap-4" onSubmit={authenticate}>{mode === "register" && <label className="text-sm font-semibold">Nama lengkap<input required className={input} value={credentials.fullName} onChange={e => setCredentials({ ...credentials, fullName: e.target.value })} /></label>}<label className="text-sm font-semibold">Email<input required type="email" className={input} value={credentials.email} onChange={e => setCredentials({ ...credentials, email: e.target.value })} /></label><label className="text-sm font-semibold">Password<input required minLength={10} type="password" className={input} value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar akun"}</button></form><button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="mt-5 text-sm font-semibold text-teal-700">{mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}</button></div></main>;

  return <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900"><div className="mx-auto max-w-4xl"><header className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/" className="text-sm font-bold text-teal-700">← Kembali ke BUICH</Link><h1 className="mt-2 text-4xl font-black">Portal Peserta</h1><p className="mt-1 text-sm text-slate-600">Halo, {user.fullName}</p></div><div className="flex gap-3">{user.role === "admin" && <Link href="/admin" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Dashboard admin</Link>}<button onClick={logout} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold">Keluar</button></div></header>{message && <p className="mt-7 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}{error && <p className="mt-7 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!registration ? <section className="mt-8 rounded-3xl bg-white p-7 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Langkah 1 dari 3</p><h2 className="mt-2 text-3xl font-black">Form pendaftaran BUICH</h2><p className="mt-3 text-sm leading-6 text-slate-600">Isi formulir lengkap untuk mendapatkan kode unik dan total biaya.</p><Link href="/registration" className="mt-6 inline-block bg-teal-700 text-white px-6 py-3 rounded-xl font-bold">Buka Form Pendaftaran</Link></section> : <section className="mt-8 grid gap-6 lg:grid-cols-2"><div className="rounded-3xl bg-slate-900 p-7 text-white"><p className="text-xs font-bold uppercase tracking-widest text-teal-300">Kode verifikasi peserta</p><p className="mt-2 text-3xl font-black">{registration.registrationCode}</p><div className="mt-6 grid grid-cols-2 gap-4 text-sm"><div><p className="text-slate-400">Status</p><p className="font-bold">{registration.status}</p></div><div><p className="text-slate-400">Pembayaran</p><p className="font-bold">{registration.paymentStatus}</p></div></div></div>{registration.paymentStatus === "unpaid" && <form onSubmit={uploadProof} className="rounded-3xl bg-white p-7 shadow-sm"><h3 className="text-xl font-black">Upload Bukti Bayar</h3><p className="mt-2 text-sm text-slate-600">Total: {registration.feeAmount ? (registration.feeAmount / 1000).toLocaleString() + "k" : "Hubungi Admin"} {registration.currency}</p><input type="file" accept="image/*,application/pdf" className="mt-4 w-full" onChange={e => setProof(e.target.files?.[0] || null)} required /><button disabled={busy} className="mt-6 w-full rounded-xl bg-teal-700 py-3 font-bold text-white">{busy ? "Uploading..." : "Upload & Verifikasi"}</button></form>}</section>}</div></main>;
}